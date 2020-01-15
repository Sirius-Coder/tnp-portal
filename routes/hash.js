var bcrypt=require('bcryptjs')
let SALT=10
// exports.hash=function(password){
//
//   bcrypt.genSalt(SALT,(err,salt)=>{
//     if(err)
//     throw error;
//     bcrypt.hash(password,salt,(err,hash)=>{
//       if(err)
//       throw err;
//       console.log(hash);
//       return (hash.toString())
//
//     })
//
//   })
//
// }
function hash(password) {
    return new Promise((resolve,reject) => {
        bcrypt.hash(password,SALT,function(err,hash) {
            if (err) {
                reject(err);
            }
            else {
            
                resolve({
                    salt:SALT,
                    password:password,
                    hash:hash
                });
            }
        });
    });
}

module.exports.hash=hash;
