// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AICredits {
    address public owner;
    uint256 public exchangeRate; // 1 AVAX = X AI credits

    mapping(address => uint256) public creditBalances;

    event TopUp(address indexed user, uint256 avaxAmount, uint256 creditsMinted);
    event CreditsDeducted(address indexed user, uint256 creditsSpent);

    constructor(uint256 _exchangeRate) {
        owner = msg.sender;
        exchangeRate = _exchangeRate;
    }

    function topUp() external payable {
        require(msg.value > 0, "Must send AVAX");
        uint256 credits = msg.value * exchangeRate;
        creditBalances[msg.sender] += credits;
        emit TopUp(msg.sender, msg.value, credits);
    }

    function spendCredits(address user, uint256 amount) external {
        require(msg.sender == owner, "Only owner can deduct credits");
        require(creditBalances[user] >= amount, "Insufficient credits");
        creditBalances[user] -= amount;
        emit CreditsDeducted(user, amount);
    }

    function setExchangeRate(uint256 _newRate) external {
        require(msg.sender == owner, "Only owner can set the exchange rate");
        exchangeRate = _newRate;
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
}
