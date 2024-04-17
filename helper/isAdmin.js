module.exports = {
    //check if user is logged in and if user is admi
    isAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdmin === 1) {
            return next();
        }
        req.flash("error_msg", "You must be an admin to do that!");
        res.redirect("/");
    }
/*
    isAdmin2: (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdmin === 1) {
            return next();
        }
        req.flash("error_msg", "You must be an admin to do that!");
        res.redirect("/");
    }*/

}