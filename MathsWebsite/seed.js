const   mongoose = require("mongoose"),
        examBoard = require("./models/examBoard"),
        question = require("./models/question"),
        user = require("./models/user"),
        math = require("mathjs"),
        passport = require("passport"),
        bodyParser = require("body-parser"),
        LocalStrategy = require("passport-local"),
        passportLocalMongoose = require("passport-local-mongoose"),
        bcrypt = require("bcrypt");
    
var examboardData=
[
        {
            name: "Placeholder1", modules: [
                { name: "PlaceholderA1", topics: [{ name: "Placeholder1A1" }, { name: "Placeholder2A1" }, { name: "Placeholder3A1" }, { name: "Placeholder4A1" }] },
                { name: "PlaceholderB1", topics: [{ name: "Placeholder1B1" }, { name: "Placeholder2B1" }, { name: "Placeholder3B1" }, { name: "Placeholder4B1" }, { name: "Placeholder5B1" }, { name: "Placeholder6B1" }] },
                { name: "PlaceholderC1", topics: [{ name: "Placeholder1C1" }, { name: "Placeholder2C1" }, { name: "Placeholder3C1" }, { name: "Placeholder4C1" }, { name: "Placeholder5C1" }, { name: "Placeholder6C1" }] },
                { name: "PlaceholderD1", topics: [{ name: "Placeholder1D1" }, { name: "Placeholder2D1" }, { name: "Placeholder3D1" }, { name: "Placeholder4D1" }, { name: "Placeholder5D1" }, { name: "Placeholder6D1" }, { name: "Placeholder7D1" }] }]
        }, {
            name: "Placeholder2", modules: [
                { name: "PlaceholderA2", topics: [{ name: "Placeholder1A2" }, { name: "Placeholder2A2" }, { name: "Placeholder3A2" }, { name: "Placeholder4A2" }] },
                { name: "PlaceholderB2", topics: [{ name: "Placeholder1B2" }, { name: "Placeholder2B2" }, { name: "Placeholder3B2" }, { name: "Placeholder4B2" }, { name: "Placeholder5B2" }, { name: "Placeholder6B2" }] },
                { name: "PlaceholderC2", topics: [{ name: "Placeholder1C2" }, { name: "Placeholder2C2" }, { name: "Placeholder3C2" }, { name: "Placeholder4C2" }, { name: "Placeholder5C2" }, { name: "Placeholder6C2" }] },
                { name: "PlaceholderD2", topics: [{ name: "Placeholder1D2" }, { name: "Placeholder2D2" }, { name: "Placeholder3D2" }, { name: "Placeholder4D2" }, { name: "Placeholder5D2" }, { name: "Placeholder6D2" }, { name: "Placeholder7D2" }] }]
        }, {
            name: "Placeholder3", modules: [
                { name: "PlaceholderA3", topics: [{ name: "Placeholder1A3" }, { name: "Placeholder2A3" }, { name: "Placeholder3A3" }, { name: "Placeholder4A3" }] },
                { name: "PlaceholderB3", topics: [{ name: "Placeholder1B3" }, { name: "Placeholder2B3" }, { name: "Placeholder3B3" }, { name: "Placeholder4B3" }, { name: "Placeholder5B3" }, { name: "Placeholder6B3" }] },
                { name: "PlaceholderC3", topics: [{ name: "Placeholder1C3" }, { name: "Placeholder2C3" }, { name: "Placeholder3C3" }, { name: "Placeholder4C3" }, { name: "Placeholder5C3" }, { name: "Placeholder6C3" }] },
                { name: "PlaceholderD3", topics: [{ name: "Placeholder1D3" }, { name: "Placeholder2D3" }, { name: "Placeholder3D3" }, { name: "Placeholder4D3" }, { name: "Placeholder5D3" }, { name: "Placeholder6D3" }, { name: "Placeholder7D3" }] }]
        }
];

