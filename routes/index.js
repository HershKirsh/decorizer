const express = require('express');
const router = express();
const userModel = require('../models/users');
const productModel = require('../models/products');

router.get('/', (req, res) => {
    res.render('index.ejs', { message: '' });
});

router.get('/store', (req, res) => {
    res.render('store.ejs', { userName: '' });
});

router.post('/', (req, res) => {
    userModel.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                res.render('store.ejs', { userName: user[0].name });
            } else {
                res.render('index.ejs', { message: 'We did not find an account associated with this email' });
            }
        });
});

router.get('/getUser', (req, res) => {
    userModel.find({ name: req.query.name })
        .exec()
        .then(user => {
            console.log(user)
            res.json(user);
        })
});

module.exports = router;