const express = require('express');
var app=express();
app.set('view engine','ejs')
const morgan = require('morgan');
const path = require('path');
const model = require('./models/user')
const bodyParser=require('body-parser')
var sessions=require('client-sessions')
var hash=require('./routes/hash')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
//Intialising the Session Handler Middleware
app.use(sessions({
  cookieName:'session',
  secret:'dasvaudbviufbuijfba',
  duration:30*60*1000,
  activeDuration:1000*60*5

}))

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname,'/public')))

app.get('/',(req,res)=>{
  res.sendFile('C:/Users/acer/Desktop/Portal/views/index.html')
})

app.get('/login',(req,res)=>{
  res.render('login')
})
app.use((req,res,next)=>{
  if(req.session&&req.session.user){
    model.findOne({username:req.session.user.username},(err,response)=>{
      if(response)
      {
        req.user=response;
        // delete req.user.password; // delete the password from the session
          req.session.user = response;  //refresh the session value
          res.locals.user = response;

      }
next();
    })
  }
  else {
    next();
  }
})
//requirelogin function to check whether the user is still logged in or not to prevent from directly accessing the Database
requireLogin=(req,res,next)=>{
  if(!req.user)
  res.redirect('/')
  else {
    next();
  }
}
app.get('/dashboard',requireLogin,(req,res)=>{
  res.render('dashboard',{username:req.session.user.username})
})


app.get('/signup',(req,res)=>{
  res.render('signup')
})

app.post('/signup',(req,res)=>{
  const user = new model({
    name:req.body.name,
    email:req.body.email,
    username:req.body.username,
    password:req.body.password,
    confpassword:req.body.confpassword
  })
  if(user.password!= user.confpassword)
  res.status(400).json({message:'Both Passwords dont Match'})
  user.save((err,response)=>{
    if(err)
    res.status(400).send('Signup Failed'+err)
else {
    res.status(200).send('Succesfully'+response)}
  })
})

app.post('/login',(req,res)=>{
  model.findOne({username:req.body.username},(err,response)=>{
    if(!response){
    res.json({message:'<h1>Login failed ,User not Found</h1>'})
    res.redirect('/login')

}

    response.comparePasswords(req.body.password,(err,isMatch)=>{
      if(err)
      throw(err)
      if(!isMatch)
      res.status(400).json({message:"Wrong Password"})
      if(isMatch){
        req.session.user=response;
        res.redirect('/dashboard')

    }
    })

  }) })
//Update Password Route
app.get('/dashboard/changepw',(req,res)=>{
  res.render('sub/changepw')
})
var newpass
app.post('/dashboard/changepw',(req,res)=>{
if(!req.body.currentpass==req.session.user.password)
res.json({message:'<h1> The entered password does not match</h1>'})

hash.hash(req.body.newpass).then(function(result){
  console.log( result.hash)
  newpass=result.hash;
})
setTimeout( ()=>{ model.findOneAndUpdate({"username":req.session.user.username},{$set:{"password":newpass,"confpassword":req.body.newpass}},{new:true},(err,response)=>{
    if(err)
    console.log('An error occured while finding and updating the document');
if(response){
  console.log(response);
res.redirect('/dashboard')
}
})} ,500)

})


//Logout Path
app.get('/logout',(req,res)=>{
  req.session.reset();
  res.redirect('/')
})








app.listen(8080,()=>{
  console.log('Succesfully connected to Port 8080');
})
