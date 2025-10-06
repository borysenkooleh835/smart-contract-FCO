// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("Test Token", "TEST") {
        // Mint 1,000,000 tokens to the contract deployer
        // 18 decimals means we need to multiply by 10^18
        _mint(msg.sender, 1000000 * 10**18);
    }
}
