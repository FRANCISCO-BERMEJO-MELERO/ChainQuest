const QuestManager = artifacts.require("QuestManager");

module.exports = function (deployer) {
  deployer.deploy(QuestManager);
};