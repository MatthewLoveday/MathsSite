const   express                 = require("express"),
        mongoose                = require("mongoose"),
        passport                = require("passport"),
        bodyParser              = require("body-parser"),
        LocalStrategy           = require("passport-local"),
        passportLocalMongoose   = require("passport-local-mongoose"),
        math                    = require("mathjs"),

        seedDB                  = require("./seed"),
        question                = require("./models/question"),
        examBoard               = require("./models/examBoard"),
        user                    = require("./models/user");


//------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------

//PUT ANY CRTICAL NOTICES HERE

//------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------
const app = express();

const   uri = 'mongodb://localhost/MathsWebsite',
        options = { useMongoClient: true };

mongoose.Promise = global.Promise;
mongoose.set('debug', true);

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
seedDB();
app.get("/",function(req,res)
{
    examBoard.find({}, function (err, examboard)
    {
        console.log("examboard.length: " + examboard.length); 
        res.render("landing", { examBoard: examboard, usernameTaken: false, loginFailure: false });
    });
});

app.get("/loginFailure", function (req, res)//this is probably a way better way of doing this,  this screams inefficiency
{
    examBoard.find({}, function (err, examBoard) {
        console.log("examBoard.length: " + examBoard.length);
        res.render("landing", { examBoard: examBoard, usernameTaken: false, loginFailure: true });
    });
});

//----------------------------------------------
//home route
//----------------------------------------------

app.get("/users/:id", isLoggedIn, function(req,res)
{
    user.findById(req.params.id,function(err,userData)
    {
        if(err)
        {
            console.log("Could not find user data\n"+err);
        }else
        {
            res.render("home", { user: userData });
        }
    });
});

//----------------------------------------------
//login routes
//----------------------------------------------

app.get("/login",function(req,res)
{
    console.log("got here");
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
            return res.redirect("/loginFailure"); 
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

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/")
});

//----------------------------------------------
//register routes
//----------------------------------------------

app.get("/register",function(req,res)
{
    res.render("register", { userNameTaken: false }); 
});

app.post("/register",function(req,res)
{
    user.findOne({ "username": req.body.username }, function (err, sameName) {
        if (err)
        {
            console.log("Could not check for same name user:/n" + err);
        }
        else
        {
            if (!sameName) {
                var tempModules = req.body.checkModules;
                console.log("tempModules:\n" + tempModules);

                var tempTopics = [];
                var modules = [];

                examBoard.find({ name: req.body.examBoard }, function (err, examBoard)
                {
                    if (err)
                    {
                        console.log("Could not find examBoard\n" + err);
                    }
                    else
                    {
                        console.log("examBoard[0].modules[0].topics[0].name: " + examBoard[0].modules[0].topics[0].name);
                        console.log("examBoard[0].modules[1].topics[0].name: " + examBoard[0].modules[1].topics[0].name);
                        console.log("examBoard[0].modules[2].topics[0].name: " + examBoard[0].modules[2].topics[0].name);
                        for (var t = 0; t < tempModules.length; t++) {
                            for (var i = 0; i < examBoard[0].modules.length; i++)
                            {
                                if (tempModules[t] == examBoard[0].modules[i].name)
                                {
                                    for (var u = 0; u < examBoard[0].modules[i].topics.length; u++)
                                    {
                                        tempTopics.push({ name: examBoard[0].modules[i].topics[u].name, progress: 0, results: [] });
                                    }
                                    modules.push({ name: tempModules[t], progress: 0, topics: tempTopics });
                                    tempTopics = [];
                                    break;
                                }
                            }
                        }
                        user.register(new user
                            ({
                                username: req.body.username,
                                email: req.body.email,
                                targetGrade: req.body.targetGrade,
                                examBoard:
                                {
                                    name: req.body.examBoard,
                                    progress: 0,
                                    modules: modules
                                },
                                score: 0,
                                role: "user"
                            }),
                            req.body.password, function (err, user) {
                                if (err)
                                {
                                    console.log("Failed to add new user\n" + err);
                                    return res.redirect("/");
                                }
                                else
                                {
                                    passport.authenticate("local")(req, res, function ()
                                    {
                                        res.redirect("/users/" + user._id);
                                    });
                                }
                            });
                    }
                });
            }
            else
            {
                examBoard.find({}, function (err, examBoard) {
                    res.render("landing", { examBoard: examBoard, usernameTaken: true, loginFailure: false });
                });
            }
        }
    });
    
});

