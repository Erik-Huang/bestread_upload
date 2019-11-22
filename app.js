/**
 * Name: Erik Huang
 * Date: November 21, 2019
 * Section: CSE 154 AL
 *
 * Reads local files that contains information about all the books
 * Offers various endpoints to provide access to the content of
 * all the books.
 */
"use strict";

const express = require("express");
const fs = require("fs").promises;
const glob = require("glob");
const app = express();

// Promisified version of glob
const util = require("util");
const globPromise = util.promisify(glob);

const BOOK_PATH = "books/";
const INVALID_REQUEST_ERROR = 400;
const FILE_ERROR = 500;
const PUBLIC_PORT = 8000;
const FILE_ERROR_MESSAGE = "Something went on the server, try again later.";

let highScore = 0;

/*
 * Responds with text containing the description of the book
 * Outputs a 400 error if book with target book id is not found.
 * Outputs a 500 error if something goes wrong when processing files.
 */
app.get("/bestreads/description/:book_id", async function(req, res) {
  res.set("Content-Type", "text/plain");
  let foundPath = true;
  let bookId = req.params["book_id"];
  let pathResult;
  try {
    let pathPattern = BOOK_PATH + bookId + "/description.txt";
    pathResult = await globPromise(pathPattern);
  } catch (err) {
    foundPath = false;
    res.status(FILE_ERROR).send(FILE_ERROR_MESSAGE);
  }
  if (foundPath) {
    try {
      let discription = await fs.readFile(pathResult[0], "utf8");
      res.send(discription);
    } catch (err) {
      res.status(INVALID_REQUEST_ERROR).send("No results found for " + bookId + ".");
    }
  }
});


/*
 * Responds with a JSON file containing the title and author info of the book
 * Outputs a 400 error if book with target book id is not found.
 * Outputs a 500 error if something goes wrong when processing files.
 */
app.get("/bestreads/info/:book_id", async function(req, res) {
  res.set("Content-Type", "application/json");
  let foundPath = true;
  let bookId = req.params["book_id"];
  let pathResult;
  try {
    let pathPattern = BOOK_PATH + bookId + "/info.txt";
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
      res.status(INVALID_REQUEST_ERROR).send("No results found for " + bookId + ".");
    }
  }
});

/*
 * Responds with a JSON file containing an array of reviews of the book
 * each review contains information about the author name, rating and content.
 * Outputs a 400 error if book with target book id is not found.
 * Outputs a 500 error if something goes wrong when processing files.
 */
app.get("/bestreads/reviews/:book_id", async function(req, res) {
  res.set("Content-Type", "application/json");
  let foundPath = true;
  let bookId = req.params["book_id"];
  let pathResult;
  try {
    let pathPattern = BOOK_PATH + bookId + "/review*.txt";
    pathResult = await globPromise(pathPattern);
  } catch (err) {
    foundPath = false;
    res.status(FILE_ERROR).send(FILE_ERROR_MESSAGE);
  }
  if (pathResult.length === 0) {
    foundPath = false;
    res.status(INVALID_REQUEST_ERROR).send("No results found for " + bookId + ".");
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
      res.status(INVALID_REQUEST_ERROR).send("No results found for " + bookId + ".");
    }
  }
});

/*
 * Responds with a JSON file containing the full book list.
 * Each book in the book list contains the title information and the book id.
 * Outputs a 400 error if book with target book id is not found.
 * Outputs a 500 error if something goes wrong when processing files.
 */
app.get("/bestreads/books", async function(req, res) {
  res.set("Content-Type", "application/json");
  let bookList = [];
  try {
    let pathResult = await globPromise(BOOK_PATH + "*");
    for (let path of pathResult) {
      let title = await fs.readFile(path + "/info.txt", "utf8");
      title = title.split(/\r?\n/)[0];
      let id = path.split(/\//)[1];
      bookList.push({"title": title, "book_id": id});
    }
    res.json({"books": bookList});
  } catch (err) {
    res.status(FILE_ERROR).send(FILE_ERROR_MESSAGE);
  }
});

app.use(express.static("public"));
const PORT = process.env.PORT || PUBLIC_PORT;
app.listen(PORT);
