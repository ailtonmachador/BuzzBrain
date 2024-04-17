const express = require('express');

const app = express();
const port = 3000; 
//import mongoose
const mongoose = require("mongoose");
require("/Users/ailto/Documents/computing science/3 YEAR/WEB TECHNOLOGIES/assigment3/models/posts-db")
require("/Users/ailto/Documents/computing science/3 YEAR/WEB TECHNOLOGIES/assigment3/models/users")
const User = mongoose.model("User");
const posts = mongoose.model("post");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
require("./config/auth")(passport);
const {isAdmin} = require("./helper/isAdmin"); //use function is admin
//const {isAdminCanSee} =  require("./helper/isAdmin"); //use function is admin

//set up
//Session
app.use(
  session({
      secret: "secret",
      resave: true,
      saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//middleware set up, use this for error msg
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;  //save the auth user (once he logged in), used for acess control
  next();
});


mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
.then(() => console.log('Connected!'));



const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

const handlebars = require('express-handlebars');

// Template Engine
app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')


//rotes
app.get('/home', (req, res) => {
  posts.find().sort({ publised_date: -1 }).limit(10).lean().then((post)=>{
    res.render('home', {post: post})
  });
 });

 //rotes
app.get('/admin-features/admin-post', (req, res) => {
  posts.find().lean().then((post)=>{
    res.render('home', {post: post})
  });
 });
 

  //delete post,  only admin can acess
  app.get("/posts/delete-post/:id",  isAdmin, (req, res) => {
    posts.deleteOne({_id: req.params.id}).then(()=>{
      req.flash("success_msg", "Post Deleted ");
      res.redirect("/home")
    })
  })

 
//add new post
app.get('/add-post', (req, res) => {
  res.render('add-post')
 });

 app.post('/addPost', (req, res) => {

  //getting data from html page
  const newPost = {
    title: req.body.title,
    autor: req.body.autor,
    post_text: req.body.post_text,
    publised_date: Date.now()
  };

  //creating db object
  new posts(newPost)
  .save()
  .then(() => {
      req.flash("success_msg", "Post Added");
      res.redirect("/home");
  })
  .catch((err) => req.flash("error_msg", "Error: " + err));

});

 
 //edit post,  only admin can acess
app.get("/home/editPost/:id", isAdmin, (req, res) => {
  posts.findOne({_id:req.params.id}).lean().then((post) => {    
    res.render("edit-post", {post: post});
  } )
 });

 //update post,  only admin can acess
app.post('/updatePost', isAdmin, (req, res) => { 
  //getting data from html 
  posts.findOne({_id:req.body.id}).then((post) => {
    post.title = req.body.title
    post.autor = req.body.autor
    post.post_text = req.body.post_text
    post
    .save() //save in the bd
  .then(() => {
      req.flash("success_msg", "Post Updated"); //sucessfull msg
      res.redirect("/home");  //redirect
  })
  } )
 });


 //read more button action
app.get("/posts/index/:id", (req, res) => {
  posts.findOne({_id:req.params.id}).lean().then((post) => {  //get the id in home page and find post with the same id,   
    res.render("posts/index", {post: post});                  //if it exist then create a page with the post
  } )
 });

 //users register
 app.get("/register", (req, res) => {
   res.render("user/register")
 });

 app.post("/register-validation", (req, res) =>{

  let errors = [];
  
  if (!req.body.name) errors.push({ text: "Invalid name" });

  if (!req.body.email) errors.push({ text: "Invalid email" });

  if (!req.body.password) errors.push({ text: "Invalid password" });

  if (req.body.password != req.body.password_confirmation)
      errors.push({ text: "Passwords do not match" });
  
  if (errors.length > 0) { //if no error
    res.render("user/register",  {errors: errors,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    password_confirmation: req.body.password_confirmation,
});


   } else{      
    User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        //show error msg
        req.flash("error_msg", "Email already registered");
        res.redirect("/register");
      }else{
            //getting data from html page
          const newUser = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          }

            //creating db object
            new User(newUser).save().then(()=>{
              console.log("new user saved!")              
              res.redirect("/login"); 
            })
        }
      });
          
          }
      
 });

//users login
app.get("/login", (req, res) => {
  res.render("user/login")
});

app.post("/user/login",(req, res, next) => {
 passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login",
  failureFlash: true
 })(req, res, next)
})

