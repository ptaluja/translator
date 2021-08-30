const express = require("express");
const app = express();
const bparser = require("body-parser");
var url = require("url");

const fs = require("fs");

var port_number = process.env.PORT || 5000;

//register view engine
app.use(bparser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "qwerty1234",
  database: "translate",
});
connection.connect(function (err) {
  console.log("mysql connected");
});

app.get("/", function (req, res) {
  res.render("index");
});

app.post("/translate", function (req, res) {
  console.log(req.body);
  console.log(req.body.to);
  var to = req.body.to.split("-");
  var sql =
    "SELECT " +
    to[1] +
    " FROM language where english='" +
    req.body.text +
    "' OR japanese='" +
    req.body.text +
    "' OR tamil='" +
    req.body.text +
    "' OR telugu='" +
    req.body.text +
    "' OR hindi='" +
    req.body.text +
    "' OR kannada='" +
    req.body.text +
    "' OR arabic='" +
    req.body.text +
    "' OR malayalam='" +
    req.body.text +
    "' OR urdu='" +
    req.body.text +
    "'";
  console.log(sql);

  connection.query(sql, function (err, result) {
    console.log(result);
    if (result.length > 0) {
      res.send(result[0][to[1]]);
    } else {
      var create_record =
        "INSERT INTO language (text,english,hindi,urdu,malayalam,japanese,tamil,kannada,telugu,arabic)VALUES('" +
        req.body.text +
        "',null,null,null,null,null,null,null,null,null)";
      connection.query(create_record, function (err, result2) {
        if (err) {
          onsole.log(err);
        } else {
          var arr = ["en", "hi", "ur", "ml", "bn", "ta", "kn", "te", "ar"];
          var arr2 = [
            "english",
            "hindi",
            "urdu",
            "malayalam",
            "bengali",
            "tamil",
            "kannada",
            "telugu",
            "arabic",
          ];

          const translating = require("@vitalets/google-translate-api");
          for (let i = 0; i < arr.length; i++) {
            translating(req.body.text, { to: arr[i] })
              .then((reso) => {
                console.log(reso.text);

                var update_record =
                  "UPDATE language SET " +
                  arr2[i] +
                  " = '" +
                  reso.text +
                  "' WHERE text = '" +
                  req.body.text +
                  "'";
                if (to[0] == arr[i]) {
                  res.send(reso.text);
                }
                connection.query(update_record, function (err, result) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("updated");
                  }
                });
              })
              .catch((err) => {
                console.error(err);
              });
          }
        }
      });
    }
  });
});

app.listen(port_number);
