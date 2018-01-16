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

  const USER0 = accounts[0];
  const USER1 = accounts[1];
  const USER2 = accounts[2];
  const USER3 = accounts[3];
 
  let contract;
  let depositAmount;
  let winningBlockLength;

  beforeEach(timeMachine.snapshot);
  afterEach(timeMachine.revert);

  beforeEach(async () => {
    contract = await BodhiCandy.deployed();
    depositAmount = await contract.depositAmount.call();
    winningBlockLength = await contract.winningBlockLength.call();
  });

  describe('deposit()', () => {
    it('sends the funds to the winner', async () => {
      assert.equal(await contract.lastDepositer.call(), 0);
      assert.equal(await contract.lastDepositBlock.call(), 0);
      assert.equal(await contract.currentBalance.call(), 0);
      assert.equal(web3.eth.getBalance(contract.address), 0);

      await contract.deposit({ 
        value: depositAmount,
        from: USER0
      });
      assert.equal(await contract.lastDepositer.call(), USER0);
      assert.equal(await contract.lastDepositBlock.call(), await getBlockNumber());
      assert.equal((await contract.currentBalance.call()).toString(), depositAmount.toString());
      assert.equal(web3.eth.getBalance(contract.address).toString(), depositAmount.toString());

      await contract.deposit({ 
        value: depositAmount,
        from: USER1
      });
      assert.equal(await contract.lastDepositer.call(), USER1);
      assert.equal(await contract.lastDepositBlock.call(), await getBlockNumber());  
      assert.equal((await contract.currentBalance.call()).toString(), depositAmount.mul(2).toString());
      assert.equal(web3.eth.getBalance(contract.address).toString(), depositAmount.mul(2).toString());

      await contract.deposit({ 
        value: depositAmount,
        from: USER2
      });
      assert.equal(await contract.lastDepositer.call(), USER2);
      assert.equal(await contract.lastDepositBlock.call(), await getBlockNumber());  
      assert.equal((await contract.currentBalance.call()).toString(), depositAmount.mul(3).toString());
      assert.equal(web3.eth.getBalance(contract.address).toString(), depositAmount.mul(3).toString());
      const winnerBalanceBefore = web3.eth.getBalance(accounts[2]);

      const lastDepositBlock = await contract.lastDepositBlock.call();
      await timeMachine.mineTo(await getBlockNumber() + winningBlockLength.toNumber());
      assert.equal(await getBlockNumber(), lastDepositBlock.add(winningBlockLength).toNumber());

      // Send funds to winner: accounts[2]
      await contract.deposit({ 
        value: depositAmount,
        from: USER3
      });
      assert.equal(await contract.lastDepositer.call(), USER3);
      assert.equal(await contract.lastDepositBlock.call(), await getBlockNumber());  
      assert.equal((await contract.currentBalance.call()).toString(), depositAmount.toString());
      assert.equal(web3.eth.getBalance(contract.address).toString(), depositAmount.toString());
    });

    it('throws if msg.value < depositAmount', async () => {
      try {
        await contract.deposit({ value: 1 });
        assert.fail();
      } catch (e) {
        SolAssert.assertRevert(e);
      }
    }); 
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
