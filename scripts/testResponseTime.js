import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Starting Response Time Testing...\n");

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Load contract addresses
  const pdpAddress = process.env.PDP_CONTRACT_ADDRESS;
  const droneAddress = process.env.DRONE_CONTRACT_ADDRESS;
  const policyAddress = process.env.POLICY_CONTRACT_ADDRESS;

  if (!pdpAddress || !droneAddress || !policyAddress) {
    throw new Error("Please set contract addresses in .env file");
  }

  // Load contract ABIs
  const pdpJson = JSON.parse(fs.readFileSync("./artifacts/contracts/PDP.sol/PDP.json", "utf8"));
  const droneJson = JSON.parse(fs.readFileSync("./artifacts/contracts/DroneContract.sol/DroneContract.json", "utf8"));
  const policyJson = JSON.parse(fs.readFileSync("./artifacts/contracts/PolicyContract.sol/PolicyContract.json", "utf8"));

  // Create contract instances
  const pdp = new ethers.Contract(pdpAddress, pdpJson.abi, wallet);
  const drone = new ethers.Contract(droneAddress, droneJson.abi, wallet);
  const policy = new ethers.Contract(policyAddress, policyJson.abi, wallet);

  // Test parameters
  const levels = [0, 1, 2, 3];
  const maxTx = parseInt(process.env.RESPONSE_TIME_MAX_TX) || 20;
  const txCounts = Array.from({ length: maxTx }, (_, i) => i + 1);
  const repetitions = parseInt(process.env.RESPONSE_TIME_REPETITIONS) || 10;

  const results = {
    level0: [],
    level1: [],
    level2: [],
    level3: []
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
    console.log("Test data might already exist:", error.message.substring(0, 100));
  }

  // Run tests for each level
  for (const level of levels) {
    console.log(`\n========== Testing Level ${level} ==========`);

    for (const txCount of txCounts) {
      console.log(`\nTesting ${txCount} transaction(s)...`);

      for (let rep = 0; rep < repetitions; rep++) {
        const startTime = Date.now();

        try {
          for (let i = 0; i < txCount; i++) {
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

            await tx.wait();
          }

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          results[`level${level}`].push({
            txCount,
            repetition: rep + 1,
            responseTime
          });

          console.log(`  Rep ${rep + 1}: ${responseTime}ms`);
        } catch (error) {
          console.error(`  Rep ${rep + 1}: Error - ${error.message.substring(0, 100)}`);
        }
      }
    }
  }

  // Save results to JSON
  const outputPath = path.join(__dirname, "../test-results/responseTime.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log("\n========================================");
  console.log("Response time testing completed!");
  console.log(`Results saved to: ${outputPath}`);
  console.log("========================================\n");

  // Generate summary statistics
  console.log("SUMMARY STATISTICS:");
  for (const level of levels) {
    const levelData = results[`level${level}`];
    if (levelData.length > 0) {
      const avg = levelData.reduce((sum, r) => sum + r.responseTime, 0) / levelData.length;
      console.log(`Level ${level} - Average: ${avg.toFixed(2)}ms (${levelData.length} tests)`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
