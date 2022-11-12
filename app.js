/**
 * Name: Erik Huang
 * Date: November 21, 2019
 * Section: CSE 154 AL
 *
 * Reads local files that contains information about all the bobas
 * Offers various endpoints to provide access to the content of
 * all the bobas.
 */
"use strict";

const express = require("express");
const fs = require("fs").promises;
const glob = require("glob");
const app = express();

// Promisified version of glob
const util = require("util");
const globPromise = util.promisify(glob);

const BOBA_PATH = "bobas/";
const INVALID_REQUEST_ERROR = 400;
const FILE_ERROR = 500;
const PUBLIC_PORT = 5011;
const FILE_ERROR_MESSAGE = "Something went on the server, try again later.";

/*
 * Responds with text containing the description of the boba
 * Outputs a 400 error if boba with target boba id is not found.
 * Outputs a 500 error if something goes wrong when processing files.
 */
app.get("/bestreads/description/:boba_id", async function(req, res) {
  let bobaId = req.params["boba_id"];
  let path = BOBA_PATH + bobaId + "/description.txt";
  try {
    let result = await getDescriptions(path);
    res.set("Content-Type", "text/plain");
    res.send(result);
  } catch (err) {
    res.set("Content-Type", "text/plain");
    res.status(INVALID_REQUEST_ERROR).send("No results found for " + bobaId + ".");
  }
});

async function getDescriptions(path) {
  let discription = await fs.readFile(path, "utf8");
  return discription;
}

/*
 * Responds with a JSON file containing the title and author info of the boba
 * Outputs a 400 error if boba with target boba id is not found.
 * Outputs a 500 error if something goes wrong when processing files.
 */
app.get("/bestreads/info/:boba_id", async function(req, res) {
  res.set("Content-Type", "application/json");
  let foundPath = true;
  let bobaId = req.params["boba_id"];
  let pathResult;
  try {
    let pathPattern = BOBA_PATH + bobaId + "/info.txt";
    pathResult = await globPromise(pathPattern);
  } catch (err) {
    foundPath = false;
    res.status(FILE_ERROR).send(FILE_ERROR_MESSAGE);
  }
  if (foundPath) {
    try {
      let content = await fs.readFile(pathResult[0], "utf8");
      content = content.split(/\r?\n/);
      res.json({"title": content[0], "author": content[1]});
    } catch (err) {
      res.status(INVALID_REQUEST_ERROR).send("No results found for " + bobaId + ".");
    }
  }
});

/*
 * Responds with a JSON file containing an array of reviews of the boba
 * each review contains information about the author name, rating and content.
 * Outputs a 400 error if boba with target boba id is not found.
 * Outputs a 500 error if something goes wrong when processing files.
 */
app.get("/bestreads/reviews/:boba_id", async function(req, res) {
  res.set("Content-Type", "application/json");
  let foundPath = true;
  let bobaId = req.params["boba_id"];
  let pathResult;
  try {
    let pathPattern = BOBA_PATH + bobaId + "/review*.txt";
    pathResult = await globPromise(pathPattern);
  } catch (err) {
    foundPath = false;
    res.status(FILE_ERROR).send(FILE_ERROR_MESSAGE);
  }
  if (pathResult.length === 0) {
    foundPath = false;
    res.status(INVALID_REQUEST_ERROR).send("No results found for " + bobaId + ".");
  }
  if (foundPath) {
    let output = [];
    try {
      for (let path of pathResult) {
        let review = await fs.readFile(path, "utf8");
        review = review.split(/\r?\n/);
        output.push({"name": review[0], "rating": review[1], "text": review[2]});
      }
      res.json(output);
    } catch (err) {
      res.status(INVALID_REQUEST_ERROR).send("No results found for " + bobaId + ".");
    }
  }
});

/*
 * Responds with a JSON file containing the full boba list.
 * Each boba in the boba list contains the title information and the boba id.
 * Outputs a 400 error if boba with target boba id is not found.
 * Outputs a 500 error if something goes wrong when processing files.
 */
app.get("/bestreads/bobas", async function(req, res) {
  res.set("Content-Type", "application/json");
  let bobaList = [];
  try {
    let pathResult = await globPromise(BOBA_PATH + "*");
    console.log(await globPromise(BOBA_PATH + "2v*"));
    for (let path of pathResult) {
      let title = await fs.readFile(path + "/info.txt", "utf8");
      title = title.split(/\r?\n/)[0];
      let id = path.split(/\//)[1];
      bobaList.push({"title": title, "boba_id": id});
    }
    res.json({"bobas": bobaList});
  } catch (err) {
    res.status(FILE_ERROR).send(FILE_ERROR_MESSAGE);
  }
});

app.use(express.static("public"));
const PORT = process.env.PORT || PUBLIC_PORT;
app.listen(PORT);
