const express = require("express");
const { createComment, getCommnet } = require("../controllers/comments.controller.js");

const router = express.Router();

router.route('/comments')
    .post(createComment);

router.get('/comment/:datasetId', getCommnet);

module.exports = router;