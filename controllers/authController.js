
const client = require('../config');
const bcrypt= require('bcrypt');
var validator = require('validator');
const jwt = require('jsonwebtoken')
module.exports = {
    async signupPatient(req,res) {

        console.log(req.body)
        try {

            const {
                phoneNo,
                password
            } =req.body;
        
            if(!phoneNo || !password)
                return res.send({
                    success:false,
                    status:500,
                    err:"Please enter all the fields",
                    response:null
        
                })
            if(!validator.isMobilePhone(phoneNo))
                return res.send({
                    success:false,
                    status:500,
                    err:"Please enter a valid phone number",
                    response:null
                })
            const hashedPassword = await bcrypt.hash(password,10);
        
            const insertAuthRow = 'Insert Into authpatients(id,phoneno,password,isloggedin,isregistered,createdat) Values(uuid(),?,?,false,false,toTimestamp(now())) If Not Exists;';
    
            const result = await client.execute(insertAuthRow,[phoneNo,hashedPassword],{prepare:true});
            
            if(!result.rows[0]['[applied]'])
                return res.send({
                    success:false,
                    status:500,
                    err:"Phone number already exists,Please login",
                    response:null
                })
            const fetchAuthUser = 'Select * From authpatients Where phoneno=?';
    
            const {password:password2,...data} =await client.execute(fetchAuthUser,[phoneNo],{prepare:true}).then(response => response.rows[0]);
    
            return res.send({
                success:true,
                status:200,
                err:null,
                response:{...data}
            })
    
    
    
        }
        catch(err) {
            return res.send({
                success:false,
                status:500,
                err:err.message,
                response:null
            })
        }
    },
    async loginPatient(req,res) {

        try {
            const {
                phoneNo,
                password
            } = req.body;

            console.log(req.body)
            if(!phoneNo || !password)
                return res.send({
                    success:false,
                    status:500,
                    err:"Please enter all the fields",
                    response:null
                })
            
            if(!validator.isMobilePhone(phoneNo))
                return res.send({
                    success:false,
                    status:500,
                    err:"Please enter a valid phone Number",
                    response:null
                })
            const fetchAuthPatient = 'Select * From authpatients Where phoneno=?';
    
            const result = await client.execute(fetchAuthPatient,[phoneNo],{prepare:true}).then(response => response.rows);
    
            if(result.length===0)
                return res.send({
                    success:false,
                    status:500,
                    err:"User doesn't exists,Please do signup",
                    response:null
                })
            
            const isPasswordValid = await bcrypt.compare(password,result[0].password);
    
            if(!isPasswordValid)
                return res.send({
                    success:false,
                    status:500,
                    err:"Incorrect credentials",
                    response:null
                })
            
            const payload = {
                phoneNo:phoneNo,
                password:password
            }
    
            
    
            const accessToken = jwt.sign(payload,process.env.SECRET,{ expiresIn : '2 days'});
    
            
    
            const updateAuthPatient = 'Update authpatients Set isloggedin=true,accessToken=? Where phoneno=?';
    
            const resultUpdate = await client.execute(updateAuthPatient,[accessToken,phoneNo],{prepare:true});
    
            const {password:password2,accesstoken,createdat,isloggedin,...data}=result[0];
    
            return res.send({
                success:true,
                status:200,
                err:null,
                response:{
                    message:"Logged In Successfully",
                    data:{
                        ...data,
                        isloggedin:true,
                        accesstoken:accessToken
                    }
                }
            })
    
        }
        catch(err) {
            return res.send({
                success:false,
                status:500,
                err:err.message,
                response:null
            })
        }
    },
    async logoutPatient(req,res) {
       
        try{
            const { phoneNo } = req.query;
            // console.log(phoneNo)
            const updateLogout = 'Update authpatients Set isloggedin=false Where phoneno=?';
    
            const result = await client.execute(updateLogout,[phoneNo],{prepare:true});
    
            return res.send({
                success:true,
                status:200,
                err:null,
                response:"Logged out successfully"
            });
        }
        catch(err) {
            return res.send({
                success:false,
                status:500,
                err:err.message,
                response:null
            })
        }
        
    },
    async signupDoctor(req,res) {
        try {

            const {
                phoneNo,
                password
            } =req.body;
        
            if(!phoneNo || !password)
                return res.send({
                    success:false,
                    status:500,
                    err:"Please enter all the fields",
                    response:null
        
                })
            if(!validator.isMobilePhone(phoneNo))
                return res.send({
                    success:false,
                    status:500,
                    err:"Please enter a valid phone number",
                    response:null
                })
            const hashedPassword = await bcrypt.hash(password,10);
        
            const insertAuthRow = 'Insert Into authdoctors(id,phoneno,password,isloggedin,isregistered,createdat) Values(uuid(),?,?,false,false,toTimestamp(now())) If Not Exists;';
    
            const result = await client.execute(insertAuthRow,[phoneNo,hashedPassword],{prepare:true});
            
            if(!result.rows[0]['[applied]'])
                return res.send({
                    success:false,
                    status:500,
                    err:"Phone number already exists,Please login",
                    response:null
                })
            const fetchAuthUser = 'Select * From authdoctors Where phoneno=?';
    
            const {password:password2,...data} =await client.execute(fetchAuthUser,[phoneNo],{prepare:true}).then(response => response.rows[0]);
    
            return res.send({
                success:true,
                status:200,
                err:null,
                response:{...data}
            })
    
    
    
        }
        catch(err) {
            return res.send({
                success:false,
                status:500,
                err:err.message,
                response:null
            })
        }
    },
    async loginDoctor(req,res) {
        try {
            const {
                phoneNo,
                password
            } = req.body;
    
            if(!phoneNo || !password)
                return res.send({
                    success:false,
                    status:500,
                    err:"Please enter all the fields",
                    response:null
                })
            
            if(!validator.isMobilePhone(phoneNo))
                return res.send({
                    success:false,
                    status:500,
                    err:"Please enter a valid phone Number",
                    response:null
                })
            const fetchAuthDoctor = 'Select * From authdoctors Where phoneno=?';
    
            const result = await client.execute(fetchAuthDoctor,[phoneNo],{prepare:true}).then(response => response.rows);
    
            if(result.length===0)
                return res.send({
                    success:false,
                    status:500,
                    err:"User doesn't exists,Please do signup",
                    response:null
                })
            
            const isPasswordValid = await bcrypt.compare(password,result[0].password);
    
            if(!isPasswordValid)
                return res.send({
                    success:false,
                    status:500,
                    err:"Incorrect credentials",
                    response:null
                })
            
            const payload = {
                phoneNo:phoneNo,
                password:password
            }
    
            
    
            const accessToken = jwt.sign(payload,process.env.SECRET,{ expiresIn : '2 days'});
    
            
    
            const updateAuthDoctor = 'Update authdoctors Set isloggedin=true,accessToken=? Where phoneno=?';
    
            const resultUpdate = await client.execute(updateAuthDoctor,[accessToken,phoneNo],{prepare:true});
    
            const {password:password2,accesstoken,createdat,isloggedin,...data}=result[0];
    
            return res.send({
                success:true,
                status:200,
                err:null,
                response:{
                    message:"Logged In Successfully",
                    data:{
                        ...data,
                        isloggedin:true,
                        accesstoken:accessToken
                    }
                }
            })
    
        }
        catch(err) {
            return res.send({
                success:false,
                status:500,
                err:err.message,
                response:null
            })
        } 
    },
    async logoutDoctor(req,res) {
        try{
            const { phoneNo } = req.query;
            const updateLogout = 'Update authdoctors Set isloggedin=false Where phoneno=?';
    
            const result = await client.execute(updateLogout,[phoneNo],{prepare:true});
    
            return res.send({
                success:true,
                status:200,
                err:null,
                response:"Logged out successfully"
            });
        }
        catch(err) {
            return res.send({
                success:false,
                status:500,
                err:err.message,
                response:null
            })
        }
    }
}