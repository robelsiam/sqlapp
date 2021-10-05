const express = require("express");
const authController = require("../controllers/auth");

const router = express.Router();

 router.get("/", authController.isLoggedIn, function(req, res){
   if(req.user){res.render("home/",{user: req.user});
  }else{
      res.render('home/');
     }
   });

 router.get("/home", authController.isLoggedIn, function(req, res){
   if(req.user){res.render("home/home",{user: req.user});
  }else{
      res.render('home/home');
     }
   });


 router.get("/about", authController.isLoggedIn, function(req, res){
   if(req.user){res.render("home/about",{user: req.user});
  }else{
      res.render('home/about');
     }
   });
/////////////////////////////////////////
 router.get("/login", function(req, res){
    res.render("home/login");
 });

 router.get("/register", function(req, res){
    res.render("home/register");
 });
//////////////////////////////////////////



 router.get("/profile", authController.isLoggedIn, function(req, res){
    if(req.user){res.render("home/profile",{user: req.user});
   }else{
       res.redirect('/login');
      }
 });


 module.exports = router;
