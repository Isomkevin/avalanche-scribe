async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const AICredits = await ethers.getContractFactory("AICredits");
  const aiCredits = await AICredits.deploy(1000);

  console.log("AICredits deployed to:", aiCredits.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
