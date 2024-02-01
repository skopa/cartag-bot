import { ServiceClient } from './service-client';

/**
 * Recognition service API token
 */
const PLATE_RECOGNITION_API_TOKEN = process.env.PLATE_RECOGNITION_API_TOKEN as string;


/**
 * Service instance
 */
export const licensePlateRecognitionService = new ServiceClient({
    endpoint: 'https://api.platerecognizer.com/v1/plate-reader',
    region: 'ua',
    token: PLATE_RECOGNITION_API_TOKEN,
    threshold: 0.5,
});
