const mongoose = require('mongoose');
var bcrypt=require('bcryptjs')
let SALT=10;
mongoose.connect('mongodb://localhost:27017/Portal',{useNewUrlParser: true})
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
    },
    cpi:{
      type:String,
      default:'Not Entered'
    },
    Internexp:{
      type:String,
      default:'Not Entered'
    },
    Internchoice:{
      type:String,
      default:'Not Entered'
    },
    metricmarks:{
      type:String,
      default:'Not Entered'
    },
    boardmarks:{
      type:String,
      default:'Not Entered'
    },
    jeerank:{
      type:Number
    },
    internpref1:{
      type:String,
      default:'Not Entered'
    },
    internpref2:{
      type:String,
      default:'Not Entered'
    },
    internpref3:{
      type:String,
      default:'Not Entered'
    },
    internpref4:{
      type:String,
      default:'Not Entered'
    },
    software:{
      type:Array
    },
    personalskills:{
      type:Array
    }

})
//Creating the pre save functionalities
Schema.pre('save',function(next){
var user = this;

//checking whether user is available or not
model.find({username:user.username},function (err,docs) {
if(!docs.length){
console.log('Finding whether the username exists or not ');
next()}
else {
  console.log('User Exisits'+user.username);
  next(new Error('Username already exists'))
}
})

//10th 12th marks
//Jee advanced rank :::::Intern Preference 4 :::: Previous Internship
//SKills :: SOftwares known ,programming languages known
//Achievement :::Optional paper ///conference


//Genrating the hashing logic
if(user.isModified('password'))
{
  bcrypt.genSalt(SALT,function(err,salt){
  if(err)
  console.log('An error occured while genereating salt');
console.log('now hashing Starts');
  bcrypt.hash(user.password,salt).then(function(hash){    // Use user.password.plaintext instead of user.password otherwise it will not work . Don't know why But its important to note
console.log('Hashing Succesfull The Hashed Password is '+hash);
    user.password=hash;
    next();
  }).catch((e)=>{
    if(e)
    return console.log('an error occured while generating hash');
  })
})

}
else {
  next()
}
})

// comparing Passwords with login
Schema.methods.comparePasswords=function(enteredPassword,CheckPassword){
console.log(enteredPassword+this.password);
  bcrypt.compare(enteredPassword,this.password,function(err,isMatch){
    if(err)
    return CheckPassword(err)
    CheckPassword(null,isMatch)
  })
}
exports.hash =function(password){
  bcrypt.hash(password,salt,function(err,hash){
    if(err)
    throw err
return hash
  })
}




Schema.methods.getDetails=function(){
  const details={
    cpi:this.cpi,
    Interexp:this.Internexp,
    Interchoice:this.Internchoice,
    username:this.username
  }

  return details;

}





var model=mongoose.model('model',Schema);


module.exports=model;
