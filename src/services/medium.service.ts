import puppeteer from 'puppeteer';
import url from 'url';

import { MediumConstants } from '../constants';
import { SocialMediaPost, SocialMediaPlatform } from '../models/post';

require('dotenv').config();     // enable env variables

export class MediumService {

    public static async getRecentPosts(): Promise<SocialMediaPost[]> {
        const url = MediumConstants.MEDIUM_PROFILE_URL + process.env.MEDIUM_USERNAME;
        // Launch browser
        const browser = await puppeteer.launch({
            args: [`--proxy-server=http=${this.randomizeProxy()}`, "--incognito"],
        });
        const page = await browser.newPage();                   // get new page
        await page.setViewport({ width: 1000, height: 926 });   // set height to see new posts
        await page.goto(url, { waitUntil: "networkidle2" });    // wait till entire page is loaded

        // Start grabbing posts
        let mediumPosts: MediumPost[] = await page.evaluate(function() {
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
            let mediumPost: SocialMediaPost = {...post, source: SocialMediaPlatform.Medium};
            return mediumPost;
        });
    }

    /**
     * Return a random proxy ip to use with puppeteer
     */
    private static randomizeProxy(): string {
        const proxies = [
            '161.202.226.194:8123',
            '79.110.52.229:2345',
            '201.149.34.167:8080',
            '35.185.16.35:80',
            '187.243.255.174:8080',
            '37.60.18.242:3128',
            '167.172.109.12:34083',
            '187.45.123.137:36559',
            '185.61.92.207:43947',
            '84.22.137.229:8080',
            '51.15.157.59:3838',
            '198.50.163.192:3129'
        ];
        return proxies[Math.floor(Math.random() * (proxies.length - 1))];
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