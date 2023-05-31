// require('dotenv').config();
const express = require('express');
const router = express();
const connection = require('../data/db');
const productModel = require('../models/products');
const orderModel = require('../models/orders');
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// var sendMail = function (email) {
//   return sgMail.send(email);
// };

async function getInvoiceNumber() {
  order = await orderModel.findOne({invoiceNumber: {$exists: true}}, {_id: 0, invoiceNumber: 1}).sort({invoiceNumber: 'desc'});
  return order ? order.invoiceNumber + 10 : '1000';
}

function getTemplate() {
  return new Promise(res => {
    fs.readFile(`./invoice.html`, 'base64', function (err, data) {
      if (err) console.log('**reading temp err**', err);
      res(data || '');
    });
  });
}

function createInvoice(data) {
  return new Promise(res => {
    easyinvoice.createInvoice(data, result => {
      console.log('invoice created');
      res(result.pdf);
    });
  });
}

router.post('/', async (req, res) => {
  res.json({message: 'success'})
})
router.post('/', async (req, res) => {
  const order = req.body.order;
  const invoiceNumber = await getInvoiceNumber();
  const newOrder = new orderModel({
    user: order.user,
    order: order.items,
    address: order.address,
    shipping: order.shipping,
    total: order.total,
    discount: order.discount || 0,
    disacountName: order.disacountName,
    invoiceNumber: invoiceNumber
  });
  newOrder
    .save()
    .then(result => {
      console.log('Order Added');
    })
    .catch(err => {
      console.log(err);
    });
  const products = order.items.map(({sku, name, qty, price}) => ({quantity: qty, description: `${sku}</td><td>${name}`, price: price}));
  if (order.discount) products.push({quantity: 1, description: `Discount</td><td>${order.discountName}`, price: order.discount * -1});
  products.push({quantity: 1, description: 'Shipping</td><td>UPS Ground', price: order.shipping});
  const address = order.address;
  const data = {
    customize: {
      template: fs.readFileSync('./invoice.html', 'base64')
    },
    images: {
      logo: fs.readFileSync('./public/assets/logo.png', 'base64'),
      background: fs.readFileSync('./public/assets/paid-bg.png', 'base64')
    },
    sender: {
      company: 'Simply Elegant Gifts',
      city: 'Far Rockaway, NY',
      custom1: 'info@thedecorizer.com'
    },
    client: {
      company: address[1],
      address: address[2],
      custom1: address[3] ? `${address[3]}<br>` : '',
      city: `${address[4]}, ${address[5]}`,
      zip: address[6]
    },
    information: {
      number: invoiceNumber,
      date: new Date().toLocaleDateString()
    },
    products: products,
    'bottom-notice': 'Thank you for your business.',
    settings: {
      format: 'Letter'
    },
    translate: {
      number: 'Invoice #',
      products: 'Item',
      quantity: 'Qty'
    }
  };
  const pdfInvoice = await createInvoice(data);
  let itemList = '';
  order.items.forEach(item => {
    itemList += `<tr style="width: 100%;" cellspacing="1" cellpadding="1" border="0"><td align="center"><img src="https://decorizer.herokuapp.com/assets/${item.img}" alt="The Decorizer ${item.sku}" title="${item.name}" style="margin: 7px;width: 50px;"></td><td style="text-align:left;">${item.sku}</td><td style="text-align:left;padding:0 5px">${item.name}</td><td style="text-align: center;padding: 10px">${item.qty}</td><td style="text-align: center;padding-right:10px">$${item.price.toFixed(2)}</td></tr>`;
    productModel.findOneAndUpdate({sku: item.sku}, {qty: item.origQty - item.qty}, {upsert: true, new: true, useFindAndModify: false}, function (err, doc) {
      if (err) console.log(err);
    });
  });
  let orderConfOptions = {
    from: 'sales@thedecorizer.com',
    to: order.address[8],
    bcc: 'info@thedecorizer.com',
    subject: 'Your Decorizer Order Confirmation',
    html: `<table style="width:100%;background: #ffffff url('https://decorizer.herokuapp.com/assets/stripe-tile.png') repeat; background-size: 20px;height: 100%;"><tbody><tr><td><table cellspacing="0" cellpadding="0" border="0" align="center" width="95%" style="margin:auto;background: transparent;max-width: 600px"><tbody><tr><td><a href="https://decorizer.herokuapp.com" target="_blank"><img src="https://decorizer.herokuapp.com/assets/logo.png" alt="The Decorizer Logo"width="125" border="0"></a></td>
    <td style="padding-top:20px;text-align: right;color: #be8d35;font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:12px;"><h1>Your Order Confirmation</h1></td></tr></tbody></table>
    <table cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#FFFFFF" width="95%" style="margin: auto;background-color: #f8fae1;margin-top: 30px;box-shadow: 0 0 15px #7f7f7fa3;border-radius: 10px;padding: 20px;max-width: 600px"><tbody><tr><td>
    <table cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#FFFFFF" width="100%" style="color: #be8d35;"><tbody><tr><td colspan="4" style="padding:20px 25px;text-align:left;font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:16px;font-weight:400;line-height:16px;">
    <p style="margin-bottom:2em">Dear Customer,</p><p style="margin-bottom:1em">Thank you for ordering from <strong>The Decorizer®</strong>.</p><p style="margin-bottom:2em">We are processing your order and we'll send it out as soon as possible.</p><p style="text-align:center"><strong>Please find your invoice attached</strong></p></td></tr> ${itemList}<tr><td colspan="4">
    <table style="width: 36%;margin: 30px 0 30px 60%;color:#be8d35;"><tbody>${order.discount ? `<tr cellspacing="1" cellpadding="1" border="0" style="white-space: nowrap;"><td align="left">Discount</td><td style="text-align: right;">-$${order.discount.toFixed(2)}</td></tr>` : ''}<tr cellspacing="1" cellpadding="1" border="0" style="white-space: nowrap;"><td align="left">Order Total</td><td style="text-align: right;">$${order.itemTotal.toFixed(2)}</td></tr><tr cellspacing="1" cellpadding="1" border="0"><td align="left">Shipping</td><td style="text-align:right;">$${order.shipping.toFixed(2)}</td></tr><tr cellspacing="1" cellpadding="1" border="0"><td align="left">Total</td><td style="text-align: right;">$${order.total.toFixed(2)}</td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td>
    <table cellspacing="0" cellpadding="0" border="0" align="center" width="650" style="margin:auto"><tbody><tr><td style="padding:40px 45px 15px 45px;text-align:left;font-family:ShopifySans,'Helvetica Neue',Helvetica,sans-serif;font-size:1em;font-weight:400;line-height:1.5em;color:#637381; background: transparent"></td></tr><tr><td style="padding:10px 45px;text-align:left;font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:12px;font-weight:400;line-height:1.5em;color:grey;text-align: center;">© <span>Simply Elegant Gifts LLC</span>,<span>&nbsp;Home of The Decorizer®</span><br><br><br></td></tr></tbody></table></td></tr></tbody></table>`,
    attachments: [
      {
        content: pdfInvoice,
        type: 'pdf',
        name: 'invoice',
        filename: 'invoice.pdf',
        disposition: 'attachment'
      }
    ]
  };
  sgMail
    .send(orderConfOptions)
    .then(() => {
      res.json({
        message: 'success'
      });
    })
    .catch(e => {
      res.json({
        error: 'email was not sent'
      });
    });
});

module.exports = router;
