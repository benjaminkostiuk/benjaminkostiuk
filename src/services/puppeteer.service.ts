export class PuppeteerService {
    /**
     * Return a random proxy ip to use with puppeteer
     */
    public static randomizeProxy(): string {
        const proxies = [
            '161.202.226.194:8123',
            '79.110.52.229:2345',
            '201.149.34.167:8080',
            '187.243.255.174:8080',
            '37.60.18.242:3128',
            '167.172.109.12:34083',
            '187.45.123.137:36559',
            '185.61.92.207:43947',
            '84.22.137.229:8080',
            '51.15.157.59:3838',
            '198.50.163.192:3129'
        ];
        return proxies[Math.floor(Math.random() * (proxies.length - 1))];
    }
}