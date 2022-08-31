const { run, network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("-------------------------------------");
  arguments = [];
  const basicNft = await deploy("BasicBullBear", {
    from: deployer,
    args: arguments,
    log: true,
  });
};

module.exports.tags = ["basicnft", "all"];
