import mustache from 'mustache';
import fs from 'fs';
import nodeHtmlToImage from 'node-html-to-image';

import { SteamService } from './services/steam.service';
import { Game } from './models/game';
import { ReadmeData } from './models/readme';
import { MustacheTemplateConstants } from './constants';

require('dotenv').config();

async function getGamesList() {
    // Get the last three games played
    const recentlyPlayedGamesRes = await SteamService.getRecentlyPlayedGames({
        key: process.env.STEAM_KEY,
        steamid: process.env.STEAM_ID,
        format: 'json',
        count: 3
    });
     // Get the list of recent games
    const gamesList = recentlyPlayedGamesRes.response.games;   

    // Get the schema for each game's acheivements
    const gameSchemas = await Promise.all(gamesList.map(recentlyPlayedGame => {
        return SteamService.getSchemaForGame({
            key: process.env.STEAM_KEY,
            appid: recentlyPlayedGame.appid,
            format: 'json'
        }).then(res => {
            // Make an achievement mapping to get name and description
            let achievementMap = {};
            // Check if game has achievements
            if(res.game.availableGameStats) {
                // Create achievement mapping
                res.game.availableGameStats.achievements.map(achievement => {
                    achievementMap[achievement.name] = achievement;
                });
            }   
            return achievementMap;
        }).catch(err => {
            throw new Error(err);
        });
    }));
    
    // For each game grab the most recently completed acheivement
    const promises = recentlyPlayedGamesRes.response.games.map((recentlyPlayedGame, i) => {
        const game: Game = {
            appid: recentlyPlayedGame.appid,
            name: recentlyPlayedGame.name,
            img_logo_hash: recentlyPlayedGame.img_logo_url,
            path: `./assets/images/${recentlyPlayedGame.name}.png`
        }
        return SteamService.getPlayerAchievements({
            key: process.env.STEAM_KEY,
            appid: recentlyPlayedGame.appid,
            steamid: process.env.STEAM_ID,
            format: 'json'
        }).then(res => {
            // Check for player achievements
            if(res.playerstats.achievements && res.playerstats.achievements.length !== 0) {
                // Filter by achievements that have been acheived and sort by most recent
                const acheivement = res.playerstats.achievements
                    .filter(acheive => acheive.achieved == 1)
                    .sort((a, b) => b.unlocktime - a.unlocktime)[0]
                // Add to game
                game.achievement = gameSchemas[i][acheivement.apiname];
                return game;
            }
            return game;
        }).catch(err => {
            console.log(err);
            return game;
        });
    });
    // Get game list with achievement
    return Promise.all(promises);
}

async function generateGameImg(game: Game) {
    return fs.promises.readFile(MustacheTemplateConstants.gamePath)
        .then(async data => {
            const imgHtml = mustache.render(data.toString(), game);
            await nodeHtmlToImage({
                output: game.path,
                html: imgHtml
            })
            .then(() => console.log('we good')).catch(err => console.log(err));
        })
        .catch(err => {
            throw new Error(err);
        });
}


async function start() {
    // Get list of games
    const games = await getGamesList();
    // Generate png file for each game
    games.forEach(async game => {
        await generateGameImg(game);
    });

    const DATA: ReadmeData = {
        games: games
    };

    // Replace README.md file by reading from mustache template
    const readmeContent = await fs.promises.readFile(MustacheTemplateConstants.mainPath)
    const content = mustache.render(readmeContent.toString(), DATA);
    
    fs.writeFileSync('README.md', content);
}

start();

