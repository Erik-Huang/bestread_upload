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
  const INFO_API = "https://i04cb20al3.execute-api.us-east-1.amazonaws.com/dev/boba/search_boba"

  window.addEventListener("load", init);

  function init() {
    //showDetail();
    const queryString = window.location.search;
    console.log(queryString); // ?boba_id=10000&brand=xxxx
    const urlParams = new URLSearchParams(queryString);
    const boba_id = urlParams.get('boba_id')
    console.log(boba_id);
    const BOBA_INFO_URL = INFO_API + queryString;
    showDetail(BOBA_INFO_URL);
    // https://www.sitepoint.com/get-url-parameters-with-javascript/
    // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/set
    //id("home").addEventListener("click", showAllBobaSection);
  }

  /**
   * Toggles the view of the webpage from the full boba list
   * to a single boba view and populate the information according
   * to the boba chosen.
   */
  function showDetail(url) {
    show(id("single-boba"));
    hide(id("all-bobas"));
    fetchBobaInfo(url);
  }

  /**
   * Fetch request to the BestReads API, proceed to the helper
   * method for displaying if the boba title and author is
   * successfully fetched for the target boba id.
   * Otherwise displays the error view.
   * @param {string} bobaId - String representation of the boba id
   */
  function fetchBobaInfo(url) {
    fetch(url)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(displayBobaInfo)
      .catch(displayErrorMessage);
  }


  /**
   * Alters the HTML element to display the boba title and boba author.
   * @param {JSON} bobaInfo - JSON object that contains basic boba info
   */
  function displayBobaInfo(bobaInfo) {
    console.log(bobaInfo)
    id("boba-title").textContent = bobaInfo[0]["boba_name"];
    id("boba-author").textContent = "Rating: " + bobaInfo[0]["boba_rating"];
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
