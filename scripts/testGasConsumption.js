import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Starting Gas Consumption Testing...\n");

  // Load contract addresses from environment
  const pdpAddress = process.env.PDP_CONTRACT_ADDRESS;
  const droneAddress = process.env.DRONE_CONTRACT_ADDRESS;
  const policyAddress = process.env.POLICY_CONTRACT_ADDRESS;

  if (!pdpAddress || !droneAddress || !policyAddress) {
    throw new Error("Please set contract addresses in .env file");
  }

  // Get contract instances
  const PDP = await hre.ethers.getContractFactory("PDP");
  const pdp = PDP.attach(pdpAddress);

  const DroneContract = await hre.ethers.getContractFactory("DroneContract");
  const drone = DroneContract.attach(droneAddress);

  const PolicyContract = await hre.ethers.getContractFactory("PolicyContract");
  const policy = PolicyContract.attach(policyAddress);

  // Test parameters
  const levels = [0, 1, 2, 3]; // 4 levels
  const totalTransactions = 2000;

  const results = {
    level0: { transactions: [], totalGas: 0, avgGas: 0 },
    level1: { transactions: [], totalGas: 0, avgGas: 0 },
    level2: { transactions: [], totalGas: 0, avgGas: 0 },
    level3: { transactions: [], totalGas: 0, avgGas: 0 }
  };

  // Setup: Create a drone and policy for testing
  console.log("Setting up test data...");
  const droneId = 0;
  const zone = 1;

  try {
    const tx1 = await drone.createDrone("TestDrone", zone);
    await tx1.wait();
    console.log("✓ Test drone created");

    const tx2 = await policy.createPolicy(zone, "00:00:00", "23:59:59");
    await tx2.wait();
    console.log("✓ Test policy created\n");
  } catch (error) {
    console.log("Test data already exists or error:", error.message);
  }

  // Run gas consumption tests for each level
  for (const level of levels) {
    console.log(`\n========== Testing Level ${level} ==========`);
    console.log(`Running ${totalTransactions} transactions...\n`);

    for (let i = 0; i < totalTransactions; i++) {
      try {
        let tx;

        if (level === 0) {
          tx = await pdp.level0EvaluateAccess(
            droneId,
            "TestDrone",
            zone,
            "00:00:00",
            "23:59:59",
            true
          );
        } else if (level === 1) {
          tx = await pdp.level1EvaluateAccess(
            droneId,
            "TestDrone",
            zone,
            "00:00:00",
            "23:59:59"
          );
        } else if (level === 2) {
          tx = await pdp.level2EvaluateAccess(
            droneId,
            "TestDrone",
            zone
          );
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
          console.log(`  Progress: ${i + 1}/${totalTransactions} transactions completed`);
        }
      } catch (error) {
        console.error(`  Transaction ${i + 1} failed: ${error.message}`);
      }
    }

    // Calculate average gas
    results[`level${level}`].avgGas =
      results[`level${level}`].totalGas / results[`level${level}`].transactions.length;

    console.log(`\nLevel ${level} completed:`);
    console.log(`  Total Gas: ${results[`level${level}`].totalGas}`);
    console.log(`  Average Gas: ${results[`level${level}`].avgGas.toFixed(2)}`);
  }

  // Save results to JSON
  const outputPath = path.join(__dirname, "../test-results/gasConsumption.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log("\n========================================");
  console.log("Gas consumption testing completed!");
  console.log(`Results saved to: ${outputPath}`);
  console.log("========================================\n");

  // Generate summary
  console.log("GAS CONSUMPTION SUMMARY:");
  for (const level of levels) {
    console.log(`Level ${level}:`);
    console.log(`  Total Transactions: ${results[`level${level}`].transactions.length}`);
    console.log(`  Total Gas Used: ${results[`level${level}`].totalGas}`);
    console.log(`  Average Gas per Transaction: ${results[`level${level}`].avgGas.toFixed(2)}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
