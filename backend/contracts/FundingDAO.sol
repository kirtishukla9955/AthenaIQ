pragma solidity ^0.8.19;

contract FundingDAO {
    struct Milestone {
        uint256 percentage;
        bool released;
        bool approved;
    }

    struct Proposal {
        uint256 id;
        string title;
        string ipfsHash;
        address payable creator;
        uint256 totalFunds;
        uint256 yesVotes;
        uint256 noVotes;
        bool active;
        uint8 currentMilestone;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(uint8 => Milestone)) public milestones;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 id, string title, address creator);
    event Voted(uint256 proposalId, address voter, bool support);
    event Funded(uint256 proposalId, address funder, uint256 amount);
    event MilestoneApproved(uint256 proposalId, uint8 milestoneIndex);
    event MilestoneReleased(uint256 proposalId, uint8 milestoneIndex, uint256 amount);

    function createProposal(string memory title, string memory ipfsHash) public {
        proposalCount++;
        
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: title,
            ipfsHash: ipfsHash,
            creator: payable(msg.sender),
            totalFunds: 0,
            yesVotes: 0,
            noVotes: 0,
            active: true,
            currentMilestone: 0
        });

        milestones[proposalCount][0] = Milestone(30, false, true); 
        milestones[proposalCount][1] = Milestone(40, false, false);
        milestones[proposalCount][2] = Milestone(30, false, false);

        emit ProposalCreated(proposalCount, title, msg.sender);
    }

    function vote(uint256 proposalId, bool support) public {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        require(proposals[proposalId].active, "Proposal not active");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposals[proposalId].yesVotes++;
        } else {
            proposals[proposalId].noVotes++;
        }

        emit Voted(proposalId, msg.sender, support);
    }

    function fund(uint256 proposalId) public payable {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        require(msg.value > 0, "Must send ETH");
        require(proposals[proposalId].active, "Proposal not active");

        proposals[proposalId].totalFunds += msg.value;

        emit Funded(proposalId, msg.sender, msg.value);
    }

    function approveMilestone(uint256 proposalId, uint8 milestoneIndex) public {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        require(milestoneIndex < 3, "Invalid milestone");
        
        milestones[proposalId][milestoneIndex].approved = true;

        emit MilestoneApproved(proposalId, milestoneIndex);
    }

    function releaseMilestone(uint256 proposalId, uint8 milestoneIndex) public {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        require(milestoneIndex < 3, "Invalid milestone");
        require(milestones[proposalId][milestoneIndex].approved, "Milestone not approved");
        require(!milestones[proposalId][milestoneIndex].released, "Already released");

        Proposal storage p = proposals[proposalId];
        require(p.active, "Proposal not active");

        uint256 amountToRelease = (p.totalFunds * milestones[proposalId][milestoneIndex].percentage) / 100;
        
        milestones[proposalId][milestoneIndex].released = true;
        p.currentMilestone = milestoneIndex + 1;

        if (p.currentMilestone == 3) {
            p.active = false;
        }

        p.creator.transfer(amountToRelease);

        emit MilestoneReleased(proposalId, milestoneIndex, amountToRelease);
    }
}
