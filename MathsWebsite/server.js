var express                 = require("express"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    bodyParser              = require("body-parser"),
    LocalStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose"),

    seedDB                  = require("./seed"),
    question                = require("./models/question"),
    examBoard               = require("./models/examBoard"),
    user                    = require("./models/user");

var app = express();

seedDB();
mongoose.connect("mongodb://localhost/MathsWebsite");

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
    secret:"fanatical beaver",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

//-----------------------
//routes
//-----------------------
//----------------
//user routes
//----------------
//login
//register
//logout
//homepage
//landing
//stats
//test
//----------------
//admin routes
//----------------
//examboards
//questions

//---------------------------------------------------------------------
//user routes
//---------------------------------------------------------------------

//----------------------------------------------
//landing route
//----------------------------------------------

app.get("/",function(req,res)
{

//    console.log("random" + Math.random());
    examBoard.find().exec()
    .then((exams) => {
    // Populate questions
        examBoard.populate(exams, {
            path: 'modules.topics.questions',
            model: 'question'
        })
        .then((populatedExams) => {
            // Do something with populated exams
            //console.log("populatedExams:\n"+populatedExams);
            //console.log("\n\npopulatedExams[0].modules[0].topcis[0]:\n"+populatedExams[0].modules[0].topics[0]);
        });
    });
    res.render("landing");
});

//----------------------------------------------
//home route
//----------------------------------------------

app.get("/users/:id",function(req,res)
{
    user.findById(req.params.id,function(err,userData)
    {
        if(err)
        {
            console.log("Could not find user data\n"+err);
        }else
        {
            console.log(userData);
            console.log(userData.examBoard);
            console.log(userData.examBoard.modules[0]);
            res.render("home",{user:userData});
        }
    });
});

//----------------------------------------------
//login routes
//----------------------------------------------

app.get("/login",function(req,res)
{
    res.render("login");
});

app.post('/login', function(req, res, next)
{
    passport.authenticate("local", function(err, user, info)
    {
        if (err) { 
            return next(err); 
        }
        if (!user)
        { 
            return res.redirect("/login"); 
        }
        req.logIn(user, function(err)
        {
            if (err)
            { 
                return next(err); 
            }
            return res.redirect("/users/"+user._id);
        });
    })(req, res, next);
});

//----------------------------------------------
//register routes
//----------------------------------------------

app.get("/register",function(req,res)
{
   res.render("register"); 
});

app.post("/register",function(req,res)
{
    var tempModules=[req.body.module1,req.body.module2,req.body.module3,req.body.module4,req.body.module5,req.body.module6,req.body.module7,req.body.module8];
    var modules=[];
    for(var i=0;i<8;i++)
    {
        if(tempModules[i])
        {
            modules.push({name:tempModules[i],progress:0});    
        }
    }
    user.register(new user
    ({
        username:req.body.username,
        email:req.body.email,
        targetGrade:req.body.targetGrade,
        examBoard:
        {
            name:req.body.examBoard,
            progress:0,
            modules:modules
        },
        score:0
    }),
    req.body.password,function(err,user)
    {
      if(err)
      {
          console.log("Failed to add new user\n"+err);
          return res.render("register");
      }
      else
      {
            console.log("New user added");
            passport.authenticate("local")(req,res,function()
            {
                res.redirect("/users/"+user._id);
            });
        }
    });
});

//----------------------------------------------
//test routes
//----------------------------------------------

app.get("/tests/new",function(req,res)
{
    res.render("tests/new");    
});

app.post("/tests",function(req,res)//when seed program ready this should be hanged to "/tests" which should redirect to a "/tests/:seed" route 
{
    var topicsTemp = [req.body.topic1,req.body.topic2,req.body.topic3,req.body.topic4,req.body.topic5,req.body.topic6,req.body.topic7,req.body.topic8];
    var moduleIndex;//its chatting shit about topicsTemp, it is used
    var topicsToBeParsed=[];
    examBoard.find({name:req.body.examBoardName},function(err,examBoard)
    {
        if(err)
        {
            console.log("Could not find examBoard\n"+err);
        }
        else
        {
            for(var i=0;i<examBoard[0].modules.length;i++)
            {
                if(examBoard[0].modules[i].name==req.body.moduleName)
                {
                    moduleIndex=i;
                    break;
                }
            }     
        } 
    });
    
    examBoard.find({name:req.body.examBoardName}).exec()
    .then((exams) => {
    // Populate questions
        examBoard.populate(exams, {
            path: 'modules.topics.questions',
            model: 'question'
        })
        .then((populatedExams) => {
            // Do something with populated exams
            for(var i=0;i<topicsTemp.length;i++)
            {
                if(topicsTemp[i])
                {
                    for(var t=0;t<populatedExams[0].modules[moduleIndex].topics.length;t++)
                    {
                        if(topicsTemp[i]==populatedExams[0].modules[moduleIndex].topics[t].name)
                        {
                            topicsToBeParsed.push(populatedExams[0].modules[moduleIndex].topics[t]);    
                        }
                    }    
                }
            }
            GenerateTest(req.body.time,topicsToBeParsed);
            // res.render("tests/show",{test:
            //     {
            //         time:req.body.time,
            //         examBoard:req.body.examBoardName,
            //         module:req.body.moduleName,
            //         topics:topicsToBeParsed
            //     }
            // });
        });
    });
    
    // var testData=
    // {
    //     time:req.body.time,
    //     examBoard:req.body.examBoardName,
    //     module:req.body.moduleName,
    //     topics:topics
    // };
    // res.render("tests/show",{test:
    //     {
    //         time:req.body.time,
    //         examBoard:req.body.examBoardName,
    //         module:req.body.moduleName,
    //         topics:topics
    //     }
    // });
});

//---------------------------------------------------------------------
//admin routes
//---------------------------------------------------------------------

//----------------------------------------------
//examboard routes
//----------------------------------------------

app.get("/examboards",function(req,res)
{
    res.render("examboards");        
});

app.get("/examboards/new",function(req,res)
{
    //render new examboard form     
});


app.post("/examboards",function(req,res)
{
    //create new examboard
    res.redirect("/examboards");        
});

//----------------------------------------------
//question routes
//----------------------------------------------

app.get("/questions",function(req,res)
{
    question.find({},function(err,quests)
    {
        if(err)
        {
            console.log("Could not find questions\n"+err);
        }else
        {
            res.render("questions/index",{questions:quests});
        }
    });       
});

app.get("/questions/new",function(req,res)
{
    res.render("questions/new");
});

app.get("/questions/:id",function(req,res)
{
    question.findById(req.params.id,function(err,quest)
    {
        if(err)
        {
            console.log("Could not find questions\n"+err);
        }else
        {
            res.render("questions/show",{question:quest});
        }
    });    
});


app.post("/questions",function(req,res)
{
    var numOfParts=[req.body.m1parts,req.body.m2parts,req.body.m3parts,req.body.m4parts];
    var parts = 
    [
        [
            {content:req.body.p1m1i,mark:req.body.p1m1m},{content:req.body.p2m1i,mark:req.body.p2m1m},
            {content:req.body.p3m1i,mark:req.body.p3m1m},{content:req.body.p4m1i,mark:req.body.p4m1m}, 
            {content:req.body.p5m1i,mark:req.body.p5m1m},{content:req.body.p6m1i,mark:req.body.p6m1m}, 
            {content:req.body.p7m1i,mark:req.body.p7m1m},{content:req.body.p8m1i,mark:req.body.p8m1m}, 
            {content:req.body.p9m1i,mark:req.body.p9m1m},{content:req.body.p10m1i,mark:req.body.p10m1m}
        ],
        [
            {content:req.body.p1m2i,mark:req.body.p1m2m},{content:req.body.p2m2i,mark:req.body.p2m2m},
            {content:req.body.p3m2i,mark:req.body.p3m2m},{content:req.body.p4m2i,mark:req.body.p4m2m}, 
            {content:req.body.p5m2i,mark:req.body.p5m2m},{content:req.body.p6m2i,mark:req.body.p6m2m}, 
            {content:req.body.p7m2i,mark:req.body.p7m2m},{content:req.body.p8m2i,mark:req.body.p8m2m}, 
            {content:req.body.p9m2i,mark:req.body.p9m2m},{content:req.body.p10m2i,mark:req.body.p10m2m}
        ], 
        [
            {content:req.body.p1m3i,mark:req.body.p1m3m},{content:req.body.p2m3i,mark:req.body.p2m3m},
            {content:req.body.p3m3i,mark:req.body.p3m3m},{content:req.body.p4m3i,mark:req.body.p4m3m}, 
            {content:req.body.p5m3i,mark:req.body.p5m3m},{content:req.body.p6m3i,mark:req.body.p6m3m}, 
            {content:req.body.p7m3i,mark:req.body.p7m3m},{content:req.body.p8m3i,mark:req.body.p8m3m}, 
            {content:req.body.p9m3i,mark:req.body.p9m3m},{content:req.body.p10m3i,mark:req.body.p10m3m}
        ],
        [
            {content:req.body.p1m4i,mark:req.body.p1m4m},{content:req.body.p2m4i,mark:req.body.p2m4m},
            {content:req.body.p3m4i,mark:req.body.p3m4m},{content:req.body.p4m4i,mark:req.body.p4m4m}, 
            {content:req.body.p5m4i,mark:req.body.p5m4m},{content:req.body.p6m4i,mark:req.body.p6m4m}, 
            {content:req.body.p7m4i,mark:req.body.p7m4m},{content:req.body.p8m4i,mark:req.body.p8m4m}, 
            {content:req.body.p9m4i,mark:req.body.p9m4m},{content:req.body.p10m4i,mark:req.body.p10m4m}
        ],
    ];
    var methodsArray = [];
    for(var i = 0; i < req.body.numOfMethods; i++)
    {
        methodsArray.push([]);
        for(var t = 0; t< numOfParts[i]; t++)
        {
            methodsArray[i].push({
                content: parts[i][t].content,
                mark: parts[i][t].mark
            });
        }
    }
    var topicName=[req.body.topic1,req.body.topic2,req.body.topic3,req.body.topic4,req.body.topic5];
    question.create({content:req.body.content,methods:methodsArray,mark:req.body.mark},function(err,quest)
    {
        if(err)
        {
            console.log("Could not create new question.\n"+err);
        }    
        else
        {
            examBoard.find({name:req.body.examBoardName},function(err,exam)
            {
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    for(var i=0;i<exam[0].modules.length;i++)
                    {
                        if(exam[0].modules[i].name==req.body.moduleName)
                        {
                            for(var t=0;t<exam[0].modules[i].topics.length;t++)
                            {
                                for(var u=0;u<topicName.length;u++)
                                {
                                    if(topicName[u]==exam[0].modules[i].topics[t].name)
                                    {
                                        exam[0].modules[i].topics[t].questions.push(quest);
                                    }
                                }
                            }
                            exam[0].save();
                            break;
                        }
                    } 
                }
            });
        }    
    });
    res.redirect("/questions");        
});

