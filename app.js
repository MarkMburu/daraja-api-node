const express = require('express');
const request = require('request');
const middleware = require('./src/middleware');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 8000;

app.get('/',(req,res)=>{
  res.status(200).json({
    message:'Hello daraja!!!'
  })
});

app.get('/access_token',access,(req,res)=>{
  res.status(200).json({access_token: req.access_token})
});

function access(req,res,next){
  // access token here
  url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
  auth = "Basic " + new Buffer(process.env.CONSUMER_KEY + ":" + process.env.CONSUMER_SECRET).toString("base64");
  
  request(
    {
      url : url,
      headers : {
        "Authorization" : auth
      }
    },(error,response,body)=>{
      if(error){
        console.log(error)
      }
      else{
        req.access_token = JSON.parse(body).access_token;
        next()
      }
    })
}


app.use(middleware.notFound);
app.use(middleware.errorHandler);

app.listen(port,(err,live)=>{
  if(err){
    console.error(err)
  }
  console.log(`Server running on port ${port}`);
});