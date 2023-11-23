const mongoose = require("mongoose");

const signUpRequestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    enum: ["gym", "trainer"],
  },
  requestedBy: {
    type: String,
    required: [true, "id of requester is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const SignUpRequest = mongoose.model("SignUpRequest", signUpRequestSchema);

module.exports = SignUpRequest;
