

import axios from 'axios';
import chalk from 'chalk';
export const HTTP_OK : number = 200;
export const HEALTHY_MESSAGE  : string = 'Endpoint is healthy';
export const UNHEALTHY_MESSAGE  : string = 'Endpoint is down';
export const TIMEOUT_MS : number = 5000; // Set timeout to 5 seconds
export const MAX_CONCURRENT_REQUESTS : number = 5;
export const ERROR_MESSAGE  : string = 'Error checking response time';
export const RESPONSE_TIME_MESSAGE  : string = 'Response time:';

// Utility function to handle API requests
export const apiRequest = async (url: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH', data?: any) => {
    try {
        const response = await axios({
            method,
            url,
            data, // Include data for POST, PUT, or PATCH requests
        });
        return response.data;
    } catch (error: any) {
        console.error(chalk.red('Error fetching data from API'), error.message);
        throw error; // Rethrow the error for further handling if needed
    }
};

export const isValidUrl = (url: string): boolean => {
    const regex :  RegExp = /^(ftp|http|https):\/\/[^ "]+$/;
    return regex.test(url);
};
