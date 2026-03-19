# IP Reliability Testbed: Evaluating IP-Based Rate Limiting

## The Problem: Why We Can't Trust IP Addresses

Most web APIs use IP addresses to identify and rate-limit clients. This project starts from the premise that this is fundamentally unreliable.

- **NAT (Network Address Translation):** Makes multiple users (e.g., in an office, university, or behind carrier-grade NAT) look like **one**, causing legitimate users to be falsely blocked when their collective traffic exceeds limits.
- **Dynamic IPs (DHCP):** Mobile and residential networks frequently change user IPs mid-session due to handoffs, lease expirations, or idle timeouts, breaking the "one user, one IP" model.
- **VPNs/Proxies:** Allow users (and attackers) to easily change their apparent IP with every request, rendering per-IP limits useless for security. Attackers can rotate through thousands of IPs to stay under the radar.

## The Consequences: Why This Matters

The unreliability of IP addresses creates two critical problems:

- **False Positives:** Legitimate users behind NAT (offices, universities, mobile networks) get unfairly blocked when their combined traffic exceeds limits. The innocent suffer.

- **Evasion:** Attackers easily bypass per‑IP limits by rotating through VPNs, proxies, and botnets. The guilty succeed.

**The result:** IP-based rate limiting punishes real users while failing to stop real attacks.

This project builds a testbed to **quantify** these failures through controlled experiments.

## Configuration

The application uses environment variables for configuration. Copy `.env.example` to `.env` and adjust:

```bash
cp .env.example .env

## Tech Stack

| Component | Why We Chose It |
|-----------|-----------------|
| **Node.js** | Non-blocking I/O, perfect for API concurrency, huge ecosystem |
| **Express.js** | Middleware architecture ideal for request pipeline (IP → rate limit → log) |
| **MongoDB** | Schema-less JSON documents – perfect for evolving log data |
| **Winston + Morgan** | Structured JSON logging for easy export and analysis |
| **express-rate-limit** | Battle-tested IP-based rate limiting middleware |

## Setup Instructions

*(To be added)*

## Research Goals

1. Measure IP change frequency during active sessions
2. Quantify false positive rates under NAT, network transitions, and VPN usage
3. Assess how easily attackers can evade per-IP limits

