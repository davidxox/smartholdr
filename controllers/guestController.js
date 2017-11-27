var moment = require('moment');
var async = require('async');
var mailer = require("nodemailer");
var smtpTransportModule = require('nodemailer-smtp-transport');
var smtpTransport = mailer.createTransport(smtpTransportModule({
    host: 'ssl0.ovh.net',
    port: 465,
    secure: true, // use SSL
    auth: {
          user: 'contact@smartholdr.fr',
          pass: 'Holdr2017$'
          }
     })
  );  
  var path = require('path');
  var formidable = require('formidable');
  var cloudinary = require('cloudinary');
  cloudinary.config({
    cloud_name: 'dc3jo4fu4',
    api_key: '493632325584453',
    api_secret: 'SiXGVYGxEhhnKZaYyMp3cThwi7U'
  });
  var fs = require('fs');
  var stripe = require('stripe')('sk_test_EEUy69P0Chk3UpfThwP0IzWP');

function sendEmail(req, res) {
  var email = req.query.email;
    var content = req.query.content;
    var name = req.query.name;
              var mail = {
                   from: email, 
                    to: 'contact@smartholdr.fr',
                    subject: "Une nouvelle demande de contact",
                    html: "Bonjour,<br />Une nouvelle demande de contact de "+name+" ("+email+") a été effectuée.<br /> "+content
                }; 
                    smtpTransport.sendMail(mail, function(error, response){
                    if(error){
      res.status(403).send({
        message: "Error when sending the email: "+error
      });
                    } else {
                        res.status(201).send({
                          message: "Email send with sucess !"
                        });
                    }
                    smtpTransport.close();
                });
}
function uploadImage(req, res) {

  var id = Math.random().toString(36).substr(2, 6);
  
  
  
  
      var form = new formidable.IncomingForm();
      form.multiples = true;
      form.uploadDir = path.join('./uploads/');
    
      form.on('file', function(field, file) {
        
        fs.rename(file.path, path.join(form.uploadDir, field+ '_idanimal_'+id+'.jpg'), function (result) { console.log("Result: " +result);  });
        cloudinary.uploader.upload(path.join(form.uploadDir, field+ '_idanimal_'+id+'.jpg'), function(result) { 
  res.status(201).json({message : "success", "path": result.url});
  
  
  
      });
      
        })
    form.on('error', function(err) {
      console.log('An error has occured: \n' + err);
      res.status(404).send({message : "An error : "+err});
    });
  
    // parse the incoming request containing the form data
    form.parse(req);
  

}

function chargeClient(req, res) {
  var mail = req.body.email;

  stripe.customers.create({
    description: 'Smart Holdr',
    email : mail,
    shipping : {
      address : {
        country: "FR",
        line1 : req.body.adress,
        postal_code : req.body.zipcode,
      },
      name : req.body.name,
      phone : req.body.phone
    },
    source: req.body.stripeToken.id // obtained with Stripe.js
  }, function(err, customer) {
      if(err) res.status(404).send({message : "Error in the Stripe API : "+err});
      stripe.charges.create({
        amount: req.body.amount,
        currency: 'eur',
        customer: customer.id
      }, function(err, charge) {

        if(charge.paid) { 
          


          var mail = {
            from: "contact@smartholdr.fr", 
             to: 'david.xox@gmail.com, adrian.zerbib@etu-webschoolfactory.fr',
             subject: "Une nouvelle commande a été prise",
             html: "Bonjour, <br /> Une nouvelle commande vient d'être prise, voici les détails"
         }; 
             smtpTransport.sendMail(mail, function(error, response){
             if(error){
                console.log(error);
             } else {
                 console.log("success");
             }
             smtpTransport.close();
            })
            var mail = {
              from: "SmartHoldr <contact@smartholdr.fr>", 
               to: mail,
               subject: "Votre commande est confirmé",
               html: "Bonjour, <br /> Merci d'avoir commandé chez Smart Holdr. <br />Votre commande est confirmé, vous serez tenu informé de son avancé.<br /><br />L'équipe Smart Holdr"
           }; 
               smtpTransport.sendMail(mail, function(error, response){
               if(error){
                  console.log(error);
               } else {
                   console.log("success to the cust");
               }
               smtpTransport.close();
              })

          res.send({message : "success"}) 
      
      } else {
        res.status(404).send({message : "Error in the Stripe API ; no debit"});
      }
      })
  
    })


}


function testReq(req, res) {
  var test = req.body.test;

    res.send({message : test});
}

module.exports = {
  sendEmail,
  uploadImage,
  testReq,
  chargeClient
};