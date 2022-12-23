import mustache from "mustache";
import fs from "fs";
import nodeHtmlToImage from "node-html-to-image";

import { MustacheTemplateConstants } from "./constants";
import { Game } from "./models/game";
import { SteamService } from "./services/steam.service";
import config from "./config";

// Get the last three games played with their latest achievement
export async function getGamesList() {
  const recentlyPlayedGames = (
    await SteamService.getRecentlyPlayedGames({
      key: config.steam.key,
      steamid: config.steam.id,
      format: "json",
      count: 3,
    })
  ).response.games;

  // Get the schema for each game's acheivements
  const gameSchemas = await Promise.all(
    recentlyPlayedGames.map((recentlyPlayedGame) =>
      SteamService.getSchemaForGame({
        key: config.steam.key,
        appid: recentlyPlayedGame.appid,
        format: "json",
      }).then((res) => {
        const achievements = res?.game?.availableGameStats?.achievements || [];
        // If the game has achievements, create a mapping of achievements
        return achievements.reduce((map, achievement) => {
          map[achievement.name] = achievement;
          return map;
        }, {});
      })
    )
  );

  // For each game grab the most recently completed acheivement and return them together
  return Promise.all(
    recentlyPlayedGames.map(async ({ appid, name, img_logo_url }, i) => {
      const game: Game = {
        appid: appid,
        name: name,
        img_logo_hash: img_logo_url, // REMOVED FROM STEAM API, currently UNDEFINED
        path: `./assets/images/${name.replace(/[^a-zA-z0-9\s_]/g, "")}.png`,
      };

      try {
        const playerAchievementRes = await SteamService.getPlayerAchievements({
          key: config.steam.key,
          steamid: config.steam.id,
          appid: appid,
          format: "json",
        });
        if (
          playerAchievementRes?.playerstats?.achievements &&
          playerAchievementRes?.playerstats?.achievements.length !== 0
        ) {
          // Filter by achievements that have been acheived and sort by most recent
          const acheivement = playerAchievementRes.playerstats.achievements
            .filter((acheivement) => acheivement.achieved == 1)
            .sort((a, b) => b.unlocktime - a.unlocktime)[0];
          game.achievement = gameSchemas[i][acheivement.apiname];
        }
      } catch (err) {
        console.warn(
          `Failed to get game achievements for game ${name} with ${err}. Skipping game...`
        );
      } finally {
        return game;
      }
    })
  );
}

// Create a Game PNG picture and store it in the assets/images directory
export async function generateGameImg(game: Game) {
  try {
    const data = await fs.promises.readFile(MustacheTemplateConstants.gamePath);
    const imgHtml = mustache.render(data.toString(), game);
    await nodeHtmlToImage({
      puppeteerArgs: {
        args: ["--no-sandbox"],
      },

      output: game.path,
      html: imgHtml,
    });
    console.log(
      `Successfully created game image for ${game.name} at ${game.path}.`
    );
  } catch (err) {
    console.log(
      `Failed to generate game image for game ${game.name} at ${game.path}`
    );
    throw new Error(err);
  }
}
