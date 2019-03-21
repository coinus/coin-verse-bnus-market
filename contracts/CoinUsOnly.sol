pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "bancor-contracts/solidity/contracts/utility/interfaces/IContractRegistry.sol";
import "./CoinVerseContractIds.sol";


contract CoinUsOnly is CoinVerseContractIds {
    using ECDSA for bytes32;

    address public coinUsAccount;

    modifier coinUsOnly(IContractRegistry _registry, bytes memory _data, uint256 _expiration, bytes _signature) {
        require(address(_registry) != address(0));
        if (msg.sender == _registry.addressOf(TOKEN_POOL)) {
            // Pass
        } else {
            bytes32 finalHash = keccak256(abi.encodePacked(_data, _expiration));
            address _signer = finalHash.toEthSignedMessageHash().recover(_signature);
            require(_signer == coinUsAccount);
            require(now <= _expiration);
        }
        _;
    }

    function _setCoinUsAccount(address _account) internal {
        coinUsAccount = _account;
    }
}
