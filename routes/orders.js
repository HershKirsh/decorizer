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
    pass: 'HashemIs1' //process.env.EMAIL_PASSWORD
  }
});

router.post('/', (req, res) => {
  let orderList = "";
  req.body.order.items.forEach(item => {
    orderList += `<tr><td>${item.qty}</td><td> x </td><td>${item.sku}</td></tr>`
  })
  let order = req.body.order;
  let htmlStr = `<p>Hi,</p>
  <p>Please send:<p/>
  <table><tbody>${orderList}</tbody></table>
  <p>To:<p/>
  <p>${order.address[0]}</p>
  <p>${order.address[1]}</p>
  <p>${order.address[2]}
  ${order.address[3]}</p>
  <p>${order.address[4]}, ${order.address[5]} ${order.address[6]}</p>
  <p>${order.address[7]}</p>
  <br>
  <p>Thank you<br>
  Hershy Kirsh</p>`;
  let date = new Date;
  let mailOptions = {
    from: 'info@thedecorizer.com',
    to: "hershkirsh@gmail.com",  //"boruch@boruchtrading.com, operations@boruchtrading.com",
    bcc: 'info@thedecorizer.com',
    subject: 'Order - ' + date.toLocaleDateString("en", { hour: "2-digit", minute: "2-digit" }),
    html: htmlStr 
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    };
  });
  let itemList = "";
  req.body.order.items.forEach(item => {
    itemList += `<tr style="width: 100%;" cellspacing="1" cellpadding="1" border="0"><td align="center"><img src="https://decorizer.herokuapp.com/assets/${item.img}" alt="The Decorizer ${item.sku}" title="${item.name}" style="margin: 7px;width: 50px;"></td><td style="text-align: center;">${item.sku}</td><td style="text-align: center;">${item.name}</td><td style="text-align: center;padding: 10px">${item.qty}</td><td style="text-align: center;padding-right:10px">$${item.sale.toFixed(2)}</td></tr>`;
  })
  let orderConfOptions = {
    from: 'info@thedecorizer.com',
    to: order.address[8],
    subject: 'Your Decorizer Order Confirmation',
    html: `<table style="width:100%;background: #ffffff url('https://decorizer.herokuapp.com/assets/stripe-tile.png') repeat; background-size: 20px;height: 100%;"><tbody><tr><td><table cellspacing="0" cellpadding="0" border="0" align="center" width="95%" style="margin:auto;background: transparent;max-width: 600px"><tbody><tr><td><a href="https://decorizer.herokuapp.com" target="_blank"><img src="https://decorizer.herokuapp.com/assets/logo.png" alt="The Decorizer Logo"width="125" border="0"></a></td>
    <td style="padding-top:20px;text-align: right;color: #be8d35;font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:12px;"><h1>Your Order Confirmation</h1></td></tr></tbody></table>
    <table cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#FFFFFF" width="95%" style="margin: auto;background-color: #f8fae1;margin-top: 30px;box-shadow: 0 0 15px #7f7f7fa3;border-radius: 10px;padding: 20px;max-width: 600px"><tbody><tr><td>
    <table cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#FFFFFF" width="100%" style="color: #be8d35;"><tbody><tr><td colspan="4" style="padding:20px 25px;text-align:left;font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:16px;font-weight:400;line-height:16px;">
    <p style="margin-bottom:2em">Dear Customer,</p><p style="margin-bottom:1em">Thank you for ordering from <strong>The Decorizer®</strong>.</p><p style="margin-bottom:2em">We are processing your order and we'll send it out as soon as possible.</p></td></tr> ${itemList}<tr><td colspan="4">
    <table style="width: 36%;margin: 30px 0 30px 60%;color:#be8d35;"><tbody><tr cellspacing="1" cellpadding="1" border="0" style="white-space: nowrap;"><td align="left">Order Total</td><td style="text-align: right;">$${order.itemTotal.toFixed(2)}</td></tr><tr cellspacing="1" cellpadding="1" border="0"><td align="left">Shipping</td><td style="text-align:right;">$${order.shipping.toFixed(2)}</td></tr><tr cellspacing="1" cellpadding="1" border="0"><td align="left">Total</td><td style="text-align: right;">$${order.total.toFixed(2)}</td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td>
    <table cellspacing="0" cellpadding="0" border="0" align="center" width="650" style="margin:auto"><tbody><tr><td style="padding:40px 45px 15px 45px;text-align:left;font-family:ShopifySans,'Helvetica Neue',Helvetica,sans-serif;font-size:1em;font-weight:400;line-height:1.5em;color:#637381; background: transparent"></td></tr><tr><td style="padding:10px 45px;text-align:left;font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:12px;font-weight:400;line-height:1.5em;color:grey;text-align: center;">© <span>Simply Elegant Gifts LLC</span>,<span>&nbsp;Home of The Decorizer®</span><br><br><br></td></tr></tbody></table></td></tr></tbody></table>`
  }
  transporter.sendMail(orderConfOptions, function (error, info) {
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