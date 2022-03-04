// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Adoption {
    address[16] public adopters;

    // Adopt a pet
    function adopt(uint256 petId) public returns (uint256) {
        require(petId > 0 && petId < adopters.length);
        adopters[petId] = msg.sender;
        return petId;
    }

    // Retriving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }
}
