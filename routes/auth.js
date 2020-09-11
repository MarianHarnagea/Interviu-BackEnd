const express = require("express");
const router = express.Router();
const csv = require("csv-parser");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const bcrypt = require("bcrypt");

const csvWriter = createCsvWriter({
  path: "data.csv",
  header: [
    { id: "name", title: "Name" },
    { id: "email", title: "Email" },
    { id: "password", title: "Password" },
  ],
});

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !name || !password)
    return res.status(400).json({ fail: "Enter All Fields" });

  const results = [];

  fs.createReadStream("data.csv")
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      let filteredUser = results.filter(
        (email) => email.Email === req.body.email
      );

      if (filteredUser !== undefined || filteredUser.length != 0) {
        return res.status(400).json({ fail: "Email Already Exists" });
      } else {
        const saltRounds = 10;

        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) throw err;

            const user = [
              {
                name: req.body.name,
                email: req.body.email,
                password: hash,
              },
            ];

            csvWriter.writeRecords(user).then(() => {
              console.log("The CSV file was written successfully");
              res.status(200).json({ success: "Registred Succesfuly" });
            });
          });
        });
      }
    });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Enter All Fields" });

  const results = [];

  fs.createReadStream("data.csv")
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      let filteredUser = results.filter(
        (email) => email.Email === req.body.email
      );

      if (filteredUser === undefined || filteredUser.length == 0) {
        return res.status(400).json({ error: "Email Not Found" });
      } else {
        //
        bcrypt.compare(password, filteredUser[0].Password, function (
          err,
          result
        ) {
          if (err) throw err;

          if (!result === true) {
            return res.status(400).json({ error: "Wrong password" });
          } else {
            let user = filteredUser[0];
            res.status(200).json({ user });
          }
        });
        //
      }
    });
});

module.exports = router;
