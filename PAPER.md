## 1.2 False Positives & Evasion: The Consequences of Unreliable IPs

The unreliability of IP addresses as client identifiers leads to two critical practical consequences that fundamentally undermine rate‑limiting effectiveness.

### 1.2.1 False Positives: Collateral Damage to Legitimate Users

When multiple legitimate users share a single public IP address through NAT, their aggregate request volume can collectively exhaust a per‑IP rate limit. This occurs despite no individual user exhibiting malicious behavior. In office environments, hundreds of employees accessing the same external API through a corporate gateway all appear as a single client. In residential settings, family members sharing a home router face the same limitation. The problem is amplified in carrier‑grade NAT (CGNAT) deployments, where internet service providers assign one public IP to hundreds or even thousands of mobile subscribers simultaneously.

The impact extends beyond technical inconvenience. Users experiencing false positives encounter "Too Many Requests" errors during normal usage, leading to frustration, abandoned transactions, and costly customer support inquiries. For businesses relying on third-party APIs, such disruptions can halt critical operations.

### 1.2.2 Evasion: Attackers Bypass Limits with IP Rotation

Conversely, determined attackers can trivially circumvent per‑IP limits by distributing their requests across numerous IP addresses. Commercial VPN services provide thousands of exit nodes, allowing an attacker to appear from a different IP with each connection. Botnets comprising hundreds of thousands of compromised devices offer even greater scale. Public proxy lists, while less reliable, provide free rotation mechanisms.

With these resources, an attacker launching a credential stuffing campaign or scraping operation can ensure that each individual IP address makes few requests, staying well below the rate limit threshold. The defense that should stop malicious traffic instead becomes invisible to the attacker.

### 1.2.3 The Perverse Outcome

Together, these consequences create a perverse outcome: IP‑based rate limiting simultaneously inflicts collateral damage on legitimate users while failing to stop determined adversaries. It penalizes the innocent and is easily circumvented by the guilty—an outcome that compromises both security posture and user experience, undermining the very goals rate limiting is meant to achieve.

## III. Methodology

### 3.1 Technology Stack

The experimental testbed is built using the following technologies:

**Node.js** was selected as the runtime environment due to its non-blocking I/O model, which efficiently handles concurrent API requests, and its extensive package ecosystem. The middleware architecture of Node.js aligns perfectly with our need to process each request through a pipeline of IP extraction, rate limiting, and logging functions.

**Express.js** serves as the web application framework. Its minimalist design allows us to implement only the components necessary for the experiment. Express provides built-in IP address detection via `req.ip` and configurable proxy handling through the `trust proxy` setting, which is essential for correctly identifying client IPs when the application is deployed behind reverse proxies. The middleware pattern enables clean separation of concerns: IP extraction middleware, rate limiting middleware, and logging middleware operate independently but sequentially.

**MongoDB** is employed as the logging database. The schema-less nature of MongoDB accommodates evolving log structures as the experiment progresses. Each request generates a JSON document containing timestamp, client IP, X-Forwarded-For headers, endpoint accessed, HTTP method, response status, and a boolean indicating whether the request was rate-limited. This structure facilitates straightforward export to CSV or JSON for subsequent analysis using data science tools.

**Winston and Morgan** form the logging infrastructure. Morgan provides HTTP request logging tailored to Express, while Winston enables structured JSON logging with multiple transports. Logs are written to both the filesystem (for immediate inspection) and MongoDB (for long-term storage and analysis). This dual-transport approach ensures data durability and accessibility.

### 3.2 Environment Configuration

The testbed distinguishes between development and production environments through environment variables managed via dotenv. In development, the application runs locally with `trust proxy` disabled, allowing direct IP inspection. In production, when deployed behind cloud platforms like Render or Railway, the `trust proxy` setting is enabled to correctly extract client IPs from the `X-Forwarded-For` header. This distinction is critical for experimental validity, as incorrect IP extraction would corrupt the logged data.

Environment variables control all configurable parameters:
- `NODE_ENV`: Determines environment (development/production)
- `PORT`: Server port
- `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`: Control rate limiting behavior
- `LOG_LEVEL`: Winston logging verbosity
- `MONGODB_URI`: Connection string for log storage
