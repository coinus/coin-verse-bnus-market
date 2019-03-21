pragma solidity ^0.4.24;

import "./CoinVerseContractIds.sol";
import "./CoinUsOnly.sol";
import "./interfaces/IBnusConverter.sol";
import "./interfaces/IBnusToken.sol";
import "bancor-contracts/solidity/contracts/converter/BancorConverter.sol";
import "bancor-contracts/solidity/contracts/converter/interfaces/IBancorGasPriceLimit.sol";

contract BnusConverter is IBnusConverter, BancorConverter, CoinVerseContractIds, CoinUsOnly {

    uint64 private constant MAX_CONVERSION_FEE = 1000000;
    uint32 public conversionFee_buy = 0;
    uint32 public conversionFee_sell = 0;

    // triggered when the conversion fee is updated
    event ConversionBuyFeeUpdate(uint32 _prevFee, uint32 _newFee);
    event ConversionSellFeeUpdate(uint32 _prevFee, uint32 _newFee);

    constructor (
        ISmartToken _token,
        IContractRegistry _registry,
        uint32 _maxConversionFee,
        IERC20Token _connectorToken,
        uint32 _connectorWeight
    )
    BancorConverter(_token, _registry, _maxConversionFee, _connectorToken, _connectorWeight)  {

    }
    // prevent front running with gas limitation
    modifier preventFrontRunning() {
        IBancorGasPriceLimit gasPriceLimit = IBancorGasPriceLimit(registry.addressOf(ContractIds.BANCOR_GAS_PRICE_LIMIT));
        gasPriceLimit.validateGasPrice(tx.gasprice);
        _;
    }

    function setCoinUsAccount(address _account) public ownerOnly {
        _setCoinUsAccount(_account);
    }

    function getLockedStatusFromToken(address _target) public view returns (bool) {
        return IBnusToken(token).lockedStatusAddress(_target);
    }

    function lockAddressForToken(address _target) 
        public 
        ownerOrManagerOnly
    {
        IBnusToken(token).lockAddress(_target);
    }

    function unlockAddressForToken(address _target)
        public
        ownerOrManagerOnly
    {
        IBnusToken(token).unlockAddress(_target);
    }

    /**
        @dev deprecated

        @param _conversionFee new conversion fee, represented in ppm
    */
    function setConversionFee(uint32 _conversionFee)
        public
        ownerOrManagerOnly
        validConversionFee(_conversionFee)
    {
        revert("method no longer used");
    }

    /**
        @dev updates the current buy conversion fee
        can only be called by the manager

        @param _conversionFee_buy new buy conversion fee, represented in ppm
    */
    function setBuyConversionFee(uint32 _conversionFee_buy)
        public
        ownerOrManagerOnly
        validConversionFee(_conversionFee_buy)
    {
        emit ConversionBuyFeeUpdate(conversionFee_buy, _conversionFee_buy);
        conversionFee_buy = _conversionFee_buy;
    }

    /**
        @dev updates the current sell conversion fee
        can only be called by the manager

        @param _conversionFee_sell new sell conversion fee, represented in ppm
    */
    function setSellConversionFee(uint32 _conversionFee_sell)
        public
        ownerOrManagerOnly
        validConversionFee(_conversionFee_sell)
    {
        emit ConversionSellFeeUpdate(conversionFee_sell, _conversionFee_sell);
        conversionFee_sell = _conversionFee_sell;
    }

    /**
        @dev given a return amount, returns the amount minus the conversion fee

        @param _amount      return amount
        @param _magnitude   1 for standard conversion, 2 for cross connector conversion

        @return return amount minus conversion fee
    */
    function getFinalAmount(uint256 _amount, uint8 _magnitude) public view returns (uint256) {
        return getBuyFinalAmount(_amount, _magnitude);
    }

    /**
        @dev given a return amount, returns the amount minus the conversion fee

        @param _amount      return amount
        @param _magnitude   1 for standard conversion, 2 for cross connector conversion

        @return return amount minus conversion fee
    */
    function getBuyFinalAmount(uint256 _amount, uint8 _magnitude) public view returns (uint256) {
        return safeMul(_amount, (MAX_CONVERSION_FEE - conversionFee_buy) ** _magnitude) / MAX_CONVERSION_FEE ** _magnitude;
    }

    /**
        @dev given a return amount, returns the amount minus the conversion fee

        @param _amount      return amount
        @param _magnitude   1 for standard conversion, 2 for cross connector conversion

        @return return amount minus conversion fee
    */
    function getSellFinalAmount(uint256 _amount, uint8 _magnitude) public view returns (uint256) {
        return safeMul(_amount, (MAX_CONVERSION_FEE - conversionFee_sell) ** _magnitude) / MAX_CONVERSION_FEE ** _magnitude;
    }

    /**
        @dev returns the expected return for buying the token for a connector token

        @param _connectorToken  connector token contract address
        @param _depositAmount   amount to deposit (in the connector token)

        @return expected purchase return amount and conversion fee
    */
    function getPurchaseReturn(IERC20Token _connectorToken, uint256 _depositAmount)
        public
        view
        conversionsAllowed
        active
        validConnector(_connectorToken)
        returns (uint256, uint256)
    {
        Connector storage connector = connectors[_connectorToken];
        require(connector.isPurchaseEnabled, "purchase disabled"); // validate input

        uint256 tokenSupply = token.totalSupply();
        uint256 connectorBalance = getConnectorBalance(_connectorToken);
        IBancorFormula formula = IBancorFormula(registry.addressOf(ContractIds.BANCOR_FORMULA));
        uint256 amount = formula.calculatePurchaseReturn(tokenSupply, connectorBalance, connector.weight, _depositAmount);
        uint256 finalAmount = getBuyFinalAmount(amount, 1);

        // return the amount minus the conversion fee and the conversion fee
        return (finalAmount, amount - finalAmount);
    }

    /**
        @dev returns the expected return for selling the token for one of its connector tokens

        @param _connectorToken  connector token contract address
        @param _sellAmount      amount to sell (in the smart token)

        @return expected sale return amount and conversion fee
    */
    function getSaleReturn(IERC20Token _connectorToken, uint256 _sellAmount)
        public
        view
        conversionsAllowed
        active
        validConnector(_connectorToken)
        returns (uint256, uint256)
    {
        Connector storage connector = connectors[_connectorToken];
        uint256 tokenSupply = token.totalSupply();
        uint256 connectorBalance = getConnectorBalance(_connectorToken);
        IBancorFormula formula = IBancorFormula(registry.addressOf(ContractIds.BANCOR_FORMULA));
        uint256 amount = formula.calculateSaleReturn(tokenSupply, connectorBalance, connector.weight, _sellAmount);
        uint256 finalAmount = getSellFinalAmount(amount, 1);

        // return the amount minus the conversion fee and the conversion fee
        return (finalAmount, amount - finalAmount);
    }
    

    /**
    * @dev Customized function for Coin Verse system
    * @param _depositAmount amount of Cnus to buy Bnus
    * @param _minReturn expected minimum return of Bnus. It is cancelled when the returned amount of Bnus is smaller
     than the _minReturn,
    * @param _expiration the signature will expire after the given timestamp
    * @param _signature signed hash value with the private key of CoinUs wallet
    */
    function buyBnus(uint256 _depositAmount, uint256 _minReturn, uint256 _expiration, bytes memory _signature)
    public
    conversionsAllowed
    preventFrontRunning
    coinUsOnly(registry, abi.encodePacked(_depositAmount, _minReturn), _expiration, _signature)
    {
        uint256 amount;
        uint256 feeAmount;
        IERC20Token cnus = IERC20Token(registry.addressOf(CNUS_TOKEN));
        (amount, feeAmount) = getPurchaseReturn(cnus, _depositAmount);
        buy(cnus, _depositAmount, _minReturn);
        token.issue(registry.addressOf(TOKEN_POOL), feeAmount);
    }

    /**
     * @dev Customized function for Coin Verse system
     * @param _sellAmount amount of Cnus to buy Bnus
     * @param _minReturn expected minimum return of Bnus. It is cancelled when the returned amount of Bnus is smaller
      than the _minReturn,
     * @param _expiration the signature will expire after the given timestamp
     * @param _signature signed hash value with the private key of CoinUs wallet
     */
    function sellBnus(uint256 _sellAmount, uint256 _minReturn, uint256 _expiration, bytes memory _signature)
    public
    conversionsAllowed
    preventFrontRunning
    coinUsOnly(registry, abi.encodePacked(_sellAmount, _minReturn), _expiration, _signature)
    {
        uint256 amount;
        uint256 feeAmount;
        IERC20Token cnus = IERC20Token(registry.addressOf(CNUS_TOKEN));
        (amount, feeAmount) = getSaleReturn(cnus, _sellAmount);
        sell(cnus, _sellAmount, _minReturn);
        assert(cnus.transfer(registry.addressOf(TOKEN_POOL), feeAmount));
    }

    /**
        @dev returns balance of Cnus
        @return connector balance
    */
    function getCnusBalance()
    public
    view
    returns (uint256)
    {
        return getConnectorBalance(IERC20Token(registry.addressOf(CNUS_TOKEN)));
    }

    /**
        @dev returns Total supply of BNUS and reserved amount of CNUS in the converter
        @param _totalBnus Total supply of BNUS token
        @param _reservedCnus Total amount of reserved CNUS in this converter
    */
    function getStats() public view returns (uint256 _totalBnus, uint256 _reservedCnus) {
        _totalBnus = token.totalSupply();
        _reservedCnus = getCnusBalance();
    }

    /**
     * @dev returns expected amount of Bnus for the given Cnus
     */
    function getExpectedBnus(uint256 _cnus)
    public
    view
    returns (uint256)
    {
        uint256 amount;
        uint256 feeAmount;
        IERC20Token cnus = IERC20Token(registry.addressOf(CNUS_TOKEN));
        (amount, feeAmount) = getPurchaseReturn(cnus, _cnus);
        return amount;
    }

    /**
     * @dev returns expected amount of Cnus for the given Bnus
     */
    function getExpectedCnus(uint256 _bnus)
    public
    view
    returns (uint256)
    {
        uint256 amount;
        uint256 feeAmount;
        IERC20Token cnus = IERC20Token(registry.addressOf(CNUS_TOKEN));
        (amount, feeAmount) = getSaleReturn(cnus, _bnus);
        return amount;
    }
}
