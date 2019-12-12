const express = require('express');
const router = express();
const connection = require('../data/db');
const productModel = require('../models/products');
const orderModel = require('../models/orders');
var nodemailer = require('nodemailer');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'info@thedecorizer.com',
    pass: process.env.EMAIL_PASSWORD
  }
});

router.post('/', (req, res) => {
  console.log(req.body);
  let address = req.body.order.address;
  let addressStr = `${address.name.given_name} ${address.name.surname}
  ${address.address.address_line_1}
  ${address.address.admin_area_2}, ${address.address.admin_area_1} ${address.address.postal_code}
  ${address.phone}`;
  let orderList = '';
  req.body.order.items.forEach(item => {
    orderList += item.qty + " x " + item.sku + "\n"
  })
  console.log(orderList);
  let date = new Date;
  var mailOptions = {
    from: 'info@thedecorizer.com',
    to: "boruch@boruchtrading.com, operations@boruchtrading.com",
    bcc: 'info@thedecorizer.com',
    subject: 'Order' + date.toLocaleDateString("en", { hour: "2-digit", minute: "2-digit" }),
    text: `Hi,
    Please send:
  ${orderList}
    To:
  ${addressStr}
    
    Thank you
    Hershy Kirsh`
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.json({
        message: 'success'
      })
    };
  });
});

module.exports = router;