# How to Deploy 1,000,000 Test Tokens on Sepolia Testnet

This guide explains how to create and deploy a simple ERC-20 token with 1,000,000 supply on Ethereum's Sepolia testnet.

## Overview

You will deploy an ERC-20 token contract that:
- Creates 1,000,000 tokens
- Is named "Test Token" (customizable)
- Has symbol "TEST" (customizable)
- Uses 18 decimals (standard)
- Mints all tokens to your wallet address

## Prerequisites

Before starting, ensure you have:
- [ ] Node.js v22+ installed (check with `node --version`)
- [ ] Sepolia testnet ETH (~0.01-0.02 ETH for deployment)
- [ ] RPC endpoint (Infura or Alchemy)
- [ ] Private key with Sepolia ETH

## Step 1: Create the Token Contract

Navigate to the ethereum folder and create the token contract:

```bash
cd ethereum/contracts
```

Create a new file named `TestToken.sol` with this content:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("Test Token", "TEST") {
        // Mint 1,000,000 tokens to the contract deployer
        // 18 decimals means we need to multiply by 10^18
        _mint(msg.sender, 1000000 * 10**18);
    }
}
```

**Customization Options:**
- Change `"Test Token"` to your desired token name
- Change `"TEST"` to your desired token symbol
- Change `1000000` to your desired supply amount

## Step 2: Install OpenZeppelin Contracts

The token contract uses OpenZeppelin's secure ERC-20 implementation:

```bash
cd ethereum
npm install @openzeppelin/contracts --legacy-peer-deps
```

## Step 3: Create Deployment Script

Create a new file `ethereum/scripts/deployToken.js`:

```javascript
import hre from "hardhat";

