export class SteamConstants {
    public static readonly RECENTLY_PLAYED_URL = "http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/";
    public static readonly PLAYER_ACHEIVEMENTS_URL = "http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/";
    public static readonly GET_SCHEMA_FOR_GAME = "http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/";
}

export class MediumConstants {
    public static readonly MEDIUM_DOMAIN = "https://medium.com";
    public static readonly MEDIUM_PROFILE_URL = "https://medium.com/@";
    
}

export class MustacheTemplateConstants {
    public static readonly gamePath = "./assets/templates/game.mustache";
    public static readonly mainPath = "./assets/templates/main.mustache";
}