if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// Route imports
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const campgrounds = require('./controllers/campgrounds');

// DB connection
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => console.log("✅ Database connected"))
    .catch(err => {
        console.error("❌ Connection error:", err);
        process.exit(1);
    });

const app = express();

// View engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session
const sessionConfig = {
    secret: process.env.SECRET || 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ================= ROUTES =================

// Home page (REAL homepage)
app.get('/', campgrounds.renderHome);

// User routes (login, register, logout)
app.use('/', userRoutes);

// Campgrounds routes
app.use('/campgrounds', campgroundRoutes);

// Reviews routes
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 404 handler
app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, Something went wrong!';
    res.status(statusCode).render('error', { err });
});

// Server
const port = 3000;
app.listen(port, () => {
    console.log(`🚀 Serving on port ${port}`);
});
