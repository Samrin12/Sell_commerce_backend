const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0,
        require: true
    }
})

exports.cartItem = mongoose.model('cart', cartSchema);

