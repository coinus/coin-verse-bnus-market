const chai = require('chai')
const assert = chai.assert
const BigNumber = web3.BigNumber
const should = chai.use(require('chai-bignumber')(BigNumber)).should()
const { Contract, Protocol } = require('../protocol/Bancor')
const { deployContracts, initConverter, encodePacked, toUint256 } = require('../helper')

const CnusPoolForStaking = artifacts.require('CnusPoolForStaking.sol')

contract('CnusPoolForStaking', async (accounts) => {
  let [_, owner, signer, testUser, invalidSigner] = accounts
  // It should pass all test cases of the bancor protocol.
  context('It follows the bancor protocol', async () => {
    it('should follow the bancor protocol', async () => {
      Contract(CnusPoolForStaking).follows(Protocol.TokenHolder)
    })
  })

  context('It has customized features', async () => {
    let contracts
    beforeEach(async () => {
      contracts = await deployContracts(artifacts, owner, signer)
    })

    let converter, bnusToken, cnusToken, tokenPool, cnusPoolForStaking
    beforeEach(async () => {
      [converter, bnusToken, cnusToken, tokenPool] = await initConverter(artifacts, contracts, owner, signer, testUser)
      cnusPoolForStaking = contracts.cnusPoolForStaking
      for (let account of accounts.slice(1, 5)) {
        await cnusToken.transfer(account, 100000, { from: owner })
      }
    })

    const AMOUNT = 10000
    describe('Events', async () => {
      it('should emit Deposit event when a user stakes Cnus', async () => {
        for (let account of accounts.slice(1, 5)) {
          let expiration = Math.round((new Date).getTime() / 1000) + 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(signer, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, signer)
          }
          await cnusToken.approve(cnusPoolForStaking.address, AMOUNT, { from: account })
          let receipt = await cnusPoolForStaking.stake(AMOUNT, expiration, signature, { from: account })
          let depositEvent
          receipt.logs.forEach(log => {
              if (log.event === 'Deposit') {
                should.not.exist(depositEvent)
                depositEvent = log
              }
            }
          )
          should.exist(depositEvent)
        }

      })
      it('should emit Withdrawal event when a user withdraw staked Cnus', async () => {
        for (let account of accounts.slice(1, 5)) {
          let expiration = Math.round((new Date).getTime() / 1000) + 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(signer, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, signer)
          }
          await cnusToken.approve(cnusPoolForStaking.address, AMOUNT, { from: account })
          await cnusPoolForStaking.stake(AMOUNT, expiration, signature, { from: account })
        }
        for (let account of accounts.slice(1, 5)) {
          let expiration = Math.round((new Date).getTime() / 1000) + 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(signer, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, signer)
          }
          let receipt = await cnusPoolForStaking.withdraw(AMOUNT, expiration, signature, { from: account })
          let withdrawalEvent
          receipt.logs.forEach(log => {
              if (log.event === 'Withdrawal') {
                should.not.exist(withdrawalEvent)
                withdrawalEvent = log
              }
            }
          )
          should.exist(withdrawalEvent)
        }
      })
    })

    describe('Getters', async () => {
      beforeEach(async () => {
        for (let account of accounts.slice(1, 5)) {
          let stakedAmount = await cnusPoolForStaking.getStakedAmount({ from: account })
          let expiration = Math.round((new Date).getTime() / 1000) + 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(signer, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, signer)
          }
          await cnusToken.approve(cnusPoolForStaking.address, AMOUNT, { from: account })
          await cnusPoolForStaking.stake(AMOUNT, expiration, signature, { from: account })
        }
      })
      describe('getStakedAmount()', async () => {
        it('should return the amount of Cnus staked by the message sender', async () => {
          for (let account of accounts.slice(1, 5)) {
            let stakedAmount = await cnusPoolForStaking.getStakedAmount({ from: account })
            stakedAmount.toNumber().should.equal(AMOUNT)
          }
        })
      })
      describe('stakeOf()', async () => {
        it('should return the amount of Cnus staked by an account', async () => {
          for (let account of accounts.slice(1, 5)) {
            let stakedAmount = await cnusPoolForStaking.stakeOf(account)
            stakedAmount.toNumber().should.equal(AMOUNT)
          }
        })
      })
    })
    describe('TxFunctions', async () => {
      describe('setCoinUsAccount()', async () => {
        it('should assign the given address as a signer address', async () => {
          await cnusPoolForStaking.setCoinUsAccount(signer, { from: owner })
          let coinUsAccount = await cnusPoolForStaking.coinUsAccount.call()
          coinUsAccount.should.equal(signer)
        })
        it('should be called by only the owner', async () => {
          try {
            await cnusPoolForStaking.setCoinUsAccount(signer, { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
      })
      describe('stake()', async () => {
        it('should transfer Cnus from users account to the contract itself', async () => {
          let expiration = Math.round((new Date).getTime() / 1000) + 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(signer, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, signer)
          }
          await cnusToken.approve(cnusPoolForStaking.address, AMOUNT, { from: testUser })
          await cnusPoolForStaking.stake(AMOUNT, expiration, signature, { from: testUser })
          let stakedAmount = await cnusPoolForStaking.getStakedAmount({ from: testUser })
          stakedAmount.toNumber().should.equal(AMOUNT)
        })
        it('should check signature is signed with the registered address', async () => {
          let expiration = Math.round((new Date).getTime() / 1000) + 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(invalidSigner, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, invalidSigner)
          }
          await cnusToken.approve(cnusPoolForStaking.address, AMOUNT, { from: testUser })
          try {
            await cnusPoolForStaking.stake(AMOUNT, expiration, signature, { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
        it('should check expiration date is valid', async () => {
          let invalidExpiration = Math.round((new Date).getTime() / 1000) - 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(invalidExpiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(signer, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(invalidExpiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, signer)
          }
          await cnusToken.approve(cnusPoolForStaking.address, AMOUNT, { from: testUser })
          try {
            await cnusPoolForStaking.stake(AMOUNT, invalidExpiration, signature, { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
      })
      describe('withdraw()', async () => {
        beforeEach(async () => {
          let expiration = Math.round((new Date).getTime() / 1000) + 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(signer, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, signer)
          }
          await cnusToken.approve(cnusPoolForStaking.address, AMOUNT, { from: testUser })
          await cnusPoolForStaking.stake(AMOUNT, expiration, signature, { from: testUser })
          let stakedAmount = await cnusPoolForStaking.getStakedAmount({ from: testUser })
          stakedAmount.toNumber().should.equal(AMOUNT)
        })
        it('should transfer Cnus from the contract to the user\'s account', async () => {
          let expiration = Math.round((new Date).getTime() / 1000) + 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(signer, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, signer)
          }
          let initialCnus = await cnusToken.balanceOf(testUser)
          await cnusPoolForStaking.withdraw(AMOUNT, expiration, signature, { from: testUser })
          let stakedAmount = await cnusPoolForStaking.getStakedAmount({ from: testUser })
          let updatedCnus = await cnusToken.balanceOf(testUser)
          stakedAmount.toNumber().should.equal(0)
          updatedCnus.toNumber().should.equal(initialCnus.toNumber() + AMOUNT)
        })
        it('should check udid & signature is signed with the registered address', async () => {
          let expiration = Math.round((new Date).getTime() / 1000) + 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(invalidSigner, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(expiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, invalidSigner)
          }
          try {
            await cnusPoolForStaking.withdraw(AMOUNT, expiration, signature, { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
        it('should check expiration date is valid', async () => {
          let invalidExpiration = Math.round((new Date).getTime() / 1000) - 300
          let hashToSign, signature
          if (web3.version.api < '1.0.0') {
            hashToSign = web3.sha3(encodePacked([toUint256(AMOUNT), toUint256(invalidExpiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(signer, hashToSign)
          } else {
            hashToSign = web3.utils.sha3(encodePacked([toUint256(AMOUNT), toUint256(invalidExpiration)]), { encoding: 'hex' })
            signature = web3.eth.sign(hashToSign, signer)
          }
          try {
            await cnusPoolForStaking.withdraw(AMOUNT, invalidExpiration, signature, { from: testUser })
            assert(false)
          } catch (e) {
            e.message.includes('revert').should.equal(true)
          }
        })
      })
    })
  })
})
