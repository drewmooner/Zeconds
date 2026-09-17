import { defineConfig } from "hardhat/config";

export default defineConfig({
  solidity: {
    version: "0.8.34",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    robinhoodTestnet: {
      type: "http",
      chainType: "op",
      url: "https://rpc.testnet.chain.robinhood.com",
    },
    robinhood: {
      type: "http",
      chainType: "op",
      url: "https://rpc.mainnet.chain.robinhood.com",
    },
  },
});
