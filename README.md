# IP Reliability Testbed: Evaluating IP-Based Rate Limiting

## The Problem: Why We Can't Trust IP Addresses

Most web APIs use IP addresses to identify and rate-limit clients. This project starts from the premise that this is fundamentally unreliable.

- **NAT (Network Address Translation):** Makes multiple users (e.g., in an office, university, or behind carrier-grade NAT) look like **one**, causing legitimate users to be falsely blocked when their collective traffic exceeds limits.
- **Dynamic IPs (DHCP):** Mobile and residential networks frequently change user IPs mid-session due to handoffs, lease expirations, or idle timeouts, breaking the "one user, one IP" model.
- **VPNs/Proxies:** Allow users (and attackers) to easily change their apparent IP with every request, rendering per-IP limits useless for security. Attackers can rotate through thousands of IPs to stay under the radar.

This project builds a testbed to **quantify** these failures through controlled experiments.

## Project Status

🚧 **In Progress** – Building the research API testbed.

## Tech Stack

- Node.js / Express
- MongoDB (for logging)
- Winston / Morgan (structured logging)
- express-rate-limit (rate limiting middleware)

## Setup Instructions

*(To be added)*

## Research Goals

1. Measure IP change frequency during active sessions
2. Quantify false positive rates under NAT, network transitions, and VPN usage
3. Assess how easily attackers can evade per-IP limits