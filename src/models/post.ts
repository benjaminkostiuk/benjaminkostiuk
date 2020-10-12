export interface SocialMediaPost {
    title: string,
    subtitle?: string,
    link: string,
    source: SocialMediaPlatform
    icon?: string,
    platform?: string,
    profileLink?: string
}

export enum SocialMediaPlatform {
    Medium,
    Linkedin
}