#!/usr/bin/env ts-node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { fetchBacklog, checkEndpointHealth, checkResponseTime, checkVersion, monitorEndpoint, authenticatedRequest, checkMultipleEndpointsHealth, runSnykCommand, runRustLoadTester, batchRequests, logCommandHistory, logFilePath } from './service/functions.js'; 

// CLI commands setup
yargs(hideBin(process.argv))
    .command('check-backlog', 'Check the API backlog', {
        url: {
            type: 'string',
            describe: 'Specify the base URL to check',
            demandOption: true,
        },
    }, async (argv: any) => {
        await fetchBacklog(argv.url);
    })


    .command('check-version', 'Check API version compatibility', {
        url: {
            type: 'string',
            describe: 'Specify the base URL to check',
            demandOption: true,
        },
        apiversion: {
            type: 'string',
            describe: 'Specify the expected API version',
            demandOption: true,
        },
    }, async (argv: any) => {
        await checkVersion(argv.url, argv.version);
    })

    .command('batch-request', 'Test a batch of API requests', {
        url: {
            type: 'array',
            describe: 'Specify the base URLs to check',
            demandOption: true,
        },
        apiversion: {
            type: 'string',
            describe: 'Specify the expected API version',
            demandOption: false,
        },
    }, async (argv: any) => {
        const urls = argv.url.map((url: string) => {
            // Only append the apiversion if it is provided
            return argv.apiversion ? `${url}?apiversion=${argv.apiversion}` : url;
        });
        await batchRequests(urls);
    })



// Inside the load-test command
    .command('load-test [urls..]', 'Run load test with provided URLs', {
        urls: {
            type: 'array',
            describe: 'URLs to test',
            demandOption: true,
        },
    }, async (argv: any) => {
        try {
            const output = await runRustLoadTester(argv.urls);
            const outputLines = output.split('\n');
            console.log(chalk.bgRedBright(`Rust Load Tester Output :\n`));
            outputLines.forEach(line => {
                console.log(line);
            });

            // Log command history
            logCommandHistory('load-test', argv.urls, output);
        } catch (error) {
            console.error(`Failed to run Rust load tester: ${error}`);
        }
    })
    
    .command('history', 'Retrieve command execution history', {}, async () => {
        try {
            const data = await fs.readFile(logFilePath, 'utf-8');
            const logEntries = JSON.parse(data);
    
            logEntries.forEach((entry: { timestamp: any; command: any; params: any; result: any; }) => {
                console.log(`Timestamp: ${entry.timestamp}`);
                console.log(`Command: ${entry.command}`);
                console.log(`Parameters: ${JSON.stringify(entry.params)}`);
                console.log(`Result: ${entry.result} \n`);
                console.log(chalk.magentaBright('-----------------------------------'));
            });
        } catch (error) {
            console.error(`Failed to retrieve command history: ${error}`);
        }
    })

    .command('health-check', 'Check API endpoint health', {
        url: {
            type: 'string',
            describe: 'Specify the URL to check',
            demandOption: true,
        },
        apiversion: {
            type: 'string',
            describe: 'Specify the API version',
            demandOption: false, // Makes the API version optional
        },
    }, async (argv: any) => {
       const endpointHealth =  await checkEndpointHealth(argv.url);
        

        logCommandHistory('health-check', argv.url, endpointHealth);
        if (argv.apiversion) {
            console.log(chalk.green(`Using version: ${argv.apiversion}`)); // Display the version if provided
        } else {
            console.log(chalk.green('No API version specified.'));
        }
    }) 

    .command('monitor-health-endpoint', 'Monitor API health endpoint', {
        url: {
            type: 'string',
            describe: 'Specify the URL to check',
            demandOption: true,
        },
        interval: {
            type: 'number',
            describe: 'Specify the interval in seconds (optional, default is 60 seconds)',
            demandOption: false,
            default: 60,  // Set a default value of 60 seconds
        },
    }, async (argv: any) => {
        await monitorEndpoint(argv.url, argv.interval);
    })


    .command('response-time', 'Check API response time', {
        url: {
            type: 'string',
            describe: 'Specify the URL to check',
            demandOption: true,
        },
    }, async (argv: any) => {
        await checkResponseTime(argv.url);
    })

    .command(
        'authenticated-call', 
        'Test API authentication', 
        {
            url: {
                type: 'string',
                describe: 'Specify the API endpoint to test authentication',
                demandOption: true,
            },
            token: {
                type: 'string',
                describe: 'Specify the Bearer token for authentication',
                demandOption: true,
            },
            method: {
                type: 'string',
                describe: 'HTTP method to use (GET, POST, PUT, PATCH)',
                choices: ['GET', 'POST', 'PUT', 'PATCH'],
                demandOption: true,
            },
            data: {
                type: 'string',
                describe: 'Data to be sent with the request (for POST, PUT, PATCH)',
                demandOption: false,
            }
        }, 
        async (argv: any) => {
            try {
                // Parse the data argument if it's provided, ensuring it's an object
                const requestData: { [key: string]: any } | undefined = argv.data ? JSON.parse(argv.data) : undefined;
    
                // Call authenticatedRequest with the user-specified method and data (if provided)
                const response = await authenticatedRequest(argv.url, argv.method as 'GET' | 'POST' | 'PUT' | 'PATCH', requestData, argv.token); 
                console.log(chalk.green('Request successful! Response:'), response);
            } catch (error: any) {
                console.error(chalk.red('Request failed:'), error.message);
            }
        }
    )
    .command('check-more-health <urls..>', 'Check health for multiple API endpoints', {
        urls: {
            type: 'array',
            describe: 'List of URLs to check health',
            demandOption: true,
        },
    }, async (argv: any) => {
        await checkMultipleEndpointsHealth(argv.urls);
    })

    .command('snyk-auth', 'Authenticate with Snyk', {}, async () => {
        try {
            const output = await runSnykCommand('snyk auth');
            console.log(chalk.green(output));
        } catch (error) {
            console.error(chalk.red(error));
        }
    })
    .command('snyk-test', 'Run Snyk test for vulnerabilities', {
        path: {
            type: 'string',
            describe: 'Path to the project directory',
            demandOption: true,
        },
    }, async (argv: any) => {
        try {
            const output = await runSnykCommand(`snyk test --all-projects --path=${argv.path}`);
            console.log(chalk.green(output));
        } catch (error) {
            console.error(chalk.red(error));
        }
    })
    .command('snyk-monitor', 'Monitor the project for vulnerabilities', {
        path: {
            type: 'string',
            describe: 'Path to the project directory',
            demandOption: true,
        },
    }, async (argv: any) => {
        try {
            const output = await runSnykCommand(`snyk monitor --path=${argv.path}`);
            console.log(chalk.green(output));
        } catch (error) {
            console.error(chalk.red(error));
        }
    })

    .demandCommand(1, 'You must provide a valid command')
    .help()
    .argv;
