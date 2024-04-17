const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");

require("../models/users");
const User = mongoose.model("User");

module.exports = (passport) => {
  passport.use(
    new localStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email }); // Use await with findOne

          if (!user) {
            return done(null, false, { message: "That email is not registered" });
          }

        
          if (user.password === password) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password incorrect" });
          }
        } catch (err) {
          console.error("Error authenticating user:", err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => done(null, user))
      .catch((err) => done(err)); 
  });
};
