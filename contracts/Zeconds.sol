// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IPriceOracle} from "./interfaces/IPriceOracle.sol";
import {IPayoutRouter} from "./interfaces/IPayoutRouter.sol";

/// @title Zeconds
/// @notice House-odds seconds market. Stake ZEC; win in the stock token; flat price refunds in full.
contract Zeconds is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BPS = 10_000;
    uint256 public constant FEE_BPS = 150;

    IERC20 public zec;
    IPriceOracle public oracle;
    IPayoutRouter public payoutRouter;

    uint256 public nextBetId;
    uint256 public minStake;

    struct Bet {
        address player;
        address stockToken;
        uint64 startTime;
        uint32 window;
        bool up;
        bool settled;
        uint256 stake;
        uint256 startPrice;
    }

    mapping(uint256 => Bet) public bets;

    error InvalidWindow(uint32 window);
    error ZeroAddress();
    error ZeroStake();
    error StakeTooSmall();
    error NoPrice();
    error TooEarly();
    error AlreadySettled();
    error BadBet();

    event OracleUpdated(address indexed oracle);
    event PayoutRouterUpdated(address indexed router);
    event ZecUpdated(address indexed zec);
    event MinStakeUpdated(uint256 minStake);
    event BetPlaced(
        uint256 indexed betId,
        address indexed player,
        address indexed stockToken,
        uint32 window,
        bool up,
        uint256 stake,
        uint256 startPrice,
        uint64 startTime
    );
    event BetWon(uint256 indexed betId, uint256 endPrice, uint256 payoutZec);
    event BetLost(uint256 indexed betId, uint256 endPrice);
    event BetTied(uint256 indexed betId, uint256 price);

    constructor(
        address zec_,
        address oracle_,
        address payoutRouter_,
        address owner_
    ) Ownable(owner_) {
        if (oracle_ == address(0) || payoutRouter_ == address(0) || owner_ == address(0)) {
            revert ZeroAddress();
        }
        zec = IERC20(zec_);
        oracle = IPriceOracle(oracle_);
        payoutRouter = IPayoutRouter(payoutRouter_);
        minStake = 1e15;
    }

    function setOracle(address oracle_) external onlyOwner {
        if (oracle_ == address(0)) revert ZeroAddress();
        oracle = IPriceOracle(oracle_);
        emit OracleUpdated(oracle_);
    }

    function setPayoutRouter(address payoutRouter_) external onlyOwner {
        if (payoutRouter_ == address(0)) revert ZeroAddress();
        payoutRouter = IPayoutRouter(payoutRouter_);
        emit PayoutRouterUpdated(payoutRouter_);
    }

    function setZec(address zec_) external onlyOwner {
        zec = IERC20(zec_);
        emit ZecUpdated(zec_);
    }

    function setMinStake(uint256 minStake_) external onlyOwner {
        minStake = minStake_;
        emit MinStakeUpdated(minStake_);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function oddsBps(uint32 window) public pure returns (uint256) {
        if (window == 5) return 20_000;
        if (window == 15) return 18_000;
        if (window == 30) return 16_500;
        if (window == 45) return 15_000;
        if (window == 60) return 13_500;
        revert InvalidWindow(window);
    }

    /// @notice ZEC-value the winner receives in stock after both 1.5% cuts. Reverts on a bad window.
    function quoteWinPayout(uint256 stake, uint32 window) public pure returns (uint256) {
        uint256 stakeNet = (stake * (BPS - FEE_BPS)) / BPS;
        uint256 gross = (stakeNet * oddsBps(window)) / BPS;
        return (gross * (BPS - FEE_BPS)) / BPS;
    }

    function placeBet(address stockToken, uint32 window, bool up, uint256 stake)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 betId)
    {
        oddsBps(window);
        if (stockToken == address(0)) revert ZeroAddress();
        if (stake == 0) revert ZeroStake();
        if (stake < minStake) revert StakeTooSmall();

        uint256 startPrice = oracle.getPrice(stockToken);
        if (startPrice == 0) revert NoPrice();

        zec.safeTransferFrom(msg.sender, address(this), stake);

        betId = nextBetId++;
        uint64 startTime = uint64(block.timestamp);
        bets[betId] = Bet({
            player: msg.sender,
            stockToken: stockToken,
            startTime: startTime,
            window: window,
            up: up,
            settled: false,
            stake: stake,
            startPrice: startPrice
        });

        emit BetPlaced(betId, msg.sender, stockToken, window, up, stake, startPrice, startTime);
    }

    function settle(uint256 betId) external nonReentrant {
        Bet storage bet = bets[betId];
        if (bet.player == address(0)) revert BadBet();
        if (bet.settled) revert AlreadySettled();
        uint256 endTime = uint256(bet.startTime) + uint256(bet.window);
        if (block.timestamp < endTime) revert TooEarly();

        uint256 endPrice = oracle.getPriceAt(bet.stockToken, endTime);
        if (endPrice == 0) revert NoPrice();

        bet.settled = true;

        if (endPrice == bet.startPrice) {
            zec.safeTransfer(bet.player, bet.stake);
            emit BetTied(betId, endPrice);
            return;
        }

        bool wentUp = endPrice > bet.startPrice;
        if (wentUp != bet.up) {
            emit BetLost(betId, endPrice);
            return;
        }

        uint256 payoutZec = quoteWinPayout(bet.stake, bet.window);
        zec.forceApprove(address(payoutRouter), payoutZec);
        payoutRouter.payout(bet.player, bet.stockToken, payoutZec);
        emit BetWon(betId, endPrice, payoutZec);
    }
}
