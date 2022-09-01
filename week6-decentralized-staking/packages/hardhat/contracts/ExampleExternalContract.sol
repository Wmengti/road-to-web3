// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

contract ExampleExternalContract {
    bool public completed;

    function complete() public payable {
        completed = true;
    }

    function retrieveStaker() public payable {
        require(completed == true, "completed!");
        completed = false;
        bool sent = payable(msg.sender).send(address(this).balance);
        require(sent, "RIP;withdrawal failed :( ");
    }
}
