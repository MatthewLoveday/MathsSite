const   mongoose = require("mongoose"),
        examBoard = require("./models/examBoard"),
        question = require("./models/question"),
        user = require("./models/user"),
        math = require("mathjs"),
        passport = require("passport"),
        bodyParser = require("body-parser"),
        LocalStrategy = require("passport-local"),
        passportLocalMongoose = require("passport-local-mongoose");
    
var examboardData=
[
    { name: "a", modules: [{ name: "1", topics: [{ name: "a" }, { name: "b" }, { name: "c" }] }, { name: "2", topics: [{ name: "d" }, { name: "e" }, { name: "f" }] }, { name: "3", topics: [{ name: "g" }, { name: "h" }, { name: "i" }] }] },
    { name: "b", modules: [{ name: "1", topics: [{ name: "a" }, { name: "b" }, { name: "c" }] }, { name: "2", topics: [{ name: "d" }, { name: "e" }, { name: "f" }] }, { name: "3", topics: [{ name: "g" }, { name: "h" }, { name: "i" }] }] },
    { name: "c", modules: [{ name: "1", topics: [{ name: "a" }, { name: "b" }, { name: "c" }] }, { name: "2", topics: [{ name: "d" }, { name: "e" }, { name: "f" }] }, { name: "3", topics: [{ name: "g" }, { name: "h" }, { name: "i" }] }] }
];

