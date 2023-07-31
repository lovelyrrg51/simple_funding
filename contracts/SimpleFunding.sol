// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./SafeERC20.sol";
import "./ReentrancyGuard.sol";

/**
 * Simple Funding Contract
 */
contract SimpleFunding is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /** ========================== SimpleFunding Modifiers ========================== */
    // ERC20 Transfer Modifier
    modifier isERC20Transferable(address tokenAddress, uint256 amount) {
        // Check Balance of Contract
        require(amount > 0, "SimpleFunding: Transfer amount should be bigger than zero.");
        require(IERC20(tokenAddress).balanceOf(address(this)) >= amount, "SimpleFunding: Insuffcient ERC20 Transfer Amount");
        _;
    }
    // ETH Transfer Modifier
    modifier isETHTransferable() {
        require(address(this).balance > 0, "SimpleFunding: ETH amount should be bigger than zero.");
        _;
    }

    /** ========================== SimpleFunding Events ========================== */
    // ERC20(Token) Transfer Event
    event TokenTransferEvent(address indexed tokenAddress, address indexed recipient, uint256 indexed amount);
    // ETH Transfer Event
    event ETHTransferEvent(address indexed recipient, uint256 indexed amount);

    /** ========================== SimpleFunding Function ========================== */
    /**
     * @dev Transfer ERC20 Token Function
     * @param tokenAddress: ERC20 Token Address
     * @param recipient: ERC20 Recipient Address
     * @param amount: Transferring Token Amount
     */
    function transferToken(
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external nonReentrant isERC20Transferable(tokenAddress, amount) {
        // Safe Transfer to Recipient
        IERC20(tokenAddress).safeTransfer(recipient, amount);

        // Emit The Event
        emit TokenTransferEvent(tokenAddress, recipient, amount);
    }

    /**
     * @dev Transfer ETH Function
     * @param recipient: ETH Recipient Address
     */
    function transferEth(address payable recipient) external nonReentrant isETHTransferable {
        // Get ETH Balance of Contract
        uint256 ethBalance = address(this).balance;

        // Transfer ETH to Recipient Address
        bool sent = recipient.send(ethBalance);
        require(sent, "SimpleFunding: Failed to Transfer ETH");

        // Emit The Event
        emit ETHTransferEvent(recipient, ethBalance);
    }
}