import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportToExcel() {
  console.log("Exporting test results to Excel...\n");

  // Load JSON results
  const responseTimePath = path.join(__dirname, "../test-results/responseTime.json");
  const gasConsumptionPath = path.join(__dirname, "../test-results/gasConsumption.json");

  if (!fs.existsSync(responseTimePath) || !fs.existsSync(gasConsumptionPath)) {
    console.error("Error: Test results not found. Please run tests first.");
    process.exit(1);
  }

  const responseTimeData = JSON.parse(fs.readFileSync(responseTimePath, "utf8"));
  const gasData = JSON.parse(fs.readFileSync(gasConsumptionPath, "utf8"));

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // ===== Response Time Sheets (one per level) =====
  for (let level = 0; level <= 3; level++) {
    const levelData = responseTimeData[`level${level}`];

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
  }

  // ===== Gas Consumption Sheet =====
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

  // ===== Detailed Gas Consumption (first 100 transactions per level) =====
  for (let level = 0; level <= 3; level++) {
    const levelGas = gasData[`level${level}`];
    const detailedData = [];
    detailedData.push(["Transaction #", "Gas Used", "Transaction Hash"]);

    // Include first 100 transactions for detail
    levelGas.transactions.slice(0, 100).forEach((tx) => {
      detailedData.push([tx.txNumber, tx.gasUsed, tx.txHash]);
    });

    const detailWorksheet = XLSX.utils.aoa_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailWorksheet, `Level ${level} Gas Detail`);
  }

  // Save the workbook
  const outputPath = path.join(__dirname, "../test-results/ethereum-test-results.xlsx");
  XLSX.writeFile(workbook, outputPath);

  console.log("========================================");
  console.log("Excel export completed!");
  console.log(`File saved to: ${outputPath}`);
  console.log("========================================\n");

  console.log("Workbook contains:");
  console.log("- 4 sheets for Response Time (one per level)");
  console.log("- 1 sheet for Gas Consumption Summary");
  console.log("- 4 sheets for detailed Gas Consumption (one per level)");
}

exportToExcel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
