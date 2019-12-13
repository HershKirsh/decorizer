const express = require('express');
const router = express();
const userModel = require('../models/users');
const productModel = require('../models/products');

router.get('/', (req, res) => {
    res.render('index.ejs', { message: '' });
});

// router.get('/store', (req, res) => {
//     res.render('store.ejs', {userName: ''});
// });

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
})

router.post('/users', (req, res) => {
    req.body.users.forEach(user => {
        let newUser = new userModel({
            name: user.name,
            email: user.email,
            balance: user.balance
        });
        newUser
            .save()
            .then(result => {
                console.log(result);
                console.log('User Added');
            })
            .catch(err => {
                console.log(err);
            });
    });
})

router.post('/things', (req, res) => {
    console.log(req.body);
    req.body.products.forEach(thing => {
        let newThing = new productModel({
            name: thing.name,
            sku: thing.sku,
            price: thing.price,
            sale: thing.sale,
            num: thing.num,
            qty: thing.qty
        });
        newThing
            .save()
            .then(result => {
                console.log(result);
                console.log('Product Added');
            })
            .catch(err => {
                console.log(err);
            });
    });
})

module.exports = router;