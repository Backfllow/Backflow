

import axios from 'axios';
import chalk from 'chalk';
export const HTTP_OK : number = 200;
export const HEALTHY_MESSAGE  : string = 'Endpoint is healthy';
export const UNHEALTHY_MESSAGE  : string = 'Endpoint is down';
export const TIMEOUT_MS : number = 5000; // Set timeout to 5 seconds
export const MAX_CONCURRENT_REQUESTS : number = 5;
export const ERROR_MESSAGE  : string = 'Error checking response time';
export const RESPONSE_TIME_MESSAGE  : string = 'Response time:';
export const TIME_TAKEN  : string = 'Time taken to complete:';
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
    if (!url) {
        return false; // If the URL is empty or falsy
    }

    // Basic regex check for URL format
    const regex: RegExp = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!regex.test(url)) {
        return false; // Fail if the URL doesn't match the basic structure
    }

    // More robust URL check using the URL constructor
    try {
        new URL(url); // This will throw an error if the URL is invalid
        return true;
    } catch (error) {
        return false; // Invalid URL
    }
};

// Helper function to format time intervals (HH:mm:ss)
export const formatTime = (date: Date): string => {
    return date.toTimeString().split(' ')[0]; // Extracts and returns the HH:mm:ss part
};