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
    total: {
        type: Number,
        required: false
    },
    address: {
        type: Array,
        required: true
    },
    shipping: {
        type: Number,
        required: true
    },
    invoiceNumber: {
        type: Number,
        required: false
    },
    discount: {
        type: Number,
        required: false
    },
    discountName: {
        type: String,
        required: false
    },
    time: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('orders', OrderSchema);