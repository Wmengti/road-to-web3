// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

contract Staker {
    uint256 public constant rewardRatePerSecond = 0.1 ether;
    uint256 public withdrawalDeadLine = block.timestamp + 120 seconds;
    uint256 public claimDeadline = block.timestamp + 240 seconds;
    uint256 public currentBlock = 0;
    uint256 public exponentNumber = 2;
    address public whitelist = 0xc2553940C347C006A678Ebd31ce5Edc90eEBF88f;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public depositTimestamps;
    ExampleExternalContract public exampleExternalContract;

    event Stake(address indexed sender, uint256 amount);
    event Received(address, uint);
    event Execute(address indexed sender, uint256 amount);

    constructor(address exampleExternalContractAddress) {
        exampleExternalContract = ExampleExternalContract(
            exampleExternalContractAddress
        );
    }

    modifier withdrawalDeadLineReached(bool requireReached) {
        uint256 timeRemaining = withdrawalTimeLeft();
        if (requireReached) {
            require(timeRemaining == 0, "Withdrawal period is not reached yet");
        } else {
            require(timeRemaining > 0, "Withdrawal period has been reached");
        }
        _;
    }

    modifier claimDeadlineReached(bool requireReached) {
        uint256 timeRemaining = claimPeriodLeft();
        if (requireReached) {
            require(timeRemaining == 0, "Claim deadline is not reached yet");
        } else {
            require(timeRemaining > 0, "Claim deadline has been reached");
        }
        _;
    }

    modifier notCompleted() {
        bool completed = exampleExternalContract.completed();
        require(!completed, "Stake already completed!");
        _;
    }
    modifier isCompleted() {
        bool completed = exampleExternalContract.completed();
        require(completed, "Stake is not completed!");
        _;
    }
    modifier OnlyWhitelisted() {
        require(whitelist == msg.sender, "You are not whitelist!");
        _;
    }

    // Collect funds in a payable `stake()` function and track individual `balances` with a mapping:
    // ( Make sure to add a `Stake(address,uint256)` event and emit it for the frontend <List/> display )
    function stake() public payable withdrawalDeadLineReached(false) {
        balances[msg.sender] = balances[msg.sender] + msg.value;
        depositTimestamps[msg.sender] = block.timestamp;
        emit Stake(msg.sender, msg.value);
    }

    // After some `deadline` allow anyone to call an `execute()` function
    // If the deadline has passed and the threshold is met, it should call `exampleExternalContract.complete{value: address(this).balance}()`

    // If the `threshold` was not met, allow everyone to call a `withdraw()` function

    // Add a `withdraw()` function to let users withdraw their balance
    function withdraw()
        public
        withdrawalDeadLineReached(true)
        claimDeadlineReached(false)
        notCompleted
    {
        require(balances[msg.sender] > 0, "You have no balance to withdraw!");
        uint256 individualBalance = balances[msg.sender];
        console.log(individualBalance);
        uint256 indBalanceRewards = individualBalance +
            ((block.timestamp - depositTimestamps[msg.sender]) *
                rewardRatePerSecond) /
            1e18;
        console.log(indBalanceRewards);
        balances[msg.sender] = 0;
        (bool sent, bytes memory data) = payable(msg.sender).call{
            value: indBalanceRewards
        }("");

        // bool sent = payable(msg.sender).send(indBalanceRewards)
        require(sent, "RIP;withdrawal failed :( ");
    }

    function execute() public claimDeadlineReached(true) notCompleted {
        uint256 contractBalance = address(this).balance;
        exampleExternalContract.complete{value: address(this).balance}();
    }

    function retrieve() public OnlyWhitelisted isCompleted {
        withdrawalDeadLine = block.timestamp + 120 seconds;
        claimDeadline = block.timestamp + 240 seconds;
        exampleExternalContract.retrieveStaker();
    }

    // Add a `timeLeft()` view function that returns the time left before the deadline for the frontend
    function withdrawalTimeLeft()
        public
        view
        returns (uint256 withdrawalTimeLeft)
    {
        if (block.timestamp >= withdrawalDeadLine) {
            return (0);
        } else {
            return (withdrawalDeadLine - block.timestamp);
        }
    }

    function claimPeriodLeft() public view returns (uint256 claimPeriodLeft) {
        if (block.timestamp >= claimDeadline) {
            return (0);
        } else {
            return (claimDeadline - block.timestamp);
        }
    }

    // Add the `receive()` special function that receives eth and calls stake()
    function killTime() public {
        currentBlock = block.timestamp;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
