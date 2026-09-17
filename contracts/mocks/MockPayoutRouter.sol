// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPayoutRouter} from "../interfaces/IPayoutRouter.sol";
import {IPriceOracle} from "../interfaces/IPriceOracle.sol";

contract MockPayoutRouter is IPayoutRouter, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable zec;
    IPriceOracle public oracle;
    address public market;

    error NotMarket();
    error NoPrice();
    error ZeroOut();

    constructor(address zec_, address oracle_, address owner_) Ownable(owner_) {
        zec = IERC20(zec_);
        oracle = IPriceOracle(oracle_);
    }

    function setMarket(address market_) external onlyOwner {
        market = market_;
    }

    function setOracle(address oracle_) external onlyOwner {
        oracle = IPriceOracle(oracle_);
    }

    function payout(address to, address stockToken, uint256 zecAmount) external {
        if (msg.sender != market) revert NotMarket();

        uint256 zecPrice = oracle.getPrice(address(zec));
        uint256 stockPrice = oracle.getPrice(stockToken);
        if (zecPrice == 0 || stockPrice == 0) revert NoPrice();

        uint256 stockAmount = (zecAmount * zecPrice) / stockPrice;
        if (stockAmount == 0) revert ZeroOut();

        zec.safeTransferFrom(msg.sender, address(this), zecAmount);
        IERC20(stockToken).safeTransfer(to, stockAmount);
    }
}