//----------------------------------------------
//test routes
//----------------------------------------------

app.get("/users/:id/tests/new", isLoggedIn, function(req,res)
{
    user.findById(req.params.id, function (err, userData) {
        if (err)
        {
            console.log("Could not find user data\n" + err);
        }
        else
        {
            console.log(userData);
            res.render("tests/new", { user: userData });
        }
    });  
});

app.post("/users/:id/tests", function(req,res)//when seed program ready this should be changed to "/tests" which should redirect to a "/tests/:seed" route 
{
    var topicsTemp = req.body.topics;
    var topicsToBeParsed = [];
    var moduleIndex;
    user.findById(req.params.id, function (err, userData) {
        if (err) {
            console.log("Could not find user data\n" + err);
        } else {
            examBoard.findOne({ name: userData.examBoard.name }).exec().then((exam) => {
                examBoard.populate(exam, {
                    path: 'modules.topics.questions',
                    model: 'question'
                })
                    .then((populatedExamboard) => {
                        for (var i = 0; i < populatedExamboard.modules.length; i++) {
                            if (populatedExamboard.modules[i].name == req.body.moduleName) {
                                moduleIndex = i;
                                break;
                            }
                        }

                        
                        for (var i = 0; i < topicsTemp.length; i++) {
                            for (var t = 0; t < populatedExamboard.modules[moduleIndex].topics.length; t++) {
                                if (topicsTemp[i] == populatedExamboard.modules[moduleIndex].topics[t].name) {
                                    topicsToBeParsed.push(populatedExamboard.modules[moduleIndex].topics[t]);
                                    break;
                                }
                            }
                        }
                        var topicsData = GenerateTest(req.body.time, topicsToBeParsed);

                        var objectToBeParsed = { userID: req.params.id, topics: topicsData, examBoard: userData.examBoard.name, module: req.body.moduleName, options:{timer:req.body.timer,topicTimer:req.body.topicTimer, topicNames:req.body.topicNames, questionLength:req.body.questionLength, dynamicMarking:req.body.dynamicMarking} };
                        res.render("tests/show", { testData: objectToBeParsed });
                    });
            });
        }
    });
});

