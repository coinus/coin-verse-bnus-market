const { Contract, Protocol } = require('../protocol/Bancor')

const BnusToken = artifacts.require('BnusToken.sol')

contract('BnusToken', async () => {
  // Basically, it should pass all test cases of the bancor protocol.
  it('should follow the bancor protocol', async () => {
    Contract(BnusToken).follows(Protocol.SmartToken)
  })
})