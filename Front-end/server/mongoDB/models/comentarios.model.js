const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    commentId: {
        type: String,
        require: true,
        trim:true,
        unique: true
    },
    userId: {
        type: String,
        require: true,
        trim:true
    },
    datasetId: {
        type: String,
        require: true,
        trim:true
    },
    content:String,
    media:[
        {
            data: Buffer,
            contentType:String
        }
    ],
    responseTo: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model ('Comment',commentSchema);
