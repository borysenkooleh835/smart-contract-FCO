# Ethereum Project Setup Instructions

## Important: Node.js Version Requirement

**Hardhat 3.x requires Node.js v22.10.0 or later (even-numbered LTS versions)**

### Check Your Node.js Version

```bash
node --version
```

If you're running Node.js v20.x or earlier, you need to upgrade.

### Upgrade Node.js

#### Option 1: Using NVM (Recommended)

**Windows:**
1. Install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
2. Open a new terminal and run:
```bash
nvm install 22
nvm use 22
```

**Mac/Linux:**
```bash
nvm install 22
nvm use 22
```

#### Option 2: Direct Download
Download and install Node.js 22 LTS from: https://nodejs.org/

### After Upgrading Node.js

1. Verify the version:
```bash
node --version  # Should show v22.x.x or higher
```

2. Clean and reinstall dependencies:
```bash
cd ethereum
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

3. Compile contracts:
```bash
npm run compile
```

## Quick Start (After Node.js Upgrade)

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
- `SEPOLIA_RPC_URL`: Get from [Infura](https://infura.io) or [Alchemy](https://alchemy.com)
- `PRIVATE_KEY`: Your wallet private key (must have Sepolia ETH)

### 2. Get Sepolia Testnet ETH

Visit one of these faucets:
- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia
- https://sepolia-faucet.pk910.de

You'll need approximately **2-4 Sepolia ETH** to run all tests.

### 3. Deploy Contracts

```bash
npm run deploy
```

Save the contract addresses displayed after deployment to your `.env` file.

### 4. Run Performance Tests

**Response Time Test** (1-20 transactions, 4 levels, 10 repetitions each):
```bash
npm run test-response
```

**Gas Consumption Test** (2000 transactions per level):
```bash
npm run test-gas
```

**Export to Excel**:
```bash
npm run export-excel
```

**Run All Tests**:
```bash
npm run test-all
```

## Troubleshooting

### "flatMap is not a function" Error
- **Cause**: Node.js version too old
- **Solution**: Upgrade to Node.js v22+ (see above)

### "Insufficient funds" Error
- **Cause**: Not enough Sepolia ETH
- **Solution**: Get more from faucets listed above

### "Invalid nonce" or "Nonce too high" Error
- **Cause**: Transaction nonce mismatch
- **Solution**: Wait for pending transactions or reset account in MetaMask

### Compilation Errors
1. Delete `cache` and `artifacts` folders:
```bash
rm -rf cache artifacts
```

2. Recompile:
```bash
npm run compile
```

### RPC Rate Limiting
- **Cause**: Too many requests to free tier RPC
- **Solution**: Use paid Infura/Alchemy plan or slow down tests

## Project Structure

```
ethereum/
├── contracts/              # Solidity smart contracts (identical to IOTA version)
│   ├── AttributeContract.sol
│   ├── DroneContract.sol
│   ├── LoggingContract.sol
│   ├── PolicyContract.sol
│   └── PDP.sol
├── scripts/               # Deployment and testing scripts
│   ├── deploy.js
│   ├── testResponseTime.js
│   ├── testGasConsumption.js
│   └── exportToExcel.js
├── test-results/          # Generated test results (JSON + Excel)
├── .env                   # Configuration (create from .env.example)
└── hardhat.config.js      # Hardhat configuration
```

## Expected Test Duration

- **Deployment**: ~2-5 minutes
- **Response Time Test**: ~30-60 minutes per level (4 levels total)
- **Gas Consumption Test**: ~3-5 hours per level (2000 tx × 4 levels)
- **Total Test Time**: ~12-20 hours for complete suite

## Cost Estimation

### Sepolia Testnet (Free ETH)

- Deployment: ~0.01-0.02 ETH
- Response Time Tests (800 tx total): ~0.1-0.2 ETH
- Gas Consumption Tests (8000 tx total): ~1-2 ETH
- **Total**: ~1.5-2.5 Sepolia ETH

## Test Results

Results will be saved in:
- `test-results/responseTime.json`
- `test-results/gasConsumption.json`
- `test-results/ethereum-test-results.xlsx`

The Excel file format matches the IOTA results for easy comparison.

## Contract Addresses Reference

After deployment, you'll receive 5 contract addresses:

1. **LoggingContract**: Logs all actions
2. **PolicyContract**: Stores access policies by zone
3. **DroneContract**: Manages drone entities
4. **AttributeContract**: Manages attributes
5. **PDP Contract**: Main access control logic (4 levels)

Save these in your `.env` file for testing.

## Support

- Hardhat docs: https://hardhat.org/docs
- Ethereum Sepolia explorer: https://sepolia.etherscan.io
- Node.js downloads: https://nodejs.org

## Alternative: Use Hardhat 2.x (If Cannot Upgrade Node.js)

If you absolutely cannot upgrade Node.js, you can downgrade Hardhat:

```bash
npm uninstall hardhat
npm install --save-dev hardhat@^2.22.0 --legacy-peer-deps
```

Then modify `package.json` to remove `"type": "module"` and convert all scripts back to CommonJS (require/module.exports).

**Note**: This is not recommended as Hardhat 2.x is older and may have compatibility issues.
