1702038927

# Ethereum Blockchain Project - Sepolia Testnet

This project is a port of the IOTA blockchain implementation to Ethereum's Sepolia testnet for performance comparison research.

## Project Structure

```
ethereum/
├── contracts/               # Smart contracts
│   ├── AttributeContract.sol
│   ├── DroneContract.sol
│   ├── LoggingContract.sol
│   ├── PolicyContract.sol
│   └── PDP.sol
├── scripts/                # Deployment and testing scripts
│   ├── deploy.js
│   ├── testResponseTime.js
│   ├── testGasConsumption.js
│   └── exportToExcel.js
├── test-results/           # Test output files (generated)
├── hardhat.config.js       # Hardhat configuration
├── .env                    # Environment variables (create from .env.example)
└── package.json
```

## Smart Contracts

### 1. DroneContract
Manages drone entities with model type and zone information.

### 2. PolicyContract
Manages access policies with time-based restrictions per zone.

### 3. LoggingContract
Logs all actions and events on-chain for audit purposes.

### 4. AttributeContract
Manages attributes with name-value pairs.

### 5. PDP (Policy Decision Point)
Main contract implementing 4 levels of access control evaluation.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MetaMask or another Web3 wallet
- Sepolia testnet ETH (get from faucet)
- Infura or Alchemy account for RPC access

## Installation

1. **Clone and navigate to the project:**
   ```bash
   cd ethereum
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add:
   - `SEPOLIA_RPC_URL`: Your Infura/Alchemy Sepolia RPC URL
   - `PRIVATE_KEY`: Your wallet private key (with Sepolia ETH)
   - `ETHERSCAN_API_KEY`: For contract verification (optional)

## Deployment Guide

### Step 1: Compile Contracts

```bash
npm run compile
```

This will compile all Solidity contracts and generate artifacts.

### Step 2: Deploy to Sepolia

```bash
npm run deploy
```

After deployment, you'll see contract addresses. **Save these addresses** to your `.env` file:

```
LOGGING_CONTRACT_ADDRESS=0x...
POLICY_CONTRACT_ADDRESS=0x...
DRONE_CONTRACT_ADDRESS=0x...
ATTRIBUTE_CONTRACT_ADDRESS=0x...
PDP_CONTRACT_ADDRESS=0x...
```

### Step 3: Verify Contracts on Etherscan (Optional)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Running Performance Tests

### Response Time Testing

Tests transaction response times for 1-20 transactions across 4 levels, repeated 10 times each:

```bash
npm run test-response
```

**Test Parameters:**
- Transactions: 1 to 20
- Levels: 0, 1, 2, 3
- Repetitions: 10 per transaction count
- Total tests per level: 200

### Gas Consumption Testing

Measures gas usage over 2000 transactions per level:

```bash
npm run test-gas
```

**Test Parameters:**
- Transactions per level: 2000
- Levels: 0, 1, 2, 3
- Metrics: Total gas, average gas per transaction

### Export to Excel

Convert JSON results to Excel format matching IOTA results:

```bash
npm run export-excel
```

This creates `ethereum-test-results.xlsx` with:
- Response time sheets (one per level)
- Gas consumption summary
- Detailed gas consumption (first 100 tx per level)

### Run All Tests

Execute complete test suite:

```bash
npm run test-all
```

## Access Control Levels

### Level 0: Manual Decision
- All parameters provided manually
- No on-chain lookups
- Baseline performance measurement

### Level 1: Time-Based Access
- Checks current time against provided time window
- Single policy lookup
- PIP from parameters

### Level 2: Zone-Based Access
- Retrieves policy from PolicyContract by zone
- Time validation against stored policy
- PRP from on-chain storage

### Level 3: Full On-Chain Validation
- Retrieves drone details from DroneContract
- Retrieves policy from PolicyContract
- Complete PIP + PRP + PDP cycle
- Maximum on-chain interaction

## Expected Results

Results should match the IOTA implementation format for comparison:

### Response Time Results
- Excel sheets showing response time per transaction count
- 10 repetitions per data point
- Average calculations
- One sheet per access control level

### Gas Consumption Results
- Total gas used per level
- Average gas per transaction
- Detailed transaction-by-transaction breakdown

## Network Information

- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucets**:
  - https://sepoliafaucet.com
  - https://www.infura.io/faucet/sepolia

## Troubleshooting

### "Insufficient funds" error
Get Sepolia ETH from a faucet. Tests require substantial gas.

### "Nonce too high" error
Reset your account in MetaMask or wait for pending transactions.

### "Contract not deployed" error
Ensure you've run `npm run deploy` and updated `.env` with contract addresses.

### RPC rate limiting
Use a paid Infura/Alchemy plan for higher rate limits during testing.

## Cost Estimation

### Deployment Cost
- ~0.01-0.02 ETH on Sepolia (varies with gas price)

### Testing Cost
- Response Time Test: ~0.02-0.05 ETH per level
- Gas Consumption Test: ~0.5-1 ETH per level (2000 transactions)
- **Total for all tests**: ~2-4 ETH on Sepolia

Ensure you have sufficient Sepolia ETH before running tests.

## Project Comparison

This implementation maintains identical contract logic to the IOTA version to ensure fair performance comparison:

- Same smart contract code
- Same test methodology
- Same result format
- Only blockchain platform differs

## Support

For issues or questions:
1. Check Hardhat documentation: https://hardhat.org/docs
2. Review Etherscan for transaction details
3. Verify .env configuration
4. Ensure sufficient Sepolia ETH

## License

MIT
