import mustache from 'mustache';
import fs from 'fs';

import { LinkedinConstants, MediumConstants, MustacheTemplateConstants } from './constants';
import { SocialMediaPost } from './models/post';
import { generateGameImg, getGamesList } from './games';
import { fetchAndStoreMediumPosts } from './social';

require('dotenv').config();

// Regenerate README.md file based on mustache template with data from games & social media
async function reGenerateReadme() {
    
    // Get list of games
    const games = await getGamesList();
    // Generate png file for each game
    games.forEach(async game => {
        await generateGameImg(game);
    });

    try {
        console.log('[INFO] Pulling medium posts...');
        await fetchAndStoreMediumPosts("benkostiuk");
        console.log('[INFO] Successfully pulled medium posts.');
    } catch(err) {
        console.log(`[WARNING] Failed to pull medium posts with error ${err}.`);
        console.log(`[INFO] Falling back to useing reading medium posts...`);
    }

    // Get medium posts
    let mediumPosts: SocialMediaPost[] = [];
    try {
        console.log(`[INFO] Parsing Medium data from ${MediumConstants.MEDIUM_DATA_PATH}...`);
        await fs.promises.readFile(MediumConstants.MEDIUM_DATA_PATH)
            .then(data => {
                mediumPosts = JSON.parse(data.toString());
            });
    } catch(err) {
        console.log(`[WARNING] Could not parse Medium data with ${err}`);
    }
    // // Add profile link and platform
    mediumPosts.forEach(post => {
        post.profileLink = MediumConstants.MEDIUM_PROFILE_URL + process.env.MEDIUM_USERNAME;
        post.platform = 'Medium';
    });

    // Read posts from file
    let linkedinPosts: SocialMediaPost[] = [];
    try {
        console.log(`[INFO] Parsing Linkedin data from ${LinkedinConstants.LINKEDIN_DATA_PATH}...`);
        await fs.promises.readFile(LinkedinConstants.LINKEDIN_DATA_PATH)
            .then(data => {
                linkedinPosts = JSON.parse(data.toString());
            })
    } catch(err) {
        console.log(`[WARNING] Could not parse Linkedin data with ${err}`);
    }
    // Truncate text and add subtitles for shares
    linkedinPosts.forEach(post => {
        if(post.title.length > 80) {
            post.title = post.title.slice(0, 75) + '...';
        }
        post.subtitle = 'Shared a post'
        post.profileLink = LinkedinConstants.LINKEDIN_PROFILE_URL + process.env.LINKEDIN_USERNAME;
        post.platform = 'Linkedin';
    });

    // Trim posts to proper counts
    let totalPosts = mediumPosts.concat(linkedinPosts);
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

reGenerateReadme();

