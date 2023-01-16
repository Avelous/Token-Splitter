// contracts/OurToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestWeth is ERC20 {
    constructor() ERC20("TestWeth", "TWETH") {
        _mint(msg.sender, 10000000 * 1e18);
    }
}
