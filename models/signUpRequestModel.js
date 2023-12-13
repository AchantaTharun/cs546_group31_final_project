import mongoose from "mongoose";
import * as help from "../Helpers.js";

const signUpRequestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    enum: ["gym", "trainer"],
  },
  requestedBy: {
    type: String,
    required: [true, "id of requester is required"],
    validate:[help.checkIdtf , "Id is not a valid one"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SignUpRequest = mongoose.model("SignUpRequest", signUpRequestSchema);

export default SignUpRequest;
