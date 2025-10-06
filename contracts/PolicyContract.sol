// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract PolicyContract {
    struct Policy {
        uint id;
        int zone;
        string startTime;
        string endTime;
        bool exists;
    }

    Policy[] public policies;
    uint public nextId;

    event PolicyCreated(uint indexed id, int zone, string startTime, string endTime);
    event PolicyUpdated(uint indexed id, int zone, string startTime, string endTime);
    event PolicyDeleted(uint indexed id);

    function createPolicy(int _zone, string memory _startTime, string memory _endTime) public {
        policies.push(Policy(nextId, _zone, _startTime, _endTime, true));
        emit PolicyCreated(nextId, _zone, _startTime, _endTime);
        nextId ++;
    }

    function getPolicy(uint _id) public view returns (Policy memory) {
        require(_id < nextId && policies[_id].exists, "Policy does not exist");
        return policies[_id];
    }

    function updatePolicy(uint _id, int _zone, string memory _startTime, string memory _endTime) public {
        require(_id < nextId && policies[_id].exists, "Policy does not exist");
        Policy storage policy = policies[_id];
        policy.zone = _zone;
        policy.startTime = _startTime;
        policy.endTime = _endTime;
        emit PolicyUpdated(_id, _zone, _startTime, _endTime);
    }

    function deletePolicy(uint _id) public {
        require(_id < nextId && policies[_id].exists, "Policy does not exist");
        policies[_id].exists = false;
        emit PolicyDeleted(_id);
    }

    function getPolicies() public view returns (Policy[] memory) {
        uint count = 0;
        for (uint i = 0; i < policies.length; i++) {
            if (policies[i].exists) {
                count++;
            }
        }

        Policy[] memory result = new Policy[](count);
        uint index = 0;
        for (uint i = 0; i < policies.length; i++) {
            if (policies[i].exists) {
                result[index] = policies[i];
                index++;
            }
        }

        return result;
    }

    //PRP
    function getPolicyByZone(int _zone) public view returns (Policy memory) {

        for (uint i = 0; i < policies.length; i ++) {
            if (policies[i].zone == _zone && policies[i].exists) {
                return policies[i];
            }
        }
        revert("Policy not found");
    }
}
