const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy CreatorToken first
  const CreatorToken = await hre.ethers.getContractFactory("CreatorToken");
  const creatorToken = await CreatorToken.deploy();
  await creatorToken.waitForDeployment();
  
  const creatorTokenAddress = await creatorToken.getAddress();
  console.log("CreatorToken deployed to:", creatorTokenAddress);

  // Deploy ArtNFT with CreatorToken address
  const ArtNFT = await hre.ethers.getContractFactory("ArtNFT");
  const artNFT = await ArtNFT.deploy(creatorTokenAddress);
  await artNFT.waitForDeployment();
  
  const artNFTAddress = await artNFT.getAddress();
  console.log("ArtNFT deployed to:", artNFTAddress);

  // Transfer ownership of CreatorToken to ArtNFT contract
  console.log("Transferring CreatorToken ownership to ArtNFT...");
  await creatorToken.transferOwnership(artNFTAddress);
  console.log("Ownership transferred!");

  console.log("\n=== Deployment Summary ===");
  console.log("CreatorToken Address:", creatorTokenAddress);
  console.log("ArtNFT Address:", artNFTAddress);
  console.log("\n=== Environment Variables ===");
  console.log("Add these to your .env file:");
  console.log(`VITE_CREATOR_TOKEN_ADDRESS=${creatorTokenAddress}`);
  console.log(`VITE_ART_NFT_ADDRESS=${artNFTAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
