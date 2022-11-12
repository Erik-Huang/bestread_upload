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
  const COVER_URL = "covers/";
  const API_URL = "https://i04cb20al3.execute-api.us-east-1.amazonaws.com/dev"
  const BOBA_LIST_URL = API_URL + "/boba/boba_list";
  const BOBA_DESC_URL = "/bestreads/description/";
  const BOBA_INFO_URL = "/bestreads/info/";
  const BOBA_REVIEW_URL = "/bestreads/reviews/";



  window.addEventListener("load", init);

  /**
   * Populate the main view for the Bestreads webpage
   * Initialize the start battle button.
   */
  function init() {
    populateBobaList();
    id("home").addEventListener("click", showAllBobaSection);
  }

  /**
   * Fetch request to the BestReads API, proceed to the helper
   * method for displaying if boba list data is successfully fetched.
   * Otherwise displays the error view.
   */
  function populateBobaList() {
    fetch(BOBA_LIST_URL)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(displayBobas)
      .catch(displayErrorMessage);
  }

  /**
   * Create HTML elements based on the boba list received
   * from the API and displays them on the webpage.
   * For each boba, add a click event listener that calls
   * the show detail function.
   * @param {JSON} bobaList - Array that contains info about all bobas
   */
  function displayBobas(bobaList) {
    console.log("In display");
    showAllBobaSection();
    let bobaSection = id("all-bobas");
    for (let boba of bobaList) {
      console.log(boba);
      let bobaHolder = document.createElement("div");
      bobaHolder.id = boba["boba_id"];
      /*
      let coverImg = document.createElement("img");
      coverImg.src = COVER_URL + boba["boba_id"] + ".jpg";
      coverImg.alt = boba["boba_id"];
      bobaHolder.appendChild(coverImg);
      */
      let bobaName = document.createElement("p");
      bobaName.textContent = boba["boba_id"];
      bobaHolder.appendChild(bobaName);
      bobaHolder.addEventListener("click", showDetail);
      bobaSection.appendChild(bobaHolder);
    }
  }

  /**
   * Toggles the view of the webpage from a single boba view
   * to the full boba list.
   */
  function showAllBobaSection() {
    hide(id("single-boba"));
    show(id("all-bobas"));
  }

  /**
   * Toggles the view of the webpage from the full boba list
   * to a single boba view and populate the information according
   * to the boba chosen.
   */
  function showDetail() {
    show(id("single-boba"));
    hide(id("all-bobas"));
    let bobaId = this.id;
    let cover = id("boba-cover");
    cover.src = COVER_URL + bobaId + ".jpg";
    cover.alt = bobaId;
    fetchBobaInfo(bobaId);
    fetchBobaDescription(bobaId);
    fetchBobaReview(bobaId);
  }

  /**
   * Fetch request to the BestReads API, proceed to the helper
   * method for displaying if the boba title and author is
   * successfully fetched for the target boba id.
   * Otherwise displays the error view.
   * @param {string} bobaId - String representation of the boba id
   */
  function fetchBobaInfo(bobaId) {
    fetch(BOBA_INFO_URL + bobaId)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(displayBobaInfo)
      .catch(displayErrorMessage);
  }

  /**
   * Fetch request to the BestReads API, proceed to the helper
   * method for displaying if the boba description is
   * successfully fetched for the target boba id.
   * Otherwise displays the error view.
   * @param {string} bobaId - String representation of the boba id
   */
  function fetchBobaDescription(bobaId) {
    fetch(BOBA_DESC_URL + bobaId)
      .then(checkStatus)
      .then(resp => resp.text())
      .then(function(desc) {
        id("boba-description").textContent = desc;
      })
      .catch(displayErrorMessage);
  }

  /**
   * Fetch request to the BestReads API, proceed to the helper
   * method for displaying if the list of boba reviews is
   * successfully fetched for the target boba id.
   * Otherwise displays the error view.
   * @param {string} bobaId - String representation of the boba id
   */
  function fetchBobaReview(bobaId) {
    fetch(BOBA_REVIEW_URL + bobaId)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(displayBobaReview)
      .catch(displayErrorMessage);
  }

  /**
   * Alters the HTML element to display the boba title and boba author.
   * @param {JSON} bobaInfo - JSON object that contains basic boba info
   */
  function displayBobaInfo(bobaInfo) {
    id("boba-title").textContent = bobaInfo["title"];
    id("boba-author").textContent = bobaInfo["author"];
  }

  /**
   * Create HTML elements based on the boba reviews received
   * from the API and displays them on the webpage.
   * For each boba's average rating, it's always rounded to 1 decimal place
   * @param {JSON} bobaReviews - Array of reviews of the target boba.
   */
  function displayBobaReview(bobaReviews) {
    clearReviewSection();
    let ratingSum = 0;
    let reviewSection = id("boba-reviews");
    for (let review of bobaReviews) {
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
    id("boba-rating").textContent = (ratingSum / bobaReviews.length).toFixed(1);
  }

  /**
   * Helper method that clears all the HTML elements
   * from the boba review section.
   */
  function clearReviewSection() {
    let reviewSection = qsa("#boba-reviews > *");
    for (let review of reviewSection) {
      review.parentNode.removeChild(review);
    }
  }

  /**
   * Whenever there's error from the BestReads API server,
   * displays the error view and disable the home button.
   */
  function displayErrorMessage() {
    hide(id("single-boba"));
    hide(id("all-bobas"));
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
