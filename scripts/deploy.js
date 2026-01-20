const hre = require("hardhat");

async function main() {
  console.log("Deploying GameLeaderboard contract...");

  // Проверяем наличие приватного ключа
  if (!process.env.PRIVATE_KEY) {
    console.error("\n❌ Error: PRIVATE_KEY not found in .env file");
    console.error("Please create a .env file with your private key:");
    console.error("PRIVATE_KEY=your_private_key_here");
    console.error("BASE_SEPOLIA_RPC_URL=https://sepolia.base.org");
    process.exit(1);
  }

  // Получаем signer для отправки транзакций
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Проверяем баланс
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.warn("\n⚠️  Warning: Account balance is 0. You need ETH to deploy contracts.");
    console.warn("Get test ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
  }

  const GameLeaderboard = await hre.ethers.getContractFactory("GameLeaderboard");
  console.log("Deploying contract...");
  
  const leaderboard = await GameLeaderboard.deploy();

  await leaderboard.waitForDeployment();

  const address = await leaderboard.getAddress();
  console.log("\n✅ GameLeaderboard deployed to:", address);
  console.log("\n📝 Update NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
