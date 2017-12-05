var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userTopicsSchema = new mongoose.Schema
({
        name: String,
        results: [Number]
});

var userModulesSchema = new mongoose.Schema
({
    name:String,
    progress: [Number],
    topics: [userTopicsSchema]
});

var userExamBoardSchema = new mongoose.Schema
({
    name:String,
    progress: [Number],
    modules: [userModulesSchema]
})

var UserSchema = new mongoose.Schema
({
    username: String,
    password: String,
    email: String,
    targetGrade: String,
    examBoard: userExamBoardSchema,
    score: [Number],
    role: String
    
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", UserSchema);

