PostTerminal: Your API Management Companion
PostTerminal is a powerful command-line interface (CLI) tool designed to simplify and enhance your interactions with APIs. Whether you're a developer, tester, or system administrator, PostTerminal equips you with essential functionalities to efficiently manage API requests, monitor endpoint health, load testing that run in batches, response time, etc.



```markdown
### 1. Checking Health for an Endpoint

To check the health of an API endpoint, you can run the following command:

```bash
postterminal health-check --url <url>
```

- `url`: (Required) The API endpoint you want to check.

Example:
```bash
postterminal health-check --url https://uptime.betterstack.com/team/256966/incidents/660950977
```

#### Output:
```bash
Endpoint is healthy: https://uptime.betterstack.com/team/256966/incidents/660950977
No API version specified.
```

You can also specify the API version with the `--apiversion` flag:

```bash
postterminal health-check --url <url> --apiversion <version>
```

Example:
```bash
postterminal health-check --url https://uptime.betterstack.com/team/256966/incidents/660950977 --apiversion v3
```

#### Output:
```bash
Endpoint is healthy: https://uptime.betterstack.com/team/256966/incidents/660950977
Using version: v3
```

### 2. Response Time Check

To measure the response time of an API endpoint, you can use the `response-time` command:

```bash
postterminal response-time --url <url>
```

- `url`: (Required) The API endpoint to check.

Example:
```bash
postterminal response-time --url https://api.example.com
```

#### Output:
```bash
Response time: 2920 ms
```

### 3. Check API Version

To check if the API version matches the expected version, use the `check-version` command:

```bash
postterminal check-version --url <url> --apiversion <expectedVersion>
```

- `url`: (Required) The API endpoint you want to check.
- `expectedVersion`: (Required) The version you expect the API to return.

Example:
```bash
postterminal check-version --url https://api.example.com --apiversion 1.0.0
```

#### Output:
```bash
API version is compatible: 1.0.0
```

If the version does not match, it will output:
```bash
API version mismatch. Expected: 1.0.0, Got: 2.0.0
```
```

