import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import XLSX from "xlsx";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// RESPONSE TIME TESTING
// ============================================
async function runResponseTimeTests() {
  console.log("\n========================================");
  console.log("STARTING RESPONSE TIME TESTS");
  console.log("========================================\n");

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const pdpAddress = process.env.PDP_CONTRACT_ADDRESS;
  const droneAddress = process.env.DRONE_CONTRACT_ADDRESS;
  const policyAddress = process.env.POLICY_CONTRACT_ADDRESS;

  const pdpJson = JSON.parse(fs.readFileSync("./artifacts/contracts/PDP.sol/PDP.json", "utf8"));
  const droneJson = JSON.parse(fs.readFileSync("./artifacts/contracts/DroneContract.sol/DroneContract.json", "utf8"));
  const policyJson = JSON.parse(fs.readFileSync("./artifacts/contracts/PolicyContract.sol/PolicyContract.json", "utf8"));

  const pdp = new ethers.Contract(pdpAddress, pdpJson.abi, wallet);
  const drone = new ethers.Contract(droneAddress, droneJson.abi, wallet);
  const policy = new ethers.Contract(policyAddress, policyJson.abi, wallet);

  const levels = [0, 1, 2, 3];
  const txCounts = Array.from({ length: 20 }, (_, i) => i + 1);
  const repetitions = 10;

  const results = {
    level0: [],
    level1: [],
    level2: [],
    level3: []
  };

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
    console.log("Test data might already exist\n");
  }

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

  const outputPath = path.join(__dirname, "../test-results/responseTime.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log("\n========================================");
  console.log("✓ Response time testing completed!");
  console.log("========================================\n");

  return results;
}

// ============================================
// GAS CONSUMPTION TESTING
// ============================================
async function runGasConsumptionTests() {
  console.log("\n========================================");
  console.log("STARTING GAS CONSUMPTION TESTS");
  console.log("========================================\n");

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const pdpAddress = process.env.PDP_CONTRACT_ADDRESS;
  const droneAddress = process.env.DRONE_CONTRACT_ADDRESS;
  const policyAddress = process.env.POLICY_CONTRACT_ADDRESS;

  const pdpJson = JSON.parse(fs.readFileSync("./artifacts/contracts/PDP.sol/PDP.json", "utf8"));
  const droneJson = JSON.parse(fs.readFileSync("./artifacts/contracts/DroneContract.sol/DroneContract.json", "utf8"));
  const policyJson = JSON.parse(fs.readFileSync("./artifacts/contracts/PolicyContract.sol/PolicyContract.json", "utf8"));

  const pdp = new ethers.Contract(pdpAddress, pdpJson.abi, wallet);
  const drone = new ethers.Contract(droneAddress, droneJson.abi, wallet);
  const policy = new ethers.Contract(policyAddress, policyJson.abi, wallet);

  const levels = [0, 1, 2, 3];
  const totalTransactions = 2000;

  const results = {
    level0: { transactions: [], totalGas: 0, avgGas: 0 },
    level1: { transactions: [], totalGas: 0, avgGas: 0 },
    level2: { transactions: [], totalGas: 0, avgGas: 0 },
    level3: { transactions: [], totalGas: 0, avgGas: 0 }
  };

  const droneId = 0;
  const zone = 1;

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
          console.log(`  Progress: ${i + 1}/${totalTransactions} transactions completed`);
        }
      } catch (error) {
        console.error(`  Transaction ${i + 1} failed: ${error.message.substring(0, 100)}`);
      }
    }

    results[`level${level}`].avgGas = results[`level${level}`].totalGas / results[`level${level}`].transactions.length;

    console.log(`\nLevel ${level} completed:`);
    console.log(`  Total Gas: ${results[`level${level}`].totalGas}`);
    console.log(`  Average Gas: ${results[`level${level}`].avgGas.toFixed(2)}`);
  }

  const outputPath = path.join(__dirname, "../test-results/gasConsumption.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log("\n========================================");
  console.log("✓ Gas consumption testing completed!");
  console.log("========================================\n");

  return results;
}

