pragma solidity ^0.4.24;

contract ICnusPoolForStaking {
    /**
       @dev can stake Cnus
       @param _amount amount of Cnus to stake
       @param _expiration the signature will expire after the given timestamp
       @param _signature signed hash value with the private key of CoinUs wallet
    */
    function stake(uint256 _amount, uint256 _expiration, bytes _signature) public;

    /**
       @dev withdrawing for approved requests
       @param _amount amount of Cnus to withdraw
       @param _expiration the signature will expire after the given timestamp
       @param _signature signed hash value with the private key of CoinUs wallet
    */
    function withdraw(uint256 _amount, uint256 _expiration, bytes _signature) public;

    /**
        @dev returns total amount of staked Cnus
    */
    function getStakedAmount() public view returns (uint256);

    function stakeOf(address _account) public view returns (uint256);
}
