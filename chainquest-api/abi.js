const questManagerAbi = [
  "event QuestCompleted(address indexed player, uint questId, uint xpReward, uint timestamp)",
];

const adventurerNFTAbi = [
  "function ownerOf(uint256 tokenId) public view returns (address)"
];

module.exports = { questManagerAbi, adventurerNFTAbi };
