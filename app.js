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
const updater=require('./routes/updater')
const multer = require('multer')
const mongoose=require('mongoose')
const profile=require('./routes/download-handler')

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
    cb(null,file.fieldname +'-'+req.session.user.username+ path.extname(file.originalname))
  }
})
const storage=multer.diskStorage({
  destination:'./public/uploads/',
  filename:function(req,file,cb){
    cb(null,file.fieldname +'-'+req.session.user.username+path.extname(file.originalname))
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
  res.sendFile('views/index.html',({root:__dirname}))
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
var profileStatus
    res.render('dashboard',{
      name:req.session.user.name,
    image:`/uploads/image-${req.session.user.username}.jpg`,
    cpi:req.session.user.cpi,
  Internexp:req.session.user.Internexp,
internpref1:req.session.user.internpref1,
internpref2:req.session.user.internpref2,
internpref3:req.session.user.internpref3,
internpref4:req.session.user.internpref4,})
})


app.get('/signup',(req,res)=>{
  res.render('signup')
})

app.post('/signup',(req,res)=>{
  const user = new model({
    name:req.body.name,
    email:req.body.email,
    rollno:req.body.rollno,
    username:req.body.username,
    password:req.body.password,
    confpassword:req.body.confpassword
  })
  if(user.password!= user.confpassword)
  res.render('error',{error:'Both passwords dont Match'})

    user.save((err,response)=>{
    if(err)
    res.render('error',{error:err})
else {
    res.status(200).render('sub/Signupsuccesfull')}
  })
}
)

app.post('/login',(req,res)=>{
  model.findOne({username:req.body.username},(err,response)=>{
    if(!response){
    // res.json({message:'<h1>Login failed ,User not Found</h1>'})
    res.render('error',{error:err})

}

    response.comparePasswords(req.body.password,(err,isMatch)=>{
      if(err)
      throw(err)
      if(!isMatch)
      res.render('error',{error:'Wrong password'})
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
res.sendFile('sub/details.html',{root:path.join(__dirname,'views')})
})
app.post('/dashboard/details',(req,res)=>{
updater.updater(req,res,model)

})
//Download Important Files Route
app.get('/dashboard/download',(req,res)=>{
res.sendFile('views/sub/downloads.html',{root:__dirname})
})
app.get('/dashboard/placement',(req,res)=>{
    profile.placement(res);
})
app.get('/dashboard/intern',(req,res)=>{
  profile.intern(res);
})
app.get('/dashboard/policies',(req,res)=>{
  profile.policies(res);
})
app.get('/dashboard/forms',(req,res)=>{
  profile.forms(res);
})


//Logout Path
app.get('/logout',(req,res)=>{
  req.session.reset();
  res.redirect('/')
})

//Connecting to The Server
app.listen(8080,()=>{
  console.log('Succesfully connected to Port 8080');
})
