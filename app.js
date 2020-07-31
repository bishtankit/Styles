//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://bishtankit:okbro123@cluster0.srme2.mongodb.net/stylesDB", { useNewUrlParser: true });
mongoose.set("useCreateIndex", true);

const aboutContent = "Hey there! ";


const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  orders: []
});

const dataSchema = new mongoose.Schema({
  type: String,
  name: String,
  img: String,
  img2: String,
  img3: String,
  price: Number,
  color: String,
  product: String,
  description: String,
  gender: String
});
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",userSchema);
const Data = mongoose.model("Data",dataSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let date = new Date().getDate();
const month = new Date().getMonth() + 1;
const year = new Date().getFullYear();
date = date+"-"+month+"-"+year;

app.get("/", function(req, res){

     res.render("home.ejs");

});

app.get("/register", function(req, res){

res.render("register.ejs");
});

app.get("/login", function(req, res){

res.render("login.ejs");
})

app.get("/products", function(req, res){

  if(req.isAuthenticated()){
    res.render("products.ejs",{name: req.user.name});
  }else{
    res.redirect("/login");
  }
})

app.get("/logout", function(req, res){

  req.logout();
  res.redirect("/products");
})

app.get("/men", function(req, res){

  Data.find({gender: "male"},function(err, found){
    console.log(found);
    res.render("men.ejs",{items: found});

  });

});
app.get("/women", function(req, res){
Data.find({gender: "female"}, function(err, found){

  console.log(found);
  res.render("women.ejs", {items: found});
});

});

app.get("/kids", function(req, res){

  Data.find({gender: "kids"}, function(err, found){
    console.log(found);
    res.render("kids.ejs", {items: found});
  });
});

app.get("/contact", function(req, res){


    res.render("contact.ejs");
})

app.get("/about", function(req, res){

    res.render("about.ejs",{about: aboutContent});

});



app.post("/welcome", function(req, res){

console.log("the id is "+req.user.id);
User.findById(req.user.id, function(err, found){

  if(err){
    console.log(err);
  }else{
    if(found){
      found.name = req.body.name;
      found.email = req.body.email;
      found.address = req.body.address;
      found.save(function(){
        res.redirect("/products");
      });
    }
  }
});

});



app.post("/register", function(req, res){

User.register({username: req.body.username}, req.body.password, function(err, user) {

if(err){
  console.log(err);
  res.render("fail.ejs");
}else{
  number = req.body.username;
  passport.authenticate("local")(req, res, function(){
    res.render("welcome.ejs");
  });
}

});
});


app.post("/login", function(req, res){

const user = new User({
  username: req.body.username,
  password: req.body.password
});

req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/products");
      });
    }

});

});



app.post("/cart", function(req, res){
const product = req.body.clothing;

Data.findOne({product: product}, function(err , found){

  if(err){
    console.log(err);
  }else{
    console.log(found);
    res.render("cart.ejs",{result: found});
  }
});

});


app.post("/buy", function(req, res){
const product = req.body.clothing;
const address = req.body.address;
console.log(address);

User.findById(req.user.id, function(err, found){

  if(err){
    console.log(err);
  }else{
    if(found){
      let num = Math.random();
      console.log(num);
      num = num * Math.random();
        console.log(num);
      num = num * 1000000;
        console.log(num);
      num = Math.floor(num);
      console.log(num);
      found.orders.push(num + ", " + product + ", " + date + ",  " + address);
      found.save(function(){
        res.render("success.ejs",{date: date, address: address, order: num});
      });
    }
  }
});
});

app.post("/confirm", function(req, res){
const product = req.body.clothing;
  res.render("confirm.ejs",{id: product, address: req.user.address});
})



app.post("/search", function(req, res){

const item = req.body.search;
if(req.isAuthenticated()){

  Data.find({type: item},function(err, found){
    const len = found.length;

  if(len == 0){
    res.send("Sorry no matched item found :(")
  }else{
    console.log(found);
    res.render("searchresult.ejs",{items: found});

  }


  });

}else{
  res.redirect("/login");
}

});


var server = app.listen(process.env.PORT || 5000, function () {
  var port = server.address().port;
  console.log("Express is working on port " + port);
});


// app.listen(port, function() {
//   console.log("Server started Successfully");
// });
