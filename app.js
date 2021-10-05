const express = require("express");
const path = require("path");
const mysql = require("mysql");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')




dotenv.config({path:'./.env'})



const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect((error)=> {
    if(error){
        console.log(error)
    } else{
        console.log("MYSQL Connected")
    }
})



const app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const publicDirectory= path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static("public"));

app.use("/", require("./routes/home"));
app.use("/auth",require("./routes/auth"));


app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
})
