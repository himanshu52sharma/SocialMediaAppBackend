const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt")
// const User = require('../models/User')


// router.get('/home',  (req,res)=>{
//     res.send('hello world')

async function mailer(recieveremail, code){
    // console.log("Mailer function called");

    let transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:587,
        secure:false, //true for 465, false for other ports
        requireTLS:true,
        auth:{
            user: process.env.Nodemailer_email, //generate ethereal user
            pass: process.env.Nodemailer_password, //generate ethereal password
        }
    });

    let info = await transporter.sendMail({
        from: "Project_three",
        to: `${recieveremail}`,
        subject: "Email Verification",
        text: `Your Verification Code is ${code}`,
        html: `<b>Your Verification Code is ${code}</b>`
    })

    console.log("message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

router.post('/verify',  (req,res)=>{
    // console.log(req.body);
    const {email} = req.body;
    
    if(!email){
        return res.status(422).json({error:"Please add all the fields"});
    }
    else{
        User.findOne({ email:email})
        .then(async(savedUser) => {
            // console.log(savedUser);
        // return res.status(200).json({message:"email sent"});
        if(savedUser){
        return res.status(422).json({error:"Invalid Credentials"});
        }
        try{
           let VerificationCode = Math.floor(100000 + Math.random()* 900000);
           await mailer(email, VerificationCode);
           console.log("Verification Code", VerificationCode); 
           return res.status(200).json({message:"Verification Code Sent to your Email",VerificationCode, email});
        }
        catch(err){
            return res.status(422).json({error:"Error sending email"});
        }
        })
        // return res.status(200).json({message:"email sent"});
    }
})


router.post('/changeusername', (req, res) => {
    const { username, email } = req.body;

    User.find({ username }).then(async (savedUser) => {
        if (savedUser.length > 0) {
            return res.status(422).json({ error: "Username already exists" });
        }
        else {
            return res.status(200).json({ message: "Username Available", username, email });
        }
    })
})
router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(422).json({ error: "Please add all the fields" });
    }
    else {
        const user = new User({
            username,
            email,
            password,
        })

        try {
            await user.save();
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
            return res.status(200).json({ message: "User Registered Successfully", token });

        }
        catch (err) {
            console.log(err);
            return res.status(422).json({ error: "User Not Registered" });
        }
    }
})

// forgot password
router.post('/verifyfp',  (req,res)=>{
    // console.log(req.body);
    const {email} = req.body;
    
    if(!email){
        return res.status(422).json({error:"Please add all the fields"});
    }
    else{
        User.findOne({ email:email})
        .then(async(savedUser) => {
            // console.log(savedUser);
        // return res.status(200).json({message:"email sent"});
        if(savedUser){
        try{
            let VerificationCode = Math.floor(100000 + Math.random()* 900000);
            await mailer(email, VerificationCode);
            console.log("Verification Code", VerificationCode); 
            return res.status(200).json({message:"Verification Code Sent to your Email",VerificationCode, email});
         }
         catch(err){
             return res.status(422).json({error:"Error sending email"});
         }
        }
        else{
            return res.status(422).json({error:"Invalid Credentials"});
        }
        })
        // return res.status(200).json({message:"email sent"});
    }
})

router.post('/resetpassword',(req, res) =>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(422).json({error:"Please add all the fields"});
    }
    else{
        User.findOne({ email:email })
        .then(async(savedUser) => {
            if(savedUser){
                savedUser.password = password;
                savedUser.save()
                .then(user =>{
                    res.json({message:"Password Changed Successfully"});
                })
                .catch(err =>{
                    console.log(err);
                })
            }
            else{
                res.status(422).json({ error: "Invalid Credentials"});
            }
        })
    }
})

router.post('/signin',(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(422).json({error: "Please add all the fields"});
    }
    else{
        User.findOne({email:email})
         .then(savedUser => {
            if(!savedUser){
                return res.status(422).json({error: "Invalid Credentials"})
            }
            else{
                bcrypt.compare(password, savedUser.password)
                .then(
                    doMatch => {
                        if (doMatch) {
                            const token = jwt.sign({_id: savedUser._id}, process.env.JWT_SECRET);
                            const {_id, username, email} = savedUser;
                            res.json({message:"Successfully Signed In",token, user:{_id, username, email}});
                        }
                        else{
                            return res.status(422).json({error: "Invalid Credentials"})
                        }
                    }
                  
                )
            }
         })
         .catch(err => {
            console.log(err);
         })
    }
})

// userdata
router.post('/userdata', (req, res) => {
    const { email } = req.body;

    User.findOne({ email:email }).then(async (savedUser) => {
        if (!savedUser) {
            return res.status(422).json({ error: "Invalid Credentials" });
        }
        else {
            return res.status(200).json({ message: "User Found", savedUser });
        }
    })
})

module.exports = router;

// "$2b$08$WEpC3JeqeS/6b5hPG4DaQecBnv2fSGnLL0X.TiI24pwK7TsqIk.gK"
// "$2b$08$hFpa0Hnx.jVRzNzGvrthde8wlef/0MJj61rkaPOrJVBrd7gygsTPK"