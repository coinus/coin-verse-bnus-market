pragma solidity ^0.4.24;

import "bancor-contracts/solidity/contracts/converter/BancorConverterFactory.sol";
import "bancor-contracts/solidity/contracts/BancorNetwork.sol";
import "bancor-contracts/solidity/contracts/token/SmartToken.sol";
import "bancor-contracts/solidity/contracts/converter/BancorFormula.sol";
import "bancor-contracts/solidity/contracts/converter/BancorGasPriceLimit.sol";
import "bancor-contracts/solidity/contracts/utility/ContractRegistry.sol";
import "bancor-contracts/solidity/contracts/utility/ContractFeatures.sol";
import "bancor-contracts/solidity/contracts/helpers/TestERC20Token.sol";
import "bancor-contracts/solidity/contracts/converter/BancorConverterUpgrader.sol";
import "bancor-contracts/solidity/contracts/utility/Whitelist.sol";
import "bancor-contracts/solidity/contracts/helpers/TestBancorFormula.sol";
import "bancor-contracts/solidity/contracts/token/EtherToken.sol";
import "bancor-contracts/solidity/contracts/helpers/TestFeatures.sol";
import "bancor-contracts/solidity/contracts/crowdsale/CrowdsaleController.sol";
import "bancor-contracts/solidity/contracts/helpers/TestCrowdsaleController.sol";
import "bancor-contracts/solidity/contracts/helpers/TestUtils.sol";

contract TestHelper {
}

contract T1 is BancorNetwork {}

contract T2 is ContractIds {}

contract T3 is SmartToken {}

contract T4 is BancorFormula {}

contract T5 is BancorGasPriceLimit {}

contract T6 is ContractRegistry {}

contract T7 is ContractFeatures {}

contract T8 is TestERC20Token {}

contract T9 is BancorConverterFactory {}

contract T10 is BancorConverterUpgrader {}

contract T11 is Whitelist {}

contract T12 is TestBancorFormula {}

contract T13 is EtherToken {}

contract T14 is TestFeatures {}

contract T15 is CrowdsaleController {}

contract T16 is TestCrowdsaleController {}

contract T17 is TestUtils {}