//---------------------------------------------------------------------
//bottom stuff
//---------------------------------------------------------------------
function isLoggedIn(req,res,next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
}

//---------------------------------------------------------------------
//test rand1 functions
//---------------------------------------------------------------------

function GenerateTest(time, topics) //Random Seed, Time of the Test, Array of the Topics
{   
    var questions=[]; //Questions array to be returned.

    var topicTime = Math.floor(time / topics.length); //The time allocated to each topic the user has selected. 

    //Loop through the questions in this topic

    for (var i = 0; i < topics.length; i++)
    {
        questions.concat(GetTopicQuestion(topics[i]), topicTime);
    }

    console.log("Questions\n" + questions);

    return questions;
}

//So this is used to get a question within a topic that I pass in.
function GetTopicQuestion(Topic, topicTime) //RecSize is the reccommended length of the question. This should be either 1 or 0.  THIS IS DOCUMENTATION FOR A PARAMETER THAT DOESN'T EXIST. Brilliant.
{
    var timePerQuestion=[];
    var QuestionAmount = 0;
    var questionLow;
    var questionHigh;
    
    if(topicTime > 60)
    {
        console.log("Are you wet? (topicTime over 60)");    
        topicTime = 60;
    }
    else if(topicTime < 4)
    {
        console.log("This guy thinks he has something better to do? (topicTime less than 4)");    
        topicTime = 4;    
    }
    
    /*
 _______ _      _       _           _                 _     
 |__   __| |   (_)     (_)         | |               | |    
    | |  | |__  _ ___   _ ___    __| |_   _ _ __ ___ | |__  
    | |  | '_ \| / __| | / __|  / _` | | | | '_ ` _ \| '_ \ 
    | |  | | | | \__ \ | \__ \ | (_| | |_| | | | | | | |_) |
    |_|  |_| |_|_|___/ |_|___/  \__,_|\__,_|_| |_| |_|_.__/ 
    */
    
    console.log("random: " + getRandomIntInclusive((1,3)));
    
    if(topicTime < 12)//find the times of each question in this topic
    {
        timePerQuestion[0] = topicTime;
    }
    else
    {
        var numberOfQuestions = Math.floor(topicTime / getRandomIntInclusive(4, (Math.floor(topicTime / 2))));
        console.log("Math.floor(topicTime/getRandomIntInclusive(4, Math.floor(topicTime / 2))):" + Math.floor(topicTime / getRandomIntInclusive(4, (Math.floor(topicTime / 2)))));
        console.log("numberOfQuestions:"+numberOfQuestions);
        timePerQuestion[0]      = Math.floor(topicTime/numberOfQuestions);
        questionLow++;
        
        for(var i=1;i<numberOfQuestions-1;i++)
        {
            timePerQuestion[i] = Math.round(topicTime/numberOfQuestions);
            if(timePerQuestion[i] > timePerQuestion[0])
            {
                questionHigh++;
            }
            else
            {
                questionLow++;
            }
        }
        timePerQuestion.push(Math.ceil(topicTime/numberOfQuestions));
        questionHigh++;
        console.log("timePerQuestion:\n"+timePerQuestion);
    }
    console.log("questionHigh:"+questionHigh);
    console.log("questionLow:"+questionLow);
    
    var questionsOfProperLength=[[]];
    
    for(var i=0;i<Topic.questions.length;i++)//push all questions of appropriate lengths to 'questionsOfProperLength' array
    {
        if(Topic.questions.mark==timePerQuestion[0])
        {
            questionsOfProperLength[0].push(Topic.questions[i]);               
        }
        else if(Topic.questions.mark==timePerQuestion[(timePerQuestion.length)-1])
        {
            questionsOfProperLength[1].push(Topic.questions[i]);    
        }
    }
    
    var questions=[];
    
    for(var t=0;t<questionLow;t++)//push number of question that have the low mark value
    {
        question.push(questionsOfProperLength[0][getRandomIntInclusive(0,questionsOfProperLength[0].length)]);
    }
    
    for(var t=0;t<questionHigh;t++)//push number of question that have the high mark value
    {
        question.push(questionsOfProperLength[1][getRandomIntInclusive(0,questionsOfProperLength[1].length)]);
    }
    
    return questions;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//---------------------------------------------------------------------
//start server listening
//---------------------------------------------------------------------

app.listen(process.env.PORT, process.env.IP,function()
{
    console.log("Server started");
});


/*
Somebody once told me the world is gonna roll me
I ain't the sharpest tool in the shed
She was looking kind of dumb with her finger and her thumb
In the shape of an "L" on her forehead

Well the years start coming and they don't stop coming
Fed to the rules and I hit the ground running
Didn't make sense not to live for fun
Your brain gets smart but your head gets dumb
So much to do, so much to see
So what's wrong with taking the back streets?
You'll never know if you don't go
You'll never shine if you don't glow

Hey now, you're an all-star, get your game on, go play
Hey now, you're a rock star, get the show on, get paid
And all that glitters is gold
Only shooting stars break the mold

It's a cool place and they say it gets colder
You're bundled up now, wait till you get older
But the meteor men beg to differ
Judging by the hole in the satellite picture
The ice we skate is getting pretty thin
The water's getting warm so you might as well swim
My world's on fire, how about yours?
That's the way I like it and I never get bored

Hey now, you're an all-star, get your game on, go play
Hey now, you're a rock star, get the show on, get paid
All that glitters is gold
Only shooting stars break the mold

Hey now, you're an all-star, get your game on, go play
Hey now, you're a rock star, get the show, on get paid
And all that glitters is gold
Only shooting stars

Somebody once asked could I spare some change for gas?
I need to get myself away from this place
I said yep what a concept
I could use a little fuel myself
And we could all use a little change

Well, the years start coming and they don't stop coming
Fed to the rules and I hit the ground running
Didn't make sense not to live for fun
Your brain gets smart but your head gets dumb
So much to do, so much to see
So what's wrong with taking the back streets?
You'll never know if you don't go (go!)
You'll never shine if you don't glow

Hey now, you're an all-star, get your game on, go play
Hey now, you're a rock star, get the show on, get paid
And all that glitters is gold
Only shooting stars break the mold

And all that glitters is gold
Only shooting stars break the mold
*/