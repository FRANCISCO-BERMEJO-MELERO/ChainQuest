// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AdventureNFT is ERC721 {
    using Strings for uint256;

    uint256 private nextTokenId;
    string public baseTokenURI;

    mapping(address => bool) public hasMinted;
    mapping(address => uint256) public playerToTokenId;

    constructor() ERC721("Adventure", "A") {
        baseTokenURI = "http://localhost:3000/metadata/";
    }

    function safeMint() public {
        require(!hasMinted[msg.sender], "You have already minted an NFT");
        nextTokenId++;
        _safeMint(msg.sender, nextTokenId);
        hasMinted[msg.sender] = true;
        playerToTokenId[msg.sender] = nextTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return string(abi.encodePacked(baseTokenURI, tokenId.toString()));
    }
}