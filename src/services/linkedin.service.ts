import puppeteer from 'puppeteer'

import { PuppeteerService } from './puppeteer.service';
import { LinkedinConstants, PLACEHOLDER } from '../constants';
import { SocialMediaPost, SocialMediaPlatform } from '../models/post';

require('dotenv').config();     // enable env variables

export class LinkedinService {

    static EMAIL_SELECTOR = '#username';
    static PASSWORD_SELECTOR = '#password';
    static SUBMIT_SELECTOR = '#app__container > main > div > form > div.login__form_action_container > button';
    static NAV_SELECTOR = "#global-nav";

    public static async getRecentArticles() {   
    }

    public static async getRecentPosts(): Promise<SocialMediaPost[]> {
        // Launch browser
        const browser = await puppeteer.launch();
        let linkedinPosts: LinkedinPost[] = [];
        try {
            let page = await browser.newPage()
            page.setViewport({ width: 1366, height: 3500 });
            let count = 0;
            async function goToLogin(page) {
                await page.goto(LinkedinConstants.LINKEDIN_LOGIN_URL, { waitUntil: 'networkidle2' })
                    .catch(err => {
                        count++;
                        if(count <= 10) {
                            goToLogin(page);
                        } 
                        else {
                            console.log('[WARNING] Failed to navigate to linkedin sign-in');
                        }      
                    });
            }

            await goToLogin(page)
            await page.click(this.EMAIL_SELECTOR)
            await page.keyboard.type(process.env.LINKEDIN_EMAIL);       // enter email
            await page.click(this.PASSWORD_SELECTOR);
            await page.keyboard.type(process.env.LINKEDIN_PASSWORD);    // enter password
            await page.click(this.SUBMIT_SELECTOR);                     // submit form
            await page.waitForSelector(this.NAV_SELECTOR, {visible: true, timeout: 180000});      // wait for redirect to home page
            // Go to articles
            await page.goto(this.getPostsUrl(), { waitUntil: "networkidle2" });    // wait till entire page is loaded

            linkedinPosts = await page.evaluate(() => {
                let feed = document.getElementById('voyager-feed');
                let postDivs = feed.querySelectorAll("div.occludable-update.ember-view");

                let posts = [];
                postDivs.forEach(postDiv => {
                    let post = {
                        title: postDiv.querySelector("div[class*='description-wrapper'] span[dir=ltr]")?.textContent,
                        link: postDiv.querySelector("div > div[data-urn]")?.getAttribute('data-urn')
                    };
                    posts.push(post);
                });
                return posts;
            });
            await browser.close();
        } catch(err) {
            await browser.close();
            throw new Error(err);
        }
        return linkedinPosts.map(post => {
            return {
                title: post.title,
                link: LinkedinConstants.LINKEDIN_FEED_UPDATE_URL + post.link,
                source: SocialMediaPlatform.Linkedin,
                icon: LinkedinConstants.LINKEDIN_ICON
            };
        });
    }

    // Get shares linkedin url
    private static getPostsUrl(): string {
        return LinkedinConstants.LINKEDIN_SHARES_URL.replace(PLACEHOLDER, process.env.LINKEDIN_USERNAME);
    }

    // Get articles linkedin url
    private static getArticlesUrl(): string {
        return LinkedinConstants.LINKEDIN_ARTICLES_URL.replace(PLACEHOLDER, process.env.LINKEDIN_USERNAME);
    }
}

interface LinkedinPost {
    title: string,
    link: string
}