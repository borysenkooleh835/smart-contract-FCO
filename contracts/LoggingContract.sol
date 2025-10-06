// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract LoggingContract {
    struct LogEntry {
        address user;
        string action;
        string data;
    }

    LogEntry[] public logs;
    uint constant SAUDI_ARABIA_OFFSET = 3 * 60 * 60;
    event ActionLogged(address indexed user, string action, string data);

    function logAction(string memory action, string memory data) public {

        logs.push(LogEntry(msg.sender, action, data));
        emit ActionLogged(msg.sender, action, data);
    }

    function getLogs() public view returns (LogEntry[] memory) {
        return logs;
    }
}
