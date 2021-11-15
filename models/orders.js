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
        type: String,
        required: false
    },
    address: {
        type: Array,
        required: true
    },
    shipping: {
        type: Number,
        required: true
    }
    time: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('orders', OrderSchema);