async function main() {
  console.log("Deploying Test Token to Sepolia...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy token
  console.log("Deploying TestToken contract...");
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const token = await TestToken.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("✓ TestToken deployed to:", tokenAddress);

  // Get token info
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();
  const deployerBalance = await token.balanceOf(deployer.address);

  console.log("\n========================================");
  console.log("TOKEN DEPLOYMENT SUMMARY");
  console.log("========================================");
  console.log("Contract Address:", tokenAddress);
  console.log("Token Name:", name);
  console.log("Token Symbol:", symbol);
  console.log("Decimals:", decimals);
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply), symbol);
  console.log("Your Balance:", hre.ethers.formatEther(deployerBalance), symbol);
  console.log("========================================\n");

  console.log("Save this contract address for verification:");
  console.log(`TOKEN_CONTRACT_ADDRESS=${tokenAddress}`);

  console.log("\n✓ Deployment complete!");
  console.log("\nTo verify on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${tokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## Step 4: Add NPM Script

Add this line to the `scripts` section in `ethereum/package.json`:

```json
"deploy-token": "hardhat run scripts/deployToken.js --network sepolia"
```

Your scripts section should look like:
```json
"scripts": {
  "compile": "hardhat compile",
  "deploy": "hardhat run scripts/deploy.js --network sepolia",
  "deploy-token": "hardhat run scripts/deployToken.js --network sepolia",
  ...
}
```

## Step 5: Configure Environment

Make sure your `ethereum/.env` file has:

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key  # Optional, for verification
```

## Step 6: Get Sepolia ETH

You need ~0.01-0.02 Sepolia ETH for deployment. Get from faucets:
- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia
- https://sepolia-faucet.pk910.de

## Step 7: Compile the Contract

```bash
cd ethereum
npm run compile
```

**Expected output:**
```
Compiling 1 file with Solc 0.8.26
Compilation finished successfully
```

## Step 8: Deploy the Token

```bash
npm run deploy-token
```

**Expected output:**
```
Deploying Test Token to Sepolia...

Deploying from account: 0x1234...
Account balance: 0.5 ETH

Deploying TestToken contract...
✓ TestToken deployed to: 0xABCD1234...

========================================
TOKEN DEPLOYMENT SUMMARY
========================================
Contract Address: 0xABCD1234...
Token Name: Test Token
Token Symbol: TEST
Decimals: 18
Total Supply: 1000000.0 TEST
Your Balance: 1000000.0 TEST
========================================

Save this contract address for verification:
TOKEN_CONTRACT_ADDRESS=0xABCD1234...

✓ Deployment complete!
```

**IMPORTANT:** Save the contract address! You'll need it for verification and transfers.

## Step 9: Verify on Etherscan (Optional)

To verify your token contract on Etherscan:

```bash
npx hardhat verify --network sepolia <TOKEN_CONTRACT_ADDRESS>
```

Example:
```bash
npx hardhat verify --network sepolia 0xABCD1234...
```

This makes your contract code publicly visible and verifiable on Etherscan.

## Step 10: View Your Tokens

### On Etherscan
1. Go to https://sepolia.etherscan.io
2. Search for your token contract address
3. You'll see the token details and all transactions

### In MetaMask
1. Open MetaMask
2. Switch to Sepolia Testnet
3. Click "Import tokens"
4. Paste your token contract address
5. Token symbol and decimals will auto-fill
6. Click "Add custom token"
7. You should see 1,000,000 TEST tokens!

## Cost Breakdown

**Deployment Cost:**
- Gas used: ~800,000 - 1,200,000 gas
- Gas price: varies (typically 1-5 gwei on Sepolia)
- **Total cost**: ~0.001-0.02 Sepolia ETH

**Deployment time:** ~1-2 minutes

## Transferring Tokens

After deployment, you can transfer tokens to other addresses:

```javascript
// Example: Transfer 1000 tokens
const amount = ethers.parseEther("1000");  // 1000 tokens with 18 decimals
await token.transfer("0xRecipientAddress", amount);
```

## Common Token Operations

### Check Balance
```javascript
const balance = await token.balanceOf("0xAddress");
console.log("Balance:", ethers.formatEther(balance));
```

### Transfer Tokens
```javascript
await token.transfer("0xRecipient", ethers.parseEther("100"));
```

### Approve Spending
```javascript
await token.approve("0xSpender", ethers.parseEther("500"));
```

### Transfer From (after approval)
```javascript
await token.transferFrom("0xFrom", "0xTo", ethers.parseEther("100"));
```

## Troubleshooting

### "Insufficient funds" Error
**Problem:** Not enough Sepolia ETH
**Solution:** Get more from faucets

### "Contract not found" Error
**Problem:** Contract not compiled
**Solution:** Run `npm run compile` first

### "Nonce too high" Error
**Problem:** Transaction nonce mismatch
**Solution:** Wait for pending transactions or reset MetaMask account

### Import Error in Contract
**Problem:** Cannot find OpenZeppelin contracts
**Solution:** Run `npm install @openzeppelin/contracts --legacy-peer-deps`

## Token Contract Features

The deployed token will have these standard ERC-20 functions:

- `name()` - Returns "Test Token"
- `symbol()` - Returns "TEST"
- `decimals()` - Returns 18
- `totalSupply()` - Returns 1,000,000 * 10^18
- `balanceOf(address)` - Check balance of any address
- `transfer(to, amount)` - Send tokens to another address
- `approve(spender, amount)` - Approve someone to spend your tokens
- `transferFrom(from, to, amount)` - Transfer tokens on behalf of someone
- `allowance(owner, spender)` - Check approved spending amount

## Adding More Features (Optional)

### Mintable Token
To allow creating more tokens after deployment:

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable {
    constructor() ERC20("Test Token", "TEST") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### Burnable Token
To allow destroying tokens:

```solidity
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract TestToken is ERC20, ERC20Burnable {
    constructor() ERC20("Test Token", "TEST") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}
```

## Summary Checklist

- [ ] Node.js v22+ installed
- [ ] OpenZeppelin contracts installed
- [ ] TestToken.sol contract created
- [ ] deployToken.js script created
- [ ] .env file configured
- [ ] Sepolia ETH obtained (~0.02 ETH)
- [ ] Contract compiled successfully
- [ ] Token deployed to Sepolia
- [ ] Contract address saved
- [ ] Token visible in MetaMask
- [ ] (Optional) Contract verified on Etherscan

## Complete Command Reference

```bash
# 1. Install dependencies
npm install @openzeppelin/contracts --legacy-peer-deps

# 2. Compile contracts
npm run compile

# 3. Deploy token
npm run deploy-token

# 4. Verify on Etherscan (optional)
npx hardhat verify --network sepolia <TOKEN_ADDRESS>
```

## After Deployment

Once deployed, you will have:
- ✅ 1,000,000 TEST tokens in your wallet
- ✅ A verified ERC-20 contract on Sepolia
- ✅ Ability to transfer tokens to any address
- ✅ Full token functionality (transfer, approve, etc.)

## Need Different Token Supply?

To deploy with a different amount, change this line in TestToken.sol:

```solidity
_mint(msg.sender, 1000000 * 10**18);
```

Examples:
- 10,000 tokens: `_mint(msg.sender, 10000 * 10**18);`
- 100,000 tokens: `_mint(msg.sender, 100000 * 10**18);`
- 10,000,000 tokens: `_mint(msg.sender, 10000000 * 10**18);`

## Questions?

- ERC-20 Standard: https://eips.ethereum.org/EIPS/eip-20
- OpenZeppelin Docs: https://docs.openzeppelin.com/contracts/
- Hardhat Docs: https://hardhat.org/docs
- Etherscan Sepolia: https://sepolia.etherscan.io

---

**Good luck with your token deployment! 🚀**
