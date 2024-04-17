const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//model -> table name
const post = new Schema({
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
publised_date:{
  type: Date,
  default: Date.now 
}
});

//collection
mongoose.model('post', post );
