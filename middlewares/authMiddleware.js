const router = require('express').Router({mergeParams:true});
const jwt = require('jsonwebtoken');
module.exports = async function(req,res,next) {
    
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.send({
            success:false,
            status:500,
            err:"No authorization header",
            response:null
        })
    const [scheme,token] = authHeader.split(' ');

    

    if(!scheme || !token || scheme!='Bearer')
        return res.send({
            success:false,
            status:500,
            err:"Invalid authorization header",
            response:null
        })
    console.log("TOKEN",token)
    jwt.verify(token,process.env.SECRET,(err,decoded) => {
        if(err)
            return res.send({
                success:false,
                status:401,
                err:"Token invalid",
                response:null
            });
        
        next();
    })


}