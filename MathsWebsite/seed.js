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
    { name: "b", modules: [{ name: "4", topics: [{ name: "a" }, { name: "b" }, { name: "c" }] }, { name: "5", topics: [{ name: "d" }, { name: "e" }, { name: "f" }] }, { name: "6", topics: [{ name: "g" }, { name: "h" }, { name: "i" }] }] },
    { name: "c", modules: [{ name: "7", topics: [{ name: "a" }, { name: "b" }, { name: "c" }] }, { name: "8", topics: [{ name: "d" }, { name: "e" }, { name: "f" }] }, { name: "9", topics: [{ name: "g" }, { name: "h" }, { name: "i" }] }] }
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
    
    Promise.all([
        examBoard.create(examboardData),
        question.create(questionData)
    ]).then(async (values) => {
        var topicIncrementor = 0;
        for (let question of values[1]) {
            for (let exam of values[0]) {
                for (var t = 0; t < exam.modules.length; t++) {
                    for (var q = 0; q < exam.modules[t].topics.length; q++) {
                        exam.modules[t].topics[q].questions.push(question);
                        topicIncrementor++;
                    }
                    topicIncrementor = 0;
                }
                await exam.save();
                console.log("Updated exam with questions");
            }
        }
    });
    
    
    // Add questions to each exam topic
    
    // Add questions to each exam topic

    

}
module.exports = seedDB;