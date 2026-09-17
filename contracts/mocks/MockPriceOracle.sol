// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IPriceOracle} from "../interfaces/IPriceOracle.sol";

contract MockPriceOracle is IPriceOracle {
    mapping(address => uint256) public price;

    function setPrice(address asset, uint256 p) external {
        price[asset] = p;
    }

    function getPrice(address asset) external view returns (uint256) {
        return price[asset];
    }

    function getPriceAt(address asset, uint256) external view returns (uint256) {
        return price[asset];
    }
}
