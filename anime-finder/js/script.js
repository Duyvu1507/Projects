// Hooking up buttons and setting setting the current year
window.onload = (e) => {
    document.querySelector("#search").onclick = searchButtonClicked;
    document.querySelector("#random").onclick = randomButtonClicked;
    document.querySelector("#dailyButton").onclick = dailyButtonClicked;
    document.querySelector("#bySeason").onclick = bySeasonClicked;

    // Start the program with a random show so it doesn't look so empty
    randomButtonClicked();

    // Set search bar value to local storage value
    const TERM = localStorage.getItem(displayTerm);
    document.querySelector("#searchBar").value = TERM;

    // Setup dates
    let date = new Date().getFullYear();
    for (let i = 2000; i <= date + 1; i++) {
        let line = `<option value="` + i + `" selected>` + i + `</option>`;
        document.querySelector("#yearSelect").innerHTML += line;
    }
    document.querySelector("#currentYear").innerHTML = new Date().getFullYear();

}

// Variables
let displayTerm = "";
let day = "";
let currentResults = ""; // Keeps track of current result
let currentSearch = ""; // Keeps track of current search to display
let currentShow;

const JIKAN_URL = "https://api.jikan.moe/v4/";
let days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// Gets data for search button based on URL compiled in this function
function searchButtonClicked() {
    document.querySelector("#results").innerHTML = "<p id='status'><i>Searching...</i></p>";
    let url = JIKAN_URL;
    let term = document.querySelector("#searchBar").value;
    if (term.length == 0) {
        document.querySelector("#results").innerHTML = "<p id='status'><i>Please enter something to search.</i></p>";
        // Clear screen (This is for when there are no results)
        document.querySelector("#content").innerHTML = "";
        return;
    }

    // Store search term into local storage
    localStorage.setItem(displayTerm, term);

    displayTerm = term;
    term = term.trim();
    term = encodeURIComponent(term);

    if (term.length < 3) {
        return;
    }
    url += "anime?q=" + term + "&page=1";

    getData(url, 1);
}

// OnClick for the daily episodes button
function dailyButtonClicked() {
    document.querySelector("#results").innerHTML = "<p id='status'><i>Searching...</i></p>";
    document.querySelector("#searchBar").value = '';
    day = days[new Date().getDay()];

    let url = JIKAN_URL + "schedules/" + day;
    console.log(url);
    getData(url, 2);
}

// OnClick for the surpise me button
function randomButtonClicked() {
    document.querySelector("#results").innerHTML = "<p id='status'><i>Searching... </i></p>";
    document.querySelector("#searchBar").value = '';
    let year = Math.floor(Math.random() * (new Date().getFullYear() - 2000)) + 2000;
    let url = JIKAN_URL + "seasons/" + year + "/";
    let season = Math.floor(Math.random() * 4);
    switch (season) {
        case 0:
            url += "winter";
            break;
        case 1:
            url += "spring";
            break;
        case 2:
            url += "summer";
            break;
        default:
            url += "fall";
            break;
    }
    getData(url, 3);
}

// OnClick for the season search button
function bySeasonClicked() {
    document.querySelector("#results").innerHTML = "<p id='error'><i>Searching...</i></p>";
    let url = JIKAN_URL + "seasons/" + document.querySelector("#yearSelect").value + "/" + document.querySelector("#seasonSelect").value;
    getData(url, 4);
}

// Gets search data based on button clicked
function getData(url, caseNum) {
    let xhr = new XMLHttpRequest();

    switch (caseNum) {
        case 1:
            xhr.onload = dataLoaded;
            break;
        case 2:
            xhr.onload = dataDaily;
            break;
        case 3:
            xhr.onload = randomSearch;
            break;
        case 4:
            xhr.onload = seasonSearch;
            break;
    }

    xhr.onerror = dataError;

    xhr.open("GET", url);
    xhr.send();
}

// Obtains data for main searchbar function
function dataLoaded(e) {
    // Setup
    document.querySelector("#content").style.flexWrap = "wrap";

    // XHR setup
    let xhr = e.target;
    console.log(xhr.responseText);

    let obj = JSON.parse(xhr.responseText);

    if (obj.length < 1) {
        document.querySelector("#results").innerHTML = "<p id='status'><i>Sorry, there's nothing here.</i></p>";
        document.querySelector("#content").innerHTML = "";
        return;
    }

    // Creating a means to store and sort results
    let results = obj;

    // Filter out pornography
    results = results.data.filter(item => item.rating !== "Rx - Hentai");

    console.log(results);

    // Display number of results
    let numResults = results.length;
    document.querySelector("#results").innerHTML = "<h2>" + numResults + " Results for '" + displayTerm + "'</h2>";

    // Set current search (Search bar search)
    currentSearch = document.querySelector("#results").innerHTML;

    DisplayMultiPage(results);
}

// Obtains data for daily series
function dataDaily(e) {
    // Setup
    document.querySelector("#content").style.flexWrap = "wrap";

    let xhr = e.target;
    console.log(xhr.responseText);
    let obj = JSON.parse(xhr.responseText);
    let results;

    document.querySelector("#results").innerHTML = "<h2>These anime have new episodes today:</h2>";
    results = obj.data;

    // Checks to make sure there are results
    if (results.length == 0) {
        document.querySelector("#results").innerHTML = "<p id='status'><i>Sorry, there're no new episodes today.</i></p>";
        document.querySelector("#content").innerHTML = "";
        return;
    }

    // Set current search (daily search)
    currentSearch = document.querySelector("#results").innerHTML;

    DisplayMultiPage(results);
}

