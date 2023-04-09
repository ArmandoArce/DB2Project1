// This function waits for the page to load before calling getAllContainers, but only on the index.html
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.indexOf('index.html') > -1) {
        setUpListeners();
    }
});

// This function waits for the page to load before calling getAllContainers, but only on the index.html
document.addEventListener('DOMContentLoaded', function() {
  fetch('http://localhost:3000/getNotifications')
  .then(function(response) {
    return response.text();
  })
  .then(function(html) {
    document.getElementById('notifications').innerHTML = html;
  })
  .catch(function(err) {
    console.error(err);
  });
  document.querySelector('.toggle-button').addEventListener('click', toggleTable);
});

function toggleTable() {
  const button =document.querySelector('.toggle-button');
  const tableContainer = document.querySelector('.table-container');
  const arrow = document.querySelector('.arrow-up');
  if (tableContainer.style.display === 'none') {
    tableContainer.style.display = 'block';
    arrow.style.display = 'block';
    button.style.color = '#666';
  } else {
    tableContainer.style.display = 'none';
    arrow.style.display = 'none';
    button.style.color = "black";
  }
  console.log("hola");
}

/**
 * Sets up the event listeners for the sign-in and sign-up buttons to toggle the display mode of the container.
 */
function setUpListeners() {
    /**
     * The sign-in button element.
     * @type {HTMLElement}
     */
    const sign_in_btn = document.querySelector("#sign-in-btn");

    /**
     * The sign-up button element.
     * @type {HTMLElement}
     */
    const sign_up_btn = document.querySelector("#sign-up-btn");

    /**
     * The container element.
     * @type {HTMLElement}
     */
    const container = document.querySelector(".container");

    // Add an event listener to the sign-up button to toggle the sign-up mode of the container.
    sign_up_btn.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
    });

    // Add an event listener to the sign-in button to toggle the sign-up mode of the container.
    sign_in_btn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
    });
}
  

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
function getContainersByUserId() {
    fetch('http://localhost:3000/getContainersByUser')
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
function getContainersByUserSpecificId(userId) {
  console.log(userId);
  fetch(`http://localhost:3000/getContainersBySpecificUser/${userId}`)
    .then(function(response) {
      return response.text();
    })
    .then(function(html) {
      if (html.includes("Error retrieving file containers")) {
        document.getElementById('result-container').innerHTML = '<h2 class="i-subname">That user does not have datasets yet.</h2>';
      } else {
          document.getElementById('result-container').innerHTML = html;
      }
    })
    .catch(function(err) {
      console.error(err);
    });
}

// This function sends a request to the server to get all containers, and then injects the resulting HTML into the page.
function viewVotes() {
    fetch('http://localhost:3000/getVotesByUser')
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
function getUserStadistics() {
  fetch('http://localhost:3000/getStadistics')
    .then(function(response) {
      return response.text();
    })
    .then(function(html) {
      document.getElementById('stadistics').innerHTML = html;
    })
    .catch(function(err) {
      console.error(err);
    });
}

// This function waits for the page to load before calling getAllContainers, but only on the search-datasets.html
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.href.indexOf('search_datasets.html') > -1) {
      // Add an event listener to the search button that calls the search function
      const button = document.getElementById('get-datasets-by-name-button');
      if (button) {
        getAllContainers();
        button.addEventListener('click', search);
      }
  }
});


// This function sends a request to the server to get all containers, and then injects the resulting HTML into the page.
function getAllUsers() {
  fetch('http://localhost:3000/getAllUsers')
    .then(function(response) {
      return response.text();
    })
    .then(function(html) {
      document.getElementById('result-container').innerHTML = html;
      // Search all buttons to follow an user
      const followButtons = document.querySelectorAll('.edit[data-userid]');

      // Agrega un controlador de eventos a cada botón de seguimiento
      followButtons.forEach(button => {
        const userId = button.dataset.userid;
        toggleFollow(userId);
        button.addEventListener('click', () => {
          const userId = button.dataset.userid;
          toggleFollow(userId);
        });
      });
    })
    .catch(function(err) {
      console.error(err);
    });
}

