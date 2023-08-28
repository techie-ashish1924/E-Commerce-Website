if(process.env.NODE_ENV != "production"){

  require("dotenv").config({ path: "./config.env"})
}
const express = require('express')
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const colors = require("colors");
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override");
const session = require('express-session')
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require('connect-mongo');
const User = require("./models/User")



const dbUrl = process.env.DB_URI || 'mongodb://127.0.0.1:27017/shopping-app2'

const port = process.env.PORT || 5000

mongoose.connect(dbUrl, { useNewUrlParser: true,useUnifiedTopology: true })
.then(()=> console.log(" DB CONNECTED!"))
.catch((err)=> console.log(err));


const store = MongoStore.create({

  mongoUrl: dbUrl,
  touchAfter: 60 * 60 * 24 * 1

})

const secret = process.env.SESSION_SECRET || 'weneedabettersecret';

const sessionConfig = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    // secure: true
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7 * 1,
    maxAge:1000 * 60 * 60 * 24 * 7 * 1
  }
}

//Routes
  const productRoutes = require("./routes/productRoutes");
  const reviewRoutes = require("./routes/reviewRoutes");
  const authRoutes = require("./routes/authRoutes");
  const cartRoutes = require("./routes/cartRoutes")


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))


app.use(session(sessionConfig));
app.use(passport.authenticate('session'));
app.use(flash());



passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{

  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user
  next();

})


// routes middleware
app.use("/products",productRoutes)
app.use(reviewRoutes)
app.use(authRoutes)
app.use(cartRoutes)


app.get("/", (req,res)=>{

res.render("homepage")
})


app.listen(port,()=>{
  console.log(`server started at port http://localhost:${port}`.red);
});