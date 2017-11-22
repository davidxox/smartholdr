var express = require('express');
var mailController = require('./controllers/mailController.js');
var app = express();
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
app.get('/contactus', mailController.sendEmail);

app.listen(process.env.PORT || 8080);