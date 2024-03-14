const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ProductsSchema = new Schema({
    num: {
        type: Number,
        required: true
    },
   section: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    sale: {
        type: Number,
        required: true
    },
    qty: {
        type: Number,
        required: true
    }

})

module.exports = mongoose.model('products', ProductsSchema);