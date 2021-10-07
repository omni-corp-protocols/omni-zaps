// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.12;

contract MockExternalContract {
    uint256 public num;
    string public str;
    address public addr;
    uint256 public value;
    uint256[3] public nums;

    function setNum(uint256 _num) public {
        num = _num;
    }

    function setNumAndValue(uint256 _num) public payable {
        num = _num;
        value = msg.value;
    }

    function setStrAndAddr(string memory _str, address _addr) public {
        str = _str;
        addr = _addr;
    }

    function setStrAddrAndValue(string memory _str, address _addr) public payable {
        str = _str;
        addr = _addr;
        value = msg.value;
    }

    function revertWithReason(string memory _reason) public {
        num = num;
        revert(_reason);
    }

    function revertWithoutReason() public {
        num = num;
        // solhint-disable-next-line
        revert();
    }

    function setComplexTypes(uint256[3] memory _nums, uint256 _num) public {
        nums = _nums;
        num = _num;
    }
}
