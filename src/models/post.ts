export interface SocialMediaPost {
    title: string,
    subtitle?: string,
    link: string,
    source: SocialMediaPlatform
}

export enum SocialMediaPlatform {
    Medium,
    Linkedin
}