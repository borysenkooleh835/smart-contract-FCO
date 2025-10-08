import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function exportToExcel() {
  console.log("Exporting test results to Excel...\n");

  // Load JSON results
  const responseTimePath = path.join(__dirname, "../test-results/responseTime.json");
  const gasConsumptionPath = path.join(__dirname, "../test-results/gasConsumption.json");

  if (!fs.existsSync(responseTimePath)) {
    console.error("Error: Response time results not found. Please run response time tests first.");
    process.exit(1);
  }

  const responseTimeData = JSON.parse(fs.readFileSync(responseTimePath, "utf8"));

  // Check if gas data exists
  let gasData = null;
  let hasGasData = false;
  if (fs.existsSync(gasConsumptionPath)) {
    gasData = JSON.parse(fs.readFileSync(gasConsumptionPath, "utf8"));
    // Check if gas data actually has transactions
    hasGasData = gasData.level0 && gasData.level0.transactions && gasData.level0.transactions.length > 0;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // ===== Response Time Sheets (one per level) =====
  console.log("Creating response time sheets...");
  for (let level = 0; level <= 3; level++) {
    const levelData = responseTimeData[`level${level}`];

    if (!levelData || levelData.length === 0) {
      console.log(`  Warning: No data for Level ${level} response time`);
      continue;
    }

    // Organize data by transaction count
    const organized = {};
    levelData.forEach((item) => {
      if (!organized[item.txCount]) {
        organized[item.txCount] = [];
      }
      organized[item.txCount].push(item.responseTime);
    });

    // Create sheet data
    const sheetData = [];
    sheetData.push(["Transaction Count", "Rep 1", "Rep 2", "Rep 3", "Rep 4", "Rep 5", "Rep 6", "Rep 7", "Rep 8", "Rep 9", "Rep 10", "Average"]);

    Object.keys(organized).sort((a, b) => Number(a) - Number(b)).forEach((txCount) => {
      const times = organized[txCount];
      const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
      sheetData.push([Number(txCount), ...times, avg.toFixed(2)]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Level ${level} Response Time`);
    console.log(`  ✓ Level ${level} response time sheet created (${Object.keys(organized).length} transaction counts)`);
  }

  // ===== Gas Consumption Sheet =====
  if (hasGasData) {
    console.log("\nCreating gas consumption sheets...");
    const gasSheetData = [];
    gasSheetData.push(["Level", "Total Transactions", "Total Gas Used", "Average Gas per Transaction"]);

    for (let level = 0; level <= 3; level++) {
      const levelGas = gasData[`level${level}`];
      const avgGas = levelGas.avgGas || 0;
      gasSheetData.push([
        `Level ${level}`,
        levelGas.transactions.length,
        levelGas.totalGas,
        avgGas > 0 ? avgGas.toFixed(2) : "N/A"
      ]);
    }

    const gasWorksheet = XLSX.utils.aoa_to_sheet(gasSheetData);
    XLSX.utils.book_append_sheet(workbook, gasWorksheet, "Gas Consumption Summary");

    // ===== Detailed Gas Consumption (first 100 transactions per level) =====
    for (let level = 0; level <= 3; level++) {
      const levelGas = gasData[`level${level}`];
      if (levelGas.transactions.length > 0) {
        const detailedData = [];
        detailedData.push(["Transaction #", "Gas Used", "Transaction Hash"]);

        // Include first 100 transactions for detail
        levelGas.transactions.slice(0, 100).forEach((tx) => {
          detailedData.push([tx.txNumber, tx.gasUsed, tx.txHash]);
        });

        const detailWorksheet = XLSX.utils.aoa_to_sheet(detailedData);
        XLSX.utils.book_append_sheet(workbook, detailWorksheet, `Level ${level} Gas Detail`);
        console.log(`  ✓ Level ${level} gas detail sheet created (${levelGas.transactions.length} transactions)`);
      }
    }
  } else {
    console.log("\n⚠️  Warning: No gas consumption data found.");
    console.log("    Gas consumption tests have not been run yet.");
    console.log("    Only response time data will be included in Excel.\n");

    // Add a placeholder sheet
    const placeholderData = [
      ["Gas Consumption Tests - NOT YET RUN"],
      [""],
      ["To complete this report:"],
      ["1. Run: node scripts/testGasConsumption.js"],
      ["2. Wait for completion (12-20 hours)"],
      ["3. Re-run: npm run export-excel"],
      [""],
      ["Status", "Pending"],
      ["Expected Duration", "12-20 hours"],
      ["Transactions per Level", "2000"]
    ];
    const placeholderSheet = XLSX.utils.aoa_to_sheet(placeholderData);
    XLSX.utils.book_append_sheet(workbook, placeholderSheet, "Gas Tests - PENDING");
  }

  // Save the workbook
  const outputPath = path.join(__dirname, "../test-results/ethereum-test-results.xlsx");
  XLSX.writeFile(workbook, outputPath);

  console.log("\n========================================");
  console.log("✓ Excel export completed!");
  console.log(`  File: ${outputPath}`);
  console.log("========================================\n");

  console.log("Workbook contains:");
  if (hasGasData) {
    console.log("  ✓ 4 sheets for Response Time (one per level)");
    console.log("  ✓ 1 sheet for Gas Consumption Summary");
    console.log("  ✓ 4 sheets for detailed Gas Consumption (one per level)");
    console.log("\n✓ COMPLETE - All data included");
  } else {
    console.log("  ✓ 4 sheets for Response Time (one per level)");
    console.log("  ⚠️  1 placeholder sheet for Gas Tests (pending)");
    console.log("\n⚠️  PARTIAL - Gas consumption tests still needed");
    console.log("\nTo complete:");
    console.log("  1. Run: node scripts/testGasConsumption.js");
    console.log("  2. Re-run: npm run export-excel");
  }
}

exportToExcel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
