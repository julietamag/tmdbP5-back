const jwt = require("jsonwebtoken");
require("dotenv").config();

const  SECRET  = process.env.SECRET

function generateToken(payload) {
  const token = jwt.sign({ payload }, SECRET, { expiresIn: "10d" });
  return token
}

function validateToken(token,  defaultPayload = null) {

  try {
    const payload = jwt.verify(token, SECRET);
    return { payload };
  } catch (err) {
    return { payload: defaultPayload };
  }
}

module.exports = { generateToken, validateToken };
