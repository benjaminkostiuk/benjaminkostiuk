// Import env vars
require('dotenv').config();

export default {
    steam: {
        // Steam identifier
        id: process.env.STEAM_ID,
        // Steam api key
        key: process.env.STEAM_KEY
    },
    github: {
        // Github username
        username: process.env.GHUB_USERNAME,
        
        // Github token with read access to all your repos
        token: process.env.GHUB_TOKEN
    },
    linkedin: {
        // Linkedin username
        username: process.env.LINKEDIN_USERNAME
    },
    medium: {
        // Medium username
        username: process.env.MEDIUM_USERNAME
    }
}