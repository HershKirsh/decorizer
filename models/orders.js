const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = require('./users');


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
    fulfilled: {
        type: Boolean,
        required: false
    }
})

module.exports = mongoose.model('orders', OrderSchema);