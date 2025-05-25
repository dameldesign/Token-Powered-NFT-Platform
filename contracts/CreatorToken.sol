// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreatorToken
 * @dev ERC20 token that rewards creators when their NFTs are minted
 */
contract CreatorToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant REWARD_AMOUNT = 10 * 10**18; // 10 tokens per NFT mint

    constructor() ERC20("CreatorToken", "CRT") Ownable(msg.sender) {
        _mint(address(this), INITIAL_SUPPLY);
    }

    /**
     * @dev Rewards a creator with tokens when their NFT is minted
     * @param to The address of the creator to reward
     * @param amount The amount of tokens to reward
     * @return success Boolean indicating if the reward was successful
     */
    function rewardCreator(address to, uint256 amount) external onlyOwner returns (bool success) {
        require(to != address(0), "Cannot reward zero address");
        require(balanceOf(address(this)) >= amount, "Insufficient token balance");
        
        _transfer(address(this), to, amount);
        return true;
    }
}