var CarbonCreditTokenArtifact = artifacts.require("CarbonCreditToken");
var VendorArtifact = artifacts.require("Vendor");

// const [CCT] = ['CCT']
//     .map(ticker => web3.utils.fromAscii(ticker));

module.exports = async function (deployer) {
  // deployer.deploy(CarbonCreditTokenArtifact, BigInt(100*10**18));

  await Promise.all(
      [CarbonCreditTokenArtifact, VendorArtifact].map(contract => deployer.deploy(contract))
  );

  const [cct, vendor] = await Promise.all(
      [CarbonCreditTokenArtifact, VendorArtifact].map(contract => contract.deployed())
  );

  await Promise.all([
    vendor.addToken( cct.address)
  ]);

  const amount = web3.utils.toWei('1000');
  const seedTokenBalance = async (token) => {
    await token.mint(amount)
  };


  await Promise.all(
      [cct].map(
          token => seedTokenBalance(token)
      )
  );

};
