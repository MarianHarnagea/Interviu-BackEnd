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
    return res.status(400).send({ msg: "Enter All Fields" });

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

      csvWriter
        .writeRecords(user)
        .then(() => console.log("The CSV file was written successfully"));
    });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const usersCSV = [];
  let backEndUser;
  let user;
  fs.createReadStream("data.csv")
    .pipe(csv())
    .on("data", (data) => {
      usersCSV.push(data);
      backEndUser = usersCSV.filter((user) => user.Email === email);

      if (backEndUser.length > 0) {
        user = backEndUser[0];
      }

      console.log(user);

      if (!user === undefined) {
        bcrypt.compare(password, user.Password, function (err, result) {
          if (err) throw err;

          if (!result == true || user.Email === email) {
            return res.send("Wrong Credentials");
          }
        });
      }
    })
    .on("end", () => {
      res.status(200).send({ msg: "Loged In", user: user });
      console.log(backEndUser);
    });
});

module.exports = router;
