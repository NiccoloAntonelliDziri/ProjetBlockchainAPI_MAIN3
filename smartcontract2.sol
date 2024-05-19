// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Storage {

    // contenu compressé du JSON pour prendre moins de place
    bytes public json_block;
    // Identifiant unique assigné par l'API pour reconnaitre à quel fichier appartient le json_block
    bytes32 public hash_of_uuid;

    event jsonStored(address indexed _from, bytes32 indexed hash_of_uuid, bytes json);

    function storeJson(bytes memory _json_in_str, string calldata _uuid) public {
        json_block = _json_in_str;
        hash_of_uuid = hashString(_uuid);
        emit jsonStored(msg.sender, hash_of_uuid, json_block);
    }

    function hashString(string calldata stringArgument) public pure returns(bytes32){
        bytes32 hashedString = keccak256(abi.encodePacked(stringArgument));
        return hashedString;
    }   
}
