const express = require("express");
const router = new express.Router();
const UserModel = require("../models/users-model");
router.post("/createUser", (req, res) => {
  console.log(req.body);
  UserModel.create(req.body)
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      res.json(err);
    });
});

module.exports = router;
