import puppeteer from 'puppeteer';
import url from 'url';

import { MediumConstants } from '../constants';
import { SocialMediaPost, SocialMediaPlatform } from '../models/post';
import { PuppeteerService } from './puppeteer.service';

require('dotenv').config();     // enable env variables

export class MediumService {

    public static async getRecentPosts(): Promise<SocialMediaPost[]> {
        const url = MediumConstants.MEDIUM_PROFILE_URL + process.env.MEDIUM_USERNAME;
        // Launch browser
        const browser = await puppeteer.launch({
            args: [`--proxy-server=http=${PuppeteerService.randomizeProxy()}`, "--incognito"],
        });
        const page = await browser.newPage();                   // get new page
        await page.setViewport({ width: 1000, height: 926 });   // set height to see new posts
        await page.setDefaultNavigationTimeout(240000);              // set a 4 minute timeout
        await page.goto(url, { waitUntil: "networkidle2" });    // wait till entire page is loaded

        // Start grabbing posts
        let mediumPosts: MediumPost[] = await page.evaluate(() => {
            let root = document.getElementById('root');                      // get root element
            let postGroup = root.querySelector('section > div:not(.ab)');    // select grouping with all posts
            let postsDivs = postGroup.querySelectorAll('div.ab.c');              // select all post div
            
            let posts: MediumPost[] = [];
            postsDivs.forEach(post => {
                posts.push({
                    title: post.querySelector('h1')?.textContent,        // get post title
                    subtitle: post.querySelector('h2')?.textContent,     // get post subtitle
                    link: post.querySelector(`div.ab > a[href]`)?.getAttribute('href'),        // get post link
                });
            });
            return posts;
        });
        await browser.close();
        // Clean up links in posts and add source
        return mediumPosts.map(post => {
            if(post.link) post.link = this.formatArticleLink(post.link);
            let mediumPost: SocialMediaPost = {...post, source: SocialMediaPlatform.Medium, icon: MediumConstants.MEDIUM_ICON };
            return mediumPost;
        });
    }

    /**
     * Formats a medium article link
     *  - Adds medium domain
     *  - Removes all query params from article link
     * @param link Link to trim
     */
    private static formatArticleLink(link: string): string {
        return MediumConstants.MEDIUM_DOMAIN + url.parse(link).pathname;
    }
}

interface MediumPost {
    title: string,
    subtitle?: string,
    link: string
};