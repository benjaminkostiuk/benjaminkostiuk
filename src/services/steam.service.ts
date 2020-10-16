import axios from 'axios';
import { SteamConstants } from '../constants';

export class SteamService {

    // 200 status code
    private static HTTP_OK = 200;

    /**
     * Make a GET api call to a resource
     * @param url Api resource url
     * @param params Api resource params
     */
    private static async callSteamApi(url: string, params: any) {
        let response = await axios.get(url, {params: params});
        if(response.status === this.HTTP_OK) {
            return response.data;
        } else {
            throw new Error(`Failed to GET ${url} with status code ${response.status}.`);
        }
    }
    
    public static async getRecentlyPlayedGames(params: GetRecentlyPlayedGamesParams): Promise<GetRecentlyPlayedGamesResponse> {
        const URL = SteamConstants.RECENTLY_PLAYED_URL;
        try {
            const data = await this.callSteamApi(URL, params);
            return data;
        } catch(error) {
            throw new Error(error);
        }
    }

    public static async getPlayerAchievements(params: GetPlayerAchievementsParams): Promise<GetPlayerAchievementsResponse> {
        const URL = SteamConstants.PLAYER_ACHEIVEMENTS_URL;
        try {
            const data = await this.callSteamApi(URL, params);
            return data;
        } catch(error) {
            throw new Error(error);
        }
    }

    public static async getSchemaForGame(params: GetSchemaForGameParams): Promise<GetSchemaForGameResponse> {
        const URL = SteamConstants.GET_SCHEMA_FOR_GAME;
        try {
            const data = await this.callSteamApi(URL, params);
            return data;
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