//connection mongodb
// Using Node.js `require()`
const mongoose = require('mongoose');

mongoose.Promise = global;

//schame name/database name
mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
  .then(() => console.log('Connected!'));


//model -> table name
const comentarios = mongoose.Schema({
 title: {
    type: String,
    require: true
 },
 autor:{
    type: String,
    require: true
 },
 post_text:{
   type: String,
   require: true
},
 like: {
   type: Number
 },
 deslike: {
   type: Number
 } 
});

//collection
mongoose.model('coment', comentarios );

//need to create new post
const postagem = mongoose.model('post')

//create a new user
new postagem({
    title: "titulooo",
    autor: "pedro alvares",
    post_text: "este descobriu o brasil",  
    like: 1,
    deslike: 2    
}).save().then(() => console.log('usuario cadastrado!'));