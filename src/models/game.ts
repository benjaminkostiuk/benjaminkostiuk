export interface Game {
    appid: number,
    name: string,
    img_logo_hash: string,
    path: string,
    achievement?: GameAchievement,
}

export interface GameAchievement {
    name: string,
    displayName: string,
    description: string,
    icon: string
}