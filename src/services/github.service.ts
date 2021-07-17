import axios from 'axios';
import { GitHubConstants, PLACEHOLDER } from '../constants';
import config from '../config';

export class GithubService {

    // 200 status code
    private static HTTP_OK = 200;

    public static async GetRecentlyWorkedOnRepos(params: GetRecentlyWorkedOnReposParams): Promise<GetRecentlyWorkedOnReposResponse> {
        const pageCount = params.per_page || 5;
        const sort = params.sort || 'full_name';
        const direction = params.direction || 'asc';
        const visibility = params.visibility || 'public';
        const URL = GitHubConstants.RECENT_WORKED_ON_REPOS_URL + `?per_page=${pageCount}&sort=${sort}&direction=${direction}&visibility=${visibility}`;
        let response = await axios.get(URL, {
            headers: {
                Authorization: `Bearer ${config.github.token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        if(response.status === this.HTTP_OK) {
            return { response: response.data }
        } else {
            throw new Error(`Failed to GET ${URL} with status code ${response.status}.`);
        }
    }
}

interface GetRecentlyWorkedOnReposParams {
    per_page?: number,
    direction?: 'asc' | 'desc',
    sort?: 'created' | 'updated' | 'pushed' | 'full_name',
    visibility?: 'all' | 'public' | 'private'
}

interface GetRecentlyWorkedOnReposResponse {
    response: {
        id: number,
        name: string,
        owner: {
            login: string
        }
        html_url: string
    }[]
}