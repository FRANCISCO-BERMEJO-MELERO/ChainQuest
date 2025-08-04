// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract QuestManager {
    struct Quest {
        uint id;
        string description;
        uint xpReward;
        bool isActive;
    }

    address private owner;
    mapping(uint => Quest) public quests;
    mapping(address => mapping(uint => bool)) public completed;
    uint private questCount;

    event QuestAdded(uint id, string description, uint xpReward);
    event QuestCompleted(address indexed player, uint questId, uint xpReward, uint timestamp);

    constructor() {
        owner = msg.sender;
        questCount = 0;
    }

    function addQuest(string memory _description, uint _xpReward) public {
        require(msg.sender == owner, "Only the owner can add quests");
        require(_xpReward > 0, "XP reward must be a positive number");    

        questCount++;
        uint id = questCount;
        quests[id] = Quest(id, _description, _xpReward, true);
        emit QuestAdded(id, _description, _xpReward);
    }

    function completeQuest(uint _id) public {
        require(quests[_id].isActive == true, "Quest is not active");
        require(_id <= questCount, "Invalid quest ID");
        require(!completed[msg.sender][_id], "You already completed this quest");

        completed[msg.sender][_id] = true;

        emit QuestCompleted(msg.sender, _id, quests[_id].xpReward, block.timestamp);
    }

}
