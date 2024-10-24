var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { ERROR_MESSAGE, HEALTHY_MESSAGE, HTTP_OK, MAX_CONCURRENT_REQUESTS, TIMEOUT_MS, UNHEALTHY_MESSAGE, apiRequest, isValidUrl, formatTime, TIME_TAKEN } from '../helpers/helpers.js';
export const runRustLoadTester = (urls) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const rustProjectPath = './rust_load_tester';
        const rustBinaryPath = `${rustProjectPath}/target/release/rust_load_tester`;
        const shellPath = process.env.SHELL || '/bin/sh';
        exec('cargo build --release', { cwd: rustProjectPath, shell: shellPath }, (buildError, buildStdout, buildStderr) => __awaiter(void 0, void 0, void 0, function* () {
            if (buildError) {
                reject(`Build error: ${buildError.message}\n${buildStderr}`);
                return;
            }
            console.log(`Build output: ${buildStdout}`);
            try {
                yield fs.access(rustBinaryPath);
            }
            catch (_a) {
                reject(`Binary not found: ${rustBinaryPath}`);
                return;
            }
            const command = `${rustBinaryPath} ${urls.join(' ')}`;
            exec(command, { shell: shellPath }, (error, stdout, stderr) => {
                if (error) {
                    reject(`Execution error: ${error.message}\n${stderr}`);
                }
                else if (stderr) {
                    console.warn(`Rust binary warning: ${stderr}`);
                    resolve(stdout);
                }
                else {
                    resolve(stdout);
                }
            });
        }));
    });
});
export const runSnykCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            }
            else {
                resolve(stdout);
            }
        });
    });
};
export const checkMultipleEndpointsHealth = (baseUrls) => __awaiter(void 0, void 0, void 0, function* () {
    for (const baseUrl of baseUrls) {
        yield checkEndpointHealth(baseUrl);
    }
});
export const authenticatedRequest = (url, method, data, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const response = yield axios({
            method,
            url,
            data: data !== null && data !== void 0 ? data : {},
            headers,
        });
        return response.data;
    }
    catch (error) {
        console.error(chalk.red('Error fetching data from API'), error.message);
        throw error;
    }
});
export const batchRequests = (urls) => __awaiter(void 0, void 0, void 0, function* () {
    const results = [];
    const errors = [];
    const processUrl = (url) => __awaiter(void 0, void 0, void 0, function* () {
        const startTime = Date.now();
        try {
            const result = yield apiRequest(url, 'GET');
            const responseTime = Date.now() - startTime;
            results.push({ url, result, responseTime });
            console.log(chalk.green(`✅ Response from URL: ${url}`));
            console.log(`   ➡ ${result}`);
            console.log(chalk.bgBlueBright(`⏱️  Response time: ${responseTime} ms\n`));
        }
        catch (error) {
            errors.push({ url, error: error.message });
            console.error(chalk.red(`❌ Error fetching URL: ${url}`));
            console.error(`   ➡ ${error.message}\n`);
        }
    });
    const batches = [];
    for (let i = 0; i < urls.length; i += MAX_CONCURRENT_REQUESTS) {
        const batch = urls.slice(i, i + MAX_CONCURRENT_REQUESTS).map(processUrl);
        batches.push(...batch);
        yield Promise.all(batch);
    }
    console.log(chalk.yellow(`📊 Total successful requests: ${results.length}`));
    console.log(chalk.red(`🔴 Total failed requests: ${errors.length}`));
    if (errors.length > 0) {
        console.log(chalk.red('🚨 Errors:'));
        errors.forEach(({ url, error }) => {
            console.log(chalk.underline.visible(`   - URL: ${url} ➡ ${error}`));
        });
    }
});
export const checkEndpointHealth = (baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isValidUrl(baseUrl)) {
        console.error(chalk.red(`Invalid URL: ${baseUrl}`));
        return;
    }
    try {
        const response = yield axios.get(baseUrl, { timeout: TIMEOUT_MS });
        if (response.status === HTTP_OK) {
            console.log(chalk.bold.green(`${HEALTHY_MESSAGE}: ${baseUrl}`));
        }
        else {
            console.error(chalk.yellow(`${UNHEALTHY_MESSAGE}: ${baseUrl} - Status Code: ${response.status}`));
        }
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                console.error(chalk.red(`${UNHEALTHY_MESSAGE}: ${baseUrl} - Request timed out`));
            }
            else {
                console.error(chalk.red(`${UNHEALTHY_MESSAGE}: ${baseUrl} - ${error.message}`));
            }
        }
        else {
            console.error(chalk.red(`${UNHEALTHY_MESSAGE}: ${baseUrl} - An unexpected error occurred`));
        }
    }
});
export const monitorEndpoint = (baseUrl, interval) => __awaiter(void 0, void 0, void 0, function* () {
    let intervalId;
    const checkAndMonitor = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(chalk.blue(`Checking endpoint health..🎍 \nTimestamp: ${new Date().toUTCString()}`));
        try {
            yield checkEndpointHealth(baseUrl);
        }
        catch (error) {
            console.error(chalk.red(`Error checking health: ${error.message}`));
        }
        clearInterval(intervalId);
        intervalId = setInterval(checkAndMonitor, interval * 1000);
    });
    process.on('SIGINT', () => {
        clearInterval(intervalId);
        console.log(chalk.yellow('Monitoring stopped.'));
        process.exit(0);
    });
    checkAndMonitor();
});
export const checkResponseTime = (baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isValidUrl(baseUrl)) {
        console.error(chalk.red(`Invalid URL: ${baseUrl}`));
        return;
    }
    const start = Date.now();
    const startTime = formatTime(new Date());
    try {
        yield axios.get(baseUrl, { timeout: TIMEOUT_MS });
        const endTime = formatTime(new Date());
        const responseTime = Date.now() - start;
        console.log(chalk.bgYellowBright.bold(`${TIME_TAKEN} Start time: ${startTime}, End time: ${endTime}, Duration: ${responseTime} ms`));
    }
    catch (error) {
        handleError(error);
    }
});
export const fetchBacklog = (baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${baseUrl}/backlog`;
    const backlogData = yield apiRequest(url, 'GET');
    console.log(chalk.green('API Backlog:'), backlogData);
});
export const checkVersion = (baseUrl, expectedVersion) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${baseUrl}/version`;
    const versionData = yield apiRequest(url, 'GET');
    const currentVersion = versionData.version;
    if (currentVersion === expectedVersion) {
        console.log(chalk.green(`API version is compatible: ${currentVersion}`));
    }
    else {
        console.log(chalk.red(`API version mismatch. Expected: ${expectedVersion}, Got: ${currentVersion}`));
    }
});
export const createResource = (baseUrl, resourceData) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${baseUrl}/resource`;
    const createdResource = yield apiRequest(url, 'POST', resourceData);
    console.log(chalk.green('Resource created successfully:'), createdResource);
});
export const updateResource = (baseUrl, resourceId, resourceData) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${baseUrl}/resource/${resourceId}`;
    const updatedResource = yield apiRequest(url, 'PUT', resourceData);
    console.log(chalk.green('Resource updated successfully:'), updatedResource);
});
export const patchResource = (baseUrl, resourceId, resourceData) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${baseUrl}/resource/${resourceId}`;
    const patchedResource = yield apiRequest(url, 'PATCH', resourceData);
    console.log(chalk.green('Resource patched successfully:'), patchedResource);
});
const handleError = (error) => {
    if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
            console.error(chalk.red(`${ERROR_MESSAGE}: Request timed out`));
        }
        else {
            console.error(chalk.red(`${ERROR_MESSAGE}: ${error.message}`));
        }
    }
    else {
        console.error(chalk.red(`${ERROR_MESSAGE}: ${error.message}`));
    }
};
//# sourceMappingURL=functions.js.map