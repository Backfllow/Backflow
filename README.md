PostTerminal: Your API Management Companion
PostTerminal is a powerful command-line interface (CLI) tool designed to simplify and enhance your interactions with APIs. Whether you're a developer, tester, or system administrator, PostTerminal equips you with essential functionalities to efficiently manage API requests, monitor endpoint health, load testing that run in batches, response time, etc.


## Features

### 1. Check API Backlog
To check the API backlog, use the following command:

```
postterminal check-backlog --url <url>
```

- `url`: (Required) The base URL to check.

**Example:**
```
postterminal check-backlog --url https://api.example.com
```

### 2. Check API Version Compatibility
To check if the API version matches the expected version, use the `check-version` command:

```
postterminal check-version --url <url> --apiversion <expectedVersion>
```

- `url`: (Required) The base URL to check.
- `expectedVersion`: (Required) The version you expect the API to return.

**Example:**
```
postterminal check-version --url https://api.example.com --apiversion 1.0.0
```

### 3. Load Test
To test a batch of API requests, use the `load-test` command:

```
postterminal load-test --url <url1> <url2> ... --apiversion <expectedVersion>
```

- `url`: (Required) Specify the base URLs to check.
- `expectedVersion`: (Optional) Specify the expected API version.

**Example:**
```
postterminal load-test --url https://api.example.com/api1 https://api.example.com/api2 --apiversion 1.0.0
```

### 4. Check API Endpoint Health
To check the health of an API endpoint, use the `health-check` command:

```
postterminal health-check --url <url> --apiversion <version>
```

- `url`: (Required) The API endpoint you want to check.
- `apiversion`: (Optional) Specify the API version.

**Example:**
```
postterminal health-check --url https://api.example.com --apiversion v1
```

### 5. Monitor API Health Endpoint
To monitor the health of an API endpoint at regular intervals, use the `monitor-health-endpoint` command:

```
postterminal monitor-health-endpoint --url <url> --interval <seconds>
```

- `url`: (Required) The API endpoint you want to monitor.
- `interval`: (Optional) Specify the interval in seconds (default is 60 seconds).

**Example:**
```
postterminal monitor-health-endpoint --url https://api.example.com --interval 30
```

### 6. Check API Response Time
To measure the response time of an API endpoint, use the `response-time` command:

```
postterminal response-time --url <url>
```

- `url`: (Required) The API endpoint to check.

**Example:**
```
postterminal response-time --url https://api.example.com
```

### 7. Test API Authentication
To test API authentication, use the `authenticated-call` command:

```
postterminal authenticated-call --url <url> --token <token> --method <HTTP_METHOD> --data <data>
```

- `url`: (Required) The API endpoint to test authentication.
- `token`: (Required) The Bearer token for authentication.
- `method`: (Required) HTTP method to use (GET, POST, PUT, PATCH).
- `data`: (Optional) Data to be sent with the request (for POST, PUT, PATCH).

**Example:**
```
postterminal authenticated-call --url https://api.example.com --token your_token --method GET
```

## Conclusion
PostTerminal provides a comprehensive set of commands to manage and interact with APIs effectively. Use the commands above to streamline your API testing and monitoring processes.
