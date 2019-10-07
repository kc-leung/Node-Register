const router = require("express").Router();
const jwt = require("jsonwebtoken");

const { verifyEmailToken } = require("./verifyToken");

const User = require("../models/User");

router.get("/confirmation/:token", verifyEmailToken, async (req, res) => {
  try {
    User.update({ _id: req.user._id }, { $set: { confirmed: true } });
    res.send("Email has been confirmed!");
  } catch (e) {
    res.send("error");
  }

  return res.redirect("http://localhost:3000/api/posts");
});

module.exports = router;
