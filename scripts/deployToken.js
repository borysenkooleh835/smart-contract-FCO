import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Deploying Test Token to Sepolia...\n");

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying from account:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Read compiled contract
  const contractJson = JSON.parse(
    fs.readFileSync("./artifacts/contracts/TestToken.sol/TestToken.json", "utf8")
  );

  // Deploy contract
  console.log("Deploying TestToken contract...");
  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );

  const token = await factory.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("✓ TestToken deployed to:", tokenAddress);

  // Get token info
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();
  const deployerBalance = await token.balanceOf(wallet.address);

  console.log("\n========================================");
  console.log("TOKEN DEPLOYMENT SUMMARY");
  console.log("========================================");
  console.log("Contract Address:", tokenAddress);
  console.log("Token Name:", name);
  console.log("Token Symbol:", symbol);
  console.log("Decimals:", decimals);
  console.log("Total Supply:", ethers.formatEther(totalSupply), symbol);
  console.log("Your Balance:", ethers.formatEther(deployerBalance), symbol);
  console.log("========================================\n");

  console.log("TOKEN CONTRACT ADDRESS:");
  console.log(tokenAddress);

  console.log("\n✓ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
