const express = require('express');
var app=express();
app.set('view engine','ejs')
const morgan = require('morgan');
const path = require('path');
const model = require('./models/user')
const bodyParser=require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))


app.use(morgan('dev'))
app.use(express.static(path.join(__dirname,'/public')))

app.get('/',(req,res)=>{
  res.sendFile('C:/Users/acer/Desktop/Portal/views/index.html')
})

app.get('/login',(req,res)=>{
  res.render('login')
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
    res.status(200).send('Signup Succesfully'+response)}
  })
})

app.post('/login',(req,res)=>{
  model.findOne({username:req.body.username},(err,response)=>{
    if(!response){
    res.json({message:'<h1>Login failed ,User not Found</h1>'})

}

    response.comparePasswords(req.body.password,(err,isMatch)=>{
      if(err)
      throw(err)
      if(!isMatch)
      res.status(400).json({message:"Wrong Password"})
      if(isMatch)
      res.status(200).send('<h1>Logged in Succesfully</h1>')
    })

  }) })











app.listen(8080,()=>{
  console.log('Succesfully connected to Port 8080');
})
