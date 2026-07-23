// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AICredits
/// @notice Non-transferable, on-chain metering token for Avalanche Scribe.
/// @dev Users top up with AVAX and receive credits at a fixed rate.
///      Only the owner (backend signer) may spend credits on a user's behalf.
contract AICredits {
    address public owner;
    uint256 public creditsPerAvax; // credits minted per 1 AVAX (1e18 wei)
    uint256 public totalIssued;

    mapping(address => uint256) private _balances;

    event ToppedUp(address indexed user, uint256 avaxAmount, uint256 creditsMinted);
    event Spent(address indexed user, uint256 amount);
    event RateUpdated(uint256 oldRate, uint256 newRate);
    event Withdrawn(address indexed to, uint256 amount);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(uint256 _creditsPerAvax) {
        require(_creditsPerAvax > 0, "rate=0");
        owner = msg.sender;
        creditsPerAvax = _creditsPerAvax;
    }

    function balanceOf(address user) external view returns (uint256) {
        return _balances[user];
    }

    /// @notice Top up your own credit balance by sending AVAX.
    function topUp() external payable {
        require(msg.value > 0, "no avax");
        uint256 minted = (msg.value * creditsPerAvax) / 1 ether;
        require(minted > 0, "amount too small");
        _balances[msg.sender] += minted;
        totalIssued += minted;
        emit ToppedUp(msg.sender, msg.value, minted);
    }

    receive() external payable {
        // Allow bare AVAX transfers to also top up.
        uint256 minted = (msg.value * creditsPerAvax) / 1 ether;
        require(minted > 0, "amount too small");
        _balances[msg.sender] += minted;
        totalIssued += minted;
        emit ToppedUp(msg.sender, msg.value, minted);
    }

    /// @notice Owner-only: burn credits from a user after they consume AI compute.
    function spend(address user, uint256 amount) external onlyOwner {
        require(_balances[user] >= amount, "insufficient credits");
        unchecked { _balances[user] -= amount; }
        emit Spent(user, amount);
    }

    // ─── admin ────────────────────────────────────────────────────────────────

    function setRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "rate=0");
        emit RateUpdated(creditsPerAvax, newRate);
        creditsPerAvax = newRate;
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero addr");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "withdraw failed");
        emit Withdrawn(to, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero addr");
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }
}