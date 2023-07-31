const hre = require("hardhat");

async function main() {
  // Deploy SimpleFunding Contract
  const SimpleFunding = await hre.ethers.getContractFactory("SimpleFunding");
  const SimpleFundingInstance = await SimpleFunding.deploy();
  await SimpleFundingInstance.deployed();

  // Deploy Proxy Contract
  const Proxy = await hre.ethers.getContractFactory("SimpleFundingProxy");
  const ProxyInstance = await Proxy.deploy();
  await ProxyInstance.deployed();

  // Update setImplementation on Proxy Contract
  await ProxyInstance.setImplementation(SimpleFundingInstance.address);

  console.log(ProxyInstance.address, SimpleFundingInstance.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
