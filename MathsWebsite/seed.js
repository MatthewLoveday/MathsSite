var mongoose = require("mongoose"),
    examBoard = require("./models/examBoard"),
    question = require("./models/question"),
    user = require("./models/user");
    
var examboardData=
[
    {name:"a",modules:[{name:"1",topics:[{name:"a"},{name:"b"},{name:"c"}]},{name:"2",topics:[{name:"a"},{name:"b"},{name:"c"}]},{name:"3",topics:[{name:"a"},{name:"b"},{name:"c"}]}]},
    {name:"b",modules:[{name:"1",topics:[{name:"a"},{name:"b"},{name:"c"}]},{name:"2",topics:[{name:"a"},{name:"b"},{name:"c"}]},{name:"3",topics:[{name:"a"},{name:"b"},{name:"c"}]}]},
    {name:"c",modules:[{name:"1",topics:[{name:"a"},{name:"b"},{name:"c"}]},{name:"2",topics:[{name:"a"},{name:"b"},{name:"c"}]},{name:"3",topics:[{name:"a"},{name:"b"},{name:"c"}]}]}
];

var questionData=
[
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 4,
        methods: [[{mark:4,content:"one"}],[{mark:2,content:"one"}, {mark:2,content:"two"}]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 4,
        methods: [[{ mark: 4, content: "one" }], [{ mark: 2, content: "one" }, { mark: 2, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 4,
        methods: [[{ mark: 4, content: "one" }], [{ mark: 2, content: "one" }, { mark: 2, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 5,
        methods: [[{ mark: 5, content: "one" }], [{ mark: 3, content: "one" }, { mark: 2, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 5,
        methods: [[{ mark: 5, content: "one" }], [{ mark: 3, content: "one" }, { mark: 2, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 5,
        methods: [[{ mark: 5, content: "one" }], [{ mark: 3, content: "one" }, { mark: 2, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 6,
        methods: [[{ mark: 6, content: "one" }], [{ mark: 3, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 6,
        methods: [[{ mark: 6, content: "one" }], [{ mark: 3, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 6,
        methods: [[{ mark: 6, content: "one" }], [{ mark: 3, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 7,
        methods: [[{ mark: 7, content: "one" }], [{ mark: 4, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 7,
        methods: [[{ mark: 7, content: "one" }], [{ mark: 4, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 7,
        methods: [[{ mark: 7, content: "one" }], [{ mark: 4, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 8,
        methods: [[{ mark: 8, content: "one" }], [{ mark: 4, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 8,
        methods: [[{ mark: 8, content: "one" }], [{ mark: 4, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 8,
        methods: [[{ mark: 8, content: "one" }], [{ mark: 4, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 9,
        methods: [[{ mark: 9, content: "one" }], [{ mark: 5, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 9,
        methods: [[{ mark: 9, content: "one" }], [{ mark: 5, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 9,
        methods: [[{ mark: 9, content: "one" }], [{ mark: 5, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 10,
        methods: [[{ mark: 10, content: "one" }], [{ mark: 5, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 10,
        methods: [[{ mark: 10, content: "one" }], [{ mark: 5, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 10,
        methods: [[{ mark: 10, content: "one" }], [{ mark: 5, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 11,
        methods: [[{ mark: 11, content: "one" }], [{ mark: 6, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 11,
        methods: [[{ mark: 11, content: "one" }], [{ mark: 6, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "pStart of question 8c/phttps://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 11,
        methods: [[{ mark: 11, content: "one" }], [{ mark: 6, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 12,
        methods: [[{ mark: 12, content: "one" }], [{ mark: 6, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 12,
        methods: [[{ mark: 12, content: "one" }], [{ mark: 6, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 12,
        methods: [[{ mark: 12, content: "one" }], [{ mark: 6, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 13,
        methods: [[{ mark: 13, content: "one" }], [{ mark: 7, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 13,
        methods: [[{ mark: 13, content: "one" }], [{ mark: 7, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 13,
        methods: [[{ mark: 13, content: "one" }], [{ mark: 7, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 14,
        methods: [[{ mark: 14, content: "one" }], [{ mark: 7, content: "one" }, { mark: 7, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 14,
        methods: [[{ mark: 14, content: "one" }], [{ mark: 7, content: "one" }, { mark: 7, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 14,
        methods: [[{ mark: 14, content: "one" }], [{ mark: 7, content: "one" }, { mark: 7, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 15,
        methods: [[{ mark: 15, content: "one" }], [{ mark: 8, content: "one" }, { mark: 7, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 15,
        methods: [[{ mark: 15, content: "one" }], [{ mark: 8, content: "one" }, { mark: 7, content: "two" }]]
    },
    {
        content: "https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg",
        mark: 15,
        methods: [[{ mark: 15, content: "one" }], [{ mark: 8, content: "one" }, { mark: 7, content: "two" }]]
    }
];



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
                            
                            console.log("Finished creating all questions");
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
                            questionData.forEach(function (questionSeed) {
                                question.create(questionSeed, function (err, question) 
                                {
                                    if (err) {
                                        console.log("Could not create new question\n" + err);
                                    }    
                                    else {
                                        console.log("Created question");
                                        examBoard.find({}, function (err, exams) {
                                            for (var i = 0; i < exams.length; i++) {
                                                for (var t = 0; t < exams[i].modules.length; t++) {
                                                    for (var u = 0; u < exams[i].modules[t].topics.length; u++) {
                                                        exams[i].modules[t].topics[u].questions.push(question);
                                                    }
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











module.exports = seedDB;