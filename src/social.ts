import fs from 'fs';
import { LinkedinService } from './services/linkedin.service';
import { MediumService } from "./services/medium.service";

// Fetch medium posts from profile and store in assets/data as json
export async function fetchAndStoreMediumPosts(username: string) {
    const mediumPosts = await MediumService.getRecentPosts(username);
    fs.writeFileSync('./assets/data/medium.json', JSON.stringify(mediumPosts));     // Write posts to file
}

// Fetch linkedin shares from linkedin and store in assets/data as json
export async function fetchAndStoreLinkedinShares() {
    const linkedinPosts = await LinkedinService.getRecentPosts();
    fs.writeFileSync('./assets/data/linkedin.json', JSON.stringify(linkedinPosts));    // Write posts to file
}