// This function waits for the page to load before calling getAllContainers, but only on the search-datasets.html
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.href.indexOf('search_users.html') > -1) {

      getAllUsers();
      
      // Add an event listener to the search button that calls the search function
      document.getElementById('get-datasets-by-name-button').addEventListener('click', searchUsers);
  }
});

function toggleFollow(userId) {
  // Search the specific button
  const followButton = document.querySelector(`.edit[data-userid="${userId}"] a`);

  // Call the checkFollower function using AJAX
  fetch(`http://localhost:3000/check-follower/${userId}`)
    .then(response => response.json())
    .then(data => {
      const isFollowing = data.isFollower;
      // Update the button text based on whether the user is following or not
      if (isFollowing) {
        followButton.innerHTML = `<a class="unfollow-button" onclick="unfollowUser(${userId})">Unfollow</a>`;
      } else {
        followButton.innerHTML = `<a class="follow-button" onclick="followUser(${userId})">Follow</a>`;
      }
    })
    .catch(error => {
      console.log(error);
    });
}

function followUser(userId) {
  // Call the follow function using AJAX
  fetch(`http://localhost:3000/follow/${userId}`)
    .then(response => response.json())
    .then(data => {
      // Update the button text to "Unfollow"
      const followButton = document.querySelector(`.edit[data-userid="${userId}"] .follow-button`);
      followButton.innerHTML = "Unfollow";
      followButton.classList.remove("follow-button");
      followButton.classList.add("unfollow-button");
      // Show success message
      Swal.fire(
        'Success!',
        'User Followed',
        'success'
    )
    })
    .catch(error => {
      console.log(error);
    });
}

function unfollowUser(userId) {
  // Call the unfollow function using AJAX
  fetch(`http://localhost:3000/unfollow/${userId}`)
    .then(response => response.json())
    .then(data => {
      // Update the button text to "Follow"
      const followButton = document.querySelector(`.edit[data-userid="${userId}"] .unfollow-button`);
      followButton.innerHTML = "Follow";
      followButton.classList.remove("unfollow-button");
      followButton.classList.add("follow-button");

      // Show success message
      Swal.fire(
        'Success!',
        'User Unfollowed',
        'success'
      )
    })
    .catch(error => {
      console.log(error);
    });
}

// This function waits for the page to load before calling getAllContainers, but only on the search-datasets.html
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.indexOf('dashboard.html') > -1) {

        getContainersByUserId();
        getUserStadistics();
        // Add an event listener to the search button that calls the search function
        document.getElementById('get-datasets-by-name-button').addEventListener('click', searchByOwner);
    }
});

// This function waits for the page to load before calling viewVotes, but only on the view_votes.html
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

// This function sends a request to the server to get all files related to a container.
// When the request succeeds, it redirects the user to a page showing the results.
function getRelatedUser(userId) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `http://localhost:3000/view-profile-user/${userId}`);
  xhr.onload = function() {
      if (xhr.status === 200) {
      window.location.href = 'view_current_user.html?result=' + encodeURIComponent(xhr.responseText);
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
    if (window.location.href.indexOf('index.html') <= -1) {
        var image = document.getElementById("user-image");
        image.addEventListener("click", showMenu);
    }
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

/**
 * Downloads a related file by sending a GET request to the server and creating a link to the file URL.
 * 
 * @param {string} relatedFileRid - The related file's RID.
 */
function downloadFile(relatedFileRid) {
    /**
     * The URL of the server endpoint to download the related file.
     * @type {string}
     */
    const url = `http://localhost:3000/downloadFile/${relatedFileRid}`;

    /**
     * A link element that will be used to download the file.
     * @type {HTMLAnchorElement}
     */
    const link = document.createElement("a");

    // Set the href of the link element to the URL of the related file.
    link.href = url;

    // Simulate a click on the link element to download the file.
    link.click();
}
  
/**
 * Downloads a related dataset by sending a GET request to the server and creating a link to the dataset URL.
 * 
 * @param {string} relatedDatasetRid - The related dataset's RID.
 */
function downloadDataset(relatedDatasetRid) {
    /**
     * The URL of the server endpoint to download the related dataset.
     * @type {string}
     */
    const url = `http://localhost:3000/downloadFileContainer/${relatedDatasetRid}`;

    /**
     * A link element that will be used to download the dataset.
     * @type {HTMLAnchorElement}
     */
    const link = document.createElement("a");

    // Set the href of the link element to the URL of the related dataset.
    link.href = url;

    // Simulate a click on the link element to download the dataset.
    link.click();
}

// This function waits for the page to load before calling updateDatasetImage, but only on the upload-dataset.html.
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.indexOf('upload_dataset.html') > -1) {
        updateDatasetImage();
        setUpCustomFileInput();
        // Get the form element and add an event listener to handle the form submit.
        const form = document.querySelector('form');
        form.addEventListener('submit', handleFormSubmit);
    }
});

