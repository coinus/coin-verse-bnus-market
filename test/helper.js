module.exports = {
  deployContracts: async (artifacts, owner, signer) => {
    const BancorFormula = artifacts.require('BancorFormula.sol')
    const BancorNetwork = artifacts.require('BancorNetwork.sol')
    const BancorGasPriceLimit = artifacts.require('BancorGasPriceLimit.sol')
    const BancorConverterFactory = artifacts.require('BancorConverterFactory.sol')
    const BancorConverterUpgrader = artifacts.require('BancorConverterUpgrader.sol')
    const TokenPool = artifacts.require('TokenPool.sol')
    const ContractIds = artifacts.require('ContractIds.sol')
    const CoinVerseContractIds = artifacts.require('CoinVerseContractIds.sol')
    const ContractFeatures = artifacts.require('ContractFeatures.sol')
    const ContractRegistry = artifacts.require('ContractRegistry.sol')
    const CnusPoolForStaking = artifacts.require('CnusPoolForStaking.sol')
    let contractRegistry
    let contractIds
    let coinVerseContractIds
    let contractFeatures
    let upgrader
    let tokenPool
    let cnusPoolForStaking
    contractRegistry = await ContractRegistry.new({ from: owner })
    contractIds = await ContractIds.new({ from: owner })
    coinVerseContractIds = await CoinVerseContractIds.new({ from: owner })

    contractFeatures = await ContractFeatures.new({ from: owner })
    let contractFeaturesId = await contractIds.CONTRACT_FEATURES.call({ from: owner })
    await contractRegistry.registerAddress(contractFeaturesId, contractFeatures.address, { from: owner })

    let gasPriceLimit = await BancorGasPriceLimit.new(30000000000, { from: owner }) // 30gwei
    let gasPriceLimitId = await contractIds.BANCOR_GAS_PRICE_LIMIT.call({ from: owner })
    await contractRegistry.registerAddress(gasPriceLimitId, gasPriceLimit.address, { from: owner })

    let formula = await BancorFormula.new({ from: owner })
    let formulaId = await contractIds.BANCOR_FORMULA.call({ from: owner })
    await contractRegistry.registerAddress(formulaId, formula.address, { from: owner })

    let bancorNetwork = await BancorNetwork.new(contractRegistry.address, { from: owner })
    let bancorNetworkId = await contractIds.BANCOR_NETWORK.call({ from: owner })
    await contractRegistry.registerAddress(bancorNetworkId, bancorNetwork.address, { from: owner })
    await bancorNetwork.setSignerAddress(signer, { from: owner })

    let factory = await BancorConverterFactory.new({ from: owner })
    let bancorConverterFactoryId = await contractIds.BANCOR_CONVERTER_FACTORY.call({ from: owner })
    await contractRegistry.registerAddress(bancorConverterFactoryId, factory.address, { from: owner })

    upgrader = await BancorConverterUpgrader.new(contractRegistry.address, { from: owner })
    let bancorConverterUpgraderId = await contractIds.BANCOR_CONVERTER_UPGRADER.call({ from: owner })
    await contractRegistry.registerAddress(bancorConverterUpgraderId, upgrader.address, { from: owner })

    tokenPool = await TokenPool.new({ from: owner })
    await tokenPool.setRegistry(contractRegistry.address, { from: owner })
    let tokenPoolId = await coinVerseContractIds.TOKEN_POOL.call({ from: owner })
    await contractRegistry.registerAddress(tokenPoolId, tokenPool.address, { from: owner })

    cnusPoolForStaking = await CnusPoolForStaking.new({ from: owner })
    await cnusPoolForStaking.setRegistry(contractRegistry.address, { from: owner })
    await cnusPoolForStaking.setCoinUsAccount(signer, { from: owner })
    let cnusPoolForStakingId = await coinVerseContractIds.CNUS_POOL_FOR_STAKING.call({ from: owner })
    await contractRegistry.registerAddress(cnusPoolForStakingId, cnusPoolForStaking.address, { from: owner })

    return {
      contractRegistry,
      contractIds,
      coinVerseContractIds,
      contractFeatures,
      upgrader,
      tokenPool,
      cnusPoolForStaking
    }
  },
  initConverter: async (artifacts, contracts, owner, signer, testUser) => {
    const BnusToken = artifacts.require('BnusToken.sol')
    const CnusTokenMockUp = artifacts.require('CnusTokenMockUp.sol')
    const BnusConverter = artifacts.require('BnusConverter.sol')

    let bnusToken = await BnusToken.new('CoinUs', 'BNUS', 18, { from: owner })
    let cnusToken = await CnusTokenMockUp.new({ from: owner })

    let bnusTokenId = await contracts.coinVerseContractIds.BNUS_TOKEN.call({ from: owner })
    let cnusTokenId = await contracts.coinVerseContractIds.CNUS_TOKEN.call({ from: owner })
    await contracts.contractRegistry.registerAddress(bnusTokenId, bnusToken.address, { from: owner })
    await contracts.contractRegistry.registerAddress(cnusTokenId, cnusToken.address, { from: owner })

    let bnusConverter = await BnusConverter.new(
      bnusToken.address,
      contracts.contractRegistry.address,
      100000,
      cnusToken.address,
      50000,
      { from: owner }
    )
    await bnusConverter.setCoinUsAccount(signer, { from: owner })
    await bnusConverter.setConversionFee(10000, { from: owner })
    await bnusToken.issue(bnusConverter.address, web3.toWei(20000000), { from: owner })
    await bnusToken.transferOwnership(bnusConverter.address, { from: owner })
    await bnusConverter.acceptTokenOwnership({ from: owner })

    await cnusToken.transfer(bnusConverter.address, web3.toWei(1000000), { from: owner })
    await cnusToken.transfer(testUser, web3.toWei(1000000), { from: owner })

    return [bnusConverter, bnusToken, cnusToken, contracts.tokenPool]
  },
  toUint256: (number) => {
    let hex = web3.toHex(number).slice(2)
    return '0x' + Array(64 - hex.length).fill(0).join('') + hex
  },
  encodePacked: (bytes) => {
    bytes.should.be.a('Array')
    return bytes.reduce((res, item) => {
      if (res === undefined) res = '0x'
      return res + item.slice(2)
    })
  }
}
