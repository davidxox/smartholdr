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



module.exports = {
  sendEmail
};