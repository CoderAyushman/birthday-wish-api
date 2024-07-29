const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  Timestamp: {
    type: String,
  },
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
  },
  Address: {
    type: String,
  },
  DOB: {
    type: String,
    required: true,
  },
  Course: {
    type: String,
    required: true,
  },
  Semster: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
