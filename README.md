## tips

1. origin function withdraw does't work. The value exchange by computation which need to divide by 1e18.

```solidity
      uint256 individualBalance = balances[msg.sender];
        console.log(individualBalance);
        uint256 indBalanceRewards = individualBalance +
            ((block.timestamp - depositTimestamps[msg.sender]) *
                rewardRatePerSecond)/1e18;
        console.log(indBalanceRewards);
        balances[msg.sender] = 0;
        (bool sent, bytes memory data) = payable(msg.sender).call{
            value: indBalanceRewards
        }("");
```

2. The rule that `Instead of using the vanilla ExampleExternalContract contract, implement a function in Staker.sol that allows you to retrieve the ETH locked up in ExampleExternalContract and re-deposit it back into the Staker contract.Make sure that you create logic/remove existing code to ensure that users are able to interact with the Staker contract over and over again! We want to be able to ping-pong from Staker -> ExampleExternalContract repeatedly`

```solidity
  \\Staker.sol
  function retrieve() public OnlyWhitelisted isCompleted {
        withdrawalDeadLine = block.timestamp + 120 seconds;
        claimDeadline = block.timestamp + 240 seconds;
        exampleExternalContract.retrieveStaker();
    }

  \\ExampleExternalContract.sol
  function retrieveStaker() public payable {
        require(completed == true, "completed!");
        completed = false;
        bool sent = payable(msg.sender).send(address(this).balance);
        require(sent, "RIP;withdrawal failed :( ");
    }
```

**Contract interact each other that use "msg.sender" to replace the contract**
