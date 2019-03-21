#!/bin/bash

# Test script should be run in the base directory
check_truffle_project() {
  cd `dirname "$0"` && cd ../
  if [ -f "truffle.js" ]
  then
    echo "Start testing"
  else
    echo "You should run this script in the base directory of this project"
    exit 1
  fi
}

# Terminate running ganaches for testing
kill_ganache() {
  echo "Terminate ganache"
  if !([ -z ${pid+x} ]);then
    kill $pid > /dev/null 2>&1
  fi
}

# Compile contracts
compile() {
  ./node_modules/.bin/truffle compile --all
  [ $? -ne 0 ] && exit 1
}

# Run private block-chain for test cases
run_ganache() {
  ./node_modules/.bin/ganache-cli > /dev/null & pid=$!
  if ps -p $pid > /dev/null
  then
    echo "Running ganache..."
  else
    echo "Failed to run a chain"
    exit 1
  fi
}

# Deploy contracts on the block-chain for testing
migrate() {
  ./node_modules/.bin/truffle migrate --network development
  [ $? -ne 0 ] && exit 1
}

# Run test cases with truffle
run_test() {
  ./node_modules/.bin/truffle test --network development
  [ $? -ne 0 ] && exit 1
}

# Check test coverage
run_coverage() {
  ./node_modules/.bin/solidity-coverage
}

flatten() {
  ./node_modules/.bin/truffle-flattener contracts/BnusConverter.sol > build/BnusConverterFlattened.sol
  ./node_modules/.bin/truffle-flattener contracts/BnusToken.sol > build/BnusTokenFlattened.sol
  ./node_modules/.bin/truffle-flattener contracts/CnusPoolForStaking.sol > build/CnusPoolForStakingFlattened.sol
  ./node_modules/.bin/truffle-flattener contracts/CnusTokenMockUp.sol > build/CnusTokenMockUpFlattened.sol
  ./node_modules/.bin/truffle-flattener contracts/TokenPool.sol > build/TokenPoolFlattened.sol
  ./node_modules/.bin/truffle-flattener contracts/CoinVerseContractIds.sol > build/CoinVerseContractIdsFlattened.sol
  ./node_modules/.bin/truffle-flattener node_modules/bancor-contracts/solidity/contracts/BancorNetwork.sol > build/BancorNetworkFlattened.sol
  ./node_modules/.bin/truffle-flattener node_modules/bancor-contracts/solidity/contracts/ContractIds.sol > build/ContractIdsFlattened.sol
  ./node_modules/.bin/truffle-flattener node_modules/bancor-contracts/solidity/contracts/converter/BancorConverterFactory.sol > build/BancorConverterFactoryFlattened.sol
  ./node_modules/.bin/truffle-flattener node_modules/bancor-contracts/solidity/contracts/converter/BancorConverterUpgrader.sol > build/BancorConverterUpgraderFlattened.sol
  ./node_modules/.bin/truffle-flattener node_modules/bancor-contracts/solidity/contracts/converter/BancorGasPriceLimit.sol > build/BancorGasPriceLimitFlattened.sol
  ./node_modules/.bin/truffle-flattener node_modules/bancor-contracts/solidity/contracts/converter/BancorFormula.sol > build/BancorFormulaFlattened.sol
  ./node_modules/.bin/truffle-flattener node_modules/bancor-contracts/solidity/contracts/utility/ContractFeatures.sol > build/ContractFeaturesFlattened.sol
  ./node_modules/.bin/truffle-flattener node_modules/bancor-contracts/solidity/contracts/utility/ContractRegistry.sol > build/ContractRegistryFlattened.sol
}
