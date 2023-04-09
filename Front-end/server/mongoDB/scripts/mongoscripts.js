
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.href.indexOf('search_datasets_files.html') > -1) {
      waitForDatasetElement();
  }
});

function waitForDatasetElement() {
  const datasetElem = document.getElementById('currentDataset');
  if (datasetElem) {
      getComments(datasetElem.value);
  } else {
      setTimeout(waitForDatasetElement, 100);
  }
}



//MONGO -------------------------------------------------------------------------------
function getComments(currentDataset) {
    fetch(`http://localhost:3000/comments/getbyDataset/${currentDataset}`) 
    .then(response => response.text()) // Convertir la respuesta a texto
    .then(html => {
  // Insertar la respuesta HTML en el elemento con id "comentarios"
    document.getElementById('comentarios').innerHTML = html;
    });
}

function submitComment() {
  const formData = new FormData();
  formData.append('user', document.getElementById('currentOwner').value);
  formData.append('dataset', document.getElementById('currentDataset').value); 
  formData.append('content', document.getElementById('NewContent').value);
  const mediaFiles = document.getElementById('NewMediaFC').files;
  if (mediaFiles && mediaFiles.length > 0) {
    for (let i = 0; i < mediaFiles.length; i++) {
      formData.append('media[]', mediaFiles[i]);
    }
  }
  formData.append('responseTo', 1);
  
  fetch('http://localhost:3000/comments/create', {
    method: 'POST',
    body: formData
  }).then(response => {
    Swal.fire({
      title: 'Good job!',
      text: 'Comment uploaded successfully!',
      icon: 'success',
  }).then(() => {
      window.location.href = 'search_datasets.html';
  });
  }).catch(error => {
    // Handle the error
  });
}

function submitResponse() {
  const formData = new FormData();
  formData.append('user', document.getElementById('currentOwner').value);
  formData.append('dataset', document.getElementById('currentDataset').value); 
  formData.append('content', document.getElementById('myContent').value);
  const mediaFiles = document.getElementById('NewMediaFC').files;
  if (mediaFiles && mediaFiles.length > 0) {
    for (let i = 0; i < mediaFiles.length; i++) {
      formData.append('media[]', document.getElementById('NewMediaFC').value);
    }
  }
  formData.append('responseTo', document.getElementById('responseTo').value);
  
  fetch('http://localhost:3000/comments/createResponse', {
    method: 'POST',
    body: formData
  }).then(response => {
    Swal.fire({
      title: 'Good job!',
      text: 'Comment uploaded successfully!',
      icon: 'success',
  }).then(() => {
      window.location.href = 'search_datasets.html';
  });
  }).catch(error => {
    // Handle the error
  });
}



