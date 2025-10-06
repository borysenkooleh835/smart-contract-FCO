// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AttributeContract {
    struct Attribute {
        uint id;
        string name;
        uint[] value;
        bool exists;
    }

    Attribute[] public attributes;
    uint public nextId;

    event AttributeCreated(uint indexed id, string name, uint[] value);
    event AttributeUpdated(uint indexed id, string name, uint[] value);
    event AttributeDeleted(uint indexed id);

    function createAttribute(string memory _name, uint[] memory _value) public {
        attributes.push(Attribute(nextId, _name, _value, true));
        emit AttributeCreated(nextId, _name, _value);
        nextId++;
    }

    function getAttribute(uint _id) public view returns (Attribute memory) {
        require(_id < nextId && attributes[_id].exists, "Attribute does not exist");
        return attributes[_id];
    }

    function updateAttribute(uint _id, string memory _name, uint[] memory _value) public {
        require(_id < nextId && attributes[_id].exists, "Attribute does not exist");
        Attribute storage attribute = attributes[_id];
        attribute.name = _name;
        attribute.value = _value;
        emit AttributeUpdated(_id, _name, _value);
    }

    function deleteAttribute(uint _id) public {
        require(_id < nextId && attributes[_id].exists, "Attribute does not exist");
        attributes[_id].exists = false; // Mark as deleted
        emit AttributeDeleted(_id);
    }

    function getAttributes() public view returns (Attribute[] memory) {
        uint count = 0;
        for (uint i = 0; i < attributes.length; i++) {
            if (attributes[i].exists) {
                count++;
            }
        }

        Attribute[] memory result = new Attribute[](count);
        uint index = 0;
        for (uint i = 0; i < attributes.length; i++) {
            if (attributes[i].exists) {
                result[index] = attributes[i];
                index++;
            }
        }

        return result;
    }

    function getAttributesByName(string memory _name) public view returns (Attribute[] memory) {
        uint count = 0;
        for (uint i = 0; i < attributes.length; i++) {
            if (attributes[i].exists && compareStrings(attributes[i].name, _name)) {
                count++;
            }
        }

        Attribute[] memory result = new Attribute[](count);
        uint index = 0;
        for (uint i = 0; i < attributes.length; i++) {
            if (attributes[i].exists && compareStrings(attributes[i].name, _name)) {
                result[index] = attributes[i];
                index++;
            }
        }
        return result;
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b)));
    }
}
