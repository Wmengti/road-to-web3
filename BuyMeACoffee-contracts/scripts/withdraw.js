const { ethers } = require("hardhat");
const abi = require("../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json");

async function getBalance(provider, address) {
  const balanceBigInt = await provider.getBalance(address);
  return ethers.utils.formatEther(balanceBigInt);
}

async function main() {
  const contractAddress = "0x1Fc7D909Ca0544FDD2E46F940C95FfD82B905893";
  const contractABI = abi.abi;

  const provider = new ethers.providers.AlchemyProvider(
    "goerli",
    process.env.GOERLI_API_KEY
  );

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const buyMeACoffee = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  console.log(
    "current balance of owner:",
    await getBalance(provider, signer.address),
    "ETH"
  );
  const contractBalance = await getBalance(provider, buyMeACoffee.address);
  console.log(
    "current balance of contract: ",
    await getBalance(provider, buyMeACoffee.address),
    "ETH"
  );

  if (contractBalance !== "0.0") {
    console.log("withdrawing funds..");
    // const withdrawTxn = await buyMeACoffee.withdrawTips();
    const withdrawTxn = await buyMeACoffee.withdrawByOthers(
      "0x55C76828DF0ef0EB13DEA4503C8FAad51Abd00Ad"
    );
    await withdrawTxn.wait();
  } else {
    console.log("no funds to withdraw!");
  }
  // Check ending balance.
  console.log(
    "current balance of owner: ",
    await getBalance(provider, signer.address),
    "ETH"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
