var mongoose = require("mongoose");

var partSchema = new mongoose.Schema({
    mark: Number,
    content: String
});

var questionSchema = new mongoose.Schema({
    content: String,
    mark:Number,
    methods:[[partSchema]]
});

module.exports = mongoose.model("question", questionSchema);

