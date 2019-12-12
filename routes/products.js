const express = require('express');
const router = express();
const connection = require('../data/db');
const productModel = require('../models/products');
const request = require("request");

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

router.get('/shipcost', function (req, res) {
  let zip = req.query.zip;
  let weight = req.query.weight;
  const options = {
    method: 'POST',
    url: 'https://wwwcie.ups.com/rest/Rate',
    headers:
    {
      'cache-control': 'no-cache',
      'content-type': 'application/json'
    },
    body:
    {
      UPSSecurity:
      {
        UsernameToken: { Username: 'simplyelegantgif', Password: ENV.process.UPS_PASSWORD },
        ServiceAccessToken: { AccessLicenseNumber: ENV.process.UPS_KEY }
      },
      RateRequest:
      {
        Request: { RequestOption: 'Rate' },
        Shipment:
        {
          Shipper: { Address: { CountryCode: 'US' } },
          ShipTo: { Address: { PostalCode: zip, CountryCode: 'US' } },
          ShipFrom: { Address: { PostalCode: '08701', CountryCode: 'US' } },
          Service: { Code: '03', Description: 'Service Code Description' },
          Package:
          {
            PackagingType: { Code: '02', Description: 'Rate' },
            PackageWeight:
            {
              UnitOfMeasurement: { Code: 'Lbs', Description: 'pounds' },
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