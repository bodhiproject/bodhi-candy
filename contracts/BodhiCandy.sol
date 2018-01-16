pragma solidity ^0.4.18;

import './libs/SafeMath.sol';

contract BodhiCandy {
    using SafeMath for uint256;

    // The amount of blocks it takes for the last person to deposit to win if no others deposit within the length.
    uint256 public constant winningBlockLength = 30;

    address public lastDepositer;
    uint256 public lastDepositBlock;
    uint256 public currentBalance;

    function deposit() external payable {
        require(msg.value >= 1000000);

    }

    /*
    * @notice Return payment if QTUM sent to contract. Forces user to use the deposit method.
    */
    function() external payable {
        revert();
    }
}