//logout
app.get("/logout", (req, res) => {
  req.logout(() => {}); // Logout 
  req.flash("success_msg", "You logged out"); 
  res.redirect("/login"); 
});




//admin features 
 app.get("/admin-features",isAdmin, (req, res) => {
  res.render("admin/admin-features")
});

//add new user from admin features
app.get("/admin-features/add-user",isAdmin, (req, res) => {
  res.render("admin/add-user")
//  res.render("user/register")
});

app.post("/register-validation-admin-form", (req, res) =>{
  console.log("add new user from admin page");
  let errors = [];
  //for admin register new user it is not necessary add password
  //password will be the same as email
  if (!req.body.name) errors.push({ text: "Invalid name" });
  if (!req.body.name) console.log("error name" + req.body.name)

  if (!req.body.email) errors.push({ text: "Invalid email" });
  if (!req.body.email) console.log("error email")
  
  if (errors.length > 0) { //if no error
    res.render("admin/add-user", {errors: errors})
    console.log("error!!")
   } else{      
    User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        console.log('email already registered')
      }else{
          
                  
           // Extracting isAdmin value from the request body
          const isAdminValue = req.body.opcao;

          // Converting isAdminValue to integer
          const isAdmin = parseInt(isAdminValue);
          
          //getting data from html page
          const newUser = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.email,
            isAdmin:  isAdmin
          }

            //creating db object
            new User(newUser).save().then(()=>{
              console.log("new user saved!")
              req.flash("success_msg", "New user Added");
              res.redirect('home');
            })
        }
      });          
          }    
 });

 //add new post from admin features
 //add new post
app.get('/admin-features/add-post', (req, res) => {
  res.render('add-post')
 });

 //search user 
 app.get('/admin-features/search-user',  (req, res) => {
  User.find().lean().then((user) =>{
  res.render("search-user", {user: user})
});
});

//edit user from admin features
 app.get("/admin-features/search-user/user-edit/:id", (req, res) => {
  User.findOne({_id:req.params.id}).lean().then((User) => {
    res.render("user-edit", {User: User});
  } )
 });


  //update user,  only admin can acess
 app.post('/updateUser', isAdmin, (req, res) => {
  console.log(req.body.name)
  
  User.findOne({_id:req.body.id}).then((user) => {
    user.name = req.body.name
    user.email = req.body.email    
    user.save().then(()=>{
      req.flash("success_msg", "User edited");  
      console.log("user saved!")
    })
  } )
  res.redirect('/admin-features/search-user')
 }); 
 

 //delete user,  only admin can acess
 app.get("/admin-features/search-user/user-delete/:id",  isAdmin, (req, res) => {
  User.deleteOne({_id: req.params.id}).then(()=>{
    req.flash("success_msg", "user deleted");
    res.redirect("/admin-features/search-user")
  })
})

app.get('/blog', (req, res) => {
  posts.find().lean().then((post)=>{
    res.render('blog', {post: post})
  });
 });


 

/*
 app.get("/home/:title",(req, res) =>{
  console.log("entrou");
    posts.findOne({_title:req.params.title}).then((post) => {
      if(post){
        console.log(post)
        res.render("posts/index", {post: post})

      }else{
        console.log("not found");
      }
    })
 });
*/


 
// get the date in the form
//app.post('/addPost', (req, res) => {   //addPost = forms name
  // Extraia os dados do corpo da requisição
 // const postData2 = req.body;
  //const addPostText = postData2.texto; // Acess input value by name

  // Registre o conteúdo do post no console
  //console.log('Conteúdo do novo 000> post:', addPostText);

  // Envie uma resposta adequada para o cliente (opcional)    
  //res.redirect('/home');
//});

/*
//add user
app.get('/add-user-form', (req, res) => {
  res.render('add-user-form')
 });

app.post('/addUserForm', (req, res) => {
    // Extraia os dados do corpo da requisição
    const postData = req.body;
    const addUserName = postData.adminAcess; // Acesse o valor do input 'postContent'

    // Registre o conteúdo do post no console
    console.log('nome user:', addUserName);
  
    // Envie uma resposta adequada para o cliente (opcional)    
    res.redirect('/home');
  });*/

// Rotas aqui
app.listen(port, () => console.log(`Servidor escutando na porta ${port}`));

  