// This function waits for the page to load before calling updateDatasetImage, but only on the upload-dataset.html.
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.href.indexOf('view_profile.html') > -1) {
    fetch(`http://localhost:3000/view-profile`)
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
});

// This function waits for the page to load before calling updateDatasetImage, but only on the upload-dataset.html.
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.href.indexOf('edit_profile.html') > -1) {
    fetch(`http://localhost:3000/edit-profile`)
      .then(function(response) {
        return response.text();
      })
      .then(function(html) {
        document.getElementById('result-container').innerHTML = html;
        updateDatasetImage();
      })
      .catch(function(err) {
        console.error(err);
      });
  }
});

function getAllDownloads(containerRid) {
  // Redirect to the new page
  // Fetch the data after the redirect
  fetch(`http://localhost:3000/getDownloadsData/${containerRid}`)
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


/**
 * Updates the user dataset image with the selected image.
 */
function updateDatasetImage() {
    const inputFile = document.getElementById('selected-avatar');
    inputFile.addEventListener('change', () => {
      // Get the selected file from the input file tag.
      const file = inputFile.files[0];
  
      // Create a URL for the selected file.
      const fileURL = URL.createObjectURL(file);
  
      // Show the "Current avatar" message.
      const currentAvatarMsg = document.getElementById('current-avatar-msg');
      currentAvatarMsg.style.display = 'block';

      // Update the image tag with the selected file.
      const profileImage = document.getElementById('image-dataset');
      profileImage.src = fileURL;
      profileImage.style.display = 'inline-block';

      const adjust = document.querySelectorAll('.login-image');

    });
  
}
  
/**
 * Sets up the event listener for the custom file input element, which allows users to select multiple files
 * and displays the file names on the page.
 * @param {string} buttonId - The ID of the button element that triggers the file input dialog.
 * @param {string} inputId - The ID of the input element that accepts multiple files.
 * @param {string} outputId - The ID of the HTML element where the selected file names will be displayed.
 */
function setUpCustomFileInput() {
    const input = document.getElementById("selected-files");
    const output = document.getElementById("file-list");
  
    input.addEventListener('change', () => {
      const fileCount = input.files.length;
      let fileNames = '';
  
      // Loop through each selected file and append its name to the fileNames variable.
      for (let i = 0; i < fileCount; i++) {
        if (i > 0) {
          fileNames += ', ';
        }
        fileNames += input.files[i].name;
      }
  
      // Update the output element with the selected file names.
      output.textContent = fileNames;

      // Show the "Current files" message.
      const currentAvatarMsg = document.getElementById('current-files-names');
      currentAvatarMsg.style.display = 'block';
    });
}

/**
 * Handles the form submit and uploads the files to the server using fetch.
 * @param {Event} event - The form submit event.
 */
async function handleFormSubmit(event) {
    // Prevent the default form submission behavior.
    event.preventDefault();
    if (!validateForm()) {
        event.preventDefault();
    } else {
        // Get the form data.
        const form = event.target;
        const formData = new FormData(form);
    
        // Upload the files using fetch.
        try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Failed to upload files: ${response.status} ${response.statusText}`);
        } else {
          Swal.fire({
            title: 'Good job!',
            text: 'Dataset uploaded successfully!',
            icon: 'success',
        }).then(() => {
            window.location.href = 'dashboard.html';
        });        
        }
        const data = await response.text();
        console.log(data);
        } catch (error) {
        console.error(error);
        }
    }
}

function editUser(event) {
  event.preventDefault();

  const username = document.getElementById("edit-username").value.trim();
  const name = document.getElementById("edit-name").value.trim();
  const lastName = document.getElementById("edit-last-name").value.trim();
  const password = document.getElementById("edit-password").value.trim();
  const birthday = document.getElementById("edit-birthday").value.trim();

  // Send data to server
  const xhr = new XMLHttpRequest();
  const url = "http://localhost:3000/update-user";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.success) {
          console.log('No file uploaded.');
          editAvatar();
          Swal.fire(
            'Update!',
            'Now you have new information!',
            'success'
          )
      }
      else {
        alert("Error updating user. Please try again.");
      }
    }
    editAvatar();
    Swal.fire(
      'Update!',
      'Now you have new information!',
      'success'
    ).then(() => {
      window.location.href = "dashboard.html"; 
    });
  };
  const data = JSON.stringify({NameUser: name, UsernameUser: username, LastnameUser: lastName, PasswordUser: password, BirthDate: birthday });
  xhr.send(data);
}

/**
 * 
 * Uploads the selected avatar file when the form is submitted.
 * 
 */
function uploadAvatar() {
  const fileInput = document.getElementById('selected-avatar');

  // Check if user has selected a file
  if (!fileInput.files[0]) {
    console.log('No file selected');
    return;
  }

  // Create a new FormData object and append the selected file to it
  const formData = new FormData();
  formData.append('userAvatar', fileInput.files[0]);

  // Send the form data to the server using XMLHttpRequest
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000/uploadUserAvatar');
  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("did it!");
    } else {
      console.log('File upload failed');
    }
  };
  xhr.send(formData);
}
/**
 * 
 * Uploads the selected avatar file when the form is submitted.
 * 
 */
function editAvatar() {
  const fileInput = document.getElementById('selected-avatar');
  // Check if user has selected a file
  if (!fileInput.files[0]) {
    console.log('No file selected');
    return;
  }

  // Create a new FormData object and append the selected file to it
  const formData = new FormData();
  formData.append('userAvatar', fileInput.files[0]);

  // Send the form data to the server using XMLHttpRequest
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000/editUserAvatar');
  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("did it!");
    } else {
      console.log('File upload failed');
    }
  };
  xhr.send(formData);
}

// Define the searchByDescription function
function searchByDescription() {
    const input = document.getElementById('search-criteria');
    const searchTerm = input.value;
    fetch(`http://localhost:3000/getContainersByDescription/${searchTerm}`)
      .then(function(response) {
        return response.text();
      })
      .then(function(html) {
        // Check if the server response contains an error message
        if (html.includes("Cannot GET")) {
          document.getElementById('result-container').innerHTML = '<h2 class="i-subname">There are no datasets with that description.</h2>';
        } else {
          // Check if the table has images
          const table = document.createElement('table');
          table.innerHTML = html;
          const images = table.querySelectorAll('img');
          if (images.length === 0) {
            document.getElementById('result-container').innerHTML = '<h2 class="i-subname">There are no datasets with that description.</h2>';
          } else {
            // Insert the server response HTML into the result container
            document.getElementById('result-container').innerHTML = html;
          }
        }
      })
      .catch(function(err) {
        console.error(err);
      });
}

// Define the searchByName function
function searchByName() {
    const input = document.getElementById('search-criteria');
    const searchTerm = input.value;
    fetch(`http://localhost:3000/getContainersByName/${searchTerm}`)
      .then(function(response) {
        return response.text();
      })
      .then(function(html) {
        // Check if the server response contains an error message
        if (html.includes("Cannot GET")) {
          document.getElementById('result-container').innerHTML = '<h2 class="i-subname">There are no datasets with that name.</h2>';
        } else {
          // Check if the table has images
          const table = document.createElement('table');
          table.innerHTML = html;
          const images = table.querySelectorAll('img');
          if (images.length === 0) {
            document.getElementById('result-container').innerHTML = '<h2 class="i-subname">There are no datasets with that name.</h2>';
          } else {
            // Insert the server response HTML into the result container
            document.getElementById('result-container').innerHTML = html;
          }
        }
      })
      .catch(function(err) {
        console.error(err);
      });
}

// Define the searchUsersByName function
function searchUsersByUsername() {
  const input = document.getElementById('search-criteria');
  const searchTerm = input.value;
  fetch(`http://localhost:3000/getUsersByUsername/${searchTerm}`)
    .then(function(response) {
      return response.text();
    })
    .then(function(html) {
      // Check if the server response contains an error message
      if (html.includes("Cannot GET")) {
        document.getElementById('result-container').innerHTML = '<h2 class="i-subname">There are no users with that username.</h2>';
      } else {
        // Check if the table has images
        const table = document.createElement('table');
        table.innerHTML = html;
        const images = table.querySelectorAll('img');
        if (images.length === 0) {
          document.getElementById('result-container').innerHTML = '<h2 class="i-subname">There are no users with that username.</h2>';
        } else {
          // Insert the server response HTML into the result container
          document.getElementById('result-container').innerHTML = html;
          // Search all buttons to follow an user
          const followButtons = document.querySelectorAll('.edit[data-userid]');

          // Agrega un controlador de eventos a cada botón de seguimiento
          followButtons.forEach(button => {
            const userId = button.dataset.userid;
            toggleFollow(userId);
            button.addEventListener('click', () => {
              const userId = button.dataset.userid;
              toggleFollow(userId);
            });
          });
        }
      }
    })
    .catch(function(err) {
      console.error(err);
    });
}
  
// Define the searchByDescription function
function searchByDescriptionAndOwner() {
    const input = document.getElementById('search-criteria');
    const searchTerm = input.value;
    fetch(`http://localhost:3000/getContainersByDescriptionAndUser/${searchTerm}`)
      .then(function(response) {
        return response.text();
      })
      .then(function(html) {
        // Check if the server response contains an error message
        if (html.includes("Cannot GET")) {
          document.getElementById('result-container').innerHTML = '<h2 class="i-subname">There are no datasets with that description.</h2>';
        } else {
          // Check if the table has images
          const table = document.createElement('table');
          table.innerHTML = html;
          const images = table.querySelectorAll('img');
          if (images.length === 0) {
            document.getElementById('result-container').innerHTML = '<h2 class="i-subname">There are no datasets with that description.</h2>';
          } else {
            // Insert the server response HTML into the result container
            document.getElementById('result-container').innerHTML = html;
          }
        }
      })
      .catch(function(err) {
        console.error(err);
      });
}

// Define the searchByName function
function searchByNameAndOwner() {
    const input = document.getElementById('search-criteria');
    const searchTerm = input.value;
    fetch(`http://localhost:3000/getContainersByNameAndUserId/${searchTerm}`)
      .then(function(response) {
        return response.text();
      })
      .then(function(html) {
        // Check if the server response contains an error message
        if (html.includes("Cannot GET")) {
          document.getElementById('result-container').innerHTML = '<h2 class="i-subname">There are no datasets with that name.</h2>';
        } else {
          // Check if the table has images
          const table = document.createElement('table');
          table.innerHTML = html;
          const images = table.querySelectorAll('img');
          if (images.length === 0) {
            document.getElementById('result-container').innerHTML = '<h2 class="i-subname">There are no datasets with that name.</h2>';
          } else {
            // Insert the server response HTML into the result container
            document.getElementById('result-container').innerHTML = html;
          }
        }
      })
      .catch(function(err) {
        console.error(err);
      });
}

// Define the search function
function search() {

    // Select the dropdown element
    const select = document.getElementById('search-by');

    // Get the selected search option from the dropdown
    const searchOption = select.value;

    // Call the appropriate search function based on the selected option
    if (searchOption === 'description') {
        searchByDescription();
    } else if (searchOption === 'name') {
        searchByName();
    } else if(searchOption === 'all') {
        getAllContainers();
    }
}

// Define the search function
function searchUsers() {

  // Select the dropdown element
  const select = document.getElementById('search-by');

  // Get the selected search option from the dropdown
  const searchOption = select.value;

  // Call the appropriate search function based on the selected option
   if (searchOption === 'name') {
      searchUsersByUsername();
    } else if(searchOption === 'all') {
      getAllUsers();
    }
}

// Define the search function
function searchByOwner() {
    // Select the dropdown element
    const select = document.getElementById('search-by');

    // Get the selected search option from the dropdown
    const searchOption = select.value;

    // Call the appropriate search function based on the selected option
    if (searchOption === 'description') {
        searchByDescriptionAndOwner();
    } else if (searchOption === 'name') {
        searchByNameAndOwner();
    } else if(searchOption === 'all') {
        getContainersByUserId();
    }
}

/**
 *  This function validates the form by checking if all the required input fields are filled.
 *  If any of the required fields are empty, it will display an alert message and return false.
 *  If all required fields are filled, it will return true.
 *  @returns {boolean} true if all required fields are filled, false otherwise
*/
function validateForm() {
    const nameInput = document.getElementsByName('name')[0];
    const descriptionInput = document.getElementsByName('description')[0];
    const filesInput = document.getElementsByName('files')[0];
    const avatarInput = document.getElementsByName('avatar')[0];
    if (nameInput.value.trim() === '' ||
        descriptionInput.value.trim() === '' ||
        filesInput.value.trim() === '' ||
        avatarInput.value.trim() === '') {   
            Swal.fire({
                title: 'Warning!',
                text: 'Please fill in all the required fields!',
                icon: 'warning',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Got it!'
            })   
            return false;
    }
    return true;
}

/**
 *  This function validates the form by checking if all the required input fields are filled.
 *  If any of the required fields are empty, it will display an alert message and return false.
 *  If all required fields are filled, it will return true.
 *  @returns {boolean} true if all required fields are filled, false otherwise
*/
function validateFormSingIn() {
    const idInput = document.getElementById('sign-up-id');
    const usernameInput = document.getElementById('sign-up-username');
    const nameInput = document.getElementById('sign-up-name'); 
    const lastnameInput = document.getElementById('sign-up-last-name');
    const passwordInput = document.getElementById('sign-up-password');
    const avatarInput = document.getElementById('selected-avatar');
    const birthdayInput = document.getElementById('sign-up-birthday');
    if (usernameInput.value.trim() === '' ||
        idInput.value.trim() === '' ||
        nameInput.value.trim() === '' ||
        lastnameInput.value.trim() === '' ||
        passwordInput.value.trim() === '' ||
        birthdayInput.value.trim() === '' ||
        avatarInput.value.trim() === '') {   
            Swal.fire({
                title: 'Warning!',
                text: 'Please fill in all the required fields!',
                icon: 'warning',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Got it!'
            })   
            return false;
    }
    return true;
}

function preventBack(event) {
    event.preventDefault();
    window.history.pushState({}, document.title, "index.html");
    window.location.href = "index.html";
}

function registerUser(event) {
    event.preventDefault();

    const username = document.getElementById("sign-up-username").value.trim();
    const name = document.getElementById("sign-up-name").value.trim();
    const lastName = document.getElementById("sign-up-last-name").value.trim();
    const password = document.getElementById("sign-up-password").value.trim();
    const birthday = document.getElementById("sign-up-birthday").value.trim();
    const id = document.getElementById("sign-up-id").value.trim();
  
    // Validate inputs
    if (!validateFormSingIn()) {
      return;
    }
  
    // Send data to server
    const xhr = new XMLHttpRequest();
    const url = "http://localhost:3000/register-user";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            uploadAvatar();
            Swal.fire(
              'Welcome!',
              'User created succesfully!',
              'success'
            );
          } else {
            Swal.fire(
              'Oops...',
              response.message,
              'error'
            );
          }
        } else if (xhr.status === 400) {
          const errorResponse = JSON.parse(xhr.responseText);
          Swal.fire(
            'Oops...',
            errorResponse.message,
            'error'
          );
        } else {
          Swal.fire(
            'Oops...',
            'Something went wrong!',
            'error'
          );
        }
      }            
    };
    const data = JSON.stringify({ IdUser: id, NameUser: name, UsernameUser: username, LastnameUser: lastName, PasswordUser: password, BirthDate: birthday });
    xhr.send(data);
}

