/**
 * Connector definition
 */
export interface ClientConfigs {
    endpoint: string;
    region: string;
    token: string;
    threshold: number;
}

/**
 * Response
 */
export interface Response {
    processing_time: number;
    timestamp: string;
    results: Array<{
        plate: string,
        score: number,
        dscore: number,
        region: { code: string, score: number },
        candidates: { plate: string, score: number }[]
    }>;
}