app.post("/users/:id/tests/results", function (req, res) {

    
    var testData = JSON.parse(req.body.testData);
    console.log("testData.examBoard:\n" + testData.examBoard);
    console.log("testData.topics[0].questions[0].id:\n" + testData.topics[0].questions[0].id);
    //temp varaibles
    var answerLocationsTemp = [];
    var methodMarks = [];
    var bestMarkIndex;
    var startIndex;
    
    examBoard.findOne({ name: testData.examBoard }).exec().then((exams) => {
        examBoard.populate(exams, {
            path: 'modules.topics.questions',
            model: 'question'
        }).then((populatedExams) => {
            for (var i = 0; i < populatedExams.modules.length; i++)//looping through all modules in examboard in database
            {
                if (populatedExams.modules[i].name == testData.module)//if module matches
                {
                    for (var z = 0; z < testData.topics.length; z++)//looping through all topics in module in exmaboard in test
                    {
                        for (var t = 0; t < populatedExams.modules[i].topics.length; t++)//looping through all topics in module in exmaboard in database
                        {
                            if (testData.topics[z].name == populatedExams.modules[i].topics[t].name)//if topics match
                            {
                                for (var q = 0; q < testData.topics[z].questions.length; q++)//looping through all questions in topic in module in test
                                {
                                    for (var p = 0; p < populatedExams.modules[i].topics[t].questions.length; p++)//looping through all questions in topic in module in examboard in database
                                    {
                                        if (populatedExams.modules[i].topics[t].questions[p]._id == testData.topics[z].questions[q].id)//if questions match
                                        {
                                            answerLocationsTemp = [];
                                            for (var x = 0; x < populatedExams.modules[i].topics[t].questions[p].methods.length; x++)//looping through all methods for question in topic in module in examboard in database
                                            {
                                                answerLocationsTemp.push([]);
                                                methodMarks.push(0);
                                                for (var c = 0; c < populatedExams.modules[i].topics[t].questions[p].methods[x].length; c++)//looping through all parts in method in question in topic in module in exmaboard in database
                                                {
                                                    for (var e = 0; e < testData.topics[z].questions[q].parts.length; e++)//looping through all parts in question in topic in module in examboard in test
                                                    {
                                                        var posOfAnswer = markPart(testData.topics[z].questions[q].parts[e], populatedExams.modules[i].topics[t].questions[p].methods[x][c].content);
                                                        if (posOfAnswer > -1)//startIndex will be -1 if not found and index of start of string if found
                                                        {
                                                            methodMarks[x] += populatedExams.modules[i].topics[t].questions[p].methods[x][c].mark;
                                                            answerLocationsTemp[x][c] = { partNumber: e, startIndex: posOfAnswer, endIndex: posOfAnswer + populatedExams.modules[i].topics[t].questions[p].methods[x][c].content.length - 1, mark: populatedExams.modules[i].topics[t].questions[p].methods[x][c].mark };
                                                            break;//this is neccessary so if the same part exists twice in the answer, the user doesnt get marks for both
                                                        }
                                                    }
                                                }
                                                if (methodMarks[x] == populatedExams.modules[i].topics[t].questions[p].mark)//checks if user got full marks for a method
                                                {
                                                    break;//if user got full marks in one method, there is no point checking other methods
                                                }
                                            }
                                            bestMarkIndex = 0;
                                            for (var x = 0; x < methodMarks.length; x++)//looping through all partial methods found in users answer
                                            {
                                                if (methodMarks[x] > methodMarks[bestMarkIndex])//finds method that acheived best marks
                                                {
                                                    bestMarkIndex = x;//sets index to that of the method that acheived most marks
                                                }    
                                            }
                                            if (methodMarks[bestMarkIndex] > 0)
                                            {
                                                testData.topics[z].questions[q].solution = populatedExams.modules[i].topics[t].questions[p].methods[bestMarkIndex];
                                                testData.topics[z].questions[q].answers = answerLocationsTemp[bestMarkIndex];
                                                testData.topics[z].percentageMark += methodMarks[bestMarkIndex] / populatedExams.modules[i].topics[t].questions[p].mark;
                                            }
                                            break;//already found qeustion in database so pointless looking for the same question further, breaks to next iteration of questions in test
                                        }
                                    }
                                }
                                testData.topics[z].percentageMark /= testData.topics[z].questions.length;
                                break;//already found topic in database so pointless looking for the same topic further, breaks to next iteration of topics in test
                            }
                        }       
                    }
                    break;//already found module in database so pointless looking for the same module further, breaks out of marking    
                }        
            }
            user.findById(req.params.id, (err, user) => {//finding user in database
                if (err)
                {
                    console.log("Could not find user data\n" + err);
                }
                else
                {
                    console.log("Found user");
                    user.examBoard.progress = 0;
                    for (var i = 0; i < user.examBoard.modules.length; i++)//looping through user's modules
                    {
                        if (user.examBoard.modules[i].name == req.body.module)//if user's module matches module in test
                        {
                            user.examBoard.modules[i].progress = 0;
                            for (var t = 0; t < user.examBoard.modules[i].topics.length; t++)//looping through user's topics in selected module
                            {
                                for (var z = 0; z < testData.topics.length; z++)//looping through topics in test
                                {
                                    if (user.examBoard.modules[i].topics[t]._id == testData.topics[z].id)//if topics match
                                    {
                                        user.examBoard.modules[i].topics[t].results.push(testData.topics[z].percentageMark)//adding results for each topic
                                        user.examBoard.modules[i].topics[t].progress = math.mean(user.examBoard.modules[i].topics[t].results) - (math.std(user.examBoard.modules[i].topics[t].results) / 3) - Math.pow(((user.examBoard.modules[i].topics[t].results.length / 30) + 0.105), -2);//changing progress in topic
                                        if (user.examBoard.modules[i].topics[t].progress < 0)
                                        {
                                            user.examBoard.modules[i].topics[t].progress = 0;
                                        }
                                        break;//already found topic from test in user's topics thus pointless looking for same topic further, breaks to next iteration of topics in test
                                    }
                                }
                                user.examBoard.modules[i].progress += user.examBoard.modules[i].topics[t].progress;
                            }
                            user.examBoard.modules[i].progress /= user.examBoard.modules[i].topics.length;
                        }
                        user.examBoard.progress += user.examBoard.modules[i].progress;
                    }
                    user.examBoard.progress /= user.examBoard.modules.length;
                    user.save((err, updatedUser) => {
                        if (err) {
                            console.log("Could not update user results:\n" + err);
                        } else {
                            var objectToBeParsed = { userData: updatedUser, markingData: testData };
                            console.log("finished setting stuff");
                            res.render("tests/results", { data: objectToBeParsed });
                        }
                    });
                }
            });
        });
    });
});
//---------------------------------------------------------------------
//admin routes
//---------------------------------------------------------------------

