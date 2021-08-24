// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.12;

contract MockExternalContract {
    uint256 public num;
    string public str;
    address public addr;
    uint256 public value;

    function setNum(uint256 _num) public {
        num = _num;
    }

    function setNumAndValue(uint256 _num) public payable {
        num = _num;
        value = msg.value;
    }
}
