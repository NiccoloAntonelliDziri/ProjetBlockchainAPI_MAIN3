// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Storage {

    bytes public JSONfile;
    bytes32 public JSONhash;
    uint public initialblock = block.number;

    event newStrIsStored(address indexed _from, bytes JSONfile, bytes32 JSONhash);

    function hashStringWithAssembly(bytes memory _string) public pure returns(bytes32 hash) {
        assembly {
            let len := calldataload(0x24)
            let ptr := mload(0x40)
            calldatacopy(ptr, add(0x24, 0x20), len)
            hash := keccak256(ptr, len)
        }
    }

    function storeJson(bytes memory json_in_str) public {
        JSONfile = json_in_str;
        JSONhash = hashStringWithAssembly(json_in_str);
        emit newStrIsStored(msg.sender, JSONfile, JSONhash);
    }

}
