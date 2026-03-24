const { Router } = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = Router();

router.post("/register", register);   // public
router.post("/login",    login);      // public
router.get("/me",        protect, getMe);

module.exports = router;
