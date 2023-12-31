// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Ownable.sol";

library StorageSlot {
    function getAddressAt(bytes32 slot) internal view returns (address a) {
        assembly {
            a := sload(slot)
        }
    }

    function setAddressAt(bytes32 slot, address address_) internal {
        assembly {
            sstore(slot, address_)
        }
    }
}

contract SimpleFundingProxy is Ownable {
    bytes32 private constant _IMPL_SLOT =
        bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);

    /**
     * @dev Set implementation contract address to Proxy contract. Only owner call it.
     */
    function setImplementation(address implementation_) public onlyOwner {
        StorageSlot.setAddressAt(_IMPL_SLOT, implementation_);
    }

    /**
     * @dev Get implementation contract address.
     */
    function getImplementation() public view returns (address) {
        return StorageSlot.getAddressAt(_IMPL_SLOT);
    }

    /**
     * @dev Delegates the current call to `implementation`.
     *
     * This function does not return to its internal call site, it will return directly to the external caller.
     */
    function _delegate(address impl) internal virtual {
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())

            let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)

            let size := returndatasize()
            returndatacopy(ptr, 0, size)

            switch result
            case 0 {
                revert(ptr, size)
            }
            default {
                return(ptr, size)
            }
        }
    }

    /**
     * @dev Fallback function that delegates calls to the address . Will run if call data
     * is empty.
     */
    receive() payable external {}

    /**
     * @dev Fallback function that delegates calls to the address . Will run if no other
     * function in the contract matches the call data.
     */
    fallback() payable external {
        _delegate(StorageSlot.getAddressAt(_IMPL_SLOT));
    }
}
