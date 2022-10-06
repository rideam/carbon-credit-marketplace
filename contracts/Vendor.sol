// SPDX-License-Identifier: Unlicense
pragma solidity >=0.4.22 <0.9.0;
//pragma solidity ^0.8.4;

import "./CarbonCreditToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//vendor (exchange) owns this contract
contract Vendor is Ownable {

    CarbonCreditToken yourToken; //Test token is the token we are working with
    uint256 public tokensPerMatic = 100; //I get 100 tokens for every 1 Matic

    //Buy contract has 3 inputs: buyer address, amount of $, number of tokens
    event BuyTokens(address buyer, uint256 amountOfMATIC, uint256 amountOfTokens);



    //constructor: Initializes the contract: set the deployer as the initial owner.
    constructor(/*address tokenAddress*/) {
        //        yourToken = CarbonCreditToken(tokenAddress);  //will this be different? we want exchange to be the vendor and regulator to be the minters
    }

    function addToken(address tokenAddress) external {
        yourToken = CarbonCreditToken(tokenAddress);
    }


    //------------------BUY: Exchange (vendor) recieves $ and GIVES tokens to USER --------------------------------------
    function buyTokens() public payable returns (uint256 tokenAmount) {
        require(msg.value > 0, "You need to send some MATIC to proceed");
        // msg.value = amount of $
        uint256 amountToBuy = msg.value * tokensPerMatic;
        // I have sent $5 (matic) -> this will buy me 500 tokens| amountToBuy = HOW MANY TOKENS

        uint256 vendorBalance = yourToken.balanceOf(address(this));
        //the seller's balance (in our case this is the exchange)
        require(vendorBalance >= amountToBuy, "Vendor has insufficient tokens");
        //does the exchange have enough to sell you

        (bool sent) = yourToken.transfer(msg.sender, amountToBuy);
        //send tokens to users wallet
        require(sent, "Failed to transfer token to user");
        //we require that the sent happened otherwise return error message

        emit BuyTokens(msg.sender, msg.value, amountToBuy);
        //emitting an event: returning the number of tokens purchased
        return amountToBuy;
    }



    //------------------SELL: Exchange (vendor) recieves tokens and GIVES $ to USER -------------------------------
    //the exchange is buying from an user
    function sellTokens(uint256 tokenAmountToSell) public {

        require(tokenAmountToSell > 0, "Specify an amount of token greater than zero");
        uint256 userBalance = yourToken.balanceOf(msg.sender);
        //check if the user has enough tokens
        require(userBalance >= tokenAmountToSell, "You have insufficient tokens");
        uint256 amountOfMATICToTransfer = tokenAmountToSell / tokensPerMatic;
        //if you give us 500 tokens we owe you 5 matic
        uint256 ownerMATICBalance = address(this).balance;
        //the $$ balance of the exchange. address(this) = exchange

        require(ownerMATICBalance >= amountOfMATICToTransfer, "Vendor has insufficient funds");

        //REQUIRES FRONT END INPUT
        (bool sent) = yourToken.transferFrom(msg.sender, address(this), tokenAmountToSell);
        // transfer tokens to exchange
        require(sent, "Failed to transfer tokens from user to vendor");


        (sent,) = msg.sender.call{value : amountOfMATICToTransfer}("");
        // send $ to user
        require(sent, "Failed to send MATIC to the user");
    }
    //-------------------------------------------------------------------------------------------------------------

    //only be run by the owner of the contract.
    //send all the MATIC stored in the smart contract into the owner’s wallet.
    function withdraw() public onlyOwner {
        uint256 ownerBalance = address(this).balance;
        require(ownerBalance > 0, "No MATIC present in Vendor");
        (bool sent,) = msg.sender.call{value : address(this).balance}("");
        require(sent, "Failed to withdraw");
    }


    // To allow contract to receive ether
    fallback() external payable {}

    receive() external payable {}
}
