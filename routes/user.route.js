const express = require('express');
const { getSignup, postRegister, getSignIn, postLogin } = require('../controllers/user.controller');
const router = express.Router();


router.get("/signup", getSignup);

router.post("/register", postRegister)


router.get("/signin", getSignIn);

router.post("/login", postLogin)

module.exports = router