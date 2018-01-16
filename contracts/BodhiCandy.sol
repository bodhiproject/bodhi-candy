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

    function deposit() external payable {
        require(msg.value >= depositAmount);

        // Last depositer wins
        if (lastDepositer != address(0) 
            && lastDepositBlock != 0 
            && block.number - lastDepositBlock >= winningBlockLength) {

            uint256 amountWon = currentBalance - depositAmount;
            currentBalance = 0;

            if (amountWon > 0) {
                lastDepositer.transfer(amountWon);

                lastDepositer = msg.sender;
                lastDepositBlock = block.number;
                currentBalance = depositAmount;
            }
        } else {
            lastDepositer = msg.sender;
            lastDepositBlock = block.number;
            currentBalance += depositAmount

            // Return any deposits over the deposit amount
            if (msg.value > depositAmount) {
                msg.sender.transfer(msg.value - depositAmount);
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
