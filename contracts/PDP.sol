// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LoggingContract.sol";
import "./PolicyContract.sol";
import "./DroneContract.sol";

contract PDP {
    LoggingContract public logger;
    PolicyContract public policy;
    DroneContract public drone;

    uint constant SAUDI_ARABIA_OFFSET = 3 * 60 * 60;

    constructor(address _policyAddress, address _droneAddress, address _loggerAddress) {
        policy = PolicyContract(_policyAddress);
        drone = DroneContract(_droneAddress);
        logger = LoggingContract(_loggerAddress);
    }

    event AccessEvaluated(uint indexed entityId, bool accessGranted);

    function level0EvaluateAccess(uint _id, string memory _model_type, int _zone, string memory _startTime, string memory _endTime, bool _accessGranted) public returns (bool) {
        uint currentTime = block.timestamp + SAUDI_ARABIA_OFFSET;

        string memory formattedTime = formatTime(currentTime);

        string memory action = "Access Request";
        string memory data = string(abi.encodePacked(
            "Level: 0, Drone: ", uint2str(_id),
            ", Time: ", formattedTime
        ));
        logger.logAction(action, data);

        action = "PIP";
        data = string(abi.encodePacked(
            "Drone Id: ", uint2str(_id),
            ", ModelType: ", _model_type,
            ", Zone: ", int2str(_zone)
        ));
        logger.logAction(action, data);

        action = "PRP";
        data = string(abi.encodePacked(
            "Zone: ", int2str(_zone),
            ", StartTime: ", _startTime,
            ", EndTime: ", _endTime
        ));
        logger.logAction(action, data);

        action = "PDP";
        data = string(abi.encodePacked(
            "Decision: ", _accessGranted ? "Passed" : "Denied"
        ));
        logger.logAction(action, data);

        bool accessGranted = _accessGranted;
        emit AccessEvaluated(_id, accessGranted);
        return accessGranted;

    }

    function level1EvaluateAccess(uint _id, string memory _model_type, int _zone, string memory _startTime, string memory _endTime) public returns (bool) {
        uint currentTime = block.timestamp + SAUDI_ARABIA_OFFSET;
        uint currentSeconds = currentTime % (24 * 60 * 60);

        bool accessGranted = false;

        string memory formattedTime = formatTime(currentTime);

        if (compareTimes(currentSeconds, _startTime, _endTime)) {
            accessGranted = true;
        }

        string memory action = "Access Request";
        string memory data = string(abi.encodePacked(
            "Level: 1, Drone: ", uint2str(_id),
            ", Time: ", formattedTime
        ));
        logger.logAction(action, data);

        action = "PIP";
        data = string(abi.encodePacked(
            "Drone Id: ", uint2str(_id),
            ", ModelType: ", _model_type,
            ", Zone: ", int2str(_zone)
        ));
        logger.logAction(action, data);

        action = "PRP";
        data = string(abi.encodePacked(
            "Zone: ", int2str(_zone),
            ", StartTime: ", _startTime,
            ", EndTime: ", _endTime
        ));
        logger.logAction(action, data);

        action = "PDP";
        data = string(abi.encodePacked(
            "Decision: ", accessGranted ? "Passed" : "Denied"
        ));
        logger.logAction(action, data);

        emit AccessEvaluated(_id, accessGranted);
        return accessGranted;
    }

    function level2EvaluateAccess(uint _id, string memory _model_type, int _zone) public returns (bool) {
        uint currentTime = block.timestamp + SAUDI_ARABIA_OFFSET;
        uint currentSeconds = currentTime % (24 * 60 * 60);

        bool accessGranted = false;
        PolicyContract.Policy memory policyDetails = policy.getPolicyByZone(_zone);

        string memory formattedTime = formatTime(currentTime);

        if (compareTimes(currentSeconds, policyDetails.startTime, policyDetails.endTime)) {
            accessGranted = true;
        }

        string memory action = "Access Request";
        string memory data = string(abi.encodePacked(
            "Level: 2, Drone: ", uint2str(_id),
            ", Time: ", formattedTime
        ));
        logger.logAction(action, data);

        action = "PIP";
        data = string(abi.encodePacked(
            "Drone Id: ", uint2str(_id),
            ", ModelType: ", _model_type,
            ", Zone: ", int2str(_zone)
        ));
        logger.logAction(action, data);

        action = "PRP";
        data = string(abi.encodePacked(
            "Zone: ", int2str(policyDetails.zone),
            ", StartTime: ", policyDetails.startTime,
            ", EndTime: ", policyDetails.endTime
        ));
        logger.logAction(action, data);

        action = "PDP";
        data = string(abi.encodePacked(
            "Decision: ", accessGranted ? "Passed" : "Denied"
        ));
        logger.logAction(action, data);

        emit AccessEvaluated(_id, accessGranted);
        return accessGranted;
    }

    function level3EvaluateAccess(uint _entityId) public returns (bool) {
        uint currentTime = block.timestamp + SAUDI_ARABIA_OFFSET;
        uint currentSeconds = currentTime % (24 * 60 * 60);

        bool accessGranted = false;
        DroneContract.Drone memory droneDetails = drone.getDrone(_entityId);
        PolicyContract.Policy memory policyDetails = policy.getPolicyByZone(droneDetails.zone);

        string memory formattedTime = formatTime(currentTime);

        if (compareTimes(currentSeconds, policyDetails.startTime, policyDetails.endTime)) {
            accessGranted = true;
        }

        string memory action = "Access Request";
        string memory data = string(abi.encodePacked(
            "Level: 3, Drone: ", uint2str(_entityId),
            ", Time: ", formattedTime
        ));
        logger.logAction(action, data);

        action = "PIP";
        data = string(abi.encodePacked(
            "Drone Id: ", uint2str(_entityId),
            ", ModelType: ", droneDetails.model_type,
            ", Zone: ", int2str(droneDetails.zone)
        ));
        logger.logAction(action, data);

        action = "PRP";
        data = string(abi.encodePacked(
            "Zone: ", int2str(policyDetails.zone),
            ", StartTime: ", policyDetails.startTime,
            ", EndTime: ", policyDetails.endTime
        ));
        logger.logAction(action, data);

        action = "PDP";
        data = string(abi.encodePacked(
            "Decision: ", accessGranted ? "Passed" : "Denied"
        ));
        logger.logAction(action, data);

        emit AccessEvaluated(_entityId, accessGranted);
        return accessGranted;
    }

    function formatTime(uint timestamp) internal pure returns (string memory) {
        uint hour = (timestamp / 60 / 60) % 24;
        uint minute = (timestamp / 60) % 60;
        uint second = timestamp % 60;

        string memory hourStr = _padZero(hour);
        string memory minuteStr = _padZero(minute);
        string memory secondStr = _padZero(second);

        return string(abi.encodePacked(hourStr, ":", minuteStr, ":", secondStr));
    }

    function _padZero(uint num) internal pure returns (string memory) {
        if (num < 10) {
            return string(abi.encodePacked("0", uint2str(num)));
        }
        return uint2str(num);
    }

    function parseTimeString(string memory timeString) internal pure returns (uint) {
        bytes memory b = bytes(timeString);
        require(b.length == 8, "invalid time format");

        uint hr = (uint(uint8(b[0])) - 48) * 10 + (uint(uint8(b[1])) - 48);
        uint min = (uint(uint8(b[3])) - 48) * 10 + (uint(uint8(b[4])) - 48);
        uint sec = (uint(uint8(b[6])) - 48) * 10 + (uint(uint8(b[7])) - 48);

        require(hr < 24 && min < 60 && sec < 60, "Invalid time value");

        return hr * 3600 + min * 60 + sec;
    }

    function compareTimes(uint currentSeconds, string memory startTime, string memory endTime) internal pure returns (bool) {
        uint startSeconds = parseTimeString(startTime);
        uint endSeconds = parseTimeString(endTime);

        if (startSeconds <= endSeconds) {
            return (currentSeconds >= startSeconds && currentSeconds <= endSeconds);
        } else {
            return ((currentSeconds > startSeconds && currentSeconds <= 86400) || (currentSeconds >= 0 && currentSeconds <= endSeconds));
        }
    }

    function uint2str(uint _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function int2str(int _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        bool negative = _i < 0;
        uint j = uint(negative ? -_i : _i);
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        if (negative) len++;
        bytes memory bstr = new bytes(len);
        uint k = len;
        j = uint(negative ? -_i : _i);
        while (j != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(j - j / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            j /= 10;
        }
        if (negative) {
            bstr[0] = '-';
        }
        return string(bstr);
    }
}
