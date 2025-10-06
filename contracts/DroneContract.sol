// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DroneContract {
    struct Drone {
        uint id;
        string model_type;
        int zone;
        bool exists;
    }

    Drone[] public drones;
    uint public nextId;

    event DroneCreated(uint indexed id, string model_type, int zone);
    event DroneUpdated(uint indexed id, string model_type, int zone);
    event DroneDeleted(uint indexed id);

    function createDrone(string memory _model_type, int _zone) public  {
        for (uint i = 0; i < drones.length; i++) {
            if (drones[i].exists && keccak256(abi.encodePacked(drones[i].model_type)) == keccak256(abi.encodePacked(_model_type)) && keccak256(abi.encodePacked(_model_type)) == keccak256(abi.encodePacked("Terminal")) && drones[i].zone == _zone) {
                revert("A terminal drone already exists in this zone.");
            }
        }

        drones.push(Drone(nextId, _model_type, _zone, true));
        emit DroneCreated(nextId, _model_type, _zone);
        nextId ++;
    }

    // PIP
    function getDrone(uint _id) public view returns (Drone memory) {
        require(_id < nextId && drones[_id].exists, "Drone does not exist");
        return (drones[_id]);
    }

    function updateDrone(uint _id, string memory _model_type, int _zone) public {
        require(_id < nextId && drones[_id].exists, "Drone does not exist");
        Drone storage drone = drones[_id];
        drone.model_type = _model_type;
        drone.zone = _zone;
        emit DroneUpdated(_id, _model_type, _zone);
    }

    function deleteDrone(uint _id) public {
        require(_id < nextId && drones[_id].exists, "Drone does not exist");
        drones[_id].exists = false;
        emit DroneDeleted(_id);
    }

    function getDrones() public view returns (Drone[] memory) {
        uint count = 0;
        for (uint i = 0; i < drones.length; i++) {
            if (drones[i].exists) {
                count++;
            }
        }

        Drone[] memory result = new Drone[](count);
        uint index = 0;
        for (uint i = 0; i < drones.length; i++) {
            if (drones[i].exists) {
                result[index] = drones[i];
                index++;
            }
        }

        return result;
    }

    function getDronesByZone(int _zone) public view returns (Drone[] memory) {
        uint count = 0;
        for (uint i = 0; i < drones.length; i++) {
            if (drones[i].exists && drones[i].zone == _zone) {
                count++;
            }
        }

        Drone[] memory result = new Drone[](count);
        uint index = 0;
        for (uint i = 0; i < drones.length; i++) {
            if (drones[i].exists && drones[i].zone == _zone) {
                result[index] = drones[i];
                index++;
            }
        }

        return result;
    }
}
