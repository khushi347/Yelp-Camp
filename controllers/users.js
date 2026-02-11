const User=require('../models/user')

module.exports.renderRegister=(req,res)=>{
    res.render('users/register');
}

module.exports.register=async(req,res,next)=>{
    try{
     const {email,username,password}=req.body;
   const user=new User({email,username});
   const registeredUser=await User.register(user,password);
   req.login(registeredUser,err=>{
    if(err) return next(err);
    req.flash('success','Welcome to Yelp Camp');
   res.redirect('/campgrounds');
   })
   
    }
   catch (e) {
    if (e.name === 'UserExistsError') {
        req.flash('error', 'Username already exists');
    } 
    else if (e.code === 11000 && e.keyPattern.email) {
        req.flash('error', 'Email already registered');
    } 
    else {
        req.flash('error', 'Something went wrong');
    }
    res.redirect('/register');
}
}

module.exports.renderLogin=(req,res)=>{
    res.render('users/login');
}

module.exports.login=(req,res)=>{
    req.flash('success','Welcome back')
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logout=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}