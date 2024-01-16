export class RecognitionClient {

    private endpoint: string = 'https://api.platerecognizer.com/v1/plate-reader/';

    constructor(private token: string, private options: any = {}) {
    }

    public async recognize(imageUrl: string) {
        const body = new FormData();
        body.append('upload_url', imageUrl);
        body.append('regions', this.options?.region || 'ua');

        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: { Authorization: 'Token ' + this.token },
            body,
        });

        if (!response.ok) {
            throw 'Unsuccessful response: ' + response.statusText;
        }

        const data = await response.json();
        console.log('Response:', data.results);

        const threshold = this.options?.treshold || 0.5;

        return ((data.results || []) as Results[])
            .filter(result =>
                result.score > threshold &&
                result.dscore > threshold &&
                result.region.score > threshold
            )
            .map(result => result.plate)
    }
}

interface Results {
    'plate': string,
    'region': {
        'code': 'ua',
        'score': number
    },
    'score': number,
    'candidates': [
        {
            'score': number,
            'plate': string
        }
    ],
    'dscore': number,
}