// ============================================
// EXCEL GENERATION
// ============================================
async function generateExcel() {
  console.log("\n========================================");
  console.log("GENERATING EXCEL REPORT");
  console.log("========================================\n");

  const responseTimePath = path.join(__dirname, "../test-results/responseTime.json");
  const gasConsumptionPath = path.join(__dirname, "../test-results/gasConsumption.json");

  const responseTimeData = JSON.parse(fs.readFileSync(responseTimePath, "utf8"));
  const gasData = JSON.parse(fs.readFileSync(gasConsumptionPath, "utf8"));

  const workbook = XLSX.utils.book_new();

  // Response Time Sheets
  for (let level = 0; level <= 3; level++) {
    const levelData = responseTimeData[`level${level}`];
    const organized = {};

    levelData.forEach((item) => {
      if (!organized[item.txCount]) {
        organized[item.txCount] = [];
      }
      organized[item.txCount].push(item.responseTime);
    });

    const sheetData = [];
    sheetData.push(["Transaction Count", "Rep 1", "Rep 2", "Rep 3", "Rep 4", "Rep 5", "Rep 6", "Rep 7", "Rep 8", "Rep 9", "Rep 10", "Average"]);

    Object.keys(organized).sort((a, b) => Number(a) - Number(b)).forEach((txCount) => {
      const times = organized[txCount];
      const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
      sheetData.push([Number(txCount), ...times, avg.toFixed(2)]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Level ${level} Response Time`);
  }

  // Gas Consumption Summary
  const gasSheetData = [];
  gasSheetData.push(["Level", "Total Transactions", "Total Gas Used", "Average Gas per Transaction"]);

  for (let level = 0; level <= 3; level++) {
    const levelGas = gasData[`level${level}`];
    gasSheetData.push([
      `Level ${level}`,
      levelGas.transactions.length,
      levelGas.totalGas,
      levelGas.avgGas.toFixed(2)
    ]);
  }

  const gasWorksheet = XLSX.utils.aoa_to_sheet(gasSheetData);
  XLSX.utils.book_append_sheet(workbook, gasWorksheet, "Gas Consumption Summary");

  // Detailed Gas Data
  for (let level = 0; level <= 3; level++) {
    const levelGas = gasData[`level${level}`];
    const detailedData = [];
    detailedData.push(["Transaction #", "Gas Used", "Transaction Hash"]);

    levelGas.transactions.slice(0, 100).forEach((tx) => {
      detailedData.push([tx.txNumber, tx.gasUsed, tx.txHash]);
    });

    const detailWorksheet = XLSX.utils.aoa_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailWorksheet, `Level ${level} Gas Detail`);
  }

  const outputPath = path.join(__dirname, "../test-results/ethereum-test-results.xlsx");
  XLSX.writeFile(workbook, outputPath);

  console.log("✓ Excel report generated!");
  console.log(`  File: ${outputPath}`);
  console.log("========================================\n");
}

// ============================================
// MAIN EXECUTION
// ============================================
async function main() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                                                            ║");
  console.log("║      ETHEREUM PERFORMANCE TESTING - COMPLETE SUITE         ║");
  console.log("║                                                            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\n");
  console.log("This will run ALL tests and generate the Excel report.");
  console.log("Estimated time: 15-24 hours");
  console.log("\n");

  const startTime = Date.now();

  try {
    // Step 1: Response Time Tests
    console.log("STEP 1/3: Response Time Tests (2-3 hours)");
    await runResponseTimeTests();

    // Step 2: Gas Consumption Tests
    console.log("\nSTEP 2/3: Gas Consumption Tests (12-20 hours)");
    await runGasConsumptionTests();

    // Step 3: Generate Excel
    console.log("\nSTEP 3/3: Generate Excel Report");
    await generateExcel();

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000 / 60 / 60; // hours

    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                                                            ║");
    console.log("║              ✓ ALL TESTS COMPLETED SUCCESSFULLY            ║");
    console.log("║                                                            ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("\n");
    console.log(`Total Time: ${totalTime.toFixed(2)} hours`);
    console.log("\nResults:");
    console.log("  - test-results/responseTime.json");
    console.log("  - test-results/gasConsumption.json");
    console.log("  - test-results/ethereum-test-results.xlsx");
    console.log("\n✓ Project delivery complete!");
    console.log("\n");

  } catch (error) {
    console.error("\n❌ Error occurred:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
