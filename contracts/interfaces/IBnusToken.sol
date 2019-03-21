pragma solidity ^0.4.24;

contract IBnusToken {
    
    function lockedStatusAddress(address target) public view returns (bool);

    function lockAddress(address target) public;

    function unlockAddress(address target) public;
}