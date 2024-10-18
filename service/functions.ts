import axios from 'axios';
import chalk from 'chalk';
import { ERROR_MESSAGE, HEALTHY_MESSAGE, HTTP_OK, MAX_CONCURRENT_REQUESTS, TIMEOUT_MS, UNHEALTHY_MESSAGE , apiRequest , isValidUrl, formatTime, TIME_TAKEN} from '../helpers/helpers.js';



// Check health for multiple endpoints
export const checkMultipleEndpointsHealth = async (baseUrls: string[]): Promise<void> => {
    for (const baseUrl of baseUrls) {
        await checkEndpointHealth(baseUrl);
    }
};

export const authenticatedRequest = async (
    url: string, 
    method: 'GET' | 'POST' | 'PUT' | 'PATCH', 
    data?: { [key: string]: any }, // Updated to expect an object for data
    token?: string
) => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        
        const response = await axios({
            method,
            url,
            data: data ?? {}, // Ensure data is an object if provided, or default to an empty object
            headers, // Add headers to the request
        });

        return response.data;
    } catch (error: any) {
        console.error(chalk.red('Error fetching data from API'), error.message);
        throw error;
    }
};

export const batchRequests = async (urls: string[]) => {
    const results: any[] = [];
    const errors: any[] = [];

    const processUrl = async (url: string) => {
        const startTime = Date.now();
        try {
            const result = await apiRequest(url, 'GET');
            const responseTime = Date.now() - startTime;
            results.push({ url, result, responseTime });
            
            // Grouped log for successful request
            console.log(chalk.green(`✅ Response from URL: ${url}`));
            console.log(`   ➡ ${result}`);
            console.log(chalk.bgBlueBright(`⏱️  Response time: ${responseTime} ms\n`));
        } catch (error) {
            errors.push({ url, error: error.message });
            
            // Grouped log for error
            console.error(chalk.red(`❌ Error fetching URL: ${url}`));
            console.error(`   ➡ ${error.message}\n`);
        }
    };

    const batches = [];
    for (let i = 0; i < urls.length; i += MAX_CONCURRENT_REQUESTS) {
        const batch = urls.slice(i, i + MAX_CONCURRENT_REQUESTS).map(processUrl);
        batches.push(...batch);
        await Promise.all(batch); // Wait for the current batch to finish
    }

    // Log summary of results
    console.log(chalk.yellow(`📊 Total successful requests: ${results.length}`));
    console.log(chalk.red(`🔴 Total failed requests: ${errors.length}`));

    if (errors.length > 0) {
        console.log(chalk.red('🚨 Errors:'));
        errors.forEach(({ url, error }) => {
            console.log(chalk.underline.visible(`   - URL: ${url} ➡ ${error}`));
        });
    }
};


export const checkEndpointHealth = async (baseUrl: string): Promise<void> => {
    if (!isValidUrl(baseUrl)) {
        console.error(chalk.red(`Invalid URL: ${baseUrl}`));
        return;
    }

    try {
        const response = await axios.get(baseUrl, { timeout: TIMEOUT_MS });
        if (response.status === HTTP_OK) {
            console.log(chalk.bold.green(`${HEALTHY_MESSAGE}: ${baseUrl}`));
        } else {
            console.error(chalk.yellow(`${UNHEALTHY_MESSAGE}: ${baseUrl} - Status Code: ${response.status}`));
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                console.error(chalk.red(`${UNHEALTHY_MESSAGE}: ${baseUrl} - Request timed out`));
            } else {
                console.error(chalk.red(`${UNHEALTHY_MESSAGE}: ${baseUrl} - ${error.message}`));
            }
        } else {
            console.error(chalk.red(`${UNHEALTHY_MESSAGE}: ${baseUrl} - An unexpected error occurred`));
        }
    }
};

//Monitor health endpoint
export const monitorEndpoint = async (baseUrl: string, interval: number) => {
    // Use a variable to keep track of the interval ID
    let intervalId: NodeJS.Timeout;

    const checkAndMonitor = async () => {
        console.log(chalk.blue(`Checking endpoint health..🎍 \nTimestamp: ${new Date().toUTCString()}`));
        try {
            await checkEndpointHealth(baseUrl);
        } catch (error) {
            console.error(chalk.red(`Error checking health: ${error.message}`));
        }

        // Clear the current interval before setting a new one
        clearInterval(intervalId);
        // Set a new interval
        intervalId = setInterval(checkAndMonitor, interval * 1000);
    };

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            clearInterval(intervalId);
            console.log(chalk.yellow('Monitoring stopped.'));
            process.exit(0);
        });

    // Start the initial check
    checkAndMonitor();
};

// Response Time Checker
export const checkResponseTime = async (baseUrl: string): Promise<void> => {
    if (!isValidUrl(baseUrl)) {
        console.error(chalk.red(`Invalid URL: ${baseUrl}`));
        return;
    }

    const start = Date.now();
    const startTime = formatTime(new Date()); // Capture start time

    try {
        await axios.get(baseUrl, { timeout: TIMEOUT_MS });
        const endTime = formatTime(new Date()); // Capture end time
        const responseTime = Date.now() - start; // Calculate duration in milliseconds
        console.log(chalk.bgYellowBright.bold(`${TIME_TAKEN} Start time: ${startTime}, End time: ${endTime}, Duration: ${responseTime} ms`));
    } catch (error) {
        handleError(error);
    }
};


// Fetch backlog data (GET request)
export const fetchBacklog = async (baseUrl: string) => {
    const url = `${baseUrl}/backlog`; // Construct the URL
    const backlogData = await apiRequest(url, 'GET'); // Use the utility function
    console.log(chalk.green('API Backlog:'), backlogData);
};

// Check API Version Compatibility (GET request)
export const checkVersion = async (baseUrl: string, expectedVersion: string) => {
    const url = `${baseUrl}/version`; // Construct the URL
    const versionData = await apiRequest(url, 'GET'); // Use the utility function
    const currentVersion = versionData.version;

    if (currentVersion === expectedVersion) {
        console.log(chalk.green(`API version is compatible: ${currentVersion}`));
    } else {
        console.log(chalk.red(`API version mismatch. Expected: ${expectedVersion}, Got: ${currentVersion}`));
    }
};

// Create a new resource (POST request)
export const createResource = async (baseUrl: string, resourceData: any) => {
    const url = `${baseUrl}/resource`; // Construct the URL
    const createdResource = await apiRequest(url, 'POST', resourceData); // Use the utility function
    console.log(chalk.green('Resource created successfully:'), createdResource);
};


// Update an existing resource (PUT request)
export const updateResource = async (baseUrl: string, resourceId: string, resourceData: any) => {
    const url = `${baseUrl}/resource/${resourceId}`; // Construct the URL
    const updatedResource = await apiRequest(url, 'PUT', resourceData); // Use the utility function
    console.log(chalk.green('Resource updated successfully:'), updatedResource);
};

// Partially update an existing resource (PATCH request)
export const patchResource = async (baseUrl: string, resourceId: string, resourceData: any) => {
    const url = `${baseUrl}/resource/${resourceId}`; // Construct the URL
    const patchedResource = await apiRequest(url, 'PATCH', resourceData); // Use the utility function
    console.log(chalk.green('Resource patched successfully:'), patchedResource);
};


const handleError = (error: any) => {
    if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
            console.error(chalk.red(`${ERROR_MESSAGE}: Request timed out`));
        } else {
            console.error(chalk.red(`${ERROR_MESSAGE}: ${error.message}`));
        }
    } else {
        console.error(chalk.red(`${ERROR_MESSAGE}: ${error.message}`));
    }
};
