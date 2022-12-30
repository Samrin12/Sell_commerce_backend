const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
    },
    Product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    totalPrice: {
        type: Number,
    }

})

exports.cartItem = mongoose.model('cart', cartSchema);

