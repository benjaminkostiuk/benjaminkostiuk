import mustache from 'mustache';
import fs, { link } from 'fs';
import nodeHtmlToImage from 'node-html-to-image';

import { SteamService } from './services/steam.service';
import { Game } from './models/game';
import { ReadmeData } from './models/readme';
import { LinkedinConstants, MediumConstants, MustacheTemplateConstants } from './constants';
import { MediumService } from './services/medium.service';
import { LinkedinService } from './services/linkedin.service';
import { SocialMediaPost } from './models/post';

require('dotenv').config();

async function getGamesList() {
    // Get the last three games played
    const recentlyPlayedGamesRes = await SteamService.getRecentlyPlayedGames({
        key: process.env.STEAM_KEY,
        steamid: process.env.STEAM_ID,
        format: 'json',
        count: 3
    }).catch(err => {
        console.log(err);
        return null;
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
            console.log(`[WARNING] Failed to get game achievements for game ${recentlyPlayedGame.name} with ${err}.`);
            console.log('[INFO] Skipping game...');
            return game;
        });
    });
    // Get game list with achievement
    return Promise.all(promises).catch(err => {
        console.log(err);
        return null;
    });
}

async function generateGameImg(game: Game) {
    return fs.promises.readFile(MustacheTemplateConstants.gamePath)
        .then(async data => {
            const imgHtml = mustache.render(data.toString(), game);
            await nodeHtmlToImage({
                output: game.path,
                html: imgHtml
            })
            .then(() => console.log(`Successfully created ${game.path}.`))
            .catch(err => console.log(`Failed to create ${game.path} with ${err}`));
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
        if(!game) return;
        await generateGameImg(game);
    });

    // Get medium posts
    let mediumPosts: SocialMediaPost[] = [];
    try {
        console.log('[INFO] Pulling medium posts...');
        mediumPosts = await MediumService.getRecentPosts();
        console.log('[INFO] Successfully pulled medium posts.');
    } catch(err) {
        console.log(`[WARNING] Failed to pull medium posts with error ${err}.`);
        console.log(`[INFO] Skipping reading medium posts...`);
    }
    // Add profile link and platform
    mediumPosts.forEach(post => {
        post.profileLink = MediumConstants.MEDIUM_PROFILE_URL + process.env.MEDIUM_USERNAME;
        post.platform = 'Medium';
    });

    // Get linkedin posts
    // let linkedinPosts: SocialMediaPost[] = [];
    // try {
    //     console.log('[INFO] Pulling linkedin posts...');
    //     linkedinPosts = await LinkedinService.getRecentPosts();
    //     console.log('[INFO] Successfully pulled linked posts.');
    // } catch(err) {
    //     console.log(`[WARNING] Failed to pull linkedin posts with error ${err}.`);
    //     console.log(`[INFO] Skipping reading linkedin posts...`);
    // }
    // // Truncate text and add subtitles for shares
    // linkedinPosts.forEach(post => {
    //     if(post.title.length > 80) {
    //         post.title = post.title.slice(0, 75) + '...';
    //     }
    //     post.subtitle = 'Shared'
    //     post.profileLink = LinkedinConstants.LINKEDIN_PROFILE_URL + process.env.LINKEDIN_USERNAME;
    //     post.platform = 'Linkedin';
    // });

    let totalPosts = mediumPosts.concat([]);
    if(process.env.POST_COUNT) {
        let num: number = parseInt(process.env.POST_COUNT);
        totalPosts = totalPosts.slice(0, num);
    }
    
    // Replace README.md file by reading from mustache template
    const readmeContent = await fs.promises.readFile(MustacheTemplateConstants.mainPath)
    const content = mustache.render(readmeContent.toString(), {
        games: games,
        datetime: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'short',
            timeZone: 'America/Toronto'
        }),
        posts: totalPosts
    });
    
    fs.writeFileSync('README.md', content);
}

start();

