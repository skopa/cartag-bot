import { ServiceClient } from './service-client';
import { defineString } from 'firebase-functions/params';

/**
 * Recognition service API token
 */
const PLATE_RECOGNITION_API_TOKEN = defineString('PLATE_RECOGNITION_API_TOKEN');


/**
 * Service instance
 */
export const licensePlateRecognitionService = new ServiceClient({
    endpoint: 'https://api.platerecognizer.com/v1/plate-reader',
    region: 'ua',
    token: PLATE_RECOGNITION_API_TOKEN.value(),
    threshold: 0.5,
});