var questionData=
[
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 4,
        methods: [[{ mark: 4, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 2, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content:"x=2^{-\\frac{1}{2}}"}]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 4,
        methods: [[{ mark: 4, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 2, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 4,
        methods: [[{ mark: 4, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 2, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content:"x=2^{-\\frac{1}{2}}"}]]
    },
    {
        content: "http://logos.textgiraffe.com/logos/logo-name/Maths-designstyle-friday-m.png",
        mark: 5,
        methods: [[{ mark: 5, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://logos.textgiraffe.com/logos/logo-name/Maths-designstyle-friday-m.png",
        mark: 5,
        methods: [[{ mark: 5, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://logos.textgiraffe.com/logos/logo-name/Maths-designstyle-friday-m.png",
        mark: 5,
        methods: [[{ mark: 5, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://mathszone2.net/mathszonenew/wp-content/uploads/2015/11/image.gif",
        mark: 6,
        methods: [[{ mark: 6, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://mathszone2.net/mathszonenew/wp-content/uploads/2015/11/image.gif",
        mark: 6,
        methods: [[{ mark: 6, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://mathszone2.net/mathszonenew/wp-content/uploads/2015/11/image.gif",
        mark: 6,
        methods: [[{ mark: 6, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://logos.textgiraffe.com/logos/logo-name/Maths-designstyle-kiddo-m.png",
        mark: 7,
        methods: [[{ mark: 7, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://logos.textgiraffe.com/logos/logo-name/Maths-designstyle-kiddo-m.png",
        mark: 7,
        methods: [[{ mark: 7, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://logos.textgiraffe.com/logos/logo-name/Maths-designstyle-kiddo-m.png",
        mark: 7,
        methods: [[{ mark: 7, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://logos.textgiraffe.com/logos/logo-name/Maths-designstyle-candy-m.png",
        mark: 8,
        methods: [[{ mark: 8, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://logos.textgiraffe.com/logos/logo-name/Maths-designstyle-candy-m.png",
        mark: 8,
        methods: [[{ mark: 8, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://logos.textgiraffe.com/logos/logo-name/Maths-designstyle-candy-m.png",
        mark: 8,
        methods: [[{ mark: 8, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 9,
        methods: [[{ mark: 9, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 9,
        methods: [[{ mark: 9, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 9,
        methods: [[{ mark: 9, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 10,
        methods: [[{ mark: 10, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 10,
        methods: [[{ mark: 10, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 10,
        methods: [[{ mark: 10, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 11,
        methods: [[{ mark: 11, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 11,
        methods: [[{ mark: 11, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "pStart of question 8c/phttp://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 11,
        methods: [[{ mark: 11, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 12,
        methods: [[{ mark: 12, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 12,
        ethods: [[{ mark: 12, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 12,
        ethods: [[{ mark: 12, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 13,
        methods: [[{ mark: 13, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 13,
        methods: [[{ mark: 13, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 13,
        methods: [[{ mark: 13, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 14,
        methods: [[{ mark: 14, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 14,
        methods: [[{ mark: 14, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 14,
        methods: [[{ mark: 14, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 15,
        methods: [[{ mark: 15, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 8, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 15,
        methods: [[{ mark: 15, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 8, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{-\\frac{1}{2}}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 15,
        methods: [[{ mark: 15, content: "x=-2^{-\\frac{1}{2}}" }], [{ mark: 8, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{-\\frac{1}{2}}" }]]
    }
];

/*
function seedDB() {
    user.remove({}, function (err) {
        if (err) {
            console.log("Could not remove user\n" + err);
        }
        else {
            console.log("Removed old user");
            examBoard.remove({}, function (err) {
                if (err) {
                    console.log("Could not remove examboards\n" + err);
                }
                else {
                    console.log("Removed old examboards");
                    question.remove({}, function (err) {
                        if (err) {
                            console.log("Could not remove questions\n" + err);
                        }
                        else {
                            console.log("Removed old questions");
                            user.register(new user
                                ({
                                    username: "admin",
                                    email: "jonathanwoollettlight@gmail.com",
                                    role: "admin"
                                }),
                                "lu134r7n75q5psbzwgch", function (err, user) {
                                    if (err) {
                                        console.log("Failed to add admin\n" + err);
                                    }
                                    else {
                                        console.log("Admin added");
                                        examboardData.forEach(function (examSeed) {
                                            examBoard.create(examSeed, function (err, exam) {
                                                console.log("Creating new examboard");
                                                if (err) {
                                                    console.log("Could not create new examboard\n" + err);
                                                }
                                                else {
                                                    console.log("Created examboard");
                                                }
                                            });
                                        });
                                        var topicIncrementor = 0;
                                        questionData.forEach(function (questionSeed) {
                                            question.create(questionSeed, function (err, question) {
                                                if (err) {
                                                    console.log("Could not create new question\n" + err);
                                                }
                                                else {
                                                    console.log("Created question");
                                                    examBoard.find({}, function (err, exams) {
                                                        for (var i = 0; i < exams.length; i++) {
                                                            for (var t = 0; t < exams[i].modules.length; t++) {
                                                                for (var q = math.floor(topicIncrementor / 12); q < exams[i].modules[t].topics.length; q++) {
                                                                    exams[i].modules[t].topics[q].questions.push(question);
                                                                    topicIncrementor++;
                                                                }
                                                                topicIncrementor = 0;
                                                            }
                                                            exams[i].save();
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                        }
                    });
                }
            });
        }
    });
}*/

async function seedDB() {
    
    await Promise.all(
        [user, examBoard, question].map(data => data.remove({}))
    );

    
    user.register(new user({
        username: "admin",
        email: "jonathanwoollettlight@gmail.com",
        role: "admin"
    }), "lu134r7n75q5psbzwgch", function (err, user) {
        if (err) {
            console.log("Failed to add admin\n" + err);
        }
        else {
            console.log("Admin added:");
        }
    });

    // Create examBoard. .create() does actually accept an array.
    // Keep the results as well
    var exams = [];
    var questions = [];
    new Promise((resolve, reject) => {
        examboardData.forEach(function (examSeed) {
            examBoard.create(examSeed, function (err, exam) {
                console.log("Creating new examboard");
                if (err) {
                    console.log("Could not create new examboard\n" + err);
                }
                else {
                    console.log("Created examboard");
                    exams.push(exam);
                }
            });
        });
        questionData.forEach(function (questionSeed) {
            question.create(questionSeed, function (err, question) {
                if (err) {
                    console.log("Could not create new question\n" + err);
                }
                else {
                    console.log("Created question");
                    questions.push(question);
                }
            });
        });
    }).then(async () => {
        var topicIncrementor = 0;
        for (let question of questions) {
            for (var i = 0; i < exams.length; i++) {
                for (var t = 0; t < exams[i].modules.length; t++) {
                    for (var q = 0; q < exams[i].modules[t].topics.length; q++) {
                        exams[i].modules[t].topics[q].questions.push(question);
                        topicIncrementor++;
                    }
                    topicIncrementor = 0;
                }
                await exams[i].save();
                console.log("Updated exam with questions");
            }
        }
    });

    // Add questions to each exam topic
    
    // Add questions to each exam topic

    

}
module.exports = seedDB;