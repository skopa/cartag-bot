/**
 * 3rd-party Service configuration
 */
export interface ClientConfigs {
    /**
     * API endpoint
     */
    endpoint: string;

    /**
     * Region of recognition
     */
    region: string;

    /**
     * Confidence threshold level of any recognitions
     */
    threshold: number;
}


export interface Candidate {
    /**
     * Text of the license plate.
     */
    plate: string,

    /**
     * Confidence level for reading the license plate text.
     */
    score: number
}

/**
 * Result model
 */
export interface Results {
    /**
     * Text of the license plate.
     */
    plate: string,

    /**
     * Region information
     */
    region: {

        /**
         * Region of license plate. Returns a code from the country list.
         */
        code: string,

        /**
         * Confidence level for license plate region.
         */
        score: number
    },

    /**
     * Confidence level for reading the license plate text. See below for more details.
     */
    score: number,

    /**
     * List of predictions for the license plate value.
     * The first element is the top prediction (same as results/plate).
     */
    candidates: Candidate[],

    /**
     * Confidence level for plate detection. See below for more details.
     */
    dscore: number,
}


/**
 * Response model
 */
export interface Response {
    processing_time: number;
    timestamp: string;
    results: Results[];
}
