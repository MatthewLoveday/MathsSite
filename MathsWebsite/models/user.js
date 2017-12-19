var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userTopicsSchema = new mongoose.Schema
({
        name: String,
        results: [{
            date: Date,
            score: Number
        }],
        time: Number
});

var userModulesSchema = new mongoose.Schema
({
    name: String,
    results: [{
        date: Date,
        score: Number
    }],
    topics: [userTopicsSchema]
});

var userExamBoardSchema = new mongoose.Schema
({
    name: String,
    results: [{
        date: Date,
        score: Number
    }],
    modules: [userModulesSchema]
})

var UserSchema = new mongoose.Schema
({
    username: String,
    password: String,
    email: String,
    targetGrade: String,
    examBoard: userExamBoardSchema,
    role: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", UserSchema);