var questionData=
[
    {
        content: "https://image.ibb.co/gDevEF/rate_Of_Change_15marks_0.png",
        mark: 4,
        methods: [[{ mark: 4, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 2, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content:"x=2^{\\frac{1}{2}}"}]]
    },
    {
        content: "https://image.ibb.co/gDevEF/rate_Of_Change_15marks_0.png",
        mark: 4,
        methods: [[{ mark: 4, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 2, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/gDevEF/rate_Of_Change_15marks_0.png",
        mark: 4,
        methods: [[{ mark: 4, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 2, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content:"x=2^{\\frac{1}{2}}"}]]
    },
    {
        content: "https://image.ibb.co/c3QD1v/rate_Of_Change_7marks_1.png",
        mark: 5,
        methods: [[{ mark: 5, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/c3QD1v/rate_Of_Change_7marks_1.png",
        mark: 5,
        methods: [[{ mark: 5, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/c3QD1v/rate_Of_Change_7marks_1.png",
        mark: 5,
        methods: [[{ mark: 5, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 2, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/cHJY1v/rate_Of_Change_7marks_0.png",
        mark: 6,
        methods: [[{ mark: 6, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/cHJY1v/rate_Of_Change_7marks_0.png",
        mark: 6,
        methods: [[{ mark: 6, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/cHJY1v/rate_Of_Change_7marks_0.png",
        mark: 6,
        methods: [[{ mark: 6, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 3, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/k78NuF/parametrics_14marks_0.png",
        mark: 7,
        methods: [[{ mark: 7, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/k78NuF/parametrics_14marks_0.png",
        mark: 7,
        methods: [[{ mark: 7, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/k78NuF/parametrics_14marks_0.png",
        mark: 7,
        methods: [[{ mark: 7, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 3, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/k5pTZF/parametrics_12marks.png",
        mark: 8,
        methods: [[{ mark: 8, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/k5pTZF/parametrics_12marks.png",
        mark: 8,
        methods: [[{ mark: 8, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/k5pTZF/parametrics_12marks.png",
        mark: 8,
        methods: [[{ mark: 8, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 4, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/nFDY1v/int_Vol_Of_Rev_8marks_0.png",
        mark: 9,
        methods: [[{ mark: 9, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/nFDY1v/int_Vol_Of_Rev_8marks_0.png",
        mark: 9,
        methods: [[{ mark: 9, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/nFDY1v/int_Vol_Of_Rev_8marks_0.png",
        mark: 9,
        methods: [[{ mark: 9, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 4, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/gRTcTa/int_Lims_4marks_0.png",
        mark: 10,
        methods: [[{ mark: 10, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/gRTcTa/int_Lims_4marks_0.png",
        mark: 10,
        methods: [[{ mark: 10, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/gRTcTa/int_Lims_4marks_0.png",
        mark: 10,
        methods: [[{ mark: 10, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 5, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/h3Vroa/int_7marks_0.png",
        mark: 11,
        methods: [[{ mark: 11, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/h3Vroa/int_7marks_0.png",
        mark: 11,
        methods: [[{ mark: 11, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/h3Vroa/int_7marks_0.png",
        mark: 11,
        methods: [[{ mark: 11, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 5, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/nBN48a/implicit_Diff_8marks_1.png",
        mark: 12,
        methods: [[{ mark: 12, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/nBN48a/implicit_Diff_8marks_1.png",
        mark: 12,
        ethods: [[{ mark: 12, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/nBN48a/implicit_Diff_8marks_1.png",
        mark: 12,
        ethods: [[{ mark: 12, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 6, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/kVDcTa/implicit_Diff_8marks_0.png",
        mark: 13,
        methods: [[{ mark: 13, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/kVDcTa/implicit_Diff_8marks_0.png",
        mark: 13,
        methods: [[{ mark: 13, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/kVDcTa/implicit_Diff_8marks_0.png",
        mark: 13,
        methods: [[{ mark: 13, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 6, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/iJGxTa/diff_Equation_12marks_0.png",
        mark: 14,
        methods: [[{ mark: 14, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/iJGxTa/diff_Equation_12marks_0.png",
        mark: 14,
        methods: [[{ mark: 14, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/iJGxTa/diff_Equation_12marks_0.png",
        mark: 14,
        methods: [[{ mark: 14, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 7, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/fSyBoa/bin_Expan_10marks_0.png",
        mark: 15,
        methods: [[{ mark: 15, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 8, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/fSyBoa/bin_Expan_10marks_0.png",
        mark: 15,
        methods: [[{ mark: 15, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 8, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{\\frac{1}{2}}" }]]
    },
    {
        content: "https://image.ibb.co/fSyBoa/bin_Expan_10marks_0.png",
        mark: 15,
        methods: [[{ mark: 15, content: "x=-2^{\\frac{1}{2}}" }], [{ mark: 8, content: "2^{\\frac{1}{2}}x=1" }, { mark: 7, content: "x=2^{\\frac{1}{2}}" }]]
    }
];


async function seedDB() {
    
    await Promise.all(
        [user, examBoard, question].map(data => data.remove({}))
    );

    bcrypt.hash("lu134r7n75q5psbzwgch", 10, function (err, hash) {
        user.create({
            username: "admin",
            password: hash,
            email: "jonathanwoollettlight@gmail.com",
            role: "admin"
        });
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