require('./config')
require('dotenv').config();

const { Client } = require("cassandra-driver");

const path='./secure-connect-sparkdb.zip'

const client = new Client({
    cloud: {
    secureConnectBundle: path
    },
    credentials: {
    username: `${process.env.SPARKUSERNAME}`,
    password: `${process.env.SPARKPASSWORD}`,
    },
    keyspace:`${process.env.KEYSPACE}`
    });


    client.connect().then(()=>{
    console.log("Connected with Database")
    }).catch(err => console.log(err));

   


module.exports = client ;