//----------------------------------------------
//examboard routes
//----------------------------------------------

app.get("/users/:id/examboards", isLoggedIn, isAdmin, function(req,res)
{
    examBoard.find({}, function (err, examBoards)
    {
        res.render("examboards/index", {examBoards:examBoards, userId:req.params.id}); 
    });
});

app.get("/users/:id/examboards/:examId", isLoggedIn, isAdmin, function (req, res) {
    examBoard.find({ _id: req.params.examId }).exec().then((exam) => {
        examBoard.populate(exam, {
            path: 'modules.topics.questions',
            model: 'question'
        })
            .then((populatedExam) => {
                console.log("populatedExam[0]: " + populatedExam[0]);
                console.log("populatedExam[0].name: " + populatedExam[0].name);
                console.log("populatedExam[0].modules[0].topics[0].questions: " + populatedExam[0].modules[0].topics[0].questions);
                res.render("examboards/show", { examBoard: populatedExam[0] });
            });
    });
});

app.get("/users/:id/examboards/new", isLoggedIn, isAdmin, function(req,res)
{
    //render new examboard form     
});

app.post("/examboards", function(req,res)
{
    //create new examboard
    res.redirect("/examboards");        
});

//----------------------------------------------
//question routes
//----------------------------------------------

app.get("/users/:id/questions", isLoggedIn, isAdmin, function(req,res)
{
    question.find({}, function (err, quests) {
        if (err) {
            console.log("Could not find questions\n" + err);
        } else {
            res.render("questions/index", { questions: quests });
        }
    });
           
});

app.get("/users/:id/questions/new", isLoggedIn, isAdmin, function(req,res)
{
    res.render("questions/new");
});

