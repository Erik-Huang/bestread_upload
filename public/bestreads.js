/**
 * Name: Erik Huang
 * Date: November 21, 2019
 * Section: CSE 154 AL
 *
 * This is the java script file for the BestReads webpage
 * It contains fetch requests that connects to the bestreads API
 * and functions that populate the main view.
 */

"use strict";
(function() {
  const IMG_URL = "images/";
  const COVER_URL = "covers/";
  const BOOK_LIST_URL = "/bestreads/books";
  const BOOK_DESC_URL = "/bestreads/description/";
  const BOOK_INFO_URL = "/bestreads/info/";
  const BOOK_REVIEW_URL = "/bestreads/reviews/";

  window.addEventListener("load", init);

  /**
   * Populate the main view for the Bestreads webpage
   * Initialize the start battle button.
   */
  function init() {
    populateBookList();
    id("home").addEventListener("click", showAllBookSection);
  }

  /**
   * Fetch request to the BestReads API, proceed to the helper
   * method for displaying if book list data is successfully fetched.
   * Otherwise displays the error view.
   */
  function populateBookList() {
    fetch(BOOK_LIST_URL)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(displayBooks)
      .catch(displayErrorMessage);
  }

  /**
   * Create HTML elements based on the book list received
   * from the API and displays them on the webpage.
   * For each book, add a click event listener that calls
   * the show detail function.
   */
  function displayBooks(bookList) {
    showAllBookSection();
    let bookSection = id("all-books");
    for (let book of bookList["books"]) {
      let bookHolder = document.createElement("div");
      bookHolder.id = book["book_id"];
      let coverImg = document.createElement("img");
      coverImg.src = COVER_URL + book["book_id"] + ".jpg";
      coverImg.alt = book["book_id"];
      bookHolder.appendChild(coverImg);
      let bookTitle = document.createElement("p");
      bookTitle.textContent = book["title"];
      bookHolder.appendChild(bookTitle);
      bookHolder.addEventListener("click", showDetail);
      bookSection.appendChild(bookHolder);
    }
  }

  /**
   * Toggles the view of the webpage from a single book view
   * to the full book list.
   */
  function showAllBookSection() {
    hide(id("single-book"));
    show(id("all-books"));
  }

  /**
   * Toggles the view of the webpage from the full book list
   * to a single book view and populate the information according
   * to the book chosen.
   */
  function showDetail() {
    show(id("single-book"));
    hide(id("all-books"));
    let book_id = this.id;
    let cover = id("book-cover");
    cover.src = COVER_URL + book_id + ".jpg";
    cover.alt = book_id;
    fetchBookInfo(book_id);
    fetchBookDescription(book_id);
    fetchBookReview(book_id);
  }

  /**
   * Fetch request to the BestReads API, proceed to the helper
   * method for displaying if the book title and author is
   * successfully fetched for the target book id.
   * Otherwise displays the error view.
   */
  function fetchBookInfo(book_id) {
    fetch(BOOK_INFO_URL + book_id)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(displayBookInfo)
      .catch(displayErrorMessage);
  }

  /**
   * Fetch request to the BestReads API, proceed to the helper
   * method for displaying if the book description is
   * successfully fetched for the target book id.
   * Otherwise displays the error view.
   */
  function fetchBookDescription(book_id) {
    fetch(BOOK_DESC_URL + book_id)
      .then(checkStatus)
      .then(resp => resp.text())
      .then(function(desc) {
        id("book-description").textContent = desc;
      })
      .catch(displayErrorMessage);
  }

  /**
   * Fetch request to the BestReads API, proceed to the helper
   * method for displaying if the list of book reviews is
   * successfully fetched for the target book id.
   * Otherwise displays the error view.
   */
  function fetchBookReview(book_id) {
    fetch(BOOK_REVIEW_URL + book_id)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(displayBookReview)
      .catch(displayErrorMessage);
  }

  /**
   * Alters the HTML element to display the book title and book author.
   */
  function displayBookInfo(bookInfo) {
    id("book-title").textContent = bookInfo["title"];
    id("book-author").textContent = bookInfo["author"];
  }

  /**
   * Create HTML elements based on the book reviews received
   * from the API and displays them on the webpage.
   * For each book's average rating, it's always rounded to 1 decimal place
   */
  function displayBookReview(bookReviews) {
    clearReviewSection();
    let ratingSum = 0;
    let reviewSection = id("book-reviews");
    for (let review of bookReviews) {
      let name = document.createElement("h3");
      name.textContent = review["name"];
      let rating = document.createElement("h4");
      rating.textContent = "Rating: " + review["rating"];
      ratingSum += Number.parseFloat(review["rating"]);
      let text = document.createElement("p");
      text.textContent = review["text"];
      reviewSection.appendChild(name);
      reviewSection.appendChild(rating);
      reviewSection.appendChild(text);
    }
    id("book-rating").textContent = (ratingSum / bookReviews.length).toFixed(1);
  }

  /**
   * Helper method that clears all the HTML elements
   * from the book review section.
   */
  function clearReviewSection() {
    let reviewSection = qsa("#book-reviews > *");
    for (let review of reviewSection) {
      review.parentNode.removeChild(review);
    }
  }

  /**
   * Whenever there's error from the BestReads API server,
   * displays the error view and disable the home button.
   */
  function displayErrorMessage() {
    hide(id("single-book"));
    hide(id("all-books"));
    show(id("error-text"));
    id("home").disabled = true;
  }


  /* ------------------------------ Helper Functions  ------------------------------ */

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} response - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  function checkStatus(response) {
    if (!response.ok) {
      throw Error("Error in request: " + response.statusText);
    }
    return response; // response object
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} query - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  /**
   * Helper method to show an element on the page
   * @param {object} element - Element in DOM
   */
  function show(element) {
    element.classList.remove("hidden");
  }

  /**
   * Helper method to hide an element on the page
   * @param {object} element - Element in DOM
   */
  function hide(element) {
    element.classList.add("hidden");
  }
})();
