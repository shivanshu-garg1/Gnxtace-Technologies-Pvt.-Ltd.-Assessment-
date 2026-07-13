const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/response");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

exports.register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    if (!name || !email || !password || !confirmPassword) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "All fields are required",
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 3 || trimmedName.length > 50) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "Name must be between 3 and 50 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "Please enter a valid email address",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    // Confirm password
    if (password !== confirmPassword) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "Passwords do not match",
      });
    }

    const userExists = await User.findOne({ email: trimmedEmail });

    if (userExists) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "User already exists",
      });
    }

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password,
    });

    return sendResponse(res, {
      statusCode: 201,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      },
      message: "User registered successfully",
    });
  } catch (err) {
    console.error(err);

    return sendResponse(res, {
      statusCode: 500,
      status: "error",
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "Email and password are required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return sendResponse(res, {
        statusCode: 400,
        status: "error",
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email: trimmedEmail });

    if (!user || !(await User.comparePassword(password, user.password))) {
      return sendResponse(res, {
        statusCode: 401,
        status: "error",
        message: "Invalid credentials",
      });
    }

    return sendResponse(res, {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      },
      message: "Login successful",
    });
  } catch (err) {
    console.error(err);

    return sendResponse(res, {
      statusCode: 500,
      status: "error",
      message: err.message,
    });
  }
};