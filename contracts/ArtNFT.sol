// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./CreatorToken.sol";

/**
 * @title ArtNFT
 * @dev ERC721 token that allows creators to mint NFTs and earn rewards
 */
contract ArtNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    CreatorToken private _creatorToken;
    
    // Mapping from token ID to creator address
    mapping(uint256 => address) public creators;
    
    // Fixed reward amount for each mint (in wei)
    uint256 public constant CREATOR_REWARD = 10 * 10**18; // 10 tokens
    
    // Event emitted when a new NFT is minted
    event NFTMinted(
        uint256 indexed tokenId, 
        address indexed creator,
        string tokenURI,
        uint256 rewardAmount
    );
    
    constructor(address creatorTokenAddress) ERC721("Art NFT", "ANFT") {
        require(creatorTokenAddress != address(0), "Invalid token address");
        _creatorToken = CreatorToken(creatorTokenAddress);
    }
    
    /**
     * @dev Mints a new NFT and rewards the creator
     * @param tokenURI The URI containing metadata for the NFT
     * @return tokenId The ID of the newly minted NFT
     */
    function mintNFT(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Record the creator
        creators[newTokenId] = msg.sender;
        
        // Reward the creator with tokens
        bool rewardSuccess = _creatorToken.rewardCreator(msg.sender, CREATOR_REWARD);
        require(rewardSuccess, "Failed to reward creator");
        
        // Emit minting event
        emit NFTMinted(newTokenId, msg.sender, tokenURI, CREATOR_REWARD);
        
        return newTokenId;
    }
    
    /**
     * @dev Returns the creator of a specific token
     * @param tokenId The ID of the token
     * @return The address of the creator
     */
    function getCreator(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return creators[tokenId];
    }
    
    /**
     * @dev Checks if a token exists
     * @param tokenId The ID of the token to check
     * @return Whether the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}