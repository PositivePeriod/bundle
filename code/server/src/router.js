var express = require("express");
var router = express.Router();

router.get('/', function (req, res) {
    res.send('Bundle API');
});

router.get('/:userID', function (req, res) {
    res.send('Bundle API');
});


module.exports = { "apiRouter": router };