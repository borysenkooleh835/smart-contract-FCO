import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Starting deployment to Sepolia testnet...\n");

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying from account:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy LoggingContract
  console.log("1. Deploying LoggingContract...");
  const loggingJson = JSON.parse(
    fs.readFileSync("./artifacts/contracts/LoggingContract.sol/LoggingContract.json", "utf8")
  );
  const LoggingFactory = new ethers.ContractFactory(loggingJson.abi, loggingJson.bytecode, wallet);
  const loggingContract = await LoggingFactory.deploy();
  await loggingContract.waitForDeployment();
  const loggingAddress = await loggingContract.getAddress();
  console.log("✓ LoggingContract deployed to:", loggingAddress);

  // Deploy PolicyContract
  console.log("\n2. Deploying PolicyContract...");
  const policyJson = JSON.parse(
    fs.readFileSync("./artifacts/contracts/PolicyContract.sol/PolicyContract.json", "utf8")
  );
  const PolicyFactory = new ethers.ContractFactory(policyJson.abi, policyJson.bytecode, wallet);
  const policyContract = await PolicyFactory.deploy();
  await policyContract.waitForDeployment();
  const policyAddress = await policyContract.getAddress();
  console.log("✓ PolicyContract deployed to:", policyAddress);

  // Deploy DroneContract
  console.log("\n3. Deploying DroneContract...");
  const droneJson = JSON.parse(
    fs.readFileSync("./artifacts/contracts/DroneContract.sol/DroneContract.json", "utf8")
  );
  const DroneFactory = new ethers.ContractFactory(droneJson.abi, droneJson.bytecode, wallet);
  const droneContract = await DroneFactory.deploy();
  await droneContract.waitForDeployment();
  const droneAddress = await droneContract.getAddress();
  console.log("✓ DroneContract deployed to:", droneAddress);

  // Deploy AttributeContract
  console.log("\n4. Deploying AttributeContract...");
  const attributeJson = JSON.parse(
    fs.readFileSync("./artifacts/contracts/AttributeContract.sol/AttributeContract.json", "utf8")
  );
  const AttributeFactory = new ethers.ContractFactory(attributeJson.abi, attributeJson.bytecode, wallet);
  const attributeContract = await AttributeFactory.deploy();
  await attributeContract.waitForDeployment();
  const attributeAddress = await attributeContract.getAddress();
  console.log("✓ AttributeContract deployed to:", attributeAddress);

  // Deploy PDP Contract
  console.log("\n5. Deploying PDP Contract...");
  const pdpJson = JSON.parse(
    fs.readFileSync("./artifacts/contracts/PDP.sol/PDP.json", "utf8")
  );
  const PDPFactory = new ethers.ContractFactory(pdpJson.abi, pdpJson.bytecode, wallet);
  const pdpContract = await PDPFactory.deploy(policyAddress, droneAddress, loggingAddress);
  await pdpContract.waitForDeployment();
  const pdpAddress = await pdpContract.getAddress();
  console.log("✓ PDP Contract deployed to:", pdpAddress);

  console.log("\n========================================");
  console.log("DEPLOYMENT SUMMARY");
  console.log("========================================");
  console.log("LoggingContract:", loggingAddress);
  console.log("PolicyContract:", policyAddress);
  console.log("DroneContract:", droneAddress);
  console.log("AttributeContract:", attributeAddress);
  console.log("PDP Contract:", pdpAddress);
  console.log("========================================");

  console.log("\nAdd these to your .env file:");
  console.log(`LOGGING_CONTRACT_ADDRESS=${loggingAddress}`);
  console.log(`POLICY_CONTRACT_ADDRESS=${policyAddress}`);
  console.log(`DRONE_CONTRACT_ADDRESS=${droneAddress}`);
  console.log(`ATTRIBUTE_CONTRACT_ADDRESS=${attributeAddress}`);
  console.log(`PDP_CONTRACT_ADDRESS=${pdpAddress}`);

  // Save to a file for automated updating
  const addresses = {
    LOGGING_CONTRACT_ADDRESS: loggingAddress,
    POLICY_CONTRACT_ADDRESS: policyAddress,
    DRONE_CONTRACT_ADDRESS: droneAddress,
    ATTRIBUTE_CONTRACT_ADDRESS: attributeAddress,
    PDP_CONTRACT_ADDRESS: pdpAddress
  };

  fs.writeFileSync('./deployed-addresses.json', JSON.stringify(addresses, null, 2));
  console.log("\n✓ Contract addresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
