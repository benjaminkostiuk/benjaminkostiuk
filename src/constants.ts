export const PLACEHOLDER = "__PLACEHOLDER__";

export class GitHubConstants {
    public static readonly RECENT_WORKED_ON_REPOS_URL = `https://api.github.com/user/repos`;
}

export class SteamConstants {
    public static readonly RECENTLY_PLAYED_URL = "http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/";
    public static readonly PLAYER_ACHEIVEMENTS_URL = "http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/";
    public static readonly GET_SCHEMA_FOR_GAME = "http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/";
}

export class MediumConstants {
    public static readonly MEDIUM_DOMAIN = "https://medium.com";
    public static readonly MEDIUM_PROFILE_URL = "https://medium.com/@";
    public static readonly MEDIUM_ICON = "https://www.flaticon.com/svg/static/icons/svg/2111/2111505.svg";
}

export class LinkedinConstants {
    public static readonly LINKEDIN_LOGIN_URL = "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin";
    public static readonly LINKEDIN_SHARES_URL = `https://www.linkedin.com/in/${PLACEHOLDER}/detail/recent-activity/shares`;
    public static readonly LINKEDIN_ARTICLES_URL = `https://www.linkedin.com/in/${PLACEHOLDER}/detail/recent-activity/posts`;
    public static readonly LINKEDIN_FEED_UPDATE_URL = "https://www.linkedin.com/feed/update/";
    public static readonly LINKEDIN_ICON = "https://www.flaticon.com/svg/static/icons/svg/124/124011.svg";
    public static readonly LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/";
}

export class SocialMediaPostConstants {
    public static readonly SOCIAL_POSTS_PATH = "./assets/data/socials.json";
}

export class MustacheTemplateConstants {
    public static readonly gamePath = "./assets/templates/game.mustache";
    public static readonly mainPath = "./assets/templates/main.mustache";
}

