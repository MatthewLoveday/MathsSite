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
        content:"<p>Start of question 1</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark:6,
        methods:[[{mark:1,content:"one"},{mark:2,content:"two"},{mark:3,content:"three"}],[{mark:1,content:"one"},{mark:2,content:"two"},{mark:3,content:"three"}],[{mark:1,content:"one"},{mark:2,content:"two"},{mark:3,content:"three"}]]
    },
    {
        content:"<p>Start of question 2</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark:6,
        methods:[[{mark:1,content:"one"},{mark:2,content:"two"},{mark:3,content:"three"}],[{mark:1,content:"one"},{mark:2,content:"two"},{mark:3,content:"three"}],[{mark:1,content:"one"},{mark:2,content:"two"},{mark:3,content:"three"}]]
    },
    {
        content:"<p>Start of question 3</p><img src='https://cdn.spacetelescope.org/archives/images/publicationjpg/heic0602a.jpg'><p>End of question</p>",
        mark:6,
        methods:[[{mark:1,content:"one"},{mark:2,content:"two"},{mark:3,content:"three"}],[{mark:1,content:"one"},{mark:2,content:"two"},{mark:3,content:"three"}],[{mark:1,content:"one"},{mark:2,content:"two"},{mark:3,content:"three"}]]
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