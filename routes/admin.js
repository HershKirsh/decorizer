// require('dotenv').config();
const express = require('express');
const router = express();
const connection = require('../data/db');
const productModel = require('../models/products');
const orderModel = require('../models/orders');
const usersModel = require('../models/users');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// var sendMail = function (email) {
//   return sgMail.send(email);
// };

async function getOrders() {
  return new Promise(res => {
    orderModel.find({}, function (err, data) {
      if (err) {
        console.log(err);
        return res({err: err});
      }
      const orders = data.map(o => {
        delete o.user._id;
        return {
          order: o.order.map(({_id, ...x}) => ({...x})),
          user: o.user,
          address: o.address,
          shipping: o.shipping,
          time: o.time
        };
      }).reverse();
      res(orders);
    });
  });
}

router.get('/', async (req, res) => {
  // console.log(req.cookies);
  // console.log(req.signedCookies);
  if (req.signedCookies['decorizer-logged-in']) {
    const orders = await getOrders();
    if (orders.err) return res.status(401);
    return res.render('admin.pug', {orderList: orders});
  }
  res.render('admin-login.ejs');
});

router.post('/', async (req, res) => {
  if (req.body.username === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
    res.cookie('decorizer-logged-in', 'decorizer-admin', {
      maxAge: 1000 * 60 * 60 * 24 + (new Date().setHours(24, 0, 0, 0) - Date.now()),
      signed: true,
      httpOnly: true,
      secure: true
    });
    const orders = await getOrders();
    if (orders.err) return res.status(401);
    return res.render('admin.pug', {orderList: orders});
  }
  // res.render('admin-login.ejs');
});

module.exports = router;
