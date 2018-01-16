const web3 = global.web3;
const assert = require('chai').assert;
const bluebird = require('bluebird');
const TimeMachine = require('./utils/time_machine');
const SolAssert = require('./utils/sol_assert');

const BodhiCandy = artifacts.require("../contracts/BodhiCandy.sol");

const ethAsync = bluebird.promisifyAll(web3.eth);

contract('BodhiCandy', (accounts) => {
  const timeMachine = new TimeMachine(web3);
  const getBlockNumber = bluebird.promisify(web3.eth.getBlockNumber);

  let contract;

  beforeEach(timeMachine.snapshot);
  afterEach(timeMachine.revert);

  beforeEach(async () => {
    contract = await BodhiCandy.deployed();
  });

  describe('fallback function', () => {
    it('throws upon sending funds to it', async () => {
      try {
        await ethAsync.sendTransactionAsync({
          to: contract.address,
          from: accounts[0],
          value: 1,
        });
        assert.fail();
      } catch (e) {
        SolAssert.assertRevert(e);
      }
    });
  });
});
