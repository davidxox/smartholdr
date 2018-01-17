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
  var stripe = require('stripe')('sk_live_bcDkPD5Pizet14aPRVhM8X10');

function sendEmail(req, res) {
  var email = req.body.email;
    var content = req.body.content;
    var name = req.body.name;
    console.log(email, content, name);
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
        if(err) res.status(404).send({message : "Error in the Stripe API : "+err});
        if(charge) { 
          var amount_correct = req.body.amount/100;
          
          var html_for_bib = '<div style="text-align:center;">'+
          '<img src="https://smartholdr.fr/img/logo.png" /></div><br />'+
          'Bonjour,<br />'+
          'Une nouvelle commande vient d\'être réalisée pour un montant de '+amount_correct+' € TTC. <br />'+
          'Voici les informations de la commande :<br /> '+
          '<b>Logo de l\'entreprise</b> : '+req.body.img+' <br />'+
          '<b>Couleur choisie</b> : '+req.body.color + '<br />'+
          '<b>Quantité</b>: '+req.body.quantity + '<br />'+
          '<b>E-mail </b>: '+req.body.email +' <br />'+
          '<b>Entreprise</b> : '+req.body.entreprise+' <br />'+
          '<b>Nom du contact</b> : '+req.body.name + ' <br />'+
          '<b>Livraison Express</b> : '+req.body.express + ' <br />'+
          '<b>Adresse</b> : '+req.body.adress + ' '+req.body.city + ' '+req.body.zipcode + ' France <br />'+
          '<b>Commentaire</b> : '+req.body.comment + ' <br />'+
          'Cordialement';

          var html_cust= '<div style="text-align:center;">'+
          '<img src="https://smartholdr.fr/img/logo.png" /></div><br />'+
          'Bonjour,<br />'+
          'Votre commande pour un montant de '+amount_correct+' € TTC est confirmé.<br />'+
          'Veuillez nous envoyer un fichier de votre logo vectorisé (au format .ai) par e-mail.<br /> '+
          'Vous recevrez prochainement une facture pro forma sur votre boite e-mail.'+
          '<br />L\'équipe Smart Holdr <br /> -- <br />Société AC Collection <br />Numéro de téléphone : <a href=tel:+33671026483">06 71 02 64 83</a>';

          var mail = {
            from: "SmartHoldr <contact@smartholdr.fr>", 
             to: 'david.xox@gmail.com, adrian.zerbib@etu-webschoolfactory.fr',
             subject: "Une nouvelle commande a été prise",
             html: html_for_bib
         }; 
             smtpTransport.sendMail(mail, function(error, response){
             if(error){
                console.log(error);
             } else {
                 console.log("success");
             }
             smtpTransport.close();
            })
            var mail_cust = {
              from: "SmartHoldr <contact@smartholdr.fr>", 
               to: req.body.email,
               subject: "Votre commande est confirmé",
               html: html_cust
           }; 
               smtpTransport.sendMail(mail_cust, function(error, response){
               if(error){
                  console.log(error);
               } else {
                   console.log("success to the cust");
               }
               smtpTransport.close();
              })

          res.send({message : "success"}) 
      
      } else {
        return res.status(404).send({message : "Error in the Stripe API ; no debit"});
      }
      })
  
    })
    .catch(function(error) {
      return res.status(500).send({
          code : "ERROR",
          message: error
      });
  });
}

function promoCode(req, res) {
  let actual_price = req.query.price;
  let promo = req.query.promo;
  const prom = [
    {
      name : "FS18",
      percentage : 0.15
    }
  ]
  actual_price /= 100;
    if(!actual_price || !promo) {
      return res.status(404).json ({
        code : 'NO_CODE_OR_PAY',
        message : 'Pas de code ou de montant précisé'
      })
    }
    const reduction = prom.find(o => o.name === promo);
      if(reduction) {
        return res.status(200).json({
          code : 'OK_NEW_AMOUNT',
          price : ((1-reduction.percentage)*actual_price)
        })
      } else {
        return res.status(404).json({
          code : 'NOT_CORRECT_PROMO_CODE',
          message : 'Code promo non correct'
        })
      }
}


function testReq(req, res) {
  var test = req.body.test;

    res.send({message : test});
}

module.exports = {
  sendEmail,
  uploadImage,
  testReq,
  chargeClient,
  promoCode
};