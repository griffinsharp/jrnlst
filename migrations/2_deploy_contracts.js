const Editor = artifacts.require("Editor");

module.exports = function(deployer) {
  deployer.deploy(Editor);
};
