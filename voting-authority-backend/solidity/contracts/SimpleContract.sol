pragma solidity ^0.5.0;

contract SimpleStorage {
    uint storedData;

    constructor(uint initialValue) public {
      storedData = initialValue;
    }

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}