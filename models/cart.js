const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    cartItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    totalPrice: {
        type: Number,
    }
})

cartSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

cartSchema.set('toJSON', {
    virtuals: true,
});

exports.cart = mongoose.model('cart', cartSchema);
