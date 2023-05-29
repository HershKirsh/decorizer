const express = require('express');
const router = express();
const connection = require('../data/db');
const productModel = require('../models/products');
const request = require('request');

router.get('/', function (req, res) {
  productModel.find({}, function (err, data) {
    if (err) {
      console.log(err);
      return res.status(401);
    }
    let productList = JSON.stringify(data);
    res.send(productList);
  });
});

// router.get('/temp', function (req, res) {
//   productModel.find({}, function (err, data) {
//     if (err) {
//       console.log(err);
//       return res.status(401);
//     }
//     data.forEach(item => {
//       if (!item.num) return;
//       productModel.findOneAndUpdate({sku: item.sku}, {$inc: {num: 1}}, {upsert: true, new: true, useFindAndModify: false}, function (err, doc) {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log(doc);
//         }
//       });
//     });
//   });
// });

router.get('/shipcost', function (req, res) {
  const zip = req.query.zip;
  const weight = req.query.weight;
  const size = Math.ceil(Math.cbrt(req.query.size) + 1);
  const options = {
    method: 'POST',
    url: 'https://wwwcie.ups.com/rest/Rate',
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json'
    },
    body: {
      UPSSecurity: {
        UsernameToken: {Username: 'simplyelegantgif', Password: process.env.UPS_PASSWORD},
        ServiceAccessToken: {AccessLicenseNumber: process.env.UPS_KEY}
      },
      RateRequest: {
        Request: {RequestOption: 'Rate'},
        Shipment: {
          Shipper: {Address: {CountryCode: 'US'}},
          ShipTo: {Address: {PostalCode: zip, CountryCode: 'US'}},
          ShipFrom: {Address: {PostalCode: '11691', CountryCode: 'US'}},
          Service: {Code: '03', Description: 'Service Code Description'},
          Package: {
            Dimensions: {
              UnitOfMeasurement: {Code: 'IN', Description: 'Inches'},
              Length: (size + size * 0.2).toString(),
              Width: size.toString(),
              Height: size.toString()
            },
            PackagingType: {Code: '02', Description: 'Rate'},
            PackageWeight: {
              UnitOfMeasurement: {Code: 'LBS', Description: 'pounds'},
              Weight: weight
            }
          }
        }
      }
    },
    json: true
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    let data = JSON.parse(body.RateResponse.RatedShipment.TransportationCharges.MonetaryValue);
    res.json(data);
  });
});

module.exports = router;
