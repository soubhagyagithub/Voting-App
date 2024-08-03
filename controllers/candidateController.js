const Candidate = require("../models/candidateModel");
const User = require("../models/userModel");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (user.role === "admin") {
      return true;
    }
  } catch (error) {
    return false;
  }
};

const postCandidate = async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "user doesn't have admin role" });

    const data = req.body;

    // create new user
    const user = new Candidate(data);

    //save the new user to the database
    const response = await user.save();
    console.log("data saved");
    res.status(200).json({ response: response, message: "Success" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
};

const updateCandidate = async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user doesn't have admin role" });

    const candidateId = req.params.candidateId;
    const updatedData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      return res.status(403).json({ error: "Candidate not found" });
    }
    console.log("candidate data updated");

    res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server error");
  }
};

const deleteCandidate = async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user doesn't have admin role" });

    const candidateId = req.params.candidateId;

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      return res.status(403).json({ error: "Candidate not found" });
    }
    console.log("candidate deleted");

    res.status(200).json({ response: response, message: "Candidate Deleted " });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server error");
  }
};

// voting

const createVote = async (req, res) => {
  const candidateId = req.params.candidateId;
  const userId = req.user.id;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(403).json({ message: "Candidate not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVoted) {
      return res.status(404).json({ message: "You have already voted" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin is not allowed to vote" });
    }

    // Update candidate document to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    // Update user document
    user.isVoted = true;
    await user.save();

    // Send a success response
    return res.status(200).json({ message: "Vote successfully recorded" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server error");
  }
};

const getVoteCount = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: -1 });

    const voteRecord = candidates.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });

    return res.status(200).json(voteRecord);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error");
  }
};

module.exports = {
  postCandidate,
  updateCandidate,
  deleteCandidate,
  createVote,
  getVoteCount,
};
