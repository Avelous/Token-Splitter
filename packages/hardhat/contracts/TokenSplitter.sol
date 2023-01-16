// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenSplitter {
    function splitTokensEqually(
        address[] memory _recipients,
        address _tokenAddress,
        uint256 _amountForEach
    ) public {
        ERC20 erc20Token = ERC20(_tokenAddress);
        for (uint256 i = 0; i < _recipients.length; i++) {
            erc20Token.transferFrom(msg.sender, _recipients[i], _amountForEach);
        }
    }

    function splitTokensUnEqually(
        address[] memory _recipients,
        address _tokenAddress,
        uint256[] memory _amountForEach
    ) public {
        ERC20 erc20Token = ERC20(_tokenAddress);
        for (uint256 i = 0; i < _recipients.length; i++) {
            erc20Token.transferFrom(
                msg.sender,
                _recipients[i],
                _amountForEach[i]
            );
        }
    }
}
