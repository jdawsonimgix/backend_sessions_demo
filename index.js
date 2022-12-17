const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
var bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 50000,
  })
);
// multer
const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });
const port = 5001;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//Start a session.
app.post("/startImgixSession", upload.single("pic"), async (req, res) => {
  const file = req.file;

  var config = {
    method: "post",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      file.originalname,
    headers: {
      Authorization: "Bearer " + process.env.IMGIX_API,
      "Content-Type": file.mimetype,
    },
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("Axios call in /startImgixSession");
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });

  let trueFinal = {
    allData: final,
    theBufferReturned: req.file.buffer,
    theFileType: file.mimetype,
  };
  return res.status(200).send(trueFinal);
});

app.post("/postSession", upload.single("pic"), async (req, res) => {
  let fileBufferData = req.file.buffer;
  let theAWSurl = req.body.awsURL;
  let file = req.file;

  var config = {
    method: "put",
    url: theAWSurl,
    headers: {
      "Content-Type": file.mimetype,
    },
    data: fileBufferData,
  };

  let finalPost = await axios(config)
    .then(function (response) {
      console.log("Axios call in /postSession");
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

  return res.status(200).send(finalPost);
});

//Checks status of an imgix session.
app.post("/checkImgixSessionStatus", async (req, res) => {
  console.log("Checking imgix status in /checkImgixSessionStatus");
  const gssid = req.body.grabbedSessionSourceID;

  var config = {
    method: "get",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      gssid,
    headers: {
      Authorization: "Bearer " + process.env.IMGIX_API,
      "Content-Type": "application/json",
    },
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("Axios call in /checkImgixSessionStatus");
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
  return res.status(200).send(final);
});

//Close a session
app.post("/checkImgixCloseSession", async (req, res) => {
  console.log("Axios call in /checkImgixCloseSession");
  const gssid = req.body.grabbedSessionSourceID;

  var config = {
    method: "post",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      gssid,
    headers: {
      Authorization: "Bearer " + process.env.IMGIX_API,
    },
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("Axios call in /checkImgixCloseSession");
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
  return res.status(200).send(final);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
