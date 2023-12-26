const express = require("express");
const jwt = require('jsonwebtoken');
const path = require('path');
const mongoose = require('mongoose');
const jwtpwd = "riti1234";
const bodyParser = require('body-parser');
const flash = require('connect-flash');


mongoose.connect('mongodb+srv://ritika1705:Q0kKsR6inWmn11f8@cluster0.qobrspy.mongodb.net/cohort_0_100');

const User = mongoose.model("User",
    {
        username: String,
        email: String,
        password: String
    }
);

//const User = mongoose.model.User || mongoose.model("User", UserSchema);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '/views/public/')));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

async function userExists(email, password)
{
   const data = await User.findOne({ email: email });
   return data !== null;
}

app.get("/", function (req, res) {
    //res.sendFile(__dirname + '/public/signup.html');
    res.render('./public/signup.ejs', {success:''});
});

app.get("/login", function (req, res) {
    res.render('./public/login.ejs', {success:''});
});

app.get("/success", function (req, res) {
    res.render('./public/success.ejs', {success:''});
});

app.post('/signup', async function(req,res){
    //console.log(req.body);
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const newuser = new User({
        username: username,
        email: email,
        password: password
    });

    const result = await userExists(email,password);
    if (result) {
        
        res.status(403);
        return(res.render('./public/signup.ejs', {success:'User already exists. Try logging in !!'}));
        //return res.status(403);
        //({
        //   msg: "User exists in our in memory db",
        // });
    }
    try {
        await newuser.save();
        res.status(201);
        return(res.render('./public/signup.ejs', {success:'User signed up successfully.'}));
        //res.status(201).json(newuser);
    } 
    catch(error) 
    {
        res.status(400).json({ message : error.message});
    }
})


app.post('/login', async function(req,res){
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const newuser = new User({
        username: username,
        email: email,
        password: password
    });

    const result = await userExists(email,password);
    //console.log(result);
    
    if (result) {
        var token = jwt.sign({ email: email }, jwtpwd);
        const data = await User.findOne({ email: email });
        
        if(data.email==email && data.password==password)
        {
            res.status(200);
            res.render('./public/success.ejs', {success:'Logged in successfully!!'});
        }
        else
        {
            res.status(403);
            return(res.render('./public/login.ejs', {success:'Either the email or password is incorrect. Please check.'}));
        }
        //res.render('./public/login.ejs', {success:'Logged in successfully!!'});
        // return res.json({
        //   token,
        // });
    }

    try {

        res.status(403);
        return(res.render('./public/login.ejs', {success:'User does not exist. Signup to continue!!'}));
        //return res.status(403);
        // return res.status(403).json({
        //     msg: "User does not exist in our in memory db",
        // });
    } 
    catch(error) 
    {
        res.status(400).json({ message : error.message});
    }
})


app.get("/users", async function (req, res) {
    const token = req.headers.authorization;
	try {
		const decoded = jwt.verify(token, jwtpwd);
		const email = decoded.email;
		const users = await User.find();
        res.json({
            users: users
        });
	} 
    catch (err) {
        console.log(err);
		return res.status(403).json({
			msg: "Invalid token",
		});
	}
});

app.listen(3000);