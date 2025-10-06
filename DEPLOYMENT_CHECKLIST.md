# Ethereum Project Deployment Checklist

Use this checklist to ensure successful deployment and testing.

## Pre-Deployment Setup

### 1. Node.js Environment
- [ ] Check Node.js version: `node --version`
  - Required: v22.10.0 or higher
  - If not: See SETUP_INSTRUCTIONS.md for upgrade guide

### 2. Dependencies Installation
- [ ] Navigate to ethereum folder: `cd ethereum`
- [ ] Install packages: `npm install --legacy-peer-deps`
- [ ] Verify installation: Check for `node_modules` folder

### 3. Environment Configuration
- [ ] Copy template: `cp .env.example .env`
- [ ] Edit `.env` file with:
  - [ ] `SEPOLIA_RPC_URL` - From Infura or Alchemy
  - [ ] `PRIVATE_KEY` - Your wallet private key (with Sepolia ETH)
  - [ ] `ETHERSCAN_API_KEY` - (Optional) For verification

### 4. Get Sepolia Testnet ETH
- [ ] Visit faucet: https://sepoliafaucet.com
- [ ] Or: https://www.infura.io/faucet/sepolia
- [ ] Verify balance: Check on https://sepolia.etherscan.io
- [ ] Ensure you have at least 2-4 Sepolia ETH

## Compilation & Deployment

### 5. Compile Smart Contracts
```bash
npm run compile
```
- [ ] No compilation errors
- [ ] `artifacts` folder created
- [ ] `cache` folder created

### 6. Deploy Contracts to Sepolia
```bash
npm run deploy
```
- [ ] All 5 contracts deployed successfully
- [ ] Contract addresses displayed:
  - [ ] LoggingContract address: `0x...`
  - [ ] PolicyContract address: `0x...`
  - [ ] DroneContract address: `0x...`
  - [ ] AttributeContract address: `0x...`
  - [ ] PDP Contract address: `0x...`

### 7. Update .env with Contract Addresses
- [ ] Copy addresses from deployment output
- [ ] Paste into `.env` file:
  ```
  LOGGING_CONTRACT_ADDRESS=0x...
  POLICY_CONTRACT_ADDRESS=0x...
  DRONE_CONTRACT_ADDRESS=0x...
  ATTRIBUTE_CONTRACT_ADDRESS=0x...
  PDP_CONTRACT_ADDRESS=0x...
  ```
- [ ] Save `.env` file

## Performance Testing

### 8. Response Time Testing
```bash
npm run test-response
```
- [ ] Test starts successfully
- [ ] Test data (drone & policy) created
- [ ] Level 0 tests complete (200 tests)
- [ ] Level 1 tests complete (200 tests)
- [ ] Level 2 tests complete (200 tests)
- [ ] Level 3 tests complete (200 tests)
- [ ] Results saved to `test-results/responseTime.json`

**Expected Duration**: 2-3 hours
**Expected Cost**: ~0.1-0.2 Sepolia ETH

### 9. Gas Consumption Testing
```bash
npm run test-gas
```
- [ ] Test starts successfully
- [ ] Level 0: 2000 transactions complete
- [ ] Level 1: 2000 transactions complete
- [ ] Level 2: 2000 transactions complete
- [ ] Level 3: 2000 transactions complete
- [ ] Results saved to `test-results/gasConsumption.json`

**Expected Duration**: 12-20 hours
**Expected Cost**: ~1-2 Sepolia ETH

### 10. Export Results to Excel
```bash
npm run export-excel
```
- [ ] Excel file created: `test-results/ethereum-test-results.xlsx`
- [ ] File contains:
  - [ ] 4 sheets for Response Time (Level 0-3)
  - [ ] 1 sheet for Gas Consumption Summary
  - [ ] 4 sheets for Gas Detail (Level 0-3)

## Verification & Comparison

### 11. Verify Results Format
- [ ] Open `ethereum-test-results.xlsx`
- [ ] Compare format with IOTA results file
- [ ] Verify all data present:
  - [ ] Response times for 1-20 transactions
  - [ ] 10 repetitions per transaction count
  - [ ] Average calculations present
  - [ ] Gas consumption data complete

### 12. Contract Verification (Optional)
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```
Verify each contract on Etherscan:
- [ ] LoggingContract verified
- [ ] PolicyContract verified
- [ ] DroneContract verified
- [ ] AttributeContract verified
- [ ] PDP Contract verified

## Deliverables

### 13. Final Deliverables Checklist
- [ ] Source code in `ethereum/` folder
- [ ] Deployed contract addresses documented
- [ ] Excel file with test results
- [ ] Documentation files:
  - [ ] README.md
  - [ ] SETUP_INSTRUCTIONS.md
  - [ ] PROJECT_SUMMARY.md
  - [ ] DEPLOYMENT_CHECKLIST.md (this file)

## Troubleshooting Reference

### Common Issues

**"flatMap is not a function"**
- Cause: Node.js version < 22
- Fix: Upgrade Node.js (see SETUP_INSTRUCTIONS.md)

**"Insufficient funds"**
- Cause: Not enough Sepolia ETH
- Fix: Get more from faucets

**"Nonce too high"**
- Cause: Transaction nonce mismatch
- Fix: Wait or reset account in MetaMask

**"Cannot find module"**
- Cause: Missing dependencies
- Fix: `npm install --legacy-peer-deps`

**Compilation errors**
- Fix: `rm -rf cache artifacts && npm run compile`

**RPC rate limiting**
- Fix: Use paid RPC plan or slow down requests

## Time Tracking

| Task | Estimated Time | Actual Time | Notes |
|------|----------------|-------------|-------|
| Setup & Installation | 30 min | | |
| Deployment | 5 min | | |
| Response Time Tests | 2-3 hours | | |
| Gas Consumption Tests | 12-20 hours | | |
| Excel Export | 1 min | | |
| **Total** | **15-24 hours** | | |

## Cost Tracking

| Item | Estimated Cost | Actual Cost | Tx Hash |
|------|----------------|-------------|---------|
| Contract Deployment | 0.02 ETH | | |
| Response Time Tests | 0.1-0.2 ETH | | |
| Gas Tests | 1-2 ETH | | |
| **Total** | **1.5-2.5 ETH** | | |

## Notes

Use this space for any additional notes or observations:

---

Date Started: _______________
Date Completed: _______________
Total Sepolia ETH Used: _______________
Issues Encountered: _______________

---

**After completion, you can compare this Excel file with the IOTA results for your research.**
