require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");
require("@nomiclabs/hardhat-etherscan");
/** @type import('hardhat/config').HardhatUserConfig */

// set proxy
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890"); // change to yours
setGlobalDispatcher(proxyAgent);

module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      chainId: 4,
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      rinkeby: process.env.ETHERSCAN_API_KEY,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
};
