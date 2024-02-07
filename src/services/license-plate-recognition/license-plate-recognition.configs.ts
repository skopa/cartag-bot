import { ClientConfigs } from './license-plate-recognition.interfaces';


/**
 * LicensePlateRecognitionService instance
 */
export const licensePlateRecognitionConfigs: ClientConfigs = {
    endpoint: 'https://api.platerecognizer.com/v1/plate-reader',
    region: 'ua',
    threshold: 0.5,
};
