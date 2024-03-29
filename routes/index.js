const express = require('express');
const router = express();
const userModel = require('../models/users');
const productModel = require('../models/products');

router.get('/', (req, res) => {
  res.render('index.ejs', {message: ''});
});

router.post('/', (req, res) => {
  userModel
    .find({email: req.body.email})
    .exec()
    .then(user => {
      if (user.length) return res.render('store.ejs', {userName: user[0].name});
      res.render('index.ejs', {message: 'We did not find an account associated with this email'});
    });
});

router.get('/getUser', (req, res) => {
  userModel
    .find({name: req.query.name})
    .exec()
    .then(user => res.json(user));
});

module.exports = router;
