const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const postUserSignUp = async (req, res) => {
  try {
    const data = req.body;
    const { email, password } = data;
    //checking user exist with this email or not
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(404)
        .json({ message: "User already exists with this email" });
    }
    // create new user
    const user = new User(data);

    //hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    //save the new user to the database
    const response = await user.save();
    res
      .status(200)
      .json({ response: response, message: " User created Successfully!" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
};

const postUserLogin = async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;
    // Check if the user exists with the provided Aadhar card number
    const user = await User.findOne({ aadharCardNumber });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid Aadhar Card Number or Password" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create a JWT token
    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ message: "Login Successfully", token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server error");
  }
};

module.exports = {
  postUserSignUp,
  postUserLogin,
};
