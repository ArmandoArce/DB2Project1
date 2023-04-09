const Comment = require('../models/comentarios.model.js');
const fs = require('fs')

const createComment = async (req,res) => { 
    const {user, dataset, content} = req.body
    const commentId = await Comment.count();
    
    var commentFiles = [];

    var media = {
        data: Buffer,
        contentType:String
    }
    
    for (var i = 0; i < (req.files?.media?.length || 0); i++) { 
        
        media.data =  req.files.media[i].data;
        media.contentType = req.files.media[i].mimetype;
        commentFiles.push(media);
        
     }

     const comment = new Comment({
        commentId:commentId+1,
        userId: user,
        datasetId:dataset,
        content:content,
        media:commentFiles
       })   
    
  try {
    await comment.save();
    res.json('Agregado correctamente');
  } catch (err) {
    console.log('Error:', err.message);
    res.json(err.message);
  }
}

const createCommentResponse = async (req,res) => { 
  const {user,content,responseTo} = req.body
  const commentId = await Comment.count()

  var commentFiles = [];
  var media = null;

  var media = {
      data: Buffer,
      contentType:String
  }
  
  for (var i = 0; i < (req.files?.media?.length || 0); i++) { 
      
      media.data =  req.files.media[i].data;
      media.contentType = req.files.media[i].mimetype;
      commentFiles.push(media);
      
   }
  
   const comment = new Comment({
      commentId:commentId+1,
      userId: user,
      content:content,
      media:commentFiles,
      responseTo:responseTo
     })   
  
try {
  await comment.save();
  console.log(comment);
  res.json('Agregado correctamente');
} catch (err) {
  console.log('Error:', err.message);
  res.json(err.message);
}


}

const getComments = async (req, res) => {
  const { datasetId } = req.params;
  const comments = await Comment.find({ datasetId: datasetId });

  let html = "<div class='comments-container'>";

  for (let i = 0; i < comments.length; i++) {
    html += `<div class='comment'>
                <p><span style="color: #EAAA00;">${comments[i].userId}</span> said:</p>
                <p>${comments[i].content}</p>
                <div class='media'>`;
    for (let j = 0; j < comments[i].media.length; j++) {
      if (comments[i].media[j].contentType.includes('video')) {
        html += `<video controls style="height:50px; margin-right:10px;">
                  <source src='data:${comments[i].media[j].contentType};base64,${comments[i].media[j].data.toString('base64')}' type='${comments[i].media[j].contentType}'>
                </video>`;
      } else {
        html += `<img src='data:${comments[i].media[j].contentType};base64,${comments[i].media[j].data.toString('base64')}' style="height:50px; margin-right:10px;" />`;
      }
    }
    html += "</div>";
  
    const relatedComments = await Comment.find({ responseTo: comments[i].commentId });
  
    html += "<div class='associated-comments'>";
    for (let j = 0; j < relatedComments.length; j++) {
      html += `<div class='comment'>
                  <p>${relatedComments[j].userId} Commented:</p>
                  <p>${relatedComments[j].content}</p>
                  <div class='media'>`;
      for (let k = 0; k < relatedComments[j].media.length; k++) {
        if (relatedComments[j].media[k].contentType.includes('video')) {
          html += `<video controls>
                    <source src='data:${relatedComments[j].media[k].contentType};base64,${relatedComments[j].media[k].data.toString('base64')}' type='${relatedComments[j].media[k].contentType}'>
                  </video>`;
        } else {
          html += `<img src='data:${relatedComments[j].media[k].contentType};base64,${relatedComments[j].media[k].data.toString('base64')}' style="height:50px; margin-right:10px;" />`;
        }
      }
      html += "</div></div>";
    }
  
      html += `
      <!-- Formulario oculto por defecto -->
      <div class="comments-container">
      <div class="comments-section">
        <div id="NewCommentForm">
          <label for="content">Answer this comment:</label>
          <textarea id="myContent" name="content" class="textarea"></textarea>
          <input type="hidden" id="responseTo" value="${comments[i].commentId}">
          <input type="hidden" id="NewMediaFC" name="media[]" multiple #content>
          <input type="button" onclick="submitResponse()" class="button button-green" value="Answer" />
        </div>
      </div>
    </div>    
      `;
    html += "</div></div>";
  }


  const css = `
    .comments-container {
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }

    .comment {
      margin-bottom: 20px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }

    .comment p {
      margin: 0;
      padding: 0;
      font-weight: bold;
    }

    .media img {
      max-width: 100%;
      height: auto;
    }

    .associated-comments {
      margin-left: 20px;
    }
  `;

  const htmlWithStyle = `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;
  res.send(htmlWithStyle);
}




module.exports = {
    createComment,
    getComments,
    createCommentResponse
}