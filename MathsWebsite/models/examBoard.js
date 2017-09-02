var mongoose = require("mongoose");

var topicSchema = new mongoose.Schema({
    name: String,
    questions:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"question"
        }
    ]
});

var moduleSchema = new mongoose.Schema({
    name: String,
    topics: [topicSchema]
});

var examBoardSchema = new mongoose.Schema({
    name: String,
    modules: [moduleSchema]
});

module.exports = mongoose.model("examBoard", examBoardSchema);