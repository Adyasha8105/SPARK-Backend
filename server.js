const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

require('./config')
require('dotenv').config();
const baseRouter = require('./router/baseRouter');
const authRouter = require('./router/authRouter')
const app = express();
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())



app.use('/',baseRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT,()=>{
  console.log("Fired at 8000")
})

