import { ClientConfigs, Response } from './models';
import { ukrToEngConverter } from '../utils';

export class ServiceClient {
    constructor(private configs: ClientConfigs) {
    }

    /**
     * Recognize the license plate
     * @param imageUrl
     */
    public async recognize(imageUrl: string): Promise<string[]> {
        const { results } = (await this.fetchData(imageUrl));

        console.log(imageUrl, JSON.stringify(results));

        return results
            .filter((result) =>
                result.score > this.configs.threshold &&
                result.dscore > this.configs.threshold &&
                result.candidates.filter(({ score }) => score > this.configs.threshold).length,
            )
            .map((result) => ukrToEngConverter(result.plate));
    }


    private async fetchData(imageUrl: string): Promise<Response> {
        const body = new FormData();
        body.append('upload_url', imageUrl);
        body.append('regions', this.configs.region);

        const response = await fetch(this.configs.endpoint, {
            method: 'POST',
            headers: { Authorization: 'Token ' + this.configs.token },
            body,
        });

        if (!response.ok) {
            throw new Error('Unsuccessful response: ' + response.statusText);
        }

        return await response.json();
    }
}
