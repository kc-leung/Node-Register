const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const transporter = require("../transporter");

const User = require("../models/User");

const registerValidation = require("../validations/registerValidation");
const loginValidation = require("../validations/loginValidation");

//Register
router.post("/register", async (req, res) => {
  //Validate data before creating the user
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Verify if the user already exits
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exists!");

  //Hashing passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  //Create an User
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword
  });

  try {
    const savedUser = await user.save();
    res.send(savedUser);
    // //Create an email token and its header name tag
    // const token = jwt.sign(
    //   { _id: savedUser._id },
    //   process.env.EMAIL_TOKEN,
    //   { expiresIn: "1d" },
    //   (err, emailToken) => {
    //     const url = `http://localhost:3000/confirmation/${emailToken}`;

    //     transporter.sendMail({
    //       to: savedUser.email,
    //       subject: "Confirm Email",
    //       html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
    //     });
    //   }
    // );
    // res.header("email-token", token).send(token);
  } catch (err) {
    res.status(400).send(err);
  }
});

//Login
router.post("/login", async (req, res) => {
  //Validate data before creating the user
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Verify if the user already exits
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email or Password is Wrong");

  //Verify user confirmed email
  if (!user.confirmed)
    return res.status(400).send("Please confirm your email to login");

  //Verify if password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Email or Password is Wrong");

  //Create an user logged in token and its header name tag
  const token = jwt.sign({ _id: user._id }, process.env.LOGIN_TOKEN);
  res.header("auth-token", token).send(token);

  res.send("Logged In!");
});

module.exports = router;
