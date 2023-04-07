// This function waits for the page to load before adding a click event listener to the menu button.
// When the button is clicked, it toggles the "active" class on the menu element.
$(document).ready(function() {
    $('#menu-btn').click(function() {
      $('#menu').toggleClass("active");
    });
  });
  
// This function sends a request to the server to get all containers, and then injects the resulting HTML into the page.
function getAllContainers() {
    fetch('http://localhost:3000/getAllContainers')
      .then(function(response) {
        return response.text();
      })
      .then(function(html) {
        document.getElementById('result-container').innerHTML = html;
      })
      .catch(function(err) {
        console.error(err);
      });
}

// This function sends a request to the server to get all containers, and then injects the resulting HTML into the page.
function viewVotes() {
    fetch('http://localhost:3000/getVotesByUser/3')
      .then(function(response) {
        return response.text();
      })
      .then(function(html) {
        document.getElementById('result-container').innerHTML = html;
      })
      .catch(function(err) {
        console.error(err);
      });
}

// This function waits for the page to load before calling getAllContainers, but only on the example.com domain.
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.indexOf('search_datasets.html') > -1) {
        getAllContainers();
    }
});

// This function waits for the page to load before calling getAllContainers, but only on the example.com domain.
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.indexOf('view_votes.html') > -1) {
        viewVotes();
    }
});

// This function sends a request to the server to get all files related to a container.
// When the request succeeds, it redirects the user to a page showing the results.
function getRelatedFiles(containerId) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:3000/getFilesByContainerRid/${containerId}`);
    xhr.onload = function() {
        if (xhr.status === 200) {
        window.location.href = 'search_datasets_files.html?result=' + encodeURIComponent(xhr.responseText);
        }
    };
    xhr.send();
}
  
// This function waits for the page to load before getting the value of the "result" parameter from the URL and displaying it on the page.
$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const result = urlParams.get('result');
    const resultContainer = $('#current-dataset');
    resultContainer.html(result);
});
  
// This function sends a request to the server to get all votes related to a container.
// When the request succeeds, it redirects the user to a page showing the results.
function getRelatedVotes(containerId) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:3000/getVotesByContainerRid/${containerId}`);
    xhr.onload = function() {
        if (xhr.status === 200) {
        window.location.href = 'search_datasets_votes.html?result=' + encodeURIComponent(xhr.responseText);
        }
    };
    xhr.send();
}
  
// This function waits for the page to load before getting the value of the "result" parameter from the URL and displaying it on the page.
$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const result = urlParams.get('result');
    const resultContainer = $('#current-votes');
    resultContainer.html(result);
});  


//Function that shows or hides the dropdown menu when the user clicks on the image.
function showMenu() {
    var image = document.getElementById("user-image"); // Get the image element
    var menu = document.getElementById("menu-image"); // Get the dropdown menu element
    if (menu.style.display === "block") { // If the menu is currently visible
        menu.style.display = "none"; // Hide the menu
    } else { // If the menu is currently hidden
        menu.style.display = "block"; // Show the menu
    }
}
  
// Add an event listener to the image element that calls the showMenu function when clicked
document.addEventListener("DOMContentLoaded", function() {
    var image = document.getElementById("user-image");
    image.addEventListener("click", showMenu);
});

/**
 * Initializes the rating widget.
 * @param {string} selectId The ID of the rating select element.
 */
function initRatingWidget(selectId) {
    // Get the rating select element and all the star elements.
    const select = document.getElementById("rating-select");
    const stars = document.querySelectorAll('.star');

    // Handle the click event of each star element.
    stars.forEach(function(star) {
        star.addEventListener('click', function(event) {
            // Get the value of the clicked star.
            var value = parseInt(event.target.getAttribute('data-value'));

            // Update the select element value.
            select.value = value;
            // Loop through all the star elements and update their active state based on the selected value.
            for (let i = 0; i < stars.length; i++) {
                if (i < value) {
                    stars[i].classList.add('active');
                } else {
                    stars[i].classList.remove('active');
                }
            }

            // Update the value variable with the selected value.
            value = select.value;
        });
    });

    // Handle the change event of the rating select element and update the stars based on the selected value.
    select.addEventListener('change', function(event) {
        // Parse the selected value as an integer.
        const value = parseInt(event.target.value);
        const select = document.getElementById("rating-select");

        // Loop through all the star elements and update their active state based on the selected value.
        for (let i = 0; i < stars.length; i++) {
            if (i < value) {
                stars[i].classList.add('active');
            } else {
                stars[i].classList.remove('active');
            }
        }
        select.selecteIndex = value - 1;
    });
}

function downloadFile(relatedFileRid) {
    const url = `http://localhost:3000/downloadFile/${relatedFileRid}`;
    const link = document.createElement("a");
    link.href = url;
    link.click();
}

function downloadDataset(relatedDatasetRid) {
    const url = `http://localhost:3000/downloadFileContainer/${relatedDatasetRid}`;
    const link = document.createElement("a");
    link.href = url;
    link.click();
}