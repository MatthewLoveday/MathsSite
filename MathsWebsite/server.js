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
    examBoard.find({}, function (err, examBoard)
    {
        console.log("examBoard.length: " + examBoard.length);
        res.render("landing", { examBoard: examBoard, usernameTaken: false, loginFailure: false });
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
    var topicsTemp = [req.body.topic1,req.body.topic2,req.body.topic3,req.body.topic4,req.body.topic5,req.body.topic6,req.body.topic7,req.body.topic8];
    var topicsToBeParsed = [];
    var moduleIndex; 
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

    examBoard.find({ name: req.body.examBoardName }).exec().then((exams) => {
        examBoard.populate(exams, {
            path: 'modules.topics.questions',
            model: 'question'
        })
            .then((populatedExams) => {
                console.log("populatedExams[0].modules[0].topics[0].questions: " + populatedExams[0].modules[0].topics[0].questions);
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
            var topicsData = GenerateTest(req.body.time, topicsToBeParsed);

            var objectToBeParsed = { userID: req.params.id, topics: topicsData, examBoard: req.body.examBoardName, module:req.body.moduleName};
            res.render("tests/show", { testData: objectToBeParsed });
        });
    });
});

app.post("/users/:id/tests/results", function (req, res) {

    var testData = {
        examBoard: req.body.examBoard,
        module: req.body.module,
        numberOfTopics: req.body.numberOfTopics,
        topics: [
            {
                name: req.body.topic0,
                numberOfQuestions: req.body.topic0numberOfQuestions,
                percentageMark: 0,
                questions: [
                    {
                        id: req.body.topic0question0,
                        numberOfParts: req.body.topic0question0numberOfParts,
                        content: req.body.topic0question0content,
                        parts:
                        [
                            req.body.itopic0question0part0, req.body.itopic0question0part1, req.body.itopic0question0part2, req.body.itopic0question0part3, req.body.itopic0question0part4, req.body.itopic0question0part5, req.body.itopic0question0part6, req.body.itopic0question0part7, req.body.itopic0question0part8, req.body.itopic0question0part9,
                            req.body.itopic0question0part10, req.body.itopic0question0part11, req.body.itopic0question0part12, req.body.itopic0question0part13, req.body.itopic0question0part14, req.body.itopic0question0part15, req.body.itopic0question0part16, req.body.itopic0question0part17, req.body.itopic0question0part18, req.body.itopic0question0part19,
                            req.body.itopic0question0part20, req.body.itopic0question0part21, req.body.itopic0question0part22, req.body.itopic0question0part23, req.body.itopic0question0part24, req.body.itopic0question0part25, req.body.itopic0question0part26, req.body.itopic0question0part27, req.body.itopic0question0part28, req.body.itopic0question0part29,
                            req.body.itopic0question0part30, req.body.itopic0question0part31, req.body.itopic0question0part32, req.body.itopic0question0part33, req.body.itopic0question0part34, req.body.itopic0question0part35, req.body.itopic0question0part36, req.body.itopic0question0part37, req.body.itopic0question0part38, req.body.itopic0question0part39,
                            req.body.itopic0question0part40, req.body.itopic0question0part41, req.body.itopic0question0part42, req.body.itopic0question0part43, req.body.itopic0question0part44, req.body.itopic0question0part45, req.body.itopic0question0part46, req.body.itopic0question0part47, req.body.itopic0question0part48, req.body.itopic0question0part49,
                            req.body.itopic0question0part50, req.body.itopic0question0part51, req.body.itopic0question0part52, req.body.itopic0question0part53, req.body.itopic0question0part54, req.body.itopic0question0part55, req.body.itopic0question0part56, req.body.itopic0question0part57, req.body.itopic0question0part58, req.body.itopic0question0part59
                        ]
                    },
                    {
                        id: req.body.topic0question1,
                        numberOfParts: req.body.topic0question1numberOfParts,
                        content: req.body.topic0question1content,
                        parts:
                        [
                            req.body.itopic0question1part0, req.body.itopic0question1part1, req.body.itopic0question1part2, req.body.itopic0question1part3, req.body.itopic0question1part4, req.body.itopic0question1part5, req.body.itopic0question1part6, req.body.itopic0question1part7, req.body.itopic0question1part8, req.body.itopic0question1part9,
                            req.body.itopic0question1part10, req.body.itopic0question1part11, req.body.itopic0question1part12, req.body.itopic0question1part13, req.body.itopic0question1part14, req.body.itopic0question1part15, req.body.itopic0question1part16, req.body.itopic0question1part17, req.body.itopic0question1part18, req.body.itopic0question1part19,
                            req.body.itopic0question1part20, req.body.itopic0question1part21, req.body.itopic0question1part22, req.body.itopic0question1part23, req.body.itopic0question1part24, req.body.itopic0question1part25, req.body.itopic0question1part26, req.body.itopic0question1part27, req.body.itopic0question1part28, req.body.itopic0question1part29,
                            req.body.itopic0question1part30, req.body.itopic0question1part31, req.body.itopic0question1part32, req.body.itopic0question1part33, req.body.itopic0question1part34, req.body.itopic0question1part35, req.body.itopic0question1part36, req.body.itopic0question1part37, req.body.itopic0question1part38, req.body.itopic0question1part39,
                            req.body.itopic0question1part40, req.body.itopic0question1part41, req.body.itopic0question1part42, req.body.itopic0question1part43, req.body.itopic0question1part44, req.body.itopic0question1part45, req.body.itopic0question1part46, req.body.itopic0question1part47, req.body.itopic0question1part48, req.body.itopic0question1part49,
                            req.body.itopic0question1part50, req.body.itopic0question1part51, req.body.itopic0question1part52, req.body.itopic0question1part53, req.body.itopic0question1part54, req.body.itopic0question1part55, req.body.itopic0question1part56, req.body.itopic0question1part57, req.body.itopic0question1part58, req.body.itopic0question1part59
                        ]
                    },
                    {
                        id: req.body.topic0question2,
                        numberOfParts: req.body.topic0question2numberOfParts,
                        content: req.body.topic0question2content,
                        parts:
                        [
                            req.body.itopic0question2part0, req.body.itopic0question2part1, req.body.itopic0question2part2, req.body.itopic0question2part3, req.body.itopic0question2part4, req.body.itopic0question2part5, req.body.itopic0question2part6, req.body.itopic0question2part7, req.body.itopic0question2part8, req.body.itopic0question2part9,
                            req.body.itopic0question2part10, req.body.itopic0question2part11, req.body.itopic0question2part12, req.body.itopic0question2part13, req.body.itopic0question2part14, req.body.itopic0question2part15, req.body.itopic0question2part16, req.body.itopic0question2part17, req.body.itopic0question2part18, req.body.itopic0question2part19,
                            req.body.itopic0question2part20, req.body.itopic0question2part21, req.body.itopic0question2part22, req.body.itopic0question2part23, req.body.itopic0question2part24, req.body.itopic0question2part25, req.body.itopic0question2part26, req.body.itopic0question2part27, req.body.itopic0question2part28, req.body.itopic0question2part29,
                            req.body.itopic0question2part30, req.body.itopic0question2part31, req.body.itopic0question2part32, req.body.itopic0question2part33, req.body.itopic0question2part34, req.body.itopic0question2part35, req.body.itopic0question2part36, req.body.itopic0question2part37, req.body.itopic0question2part38, req.body.itopic0question2part39,
                            req.body.itopic0question2part40, req.body.itopic0question2part41, req.body.itopic0question2part42, req.body.itopic0question2part43, req.body.itopic0question2part44, req.body.itopic0question2part45, req.body.itopic0question2part46, req.body.itopic0question2part47, req.body.itopic0question2part48, req.body.itopic0question2part49,
                            req.body.itopic0question2part50, req.body.itopic0question2part51, req.body.itopic0question2part52, req.body.itopic0question2part53, req.body.itopic0question2part54, req.body.itopic0question2part55, req.body.itopic0question2part56, req.body.itopic0question2part57, req.body.itopic0question2part58, req.body.itopic0question2part59
                        ]
                    },
                    {
                        id: req.body.topic0question3,
                        numberOfParts: req.body.topic0question3numberOfParts,
                        content: req.body.topic0question3content,
                        parts:
                        [
                            req.body.itopic0question3part0, req.body.itopic0question3part1, req.body.itopic0question3part2, req.body.itopic0question3part3, req.body.itopic0question3part4, req.body.itopic0question3part5, req.body.itopic0question3part6, req.body.itopic0question3part7, req.body.itopic0question3part8, req.body.itopic0question3part9,
                            req.body.itopic0question3part10, req.body.itopic0question3part11, req.body.itopic0question3part12, req.body.itopic0question3part13, req.body.itopic0question3part14, req.body.itopic0question3part15, req.body.itopic0question3part16, req.body.itopic0question3part17, req.body.itopic0question3part18, req.body.itopic0question3part19,
                            req.body.itopic0question3part20, req.body.itopic0question3part21, req.body.itopic0question3part22, req.body.itopic0question3part23, req.body.itopic0question3part24, req.body.itopic0question3part25, req.body.itopic0question3part26, req.body.itopic0question3part27, req.body.itopic0question3part28, req.body.itopic0question3part29,
                            req.body.itopic0question3part30, req.body.itopic0question3part31, req.body.itopic0question3part32, req.body.itopic0question3part33, req.body.itopic0question3part34, req.body.itopic0question3part35, req.body.itopic0question3part36, req.body.itopic0question3part37, req.body.itopic0question3part38, req.body.itopic0question3part39,
                            req.body.itopic0question3part40, req.body.itopic0question3part41, req.body.itopic0question3part42, req.body.itopic0question3part43, req.body.itopic0question3part44, req.body.itopic0question3part45, req.body.itopic0question3part46, req.body.itopic0question3part47, req.body.itopic0question3part48, req.body.itopic0question3part49,
                            req.body.itopic0question3part50, req.body.itopic0question3part51, req.body.itopic0question3part52, req.body.itopic0question3part53, req.body.itopic0question3part54, req.body.itopic0question3part55, req.body.itopic0question3part56, req.body.itopic0question3part57, req.body.itopic0question3part58, req.body.itopic0question3part59
                        ]
                    },
                    {
                        id: req.body.topic0question4,
                        numberOfParts: req.body.topic0question4numberOfParts,
                        content: req.body.topic0question4content,
                        parts:
                        [
                            req.body.itopic0question4part0, req.body.itopic0question4part1, req.body.itopic0question4part2, req.body.itopic0question4part3, req.body.itopic0question4part4, req.body.itopic0question4part5, req.body.itopic0question4part6, req.body.itopic0question4part7, req.body.itopic0question4part8, req.body.itopic0question4part9,
                            req.body.itopic0question4part10, req.body.itopic0question4part11, req.body.itopic0question4part12, req.body.itopic0question4part13, req.body.itopic0question4part14, req.body.itopic0question4part15, req.body.itopic0question4part16, req.body.itopic0question4part17, req.body.itopic0question4part18, req.body.itopic0question4part19,
                            req.body.itopic0question4part20, req.body.itopic0question4part21, req.body.itopic0question4part22, req.body.itopic0question4part23, req.body.itopic0question4part24, req.body.itopic0question4part25, req.body.itopic0question4part26, req.body.itopic0question4part27, req.body.itopic0question4part28, req.body.itopic0question4part29,
                            req.body.itopic0question4part30, req.body.itopic0question4part31, req.body.itopic0question4part32, req.body.itopic0question4part33, req.body.itopic0question4part34, req.body.itopic0question4part35, req.body.itopic0question4part36, req.body.itopic0question4part37, req.body.itopic0question4part38, req.body.itopic0question4part39,
                            req.body.itopic0question4part40, req.body.itopic0question4part41, req.body.itopic0question4part42, req.body.itopic0question4part43, req.body.itopic0question4part44, req.body.itopic0question4part45, req.body.itopic0question4part46, req.body.itopic0question4part47, req.body.itopic0question4part48, req.body.itopic0question4part49,
                            req.body.itopic0question4part50, req.body.itopic0question4part51, req.body.itopic0question4part52, req.body.itopic0question4part53, req.body.itopic0question4part54, req.body.itopic0question4part55, req.body.itopic0question4part56, req.body.itopic0question4part57, req.body.itopic0question4part58, req.body.itopic0question4part59
                        ]
                    },
                    {
                        id: req.body.topic0question5,
                        numberOfParts: req.body.topic0question5numberOfParts,
                        content: req.body.topic0question5content,
                        parts:
                        [
                            req.body.itopic0question5part0, req.body.itopic0question5part1, req.body.itopic0question5part2, req.body.itopic0question5part3, req.body.itopic0question5part4, req.body.itopic0question5part5, req.body.itopic0question5part6, req.body.itopic0question5part7, req.body.itopic0question5part8, req.body.itopic0question5part9,
                            req.body.itopic0question5part10, req.body.itopic0question5part11, req.body.itopic0question5part12, req.body.itopic0question5part13, req.body.itopic0question5part14, req.body.itopic0question5part15, req.body.itopic0question5part16, req.body.itopic0question5part17, req.body.itopic0question5part18, req.body.itopic0question5part19,
                            req.body.itopic0question5part20, req.body.itopic0question5part21, req.body.itopic0question5part22, req.body.itopic0question5part23, req.body.itopic0question5part24, req.body.itopic0question5part25, req.body.itopic0question5part26, req.body.itopic0question5part27, req.body.itopic0question5part28, req.body.itopic0question5part29,
                            req.body.itopic0question5part30, req.body.itopic0question5part31, req.body.itopic0question5part32, req.body.itopic0question5part33, req.body.itopic0question5part34, req.body.itopic0question5part35, req.body.itopic0question5part36, req.body.itopic0question5part37, req.body.itopic0question5part38, req.body.itopic0question5part39,
                            req.body.itopic0question5part40, req.body.itopic0question5part41, req.body.itopic0question5part42, req.body.itopic0question5part43, req.body.itopic0question5part44, req.body.itopic0question5part45, req.body.itopic0question5part46, req.body.itopic0question5part47, req.body.itopic0question5part48, req.body.itopic0question5part49,
                            req.body.itopic0question5part50, req.body.itopic0question5part51, req.body.itopic0question5part52, req.body.itopic0question5part53, req.body.itopic0question5part54, req.body.itopic0question5part55, req.body.itopic0question5part56, req.body.itopic0question5part57, req.body.itopic0question5part58, req.body.itopic0question5part59
                        ]
                    },
                    {
                        id: req.body.topic0question6,
                        numberOfParts: req.body.topic0question6numberOfParts,
                        content: req.body.topic0question6content,
                        parts:
                        [
                            req.body.itopic0question6part0, req.body.itopic0question6part1, req.body.itopic0question6part2, req.body.itopic0question6part3, req.body.itopic0question6part4, req.body.itopic0question6part5, req.body.itopic0question6part6, req.body.itopic0question6part7, req.body.itopic0question6part8, req.body.itopic0question6part9,
                            req.body.itopic0question6part10, req.body.itopic0question6part11, req.body.itopic0question6part12, req.body.itopic0question6part13, req.body.itopic0question6part14, req.body.itopic0question6part15, req.body.itopic0question6part16, req.body.itopic0question6part17, req.body.itopic0question6part18, req.body.itopic0question6part19,
                            req.body.itopic0question6part20, req.body.itopic0question6part21, req.body.itopic0question6part22, req.body.itopic0question6part23, req.body.itopic0question6part24, req.body.itopic0question6part25, req.body.itopic0question6part26, req.body.itopic0question6part27, req.body.itopic0question6part28, req.body.itopic0question6part29,
                            req.body.itopic0question6part30, req.body.itopic0question6part31, req.body.itopic0question6part32, req.body.itopic0question6part33, req.body.itopic0question6part34, req.body.itopic0question6part35, req.body.itopic0question6part36, req.body.itopic0question6part37, req.body.itopic0question6part38, req.body.itopic0question6part39,
                            req.body.itopic0question6part40, req.body.itopic0question6part41, req.body.itopic0question6part42, req.body.itopic0question6part43, req.body.itopic0question6part44, req.body.itopic0question6part45, req.body.itopic0question6part46, req.body.itopic0question6part47, req.body.itopic0question6part48, req.body.itopic0question6part49,
                            req.body.itopic0question6part50, req.body.itopic0question6part51, req.body.itopic0question6part52, req.body.itopic0question6part53, req.body.itopic0question6part54, req.body.itopic0question6part55, req.body.itopic0question6part56, req.body.itopic0question6part57, req.body.itopic0question6part58, req.body.itopic0question6part59
                        ]
                    },
                    {
                        id: req.body.topic0question7,
                        numberOfParts: req.body.topic0question7numberOfParts,
                        content: req.body.topic0question7content,
                        parts:
                        [
                            req.body.itopic0question7part0, req.body.itopic0question7part1, req.body.itopic0question7part2, req.body.itopic0question7part3, req.body.itopic0question7part4, req.body.itopic0question7part5, req.body.itopic0question7part6, req.body.itopic0question7part7, req.body.itopic0question7part8, req.body.itopic0question7part9,
                            req.body.itopic0question7part10, req.body.itopic0question7part11, req.body.itopic0question7part12, req.body.itopic0question7part13, req.body.itopic0question7part14, req.body.itopic0question7part15, req.body.itopic0question7part16, req.body.itopic0question7part17, req.body.itopic0question7part18, req.body.itopic0question7part19,
                            req.body.itopic0question7part20, req.body.itopic0question7part21, req.body.itopic0question7part22, req.body.itopic0question7part23, req.body.itopic0question7part24, req.body.itopic0question7part25, req.body.itopic0question7part26, req.body.itopic0question7part27, req.body.itopic0question7part28, req.body.itopic0question7part29,
                            req.body.itopic0question7part30, req.body.itopic0question7part31, req.body.itopic0question7part32, req.body.itopic0question7part33, req.body.itopic0question7part34, req.body.itopic0question7part35, req.body.itopic0question7part36, req.body.itopic0question7part37, req.body.itopic0question7part38, req.body.itopic0question7part39,
                            req.body.itopic0question7part40, req.body.itopic0question7part41, req.body.itopic0question7part42, req.body.itopic0question7part43, req.body.itopic0question7part44, req.body.itopic0question7part45, req.body.itopic0question7part46, req.body.itopic0question7part47, req.body.itopic0question7part48, req.body.itopic0question7part49,
                            req.body.itopic0question7part50, req.body.itopic0question7part51, req.body.itopic0question7part52, req.body.itopic0question7part53, req.body.itopic0question7part54, req.body.itopic0question7part55, req.body.itopic0question7part56, req.body.itopic0question7part57, req.body.itopic0question7part58, req.body.itopic0question7part59
                        ]
                    },
                    {
                        id: req.body.topic0question8,
                        numberOfParts: req.body.topic0question8numberOfParts,
                        content: req.body.topic0question8content,
                        parts:
                        [
                            req.body.itopic0question8part0, req.body.itopic0question8part1, req.body.itopic0question8part2, req.body.itopic0question8part3, req.body.itopic0question8part4, req.body.itopic0question8part5, req.body.itopic0question8part6, req.body.itopic0question8part7, req.body.itopic0question8part8, req.body.itopic0question8part9,
                            req.body.itopic0question8part10, req.body.itopic0question8part11, req.body.itopic0question8part12, req.body.itopic0question8part13, req.body.itopic0question8part14, req.body.itopic0question8part15, req.body.itopic0question8part16, req.body.itopic0question8part17, req.body.itopic0question8part18, req.body.itopic0question8part19,
                            req.body.itopic0question8part20, req.body.itopic0question8part21, req.body.itopic0question8part22, req.body.itopic0question8part23, req.body.itopic0question8part24, req.body.itopic0question8part25, req.body.itopic0question8part26, req.body.itopic0question8part27, req.body.itopic0question8part28, req.body.itopic0question8part29,
                            req.body.itopic0question8part30, req.body.itopic0question8part31, req.body.itopic0question8part32, req.body.itopic0question8part33, req.body.itopic0question8part34, req.body.itopic0question8part35, req.body.itopic0question8part36, req.body.itopic0question8part37, req.body.itopic0question8part38, req.body.itopic0question8part39,
                            req.body.itopic0question8part40, req.body.itopic0question8part41, req.body.itopic0question8part42, req.body.itopic0question8part43, req.body.itopic0question8part44, req.body.itopic0question8part45, req.body.itopic0question8part46, req.body.itopic0question8part47, req.body.itopic0question8part48, req.body.itopic0question8part49,
                            req.body.itopic0question8part50, req.body.itopic0question8part51, req.body.itopic0question8part52, req.body.itopic0question8part53, req.body.itopic0question8part54, req.body.itopic0question8part55, req.body.itopic0question8part56, req.body.itopic0question8part57, req.body.itopic0question8part58, req.body.itopic0question8part59
                        ]
                    },
                    {
                        id: req.body.topic0question9,
                        numberOfParts: req.body.topic0question9numberOfParts,
                        content: req.body.topic0question9content,
                        parts:
                        [
                            req.body.itopic0question9part0, req.body.itopic0question9part1, req.body.itopic0question9part2, req.body.itopic0question9part3, req.body.itopic0question9part4, req.body.itopic0question9part5, req.body.itopic0question9part6, req.body.itopic0question9part7, req.body.itopic0question9part8, req.body.itopic0question9part9,
                            req.body.itopic0question9part10, req.body.itopic0question9part11, req.body.itopic0question9part12, req.body.itopic0question9part13, req.body.itopic0question9part14, req.body.itopic0question9part15, req.body.itopic0question9part16, req.body.itopic0question9part17, req.body.itopic0question9part18, req.body.itopic0question9part19,
                            req.body.itopic0question9part20, req.body.itopic0question9part21, req.body.itopic0question9part22, req.body.itopic0question9part23, req.body.itopic0question9part24, req.body.itopic0question9part25, req.body.itopic0question9part26, req.body.itopic0question9part27, req.body.itopic0question9part28, req.body.itopic0question9part29,
                            req.body.itopic0question9part30, req.body.itopic0question9part31, req.body.itopic0question9part32, req.body.itopic0question9part33, req.body.itopic0question9part34, req.body.itopic0question9part35, req.body.itopic0question9part36, req.body.itopic0question9part37, req.body.itopic0question9part38, req.body.itopic0question9part39,
                            req.body.itopic0question9part40, req.body.itopic0question9part41, req.body.itopic0question9part42, req.body.itopic0question9part43, req.body.itopic0question9part44, req.body.itopic0question9part45, req.body.itopic0question9part46, req.body.itopic0question9part47, req.body.itopic0question9part48, req.body.itopic0question9part49,
                            req.body.itopic0question9part50, req.body.itopic0question9part51, req.body.itopic0question9part52, req.body.itopic0question9part53, req.body.itopic0question9part54, req.body.itopic0question9part55, req.body.itopic0question9part56, req.body.itopic0question9part57, req.body.itopic0question9part58, req.body.itopic0question9part59
                        ]
                    },
                    {
                        id: req.body.topic0question10,
                        numberOfParts: req.body.topic0question10numberOfParts,
                        content: req.body.topic0question10content,
                        parts:
                        [
                            req.body.itopic0question10part0, req.body.itopic0question10part1, req.body.itopic0question10part2, req.body.itopic0question10part3, req.body.itopic0question10part4, req.body.itopic0question10part5, req.body.itopic0question10part6, req.body.itopic0question10part7, req.body.itopic0question10part8, req.body.itopic0question10part9,
                            req.body.itopic0question10part10, req.body.itopic0question10part11, req.body.itopic0question10part12, req.body.itopic0question10part13, req.body.itopic0question10part14, req.body.itopic0question10part15, req.body.itopic0question10part16, req.body.itopic0question10part17, req.body.itopic0question10part18, req.body.itopic0question10part19,
                            req.body.itopic0question10part20, req.body.itopic0question10part21, req.body.itopic0question10part22, req.body.itopic0question10part23, req.body.itopic0question10part24, req.body.itopic0question10part25, req.body.itopic0question10part26, req.body.itopic0question10part27, req.body.itopic0question10part28, req.body.itopic0question10part29,
                            req.body.itopic0question10part30, req.body.itopic0question10part31, req.body.itopic0question10part32, req.body.itopic0question10part33, req.body.itopic0question10part34, req.body.itopic0question10part35, req.body.itopic0question10part36, req.body.itopic0question10part37, req.body.itopic0question10part38, req.body.itopic0question10part39,
                            req.body.itopic0question10part40, req.body.itopic0question10part41, req.body.itopic0question10part42, req.body.itopic0question10part43, req.body.itopic0question10part44, req.body.itopic0question10part45, req.body.itopic0question10part46, req.body.itopic0question10part47, req.body.itopic0question10part48, req.body.itopic0question10part49,
                            req.body.itopic0question10part50, req.body.itopic0question10part51, req.body.itopic0question10part52, req.body.itopic0question10part53, req.body.itopic0question10part54, req.body.itopic0question10part55, req.body.itopic0question10part56, req.body.itopic0question10part57, req.body.itopic0question10part58, req.body.itopic0question10part59
                        ]
                    },
                    {
                        id: req.body.topic0question11,
                        numberOfParts: req.body.topic0question11numberOfParts,
                        content: req.body.topic0question11content,
                        parts:
                        [
                            req.body.itopic0question11part0, req.body.itopic0question11part1, req.body.itopic0question11part2, req.body.itopic0question11part3, req.body.itopic0question11part4, req.body.itopic0question11part5, req.body.itopic0question11part6, req.body.itopic0question11part7, req.body.itopic0question11part8, req.body.itopic0question11part9,
                            req.body.itopic0question11part10, req.body.itopic0question11part11, req.body.itopic0question11part12, req.body.itopic0question11part13, req.body.itopic0question11part14, req.body.itopic0question11part15, req.body.itopic0question11part16, req.body.itopic0question11part17, req.body.itopic0question11part18, req.body.itopic0question11part19,
                            req.body.itopic0question11part20, req.body.itopic0question11part21, req.body.itopic0question11part22, req.body.itopic0question11part23, req.body.itopic0question11part24, req.body.itopic0question11part25, req.body.itopic0question11part26, req.body.itopic0question11part27, req.body.itopic0question11part28, req.body.itopic0question11part29,
                            req.body.itopic0question11part30, req.body.itopic0question11part31, req.body.itopic0question11part32, req.body.itopic0question11part33, req.body.itopic0question11part34, req.body.itopic0question11part35, req.body.itopic0question11part36, req.body.itopic0question11part37, req.body.itopic0question11part38, req.body.itopic0question11part39,
                            req.body.itopic0question11part40, req.body.itopic0question11part41, req.body.itopic0question11part42, req.body.itopic0question11part43, req.body.itopic0question11part44, req.body.itopic0question11part45, req.body.itopic0question11part46, req.body.itopic0question11part47, req.body.itopic0question11part48, req.body.itopic0question11part49,
                            req.body.itopic0question11part50, req.body.itopic0question11part51, req.body.itopic0question11part52, req.body.itopic0question11part53, req.body.itopic0question11part54, req.body.itopic0question11part55, req.body.itopic0question11part56, req.body.itopic0question11part57, req.body.itopic0question11part58, req.body.itopic0question11part59
                        ]
                    },
                    {
                        id: req.body.topic0question12,
                        numberOfParts: req.body.topic0question12numberOfParts,
                        content: req.body.topic0question12content,
                        parts:
                        [
                            req.body.itopic0question12part0, req.body.itopic0question12part1, req.body.itopic0question12part2, req.body.itopic0question12part3, req.body.itopic0question12part4, req.body.itopic0question12part5, req.body.itopic0question12part6, req.body.itopic0question12part7, req.body.itopic0question12part8, req.body.itopic0question12part9,
                            req.body.itopic0question12part10, req.body.itopic0question12part11, req.body.itopic0question12part12, req.body.itopic0question12part13, req.body.itopic0question12part14, req.body.itopic0question12part15, req.body.itopic0question12part16, req.body.itopic0question12part17, req.body.itopic0question12part18, req.body.itopic0question12part19,
                            req.body.itopic0question12part20, req.body.itopic0question12part21, req.body.itopic0question12part22, req.body.itopic0question12part23, req.body.itopic0question12part24, req.body.itopic0question12part25, req.body.itopic0question12part26, req.body.itopic0question12part27, req.body.itopic0question12part28, req.body.itopic0question12part29,
                            req.body.itopic0question12part30, req.body.itopic0question12part31, req.body.itopic0question12part32, req.body.itopic0question12part33, req.body.itopic0question12part34, req.body.itopic0question12part35, req.body.itopic0question12part36, req.body.itopic0question12part37, req.body.itopic0question12part38, req.body.itopic0question12part39,
                            req.body.itopic0question12part40, req.body.itopic0question12part41, req.body.itopic0question12part42, req.body.itopic0question12part43, req.body.itopic0question12part44, req.body.itopic0question12part45, req.body.itopic0question12part46, req.body.itopic0question12part47, req.body.itopic0question12part48, req.body.itopic0question12part49,
                            req.body.itopic0question12part50, req.body.itopic0question12part51, req.body.itopic0question12part52, req.body.itopic0question12part53, req.body.itopic0question12part54, req.body.itopic0question12part55, req.body.itopic0question12part56, req.body.itopic0question12part57, req.body.itopic0question12part58, req.body.itopic0question12part59
                        ]
                    },
                    {
                        id: req.body.topic0question13,
                        numberOfParts: req.body.topic0question13numberOfParts,
                        content: req.body.topic0question13content,
                        parts:
                        [
                            req.body.itopic0question13part0, req.body.itopic0question13part1, req.body.itopic0question13part2, req.body.itopic0question13part3, req.body.itopic0question13part4, req.body.itopic0question13part5, req.body.itopic0question13part6, req.body.itopic0question13part7, req.body.itopic0question13part8, req.body.itopic0question13part9,
                            req.body.itopic0question13part10, req.body.itopic0question13part11, req.body.itopic0question13part12, req.body.itopic0question13part13, req.body.itopic0question13part14, req.body.itopic0question13part15, req.body.itopic0question13part16, req.body.itopic0question13part17, req.body.itopic0question13part18, req.body.itopic0question13part19,
                            req.body.itopic0question13part20, req.body.itopic0question13part21, req.body.itopic0question13part22, req.body.itopic0question13part23, req.body.itopic0question13part24, req.body.itopic0question13part25, req.body.itopic0question13part26, req.body.itopic0question13part27, req.body.itopic0question13part28, req.body.itopic0question13part29,
                            req.body.itopic0question13part30, req.body.itopic0question13part31, req.body.itopic0question13part32, req.body.itopic0question13part33, req.body.itopic0question13part34, req.body.itopic0question13part35, req.body.itopic0question13part36, req.body.itopic0question13part37, req.body.itopic0question13part38, req.body.itopic0question13part39,
                            req.body.itopic0question13part40, req.body.itopic0question13part41, req.body.itopic0question13part42, req.body.itopic0question13part43, req.body.itopic0question13part44, req.body.itopic0question13part45, req.body.itopic0question13part46, req.body.itopic0question13part47, req.body.itopic0question13part48, req.body.itopic0question13part49,
                            req.body.itopic0question13part50, req.body.itopic0question13part51, req.body.itopic0question13part52, req.body.itopic0question13part53, req.body.itopic0question13part54, req.body.itopic0question13part55, req.body.itopic0question13part56, req.body.itopic0question13part57, req.body.itopic0question13part58, req.body.itopic0question13part59
                        ]
                    },
                    {
                        id: req.body.topic0question14,
                        numberOfParts: req.body.topic0question14numberOfParts,
                        content: req.body.topic0question14content,
                        parts:
                        [
                            req.body.itopic0question14part0, req.body.itopic0question14part1, req.body.itopic0question14part2, req.body.itopic0question14part3, req.body.itopic0question14part4, req.body.itopic0question14part5, req.body.itopic0question14part6, req.body.itopic0question14part7, req.body.itopic0question14part8, req.body.itopic0question14part9,
                            req.body.itopic0question14part10, req.body.itopic0question14part11, req.body.itopic0question14part12, req.body.itopic0question14part13, req.body.itopic0question14part14, req.body.itopic0question14part15, req.body.itopic0question14part16, req.body.itopic0question14part17, req.body.itopic0question14part18, req.body.itopic0question14part19,
                            req.body.itopic0question14part20, req.body.itopic0question14part21, req.body.itopic0question14part22, req.body.itopic0question14part23, req.body.itopic0question14part24, req.body.itopic0question14part25, req.body.itopic0question14part26, req.body.itopic0question14part27, req.body.itopic0question14part28, req.body.itopic0question14part29,
                            req.body.itopic0question14part30, req.body.itopic0question14part31, req.body.itopic0question14part32, req.body.itopic0question14part33, req.body.itopic0question14part34, req.body.itopic0question14part35, req.body.itopic0question14part36, req.body.itopic0question14part37, req.body.itopic0question14part38, req.body.itopic0question14part39,
                            req.body.itopic0question14part40, req.body.itopic0question14part41, req.body.itopic0question14part42, req.body.itopic0question14part43, req.body.itopic0question14part44, req.body.itopic0question14part45, req.body.itopic0question14part46, req.body.itopic0question14part47, req.body.itopic0question14part48, req.body.itopic0question14part49,
                            req.body.itopic0question14part50, req.body.itopic0question14part51, req.body.itopic0question14part52, req.body.itopic0question14part53, req.body.itopic0question14part54, req.body.itopic0question14part55, req.body.itopic0question14part56, req.body.itopic0question14part57, req.body.itopic0question14part58, req.body.itopic0question14part59
                        ]
                    },
                    {
                        id: req.body.topic0question15,
                        numberOfParts: req.body.topic0question15numberOfParts,
                        content: req.body.topic0question15content,
                        parts:
                        [
                            req.body.itopic0question15part0, req.body.itopic0question15part1, req.body.itopic0question15part2, req.body.itopic0question15part3, req.body.itopic0question15part4, req.body.itopic0question15part5, req.body.itopic0question15part6, req.body.itopic0question15part7, req.body.itopic0question15part8, req.body.itopic0question15part9,
                            req.body.itopic0question15part10, req.body.itopic0question15part11, req.body.itopic0question15part12, req.body.itopic0question15part13, req.body.itopic0question15part14, req.body.itopic0question15part15, req.body.itopic0question15part16, req.body.itopic0question15part17, req.body.itopic0question15part18, req.body.itopic0question15part19,
                            req.body.itopic0question15part20, req.body.itopic0question15part21, req.body.itopic0question15part22, req.body.itopic0question15part23, req.body.itopic0question15part24, req.body.itopic0question15part25, req.body.itopic0question15part26, req.body.itopic0question15part27, req.body.itopic0question15part28, req.body.itopic0question15part29,
                            req.body.itopic0question15part30, req.body.itopic0question15part31, req.body.itopic0question15part32, req.body.itopic0question15part33, req.body.itopic0question15part34, req.body.itopic0question15part35, req.body.itopic0question15part36, req.body.itopic0question15part37, req.body.itopic0question15part38, req.body.itopic0question15part39,
                            req.body.itopic0question15part40, req.body.itopic0question15part41, req.body.itopic0question15part42, req.body.itopic0question15part43, req.body.itopic0question15part44, req.body.itopic0question15part45, req.body.itopic0question15part46, req.body.itopic0question15part47, req.body.itopic0question15part48, req.body.itopic0question15part49,
                            req.body.itopic0question15part50, req.body.itopic0question15part51, req.body.itopic0question15part52, req.body.itopic0question15part53, req.body.itopic0question15part54, req.body.itopic0question15part55, req.body.itopic0question15part56, req.body.itopic0question15part57, req.body.itopic0question15part58, req.body.itopic0question15part59
                        ]
                    },
                ]
            },
            {
                name: req.body.topic1,
                numberOfQuestions: req.body.topic1numberOfQuestions,
                percentageMark: 0,
                questions: [
                    {
                        id: req.body.topic1question0,
                        numberOfParts: req.body.topic1question0numberOfParts,
                        content: req.body.topic1question0content,
                        parts:
                        [
                            req.body.itopic1question0part0, req.body.itopic1question0part1, req.body.itopic1question0part2, req.body.itopic1question0part3, req.body.itopic1question0part4, req.body.itopic1question0part5, req.body.itopic1question0part6, req.body.itopic1question0part7, req.body.itopic1question0part8, req.body.itopic1question0part9,
                            req.body.itopic1question0part10, req.body.itopic1question0part11, req.body.itopic1question0part12, req.body.itopic1question0part13, req.body.itopic1question0part14, req.body.itopic1question0part15, req.body.itopic1question0part16, req.body.itopic1question0part17, req.body.itopic1question0part18, req.body.itopic1question0part19,
                            req.body.itopic1question0part20, req.body.itopic1question0part21, req.body.itopic1question0part22, req.body.itopic1question0part23, req.body.itopic1question0part24, req.body.itopic1question0part25, req.body.itopic1question0part26, req.body.itopic1question0part27, req.body.itopic1question0part28, req.body.itopic1question0part29,
                            req.body.itopic1question0part30, req.body.itopic1question0part31, req.body.itopic1question0part32, req.body.itopic1question0part33, req.body.itopic1question0part34, req.body.itopic1question0part35, req.body.itopic1question0part36, req.body.itopic1question0part37, req.body.itopic1question0part38, req.body.itopic1question0part39,
                            req.body.itopic1question0part40, req.body.itopic1question0part41, req.body.itopic1question0part42, req.body.itopic1question0part43, req.body.itopic1question0part44, req.body.itopic1question0part45, req.body.itopic1question0part46, req.body.itopic1question0part47, req.body.itopic1question0part48, req.body.itopic1question0part49,
                            req.body.itopic1question0part50, req.body.itopic1question0part51, req.body.itopic1question0part52, req.body.itopic1question0part53, req.body.itopic1question0part54, req.body.itopic1question0part55, req.body.itopic1question0part56, req.body.itopic1question0part57, req.body.itopic1question0part58, req.body.itopic1question0part59
                        ]
                    },
                    {
                        id: req.body.topic1question1,
                        numberOfParts: req.body.topic1question1numberOfParts,
                        content: req.body.topic1question1content,
                        parts:
                        [
                            req.body.itopic1question1part0, req.body.itopic1question1part1, req.body.itopic1question1part2, req.body.itopic1question1part3, req.body.itopic1question1part4, req.body.itopic1question1part5, req.body.itopic1question1part6, req.body.itopic1question1part7, req.body.itopic1question1part8, req.body.itopic1question1part9,
                            req.body.itopic1question1part10, req.body.itopic1question1part11, req.body.itopic1question1part12, req.body.itopic1question1part13, req.body.itopic1question1part14, req.body.itopic1question1part15, req.body.itopic1question1part16, req.body.itopic1question1part17, req.body.itopic1question1part18, req.body.itopic1question1part19,
                            req.body.itopic1question1part20, req.body.itopic1question1part21, req.body.itopic1question1part22, req.body.itopic1question1part23, req.body.itopic1question1part24, req.body.itopic1question1part25, req.body.itopic1question1part26, req.body.itopic1question1part27, req.body.itopic1question1part28, req.body.itopic1question1part29,
                            req.body.itopic1question1part30, req.body.itopic1question1part31, req.body.itopic1question1part32, req.body.itopic1question1part33, req.body.itopic1question1part34, req.body.itopic1question1part35, req.body.itopic1question1part36, req.body.itopic1question1part37, req.body.itopic1question1part38, req.body.itopic1question1part39,
                            req.body.itopic1question1part40, req.body.itopic1question1part41, req.body.itopic1question1part42, req.body.itopic1question1part43, req.body.itopic1question1part44, req.body.itopic1question1part45, req.body.itopic1question1part46, req.body.itopic1question1part47, req.body.itopic1question1part48, req.body.itopic1question1part49,
                            req.body.itopic1question1part50, req.body.itopic1question1part51, req.body.itopic1question1part52, req.body.itopic1question1part53, req.body.itopic1question1part54, req.body.itopic1question1part55, req.body.itopic1question1part56, req.body.itopic1question1part57, req.body.itopic1question1part58, req.body.itopic1question1part59
                        ]
                    },
                    {
                        id: req.body.topic1question2,
                        numberOfParts: req.body.topic1question2numberOfParts,
                        content: req.body.topic1question2content,
                        parts:
                        [
                            req.body.itopic1question2part0, req.body.itopic1question2part1, req.body.itopic1question2part2, req.body.itopic1question2part3, req.body.itopic1question2part4, req.body.itopic1question2part5, req.body.itopic1question2part6, req.body.itopic1question2part7, req.body.itopic1question2part8, req.body.itopic1question2part9,
                            req.body.itopic1question2part10, req.body.itopic1question2part11, req.body.itopic1question2part12, req.body.itopic1question2part13, req.body.itopic1question2part14, req.body.itopic1question2part15, req.body.itopic1question2part16, req.body.itopic1question2part17, req.body.itopic1question2part18, req.body.itopic1question2part19,
                            req.body.itopic1question2part20, req.body.itopic1question2part21, req.body.itopic1question2part22, req.body.itopic1question2part23, req.body.itopic1question2part24, req.body.itopic1question2part25, req.body.itopic1question2part26, req.body.itopic1question2part27, req.body.itopic1question2part28, req.body.itopic1question2part29,
                            req.body.itopic1question2part30, req.body.itopic1question2part31, req.body.itopic1question2part32, req.body.itopic1question2part33, req.body.itopic1question2part34, req.body.itopic1question2part35, req.body.itopic1question2part36, req.body.itopic1question2part37, req.body.itopic1question2part38, req.body.itopic1question2part39,
                            req.body.itopic1question2part40, req.body.itopic1question2part41, req.body.itopic1question2part42, req.body.itopic1question2part43, req.body.itopic1question2part44, req.body.itopic1question2part45, req.body.itopic1question2part46, req.body.itopic1question2part47, req.body.itopic1question2part48, req.body.itopic1question2part49,
                            req.body.itopic1question2part50, req.body.itopic1question2part51, req.body.itopic1question2part52, req.body.itopic1question2part53, req.body.itopic1question2part54, req.body.itopic1question2part55, req.body.itopic1question2part56, req.body.itopic1question2part57, req.body.itopic1question2part58, req.body.itopic1question2part59
                        ]
                    },
                    {
                        id: req.body.topic1question3,
                        numberOfParts: req.body.topic1question3numberOfParts,
                        content: req.body.topic1question3content,
                        parts:
                        [
                            req.body.itopic1question3part0, req.body.itopic1question3part1, req.body.itopic1question3part2, req.body.itopic1question3part3, req.body.itopic1question3part4, req.body.itopic1question3part5, req.body.itopic1question3part6, req.body.itopic1question3part7, req.body.itopic1question3part8, req.body.itopic1question3part9,
                            req.body.itopic1question3part10, req.body.itopic1question3part11, req.body.itopic1question3part12, req.body.itopic1question3part13, req.body.itopic1question3part14, req.body.itopic1question3part15, req.body.itopic1question3part16, req.body.itopic1question3part17, req.body.itopic1question3part18, req.body.itopic1question3part19,
                            req.body.itopic1question3part20, req.body.itopic1question3part21, req.body.itopic1question3part22, req.body.itopic1question3part23, req.body.itopic1question3part24, req.body.itopic1question3part25, req.body.itopic1question3part26, req.body.itopic1question3part27, req.body.itopic1question3part28, req.body.itopic1question3part29,
                            req.body.itopic1question3part30, req.body.itopic1question3part31, req.body.itopic1question3part32, req.body.itopic1question3part33, req.body.itopic1question3part34, req.body.itopic1question3part35, req.body.itopic1question3part36, req.body.itopic1question3part37, req.body.itopic1question3part38, req.body.itopic1question3part39,
                            req.body.itopic1question3part40, req.body.itopic1question3part41, req.body.itopic1question3part42, req.body.itopic1question3part43, req.body.itopic1question3part44, req.body.itopic1question3part45, req.body.itopic1question3part46, req.body.itopic1question3part47, req.body.itopic1question3part48, req.body.itopic1question3part49,
                            req.body.itopic1question3part50, req.body.itopic1question3part51, req.body.itopic1question3part52, req.body.itopic1question3part53, req.body.itopic1question3part54, req.body.itopic1question3part55, req.body.itopic1question3part56, req.body.itopic1question3part57, req.body.itopic1question3part58, req.body.itopic1question3part59
                        ]
                    },
                    {
                        id: req.body.topic1question4,
                        numberOfParts: req.body.topic1question4numberOfParts,
                        content: req.body.topic1question4content,
                        parts:
                        [
                            req.body.itopic1question4part0, req.body.itopic1question4part1, req.body.itopic1question4part2, req.body.itopic1question4part3, req.body.itopic1question4part4, req.body.itopic1question4part5, req.body.itopic1question4part6, req.body.itopic1question4part7, req.body.itopic1question4part8, req.body.itopic1question4part9,
                            req.body.itopic1question4part10, req.body.itopic1question4part11, req.body.itopic1question4part12, req.body.itopic1question4part13, req.body.itopic1question4part14, req.body.itopic1question4part15, req.body.itopic1question4part16, req.body.itopic1question4part17, req.body.itopic1question4part18, req.body.itopic1question4part19,
                            req.body.itopic1question4part20, req.body.itopic1question4part21, req.body.itopic1question4part22, req.body.itopic1question4part23, req.body.itopic1question4part24, req.body.itopic1question4part25, req.body.itopic1question4part26, req.body.itopic1question4part27, req.body.itopic1question4part28, req.body.itopic1question4part29,
                            req.body.itopic1question4part30, req.body.itopic1question4part31, req.body.itopic1question4part32, req.body.itopic1question4part33, req.body.itopic1question4part34, req.body.itopic1question4part35, req.body.itopic1question4part36, req.body.itopic1question4part37, req.body.itopic1question4part38, req.body.itopic1question4part39,
                            req.body.itopic1question4part40, req.body.itopic1question4part41, req.body.itopic1question4part42, req.body.itopic1question4part43, req.body.itopic1question4part44, req.body.itopic1question4part45, req.body.itopic1question4part46, req.body.itopic1question4part47, req.body.itopic1question4part48, req.body.itopic1question4part49,
                            req.body.itopic1question4part50, req.body.itopic1question4part51, req.body.itopic1question4part52, req.body.itopic1question4part53, req.body.itopic1question4part54, req.body.itopic1question4part55, req.body.itopic1question4part56, req.body.itopic1question4part57, req.body.itopic1question4part58, req.body.itopic1question4part59
                        ]
                    },
                    {
                        id: req.body.topic1question5,
                        numberOfParts: req.body.topic1question5numberOfParts,
                        content: req.body.topic1question5content,
                        parts:
                        [
                            req.body.itopic1question5part0, req.body.itopic1question5part1, req.body.itopic1question5part2, req.body.itopic1question5part3, req.body.itopic1question5part4, req.body.itopic1question5part5, req.body.itopic1question5part6, req.body.itopic1question5part7, req.body.itopic1question5part8, req.body.itopic1question5part9,
                            req.body.itopic1question5part10, req.body.itopic1question5part11, req.body.itopic1question5part12, req.body.itopic1question5part13, req.body.itopic1question5part14, req.body.itopic1question5part15, req.body.itopic1question5part16, req.body.itopic1question5part17, req.body.itopic1question5part18, req.body.itopic1question5part19,
                            req.body.itopic1question5part20, req.body.itopic1question5part21, req.body.itopic1question5part22, req.body.itopic1question5part23, req.body.itopic1question5part24, req.body.itopic1question5part25, req.body.itopic1question5part26, req.body.itopic1question5part27, req.body.itopic1question5part28, req.body.itopic1question5part29,
                            req.body.itopic1question5part30, req.body.itopic1question5part31, req.body.itopic1question5part32, req.body.itopic1question5part33, req.body.itopic1question5part34, req.body.itopic1question5part35, req.body.itopic1question5part36, req.body.itopic1question5part37, req.body.itopic1question5part38, req.body.itopic1question5part39,
                            req.body.itopic1question5part40, req.body.itopic1question5part41, req.body.itopic1question5part42, req.body.itopic1question5part43, req.body.itopic1question5part44, req.body.itopic1question5part45, req.body.itopic1question5part46, req.body.itopic1question5part47, req.body.itopic1question5part48, req.body.itopic1question5part49,
                            req.body.itopic1question5part50, req.body.itopic1question5part51, req.body.itopic1question5part52, req.body.itopic1question5part53, req.body.itopic1question5part54, req.body.itopic1question5part55, req.body.itopic1question5part56, req.body.itopic1question5part57, req.body.itopic1question5part58, req.body.itopic1question5part59
                        ]
                    },
                    {
                        id: req.body.topic1question6,
                        numberOfParts: req.body.topic1question6numberOfParts,
                        content: req.body.topic1question6content,
                        parts:
                        [
                            req.body.itopic1question6part0, req.body.itopic1question6part1, req.body.itopic1question6part2, req.body.itopic1question6part3, req.body.itopic1question6part4, req.body.itopic1question6part5, req.body.itopic1question6part6, req.body.itopic1question6part7, req.body.itopic1question6part8, req.body.itopic1question6part9,
                            req.body.itopic1question6part10, req.body.itopic1question6part11, req.body.itopic1question6part12, req.body.itopic1question6part13, req.body.itopic1question6part14, req.body.itopic1question6part15, req.body.itopic1question6part16, req.body.itopic1question6part17, req.body.itopic1question6part18, req.body.itopic1question6part19,
                            req.body.itopic1question6part20, req.body.itopic1question6part21, req.body.itopic1question6part22, req.body.itopic1question6part23, req.body.itopic1question6part24, req.body.itopic1question6part25, req.body.itopic1question6part26, req.body.itopic1question6part27, req.body.itopic1question6part28, req.body.itopic1question6part29,
                            req.body.itopic1question6part30, req.body.itopic1question6part31, req.body.itopic1question6part32, req.body.itopic1question6part33, req.body.itopic1question6part34, req.body.itopic1question6part35, req.body.itopic1question6part36, req.body.itopic1question6part37, req.body.itopic1question6part38, req.body.itopic1question6part39,
                            req.body.itopic1question6part40, req.body.itopic1question6part41, req.body.itopic1question6part42, req.body.itopic1question6part43, req.body.itopic1question6part44, req.body.itopic1question6part45, req.body.itopic1question6part46, req.body.itopic1question6part47, req.body.itopic1question6part48, req.body.itopic1question6part49,
                            req.body.itopic1question6part50, req.body.itopic1question6part51, req.body.itopic1question6part52, req.body.itopic1question6part53, req.body.itopic1question6part54, req.body.itopic1question6part55, req.body.itopic1question6part56, req.body.itopic1question6part57, req.body.itopic1question6part58, req.body.itopic1question6part59
                        ]
                    },
                    {
                        id: req.body.topic1question7,
                        numberOfParts: req.body.topic1question7numberOfParts,
                        content: req.body.topic1question7content,
                        parts:
                        [
                            req.body.itopic1question7part0, req.body.itopic1question7part1, req.body.itopic1question7part2, req.body.itopic1question7part3, req.body.itopic1question7part4, req.body.itopic1question7part5, req.body.itopic1question7part6, req.body.itopic1question7part7, req.body.itopic1question7part8, req.body.itopic1question7part9,
                            req.body.itopic1question7part10, req.body.itopic1question7part11, req.body.itopic1question7part12, req.body.itopic1question7part13, req.body.itopic1question7part14, req.body.itopic1question7part15, req.body.itopic1question7part16, req.body.itopic1question7part17, req.body.itopic1question7part18, req.body.itopic1question7part19,
                            req.body.itopic1question7part20, req.body.itopic1question7part21, req.body.itopic1question7part22, req.body.itopic1question7part23, req.body.itopic1question7part24, req.body.itopic1question7part25, req.body.itopic1question7part26, req.body.itopic1question7part27, req.body.itopic1question7part28, req.body.itopic1question7part29,
                            req.body.itopic1question7part30, req.body.itopic1question7part31, req.body.itopic1question7part32, req.body.itopic1question7part33, req.body.itopic1question7part34, req.body.itopic1question7part35, req.body.itopic1question7part36, req.body.itopic1question7part37, req.body.itopic1question7part38, req.body.itopic1question7part39,
                            req.body.itopic1question7part40, req.body.itopic1question7part41, req.body.itopic1question7part42, req.body.itopic1question7part43, req.body.itopic1question7part44, req.body.itopic1question7part45, req.body.itopic1question7part46, req.body.itopic1question7part47, req.body.itopic1question7part48, req.body.itopic1question7part49,
                            req.body.itopic1question7part50, req.body.itopic1question7part51, req.body.itopic1question7part52, req.body.itopic1question7part53, req.body.itopic1question7part54, req.body.itopic1question7part55, req.body.itopic1question7part56, req.body.itopic1question7part57, req.body.itopic1question7part58, req.body.itopic1question7part59
                        ]
                    },
                    {
                        id: req.body.topic1question8,
                        numberOfParts: req.body.topic1question8numberOfParts,
                        content: req.body.topic1question8content,
                        parts:
                        [
                            req.body.itopic1question8part0, req.body.itopic1question8part1, req.body.itopic1question8part2, req.body.itopic1question8part3, req.body.itopic1question8part4, req.body.itopic1question8part5, req.body.itopic1question8part6, req.body.itopic1question8part7, req.body.itopic1question8part8, req.body.itopic1question8part9,
                            req.body.itopic1question8part10, req.body.itopic1question8part11, req.body.itopic1question8part12, req.body.itopic1question8part13, req.body.itopic1question8part14, req.body.itopic1question8part15, req.body.itopic1question8part16, req.body.itopic1question8part17, req.body.itopic1question8part18, req.body.itopic1question8part19,
                            req.body.itopic1question8part20, req.body.itopic1question8part21, req.body.itopic1question8part22, req.body.itopic1question8part23, req.body.itopic1question8part24, req.body.itopic1question8part25, req.body.itopic1question8part26, req.body.itopic1question8part27, req.body.itopic1question8part28, req.body.itopic1question8part29,
                            req.body.itopic1question8part30, req.body.itopic1question8part31, req.body.itopic1question8part32, req.body.itopic1question8part33, req.body.itopic1question8part34, req.body.itopic1question8part35, req.body.itopic1question8part36, req.body.itopic1question8part37, req.body.itopic1question8part38, req.body.itopic1question8part39,
                            req.body.itopic1question8part40, req.body.itopic1question8part41, req.body.itopic1question8part42, req.body.itopic1question8part43, req.body.itopic1question8part44, req.body.itopic1question8part45, req.body.itopic1question8part46, req.body.itopic1question8part47, req.body.itopic1question8part48, req.body.itopic1question8part49,
                            req.body.itopic1question8part50, req.body.itopic1question8part51, req.body.itopic1question8part52, req.body.itopic1question8part53, req.body.itopic1question8part54, req.body.itopic1question8part55, req.body.itopic1question8part56, req.body.itopic1question8part57, req.body.itopic1question8part58, req.body.itopic1question8part59
                        ]
                    },
                    {
                        id: req.body.topic1question9,
                        numberOfParts: req.body.topic1question9numberOfParts,
                        content: req.body.topic1question9content,
                        parts:
                        [
                            req.body.itopic1question9part0, req.body.itopic1question9part1, req.body.itopic1question9part2, req.body.itopic1question9part3, req.body.itopic1question9part4, req.body.itopic1question9part5, req.body.itopic1question9part6, req.body.itopic1question9part7, req.body.itopic1question9part8, req.body.itopic1question9part9,
                            req.body.itopic1question9part10, req.body.itopic1question9part11, req.body.itopic1question9part12, req.body.itopic1question9part13, req.body.itopic1question9part14, req.body.itopic1question9part15, req.body.itopic1question9part16, req.body.itopic1question9part17, req.body.itopic1question9part18, req.body.itopic1question9part19,
                            req.body.itopic1question9part20, req.body.itopic1question9part21, req.body.itopic1question9part22, req.body.itopic1question9part23, req.body.itopic1question9part24, req.body.itopic1question9part25, req.body.itopic1question9part26, req.body.itopic1question9part27, req.body.itopic1question9part28, req.body.itopic1question9part29,
                            req.body.itopic1question9part30, req.body.itopic1question9part31, req.body.itopic1question9part32, req.body.itopic1question9part33, req.body.itopic1question9part34, req.body.itopic1question9part35, req.body.itopic1question9part36, req.body.itopic1question9part37, req.body.itopic1question9part38, req.body.itopic1question9part39,
                            req.body.itopic1question9part40, req.body.itopic1question9part41, req.body.itopic1question9part42, req.body.itopic1question9part43, req.body.itopic1question9part44, req.body.itopic1question9part45, req.body.itopic1question9part46, req.body.itopic1question9part47, req.body.itopic1question9part48, req.body.itopic1question9part49,
                            req.body.itopic1question9part50, req.body.itopic1question9part51, req.body.itopic1question9part52, req.body.itopic1question9part53, req.body.itopic1question9part54, req.body.itopic1question9part55, req.body.itopic1question9part56, req.body.itopic1question9part57, req.body.itopic1question9part58, req.body.itopic1question9part59
                        ]
                    },
                    {
                        id: req.body.topic1question10,
                        numberOfParts: req.body.topic1question10numberOfParts,
                        content: req.body.topic1question10content,
                        parts:
                        [
                            req.body.itopic1question10part0, req.body.itopic1question10part1, req.body.itopic1question10part2, req.body.itopic1question10part3, req.body.itopic1question10part4, req.body.itopic1question10part5, req.body.itopic1question10part6, req.body.itopic1question10part7, req.body.itopic1question10part8, req.body.itopic1question10part9,
                            req.body.itopic1question10part10, req.body.itopic1question10part11, req.body.itopic1question10part12, req.body.itopic1question10part13, req.body.itopic1question10part14, req.body.itopic1question10part15, req.body.itopic1question10part16, req.body.itopic1question10part17, req.body.itopic1question10part18, req.body.itopic1question10part19,
                            req.body.itopic1question10part20, req.body.itopic1question10part21, req.body.itopic1question10part22, req.body.itopic1question10part23, req.body.itopic1question10part24, req.body.itopic1question10part25, req.body.itopic1question10part26, req.body.itopic1question10part27, req.body.itopic1question10part28, req.body.itopic1question10part29,
                            req.body.itopic1question10part30, req.body.itopic1question10part31, req.body.itopic1question10part32, req.body.itopic1question10part33, req.body.itopic1question10part34, req.body.itopic1question10part35, req.body.itopic1question10part36, req.body.itopic1question10part37, req.body.itopic1question10part38, req.body.itopic1question10part39,
                            req.body.itopic1question10part40, req.body.itopic1question10part41, req.body.itopic1question10part42, req.body.itopic1question10part43, req.body.itopic1question10part44, req.body.itopic1question10part45, req.body.itopic1question10part46, req.body.itopic1question10part47, req.body.itopic1question10part48, req.body.itopic1question10part49,
                            req.body.itopic1question10part50, req.body.itopic1question10part51, req.body.itopic1question10part52, req.body.itopic1question10part53, req.body.itopic1question10part54, req.body.itopic1question10part55, req.body.itopic1question10part56, req.body.itopic1question10part57, req.body.itopic1question10part58, req.body.itopic1question10part59
                        ]
                    },
                    {
                        id: req.body.topic1question11,
                        numberOfParts: req.body.topic1question11numberOfParts,
                        content: req.body.topic1question11content,
                        parts:
                        [
                            req.body.itopic1question11part0, req.body.itopic1question11part1, req.body.itopic1question11part2, req.body.itopic1question11part3, req.body.itopic1question11part4, req.body.itopic1question11part5, req.body.itopic1question11part6, req.body.itopic1question11part7, req.body.itopic1question11part8, req.body.itopic1question11part9,
                            req.body.itopic1question11part10, req.body.itopic1question11part11, req.body.itopic1question11part12, req.body.itopic1question11part13, req.body.itopic1question11part14, req.body.itopic1question11part15, req.body.itopic1question11part16, req.body.itopic1question11part17, req.body.itopic1question11part18, req.body.itopic1question11part19,
                            req.body.itopic1question11part20, req.body.itopic1question11part21, req.body.itopic1question11part22, req.body.itopic1question11part23, req.body.itopic1question11part24, req.body.itopic1question11part25, req.body.itopic1question11part26, req.body.itopic1question11part27, req.body.itopic1question11part28, req.body.itopic1question11part29,
                            req.body.itopic1question11part30, req.body.itopic1question11part31, req.body.itopic1question11part32, req.body.itopic1question11part33, req.body.itopic1question11part34, req.body.itopic1question11part35, req.body.itopic1question11part36, req.body.itopic1question11part37, req.body.itopic1question11part38, req.body.itopic1question11part39,
                            req.body.itopic1question11part40, req.body.itopic1question11part41, req.body.itopic1question11part42, req.body.itopic1question11part43, req.body.itopic1question11part44, req.body.itopic1question11part45, req.body.itopic1question11part46, req.body.itopic1question11part47, req.body.itopic1question11part48, req.body.itopic1question11part49,
                            req.body.itopic1question11part50, req.body.itopic1question11part51, req.body.itopic1question11part52, req.body.itopic1question11part53, req.body.itopic1question11part54, req.body.itopic1question11part55, req.body.itopic1question11part56, req.body.itopic1question11part57, req.body.itopic1question11part58, req.body.itopic1question11part59
                        ]
                    },
                    {
                        id: req.body.topic1question12,
                        numberOfParts: req.body.topic1question12numberOfParts,
                        content: req.body.topic1question12content,
                        parts:
                        [
                            req.body.itopic1question12part0, req.body.itopic1question12part1, req.body.itopic1question12part2, req.body.itopic1question12part3, req.body.itopic1question12part4, req.body.itopic1question12part5, req.body.itopic1question12part6, req.body.itopic1question12part7, req.body.itopic1question12part8, req.body.itopic1question12part9,
                            req.body.itopic1question12part10, req.body.itopic1question12part11, req.body.itopic1question12part12, req.body.itopic1question12part13, req.body.itopic1question12part14, req.body.itopic1question12part15, req.body.itopic1question12part16, req.body.itopic1question12part17, req.body.itopic1question12part18, req.body.itopic1question12part19,
                            req.body.itopic1question12part20, req.body.itopic1question12part21, req.body.itopic1question12part22, req.body.itopic1question12part23, req.body.itopic1question12part24, req.body.itopic1question12part25, req.body.itopic1question12part26, req.body.itopic1question12part27, req.body.itopic1question12part28, req.body.itopic1question12part29,
                            req.body.itopic1question12part30, req.body.itopic1question12part31, req.body.itopic1question12part32, req.body.itopic1question12part33, req.body.itopic1question12part34, req.body.itopic1question12part35, req.body.itopic1question12part36, req.body.itopic1question12part37, req.body.itopic1question12part38, req.body.itopic1question12part39,
                            req.body.itopic1question12part40, req.body.itopic1question12part41, req.body.itopic1question12part42, req.body.itopic1question12part43, req.body.itopic1question12part44, req.body.itopic1question12part45, req.body.itopic1question12part46, req.body.itopic1question12part47, req.body.itopic1question12part48, req.body.itopic1question12part49,
                            req.body.itopic1question12part50, req.body.itopic1question12part51, req.body.itopic1question12part52, req.body.itopic1question12part53, req.body.itopic1question12part54, req.body.itopic1question12part55, req.body.itopic1question12part56, req.body.itopic1question12part57, req.body.itopic1question12part58, req.body.itopic1question12part59
                        ]
                    },
                    {
                        id: req.body.topic1question13,
                        numberOfParts: req.body.topic1question13numberOfParts,
                        content: req.body.topic1question13content,
                        parts:
                        [
                            req.body.itopic1question13part0, req.body.itopic1question13part1, req.body.itopic1question13part2, req.body.itopic1question13part3, req.body.itopic1question13part4, req.body.itopic1question13part5, req.body.itopic1question13part6, req.body.itopic1question13part7, req.body.itopic1question13part8, req.body.itopic1question13part9,
                            req.body.itopic1question13part10, req.body.itopic1question13part11, req.body.itopic1question13part12, req.body.itopic1question13part13, req.body.itopic1question13part14, req.body.itopic1question13part15, req.body.itopic1question13part16, req.body.itopic1question13part17, req.body.itopic1question13part18, req.body.itopic1question13part19,
                            req.body.itopic1question13part20, req.body.itopic1question13part21, req.body.itopic1question13part22, req.body.itopic1question13part23, req.body.itopic1question13part24, req.body.itopic1question13part25, req.body.itopic1question13part26, req.body.itopic1question13part27, req.body.itopic1question13part28, req.body.itopic1question13part29,
                            req.body.itopic1question13part30, req.body.itopic1question13part31, req.body.itopic1question13part32, req.body.itopic1question13part33, req.body.itopic1question13part34, req.body.itopic1question13part35, req.body.itopic1question13part36, req.body.itopic1question13part37, req.body.itopic1question13part38, req.body.itopic1question13part39,
                            req.body.itopic1question13part40, req.body.itopic1question13part41, req.body.itopic1question13part42, req.body.itopic1question13part43, req.body.itopic1question13part44, req.body.itopic1question13part45, req.body.itopic1question13part46, req.body.itopic1question13part47, req.body.itopic1question13part48, req.body.itopic1question13part49,
                            req.body.itopic1question13part50, req.body.itopic1question13part51, req.body.itopic1question13part52, req.body.itopic1question13part53, req.body.itopic1question13part54, req.body.itopic1question13part55, req.body.itopic1question13part56, req.body.itopic1question13part57, req.body.itopic1question13part58, req.body.itopic1question13part59
                        ]
                    },
                    {
                        id: req.body.topic1question14,
                        numberOfParts: req.body.topic1question14numberOfParts,
                        content: req.body.topic1question14content,
                        parts:
                        [
                            req.body.itopic1question14part0, req.body.itopic1question14part1, req.body.itopic1question14part2, req.body.itopic1question14part3, req.body.itopic1question14part4, req.body.itopic1question14part5, req.body.itopic1question14part6, req.body.itopic1question14part7, req.body.itopic1question14part8, req.body.itopic1question14part9,
                            req.body.itopic1question14part10, req.body.itopic1question14part11, req.body.itopic1question14part12, req.body.itopic1question14part13, req.body.itopic1question14part14, req.body.itopic1question14part15, req.body.itopic1question14part16, req.body.itopic1question14part17, req.body.itopic1question14part18, req.body.itopic1question14part19,
                            req.body.itopic1question14part20, req.body.itopic1question14part21, req.body.itopic1question14part22, req.body.itopic1question14part23, req.body.itopic1question14part24, req.body.itopic1question14part25, req.body.itopic1question14part26, req.body.itopic1question14part27, req.body.itopic1question14part28, req.body.itopic1question14part29,
                            req.body.itopic1question14part30, req.body.itopic1question14part31, req.body.itopic1question14part32, req.body.itopic1question14part33, req.body.itopic1question14part34, req.body.itopic1question14part35, req.body.itopic1question14part36, req.body.itopic1question14part37, req.body.itopic1question14part38, req.body.itopic1question14part39,
                            req.body.itopic1question14part40, req.body.itopic1question14part41, req.body.itopic1question14part42, req.body.itopic1question14part43, req.body.itopic1question14part44, req.body.itopic1question14part45, req.body.itopic1question14part46, req.body.itopic1question14part47, req.body.itopic1question14part48, req.body.itopic1question14part49,
                            req.body.itopic1question14part50, req.body.itopic1question14part51, req.body.itopic1question14part52, req.body.itopic1question14part53, req.body.itopic1question14part54, req.body.itopic1question14part55, req.body.itopic1question14part56, req.body.itopic1question14part57, req.body.itopic1question14part58, req.body.itopic1question14part59
                        ]
                    },
                    {
                        id: req.body.topic1question15,
                        numberOfParts: req.body.topic1question15numberOfParts,
                        content: req.body.topic1question15content,
                        parts:
                        [
                            req.body.itopic1question15part0, req.body.itopic1question15part1, req.body.itopic1question15part2, req.body.itopic1question15part3, req.body.itopic1question15part4, req.body.itopic1question15part5, req.body.itopic1question15part6, req.body.itopic1question15part7, req.body.itopic1question15part8, req.body.itopic1question15part9,
                            req.body.itopic1question15part10, req.body.itopic1question15part11, req.body.itopic1question15part12, req.body.itopic1question15part13, req.body.itopic1question15part14, req.body.itopic1question15part15, req.body.itopic1question15part16, req.body.itopic1question15part17, req.body.itopic1question15part18, req.body.itopic1question15part19,
                            req.body.itopic1question15part20, req.body.itopic1question15part21, req.body.itopic1question15part22, req.body.itopic1question15part23, req.body.itopic1question15part24, req.body.itopic1question15part25, req.body.itopic1question15part26, req.body.itopic1question15part27, req.body.itopic1question15part28, req.body.itopic1question15part29,
                            req.body.itopic1question15part30, req.body.itopic1question15part31, req.body.itopic1question15part32, req.body.itopic1question15part33, req.body.itopic1question15part34, req.body.itopic1question15part35, req.body.itopic1question15part36, req.body.itopic1question15part37, req.body.itopic1question15part38, req.body.itopic1question15part39,
                            req.body.itopic1question15part40, req.body.itopic1question15part41, req.body.itopic1question15part42, req.body.itopic1question15part43, req.body.itopic1question15part44, req.body.itopic1question15part45, req.body.itopic1question15part46, req.body.itopic1question15part47, req.body.itopic1question15part48, req.body.itopic1question15part49,
                            req.body.itopic1question15part50, req.body.itopic1question15part51, req.body.itopic1question15part52, req.body.itopic1question15part53, req.body.itopic1question15part54, req.body.itopic1question15part55, req.body.itopic1question15part56, req.body.itopic1question15part57, req.body.itopic1question15part58, req.body.itopic1question15part59
                        ]
                    },
                ]
            },
            {
                name: req.body.topic2,
                numberOfQuestions: req.body.topic2numberOfQuestions,
                percentageMark: 0,
                questions: [
                    {
                        id: req.body.topic2question0,
                        numberOfParts: req.body.topic2question0numberOfParts,
                        content: req.body.topic2question0content,
                        parts:
                        [
                            req.body.itopic2question0part0, req.body.itopic2question0part1, req.body.itopic2question0part2, req.body.itopic2question0part3, req.body.itopic2question0part4, req.body.itopic2question0part5, req.body.itopic2question0part6, req.body.itopic2question0part7, req.body.itopic2question0part8, req.body.itopic2question0part9,
                            req.body.itopic2question0part10, req.body.itopic2question0part11, req.body.itopic2question0part12, req.body.itopic2question0part13, req.body.itopic2question0part14, req.body.itopic2question0part15, req.body.itopic2question0part16, req.body.itopic2question0part17, req.body.itopic2question0part18, req.body.itopic2question0part19,
                            req.body.itopic2question0part20, req.body.itopic2question0part21, req.body.itopic2question0part22, req.body.itopic2question0part23, req.body.itopic2question0part24, req.body.itopic2question0part25, req.body.itopic2question0part26, req.body.itopic2question0part27, req.body.itopic2question0part28, req.body.itopic2question0part29,
                            req.body.itopic2question0part30, req.body.itopic2question0part31, req.body.itopic2question0part32, req.body.itopic2question0part33, req.body.itopic2question0part34, req.body.itopic2question0part35, req.body.itopic2question0part36, req.body.itopic2question0part37, req.body.itopic2question0part38, req.body.itopic2question0part39,
                            req.body.itopic2question0part40, req.body.itopic2question0part41, req.body.itopic2question0part42, req.body.itopic2question0part43, req.body.itopic2question0part44, req.body.itopic2question0part45, req.body.itopic2question0part46, req.body.itopic2question0part47, req.body.itopic2question0part48, req.body.itopic2question0part49,
                            req.body.itopic2question0part50, req.body.itopic2question0part51, req.body.itopic2question0part52, req.body.itopic2question0part53, req.body.itopic2question0part54, req.body.itopic2question0part55, req.body.itopic2question0part56, req.body.itopic2question0part57, req.body.itopic2question0part58, req.body.itopic2question0part59
                        ]
                    },
                    {
                        id: req.body.topic2question1,
                        numberOfParts: req.body.topic2question1numberOfParts,
                        content: req.body.topic2question1content,
                        parts:
                        [
                            req.body.itopic2question1part0, req.body.itopic2question1part1, req.body.itopic2question1part2, req.body.itopic2question1part3, req.body.itopic2question1part4, req.body.itopic2question1part5, req.body.itopic2question1part6, req.body.itopic2question1part7, req.body.itopic2question1part8, req.body.itopic2question1part9,
                            req.body.itopic2question1part10, req.body.itopic2question1part11, req.body.itopic2question1part12, req.body.itopic2question1part13, req.body.itopic2question1part14, req.body.itopic2question1part15, req.body.itopic2question1part16, req.body.itopic2question1part17, req.body.itopic2question1part18, req.body.itopic2question1part19,
                            req.body.itopic2question1part20, req.body.itopic2question1part21, req.body.itopic2question1part22, req.body.itopic2question1part23, req.body.itopic2question1part24, req.body.itopic2question1part25, req.body.itopic2question1part26, req.body.itopic2question1part27, req.body.itopic2question1part28, req.body.itopic2question1part29,
                            req.body.itopic2question1part30, req.body.itopic2question1part31, req.body.itopic2question1part32, req.body.itopic2question1part33, req.body.itopic2question1part34, req.body.itopic2question1part35, req.body.itopic2question1part36, req.body.itopic2question1part37, req.body.itopic2question1part38, req.body.itopic2question1part39,
                            req.body.itopic2question1part40, req.body.itopic2question1part41, req.body.itopic2question1part42, req.body.itopic2question1part43, req.body.itopic2question1part44, req.body.itopic2question1part45, req.body.itopic2question1part46, req.body.itopic2question1part47, req.body.itopic2question1part48, req.body.itopic2question1part49,
                            req.body.itopic2question1part50, req.body.itopic2question1part51, req.body.itopic2question1part52, req.body.itopic2question1part53, req.body.itopic2question1part54, req.body.itopic2question1part55, req.body.itopic2question1part56, req.body.itopic2question1part57, req.body.itopic2question1part58, req.body.itopic2question1part59
                        ]
                    },
                    {
                        id: req.body.topic2question2,
                        numberOfParts: req.body.topic2question2numberOfParts,
                        content: req.body.topic2question2content,
                        parts:
                        [
                            req.body.itopic2question2part0, req.body.itopic2question2part1, req.body.itopic2question2part2, req.body.itopic2question2part3, req.body.itopic2question2part4, req.body.itopic2question2part5, req.body.itopic2question2part6, req.body.itopic2question2part7, req.body.itopic2question2part8, req.body.itopic2question2part9,
                            req.body.itopic2question2part10, req.body.itopic2question2part11, req.body.itopic2question2part12, req.body.itopic2question2part13, req.body.itopic2question2part14, req.body.itopic2question2part15, req.body.itopic2question2part16, req.body.itopic2question2part17, req.body.itopic2question2part18, req.body.itopic2question2part19,
                            req.body.itopic2question2part20, req.body.itopic2question2part21, req.body.itopic2question2part22, req.body.itopic2question2part23, req.body.itopic2question2part24, req.body.itopic2question2part25, req.body.itopic2question2part26, req.body.itopic2question2part27, req.body.itopic2question2part28, req.body.itopic2question2part29,
                            req.body.itopic2question2part30, req.body.itopic2question2part31, req.body.itopic2question2part32, req.body.itopic2question2part33, req.body.itopic2question2part34, req.body.itopic2question2part35, req.body.itopic2question2part36, req.body.itopic2question2part37, req.body.itopic2question2part38, req.body.itopic2question2part39,
                            req.body.itopic2question2part40, req.body.itopic2question2part41, req.body.itopic2question2part42, req.body.itopic2question2part43, req.body.itopic2question2part44, req.body.itopic2question2part45, req.body.itopic2question2part46, req.body.itopic2question2part47, req.body.itopic2question2part48, req.body.itopic2question2part49,
                            req.body.itopic2question2part50, req.body.itopic2question2part51, req.body.itopic2question2part52, req.body.itopic2question2part53, req.body.itopic2question2part54, req.body.itopic2question2part55, req.body.itopic2question2part56, req.body.itopic2question2part57, req.body.itopic2question2part58, req.body.itopic2question2part59
                        ]
                    },
                    {
                        id: req.body.topic2question3,
                        numberOfParts: req.body.topic2question3numberOfParts,
                        content: req.body.topic2question3content,
                        parts:
                        [
                            req.body.itopic2question3part0, req.body.itopic2question3part1, req.body.itopic2question3part2, req.body.itopic2question3part3, req.body.itopic2question3part4, req.body.itopic2question3part5, req.body.itopic2question3part6, req.body.itopic2question3part7, req.body.itopic2question3part8, req.body.itopic2question3part9,
                            req.body.itopic2question3part10, req.body.itopic2question3part11, req.body.itopic2question3part12, req.body.itopic2question3part13, req.body.itopic2question3part14, req.body.itopic2question3part15, req.body.itopic2question3part16, req.body.itopic2question3part17, req.body.itopic2question3part18, req.body.itopic2question3part19,
                            req.body.itopic2question3part20, req.body.itopic2question3part21, req.body.itopic2question3part22, req.body.itopic2question3part23, req.body.itopic2question3part24, req.body.itopic2question3part25, req.body.itopic2question3part26, req.body.itopic2question3part27, req.body.itopic2question3part28, req.body.itopic2question3part29,
                            req.body.itopic2question3part30, req.body.itopic2question3part31, req.body.itopic2question3part32, req.body.itopic2question3part33, req.body.itopic2question3part34, req.body.itopic2question3part35, req.body.itopic2question3part36, req.body.itopic2question3part37, req.body.itopic2question3part38, req.body.itopic2question3part39,
                            req.body.itopic2question3part40, req.body.itopic2question3part41, req.body.itopic2question3part42, req.body.itopic2question3part43, req.body.itopic2question3part44, req.body.itopic2question3part45, req.body.itopic2question3part46, req.body.itopic2question3part47, req.body.itopic2question3part48, req.body.itopic2question3part49,
                            req.body.itopic2question3part50, req.body.itopic2question3part51, req.body.itopic2question3part52, req.body.itopic2question3part53, req.body.itopic2question3part54, req.body.itopic2question3part55, req.body.itopic2question3part56, req.body.itopic2question3part57, req.body.itopic2question3part58, req.body.itopic2question3part59
                        ]
                    },
                    {
                        id: req.body.topic2question4,
                        numberOfParts: req.body.topic2question4numberOfParts,
                        content: req.body.topic2question4content,
                        parts:
                        [
                            req.body.itopic2question4part0, req.body.itopic2question4part1, req.body.itopic2question4part2, req.body.itopic2question4part3, req.body.itopic2question4part4, req.body.itopic2question4part5, req.body.itopic2question4part6, req.body.itopic2question4part7, req.body.itopic2question4part8, req.body.itopic2question4part9,
                            req.body.itopic2question4part10, req.body.itopic2question4part11, req.body.itopic2question4part12, req.body.itopic2question4part13, req.body.itopic2question4part14, req.body.itopic2question4part15, req.body.itopic2question4part16, req.body.itopic2question4part17, req.body.itopic2question4part18, req.body.itopic2question4part19,
                            req.body.itopic2question4part20, req.body.itopic2question4part21, req.body.itopic2question4part22, req.body.itopic2question4part23, req.body.itopic2question4part24, req.body.itopic2question4part25, req.body.itopic2question4part26, req.body.itopic2question4part27, req.body.itopic2question4part28, req.body.itopic2question4part29,
                            req.body.itopic2question4part30, req.body.itopic2question4part31, req.body.itopic2question4part32, req.body.itopic2question4part33, req.body.itopic2question4part34, req.body.itopic2question4part35, req.body.itopic2question4part36, req.body.itopic2question4part37, req.body.itopic2question4part38, req.body.itopic2question4part39,
                            req.body.itopic2question4part40, req.body.itopic2question4part41, req.body.itopic2question4part42, req.body.itopic2question4part43, req.body.itopic2question4part44, req.body.itopic2question4part45, req.body.itopic2question4part46, req.body.itopic2question4part47, req.body.itopic2question4part48, req.body.itopic2question4part49,
                            req.body.itopic2question4part50, req.body.itopic2question4part51, req.body.itopic2question4part52, req.body.itopic2question4part53, req.body.itopic2question4part54, req.body.itopic2question4part55, req.body.itopic2question4part56, req.body.itopic2question4part57, req.body.itopic2question4part58, req.body.itopic2question4part59
                        ]
                    },
                    {
                        id: req.body.topic2question5,
                        numberOfParts: req.body.topic2question5numberOfParts,
                        content: req.body.topic2question5content,
                        parts:
                        [
                            req.body.itopic2question5part0, req.body.itopic2question5part1, req.body.itopic2question5part2, req.body.itopic2question5part3, req.body.itopic2question5part4, req.body.itopic2question5part5, req.body.itopic2question5part6, req.body.itopic2question5part7, req.body.itopic2question5part8, req.body.itopic2question5part9,
                            req.body.itopic2question5part10, req.body.itopic2question5part11, req.body.itopic2question5part12, req.body.itopic2question5part13, req.body.itopic2question5part14, req.body.itopic2question5part15, req.body.itopic2question5part16, req.body.itopic2question5part17, req.body.itopic2question5part18, req.body.itopic2question5part19,
                            req.body.itopic2question5part20, req.body.itopic2question5part21, req.body.itopic2question5part22, req.body.itopic2question5part23, req.body.itopic2question5part24, req.body.itopic2question5part25, req.body.itopic2question5part26, req.body.itopic2question5part27, req.body.itopic2question5part28, req.body.itopic2question5part29,
                            req.body.itopic2question5part30, req.body.itopic2question5part31, req.body.itopic2question5part32, req.body.itopic2question5part33, req.body.itopic2question5part34, req.body.itopic2question5part35, req.body.itopic2question5part36, req.body.itopic2question5part37, req.body.itopic2question5part38, req.body.itopic2question5part39,
                            req.body.itopic2question5part40, req.body.itopic2question5part41, req.body.itopic2question5part42, req.body.itopic2question5part43, req.body.itopic2question5part44, req.body.itopic2question5part45, req.body.itopic2question5part46, req.body.itopic2question5part47, req.body.itopic2question5part48, req.body.itopic2question5part49,
                            req.body.itopic2question5part50, req.body.itopic2question5part51, req.body.itopic2question5part52, req.body.itopic2question5part53, req.body.itopic2question5part54, req.body.itopic2question5part55, req.body.itopic2question5part56, req.body.itopic2question5part57, req.body.itopic2question5part58, req.body.itopic2question5part59
                        ]
                    },
                    {
                        id: req.body.topic2question6,
                        numberOfParts: req.body.topic2question6numberOfParts,
                        content: req.body.topic2question6content,
                        parts:
                        [
                            req.body.itopic2question6part0, req.body.itopic2question6part1, req.body.itopic2question6part2, req.body.itopic2question6part3, req.body.itopic2question6part4, req.body.itopic2question6part5, req.body.itopic2question6part6, req.body.itopic2question6part7, req.body.itopic2question6part8, req.body.itopic2question6part9,
                            req.body.itopic2question6part10, req.body.itopic2question6part11, req.body.itopic2question6part12, req.body.itopic2question6part13, req.body.itopic2question6part14, req.body.itopic2question6part15, req.body.itopic2question6part16, req.body.itopic2question6part17, req.body.itopic2question6part18, req.body.itopic2question6part19,
                            req.body.itopic2question6part20, req.body.itopic2question6part21, req.body.itopic2question6part22, req.body.itopic2question6part23, req.body.itopic2question6part24, req.body.itopic2question6part25, req.body.itopic2question6part26, req.body.itopic2question6part27, req.body.itopic2question6part28, req.body.itopic2question6part29,
                            req.body.itopic2question6part30, req.body.itopic2question6part31, req.body.itopic2question6part32, req.body.itopic2question6part33, req.body.itopic2question6part34, req.body.itopic2question6part35, req.body.itopic2question6part36, req.body.itopic2question6part37, req.body.itopic2question6part38, req.body.itopic2question6part39,
                            req.body.itopic2question6part40, req.body.itopic2question6part41, req.body.itopic2question6part42, req.body.itopic2question6part43, req.body.itopic2question6part44, req.body.itopic2question6part45, req.body.itopic2question6part46, req.body.itopic2question6part47, req.body.itopic2question6part48, req.body.itopic2question6part49,
                            req.body.itopic2question6part50, req.body.itopic2question6part51, req.body.itopic2question6part52, req.body.itopic2question6part53, req.body.itopic2question6part54, req.body.itopic2question6part55, req.body.itopic2question6part56, req.body.itopic2question6part57, req.body.itopic2question6part58, req.body.itopic2question6part59
                        ]
                    },
                    {
                        id: req.body.topic2question7,
                        numberOfParts: req.body.topic2question7numberOfParts,
                        content: req.body.topic2question7content,
                        parts:
                        [
                            req.body.itopic2question7part0, req.body.itopic2question7part1, req.body.itopic2question7part2, req.body.itopic2question7part3, req.body.itopic2question7part4, req.body.itopic2question7part5, req.body.itopic2question7part6, req.body.itopic2question7part7, req.body.itopic2question7part8, req.body.itopic2question7part9,
                            req.body.itopic2question7part10, req.body.itopic2question7part11, req.body.itopic2question7part12, req.body.itopic2question7part13, req.body.itopic2question7part14, req.body.itopic2question7part15, req.body.itopic2question7part16, req.body.itopic2question7part17, req.body.itopic2question7part18, req.body.itopic2question7part19,
                            req.body.itopic2question7part20, req.body.itopic2question7part21, req.body.itopic2question7part22, req.body.itopic2question7part23, req.body.itopic2question7part24, req.body.itopic2question7part25, req.body.itopic2question7part26, req.body.itopic2question7part27, req.body.itopic2question7part28, req.body.itopic2question7part29,
                            req.body.itopic2question7part30, req.body.itopic2question7part31, req.body.itopic2question7part32, req.body.itopic2question7part33, req.body.itopic2question7part34, req.body.itopic2question7part35, req.body.itopic2question7part36, req.body.itopic2question7part37, req.body.itopic2question7part38, req.body.itopic2question7part39,
                            req.body.itopic2question7part40, req.body.itopic2question7part41, req.body.itopic2question7part42, req.body.itopic2question7part43, req.body.itopic2question7part44, req.body.itopic2question7part45, req.body.itopic2question7part46, req.body.itopic2question7part47, req.body.itopic2question7part48, req.body.itopic2question7part49,
                            req.body.itopic2question7part50, req.body.itopic2question7part51, req.body.itopic2question7part52, req.body.itopic2question7part53, req.body.itopic2question7part54, req.body.itopic2question7part55, req.body.itopic2question7part56, req.body.itopic2question7part57, req.body.itopic2question7part58, req.body.itopic2question7part59
                        ]
                    },
                    {
                        id: req.body.topic2question8,
                        numberOfParts: req.body.topic2question8numberOfParts,
                        content: req.body.topic2question8content,
                        parts:
                        [
                            req.body.itopic2question8part0, req.body.itopic2question8part1, req.body.itopic2question8part2, req.body.itopic2question8part3, req.body.itopic2question8part4, req.body.itopic2question8part5, req.body.itopic2question8part6, req.body.itopic2question8part7, req.body.itopic2question8part8, req.body.itopic2question8part9,
                            req.body.itopic2question8part10, req.body.itopic2question8part11, req.body.itopic2question8part12, req.body.itopic2question8part13, req.body.itopic2question8part14, req.body.itopic2question8part15, req.body.itopic2question8part16, req.body.itopic2question8part17, req.body.itopic2question8part18, req.body.itopic2question8part19,
                            req.body.itopic2question8part20, req.body.itopic2question8part21, req.body.itopic2question8part22, req.body.itopic2question8part23, req.body.itopic2question8part24, req.body.itopic2question8part25, req.body.itopic2question8part26, req.body.itopic2question8part27, req.body.itopic2question8part28, req.body.itopic2question8part29,
                            req.body.itopic2question8part30, req.body.itopic2question8part31, req.body.itopic2question8part32, req.body.itopic2question8part33, req.body.itopic2question8part34, req.body.itopic2question8part35, req.body.itopic2question8part36, req.body.itopic2question8part37, req.body.itopic2question8part38, req.body.itopic2question8part39,
                            req.body.itopic2question8part40, req.body.itopic2question8part41, req.body.itopic2question8part42, req.body.itopic2question8part43, req.body.itopic2question8part44, req.body.itopic2question8part45, req.body.itopic2question8part46, req.body.itopic2question8part47, req.body.itopic2question8part48, req.body.itopic2question8part49,
                            req.body.itopic2question8part50, req.body.itopic2question8part51, req.body.itopic2question8part52, req.body.itopic2question8part53, req.body.itopic2question8part54, req.body.itopic2question8part55, req.body.itopic2question8part56, req.body.itopic2question8part57, req.body.itopic2question8part58, req.body.itopic2question8part59
                        ]
                    },
                    {
                        id: req.body.topic2question9,
                        numberOfParts: req.body.topic2question9numberOfParts,
                        content: req.body.topic2question9content,
                        parts:
                        [
                            req.body.itopic2question9part0, req.body.itopic2question9part1, req.body.itopic2question9part2, req.body.itopic2question9part3, req.body.itopic2question9part4, req.body.itopic2question9part5, req.body.itopic2question9part6, req.body.itopic2question9part7, req.body.itopic2question9part8, req.body.itopic2question9part9,
                            req.body.itopic2question9part10, req.body.itopic2question9part11, req.body.itopic2question9part12, req.body.itopic2question9part13, req.body.itopic2question9part14, req.body.itopic2question9part15, req.body.itopic2question9part16, req.body.itopic2question9part17, req.body.itopic2question9part18, req.body.itopic2question9part19,
                            req.body.itopic2question9part20, req.body.itopic2question9part21, req.body.itopic2question9part22, req.body.itopic2question9part23, req.body.itopic2question9part24, req.body.itopic2question9part25, req.body.itopic2question9part26, req.body.itopic2question9part27, req.body.itopic2question9part28, req.body.itopic2question9part29,
                            req.body.itopic2question9part30, req.body.itopic2question9part31, req.body.itopic2question9part32, req.body.itopic2question9part33, req.body.itopic2question9part34, req.body.itopic2question9part35, req.body.itopic2question9part36, req.body.itopic2question9part37, req.body.itopic2question9part38, req.body.itopic2question9part39,
                            req.body.itopic2question9part40, req.body.itopic2question9part41, req.body.itopic2question9part42, req.body.itopic2question9part43, req.body.itopic2question9part44, req.body.itopic2question9part45, req.body.itopic2question9part46, req.body.itopic2question9part47, req.body.itopic2question9part48, req.body.itopic2question9part49,
                            req.body.itopic2question9part50, req.body.itopic2question9part51, req.body.itopic2question9part52, req.body.itopic2question9part53, req.body.itopic2question9part54, req.body.itopic2question9part55, req.body.itopic2question9part56, req.body.itopic2question9part57, req.body.itopic2question9part58, req.body.itopic2question9part59
                        ]
                    },
                    {
                        id: req.body.topic2question10,
                        numberOfParts: req.body.topic2question10numberOfParts,
                        content: req.body.topic2question10content,
                        parts:
                        [
                            req.body.itopic2question10part0, req.body.itopic2question10part1, req.body.itopic2question10part2, req.body.itopic2question10part3, req.body.itopic2question10part4, req.body.itopic2question10part5, req.body.itopic2question10part6, req.body.itopic2question10part7, req.body.itopic2question10part8, req.body.itopic2question10part9,
                            req.body.itopic2question10part10, req.body.itopic2question10part11, req.body.itopic2question10part12, req.body.itopic2question10part13, req.body.itopic2question10part14, req.body.itopic2question10part15, req.body.itopic2question10part16, req.body.itopic2question10part17, req.body.itopic2question10part18, req.body.itopic2question10part19,
                            req.body.itopic2question10part20, req.body.itopic2question10part21, req.body.itopic2question10part22, req.body.itopic2question10part23, req.body.itopic2question10part24, req.body.itopic2question10part25, req.body.itopic2question10part26, req.body.itopic2question10part27, req.body.itopic2question10part28, req.body.itopic2question10part29,
                            req.body.itopic2question10part30, req.body.itopic2question10part31, req.body.itopic2question10part32, req.body.itopic2question10part33, req.body.itopic2question10part34, req.body.itopic2question10part35, req.body.itopic2question10part36, req.body.itopic2question10part37, req.body.itopic2question10part38, req.body.itopic2question10part39,
                            req.body.itopic2question10part40, req.body.itopic2question10part41, req.body.itopic2question10part42, req.body.itopic2question10part43, req.body.itopic2question10part44, req.body.itopic2question10part45, req.body.itopic2question10part46, req.body.itopic2question10part47, req.body.itopic2question10part48, req.body.itopic2question10part49,
                            req.body.itopic2question10part50, req.body.itopic2question10part51, req.body.itopic2question10part52, req.body.itopic2question10part53, req.body.itopic2question10part54, req.body.itopic2question10part55, req.body.itopic2question10part56, req.body.itopic2question10part57, req.body.itopic2question10part58, req.body.itopic2question10part59
                        ]
                    },
                    {
                        id: req.body.topic2question11,
                        numberOfParts: req.body.topic2question11numberOfParts,
                        content: req.body.topic2question11content,
                        parts:
                        [
                            req.body.itopic2question11part0, req.body.itopic2question11part1, req.body.itopic2question11part2, req.body.itopic2question11part3, req.body.itopic2question11part4, req.body.itopic2question11part5, req.body.itopic2question11part6, req.body.itopic2question11part7, req.body.itopic2question11part8, req.body.itopic2question11part9,
                            req.body.itopic2question11part10, req.body.itopic2question11part11, req.body.itopic2question11part12, req.body.itopic2question11part13, req.body.itopic2question11part14, req.body.itopic2question11part15, req.body.itopic2question11part16, req.body.itopic2question11part17, req.body.itopic2question11part18, req.body.itopic2question11part19,
                            req.body.itopic2question11part20, req.body.itopic2question11part21, req.body.itopic2question11part22, req.body.itopic2question11part23, req.body.itopic2question11part24, req.body.itopic2question11part25, req.body.itopic2question11part26, req.body.itopic2question11part27, req.body.itopic2question11part28, req.body.itopic2question11part29,
                            req.body.itopic2question11part30, req.body.itopic2question11part31, req.body.itopic2question11part32, req.body.itopic2question11part33, req.body.itopic2question11part34, req.body.itopic2question11part35, req.body.itopic2question11part36, req.body.itopic2question11part37, req.body.itopic2question11part38, req.body.itopic2question11part39,
                            req.body.itopic2question11part40, req.body.itopic2question11part41, req.body.itopic2question11part42, req.body.itopic2question11part43, req.body.itopic2question11part44, req.body.itopic2question11part45, req.body.itopic2question11part46, req.body.itopic2question11part47, req.body.itopic2question11part48, req.body.itopic2question11part49,
                            req.body.itopic2question11part50, req.body.itopic2question11part51, req.body.itopic2question11part52, req.body.itopic2question11part53, req.body.itopic2question11part54, req.body.itopic2question11part55, req.body.itopic2question11part56, req.body.itopic2question11part57, req.body.itopic2question11part58, req.body.itopic2question11part59
                        ]
                    },
                    {
                        id: req.body.topic2question12,
                        numberOfParts: req.body.topic2question12numberOfParts,
                        content: req.body.topic2question12content,
                        parts:
                        [
                            req.body.itopic2question12part0, req.body.itopic2question12part1, req.body.itopic2question12part2, req.body.itopic2question12part3, req.body.itopic2question12part4, req.body.itopic2question12part5, req.body.itopic2question12part6, req.body.itopic2question12part7, req.body.itopic2question12part8, req.body.itopic2question12part9,
                            req.body.itopic2question12part10, req.body.itopic2question12part11, req.body.itopic2question12part12, req.body.itopic2question12part13, req.body.itopic2question12part14, req.body.itopic2question12part15, req.body.itopic2question12part16, req.body.itopic2question12part17, req.body.itopic2question12part18, req.body.itopic2question12part19,
                            req.body.itopic2question12part20, req.body.itopic2question12part21, req.body.itopic2question12part22, req.body.itopic2question12part23, req.body.itopic2question12part24, req.body.itopic2question12part25, req.body.itopic2question12part26, req.body.itopic2question12part27, req.body.itopic2question12part28, req.body.itopic2question12part29,
                            req.body.itopic2question12part30, req.body.itopic2question12part31, req.body.itopic2question12part32, req.body.itopic2question12part33, req.body.itopic2question12part34, req.body.itopic2question12part35, req.body.itopic2question12part36, req.body.itopic2question12part37, req.body.itopic2question12part38, req.body.itopic2question12part39,
                            req.body.itopic2question12part40, req.body.itopic2question12part41, req.body.itopic2question12part42, req.body.itopic2question12part43, req.body.itopic2question12part44, req.body.itopic2question12part45, req.body.itopic2question12part46, req.body.itopic2question12part47, req.body.itopic2question12part48, req.body.itopic2question12part49,
                            req.body.itopic2question12part50, req.body.itopic2question12part51, req.body.itopic2question12part52, req.body.itopic2question12part53, req.body.itopic2question12part54, req.body.itopic2question12part55, req.body.itopic2question12part56, req.body.itopic2question12part57, req.body.itopic2question12part58, req.body.itopic2question12part59
                        ]
                    },
                    {
                        id: req.body.topic2question13,
                        numberOfParts: req.body.topic2question13numberOfParts,
                        content: req.body.topic2question13content,
                        parts:
                        [
                            req.body.itopic2question13part0, req.body.itopic2question13part1, req.body.itopic2question13part2, req.body.itopic2question13part3, req.body.itopic2question13part4, req.body.itopic2question13part5, req.body.itopic2question13part6, req.body.itopic2question13part7, req.body.itopic2question13part8, req.body.itopic2question13part9,
                            req.body.itopic2question13part10, req.body.itopic2question13part11, req.body.itopic2question13part12, req.body.itopic2question13part13, req.body.itopic2question13part14, req.body.itopic2question13part15, req.body.itopic2question13part16, req.body.itopic2question13part17, req.body.itopic2question13part18, req.body.itopic2question13part19,
                            req.body.itopic2question13part20, req.body.itopic2question13part21, req.body.itopic2question13part22, req.body.itopic2question13part23, req.body.itopic2question13part24, req.body.itopic2question13part25, req.body.itopic2question13part26, req.body.itopic2question13part27, req.body.itopic2question13part28, req.body.itopic2question13part29,
                            req.body.itopic2question13part30, req.body.itopic2question13part31, req.body.itopic2question13part32, req.body.itopic2question13part33, req.body.itopic2question13part34, req.body.itopic2question13part35, req.body.itopic2question13part36, req.body.itopic2question13part37, req.body.itopic2question13part38, req.body.itopic2question13part39,
                            req.body.itopic2question13part40, req.body.itopic2question13part41, req.body.itopic2question13part42, req.body.itopic2question13part43, req.body.itopic2question13part44, req.body.itopic2question13part45, req.body.itopic2question13part46, req.body.itopic2question13part47, req.body.itopic2question13part48, req.body.itopic2question13part49,
                            req.body.itopic2question13part50, req.body.itopic2question13part51, req.body.itopic2question13part52, req.body.itopic2question13part53, req.body.itopic2question13part54, req.body.itopic2question13part55, req.body.itopic2question13part56, req.body.itopic2question13part57, req.body.itopic2question13part58, req.body.itopic2question13part59
                        ]
                    },
                    {
                        id: req.body.topic2question14,
                        numberOfParts: req.body.topic2question14numberOfParts,
                        content: req.body.topic2question14content,
                        parts:
                        [
                            req.body.itopic2question14part0, req.body.itopic2question14part1, req.body.itopic2question14part2, req.body.itopic2question14part3, req.body.itopic2question14part4, req.body.itopic2question14part5, req.body.itopic2question14part6, req.body.itopic2question14part7, req.body.itopic2question14part8, req.body.itopic2question14part9,
                            req.body.itopic2question14part10, req.body.itopic2question14part11, req.body.itopic2question14part12, req.body.itopic2question14part13, req.body.itopic2question14part14, req.body.itopic2question14part15, req.body.itopic2question14part16, req.body.itopic2question14part17, req.body.itopic2question14part18, req.body.itopic2question14part19,
                            req.body.itopic2question14part20, req.body.itopic2question14part21, req.body.itopic2question14part22, req.body.itopic2question14part23, req.body.itopic2question14part24, req.body.itopic2question14part25, req.body.itopic2question14part26, req.body.itopic2question14part27, req.body.itopic2question14part28, req.body.itopic2question14part29,
                            req.body.itopic2question14part30, req.body.itopic2question14part31, req.body.itopic2question14part32, req.body.itopic2question14part33, req.body.itopic2question14part34, req.body.itopic2question14part35, req.body.itopic2question14part36, req.body.itopic2question14part37, req.body.itopic2question14part38, req.body.itopic2question14part39,
                            req.body.itopic2question14part40, req.body.itopic2question14part41, req.body.itopic2question14part42, req.body.itopic2question14part43, req.body.itopic2question14part44, req.body.itopic2question14part45, req.body.itopic2question14part46, req.body.itopic2question14part47, req.body.itopic2question14part48, req.body.itopic2question14part49,
                            req.body.itopic2question14part50, req.body.itopic2question14part51, req.body.itopic2question14part52, req.body.itopic2question14part53, req.body.itopic2question14part54, req.body.itopic2question14part55, req.body.itopic2question14part56, req.body.itopic2question14part57, req.body.itopic2question14part58, req.body.itopic2question14part59
                        ]
                    },
                    {
                        id: req.body.topic2question15,
                        numberOfParts: req.body.topic2question15numberOfParts,
                        content: req.body.topic2question15content,
                        parts:
                        [
                            req.body.itopic2question15part0, req.body.itopic2question15part1, req.body.itopic2question15part2, req.body.itopic2question15part3, req.body.itopic2question15part4, req.body.itopic2question15part5, req.body.itopic2question15part6, req.body.itopic2question15part7, req.body.itopic2question15part8, req.body.itopic2question15part9,
                            req.body.itopic2question15part10, req.body.itopic2question15part11, req.body.itopic2question15part12, req.body.itopic2question15part13, req.body.itopic2question15part14, req.body.itopic2question15part15, req.body.itopic2question15part16, req.body.itopic2question15part17, req.body.itopic2question15part18, req.body.itopic2question15part19,
                            req.body.itopic2question15part20, req.body.itopic2question15part21, req.body.itopic2question15part22, req.body.itopic2question15part23, req.body.itopic2question15part24, req.body.itopic2question15part25, req.body.itopic2question15part26, req.body.itopic2question15part27, req.body.itopic2question15part28, req.body.itopic2question15part29,
                            req.body.itopic2question15part30, req.body.itopic2question15part31, req.body.itopic2question15part32, req.body.itopic2question15part33, req.body.itopic2question15part34, req.body.itopic2question15part35, req.body.itopic2question15part36, req.body.itopic2question15part37, req.body.itopic2question15part38, req.body.itopic2question15part39,
                            req.body.itopic2question15part40, req.body.itopic2question15part41, req.body.itopic2question15part42, req.body.itopic2question15part43, req.body.itopic2question15part44, req.body.itopic2question15part45, req.body.itopic2question15part46, req.body.itopic2question15part47, req.body.itopic2question15part48, req.body.itopic2question15part49,
                            req.body.itopic2question15part50, req.body.itopic2question15part51, req.body.itopic2question15part52, req.body.itopic2question15part53, req.body.itopic2question15part54, req.body.itopic2question15part55, req.body.itopic2question15part56, req.body.itopic2question15part57, req.body.itopic2question15part58, req.body.itopic2question15part59
                        ]
                    },
                ]
            },
            {
                name: req.body.topic3,
                numberOfQuestions: req.body.topic3numberOfQuestions,
                percentageMark: 0,
                questions: [
                    {
                        id: req.body.topic3question0,
                        numberOfParts: req.body.topic3question0numberOfParts,
                        content: req.body.topic3question0content,
                        parts:
                        [
                            req.body.itopic3question0part0, req.body.itopic3question0part1, req.body.itopic3question0part2, req.body.itopic3question0part3, req.body.itopic3question0part4, req.body.itopic3question0part5, req.body.itopic3question0part6, req.body.itopic3question0part7, req.body.itopic3question0part8, req.body.itopic3question0part9,
                            req.body.itopic3question0part10, req.body.itopic3question0part11, req.body.itopic3question0part12, req.body.itopic3question0part13, req.body.itopic3question0part14, req.body.itopic3question0part15, req.body.itopic3question0part16, req.body.itopic3question0part17, req.body.itopic3question0part18, req.body.itopic3question0part19,
                            req.body.itopic3question0part20, req.body.itopic3question0part21, req.body.itopic3question0part22, req.body.itopic3question0part23, req.body.itopic3question0part24, req.body.itopic3question0part25, req.body.itopic3question0part26, req.body.itopic3question0part27, req.body.itopic3question0part28, req.body.itopic3question0part29,
                            req.body.itopic3question0part30, req.body.itopic3question0part31, req.body.itopic3question0part32, req.body.itopic3question0part33, req.body.itopic3question0part34, req.body.itopic3question0part35, req.body.itopic3question0part36, req.body.itopic3question0part37, req.body.itopic3question0part38, req.body.itopic3question0part39,
                            req.body.itopic3question0part40, req.body.itopic3question0part41, req.body.itopic3question0part42, req.body.itopic3question0part43, req.body.itopic3question0part44, req.body.itopic3question0part45, req.body.itopic3question0part46, req.body.itopic3question0part47, req.body.itopic3question0part48, req.body.itopic3question0part49,
                            req.body.itopic3question0part50, req.body.itopic3question0part51, req.body.itopic3question0part52, req.body.itopic3question0part53, req.body.itopic3question0part54, req.body.itopic3question0part55, req.body.itopic3question0part56, req.body.itopic3question0part57, req.body.itopic3question0part58, req.body.itopic3question0part59
                        ]
                    },
                    {
                        id: req.body.topic3question1,
                        numberOfParts: req.body.topic3question1numberOfParts,
                        content: req.body.topic3question1content,
                        parts:
                        [
                            req.body.itopic3question1part0, req.body.itopic3question1part1, req.body.itopic3question1part2, req.body.itopic3question1part3, req.body.itopic3question1part4, req.body.itopic3question1part5, req.body.itopic3question1part6, req.body.itopic3question1part7, req.body.itopic3question1part8, req.body.itopic3question1part9,
                            req.body.itopic3question1part10, req.body.itopic3question1part11, req.body.itopic3question1part12, req.body.itopic3question1part13, req.body.itopic3question1part14, req.body.itopic3question1part15, req.body.itopic3question1part16, req.body.itopic3question1part17, req.body.itopic3question1part18, req.body.itopic3question1part19,
                            req.body.itopic3question1part20, req.body.itopic3question1part21, req.body.itopic3question1part22, req.body.itopic3question1part23, req.body.itopic3question1part24, req.body.itopic3question1part25, req.body.itopic3question1part26, req.body.itopic3question1part27, req.body.itopic3question1part28, req.body.itopic3question1part29,
                            req.body.itopic3question1part30, req.body.itopic3question1part31, req.body.itopic3question1part32, req.body.itopic3question1part33, req.body.itopic3question1part34, req.body.itopic3question1part35, req.body.itopic3question1part36, req.body.itopic3question1part37, req.body.itopic3question1part38, req.body.itopic3question1part39,
                            req.body.itopic3question1part40, req.body.itopic3question1part41, req.body.itopic3question1part42, req.body.itopic3question1part43, req.body.itopic3question1part44, req.body.itopic3question1part45, req.body.itopic3question1part46, req.body.itopic3question1part47, req.body.itopic3question1part48, req.body.itopic3question1part49,
                            req.body.itopic3question1part50, req.body.itopic3question1part51, req.body.itopic3question1part52, req.body.itopic3question1part53, req.body.itopic3question1part54, req.body.itopic3question1part55, req.body.itopic3question1part56, req.body.itopic3question1part57, req.body.itopic3question1part58, req.body.itopic3question1part59
                        ]
                    },
                    {
                        id: req.body.topic3question2,
                        numberOfParts: req.body.topic3question2numberOfParts,
                        content: req.body.topic3question2content,
                        parts:
                        [
                            req.body.itopic3question2part0, req.body.itopic3question2part1, req.body.itopic3question2part2, req.body.itopic3question2part3, req.body.itopic3question2part4, req.body.itopic3question2part5, req.body.itopic3question2part6, req.body.itopic3question2part7, req.body.itopic3question2part8, req.body.itopic3question2part9,
                            req.body.itopic3question2part10, req.body.itopic3question2part11, req.body.itopic3question2part12, req.body.itopic3question2part13, req.body.itopic3question2part14, req.body.itopic3question2part15, req.body.itopic3question2part16, req.body.itopic3question2part17, req.body.itopic3question2part18, req.body.itopic3question2part19,
                            req.body.itopic3question2part20, req.body.itopic3question2part21, req.body.itopic3question2part22, req.body.itopic3question2part23, req.body.itopic3question2part24, req.body.itopic3question2part25, req.body.itopic3question2part26, req.body.itopic3question2part27, req.body.itopic3question2part28, req.body.itopic3question2part29,
                            req.body.itopic3question2part30, req.body.itopic3question2part31, req.body.itopic3question2part32, req.body.itopic3question2part33, req.body.itopic3question2part34, req.body.itopic3question2part35, req.body.itopic3question2part36, req.body.itopic3question2part37, req.body.itopic3question2part38, req.body.itopic3question2part39,
                            req.body.itopic3question2part40, req.body.itopic3question2part41, req.body.itopic3question2part42, req.body.itopic3question2part43, req.body.itopic3question2part44, req.body.itopic3question2part45, req.body.itopic3question2part46, req.body.itopic3question2part47, req.body.itopic3question2part48, req.body.itopic3question2part49,
                            req.body.itopic3question2part50, req.body.itopic3question2part51, req.body.itopic3question2part52, req.body.itopic3question2part53, req.body.itopic3question2part54, req.body.itopic3question2part55, req.body.itopic3question2part56, req.body.itopic3question2part57, req.body.itopic3question2part58, req.body.itopic3question2part59
                        ]
                    },
                    {
                        id: req.body.topic3question3,
                        numberOfParts: req.body.topic3question3numberOfParts,
                        content: req.body.topic3question3content,
                        parts:
                        [
                            req.body.itopic3question3part0, req.body.itopic3question3part1, req.body.itopic3question3part2, req.body.itopic3question3part3, req.body.itopic3question3part4, req.body.itopic3question3part5, req.body.itopic3question3part6, req.body.itopic3question3part7, req.body.itopic3question3part8, req.body.itopic3question3part9,
                            req.body.itopic3question3part10, req.body.itopic3question3part11, req.body.itopic3question3part12, req.body.itopic3question3part13, req.body.itopic3question3part14, req.body.itopic3question3part15, req.body.itopic3question3part16, req.body.itopic3question3part17, req.body.itopic3question3part18, req.body.itopic3question3part19,
                            req.body.itopic3question3part20, req.body.itopic3question3part21, req.body.itopic3question3part22, req.body.itopic3question3part23, req.body.itopic3question3part24, req.body.itopic3question3part25, req.body.itopic3question3part26, req.body.itopic3question3part27, req.body.itopic3question3part28, req.body.itopic3question3part29,
                            req.body.itopic3question3part30, req.body.itopic3question3part31, req.body.itopic3question3part32, req.body.itopic3question3part33, req.body.itopic3question3part34, req.body.itopic3question3part35, req.body.itopic3question3part36, req.body.itopic3question3part37, req.body.itopic3question3part38, req.body.itopic3question3part39,
                            req.body.itopic3question3part40, req.body.itopic3question3part41, req.body.itopic3question3part42, req.body.itopic3question3part43, req.body.itopic3question3part44, req.body.itopic3question3part45, req.body.itopic3question3part46, req.body.itopic3question3part47, req.body.itopic3question3part48, req.body.itopic3question3part49,
                            req.body.itopic3question3part50, req.body.itopic3question3part51, req.body.itopic3question3part52, req.body.itopic3question3part53, req.body.itopic3question3part54, req.body.itopic3question3part55, req.body.itopic3question3part56, req.body.itopic3question3part57, req.body.itopic3question3part58, req.body.itopic3question3part59
                        ]
                    },
                    {
                        id: req.body.topic3question4,
                        numberOfParts: req.body.topic3question4numberOfParts,
                        content: req.body.topic3question4content,
                        parts:
                        [
                            req.body.itopic3question4part0, req.body.itopic3question4part1, req.body.itopic3question4part2, req.body.itopic3question4part3, req.body.itopic3question4part4, req.body.itopic3question4part5, req.body.itopic3question4part6, req.body.itopic3question4part7, req.body.itopic3question4part8, req.body.itopic3question4part9,
                            req.body.itopic3question4part10, req.body.itopic3question4part11, req.body.itopic3question4part12, req.body.itopic3question4part13, req.body.itopic3question4part14, req.body.itopic3question4part15, req.body.itopic3question4part16, req.body.itopic3question4part17, req.body.itopic3question4part18, req.body.itopic3question4part19,
                            req.body.itopic3question4part20, req.body.itopic3question4part21, req.body.itopic3question4part22, req.body.itopic3question4part23, req.body.itopic3question4part24, req.body.itopic3question4part25, req.body.itopic3question4part26, req.body.itopic3question4part27, req.body.itopic3question4part28, req.body.itopic3question4part29,
                            req.body.itopic3question4part30, req.body.itopic3question4part31, req.body.itopic3question4part32, req.body.itopic3question4part33, req.body.itopic3question4part34, req.body.itopic3question4part35, req.body.itopic3question4part36, req.body.itopic3question4part37, req.body.itopic3question4part38, req.body.itopic3question4part39,
                            req.body.itopic3question4part40, req.body.itopic3question4part41, req.body.itopic3question4part42, req.body.itopic3question4part43, req.body.itopic3question4part44, req.body.itopic3question4part45, req.body.itopic3question4part46, req.body.itopic3question4part47, req.body.itopic3question4part48, req.body.itopic3question4part49,
                            req.body.itopic3question4part50, req.body.itopic3question4part51, req.body.itopic3question4part52, req.body.itopic3question4part53, req.body.itopic3question4part54, req.body.itopic3question4part55, req.body.itopic3question4part56, req.body.itopic3question4part57, req.body.itopic3question4part58, req.body.itopic3question4part59
                        ]
                    },
                    {
                        id: req.body.topic3question5,
                        numberOfParts: req.body.topic3question5numberOfParts,
                        content: req.body.topic3question5content,
                        parts:
                        [
                            req.body.itopic3question5part0, req.body.itopic3question5part1, req.body.itopic3question5part2, req.body.itopic3question5part3, req.body.itopic3question5part4, req.body.itopic3question5part5, req.body.itopic3question5part6, req.body.itopic3question5part7, req.body.itopic3question5part8, req.body.itopic3question5part9,
                            req.body.itopic3question5part10, req.body.itopic3question5part11, req.body.itopic3question5part12, req.body.itopic3question5part13, req.body.itopic3question5part14, req.body.itopic3question5part15, req.body.itopic3question5part16, req.body.itopic3question5part17, req.body.itopic3question5part18, req.body.itopic3question5part19,
                            req.body.itopic3question5part20, req.body.itopic3question5part21, req.body.itopic3question5part22, req.body.itopic3question5part23, req.body.itopic3question5part24, req.body.itopic3question5part25, req.body.itopic3question5part26, req.body.itopic3question5part27, req.body.itopic3question5part28, req.body.itopic3question5part29,
                            req.body.itopic3question5part30, req.body.itopic3question5part31, req.body.itopic3question5part32, req.body.itopic3question5part33, req.body.itopic3question5part34, req.body.itopic3question5part35, req.body.itopic3question5part36, req.body.itopic3question5part37, req.body.itopic3question5part38, req.body.itopic3question5part39,
                            req.body.itopic3question5part40, req.body.itopic3question5part41, req.body.itopic3question5part42, req.body.itopic3question5part43, req.body.itopic3question5part44, req.body.itopic3question5part45, req.body.itopic3question5part46, req.body.itopic3question5part47, req.body.itopic3question5part48, req.body.itopic3question5part49,
                            req.body.itopic3question5part50, req.body.itopic3question5part51, req.body.itopic3question5part52, req.body.itopic3question5part53, req.body.itopic3question5part54, req.body.itopic3question5part55, req.body.itopic3question5part56, req.body.itopic3question5part57, req.body.itopic3question5part58, req.body.itopic3question5part59
                        ]
                    },
                    {
                        id: req.body.topic3question6,
                        numberOfParts: req.body.topic3question6numberOfParts,
                        content: req.body.topic3question6content,
                        parts:
                        [
                            req.body.itopic3question6part0, req.body.itopic3question6part1, req.body.itopic3question6part2, req.body.itopic3question6part3, req.body.itopic3question6part4, req.body.itopic3question6part5, req.body.itopic3question6part6, req.body.itopic3question6part7, req.body.itopic3question6part8, req.body.itopic3question6part9,
                            req.body.itopic3question6part10, req.body.itopic3question6part11, req.body.itopic3question6part12, req.body.itopic3question6part13, req.body.itopic3question6part14, req.body.itopic3question6part15, req.body.itopic3question6part16, req.body.itopic3question6part17, req.body.itopic3question6part18, req.body.itopic3question6part19,
                            req.body.itopic3question6part20, req.body.itopic3question6part21, req.body.itopic3question6part22, req.body.itopic3question6part23, req.body.itopic3question6part24, req.body.itopic3question6part25, req.body.itopic3question6part26, req.body.itopic3question6part27, req.body.itopic3question6part28, req.body.itopic3question6part29,
                            req.body.itopic3question6part30, req.body.itopic3question6part31, req.body.itopic3question6part32, req.body.itopic3question6part33, req.body.itopic3question6part34, req.body.itopic3question6part35, req.body.itopic3question6part36, req.body.itopic3question6part37, req.body.itopic3question6part38, req.body.itopic3question6part39,
                            req.body.itopic3question6part40, req.body.itopic3question6part41, req.body.itopic3question6part42, req.body.itopic3question6part43, req.body.itopic3question6part44, req.body.itopic3question6part45, req.body.itopic3question6part46, req.body.itopic3question6part47, req.body.itopic3question6part48, req.body.itopic3question6part49,
                            req.body.itopic3question6part50, req.body.itopic3question6part51, req.body.itopic3question6part52, req.body.itopic3question6part53, req.body.itopic3question6part54, req.body.itopic3question6part55, req.body.itopic3question6part56, req.body.itopic3question6part57, req.body.itopic3question6part58, req.body.itopic3question6part59
                        ]
                    },
                    {
                        id: req.body.topic3question7,
                        numberOfParts: req.body.topic3question7numberOfParts,
                        content: req.body.topic3question7content,
                        parts:
                        [
                            req.body.itopic3question7part0, req.body.itopic3question7part1, req.body.itopic3question7part2, req.body.itopic3question7part3, req.body.itopic3question7part4, req.body.itopic3question7part5, req.body.itopic3question7part6, req.body.itopic3question7part7, req.body.itopic3question7part8, req.body.itopic3question7part9,
                            req.body.itopic3question7part10, req.body.itopic3question7part11, req.body.itopic3question7part12, req.body.itopic3question7part13, req.body.itopic3question7part14, req.body.itopic3question7part15, req.body.itopic3question7part16, req.body.itopic3question7part17, req.body.itopic3question7part18, req.body.itopic3question7part19,
                            req.body.itopic3question7part20, req.body.itopic3question7part21, req.body.itopic3question7part22, req.body.itopic3question7part23, req.body.itopic3question7part24, req.body.itopic3question7part25, req.body.itopic3question7part26, req.body.itopic3question7part27, req.body.itopic3question7part28, req.body.itopic3question7part29,
                            req.body.itopic3question7part30, req.body.itopic3question7part31, req.body.itopic3question7part32, req.body.itopic3question7part33, req.body.itopic3question7part34, req.body.itopic3question7part35, req.body.itopic3question7part36, req.body.itopic3question7part37, req.body.itopic3question7part38, req.body.itopic3question7part39,
                            req.body.itopic3question7part40, req.body.itopic3question7part41, req.body.itopic3question7part42, req.body.itopic3question7part43, req.body.itopic3question7part44, req.body.itopic3question7part45, req.body.itopic3question7part46, req.body.itopic3question7part47, req.body.itopic3question7part48, req.body.itopic3question7part49,
                            req.body.itopic3question7part50, req.body.itopic3question7part51, req.body.itopic3question7part52, req.body.itopic3question7part53, req.body.itopic3question7part54, req.body.itopic3question7part55, req.body.itopic3question7part56, req.body.itopic3question7part57, req.body.itopic3question7part58, req.body.itopic3question7part59
                        ]
                    },
                    {
                        id: req.body.topic3question8,
                        numberOfParts: req.body.topic3question8numberOfParts,
                        content: req.body.topic3question8content,
                        parts:
                        [
                            req.body.itopic3question8part0, req.body.itopic3question8part1, req.body.itopic3question8part2, req.body.itopic3question8part3, req.body.itopic3question8part4, req.body.itopic3question8part5, req.body.itopic3question8part6, req.body.itopic3question8part7, req.body.itopic3question8part8, req.body.itopic3question8part9,
                            req.body.itopic3question8part10, req.body.itopic3question8part11, req.body.itopic3question8part12, req.body.itopic3question8part13, req.body.itopic3question8part14, req.body.itopic3question8part15, req.body.itopic3question8part16, req.body.itopic3question8part17, req.body.itopic3question8part18, req.body.itopic3question8part19,
                            req.body.itopic3question8part20, req.body.itopic3question8part21, req.body.itopic3question8part22, req.body.itopic3question8part23, req.body.itopic3question8part24, req.body.itopic3question8part25, req.body.itopic3question8part26, req.body.itopic3question8part27, req.body.itopic3question8part28, req.body.itopic3question8part29,
                            req.body.itopic3question8part30, req.body.itopic3question8part31, req.body.itopic3question8part32, req.body.itopic3question8part33, req.body.itopic3question8part34, req.body.itopic3question8part35, req.body.itopic3question8part36, req.body.itopic3question8part37, req.body.itopic3question8part38, req.body.itopic3question8part39,
                            req.body.itopic3question8part40, req.body.itopic3question8part41, req.body.itopic3question8part42, req.body.itopic3question8part43, req.body.itopic3question8part44, req.body.itopic3question8part45, req.body.itopic3question8part46, req.body.itopic3question8part47, req.body.itopic3question8part48, req.body.itopic3question8part49,
                            req.body.itopic3question8part50, req.body.itopic3question8part51, req.body.itopic3question8part52, req.body.itopic3question8part53, req.body.itopic3question8part54, req.body.itopic3question8part55, req.body.itopic3question8part56, req.body.itopic3question8part57, req.body.itopic3question8part58, req.body.itopic3question8part59
                        ]
                    },
                    {
                        id: req.body.topic3question9,
                        numberOfParts: req.body.topic3question9numberOfParts,
                        content: req.body.topic3question9content,
                        parts:
                        [
                            req.body.itopic3question9part0, req.body.itopic3question9part1, req.body.itopic3question9part2, req.body.itopic3question9part3, req.body.itopic3question9part4, req.body.itopic3question9part5, req.body.itopic3question9part6, req.body.itopic3question9part7, req.body.itopic3question9part8, req.body.itopic3question9part9,
                            req.body.itopic3question9part10, req.body.itopic3question9part11, req.body.itopic3question9part12, req.body.itopic3question9part13, req.body.itopic3question9part14, req.body.itopic3question9part15, req.body.itopic3question9part16, req.body.itopic3question9part17, req.body.itopic3question9part18, req.body.itopic3question9part19,
                            req.body.itopic3question9part20, req.body.itopic3question9part21, req.body.itopic3question9part22, req.body.itopic3question9part23, req.body.itopic3question9part24, req.body.itopic3question9part25, req.body.itopic3question9part26, req.body.itopic3question9part27, req.body.itopic3question9part28, req.body.itopic3question9part29,
                            req.body.itopic3question9part30, req.body.itopic3question9part31, req.body.itopic3question9part32, req.body.itopic3question9part33, req.body.itopic3question9part34, req.body.itopic3question9part35, req.body.itopic3question9part36, req.body.itopic3question9part37, req.body.itopic3question9part38, req.body.itopic3question9part39,
                            req.body.itopic3question9part40, req.body.itopic3question9part41, req.body.itopic3question9part42, req.body.itopic3question9part43, req.body.itopic3question9part44, req.body.itopic3question9part45, req.body.itopic3question9part46, req.body.itopic3question9part47, req.body.itopic3question9part48, req.body.itopic3question9part49,
                            req.body.itopic3question9part50, req.body.itopic3question9part51, req.body.itopic3question9part52, req.body.itopic3question9part53, req.body.itopic3question9part54, req.body.itopic3question9part55, req.body.itopic3question9part56, req.body.itopic3question9part57, req.body.itopic3question9part58, req.body.itopic3question9part59
                        ]
                    },
                    {
                        id: req.body.topic3question10,
                        numberOfParts: req.body.topic3question10numberOfParts,
                        content: req.body.topic3question10content,
                        parts:
                        [
                            req.body.itopic3question10part0, req.body.itopic3question10part1, req.body.itopic3question10part2, req.body.itopic3question10part3, req.body.itopic3question10part4, req.body.itopic3question10part5, req.body.itopic3question10part6, req.body.itopic3question10part7, req.body.itopic3question10part8, req.body.itopic3question10part9,
                            req.body.itopic3question10part10, req.body.itopic3question10part11, req.body.itopic3question10part12, req.body.itopic3question10part13, req.body.itopic3question10part14, req.body.itopic3question10part15, req.body.itopic3question10part16, req.body.itopic3question10part17, req.body.itopic3question10part18, req.body.itopic3question10part19,
                            req.body.itopic3question10part20, req.body.itopic3question10part21, req.body.itopic3question10part22, req.body.itopic3question10part23, req.body.itopic3question10part24, req.body.itopic3question10part25, req.body.itopic3question10part26, req.body.itopic3question10part27, req.body.itopic3question10part28, req.body.itopic3question10part29,
                            req.body.itopic3question10part30, req.body.itopic3question10part31, req.body.itopic3question10part32, req.body.itopic3question10part33, req.body.itopic3question10part34, req.body.itopic3question10part35, req.body.itopic3question10part36, req.body.itopic3question10part37, req.body.itopic3question10part38, req.body.itopic3question10part39,
                            req.body.itopic3question10part40, req.body.itopic3question10part41, req.body.itopic3question10part42, req.body.itopic3question10part43, req.body.itopic3question10part44, req.body.itopic3question10part45, req.body.itopic3question10part46, req.body.itopic3question10part47, req.body.itopic3question10part48, req.body.itopic3question10part49,
                            req.body.itopic3question10part50, req.body.itopic3question10part51, req.body.itopic3question10part52, req.body.itopic3question10part53, req.body.itopic3question10part54, req.body.itopic3question10part55, req.body.itopic3question10part56, req.body.itopic3question10part57, req.body.itopic3question10part58, req.body.itopic3question10part59
                        ]
                    },
                    {
                        id: req.body.topic3question11,
                        numberOfParts: req.body.topic3question11numberOfParts,
                        content: req.body.topic3question11content,
                        parts:
                        [
                            req.body.itopic3question11part0, req.body.itopic3question11part1, req.body.itopic3question11part2, req.body.itopic3question11part3, req.body.itopic3question11part4, req.body.itopic3question11part5, req.body.itopic3question11part6, req.body.itopic3question11part7, req.body.itopic3question11part8, req.body.itopic3question11part9,
                            req.body.itopic3question11part10, req.body.itopic3question11part11, req.body.itopic3question11part12, req.body.itopic3question11part13, req.body.itopic3question11part14, req.body.itopic3question11part15, req.body.itopic3question11part16, req.body.itopic3question11part17, req.body.itopic3question11part18, req.body.itopic3question11part19,
                            req.body.itopic3question11part20, req.body.itopic3question11part21, req.body.itopic3question11part22, req.body.itopic3question11part23, req.body.itopic3question11part24, req.body.itopic3question11part25, req.body.itopic3question11part26, req.body.itopic3question11part27, req.body.itopic3question11part28, req.body.itopic3question11part29,
                            req.body.itopic3question11part30, req.body.itopic3question11part31, req.body.itopic3question11part32, req.body.itopic3question11part33, req.body.itopic3question11part34, req.body.itopic3question11part35, req.body.itopic3question11part36, req.body.itopic3question11part37, req.body.itopic3question11part38, req.body.itopic3question11part39,
                            req.body.itopic3question11part40, req.body.itopic3question11part41, req.body.itopic3question11part42, req.body.itopic3question11part43, req.body.itopic3question11part44, req.body.itopic3question11part45, req.body.itopic3question11part46, req.body.itopic3question11part47, req.body.itopic3question11part48, req.body.itopic3question11part49,
                            req.body.itopic3question11part50, req.body.itopic3question11part51, req.body.itopic3question11part52, req.body.itopic3question11part53, req.body.itopic3question11part54, req.body.itopic3question11part55, req.body.itopic3question11part56, req.body.itopic3question11part57, req.body.itopic3question11part58, req.body.itopic3question11part59
                        ]
                    },
                    {
                        id: req.body.topic3question12,
                        numberOfParts: req.body.topic3question12numberOfParts,
                        content: req.body.topic3question12content,
                        parts:
                        [
                            req.body.itopic3question12part0, req.body.itopic3question12part1, req.body.itopic3question12part2, req.body.itopic3question12part3, req.body.itopic3question12part4, req.body.itopic3question12part5, req.body.itopic3question12part6, req.body.itopic3question12part7, req.body.itopic3question12part8, req.body.itopic3question12part9,
                            req.body.itopic3question12part10, req.body.itopic3question12part11, req.body.itopic3question12part12, req.body.itopic3question12part13, req.body.itopic3question12part14, req.body.itopic3question12part15, req.body.itopic3question12part16, req.body.itopic3question12part17, req.body.itopic3question12part18, req.body.itopic3question12part19,
                            req.body.itopic3question12part20, req.body.itopic3question12part21, req.body.itopic3question12part22, req.body.itopic3question12part23, req.body.itopic3question12part24, req.body.itopic3question12part25, req.body.itopic3question12part26, req.body.itopic3question12part27, req.body.itopic3question12part28, req.body.itopic3question12part29,
                            req.body.itopic3question12part30, req.body.itopic3question12part31, req.body.itopic3question12part32, req.body.itopic3question12part33, req.body.itopic3question12part34, req.body.itopic3question12part35, req.body.itopic3question12part36, req.body.itopic3question12part37, req.body.itopic3question12part38, req.body.itopic3question12part39,
                            req.body.itopic3question12part40, req.body.itopic3question12part41, req.body.itopic3question12part42, req.body.itopic3question12part43, req.body.itopic3question12part44, req.body.itopic3question12part45, req.body.itopic3question12part46, req.body.itopic3question12part47, req.body.itopic3question12part48, req.body.itopic3question12part49,
                            req.body.itopic3question12part50, req.body.itopic3question12part51, req.body.itopic3question12part52, req.body.itopic3question12part53, req.body.itopic3question12part54, req.body.itopic3question12part55, req.body.itopic3question12part56, req.body.itopic3question12part57, req.body.itopic3question12part58, req.body.itopic3question12part59
                        ]
                    },
                    {
                        id: req.body.topic3question13,
                        numberOfParts: req.body.topic3question13numberOfParts,
                        content: req.body.topic3question13content,
                        parts:
                        [
                            req.body.itopic3question13part0, req.body.itopic3question13part1, req.body.itopic3question13part2, req.body.itopic3question13part3, req.body.itopic3question13part4, req.body.itopic3question13part5, req.body.itopic3question13part6, req.body.itopic3question13part7, req.body.itopic3question13part8, req.body.itopic3question13part9,
                            req.body.itopic3question13part10, req.body.itopic3question13part11, req.body.itopic3question13part12, req.body.itopic3question13part13, req.body.itopic3question13part14, req.body.itopic3question13part15, req.body.itopic3question13part16, req.body.itopic3question13part17, req.body.itopic3question13part18, req.body.itopic3question13part19,
                            req.body.itopic3question13part20, req.body.itopic3question13part21, req.body.itopic3question13part22, req.body.itopic3question13part23, req.body.itopic3question13part24, req.body.itopic3question13part25, req.body.itopic3question13part26, req.body.itopic3question13part27, req.body.itopic3question13part28, req.body.itopic3question13part29,
                            req.body.itopic3question13part30, req.body.itopic3question13part31, req.body.itopic3question13part32, req.body.itopic3question13part33, req.body.itopic3question13part34, req.body.itopic3question13part35, req.body.itopic3question13part36, req.body.itopic3question13part37, req.body.itopic3question13part38, req.body.itopic3question13part39,
                            req.body.itopic3question13part40, req.body.itopic3question13part41, req.body.itopic3question13part42, req.body.itopic3question13part43, req.body.itopic3question13part44, req.body.itopic3question13part45, req.body.itopic3question13part46, req.body.itopic3question13part47, req.body.itopic3question13part48, req.body.itopic3question13part49,
                            req.body.itopic3question13part50, req.body.itopic3question13part51, req.body.itopic3question13part52, req.body.itopic3question13part53, req.body.itopic3question13part54, req.body.itopic3question13part55, req.body.itopic3question13part56, req.body.itopic3question13part57, req.body.itopic3question13part58, req.body.itopic3question13part59
                        ]
                    },
                    {
                        id: req.body.topic3question14,
                        numberOfParts: req.body.topic3question14numberOfParts,
                        content: req.body.topic3question14content,
                        parts:
                        [
                            req.body.itopic3question14part0, req.body.itopic3question14part1, req.body.itopic3question14part2, req.body.itopic3question14part3, req.body.itopic3question14part4, req.body.itopic3question14part5, req.body.itopic3question14part6, req.body.itopic3question14part7, req.body.itopic3question14part8, req.body.itopic3question14part9,
                            req.body.itopic3question14part10, req.body.itopic3question14part11, req.body.itopic3question14part12, req.body.itopic3question14part13, req.body.itopic3question14part14, req.body.itopic3question14part15, req.body.itopic3question14part16, req.body.itopic3question14part17, req.body.itopic3question14part18, req.body.itopic3question14part19,
                            req.body.itopic3question14part20, req.body.itopic3question14part21, req.body.itopic3question14part22, req.body.itopic3question14part23, req.body.itopic3question14part24, req.body.itopic3question14part25, req.body.itopic3question14part26, req.body.itopic3question14part27, req.body.itopic3question14part28, req.body.itopic3question14part29,
                            req.body.itopic3question14part30, req.body.itopic3question14part31, req.body.itopic3question14part32, req.body.itopic3question14part33, req.body.itopic3question14part34, req.body.itopic3question14part35, req.body.itopic3question14part36, req.body.itopic3question14part37, req.body.itopic3question14part38, req.body.itopic3question14part39,
                            req.body.itopic3question14part40, req.body.itopic3question14part41, req.body.itopic3question14part42, req.body.itopic3question14part43, req.body.itopic3question14part44, req.body.itopic3question14part45, req.body.itopic3question14part46, req.body.itopic3question14part47, req.body.itopic3question14part48, req.body.itopic3question14part49,
                            req.body.itopic3question14part50, req.body.itopic3question14part51, req.body.itopic3question14part52, req.body.itopic3question14part53, req.body.itopic3question14part54, req.body.itopic3question14part55, req.body.itopic3question14part56, req.body.itopic3question14part57, req.body.itopic3question14part58, req.body.itopic3question14part59
                        ]
                    },
                    {
                        id: req.body.topic3question15,
                        numberOfParts: req.body.topic3question15numberOfParts,
                        content: req.body.topic3question15content,
                        parts:
                        [
                            req.body.itopic3question15part0, req.body.itopic3question15part1, req.body.itopic3question15part2, req.body.itopic3question15part3, req.body.itopic3question15part4, req.body.itopic3question15part5, req.body.itopic3question15part6, req.body.itopic3question15part7, req.body.itopic3question15part8, req.body.itopic3question15part9,
                            req.body.itopic3question15part10, req.body.itopic3question15part11, req.body.itopic3question15part12, req.body.itopic3question15part13, req.body.itopic3question15part14, req.body.itopic3question15part15, req.body.itopic3question15part16, req.body.itopic3question15part17, req.body.itopic3question15part18, req.body.itopic3question15part19,
                            req.body.itopic3question15part20, req.body.itopic3question15part21, req.body.itopic3question15part22, req.body.itopic3question15part23, req.body.itopic3question15part24, req.body.itopic3question15part25, req.body.itopic3question15part26, req.body.itopic3question15part27, req.body.itopic3question15part28, req.body.itopic3question15part29,
                            req.body.itopic3question15part30, req.body.itopic3question15part31, req.body.itopic3question15part32, req.body.itopic3question15part33, req.body.itopic3question15part34, req.body.itopic3question15part35, req.body.itopic3question15part36, req.body.itopic3question15part37, req.body.itopic3question15part38, req.body.itopic3question15part39,
                            req.body.itopic3question15part40, req.body.itopic3question15part41, req.body.itopic3question15part42, req.body.itopic3question15part43, req.body.itopic3question15part44, req.body.itopic3question15part45, req.body.itopic3question15part46, req.body.itopic3question15part47, req.body.itopic3question15part48, req.body.itopic3question15part49,
                            req.body.itopic3question15part50, req.body.itopic3question15part51, req.body.itopic3question15part52, req.body.itopic3question15part53, req.body.itopic3question15part54, req.body.itopic3question15part55, req.body.itopic3question15part56, req.body.itopic3question15part57, req.body.itopic3question15part58, req.body.itopic3question15part59
                        ]
                    },
                ]
            },
            {
                name: req.body.topic4,
                numberOfQuestions: req.body.topic4numberOfQuestions,
                percentageMark: 0,
                questions: [
                    {
                        id: req.body.topic4question0,
                        numberOfParts: req.body.topic4question0numberOfParts,
                        content: req.body.topic4question0content,
                        parts:
                        [
                            req.body.itopic4question0part0, req.body.itopic4question0part1, req.body.itopic4question0part2, req.body.itopic4question0part3, req.body.itopic4question0part4, req.body.itopic4question0part5, req.body.itopic4question0part6, req.body.itopic4question0part7, req.body.itopic4question0part8, req.body.itopic4question0part9,
                            req.body.itopic4question0part10, req.body.itopic4question0part11, req.body.itopic4question0part12, req.body.itopic4question0part13, req.body.itopic4question0part14, req.body.itopic4question0part15, req.body.itopic4question0part16, req.body.itopic4question0part17, req.body.itopic4question0part18, req.body.itopic4question0part19,
                            req.body.itopic4question0part20, req.body.itopic4question0part21, req.body.itopic4question0part22, req.body.itopic4question0part23, req.body.itopic4question0part24, req.body.itopic4question0part25, req.body.itopic4question0part26, req.body.itopic4question0part27, req.body.itopic4question0part28, req.body.itopic4question0part29,
                            req.body.itopic4question0part30, req.body.itopic4question0part31, req.body.itopic4question0part32, req.body.itopic4question0part33, req.body.itopic4question0part34, req.body.itopic4question0part35, req.body.itopic4question0part36, req.body.itopic4question0part37, req.body.itopic4question0part38, req.body.itopic4question0part39,
                            req.body.itopic4question0part40, req.body.itopic4question0part41, req.body.itopic4question0part42, req.body.itopic4question0part43, req.body.itopic4question0part44, req.body.itopic4question0part45, req.body.itopic4question0part46, req.body.itopic4question0part47, req.body.itopic4question0part48, req.body.itopic4question0part49,
                            req.body.itopic4question0part50, req.body.itopic4question0part51, req.body.itopic4question0part52, req.body.itopic4question0part53, req.body.itopic4question0part54, req.body.itopic4question0part55, req.body.itopic4question0part56, req.body.itopic4question0part57, req.body.itopic4question0part58, req.body.itopic4question0part59
                        ]
                    },
                    {
                        id: req.body.topic4question1,
                        numberOfParts: req.body.topic4question1numberOfParts,
                        content: req.body.topic4question1content,
                        parts:
                        [
                            req.body.itopic4question1part0, req.body.itopic4question1part1, req.body.itopic4question1part2, req.body.itopic4question1part3, req.body.itopic4question1part4, req.body.itopic4question1part5, req.body.itopic4question1part6, req.body.itopic4question1part7, req.body.itopic4question1part8, req.body.itopic4question1part9,
                            req.body.itopic4question1part10, req.body.itopic4question1part11, req.body.itopic4question1part12, req.body.itopic4question1part13, req.body.itopic4question1part14, req.body.itopic4question1part15, req.body.itopic4question1part16, req.body.itopic4question1part17, req.body.itopic4question1part18, req.body.itopic4question1part19,
                            req.body.itopic4question1part20, req.body.itopic4question1part21, req.body.itopic4question1part22, req.body.itopic4question1part23, req.body.itopic4question1part24, req.body.itopic4question1part25, req.body.itopic4question1part26, req.body.itopic4question1part27, req.body.itopic4question1part28, req.body.itopic4question1part29,
                            req.body.itopic4question1part30, req.body.itopic4question1part31, req.body.itopic4question1part32, req.body.itopic4question1part33, req.body.itopic4question1part34, req.body.itopic4question1part35, req.body.itopic4question1part36, req.body.itopic4question1part37, req.body.itopic4question1part38, req.body.itopic4question1part39,
                            req.body.itopic4question1part40, req.body.itopic4question1part41, req.body.itopic4question1part42, req.body.itopic4question1part43, req.body.itopic4question1part44, req.body.itopic4question1part45, req.body.itopic4question1part46, req.body.itopic4question1part47, req.body.itopic4question1part48, req.body.itopic4question1part49,
                            req.body.itopic4question1part50, req.body.itopic4question1part51, req.body.itopic4question1part52, req.body.itopic4question1part53, req.body.itopic4question1part54, req.body.itopic4question1part55, req.body.itopic4question1part56, req.body.itopic4question1part57, req.body.itopic4question1part58, req.body.itopic4question1part59
                        ]
                    },
                    {
                        id: req.body.topic4question2,
                        numberOfParts: req.body.topic4question2numberOfParts,
                        content: req.body.topic4question2content,
                        parts:
                        [
                            req.body.itopic4question2part0, req.body.itopic4question2part1, req.body.itopic4question2part2, req.body.itopic4question2part3, req.body.itopic4question2part4, req.body.itopic4question2part5, req.body.itopic4question2part6, req.body.itopic4question2part7, req.body.itopic4question2part8, req.body.itopic4question2part9,
                            req.body.itopic4question2part10, req.body.itopic4question2part11, req.body.itopic4question2part12, req.body.itopic4question2part13, req.body.itopic4question2part14, req.body.itopic4question2part15, req.body.itopic4question2part16, req.body.itopic4question2part17, req.body.itopic4question2part18, req.body.itopic4question2part19,
                            req.body.itopic4question2part20, req.body.itopic4question2part21, req.body.itopic4question2part22, req.body.itopic4question2part23, req.body.itopic4question2part24, req.body.itopic4question2part25, req.body.itopic4question2part26, req.body.itopic4question2part27, req.body.itopic4question2part28, req.body.itopic4question2part29,
                            req.body.itopic4question2part30, req.body.itopic4question2part31, req.body.itopic4question2part32, req.body.itopic4question2part33, req.body.itopic4question2part34, req.body.itopic4question2part35, req.body.itopic4question2part36, req.body.itopic4question2part37, req.body.itopic4question2part38, req.body.itopic4question2part39,
                            req.body.itopic4question2part40, req.body.itopic4question2part41, req.body.itopic4question2part42, req.body.itopic4question2part43, req.body.itopic4question2part44, req.body.itopic4question2part45, req.body.itopic4question2part46, req.body.itopic4question2part47, req.body.itopic4question2part48, req.body.itopic4question2part49,
                            req.body.itopic4question2part50, req.body.itopic4question2part51, req.body.itopic4question2part52, req.body.itopic4question2part53, req.body.itopic4question2part54, req.body.itopic4question2part55, req.body.itopic4question2part56, req.body.itopic4question2part57, req.body.itopic4question2part58, req.body.itopic4question2part59
                        ]
                    },
                    {
                        id: req.body.topic4question3,
                        numberOfParts: req.body.topic4question3numberOfParts,
                        content: req.body.topic4question3content,
                        parts:
                        [
                            req.body.itopic4question3part0, req.body.itopic4question3part1, req.body.itopic4question3part2, req.body.itopic4question3part3, req.body.itopic4question3part4, req.body.itopic4question3part5, req.body.itopic4question3part6, req.body.itopic4question3part7, req.body.itopic4question3part8, req.body.itopic4question3part9,
                            req.body.itopic4question3part10, req.body.itopic4question3part11, req.body.itopic4question3part12, req.body.itopic4question3part13, req.body.itopic4question3part14, req.body.itopic4question3part15, req.body.itopic4question3part16, req.body.itopic4question3part17, req.body.itopic4question3part18, req.body.itopic4question3part19,
                            req.body.itopic4question3part20, req.body.itopic4question3part21, req.body.itopic4question3part22, req.body.itopic4question3part23, req.body.itopic4question3part24, req.body.itopic4question3part25, req.body.itopic4question3part26, req.body.itopic4question3part27, req.body.itopic4question3part28, req.body.itopic4question3part29,
                            req.body.itopic4question3part30, req.body.itopic4question3part31, req.body.itopic4question3part32, req.body.itopic4question3part33, req.body.itopic4question3part34, req.body.itopic4question3part35, req.body.itopic4question3part36, req.body.itopic4question3part37, req.body.itopic4question3part38, req.body.itopic4question3part39,
                            req.body.itopic4question3part40, req.body.itopic4question3part41, req.body.itopic4question3part42, req.body.itopic4question3part43, req.body.itopic4question3part44, req.body.itopic4question3part45, req.body.itopic4question3part46, req.body.itopic4question3part47, req.body.itopic4question3part48, req.body.itopic4question3part49,
                            req.body.itopic4question3part50, req.body.itopic4question3part51, req.body.itopic4question3part52, req.body.itopic4question3part53, req.body.itopic4question3part54, req.body.itopic4question3part55, req.body.itopic4question3part56, req.body.itopic4question3part57, req.body.itopic4question3part58, req.body.itopic4question3part59
                        ]
                    },
                    {
                        id: req.body.topic4question4,
                        numberOfParts: req.body.topic4question4numberOfParts,
                        content: req.body.topic4question4content,
                        parts:
                        [
                            req.body.itopic4question4part0, req.body.itopic4question4part1, req.body.itopic4question4part2, req.body.itopic4question4part3, req.body.itopic4question4part4, req.body.itopic4question4part5, req.body.itopic4question4part6, req.body.itopic4question4part7, req.body.itopic4question4part8, req.body.itopic4question4part9,
                            req.body.itopic4question4part10, req.body.itopic4question4part11, req.body.itopic4question4part12, req.body.itopic4question4part13, req.body.itopic4question4part14, req.body.itopic4question4part15, req.body.itopic4question4part16, req.body.itopic4question4part17, req.body.itopic4question4part18, req.body.itopic4question4part19,
                            req.body.itopic4question4part20, req.body.itopic4question4part21, req.body.itopic4question4part22, req.body.itopic4question4part23, req.body.itopic4question4part24, req.body.itopic4question4part25, req.body.itopic4question4part26, req.body.itopic4question4part27, req.body.itopic4question4part28, req.body.itopic4question4part29,
                            req.body.itopic4question4part30, req.body.itopic4question4part31, req.body.itopic4question4part32, req.body.itopic4question4part33, req.body.itopic4question4part34, req.body.itopic4question4part35, req.body.itopic4question4part36, req.body.itopic4question4part37, req.body.itopic4question4part38, req.body.itopic4question4part39,
                            req.body.itopic4question4part40, req.body.itopic4question4part41, req.body.itopic4question4part42, req.body.itopic4question4part43, req.body.itopic4question4part44, req.body.itopic4question4part45, req.body.itopic4question4part46, req.body.itopic4question4part47, req.body.itopic4question4part48, req.body.itopic4question4part49,
                            req.body.itopic4question4part50, req.body.itopic4question4part51, req.body.itopic4question4part52, req.body.itopic4question4part53, req.body.itopic4question4part54, req.body.itopic4question4part55, req.body.itopic4question4part56, req.body.itopic4question4part57, req.body.itopic4question4part58, req.body.itopic4question4part59
                        ]
                    },
                    {
                        id: req.body.topic4question5,
                        numberOfParts: req.body.topic4question5numberOfParts,
                        content: req.body.topic4question5content,
                        parts:
                        [
                            req.body.itopic4question5part0, req.body.itopic4question5part1, req.body.itopic4question5part2, req.body.itopic4question5part3, req.body.itopic4question5part4, req.body.itopic4question5part5, req.body.itopic4question5part6, req.body.itopic4question5part7, req.body.itopic4question5part8, req.body.itopic4question5part9,
                            req.body.itopic4question5part10, req.body.itopic4question5part11, req.body.itopic4question5part12, req.body.itopic4question5part13, req.body.itopic4question5part14, req.body.itopic4question5part15, req.body.itopic4question5part16, req.body.itopic4question5part17, req.body.itopic4question5part18, req.body.itopic4question5part19,
                            req.body.itopic4question5part20, req.body.itopic4question5part21, req.body.itopic4question5part22, req.body.itopic4question5part23, req.body.itopic4question5part24, req.body.itopic4question5part25, req.body.itopic4question5part26, req.body.itopic4question5part27, req.body.itopic4question5part28, req.body.itopic4question5part29,
                            req.body.itopic4question5part30, req.body.itopic4question5part31, req.body.itopic4question5part32, req.body.itopic4question5part33, req.body.itopic4question5part34, req.body.itopic4question5part35, req.body.itopic4question5part36, req.body.itopic4question5part37, req.body.itopic4question5part38, req.body.itopic4question5part39,
                            req.body.itopic4question5part40, req.body.itopic4question5part41, req.body.itopic4question5part42, req.body.itopic4question5part43, req.body.itopic4question5part44, req.body.itopic4question5part45, req.body.itopic4question5part46, req.body.itopic4question5part47, req.body.itopic4question5part48, req.body.itopic4question5part49,
                            req.body.itopic4question5part50, req.body.itopic4question5part51, req.body.itopic4question5part52, req.body.itopic4question5part53, req.body.itopic4question5part54, req.body.itopic4question5part55, req.body.itopic4question5part56, req.body.itopic4question5part57, req.body.itopic4question5part58, req.body.itopic4question5part59
                        ]
                    },
                    {
                        id: req.body.topic4question6,
                        numberOfParts: req.body.topic4question6numberOfParts,
                        content: req.body.topic4question6content,
                        parts:
                        [
                            req.body.itopic4question6part0, req.body.itopic4question6part1, req.body.itopic4question6part2, req.body.itopic4question6part3, req.body.itopic4question6part4, req.body.itopic4question6part5, req.body.itopic4question6part6, req.body.itopic4question6part7, req.body.itopic4question6part8, req.body.itopic4question6part9,
                            req.body.itopic4question6part10, req.body.itopic4question6part11, req.body.itopic4question6part12, req.body.itopic4question6part13, req.body.itopic4question6part14, req.body.itopic4question6part15, req.body.itopic4question6part16, req.body.itopic4question6part17, req.body.itopic4question6part18, req.body.itopic4question6part19,
                            req.body.itopic4question6part20, req.body.itopic4question6part21, req.body.itopic4question6part22, req.body.itopic4question6part23, req.body.itopic4question6part24, req.body.itopic4question6part25, req.body.itopic4question6part26, req.body.itopic4question6part27, req.body.itopic4question6part28, req.body.itopic4question6part29,
                            req.body.itopic4question6part30, req.body.itopic4question6part31, req.body.itopic4question6part32, req.body.itopic4question6part33, req.body.itopic4question6part34, req.body.itopic4question6part35, req.body.itopic4question6part36, req.body.itopic4question6part37, req.body.itopic4question6part38, req.body.itopic4question6part39,
                            req.body.itopic4question6part40, req.body.itopic4question6part41, req.body.itopic4question6part42, req.body.itopic4question6part43, req.body.itopic4question6part44, req.body.itopic4question6part45, req.body.itopic4question6part46, req.body.itopic4question6part47, req.body.itopic4question6part48, req.body.itopic4question6part49,
                            req.body.itopic4question6part50, req.body.itopic4question6part51, req.body.itopic4question6part52, req.body.itopic4question6part53, req.body.itopic4question6part54, req.body.itopic4question6part55, req.body.itopic4question6part56, req.body.itopic4question6part57, req.body.itopic4question6part58, req.body.itopic4question6part59
                        ]
                    },
                    {
                        id: req.body.topic4question7,
                        numberOfParts: req.body.topic4question7numberOfParts,
                        content: req.body.topic4question7content,
                        parts:
                        [
                            req.body.itopic4question7part0, req.body.itopic4question7part1, req.body.itopic4question7part2, req.body.itopic4question7part3, req.body.itopic4question7part4, req.body.itopic4question7part5, req.body.itopic4question7part6, req.body.itopic4question7part7, req.body.itopic4question7part8, req.body.itopic4question7part9,
                            req.body.itopic4question7part10, req.body.itopic4question7part11, req.body.itopic4question7part12, req.body.itopic4question7part13, req.body.itopic4question7part14, req.body.itopic4question7part15, req.body.itopic4question7part16, req.body.itopic4question7part17, req.body.itopic4question7part18, req.body.itopic4question7part19,
                            req.body.itopic4question7part20, req.body.itopic4question7part21, req.body.itopic4question7part22, req.body.itopic4question7part23, req.body.itopic4question7part24, req.body.itopic4question7part25, req.body.itopic4question7part26, req.body.itopic4question7part27, req.body.itopic4question7part28, req.body.itopic4question7part29,
                            req.body.itopic4question7part30, req.body.itopic4question7part31, req.body.itopic4question7part32, req.body.itopic4question7part33, req.body.itopic4question7part34, req.body.itopic4question7part35, req.body.itopic4question7part36, req.body.itopic4question7part37, req.body.itopic4question7part38, req.body.itopic4question7part39,
                            req.body.itopic4question7part40, req.body.itopic4question7part41, req.body.itopic4question7part42, req.body.itopic4question7part43, req.body.itopic4question7part44, req.body.itopic4question7part45, req.body.itopic4question7part46, req.body.itopic4question7part47, req.body.itopic4question7part48, req.body.itopic4question7part49,
                            req.body.itopic4question7part50, req.body.itopic4question7part51, req.body.itopic4question7part52, req.body.itopic4question7part53, req.body.itopic4question7part54, req.body.itopic4question7part55, req.body.itopic4question7part56, req.body.itopic4question7part57, req.body.itopic4question7part58, req.body.itopic4question7part59
                        ]
                    },
                    {
                        id: req.body.topic4question8,
                        numberOfParts: req.body.topic4question8numberOfParts,
                        content: req.body.topic4question8content,
                        parts:
                        [
                            req.body.itopic4question8part0, req.body.itopic4question8part1, req.body.itopic4question8part2, req.body.itopic4question8part3, req.body.itopic4question8part4, req.body.itopic4question8part5, req.body.itopic4question8part6, req.body.itopic4question8part7, req.body.itopic4question8part8, req.body.itopic4question8part9,
                            req.body.itopic4question8part10, req.body.itopic4question8part11, req.body.itopic4question8part12, req.body.itopic4question8part13, req.body.itopic4question8part14, req.body.itopic4question8part15, req.body.itopic4question8part16, req.body.itopic4question8part17, req.body.itopic4question8part18, req.body.itopic4question8part19,
                            req.body.itopic4question8part20, req.body.itopic4question8part21, req.body.itopic4question8part22, req.body.itopic4question8part23, req.body.itopic4question8part24, req.body.itopic4question8part25, req.body.itopic4question8part26, req.body.itopic4question8part27, req.body.itopic4question8part28, req.body.itopic4question8part29,
                            req.body.itopic4question8part30, req.body.itopic4question8part31, req.body.itopic4question8part32, req.body.itopic4question8part33, req.body.itopic4question8part34, req.body.itopic4question8part35, req.body.itopic4question8part36, req.body.itopic4question8part37, req.body.itopic4question8part38, req.body.itopic4question8part39,
                            req.body.itopic4question8part40, req.body.itopic4question8part41, req.body.itopic4question8part42, req.body.itopic4question8part43, req.body.itopic4question8part44, req.body.itopic4question8part45, req.body.itopic4question8part46, req.body.itopic4question8part47, req.body.itopic4question8part48, req.body.itopic4question8part49,
                            req.body.itopic4question8part50, req.body.itopic4question8part51, req.body.itopic4question8part52, req.body.itopic4question8part53, req.body.itopic4question8part54, req.body.itopic4question8part55, req.body.itopic4question8part56, req.body.itopic4question8part57, req.body.itopic4question8part58, req.body.itopic4question8part59
                        ]
                    },
                    {
                        id: req.body.topic4question9,
                        numberOfParts: req.body.topic4question9numberOfParts,
                        content: req.body.topic4question9content,
                        parts:
                        [
                            req.body.itopic4question9part0, req.body.itopic4question9part1, req.body.itopic4question9part2, req.body.itopic4question9part3, req.body.itopic4question9part4, req.body.itopic4question9part5, req.body.itopic4question9part6, req.body.itopic4question9part7, req.body.itopic4question9part8, req.body.itopic4question9part9,
                            req.body.itopic4question9part10, req.body.itopic4question9part11, req.body.itopic4question9part12, req.body.itopic4question9part13, req.body.itopic4question9part14, req.body.itopic4question9part15, req.body.itopic4question9part16, req.body.itopic4question9part17, req.body.itopic4question9part18, req.body.itopic4question9part19,
                            req.body.itopic4question9part20, req.body.itopic4question9part21, req.body.itopic4question9part22, req.body.itopic4question9part23, req.body.itopic4question9part24, req.body.itopic4question9part25, req.body.itopic4question9part26, req.body.itopic4question9part27, req.body.itopic4question9part28, req.body.itopic4question9part29,
                            req.body.itopic4question9part30, req.body.itopic4question9part31, req.body.itopic4question9part32, req.body.itopic4question9part33, req.body.itopic4question9part34, req.body.itopic4question9part35, req.body.itopic4question9part36, req.body.itopic4question9part37, req.body.itopic4question9part38, req.body.itopic4question9part39,
                            req.body.itopic4question9part40, req.body.itopic4question9part41, req.body.itopic4question9part42, req.body.itopic4question9part43, req.body.itopic4question9part44, req.body.itopic4question9part45, req.body.itopic4question9part46, req.body.itopic4question9part47, req.body.itopic4question9part48, req.body.itopic4question9part49,
                            req.body.itopic4question9part50, req.body.itopic4question9part51, req.body.itopic4question9part52, req.body.itopic4question9part53, req.body.itopic4question9part54, req.body.itopic4question9part55, req.body.itopic4question9part56, req.body.itopic4question9part57, req.body.itopic4question9part58, req.body.itopic4question9part59
                        ]
                    },
                    {
                        id: req.body.topic4question10,
                        numberOfParts: req.body.topic4question10numberOfParts,
                        content: req.body.topic4question10content,
                        parts:
                        [
                            req.body.itopic4question10part0, req.body.itopic4question10part1, req.body.itopic4question10part2, req.body.itopic4question10part3, req.body.itopic4question10part4, req.body.itopic4question10part5, req.body.itopic4question10part6, req.body.itopic4question10part7, req.body.itopic4question10part8, req.body.itopic4question10part9,
                            req.body.itopic4question10part10, req.body.itopic4question10part11, req.body.itopic4question10part12, req.body.itopic4question10part13, req.body.itopic4question10part14, req.body.itopic4question10part15, req.body.itopic4question10part16, req.body.itopic4question10part17, req.body.itopic4question10part18, req.body.itopic4question10part19,
                            req.body.itopic4question10part20, req.body.itopic4question10part21, req.body.itopic4question10part22, req.body.itopic4question10part23, req.body.itopic4question10part24, req.body.itopic4question10part25, req.body.itopic4question10part26, req.body.itopic4question10part27, req.body.itopic4question10part28, req.body.itopic4question10part29,
                            req.body.itopic4question10part30, req.body.itopic4question10part31, req.body.itopic4question10part32, req.body.itopic4question10part33, req.body.itopic4question10part34, req.body.itopic4question10part35, req.body.itopic4question10part36, req.body.itopic4question10part37, req.body.itopic4question10part38, req.body.itopic4question10part39,
                            req.body.itopic4question10part40, req.body.itopic4question10part41, req.body.itopic4question10part42, req.body.itopic4question10part43, req.body.itopic4question10part44, req.body.itopic4question10part45, req.body.itopic4question10part46, req.body.itopic4question10part47, req.body.itopic4question10part48, req.body.itopic4question10part49,
                            req.body.itopic4question10part50, req.body.itopic4question10part51, req.body.itopic4question10part52, req.body.itopic4question10part53, req.body.itopic4question10part54, req.body.itopic4question10part55, req.body.itopic4question10part56, req.body.itopic4question10part57, req.body.itopic4question10part58, req.body.itopic4question10part59
                        ]
                    },
                    {
                        id: req.body.topic4question11,
                        numberOfParts: req.body.topic4question11numberOfParts,
                        content: req.body.topic4question11content,
                        parts:
                        [
                            req.body.itopic4question11part0, req.body.itopic4question11part1, req.body.itopic4question11part2, req.body.itopic4question11part3, req.body.itopic4question11part4, req.body.itopic4question11part5, req.body.itopic4question11part6, req.body.itopic4question11part7, req.body.itopic4question11part8, req.body.itopic4question11part9,
                            req.body.itopic4question11part10, req.body.itopic4question11part11, req.body.itopic4question11part12, req.body.itopic4question11part13, req.body.itopic4question11part14, req.body.itopic4question11part15, req.body.itopic4question11part16, req.body.itopic4question11part17, req.body.itopic4question11part18, req.body.itopic4question11part19,
                            req.body.itopic4question11part20, req.body.itopic4question11part21, req.body.itopic4question11part22, req.body.itopic4question11part23, req.body.itopic4question11part24, req.body.itopic4question11part25, req.body.itopic4question11part26, req.body.itopic4question11part27, req.body.itopic4question11part28, req.body.itopic4question11part29,
                            req.body.itopic4question11part30, req.body.itopic4question11part31, req.body.itopic4question11part32, req.body.itopic4question11part33, req.body.itopic4question11part34, req.body.itopic4question11part35, req.body.itopic4question11part36, req.body.itopic4question11part37, req.body.itopic4question11part38, req.body.itopic4question11part39,
                            req.body.itopic4question11part40, req.body.itopic4question11part41, req.body.itopic4question11part42, req.body.itopic4question11part43, req.body.itopic4question11part44, req.body.itopic4question11part45, req.body.itopic4question11part46, req.body.itopic4question11part47, req.body.itopic4question11part48, req.body.itopic4question11part49,
                            req.body.itopic4question11part50, req.body.itopic4question11part51, req.body.itopic4question11part52, req.body.itopic4question11part53, req.body.itopic4question11part54, req.body.itopic4question11part55, req.body.itopic4question11part56, req.body.itopic4question11part57, req.body.itopic4question11part58, req.body.itopic4question11part59
                        ]
                    },
                    {
                        id: req.body.topic4question12,
                        numberOfParts: req.body.topic4question12numberOfParts,
                        content: req.body.topic4question12content,
                        parts:
                        [
                            req.body.itopic4question12part0, req.body.itopic4question12part1, req.body.itopic4question12part2, req.body.itopic4question12part3, req.body.itopic4question12part4, req.body.itopic4question12part5, req.body.itopic4question12part6, req.body.itopic4question12part7, req.body.itopic4question12part8, req.body.itopic4question12part9,
                            req.body.itopic4question12part10, req.body.itopic4question12part11, req.body.itopic4question12part12, req.body.itopic4question12part13, req.body.itopic4question12part14, req.body.itopic4question12part15, req.body.itopic4question12part16, req.body.itopic4question12part17, req.body.itopic4question12part18, req.body.itopic4question12part19,
                            req.body.itopic4question12part20, req.body.itopic4question12part21, req.body.itopic4question12part22, req.body.itopic4question12part23, req.body.itopic4question12part24, req.body.itopic4question12part25, req.body.itopic4question12part26, req.body.itopic4question12part27, req.body.itopic4question12part28, req.body.itopic4question12part29,
                            req.body.itopic4question12part30, req.body.itopic4question12part31, req.body.itopic4question12part32, req.body.itopic4question12part33, req.body.itopic4question12part34, req.body.itopic4question12part35, req.body.itopic4question12part36, req.body.itopic4question12part37, req.body.itopic4question12part38, req.body.itopic4question12part39,
                            req.body.itopic4question12part40, req.body.itopic4question12part41, req.body.itopic4question12part42, req.body.itopic4question12part43, req.body.itopic4question12part44, req.body.itopic4question12part45, req.body.itopic4question12part46, req.body.itopic4question12part47, req.body.itopic4question12part48, req.body.itopic4question12part49,
                            req.body.itopic4question12part50, req.body.itopic4question12part51, req.body.itopic4question12part52, req.body.itopic4question12part53, req.body.itopic4question12part54, req.body.itopic4question12part55, req.body.itopic4question12part56, req.body.itopic4question12part57, req.body.itopic4question12part58, req.body.itopic4question12part59
                        ]
                    },
                    {
                        id: req.body.topic4question13,
                        numberOfParts: req.body.topic4question13numberOfParts,
                        content: req.body.topic4question13content,
                        parts:
                        [
                            req.body.itopic4question13part0, req.body.itopic4question13part1, req.body.itopic4question13part2, req.body.itopic4question13part3, req.body.itopic4question13part4, req.body.itopic4question13part5, req.body.itopic4question13part6, req.body.itopic4question13part7, req.body.itopic4question13part8, req.body.itopic4question13part9,
                            req.body.itopic4question13part10, req.body.itopic4question13part11, req.body.itopic4question13part12, req.body.itopic4question13part13, req.body.itopic4question13part14, req.body.itopic4question13part15, req.body.itopic4question13part16, req.body.itopic4question13part17, req.body.itopic4question13part18, req.body.itopic4question13part19,
                            req.body.itopic4question13part20, req.body.itopic4question13part21, req.body.itopic4question13part22, req.body.itopic4question13part23, req.body.itopic4question13part24, req.body.itopic4question13part25, req.body.itopic4question13part26, req.body.itopic4question13part27, req.body.itopic4question13part28, req.body.itopic4question13part29,
                            req.body.itopic4question13part30, req.body.itopic4question13part31, req.body.itopic4question13part32, req.body.itopic4question13part33, req.body.itopic4question13part34, req.body.itopic4question13part35, req.body.itopic4question13part36, req.body.itopic4question13part37, req.body.itopic4question13part38, req.body.itopic4question13part39,
                            req.body.itopic4question13part40, req.body.itopic4question13part41, req.body.itopic4question13part42, req.body.itopic4question13part43, req.body.itopic4question13part44, req.body.itopic4question13part45, req.body.itopic4question13part46, req.body.itopic4question13part47, req.body.itopic4question13part48, req.body.itopic4question13part49,
                            req.body.itopic4question13part50, req.body.itopic4question13part51, req.body.itopic4question13part52, req.body.itopic4question13part53, req.body.itopic4question13part54, req.body.itopic4question13part55, req.body.itopic4question13part56, req.body.itopic4question13part57, req.body.itopic4question13part58, req.body.itopic4question13part59
                        ]
                    },
                    {
                        id: req.body.topic4question14,
                        numberOfParts: req.body.topic4question14numberOfParts,
                        content: req.body.topic4question14content,
                        parts:
                        [
                            req.body.itopic4question14part0, req.body.itopic4question14part1, req.body.itopic4question14part2, req.body.itopic4question14part3, req.body.itopic4question14part4, req.body.itopic4question14part5, req.body.itopic4question14part6, req.body.itopic4question14part7, req.body.itopic4question14part8, req.body.itopic4question14part9,
                            req.body.itopic4question14part10, req.body.itopic4question14part11, req.body.itopic4question14part12, req.body.itopic4question14part13, req.body.itopic4question14part14, req.body.itopic4question14part15, req.body.itopic4question14part16, req.body.itopic4question14part17, req.body.itopic4question14part18, req.body.itopic4question14part19,
                            req.body.itopic4question14part20, req.body.itopic4question14part21, req.body.itopic4question14part22, req.body.itopic4question14part23, req.body.itopic4question14part24, req.body.itopic4question14part25, req.body.itopic4question14part26, req.body.itopic4question14part27, req.body.itopic4question14part28, req.body.itopic4question14part29,
                            req.body.itopic4question14part30, req.body.itopic4question14part31, req.body.itopic4question14part32, req.body.itopic4question14part33, req.body.itopic4question14part34, req.body.itopic4question14part35, req.body.itopic4question14part36, req.body.itopic4question14part37, req.body.itopic4question14part38, req.body.itopic4question14part39,
                            req.body.itopic4question14part40, req.body.itopic4question14part41, req.body.itopic4question14part42, req.body.itopic4question14part43, req.body.itopic4question14part44, req.body.itopic4question14part45, req.body.itopic4question14part46, req.body.itopic4question14part47, req.body.itopic4question14part48, req.body.itopic4question14part49,
                            req.body.itopic4question14part50, req.body.itopic4question14part51, req.body.itopic4question14part52, req.body.itopic4question14part53, req.body.itopic4question14part54, req.body.itopic4question14part55, req.body.itopic4question14part56, req.body.itopic4question14part57, req.body.itopic4question14part58, req.body.itopic4question14part59
                        ]
                    },
                    {
                        id: req.body.topic4question15,
                        numberOfParts: req.body.topic4question15numberOfParts,
                        content: req.body.topic4question15content,
                        parts:
                        [
                            req.body.itopic4question15part0, req.body.itopic4question15part1, req.body.itopic4question15part2, req.body.itopic4question15part3, req.body.itopic4question15part4, req.body.itopic4question15part5, req.body.itopic4question15part6, req.body.itopic4question15part7, req.body.itopic4question15part8, req.body.itopic4question15part9,
                            req.body.itopic4question15part10, req.body.itopic4question15part11, req.body.itopic4question15part12, req.body.itopic4question15part13, req.body.itopic4question15part14, req.body.itopic4question15part15, req.body.itopic4question15part16, req.body.itopic4question15part17, req.body.itopic4question15part18, req.body.itopic4question15part19,
                            req.body.itopic4question15part20, req.body.itopic4question15part21, req.body.itopic4question15part22, req.body.itopic4question15part23, req.body.itopic4question15part24, req.body.itopic4question15part25, req.body.itopic4question15part26, req.body.itopic4question15part27, req.body.itopic4question15part28, req.body.itopic4question15part29,
                            req.body.itopic4question15part30, req.body.itopic4question15part31, req.body.itopic4question15part32, req.body.itopic4question15part33, req.body.itopic4question15part34, req.body.itopic4question15part35, req.body.itopic4question15part36, req.body.itopic4question15part37, req.body.itopic4question15part38, req.body.itopic4question15part39,
                            req.body.itopic4question15part40, req.body.itopic4question15part41, req.body.itopic4question15part42, req.body.itopic4question15part43, req.body.itopic4question15part44, req.body.itopic4question15part45, req.body.itopic4question15part46, req.body.itopic4question15part47, req.body.itopic4question15part48, req.body.itopic4question15part49,
                            req.body.itopic4question15part50, req.body.itopic4question15part51, req.body.itopic4question15part52, req.body.itopic4question15part53, req.body.itopic4question15part54, req.body.itopic4question15part55, req.body.itopic4question15part56, req.body.itopic4question15part57, req.body.itopic4question15part58, req.body.itopic4question15part59
                        ]
                    },
                ]
            }
        ]
    }
    //removing NULL topics
    for (var i = testData.topics.length; i > testData.numberOfTopics; i--)
    {
        testData.topics.splice((i-1), 1);
    }
    //removing NULL questions
    for (var i = 0; i < testData.topics.length; i++)
    {
        for (var t = testData.topics[i].questions.length; t > testData.topics[i].numberOfQuestions; t--)
        {
            testData.topics[i].questions.splice((t-1), 1);
        }
    }
    //removing NULL parts
    for (var i = 0; i < testData.topics.length; i++) {
        for (var t = 0; t < testData.topics[i].questions.length; t++)
        {
            for (var z = testData.topics[i].questions[t].parts.length; z > testData.topics[i].questions[t].numberOfParts; z--)
            {
                testData.topics[i].questions[t].parts.splice((z-1), 1);
            } 
        }
    }
    //temp varaibles
    var answerLocationsTemp = [];
    var methodMarks = [];
    var index;
    var startIndex;
    
    examBoard.findOne({ name: req.body.examBoard }).exec().then((exams) => {
        examBoard.populate(exams, {
            path: 'modules.topics.questions',
            model: 'question'
        }).then((populatedExams) => {
            for (var i = 0; i < populatedExams.modules.length; i++)//finding module
            {
                if (populatedExams.modules[i].name == req.body.module)//if module matches
                {
                    for (var z = 0; z < testData.topics.length; z++)//finding topics
                    {
                        for (var t = 0; t < populatedExams.modules[i].topics.length; t++)
                        {
                            if (testData.topics[z].name == populatedExams.modules[i].topics[t].name)//if topics match
                            {
                                for (var q = 0; q < testData.topics[z].questions.length; q++)//finding questions
                                {
                                    for (var p = 0; p < populatedExams.modules[i].topics[t].questions.length; p++)
                                    {
                                        if (populatedExams.modules[i].topics[t].questions[p]._id == testData.topics[z].questions[q].id)//if questions match
                                        {
                                            answerLocationsTemp = [];
                                            for (var x = 0; x < populatedExams.modules[i].topics[t].questions[p].methods.length; x++)//iterating through answer methods
                                            {
                                                answerLocationsTemp.push([]);
                                                methodMarks.push(0);
                                                for (var c = 0; c < populatedExams.modules[i].topics[t].questions[p].methods[x].length; c++)//iterating through parts in answer methods
                                                {
                                                    for (var e = 0; e < testData.topics[z].questions[q].parts.length; e++)//iterating through user parts
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
                                                if (methodMarks[x] == populatedExams.modules[i].topics[t].questions[p].mark)//if user gets full marks, no point checking other methods
                                                {
                                                    break;
                                                }
                                            }
                                            index = 0;
                                            for (var x = 0; x < methodMarks.length; x++)//finding method with highest marks
                                            {
                                                if (methodMarks[x] > methodMarks[index])
                                                {
                                                    index = x;
                                                }    
                                            }
                                            if (methodMarks[index] > 0)
                                            {
                                                testData.topics[z].questions[q].solution = populatedExams.modules[i].topics[t].questions[p].methods[index];
                                                testData.topics[z].questions[q].answers = answerLocationsTemp[index];
                                                testData.topics[z].percentageMark += methodMarks[index] / populatedExams.modules[i].topics[t].questions[p].mark;
                                            }
                                            break;
                                        }
                                    }
                                }
                                testData.topics[z].percentageMark = testData.topics[z].percentageMark / testData.topics[z].questions.length;
                                break;
                            }
                        }       
                    }
                    break;       
                }        
            }
            user.findById(req.params.id, function (err, user) {//finding user in database
                if (err)
                {
                    console.log("Could not find user data\n" + err);
                }
                else
                {
                    console.log("Found user");
                    console.log("user.examBoard.modules.length : " + user.examBoard.modules.length);
                    user.examBoard.progress = 0;
                    for (var i = 0; i < user.examBoard.modules.length; i++)//find module
                    {
                        if (user.examBoard.modules[i].name == req.body.module)
                        {
                            user.examBoard.modules[i].progress = 0;
                            for (var t = 0; t < user.examBoard.modules[i].topics.length;t++)//finding topics
                            {
                                for (var z = 0; z < testData.topics.length; z++)
                                {
                                    if (user.examBoard.modules[i].topics[t].name == testData.topics[z].name)
                                    {
                                        user.examBoard.modules[i].topics[t].results.push(testData.topics[z].percentageMark)//adding results for each topic
                                        user.examBoard.modules[i].topics[t].progress = math.mean(user.examBoard.modules[i].topics[t].results) - (math.std(user.examBoard.modules[i].topics[t].results) / 3) - Math.pow(((user.examBoard.modules[i].topics[t].results.length / 30) + 0.105), -2);//changing progress in topic
                                        if (user.examBoard.modules[i].topics[t].progress < 0)
                                        {
                                            user.examBoard.modules[i].topics[t].progress = 0;
                                        }
                                        break;
                                    }
                                }
                                user.examBoard.modules[i].progress += user.examBoard.modules[i].topics[t].progress;
                            }
                            user.examBoard.modules[i].progress = user.examBoard.modules[i].progress / user.examBoard.modules[i].topics.length;
                        }
                        user.examBoard.progress += user.examBoard.modules[i].progress;
                    }
                    user.examBoard.progress = user.examBoard.progress / user.examBoard.modules.length;
                    user.save(function (err, updatedUser) {
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

app.post("/users/:id/users/:userId/admin", function (req, res) {
    user.findById(req.params.userId, function (err, user) {
        if (err) {
            console.log("Could not find user:\n" + err);
        } else {
            user.role = "admin";
            user.save(function (err, updatedUser) {
                if (err) {
                    console.log("Could not update user role to admin:\n" + err);
                } else {
                    var objectToBeParsed = { userData: updatedUser, admin: req.params.id };
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
        returnTopics.push({ name:topics[i].name, questions:GetTopicQuestion(topics[i], topicTime) });
    }

    console.log("\n\nquestions (outside function):\n" + returnTopics);

    return returnTopics;
}

function GetTopicQuestion(Topic, topicTime)
{

    var timePerQuestion=[];
    var QuestionAmount = 0;
    var questionLow = 0;
    var questionHigh = 0;
    
    if(topicTime > 60)//making sure topic time is a reasonable number
    {
        console.log("Are you wet? (topicTime over 60)");    
        topicTime = 60;
    }
    else if(topicTime < 4)
    {
        console.log("This guy thinks he has something better to do? (topicTime less than 4)");    
        topicTime = 4;    
    }


    if(topicTime < 12)//Find the times of each question in this topic
    {
        timePerQuestion[0] = topicTime;
    }
    else
    {

        var numberOfQuestions = Math.floor(topicTime / getRandomIntInclusive(4, (Math.floor(topicTime / 2))));
        var numberToRoundUp = Math.round(((topicTime / numberOfQuestions) % 1) * numberOfQuestions);

        console.log("topicTime:" + topicTime);
        console.log("numberOfQuestions:"+numberOfQuestions);
        console.log("numberToRoundUp:" + numberToRoundUp);

        for (var i = 0; i < numberToRoundUp; i++)
        {
            timePerQuestion[i] = Math.ceil(topicTime / numberOfQuestions);
            questionHigh++;
        }

        for (var i = numberToRoundUp; i < numberOfQuestions;i++)
        {
            timePerQuestion[i] = Math.floor(topicTime/numberOfQuestions);
            questionLow++;
        }
        console.log("timePerQuestion:\n"+timePerQuestion);
    }
    console.log("questionHigh:"+questionHigh);
    console.log("questionLow:"+questionLow);
    
    var questionsOfProperLengthLower = [];
    var questionsOfProperLengthHigher = [];
    console.log("Topic.questions.length:" + Topic.questions.length);
    for(var i=0;i<Topic.questions.length;i++)//push all questions of appropriate lengths to the 'questionsOfProperLength's arrays
    {
        console.log("i = " + i);
        if(Topic.questions[i].mark==timePerQuestion[0])
        {
            console.log("pushed a question of lesser marks (" + i + ")");
            questionsOfProperLengthLower.push(Topic.questions[i]);               
        }
        else if(Topic.questions[i].mark==timePerQuestion[(timePerQuestion.length)-1])
        {
            console.log("pushed a question of greater marks (" + i + ")");
            questionsOfProperLengthHigher.push(Topic.questions[i]);    
        }
    }  
    console.log("Finished adding questions to questionsOfProperLengthLower and questionsOfProperLengthHigher ")
    console.log("questionsOfProperLengthLower:" + questionsOfProperLengthLower);
    console.log("questionsOfProperLengthHigher:" + questionsOfProperLengthHigher);

    var questions=[];
    var questionsAlreadyPickedLow = [];
    var questionsAlreadyPickedHigh = [];
    var random;

    console.log("questionLow:" + questionLow);
    for (var i = 0; i < questionLow; i++)
    {
        random = getRandomIntInclusive(0, ((questionsOfProperLengthLower.length)-1));
        if (searchArray(questionsAlreadyPickedLow, random))
        {
            i--;
            continue;    
        }
        questionsAlreadyPickedLow[i] = random;
        questions.push(questionsOfProperLengthLower[random]);        
    }
    console.log("questionHigh:" + questionHigh);
    for(var i = 0; i < questionHigh; i++)
    {
        random = getRandomIntInclusive(0, ((questionsOfProperLengthHigher.length)-1));
        if (searchArray(questionsAlreadyPickedHigh, random)) {
            i--;
            continue;
        }
        questionsAlreadyPickedHigh[i] = random;
        questions.push(questionsOfProperLengthHigher[random]);
    }
    

    console.log("\n\n\n\nquestions:\n" + questions + "\n\n");
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
//JWL functions
//---------------------------------------------------------------------

function searchArray(array, value)
{
    for (var i = 0; i <= array.length; i++)
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

