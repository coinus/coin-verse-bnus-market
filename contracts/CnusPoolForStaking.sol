pragma solidity ^0.4.24;

import "bancor-contracts/solidity/contracts/utility/TokenHolder.sol";
import "bancor-contracts/solidity/contracts/utility/interfaces/IContractRegistry.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./CoinVerseContractIds.sol";
import "./CoinUsOnly.sol";
import "./interfaces/ICnusPoolForStaking.sol";

contract CnusPoolForStaking is ICnusPoolForStaking, TokenHolder, CoinVerseContractIds, CoinUsOnly {
    using SafeMath for uint256;

    IContractRegistry registry;
    mapping(address => uint256) staking;

    event Deposit(address indexed _account, uint256 _amount, uint256 _timestamp);
    event Withdrawal(address indexed _account, uint256 _amount, uint256 _timestamp);

    constructor() public {}

    function setRegistry(address _registry) ownerOnly {
        registry = IContractRegistry(_registry);
    }

    function setCoinUsAccount(address _account) public ownerOnly {
        _setCoinUsAccount(_account);
    }
    /**
       @dev can stake Cnus
       @param _amount amount of Cnus to stake
       @param _expiration the signature will expire after the given timestamp
       @param _signature signed hash value with the private key of CoinUs wallet
    */
    function stake(uint256 _amount, uint256 _expiration, bytes _signature)
    public
    coinUsOnly(registry, abi.encodePacked(_amount), _expiration, _signature)
    {
        IERC20Token(registry.addressOf(CNUS_TOKEN)).transferFrom(msg.sender, this, _amount);
        staking[msg.sender] = staking[msg.sender].add(_amount);
        emit Deposit(msg.sender, _amount, now);
    }

    /**
       @dev withdrawing for approved requests
       @param _amount amount of Cnus to withdraw
       @param _expiration the signature will expire after the given timestamp
       @param _signature signed hash value with the private key of CoinUs wallet
    */
    function withdraw(uint256 _amount, uint256 _expiration, bytes _signature)
    public
    coinUsOnly(registry, abi.encodePacked(_amount), _expiration, _signature)
    {
        require(staking[msg.sender] >= _amount);
        IERC20Token(registry.addressOf(CNUS_TOKEN)).transfer(msg.sender, _amount);
        staking[msg.sender] = staking[msg.sender].sub(_amount);
        emit Withdrawal(msg.sender, _amount, now);
    }

    /**
        @dev returns total amount of staked Cnus
    */
    function getStakedAmount() public view returns (uint256) {
        return stakeOf(msg.sender);
    }

    function stakeOf(address _account) public view returns (uint256) {
        return staking[_account];
    }
}
