const express = require('express');
var app=express();
app.set('view engine','ejs')
const morgan = require('morgan');
const path = require('path');
const model = require('./models/user')
const queryString=require('query-string')
const bodyParser=require('body-parser')
var sessions=require('client-sessions')
var hash=require('./routes/hash')
const multer = require('multer')

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
//Setting up Multer
//Setting Up Storage Engine
const storage1=multer.diskStorage({
  destination:'./public/uploads/',
  filename:function(req,file,cb){
    cb(null,file.fieldname +'-'+req.session.user.name+ path.extname(file.originalname))
  }
})
const storage=multer.diskStorage({
  destination:'./public/uploads/',
  filename:function(req,file,cb){
    cb(null,file.fieldname +path.extname(file.originalname))
  }
})
//Setting Up the upload Engine for resume
const upload1=multer({
  storage:storage1,
  limits:{filesize:10000000},
  fileFilter:(req,file,cb)=>{
    checkFileType(file,cb)
  }
}).single('resume')
// Setting up the upload engine for the image uploading routes
const upload=multer({
  storage:storage,
  limits:{filesize:10000000},

}).single('image')
//Checking FileType
checkFileType=(file,cb)=>{
  const fileTypes= /pdf|jpg/;
  const extname =fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype=fileTypes.test(file.mimetype)

  if(extname&&mimetype)
  {
    return cb(null,true)
  }else {
    cb("Eror: PDFs only")
  }
}
//HOMEPAGE Route
app.get('/',(req,res)=>{
  res.sendFile('C:/Users/acer/Desktop/Portal/views/index.html')
})
//Login Route
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
  const prof=require('./routes/profile')
  prof.findOne({username:req.session.user.username},(err,response)=>{
    if(err)
    console.log('Unable to find the aforementioned username');
    console.log('Username Found the 2nd Database is up and running');
    req.session.userDetails=response
    console.log(req.session.userDetails);
  })
  setTimeout(()=>{
    res.render('dashboard',{name:req.session.user.name,
    image:'/uploads/image.jpg',
    cpi:req.session.userDetails})
  },800)
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
    res.status(200).render('sub/Signupsuccesfull')}
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
//Upload Your Resume Route
app.get('/dashboard/upload',(req,res)=>{
  res.render('sub/upload')
})

app.post('/dashboard/upload',(req,res)=>{
  upload1(req,res,(err)=>{
    if(err)
    {
      console.log(err);
    res.render('sub/upload',{
      msg:err
    });
  }
    else {
        if(req.file===undefined)
        {
          res.render('sub/upload',{
            msg:'Error: No File Selected '
          })
        }else {
          res.render('sub/upload',{
            msg:'Resume Uploaded Succesfully '
          })
        }
    }
  })

})
//Upload your Profile pic routes
app.get('/dashboard/uploadimg',(req,res)=>{
  res.render('sub/uploadimg')
})
app.post('/dashboard/uploadimg',(req,res)=>{
  upload(req,res,(err)=>{
    if(err){
      res.render('sub/uploadimg',{
        msg:err
      })
    }else {
      if(req.file==undefined)
      res.render('sub/uploadimg',{
        msg:'Error : No file Selected why'

      })
      else {
        res.render('sub/uploadimg',{
          msg:'Photo Uploaded Succesfully'
        })
      }
    }
  })
})
//announcement routes
app.get('/dashboard/announcement',(req,res)=>{
  res.render('sub/announcement')
})
//Complete OYur Profile routes
app.get('/dashboard/details',(req,res)=>{
res.sendFile('C:/Users/acer/Desktop/Portal/views/sub/details.html')
})
app.post('/dashboard/details',(req,res)=>{
  const profile=require('./routes/profile')
  var details=new profile({
    cpi:req.body.cpi,
    Internexp:req.body.Internexp,
    Internchoice:req.body.Internchoice,
    username:req.session.user.username
  })
  details.save((err,response)=>{
    if(err){
      res.json({msg:'Unable to Save User details'})
    }
    else {
    console.log('The Information about the user has been saved');
    }
  })
  res.redirect('/dashboard')
})
//Logout Path
app.get('/logout',(req,res)=>{
  req.session.reset();
  res.redirect('/')
})








app.listen(8080,()=>{
  console.log('Succesfully connected to Port 8080');
})
