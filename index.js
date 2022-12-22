const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
var bodyParser = require("body-parser");
// const fs = require("fs");
// const path = require("path");
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

  var configTwo = {
    method: "put",
    url: final.data.attributes.url,
    headers: {
      "Content-Type": file.mimetype,
    },
    data: req.file.buffer,
  };

  let finalPost = await axios(configTwo)
    .then(function (response) {
      console.log("Axios call in /postSession");
    })
    .catch(function (error) {
      console.log(error);
    });

  let trueFinal = {
    sessionIdBackend: final.data.attributes.id,
    sessionStatusBackend: final.data.attributes.status,
    sessionPresignedUrlBackend: final.data.attributes.url,
  };
  return res.status(200).send(trueFinal);
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
