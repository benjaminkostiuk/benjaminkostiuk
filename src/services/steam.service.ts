import axios, { AxiosResponse } from 'axios';
import { SteamConstants } from '../constants';

require('dotenv').config();     // enable env variables

export class SteamService {
    
    public static async getRecentlyPlayedGames(params: GetRecentlyPlayedGamesParams): Promise<GetRecentlyPlayedGamesResponse> {
        const URL = SteamConstants.RECENTLY_PLAYED_URL;
        try {
            let response: AxiosResponse<GetRecentlyPlayedGamesResponse> = await axios.get(URL, {params: params});
            if(response.status == 200) {
                return response.data;
            } else {
                throw new Error(`Failed to GET ${URL} with status code ${response.status}`);
            }
        } catch(error) {
            throw new Error(error);
        }
    }

    public static async getPlayerAchievements(params: GetPlayerAchievementsParams): Promise<GetPlayerAchievementsResponse> {
        const URL = SteamConstants.PLAYER_ACHEIVEMENTS_URL;
        return axios.get(URL, {params: params})
            .then(response => {
                if(response.status == 200) {
                    return response.data;
                } else {
                    throw new Error(`Failed to GET ${URL} with status code ${response.status}`);
                }
            }).catch(err => {
                console.log('error' + err);
                return null;
            });


        try {
            let response: AxiosResponse<GetPlayerAchievementsResponse> = await axios.get(URL, {params: params});
            if(response.status == 200) {
                return response.data;
            } else {
                throw new Error(`Failed to GET ${URL} with status code ${response.status}`);
            }
        } catch(error) {
            console.log(`[WARNING] Failed to get game achievements with ${error}.`);
            console.log('[INFO] Skipping game...');
        }
    }

    public static async getSchemaForGame(params: GetSchemaForGameParams): Promise<GetSchemaForGameResponse> {
        const URL = SteamConstants.GET_SCHEMA_FOR_GAME;
        try {
            let response: AxiosResponse<GetSchemaForGameResponse> = await axios.get(URL, {params: params});
            if(response.status == 200) {
                return response.data;
            } else {
                throw new Error(`Failed to GET ${URL} with status code ${response.status}`);
            }
        } catch(error) {
            throw new Error(error);
        }
    }
}

interface BaseSteamParams {
    key: string,
    format?: 'json' | 'xml',
    count?: number
}

interface GetRecentlyPlayedGamesParams extends BaseSteamParams {
    steamid: string
}

interface GetRecentlyPlayedGamesResponse {
    response: {
        total_count: number,
        games: {
            appid: number,
            name: string,
            playtime_forever?: number
            img_icon_url: string,
            img_logo_url: string
        }[]
    }
}

interface GetPlayerAchievementsParams extends BaseSteamParams {
    appid: number,
    steamid: string
}

interface GetPlayerAchievementsResponse {
    playerstats: {
        steamID?: number,
        gameName?: string,
        achievements?: {
            apiname: string,
            achieved: number,
            unlocktime: number
        }[],
        success: boolean
    }
}


interface GetSchemaForGameParams extends BaseSteamParams {
    appid: number
}

interface GetSchemaForGameResponse {
    game: {
        gameName?: string,
        availableGameStats?: {
            achievements?: {
                name: string,
                defaultvalue: number,
                displayName: string,
                description: string,
                icon: string
            }[]
        }
    }
}