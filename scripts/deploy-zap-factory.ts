import hre from "hardhat";
import { writeFileSync } from "fs";

const outputFilePath = `./deployments/${hre.network.name}.json`;

async function main() {
  console.log("Started");
  const ZapFactory = await hre.ethers.getContractFactory("ZapFactory");
  const zapFactory = await ZapFactory.deploy();
  await zapFactory.deployed();
  console.log("ZapFactory deployed to:", zapFactory.address);

  const output = {
    ZapFactory: zapFactory.address,
  };
  writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
