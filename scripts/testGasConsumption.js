import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (ethereum folder)
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  console.log("Starting Gas Consumption Testing...\n");

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Using wallet:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  // Load contract addresses
  const pdpAddress = process.env.PDP_CONTRACT_ADDRESS;
  const droneAddress = process.env.DRONE_CONTRACT_ADDRESS;
  const policyAddress = process.env.POLICY_CONTRACT_ADDRESS;

  console.log("Contract addresses:");
  console.log("  PDP:", pdpAddress);
  console.log("  Drone:", droneAddress);
  console.log("  Policy:", policyAddress);
  console.log("");

  // Load contract ABIs (from parent directory)
  const pdpJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/PDP.sol/PDP.json"), "utf8"));
  const droneJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/DroneContract.sol/DroneContract.json"), "utf8"));
  const policyJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/PolicyContract.sol/PolicyContract.json"), "utf8"));

  // Create contract instances
  const pdp = new ethers.Contract(pdpAddress, pdpJson.abi, wallet);
  const drone = new ethers.Contract(droneAddress, droneJson.abi, wallet);
  const policy = new ethers.Contract(policyAddress, policyJson.abi, wallet);

  // Test parameters
  const levels = [0, 1, 2, 3];
  const totalTransactions = parseInt(process.env.GAS_TEST_TRANSACTIONS) || 2000;

  const results = {
    level0: { transactions: [], totalGas: 0, avgGas: 0 },
    level1: { transactions: [], totalGas: 0, avgGas: 0 },
    level2: { transactions: [], totalGas: 0, avgGas: 0 },
    level3: { transactions: [], totalGas: 0, avgGas: 0 }
  };

  // Setup test data
  console.log("Setting up test data...");
  const droneId = 0;
  const zone = 1;

  try {
    const tx1 = await drone.createDrone("TestDrone", zone);
    await tx1.wait();
    console.log("✓ Test drone created");
  } catch (error) {
    console.log("✓ Test drone already exists");
  }

  try {
    const tx2 = await policy.createPolicy(zone, "00:00:00", "23:59:59");
    await tx2.wait();
    console.log("✓ Test policy created\n");
  } catch (error) {
    console.log("✓ Test policy already exists\n");
  }

  // Run tests for each level
  for (const level of levels) {
    console.log(`\n========== Testing Level ${level} ==========`);
    console.log(`Running ${totalTransactions} transactions...\n`);

    for (let i = 0; i < totalTransactions; i++) {
      try {
        let tx;

        if (level === 0) {
          tx = await pdp.level0EvaluateAccess(droneId, "TestDrone", zone, "00:00:00", "23:59:59", true);
        } else if (level === 1) {
          tx = await pdp.level1EvaluateAccess(droneId, "TestDrone", zone, "00:00:00", "23:59:59");
        } else if (level === 2) {
          tx = await pdp.level2EvaluateAccess(droneId, "TestDrone", zone);
        } else if (level === 3) {
          tx = await pdp.level3EvaluateAccess(droneId);
        }

        const receipt = await tx.wait();
        const gasUsed = Number(receipt.gasUsed);

        results[`level${level}`].transactions.push({
          txNumber: i + 1,
          gasUsed,
          txHash: receipt.hash
        });

        results[`level${level}`].totalGas += gasUsed;

        if ((i + 1) % 100 === 0) {
          console.log(`  Progress: ${i + 1}/${totalTransactions} completed`);
          console.log(`  Avg gas: ${(results[`level${level}`].totalGas / (i + 1)).toFixed(2)}`);

          // Save every 100 tx
          const outputPath = path.join(__dirname, "../test-results/gasConsumption.json");
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        }
      } catch (error) {
        console.error(`  TX ${i + 1} failed: ${error.message.substring(0, 80)}`);

        // Save progress on error
        const outputPath = path.join(__dirname, "../test-results/gasConsumption.json");
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (results[`level${level}`].transactions.length > 0) {
      results[`level${level}`].avgGas =
        results[`level${level}`].totalGas / results[`level${level}`].transactions.length;
    }

    console.log(`\nLevel ${level} completed:`);
    console.log(`  Successful: ${results[`level${level}`].transactions.length}`);
    console.log(`  Total Gas: ${results[`level${level}`].totalGas}`);
    console.log(`  Avg Gas: ${results[`level${level}`].avgGas.toFixed(2)}`);

    const outputPath = path.join(__dirname, "../test-results/gasConsumption.json");
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`  ✓ Saved to gasConsumption.json`);
  }

  console.log("\n========================================");
  console.log("✓ Gas consumption testing completed!");
  console.log("========================================\n");

  console.log("SUMMARY:");
  for (const level of levels) {
    console.log(`Level ${level}: ${results[`level${level}`].transactions.length} successful transactions`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