function loginUser(event) {
    event.preventDefault();
  
    const username = document.getElementById("sign-in-username").value.trim();
    const password = document.getElementById("sign-in-password").value.trim();
  
    // Validate inputs
    if (!username || !password) {
      Swal.fire({
        title: 'Warning!',
        text: 'Please fill in all the required fields!',
        icon: 'warning',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Got it!'
    })   
      return;
    }
  
    // Send data to server
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ UsernameUser: username, PasswordUser: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          Swal.fire(
            'Great!',
            'Logged in successfully!',
            'success'
        )
          window.location.href = "dashboard.html"; 
        } else {
          Swal.fire(
            'Error!',
            data.message.toString(),
            'error'
        )
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Error logging in. Please try again.");
      });
}
  
function validateInput() {
    input = document.getElementById("sign-up-id");
    const defaultValue = "11111111";
    const minDigits = 8;
    const maxDigits = 8;
  
    let inputValue = input.value;
  
    // Remove non-digits from input value
    inputValue = inputValue.replace(/\D/g, '');
  
    // Ensure input is at least minDigits long
    if (inputValue.length < minDigits) {
      inputValue = defaultValue;
    }
  
    // Truncate input to maxDigits digits
    inputValue = inputValue.slice(0, maxDigits);
  
    // Ensure input is positive
    if (parseInt(inputValue) < 1) {
      inputValue = defaultValue;
    }
  
    input.value = inputValue;
}



