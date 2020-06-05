const express = require('express');
const request = require('request');
const bodyParser = require('body-parser')
const middleware = require('./src/middleware');

require('dotenv').config();

const app = express();
app.use(express.json())

const port = process.env.PORT || 8000;

app.get('/',(req,res)=>{
  res.status(200).json({
    message:'Hello daraja!!!'
  })
});

app.get('/access_token',access,(req,res)=>{
  res.status(200).json({access_token: req.access_token})
});


app.get('/register', access, (req, resp) => {
  let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
  let auth = "Bearer " + req.access_token

  request(
      {
          url: url,
          method: "POST",
          headers: {
              "Authorization": auth
          },
          json: {
              "ShortCode": "600383",
              "ResponseType": "Complete",
              "ConfirmationURL": "http://197.248.86.122:801/confirmation",
              "ValidationURL": "http://197.248.86.122:801/validation"
          }
      },
      function (error, response, body) {
          if (error) { console.log(error) }
          resp.status(200).json(body)
      }
  )
})


app.post('/confirmation', (req, res) => {
  console.log('....................... confirmation .............')
  console.log(req.body)
})

app.post('/validation', (req, res) => {
  console.log('....................... validation .............')
  console.log(req.body)
})

app.get('/simulate',access,(req,res)=>{
  let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate"
  let auth ="Bearer "+req.access_token
  request({
    url:url,
    method:'POST',
    headers:{
      "Authorization": auth
    },
    json:{
      "ShortCode":"600383",
      "CommandID":"CustomerPayBillOnline",
      "Amount":"100",
      "Msisdn":"254708374149",
      "BillRefNumber":"testAPI"
    }
  },
  function(error,response,body){
    if(error){
      console.log(error)
    }
    else{
      res.status(200).json(body)
    }
  }
  )

})

app.get('/balance', access, (req, resp) => {
  let url = "https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query"
  let auth = "Bearer " + req.access_token

  request(
      {
          url: url,
          method: "POST",
          headers: {
              "Authorization": auth
          },
          json: {
              "Initiator": "apitest342",
              "SecurityCredential": "Q9KEnwDV/V1LmUrZHNunN40AwAw30jHMfpdTACiV9j+JofwZu0G5qrcPzxul+6nocE++U6ghFEL0E/5z/JNTWZ/pD9oAxCxOik/98IYPp+elSMMO/c/370Joh2XwkYCO5Za9dytVmlapmha5JzanJrqtFX8Vez5nDBC4LEjmgwa/+5MvL+WEBzjV4I6GNeP6hz23J+H43TjTTboeyg8JluL9myaGz68dWM7dCyd5/1QY0BqEiQSQF/W6UrXbOcK9Ac65V0+1+ptQJvreQznAosCjyUjACj35e890toDeq37RFeinM3++VFJqeD5bf5mx5FoJI/Ps0MlydwEeMo/InA==",
              "CommandID": "AccountBalance",
              "PartyA": "601342",
              "IdentifierType": "4",
              "Remarks": "bal",
              "QueueTimeOutURL": "http://197.248.86.122:801/bal_timeout",
              "ResultURL": "http://197.248.86.122:801/bal_result"
          }
      },
      function (error, response, body) {
          if (error) {
              console.log(error)
          }
          else {
              resp.status(200).json(body)
          }
      }
  )
})
app.post('/timeout_url',(req,res)=>{
  console.log("============Balance Response ==========")
  console.log(req.body)
})
app.post('/result_url',(req,res)=>{
  console.log("================Balance Response=====================")
  console.log(req.body)
})

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