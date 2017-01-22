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
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 4,
        methods: [[{ mark: 4, content: "x=\\frac{y}{2}" }], [{ mark: 2, content: "y=2x" }, { mark: 2, content:"x=\\frac{y}{2}"}]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 4,
        methods: [[{ mark: 4, content: "x=\\frac{y}{2}" }], [{ mark: 2, content: "y=2x" }, { mark: 2, content: "x=\\frac{y}{2}" }]]
    },
    {
        content: "http://www.christchurch.esussex.dbprimary.com/esussex/primary/christchurch/web/maths2-big[1].png",
        mark: 4,
        methods: [[{ mark: 4, content: "x=\\frac{y}{2}" }], [{ mark: 2, content: "y=2x" }, { mark: 2, content:"x=\\frac{y}{2}"}]]
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