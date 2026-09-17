// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {Test} from "forge-std/Test.sol";
import {Zeconds} from "./Zeconds.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockPriceOracle} from "./mocks/MockPriceOracle.sol";
import {MockPayoutRouter} from "./mocks/MockPayoutRouter.sol";

contract ZecondsTest is Test {
    Zeconds internal game;
    MockERC20 internal zec;
    MockERC20 internal nvda;
    MockPriceOracle internal oracle;
    MockPayoutRouter internal router;

    address internal owner = address(0xA11CE);
    address internal player = address(0xBEEF);

    uint256 internal constant STAKE = 10 ether;

    function setUp() public {
        zec = new MockERC20("ZEC", "ZEC");
        nvda = new MockERC20("NVDA", "NVDA");
        oracle = new MockPriceOracle();
        router = new MockPayoutRouter(address(zec), address(oracle), owner);

        vm.prank(owner);
        game = new Zeconds(address(zec), address(oracle), address(router), owner);

        vm.prank(owner);
        router.setMarket(address(game));

        oracle.setPrice(address(zec), 1 ether);
        oracle.setPrice(address(nvda), 100 ether);

        zec.mint(player, 1_000 ether);
        nvda.mint(address(router), 1_000 ether);
        zec.mint(address(game), 1_000 ether);

        vm.prank(player);
        zec.approve(address(game), type(uint256).max);
    }

    function _place(bool up) internal returns (uint256 betId) {
        vm.prank(player);
        betId = game.placeBet(address(nvda), 5, up, STAKE);
    }

    function test_quoteWinPayout_5s() public view {
        // 10 * 0.985 * 2 * 0.985 = 19.4045 ether
        assertEq(game.quoteWinPayout(STAKE, 5), 19.4045 ether);
    }

    function test_invalidWindow() public {
        vm.prank(player);
        vm.expectRevert(abi.encodeWithSelector(Zeconds.InvalidWindow.selector, uint32(10)));
        game.placeBet(address(nvda), 10, true, STAKE);
    }

    function test_settleTooEarly() public {
        uint256 betId = _place(true);
        vm.expectRevert(Zeconds.TooEarly.selector);
        game.settle(betId);
    }

    function test_winUp() public {
        uint256 betId = _place(true);
        vm.warp(block.timestamp + 5);
        oracle.setPrice(address(nvda), 101 ether);

        uint256 stockBefore = nvda.balanceOf(player);
        game.settle(betId);

        assertEq(nvda.balanceOf(player) - stockBefore, 0.194045 ether);
        (,,,,, bool settled,,) = game.bets(betId);
        assertTrue(settled);
    }

    function test_lose() public {
        uint256 betId = _place(true);
        uint256 zecBefore = zec.balanceOf(player);
        vm.warp(block.timestamp + 5);
        oracle.setPrice(address(nvda), 99 ether);
        game.settle(betId);
        assertEq(zec.balanceOf(player), zecBefore);
        assertEq(nvda.balanceOf(player), 0);
    }

    function test_tieRefundsFullStake() public {
        uint256 betId = _place(false);
        uint256 zecBefore = zec.balanceOf(player);
        vm.warp(block.timestamp + 5);
        game.settle(betId);
        assertEq(zec.balanceOf(player), zecBefore + STAKE);
        assertEq(nvda.balanceOf(player), 0);
    }
}
