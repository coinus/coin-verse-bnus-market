pragma solidity ^0.4.24;

contract IBnusConverter {
    /**
        @dev returns the Cnus balance stored in the bancor
        @return balance
    */
    function getCnusBalance() public view returns (uint256);

    /**
     * @dev Customized function for Coin Verse system
     * @param _depositAmount amount of Cnus to buy Bnus
     * @param _minReturn expected minimum return of Bnus. It is cancelled when the returned amount of Bnus is smaller
      than the _minReturn,
     * @param _expiration the signature will expire after the given timestamp
     * @param _signature signed hash value with the private key of CoinUs wallet
     */
    function buyBnus(uint256 _depositAmount, uint256 _minReturn, uint256 _expiration, bytes memory _signature) public;

    /**
     * @dev Customized function for Coin Verse system
     * @param _sellAmount amount of Cnus to buy Bnus
     * @param _minReturn expected minimum return of Bnus. It is cancelled when the returned amount of Bnus is smaller
      than the _minReturn,
     * @param _expiration the signature will expire after the given timestamp
     * @param _signature signed hash value with the private key of CoinUs wallet
     */
    function sellBnus(uint256 _sellAmount, uint256 _minReturn, uint256 _expiration, bytes memory _signature) public;
}
