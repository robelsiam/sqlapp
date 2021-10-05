const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {promisify} = require("util");
const express = require('express')
const multer = require('multer')

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.login = async function(req, res){
    try{
        const{email,password} = req.body;

        if(!email || !password){
            return res.status(400).render('home/login',{
                message: "Provide valid email and password" 
            })
        }

        db.query('SELECT * FROM users WHERE email = ?',[email], async function(error, results){
            console.log(results);
            if( !(await bcrypt.compare(password, results[0].password))){
                res.status(401).render('home/login',{message:"Email or Password is incorrect"});
            }else{
                const id = results[0].id;
                const token = jwt.sign({id:id},process.env.JWT_SECRET,{
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log("the token is "+token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIES_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly:true
                }
                res.cookie('jwt',token,cookieOptions);
                res.status(200).redirect('/profile')
            }
        })
    }catch(error){
        console.log(error);
    }    
}

exports.register = (req, res) =>{
    console.log(req.body);

    const{name,email,password,repassword} = req.body;

    db.query('SELECT email FROM users WHERE email = ?',[email], async function(error,results){
        if(error){
            console.log(error);
        }

        if(results.length > 0){
            return res.render('home/register',{message:'Email taken'});
            //makes it so one user per one email
        }else if(password !== repassword){
            return res.render('home/register',{message:'Passwords do not match'});
            //makes it so passwords match
        }

        let hashedPassword = await bcrypt.hash(password,8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?',{name: name, email: email, password: hashedPassword}, function(error,results){
            if(error){
                console.log(error);
            }else{
                console.log(results);
                return res.render('home/register',{messageGood:"User registered"});
            }
        })

    });

}

exports.isLoggedIn = async function(req, res, next){
    //console.log(req.cookies);
    if(req.cookies.jwt){
        try{
            //1) verifys the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            console.log(decoded)
            //2) Check if the user still exists 
            db.query('SELECT * FROM users WHERE id = ?',[decoded.id],function(error,result){
                console.log(result);
                if(!result){
                    return next();
                }
                req.user = result[0]
                //creating user for website
                return next();
            })
        }catch(error){
            console.log(error);
            return next();
        }
    }else{
        next();
    }
}

exports.logout = async function (req,res){
    res.cookie('jwt','logout',{expires: new Date(Date.now() + 2*1000),
    httpOnly: true});
    //can only logout via broswer

    res.status('200').redirect('/home');
}

var uploading = multer({
    dest: __dirname
  })

exports.profile = async function (req,res){
    console.log("-------------------------------------------------------");
    console.log(req.files.image.name);
    console.log("-------------------------------------------------------");
    res.redirect('/profile');
}