const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var OrderSchema = new Schema({
  user: {
    type: Object,
    required: true
  },
  order: {
    type: Array,
    required: true
  },
  total: Number,
  address: {
    type: Array,
    required: true
  },
  shipping: {
    type: Number,
    required: true
  },
  invoiceNumber: Number,
  discount: Number,
  discountName: String,
  time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('orders', OrderSchema);
