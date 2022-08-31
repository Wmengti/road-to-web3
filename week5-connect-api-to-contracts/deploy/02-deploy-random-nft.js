const { network, deployments, getNamedAccounts } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
  subscriptionId = networkConfig[chainId].subscriptionId;
  arguments = [
    networkConfig[chainId].UPDATE_INTERVAL_SEC,
    networkConfig[chainId]["ethUsdPriceFeed"],
    networkConfig[chainId].vrfCoordinatorV2,
  ];
  const randombullbear = await deploy("RandomBullBear", {
    from: deployer,
    args: arguments,
    log: true,
  });
};

module.exports.tags = ["randomnft", "all"];
