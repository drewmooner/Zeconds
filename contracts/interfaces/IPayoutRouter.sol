// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @notice Converts ZEC from the game pool into `stockToken` and sends it to the winner.
interface IPayoutRouter {
    function payout(address to, address stockToken, uint256 zecAmount) external;
}
