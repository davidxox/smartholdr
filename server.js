var express = require('express');
var guestController = require('./controllers/guestController.js');
var app = express();

app.enable('trust proxy');
app.use (function (req, res, next) {
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
});
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/', express.static(__dirname + "/site/"));
app.set('views', __dirname + '/site');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.get('/', function(req, res) { res.render("index.ejs"); });
app.get('/grille', function(req, res) { res.render("grille.ejs"); });
app.get('/cgv', function(req, res) { res.render("cgv.ejs"); });
app.get('/aboutus', function(req, res) { res.render("about.ejs"); });
app.get('/commander', function(req, res) { res.render("commander.ejs"); });
app.get('/merci', function(req, res) { res.redirect('/'); });
app.post('/contactus', guestController.sendEmail);
app.put('/upload', guestController.uploadImage);
app.post('/test', guestController.testReq);
app.post('/pay', guestController.chargeClient);

app.listen(8080);


