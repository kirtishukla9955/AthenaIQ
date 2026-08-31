pragma solidity ^0.8.19;

contract IdeaRegistry {
    mapping(address => bytes32[]) public ownerToHashes;
    
    mapping(bytes32 => uint256) public hashToTimestamp;

    mapping(bytes32 => address) public hashToOwner;

    event IdeaCommitted(address indexed owner, bytes32 indexed ideaHash, uint256 timestamp);

    function commitIdea(bytes32 ideaHash) public {
        require(hashToTimestamp[ideaHash] == 0, "Idea already committed");

        ownerToHashes[msg.sender].push(ideaHash);
        hashToTimestamp[ideaHash] = block.timestamp;
        hashToOwner[ideaHash] = msg.sender;

        emit IdeaCommitted(msg.sender, ideaHash, block.timestamp);
    }

    function verifyIdea(bytes32 ideaHash) public view returns (address owner, uint256 timestamp) {
        owner = hashToOwner[ideaHash];
        timestamp = hashToTimestamp[ideaHash];
        require(timestamp != 0, "Idea not found");
        return (owner, timestamp);
    }
}
