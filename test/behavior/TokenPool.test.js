const chai = require('chai')
const assert = chai.assert
const BigNumber = web3.BigNumber
const should = chai.use(require('chai-bignumber')(BigNumber)).should()
const { Contract, Protocol } = require('../protocol/Bancor')
const { deployContracts, initConverter } = require('../helper')
const TokenPool = artifacts.require('TokenPool.sol')

contract('TokenPool', async (accounts) => {
  let [_, owner, signer, testUser, invalidSigner, testUser2] = accounts
  // It should pass all test cases of the bancor protocol.
  context('It follows the bancor protocol', async () => {
    it('should follow the bancor protocol', async () => {
      Contract(TokenPool).follows(Protocol.TokenHolder)
    })
  })

  context('It has customized features', async () => {
    let contracts
    before(async () => {
      contracts = await deployContracts(artifacts, owner, signer)
    })

    let converter
    let bnusToken
    let cnusToken
    let tokenPool
    beforeEach(async () => {
      [converter, bnusToken, cnusToken, tokenPool] = await initConverter(artifacts, contracts, owner, signer, testUser)
      await converter.withdrawTokens(bnusToken.address, tokenPool.address, web3.toWei(1000000), { from: owner })
    })

    describe('Events', async () => {
      it('should emit Airdrop event when the admin proceeded airdrops', async () => {
        let receipt = await tokenPool.airdropBnus(testUser2, 10000, { from: owner })
        let airdropEvent
        receipt.logs.forEach(log => {
            if (log.event === 'Airdrop') {
              should.not.exist(airdropEvent)
              airdropEvent = log
            }
          }
        )
        should.exist(airdropEvent)
      })
    })
    describe('Getters', async () => {
      describe('getBnusBalance()', async () => {
        it('should return the amount of Bnus the contract is holding', async () => {
          let balance = await tokenPool.getBnusBalance()
          balance.toNumber().should.be.a('number')
        })
      })
      describe('getCnusBalance()', async () => {
        it('should return the amount of Cnus the contract is holding', async () => {
          let balance = await tokenPool.getCnusBalance()
          balance.toNumber().should.be.a('number')
        })
      })
    })
    describe('TxFunctions', async () => {
      const AMOUNT = 10000
      describe('airdropCnus()', async () => {
        beforeEach(async () => {
          await cnusToken.transfer(tokenPool.address, 100000, { from: owner })
        })
        it('should withdraw cnus tokens held by the contract and send them to the designated account', async () => {
          await tokenPool.airdropCnus(testUser2, AMOUNT, { from: owner })
          let balance = await cnusToken.balanceOf(testUser2)
          balance.toNumber().should.equal(AMOUNT)
        })
        it('should allow only the owner to call', async () => {
          try {
            await tokenPool.airdropCnus(testUser2, AMOUNT, { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
      })
      describe('airdropBnus()', async () => {
        it('should withdraw bnus tokens held by the contract and send them to the designated account', async () => {
          await tokenPool.airdropBnus(testUser2, AMOUNT, { from: owner })
          let balance = await bnusToken.balanceOf(testUser2)
          balance.toNumber().should.equal(AMOUNT)
        })
        it('should allow only the owner to call', async () => {
          try {
            await tokenPool.airdropBnus(testUser2, AMOUNT, { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
      })
      describe('batchAirdropCnus()', async () => {
        beforeEach(async () => {
          await cnusToken.transfer(tokenPool.address, 100000, { from: owner })
        })
        it('should withdraw cnus tokens held by the contract and send them to the designated accounts', async () => {
          let initialBalances = {}
          for (let account of accounts.slice(2, 5)) {
            initialBalances[account] = await cnusToken.balanceOf(account)
          }
          await tokenPool.batchAirdropCnus(accounts.slice(2, 5), Array(3).fill(AMOUNT), { from: owner })
          for (let account of accounts.slice(2, 5)) {
            let balance = await cnusToken.balanceOf(account)
            balance.sub(initialBalances[account]).equals(AMOUNT).should.equal(true)
          }
        })
        it('should allow only the owner to call', async () => {
          try {
            await tokenPool.batchAirdropCnus(accounts.slice(1, 4), Array(3).fill(AMOUNT), { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
      })
      describe('batchAirdropBnus()', async () => {
        it('should withdraw bnus tokens held by the contract and send them to the designated accounts', async () => {
          await tokenPool.batchAirdropBnus(accounts.slice(2, 5), Array(3).fill(AMOUNT), { from: owner })
          for (let account of accounts.slice(2, 5)) {
            let balance = await bnusToken.balanceOf(account)
            balance.toNumber().should.equal(AMOUNT)
          }
        })
        it('should allow only the owner to call', async () => {
          try {
            await tokenPool.batchAirdropBnus(accounts.slice(1, 4), Array(3).fill(AMOUNT), { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
      })
      describe('bnusToCnus()', async () => {
        it('should convert holding Bnus to Cnus', async () => {
          let amount = 10000
          let [expectedCnus, fee] = await converter.getSaleReturn(cnusToken.address, amount)
          let initialCnus = await tokenPool.getCnusBalance()
          let initialBnus = await tokenPool.getBnusBalance()
          await tokenPool.bnusToCnus(amount, expectedCnus, { from: owner })
          let updatedCnus = await tokenPool.getCnusBalance()
          let updatedBnus = await tokenPool.getBnusBalance()
          updatedCnus.toNumber().should.equal(initialCnus.toNumber() + expectedCnus.toNumber() + fee.toNumber())
          updatedBnus.toNumber().should.equal(initialBnus.toNumber() - amount)
        })
        it('should allow only the owner to call', async () => {
          let amount = 10000
          let [expectedCnus, fee] = await converter.getSaleReturn(cnusToken.address, amount)
          try {
            await tokenPool.bnusToCnus(amount, expectedCnus, { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
      })
      describe('cnusToBnus()', async () => {
        beforeEach(async () => {
          await cnusToken.transfer(tokenPool.address, 100000, { from: owner })
        })
        it('should convert holding Cnus to Bnus', async () => {
          let amount = 10000
          let [expectedBnus, fee] = await converter.getPurchaseReturn(cnusToken.address, amount)
          let initialCnus = await tokenPool.getCnusBalance()
          let initialBnus = await tokenPool.getBnusBalance()
          await tokenPool.cnusToBnus(amount, expectedBnus, { from: owner })
          let updatedCnus = await tokenPool.getCnusBalance()
          let updatedBnus = await tokenPool.getBnusBalance()
          updatedCnus.toNumber().should.equal(initialCnus.toNumber() - amount)
          updatedBnus.toNumber().should.equal(initialBnus.toNumber() + expectedBnus.toNumber() + fee.toNumber())
        })
        it('should allow only the owner to call', async () => {
          let amount = 10000
          let [expectedBnus, fee] = await converter.getPurchaseReturn(cnusToken.address, amount)
          try {
            await tokenPool.cnusToBnus(amount, expectedBnus, { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
      })
    })
  })
})