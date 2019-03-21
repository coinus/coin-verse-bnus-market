pragma solidity ^0.4.24;

import "bancor-contracts/solidity/contracts/token/SmartToken.sol";

contract BnusToken is SmartToken {

    // mapping that provides address based lock.
    mapping(address => bool) public lockedStatusAddress;

    event Locked(address indexed lockedAddress);
    event Unlocked(address indexed unlockedaddress);

    // Check for address lock to be unlocked
    modifier checkAddressLock {
        require(!lockedStatusAddress[msg.sender], "Address is locked");
        _;
    }

    constructor(string _name, string _symbol, uint8 _decimals)
    public
    SmartToken(_name, _symbol, _decimals)
    {
    }

    /**
      * @dev Allows token issuer to lock token transfer for an address.
      * @param target Target address to lock token transfer.
      */
    function lockAddress(
        address target
    )
    public
    ownerOnly
    {
        require(owner != target);
        require(!lockedStatusAddress[target]);
        lockedStatusAddress[target] = true;
        emit Locked(target);
    }

    /**
      * @dev Allows token issuer to unlock token transfer for an address.
      * @param target Target address to unlock token transfer.
      */
    function unlockAddress(
        address target
    )
    public
    ownerOnly
    {
        require(lockedStatusAddress[target]);
        lockedStatusAddress[target] = false;
        emit Unlocked(target);
    }

    /**
        @dev removes tokens from an account and decreases the token supply
        can be called by the contract owner to destroy tokens from any account or by any holder to destroy tokens from his/her own account

        @param _from       account to remove the amount from
        @param _amount     amount to decrease the supply by
    */
    function destroy(address _from, uint256 _amount) public {
        require(!lockedStatusAddress[_from], "Address is locked.");

        super.destroy(_from, _amount);
    }

    // ERC20 standard method overrides with some extra functionality

    /**
        @dev send coins
        throws on any error rather then return a false flag to minimize user errors
        in addition to the standard checks, the function throws if transfers are disabled

        @param _to      target address
        @param _value   transfer amount

        @return true if the transfer was successful, false if it wasn't
    */
    function transfer(address _to, uint256 _value) public checkAddressLock returns (bool success) {
        assert(super.transfer(_to, _value));
        return true;
    }

    /**
        @dev an account/contract attempts to get the coins
        throws on any error rather then return a false flag to minimize user errors
        in addition to the standard checks, the function throws if transfers are disabled

        @param _from    source address
        @param _to      target address
        @param _value   transfer amount

        @return true if the transfer was successful, false if it wasn't
    */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(!lockedStatusAddress[_from], "Address is locked.");
        assert(super.transferFrom(_from, _to, _value));
        return true;
    }
}
