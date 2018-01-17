pragma solidity ^0.4.18;

import './libs/SafeMath.sol';

contract BodhiCandy {
    using SafeMath for uint256;

    // Amount in Satoshi to deposit
    uint256 public constant depositAmount = 1000000;

    // Amount of blocks it takes for the last person to deposit to win if no others deposit within the length.
    uint256 public constant winningBlockLength = 30;

    address public lastDepositer;
    uint256 public lastDepositBlock;
    uint256 public currentBalance;

    event UserWon(address indexed winner, uint256 amountWon);
    event Returned(uint256 returned);

    function deposit() external payable {
        require(msg.value >= depositAmount);

        // Calculate any amount over the depositAmount to return to user
        uint256 excessDeposit = 0;
        if (msg.value > depositAmount) {
            excessDeposit = msg.value.sub(depositAmount);
        }

        // Last depositer wins
        if (lastDepositer != address(0) 
            && lastDepositBlock != 0 
            && block.number.sub(lastDepositBlock) >= winningBlockLength
            && currentBalance > 0) {

            uint256 amountWon = currentBalance.add(excessDeposit);
            currentBalance = 0;

            if (amountWon > 0) {
                lastDepositer.transfer(amountWon);
                UserWon(lastDepositer, amountWon);

                lastDepositer = msg.sender;
                lastDepositBlock = block.number;
                currentBalance = depositAmount;
            }
        } else {
            lastDepositer = msg.sender;
            lastDepositBlock = block.number;
            currentBalance = currentBalance.add(depositAmount);

            // Return any deposits over the deposit amount
            if (excessDeposit > 0) {
                msg.sender.transfer(excessDeposit);
                Returned(excessDeposit);
            }
        }
    }

    /*
    * @notice Return payment if QTUM sent to contract. Forces user to use the deposit method.
    */
    function() external payable {
        revert();
    }
}
