import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import { HardhatUserConfig } from "hardhat/config";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const config: HardhatUserConfig = {
  networks: {
    bsc: {
      url: process.env.bscRpc || "https://bsc-dataseed.binance.org/",
      accounts: [process.env["PRIVATE_KEY"]],
    },
    arbitrum: {
      url: process.env.arbitrumRpc || "https://arb1.arbitrum.io/rpc",
      accounts: [process.env["PRIVATE_KEY"]],
    },
    kovan: {
      url: process.env.kovan || "https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      accounts: [process.env["Privatkey_testing"]],
    },
  },
  etherscan: {
    // Your API key to verify the contracts
    apiKey: process.env["API_KEY"],
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
    },
  },
};

export default config;
