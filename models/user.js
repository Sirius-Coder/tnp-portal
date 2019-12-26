const mongoose = require('mongoose');
var bcrypt=require('bcryptjs')
let SALT=10;
mongoose.connect('mongodb://localhost:27017/Portal')
const db =mongoose.connection
db.once('open',()=>{
  console.log('Database Connection Established');
})
db.on('error',(err)=>{
  console.error(err);
})
//Creating the Schema
const Schema = new mongoose.Schema({
  name:{
  type:String,
  },
  email: {
    type: String,
  },
  username: {
      type: String,
      unique:true
    },
    password: {
      type: String,
    },
    confpassword:{
      type:String,
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
})
//Creating the pre save functionalities
Schema.pre('save',function(next){
var user = this;

//checking whether user is available or not
model.find({username:user.username},function (err,docs) {
if(!docs.length){
console.log(docs);
next()}
else {
  console.log('User Exisits'+user.username);
  next(new Error('Username already exists'))
}
})




//Genrating the hashing logic
if(user.isModified('password'))
{
bcrypt.genSalt(SALT,function(err,salt){
  if(err)
  console.log('An error occured while genereating salt');

  bcrypt.hash(user.password.plaintext,salt,function(err,hash){    // Use user.password.plaintext instead of user.password otherwise it will not work . Don't know why But its important to note
    if(err)
    return console.log('an error occured while generating hash');
    user.password.plaintext=hash;
    next();
  })
})
}
else {
  next()
}
})

// comparing Passwords with login
Schema.methods.comparePasswords=function(enteredPassword,CheckPassword){

  bcrypt.compare(enteredPassword,this.password,function(err,isMatch){
    if(err)
    return CheckPassword(err)
    CheckPassword(null,isMatch)
  })
}






var model=mongoose.model('model',Schema);

module.exports=model;
