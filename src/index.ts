import mustache from "mustache";
import fs from "fs";

import { GithubService } from "./services/github.service";
import {
  LinkedinConstants,
  MediumConstants,
  MustacheTemplateConstants,
  SocialMediaPostConstants,
} from "./constants";
import { SocialMediaPost } from "./models/post";
import { Repository } from "./models/repository";
import { generateGameImg, getGamesList } from "./games";
import { Game } from "./models/game";
import config from "./config";

// Regenerate README.md file based on mustache template with data from games & social media
(async () => {
  console.log("Starting README refresh...");
  // Get list of recently played games and their achievements
  let games: Game[] = [];
  try {
    games = await getGamesList();
    for (let game of games) {
      await generateGameImg(game);
    }
  } catch (err) {
    throw new Error(
      `Could not get games and create game images with err ${err}`
    );
  }

  // Get list of recently worked on repos from github
  const recentReposResponse = await GithubService.GetRecentlyWorkedOnRepos({
    sort: "updated",
    direction: "desc",
    visibility: "public",
    per_page: 5,
  }).catch((err) => {
    throw new Error(`Could not pull GitHub repos with err ${err}`);
  });
  console.log(`Successfully pulled recently worked on repos from github.`);

  // Create repository cards to use in mustache replacement
  const repositoryCards: Repository[] = recentReposResponse.response
    .filter((repo) => repo.name !== config.github.username) // Filter out Profile Readme repo
    .map((repo) => ({
      name: repo.name,
      owner: repo.owner.login,
      url: repo.html_url,
    }))
    .slice(0, 2);

  // Parse social media posts to share
  let socialPosts: SocialMediaPost[] = [];
  try {
    console.log(
      `Parsing Social Posts data from ${SocialMediaPostConstants.SOCIAL_POSTS_PATH}...`
    );
    socialPosts = await fs.promises
      .readFile(SocialMediaPostConstants.SOCIAL_POSTS_PATH)
      .then((data) => JSON.parse(data.toString()));
  } catch (err) {
    console.warn(`Failed to parse social posts with error ${err}.`);
  }

  // Add attributes to each post according to platform
  for (let post of socialPosts) {
    post.subtitle = "Shared a post";
    switch (post.platform) {
      case "Linkedin":
        if (post.title.length > 80) {
          post.title = post.title.slice(0, 75) + "...";
        }
        post.icon = LinkedinConstants.LINKEDIN_ICON;
        post.profileLink =
          LinkedinConstants.LINKEDIN_PROFILE_URL +
          process.env.LINKEDIN_USERNAME;
        post.source = 1;
        break;
      case "Medium":
        post.icon = MediumConstants.MEDIUM_ICON;
        post.profileLink =
          MediumConstants.MEDIUM_PROFILE_URL + process.env.MEDIUM_USERNAME;
        post.source = 1;
        break;
      default:
        console.warn(
          `Platform ${post.platform} not supported for post ${post.title}. Skipping...`
        );
    }
  }

  // Replace README.md file by reading from mustache template
  const readmeContent = await fs.promises.readFile(
    MustacheTemplateConstants.mainPath
  );
  const content = mustache.render(readmeContent.toString(), {
    games: games,
    datetime: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
      timeZone: "America/Toronto",
    }),
    posts: socialPosts,
    projects: repositoryCards,
  });
  console.log("[INFO] Writing updated content to README.md...");
  fs.writeFileSync("README.md", content);
})();
