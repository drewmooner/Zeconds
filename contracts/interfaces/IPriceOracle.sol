// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

interface IPriceOracle {
    function getPrice(address asset) external view returns (uint256);
    function getPriceAt(address asset, uint256 timestamp) external view returns (uint256);
}
