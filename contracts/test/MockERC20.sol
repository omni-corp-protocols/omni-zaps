// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _supply
    ) public ERC20(_name, _symbol) {
        _mint(msg.sender, _supply);
    }

    function allocateTo(address account, uint256 amount) public {
        _mint(account, amount);
    }
}
