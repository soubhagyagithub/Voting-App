const express = require("express");
const candidateController = require("../controllers/candidateController");
const authenticationToken = require("../middleware/auth");
const router = express.Router();

router.post("/", authenticationToken, candidateController.postCandidate);

router.put(
  "/:candidateId",
  authenticationToken,
  candidateController.updateCandidate
);

router.delete(
  "/:candidateId",
  authenticationToken,
  candidateController.deleteCandidate
);

router.post(
  "/vote/:candidateId",
  authenticationToken,
  candidateController.createVote
);
router.get(
  "/vote/count",
  authenticationToken,
  candidateController.getVoteCount
);
module.exports = router;
