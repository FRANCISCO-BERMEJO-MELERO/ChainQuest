// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AdventureNFT is ERC721 {
    using Strings for uint256;

    uint256 private nextTokenId;
    string public baseTokenURI;

    function hasMinted(address player) public view returns (bool) {
    return _hasMinted[player];
    }

    function playerToTokenId(address player) public view returns (uint256) {
        return _playerToTokenId[player];
    }

    mapping(address => bool) private _hasMinted;
    mapping(address => uint256) private _playerToTokenId;


    constructor() ERC721("Adventure", "A") {
        baseTokenURI = "http://localhost:3000/metadata/";
    }

    function safeMint() public {
        require(!_hasMinted[msg.sender], "You have already minted an NFT");
        nextTokenId++;
        _safeMint(msg.sender, nextTokenId);
        _hasMinted[msg.sender] = true;
        _playerToTokenId[msg.sender] = nextTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return string(abi.encodePacked(baseTokenURI, tokenId.toString()));
    }
}