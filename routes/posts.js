const router = require("express").Router();
const { verifyLoginToken } = require("./verifyToken");

router.get("/", verifyLoginToken, (req, res) => {
  res.json(req.user);
});

module.exports = router;