// Obtains data for a random anime
function randomSearch(e) {
    // Setting flex
    document.querySelector("#content").style.flexWrap = "nowrap";
    document.querySelector("#results").innerHTML = "<h2>Your random anime is... </h2>";

    let xhr = e.target;

    let obj = JSON.parse(xhr.responseText);

    let results = obj;

    // Filter out pornography
    results = results.data.filter(item => item.rating !== "Rx - Hentai");

    // Shuffle List of results
    let currentIndex = results.length, randomIndex;
    while (currentIndex != 0) {
        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [results[currentIndex], results[randomIndex]] = [results[randomIndex], results[currentIndex]];
    }

    // Pop results to obtain 1
    while (results.length > 1) {
        results.pop();
    }

    // Set current search (random search)
    currentSearch = document.querySelector("#results").innerHTML;

    DisplayMultiPage(results);
}

// Obtains data for seasonal anime 
function seasonSearch(e) {
    // Setup
    document.querySelector("#content").style.flexWrap = "wrap";

    document.querySelector("#results").innerHTML = '<h2>Results for "' + document.querySelector("#seasonSelect").value + " " + document.querySelector("#yearSelect").value + '":</h2>';

    let xhr = e.target;
    console.log(xhr.responseText);
    let obj = JSON.parse(xhr.responseText);
    let results = obj;
    console.log(results);

    // Checks to make sure there are results
    if	(results.data.length == 0) {
        document.querySelector("#content").innerHTML = "<p id='error'><i>Sorry, there's nothing here.</i></p>";
        document.querySelector("#content").innerHTML = "";
        return;
    }

    // Filter out pornography
    results = results.data.filter(item => item.rating !== "Rx - Hentai");

    currentSearch = document.querySelector("#results").innerHTML;

    DisplayMultiPage(results);
}

// Displays multiple results on the page 
function DisplayMultiPage(results) {
    document.querySelector("#backButton").innerHTML = "";
    let bigString = "";

    // Displays all results
    for (let i = 0; i < results.length; i++) {

        let result = results[i];

        let smallURL = result.images.jpg.image_url;

        if (!smallURL) {
            smallURL = "images/no-image-found.png";
        }

        let url = result.url;

        let eps = result.episodes;
        if (eps == null) {
            eps = "TBA";
        }

        let score = `<p id='scoreDisplay'>Score: ${result.score}/10</p>`;
        if (result.score == null || result.score == 0) {
            score = "No Score";
        }

        let line = `<div class='flexResult'><img src='${smallURL}' alt='${result.title}' class='animeImg' onclick='MoreInfo(event, ${i});'/>`;

        line += `<p>${result.title}</p><span><a target='_blank' href='${url}'>View on MAL</a><p>Episodes: ${eps}</p>${score}</span></div>`;
        line += `</span></div>`;

        bigString += line;
    }

    currentResults = results;

    document.querySelector("#content").innerHTML = bigString;
}

// Display more information on a specific anime
function DisplayAnimeInfo(result) {
    document.querySelector("#results").innerHTML = "<h2>" + "More Information</h2>";
    document.querySelector("#backButton").innerHTML = `<button type="button">Back</button>`;
    document.querySelector("#backButton").onclick = backClicked;

    // Creating the string that will store generated HTML code
    let bigString = "";

    // Getting an image from the result's data
    let smallURL = result.images.jpg.image_url;
    if (!smallURL) smallURL = "images/no-image-found.png";

    let url = result.url;

    // Displaying image and title
    let line = `<div id='wrapper'><div id='aniImg'><h3>` + result.title + `</h3><img src='${smallURL}' title='${result.title}' id='resultimg'/>`;

    let eps = result.episodes;
    if (eps == null) {
        eps = "TBA";
    }
    line += `<p></p><span>Episodes: ${eps}`;

    let score = `<p>Score: ${result.score}/10</p>`;
    if (result.score == null) {
        score = "<p>No Score</p>";
    }
    line += score;

    // Determines obscurity level based on member count
    if (result.members > 500000) {
        line += `<p><b>Very Popular</b>- ` + result.members + ` Members`;
    }
    else if (result.members < 100000) {
        line += `<p><b>Niche</b>- ` + result.members + ` Members`;
    }
    else if (result.members < 50000) {
        line += `<p><b>Obscure</b>- ` + result.members + ` Members`;
    }
    else {
        line += `<p><b>Popular</b>- ` + result.members + ` Members`;
    }

    line += `</span></div>`;

    // Prints the synopsis
    line += `<div id='synopsis'><h3>Synopsis:</h3><p>` + result.synopsis + `<a target='_blank' href='${url}'> View on MAL</a></p>`

    line += `</div></div>`

    bigString += line;

    document.querySelector("#content").innerHTML = bigString;
}

// Obtain data of anime the user clicked on
function MoreInfo(e, index) {
    DisplayAnimeInfo(currentResults[index]);
}

// Allows user to go back to their search
function backClicked() {
    document.querySelector("#results").innerHTML = currentSearch;
    DisplayMultiPage(currentResults);
}

// Handles errors
function dataError(e) {
    console.log("An error occurred");
}

