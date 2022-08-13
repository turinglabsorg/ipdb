// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

/**
 * Interface for IPDB contract
 */
interface IIPDB {
    /**
     * Allows the storage of a specified `cid` under `msg.sender` and `name` identifiers.
     */
    function store(string memory name, string memory cid) external;

    /**
     * Returns latest database CID based on provided `identifier` and `name`.
     */
    function get(address identifier, string memory name)
        external
        view
        returns (string memory, uint256);

    /**
     * Returns specific database CID based on provided `identifier`, `name`, and `version`.
     */
    function search(
        address identifier,
        string memory name,
        uint256 version
    ) external view returns (string memory);
}