/**

Sends a request to the server to retrieve all containers belonging to the logged in user,
and then injects the resulting HTML into the 'result-container' element on the page.
*/
function copyDataSetById(fileContainerRID) {
  // Make a fetch request to the server to get containers by user ID
  fetch(`http://localhost:3000/copy-dataset/${fileContainerRID}`)
  .then(response => response.text()) // Parse response as text
  .then(html => {
    // Redirect to the copy_dataset.html page with the HTML content as a URL parameter
    window.location.href = `copy_dataset.html?html=${encodeURIComponent(html)}`;
  })
  .catch(error => console.error(error)); // Handle any errors during the request
}


/**

Sends a request to the server to retrieve all containers belonging to the logged in user,
and then injects the resulting HTML into the 'result-container' element on the page.
*/
function copyDataset(fileContainerRID) {
  document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    const newContainerName = document.getElementById('newContainerName').value; // Retrieve the value of the input element
    console.log(JSON.stringify({newContainerName: newContainerName})); // Print the request body to the console
    fetch(`http://localhost:3000/copy/${fileContainerRID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({newContainerName: newContainerName})
    })
    .then(response => response.text())
    .then(data => {
      // Parse the response body as JSON
      console.log(data);
      const parsedData = JSON.parse(data);
      // Handle the response data here
      console.log(parsedData);
    })
    .catch(error => console.error(error)); // Handle any errors during the request
  });
}

// This function waits for the page to load before calling getAllContainers, but only on the index.html
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.href.indexOf('copy_dataset.html') > -1) {
    const urlParams = new URLSearchParams(window.location.search);
    const html = urlParams.get('html');
    const container = document.getElementById('result-container');
    container.innerHTML = html;
  }
});
