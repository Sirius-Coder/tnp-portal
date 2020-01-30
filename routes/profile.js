const mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/profile',{useNewUrlParser: true})
const db=mongoose.connection
db.on('open',()=>{
  console.log('Database Connection for Storing User information has been established ');
})
db.once('error',(err)=>{
  console.log('An error has occured while establishing a conncetion to the user information storing Database');
})

const profile= new mongoose.Schema({
  cpi:{
    type:Number,
    default:0
  },
  Internexp:{
    type:String,
    default:'Not Entered'
  },
  Internchoice:{
    type:String,
    default:'Not Entered'
  },
  username:{
    type:String
  }

})

profile.methods.getDetails=function(){
  const details={
    cpi:this.cpi,
    Interexp:this.Internexp,
    Interchoice:this.Internchoice,
    username:this.username
  }
  mongoose.connection.close(()=>{
    console.log('The Connection for the second database had been closed');
  })
  return details;

}

var model=mongoose.model('profile',profile)
profile.post('save',function(){
console.log('The Database for Storing the users Database has been closed');
  mongoose.connection.close(()=>{
    console.log('The second datbase has been closed');
  })

})

profile.post('find',function(){
  console.log('The Database for Storing the users Database has been closed');
    mongoose.connection.close(()=>{
      console.log('The second database has been closed');
    })
})
module.exports=model;
