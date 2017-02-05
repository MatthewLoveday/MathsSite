var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userTopicsSchema = new mongoose.Schema
({
        name: String,
        progress: Number
});

var userModulesSchema = new mongoose.Schema
({
    name:String,
    progress: Number,
    topics:[userTopicsSchema]
});

var userExamBoardSchema = new mongoose.Schema
({
    name:String,
    progress:Number,
    modules:[userModulesSchema]
})

var testSchema = new mongoose.Schema
({
    seed: String,
    totalTime: Number,
    time: Number,
    totalMarks: Number,
    marks: Number,
    date: Date
});

var UserSchema = new mongoose.Schema
({
    username: String,
    password: String,
    email: String,
    targetGrade: String,
    examBoard:userExamBoardSchema,
    score: Number,
    role: String,
    tests: [testSchema]
    
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", UserSchema);

