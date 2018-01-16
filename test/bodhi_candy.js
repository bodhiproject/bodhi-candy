const web3 = global.web3;
const assert = require('chai').assert;
const bluebird = require('bluebird');

const BodhiCandy = artifacts.require("../contracts/BodhiCandy.sol");
const SolAssert = require('../utils/sol_assert');

const ethAsync = bluebird.promisifyAll(web3.eth);

contract('BodhiCandy', (accounts) => {

  describe('fallback function', () => {
    it('throws upon sending funds to it', async () => {
      try {
        await ethAsync.sendTransactionAsync({
          to: centralizedOracle.address,
          from: USER1,
          value: 1,
        });
        assert.fail();
      } catch (e) {
        SolAssert.assertRevert(e);
      }
    });
  });
});
