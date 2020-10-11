export class Constants {
    
}

export class SteamConstants {
    public static readonly RECENTLY_PLAYED_URL = "http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/";
    public static readonly PLAYER_ACHEIVEMENTS_URL = "http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/";
    public static readonly GET_SCHEMA_FOR_GAME = "http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/";
}

export class MustacheTemplateConstants {
    public static readonly gamePath = "./assets/templates/game.mustache";
    public static readonly mainPath = "./assets/templates/main.mustache";
}