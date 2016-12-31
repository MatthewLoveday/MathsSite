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
        content: "<p>Start of question 1a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 4,
        methods: [[{mark:4,content:"one"}],[{mark:2,content:"one"}, {mark:2,content:"two"}]]
    },
    {
        content: "<p>Start of question 1b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 4,
        methods: [[{ mark: 4, content: "one" }], [{ mark: 2, content: "one" }, { mark: 2, content: "two" }]]
    },
    {
        content: "<p>Start of question 1c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 4,
        methods: [[{ mark: 4, content: "one" }], [{ mark: 2, content: "one" }, { mark: 2, content: "two" }]]
    },
    {
        content: "<p>Start of question 2a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 5,
        methods: [[{ mark: 5, content: "one" }], [{ mark: 3, content: "one" }, { mark: 2, content: "two" }]]
    },
    {
        content: "<p>Start of question 2b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 5,
        methods: [[{ mark: 5, content: "one" }], [{ mark: 3, content: "one" }, { mark: 2, content: "two" }]]
    },
    {
        content: "<p>Start of question 2c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 5,
        methods: [[{ mark: 5, content: "one" }], [{ mark: 3, content: "one" }, { mark: 2, content: "two" }]]
    },
    {
        content: "<p>Start of question 3a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 6,
        methods: [[{ mark: 6, content: "one" }], [{ mark: 3, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "<p>Start of question 3b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 6,
        methods: [[{ mark: 6, content: "one" }], [{ mark: 3, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "<p>Start of question 3c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 6,
        methods: [[{ mark: 6, content: "one" }], [{ mark: 3, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "<p>Start of question 4a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 7,
        methods: [[{ mark: 7, content: "one" }], [{ mark: 4, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "<p>Start of question 4b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 7,
        methods: [[{ mark: 7, content: "one" }], [{ mark: 4, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "<p>Start of question 4c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 7,
        methods: [[{ mark: 7, content: "one" }], [{ mark: 4, content: "one" }, { mark: 3, content: "two" }]]
    },
    {
        content: "<p>Start of question 5a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 8,
        methods: [[{ mark: 8, content: "one" }], [{ mark: 4, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "<p>Start of question 5b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 8,
        methods: [[{ mark: 8, content: "one" }], [{ mark: 4, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "<p>Start of question 5c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 8,
        methods: [[{ mark: 8, content: "one" }], [{ mark: 4, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "<p>Start of question 6a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 9,
        methods: [[{ mark: 9, content: "one" }], [{ mark: 5, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "<p>Start of question 6b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 9,
        methods: [[{ mark: 9, content: "one" }], [{ mark: 5, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "<p>Start of question 6c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 9,
        methods: [[{ mark: 9, content: "one" }], [{ mark: 5, content: "one" }, { mark: 4, content: "two" }]]
    },
    {
        content: "<p>Start of question 7a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 10,
        methods: [[{ mark: 10, content: "one" }], [{ mark: 5, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "<p>Start of question 7b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 10,
        methods: [[{ mark: 10, content: "one" }], [{ mark: 5, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "<p>Start of question 7c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 10,
        methods: [[{ mark: 10, content: "one" }], [{ mark: 5, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "<p>Start of question 8a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 11,
        methods: [[{ mark: 11, content: "one" }], [{ mark: 6, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "<p>Start of question 8b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 11,
        methods: [[{ mark: 11, content: "one" }], [{ mark: 6, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "<p>Start of question 8c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 11,
        methods: [[{ mark: 11, content: "one" }], [{ mark: 6, content: "one" }, { mark: 5, content: "two" }]]
    },
    {
        content: "<p>Start of question 9a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 12,
        methods: [[{ mark: 12, content: "one" }], [{ mark: 6, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "<p>Start of question 9b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 12,
        methods: [[{ mark: 12, content: "one" }], [{ mark: 6, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "<p>Start of question 9c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 12,
        methods: [[{ mark: 12, content: "one" }], [{ mark: 6, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "<p>Start of question 10a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 13,
        methods: [[{ mark: 13, content: "one" }], [{ mark: 7, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "<p>Start of question 10b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 13,
        methods: [[{ mark: 13, content: "one" }], [{ mark: 7, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "<p>Start of question 10c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 13,
        methods: [[{ mark: 13, content: "one" }], [{ mark: 7, content: "one" }, { mark: 6, content: "two" }]]
    },
    {
        content: "<p>Start of question 11a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 14,
        methods: [[{ mark: 14, content: "one" }], [{ mark: 7, content: "one" }, { mark: 7, content: "two" }]]
    },
    {
        content: "<p>Start of question 11b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 14,
        methods: [[{ mark: 14, content: "one" }], [{ mark: 7, content: "one" }, { mark: 7, content: "two" }]]
    },
    {
        content: "<p>Start of question 11c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 14,
        methods: [[{ mark: 14, content: "one" }], [{ mark: 7, content: "one" }, { mark: 7, content: "two" }]]
    },
    {
        content: "<p>Start of question 12a</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 15,
        methods: [[{ mark: 15, content: "one" }], [{ mark: 8, content: "one" }, { mark: 7, content: "two" }]]
    },
    {
        content: "<p>Start of question 12b</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 15,
        methods: [[{ mark: 15, content: "one" }], [{ mark: 8, content: "one" }, { mark: 7, content: "two" }]]
    },
    {
        content: "<p>Start of question 12c</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark: 15,
        methods: [[{ mark: 15, content: "one" }], [{ mark: 8, content: "one" }, { mark: 7, content: "two" }]]
    }
];

function seedDB()
{
    user.remove({},function(err)
    {
        if(err)
        {
            console.log("Could not remove user\n"+err);
        }
        else
        {
            console.log("Removed old user");
            examBoard.remove({},function(err)
            {
                if(err)
                {
                    console.log("Could not remove examboards\n"+err);
                }
                else
                {
                    console.log("Removed old examboards");
                    question.remove({},function(err)
                    {
                        if(err)
                        {
                            console.log("Could not remove questions\n"+err);
                        }
                        else
                        {
                            console.log("Removed old questions");
                            examboardData.forEach(function(examSeed)
                            {
                                examBoard.create(examSeed,function(err,exam)
                                {
                                    console.log("Creating new examboard");
                                    if(err)
                                    {
                                        console.log("Could not create new examboard\n"+err);
                                    }
                                    else
                                    {
                                        questionData.forEach(function(questionSeed)
                                        {
                                            question.create(questionSeed,function(err,question)
                                            {
                                                if(err)
                                                {
                                                    console.log("Could not create new question\n"+err);
                                                }    
                                                else
                                                {
                                                    for(var i=0;i<3;i++)
                                                    {
                                                        for(var t=0;t<3;t++)
                                                        {
                                                            exam.modules[i].topics[t].questions.push(question);
                                                            //console.log("exam.modules["+i+"].topics["+t+"].questions:\n"+exam.modules[i].topics[t].questions);
                                                        }       
                                                    }
                                                    
                                                }
                                                exam.save();
                                            });
                                        });
                                        // console.log("Created new examboard\n"+exam);
                                        // console.log("exam.modules:\n"+exam.modules);
                                        // console.log("exam.modules[0]:\n"+exam.modules[0]);
                                        // console.log("exam.modules[0].topics:\n"+exam.modules[0].topics);
                                        // console.log("exam.modules[0].topics[0]:\n"+exam.modules[0].topics[0]);
                                        // console.log("exam.modules[0].topics[0].questions:\n"+exam.modules[0].topics[0].questions);
                                        // console.log("exam.modules[0].topics[0].questions[0]:\n"+exam.modules[0].topics[0].questions[0]);
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