import { ClientConfigs, Response } from './license-plate-recognition.interfaces';
import { licensePlateRecognitionConfigs } from './license-plate-recognition.configs';
import { ukrToEng } from '../../utils';


export class LicensePlateRecognitionService {
    /**
     * @param token API token
     * @param configs Configuration
     */
    constructor(
        private token: string,
        private configs: ClientConfigs = licensePlateRecognitionConfigs) {
    }

    /**
     * Recognize the license plates with threshold
     * @param imageUrl
     * @param threshold
     */
    public async recognizePlates(imageUrl: string, threshold: number = this.configs.threshold): Promise<string[]> {
        const { results } = (await this.fetchData(imageUrl));

        return results
            .filter(({ score, dscore }) => score > threshold && dscore > threshold)
            .map(({ plate }) => ukrToEng(plate));
    }

    /**
     * Get all plates candidates on photo
     * @param imageUrl
     */
    public async recognizeCandidates(imageUrl: string): Promise<Map<string, number>> {
        const { results } = (await this.fetchData(imageUrl));

        const candidates: [string, number][] = results
            .map(({ candidates }) => candidates)
            .flat(1)
            .map(({ score, plate }) => [ukrToEng(plate), score] as [string, number]);

        return new Map<string, number>(candidates);
    }


    /**
     * Fetch data from 3rd-party provider
     *
     * @param imageUrl
     * @private
     */
    private async fetchData(imageUrl: string): Promise<Response> {
        const body = new FormData();
        body.append('upload_url', imageUrl);
        body.append('regions', this.configs.region);

        const response = await fetch(this.configs.endpoint, {
            method: 'POST',
            headers: { Authorization: 'Token ' + this.token },
            body,
        });

        if (!response.ok) {
            throw new Error('Unsuccessful response: ' + response.statusText);
        }

        const data: Response = await response.json();
        console.info('Recognition data received: ', JSON.stringify(data));

        return data;
    }
}
