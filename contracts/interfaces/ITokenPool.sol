pragma solidity ^0.4.24;

contract ITokenPool {
    /**
      @dev withdraw cnus tokens held by the contract and sends them to an account
      can only be called by the owner

      @param _to      account to receive the new amount
      @param _amount  amount to withdraw
    */
    function airdropCnus(address _to, uint256 _amount) public;

    /**
      @dev withdraw bnus tokens held by the contract and sends them to an account
      can only be called by the owner

      @param _to      account to receive the new amount
      @param _amount  amount to withdraw
    */
    function airdropBnus(address _to, uint256 _amount) public;

    /**
      @dev Batch job for airdrop
      can only be called by the owner

      @param _to      array of account to receive the new amount
      @param _amount  array of amount to withdraw
    */
    function batchAirdropBnus(address[] _to, uint256[] _amount) public;
    /**
          @dev Batch job for airdrop
          can only be called by the owner

          @param _to      array of account to receive the new amount
          @param _amount  array of amount to withdraw
        */
    function batchAirdropCnus(address[] _to, uint256[] _amount) public;

    function bnusToCnus(uint256 _amount, uint256 _minReturn) public;

    function cnusToBnus(uint256 _amount, uint256 _minReturn) public;

    function getBnusBalance() public view returns (uint256);

    function getCnusBalance() public view returns (uint256);
}
