import axios from 'axios';
import { GitHubConstants, PLACEHOLDER } from '../constants';

export class GithubService {

    // 200 status code
    private static HTTP_OK = 200;

    public static async GetRecentlyWorkedOnRepos(params: GetRecentlyWorkedOnReposParams): Promise<GetRecentlyWorkedOnReposResponse> {
        let pageCount = params.per_page || 5;
        const URL = GitHubConstants.RECENT_WORKED_ON_REPOS_URL.replace(PLACEHOLDER, params.username) + `&per_page=${pageCount}`;
        let response = await axios.get(URL);
        if(response.status === this.HTTP_OK) {
            return { response: response.data }
        } else {
            throw new Error(`Failed to GET ${URL} with status code ${response.status}.`);
        }
    }
}

interface GetRecentlyWorkedOnReposParams {
    username: string,
    per_page?: number
}

interface GetRecentlyWorkedOnReposResponse {
    response: {
        id: number,
        name: string,
        html_url: string
    }[]
}