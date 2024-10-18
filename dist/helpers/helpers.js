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
export const HTTP_OK = 200;
export const HEALTHY_MESSAGE = 'Endpoint is healthy';
export const UNHEALTHY_MESSAGE = 'Endpoint is down';
export const TIMEOUT_MS = 5000;
export const MAX_CONCURRENT_REQUESTS = 5;
export const ERROR_MESSAGE = 'Error checking response time';
export const RESPONSE_TIME_MESSAGE = 'Response time:';
export const TIME_TAKEN = 'Time taken to complete:';
export const apiRequest = (url, method, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios({
            method,
            url,
            data,
        });
        return response.data;
    }
    catch (error) {
        console.error(chalk.red('Error fetching data from API'), error.message);
        throw error;
    }
});
export const isValidUrl = (url) => {
    if (!url) {
        return false;
    }
    const regex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!regex.test(url)) {
        return false;
    }
    try {
        new URL(url);
        return true;
    }
    catch (error) {
        return false;
    }
};
export const formatTime = (date) => {
    return date.toTimeString().split(' ')[0];
};
//# sourceMappingURL=helpers.js.map