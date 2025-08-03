const AdventureNFT = artifacts.require("AdventureNFT");

module.exports = function (deployer) {
  deployer.deploy(AdventureNFT);
};