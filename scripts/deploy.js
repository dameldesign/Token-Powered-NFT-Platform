const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Lisk Sepolia...");

  // Deploy CreatorToken first
  const CreatorToken = await hre.ethers.getContractFactory("CreatorToken");
  const creatorToken = await CreatorToken.deploy();
  await creatorToken.waitForDeployment();
  
  const creatorTokenAddress = await creatorToken.getAddress();
  console.log(`CreatorToken deployed to: ${creatorTokenAddress}`);

  // Deploy ArtNFT with CreatorToken address
  const ArtNFT = await hre.ethers.getContractFactory("ArtNFT");
  const artNFT = await ArtNFT.deploy(creatorTokenAddress);
  await artNFT.waitForDeployment();
  
  const artNFTAddress = await artNFT.getAddress();
  console.log(`ArtNFT deployed to: ${artNFTAddress}`);
  
  // Transfer ownership of CreatorToken to ArtNFT
  const tx = await creatorToken.transferOwnership(artNFTAddress);
  await tx.wait();
  console.log(`Ownership of CreatorToken transferred to ArtNFT contract`);

  console.log("Deployment complete!");
  
  // Write the contract addresses to a file for the frontend
  const fs = require("fs");
  const contractAddresses = {
    creatorToken: creatorTokenAddress,
    artNFT: artNFTAddress
  };
  
  fs.writeFileSync(
    "./src/contracts/contractAddresses.json",
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("Contract addresses saved to src/contracts/contractAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });