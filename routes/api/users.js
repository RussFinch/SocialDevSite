const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs"); // used for hashing password so not sent in plain text.
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load input validation
const validateRegisterInput = require("../../validation/register.js");
const validateLoginInput = require("../../validation/login.js");

// Load User Model
const User = require("../../models/User");

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) =>
  res.json({
    msg: "Users works"
  })
);

// @route   GET api/users/register
// @desc    Register Users
// @access  Public
router.post("/register", (req, res) => {
  const {
    errors,
    isValid
  } = validateRegisterInput(req.body);

  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // first find user exits
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //picture size
        r: "pg", //picture rating
        d: "mm" //Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   GET api/users/login
// @desc    Login user / Returning JWT Token
// @access  Public
router.post("/login", (req, res) => {
  const {
    errors,
    isValid
  } = validateLoginInput(req.body);

  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({
    email
  }).then(user => {
    // Check for user
    if (!user) {
      errors.email = 'User not found';
      return res.status(404).json({
        errors
      });
    }

    //Check Password need to use bcrypt because dbase password hashed.
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User has Matched

        //Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };

        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey, {
            expiresIn: 3600 //set expiration of JWT token
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token // Included Bearer as using this protocol
            });
          }
        );
      } else {
        errors.password = 'Password incorrect';
        return res.status(400).json(errors);
      }
    });
  });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;