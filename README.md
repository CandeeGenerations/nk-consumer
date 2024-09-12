# NK Consumer

[![Validate Branch](https://github.com/CandeeGenerations/nk-consumer/actions/workflows/validate-branch.yml/badge.svg)](https://github.com/CandeeGenerations/nk-consumer/actions/workflows/validate-branch.yml)

Consumes messages from SQS and executes actions based on the message type (sends emails, etc.). Testing

## Getting Started

### Prerequisites

- Node.js 20.x
- PNPM 9.x
- [Doppler](https://docs.doppler.com/docs/install-cli)

### Local Setup

1. Check if you have corepack:
   ```sh
   corepack -v
   ```
1. If not, install it:
   ```sh
   brew install corepack
   ```
1. Enable pnpm
   ```sh
   corepack enable pnpm
   ```
1. Install pnpm
   ```sh
   corepack use pnpm
   ```
1. Install project dependencies
   ```sh
   pnpm install
   ```
1. Configure Doppler:
   ```sh
   doppler setup
   ```
1. Start the service:
   ```sh
   pnpm run start
   ```