app.get("/users/:id/questions/:questId", isLoggedIn, isAdmin, function(req,res)
{
    question.findById(req.params.questId,function(err,quest)
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

app.post("/users/:id/questions",function(req,res)
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

//----------------------------------------------
//user routes
//----------------------------------------------

app.get("/users/:id/users", isLoggedIn, isAdmin, function (req, res) {
    user.find({}, function (err, users) {
        if (err) {
            console.log("Could not find users\n" + err);
        } else {
            var objectToBeParsed = { users: users, admin: req.params.id};
            res.render("users/index", { data: objectToBeParsed });
        }
    });
});

app.get("/users/:id/users/:userId", isLoggedIn, isAdmin, function (req, res) {
    user.findById(req.params.userId, function (err, userData) {
        if (err) {
            console.log("Could not find user\n" + err);
        } else {
            examBoard.find({}, function (err, examBoards) {
                if (err) {
                    console.log("Could not find examboard\n" + err);
                } else {
                    var objectToBeParsed = { user: userData, admin: req.params.id, examboard: examBoards };
                    res.render("users/show", { data: objectToBeParsed });
                }
            });
            
        }
        
    });
});

app.post("/users/:id/users/:userId/update", function (req, res) {
    user.findById(req.params.userId, function (err, user) {
        if (err) {
            console.log("Couldn't find user\n" + err);
        } else {
            if (req.body.username) {
                user.username = req.body.username;
            }
            if (req.body.email) {
                user.email = req.body.email;
            }
            if (req.body.targetGrade) {
                user.targertGrade = req.body.targetGrade;
            }
            if (req.body.score) {
                user.score.push(req.body.score);
            }
            if (req.body.examBoard) {
                user.examBoard.name = req.body.examBoard;
                user.examBoard.modules.splice(0, user.examBoard.modules.length);
                examBoard.findOne({ name: req.body.examBoard }, function (err, examboard) {
                    for (var i = 0; i < req.body.modules; i++) {
                        user.examBoard.modules.push({ name: req.body.modules[i], progress: 0, topics: [], results: [] });
                        for (var t = 0; t < examBoard.modules.length; t++) {
                            if (examBoard.modules[t].name == req.body.modules[i]) {
                                for (var q = 0; q < examBoard.modules[t].topics.length; q++) {
                                    user.examBoard.modules[i].topics.push({ name: examBoard.modules[t].topics[q].name, progress: 0, results: [] });
                                }
                            }
                        }
                    }
                });
            }
            user.save(function (err, updateUser) {
                if (err) {
                    console.log("Could not save updated user\n" + err);
                } else {
                    examBoard.find({}, function (err, examBoards) {
                        if (err) {
                            console.log("Could not find examboard\n" + err);
                        } else {
                            var objectToBeParsed = { user: updateUser, admin: req.params.id, examboard: examBoards };
                            res.render("users/show", { data: objectToBeParsed });
                        }
                    });
                }
            });
        }
    });
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

function isAdmin(req, res, next) {
    user.findById(req.params.id, function (err, user) {
        if (err)
        {
            console.log("Could not find user\n" + err);
        }
        else
        {
            if (user.role == "admin")
            {
                return next();
            }
            res.redirect("/users/" + user._id);
        }
    });  
}
//---------------------------------------------------------------------
//test functions
//---------------------------------------------------------------------

function markPart(part, answer)//had to write this since base string search function has problems with escape characters
{
    var t = 0;
    for (var i = 0; i < part.length; i++)
    {
        if (t == (answer.length -1))
        {
            return (i-t);
        }
        else if (part.charAt(i) == answer.charAt(t))
        {
            t++;    
        }
        else
        {
            t = 0;
        }
    }
    return -1;
}

function GenerateTest(time, topics) //Random Seed, Time of the Test, Array of the Topics
{ 
    var returnTopics=[]; //Topics array to be returned.

    var topicTime = Math.floor(time / topics.length); //Time for each topic
    console.log("topicTime:" + topicTime);
    //Loop through the questions in this topic

    for(var i = 0; i < topics.length; i++)
    {
        console.log("topics[" + i + "].questions.length: " + topics[i].questions.length);
        returnTopics.push({ name: topics[i].name, questions: getTopicQuestions(topics[i], topicTime) });
    }
    console.log("\n\nquestions (outside function):\n" + returnTopics);

    return returnTopics;
}

function getTopicQuestions(topic, topicTime)
{

    var timesPerQuestions=[];
    


    if(topicTime < 8)//Find the times of each question in this topic
    {
        timesPerQuestions[0] = topicTime;
    }
    else
    {
        var numberOfQuestions = Math.floor(topicTime / getRandomIntInclusive(4, (topicTime / 2)));
        var questionCounter = [0, 0];//1=higher,0=lower
        console.log("questionCounter[1]: " + questionCounter[1] + "\nquestionCounter[0]: " + questionCounter[0]);
        console.log("numberOfQuestions:" + numberOfQuestions);
        if (((topicTime / numberOfQuestions) % 1) == 0) {
            questionCounter[1] = numberOfQuestions;
        } else {
            questionCounter[1] = Math.round(numberOfQuestions * ((topicTime / numberOfQuestions) % 1));//the outmost Math.round is only neccessary becuase js cannot do maths properly
        }
        questionCounter[0] = numberOfQuestions - questionCounter[1]

        console.log("topicTime:" + topicTime);
        console.log("questionCounter[1]: " + questionCounter[1] + "\nquestionCounter[0]: " + questionCounter[0]);
        console.log("numberOfQuestions:" + numberOfQuestions);
        for (var i = 0; i < 2; i++) {//when i=0 it's adding higher questions when i=1 it's adding lower questions
            for (var t = (questionCounter[1] * i); t < (numberOfQuestions * i) + (questionCounter[1] * Math.abs(i-1)); t++) {
                timesPerQuestions.push(Math.ceil((topicTime / numberOfQuestions) - i));
            }
        }
        console.log("timesPerQuestions: " + timesPerQuestions);
    }
    
    var questionsOfProperLength = [[],[]];//1=higher,0=lower
    console.log("topic.questions.length: " + topic.questions.length);
    var higher;
    for (var i = 0; i < topic.questions.length; i++)//when i=0 it's adding higher questions when i=1 it's adding lower questions
    {
        console.log("topic.questions[" + i + "].mark: " + topic.questions[i].mark + "\ntimesPerQuestions[0]: " + timesPerQuestions[0] + "\ntimesPerQuestions[" + timesPerQuestions.length - 1 + "]: " + timesPerQuestions[timesPerQuestions.length - 1]);
        if (topic.questions[i].mark == timesPerQuestions[0]) {
            higher = 1;
        } else if (topic.questions[i].mark == timesPerQuestions[timesPerQuestions.length - 1]) {
            higher = 0;
        } else {
            continue;
        }
        questionsOfProperLength[higher].push(topic.questions[i]);
    }

    var questions=[];;
    var questionsAlreadyPicked = [[],[]];//1=higher,0=lower
    var random;

    console.log("questionCounter[1]: " + questionCounter[1] + "\nquestionCounter[0]: " + questionCounter[0] + "\nquestionsOfProperLength[1].length: " + questionsOfProperLength[1].length + "\nquestionsOfProperLength[0].length: " + questionsOfProperLength[0].length);
    for (var i = 0; i < 2; i++) {
        for (var t = 0; t < questionCounter[i]; t++) {
            random = getRandomIntInclusive(0, ((questionsOfProperLength[i].length) - 1));
            if (searchArray(questionsAlreadyPicked[i], random)) {
                t--;
                continue;
            }
            questionsAlreadyPicked[i][t] = random;
            questions.push(questionsOfProperLength[i][random]);
        }
    }
    console.log("\n\n\n\nquestions:\n" + questions + "\n\n");
    return questions;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//---------------------------------------------------------------------
//JWL functions
//---------------------------------------------------------------------

function searchArray(array, value)
{
    for (var i = 0; i < array.length; i++)
    {
        if (array[i] == value)
        {
            return true;
        }
    }
    return false;
}

//---------------------------------------------------------------------
//start server listening
//---------------------------------------------------------------------

mongoose.connect(uri, options)
    .then(() => seedDB)
    .then(() => app.listen(process.env.PORT, process.env.IP, function () {
        console.log("Server started");
    }))
    .catch(error => console.log("error"));