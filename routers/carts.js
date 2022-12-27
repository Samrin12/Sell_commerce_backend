const { Cart } = require("../models/cart");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
    const cartList = await Order.find()
        .sort({ enlisted: -1 });

    if (!cartList) {
        res.status(500).json({ success: false });
    }
    res.send(cartList);
});

router.get(`/:id`, async (req, res) => {
    const cart = await Cart.findById(req.params.id)
        .populate("name")
        .populate({
            path: "orderItems",
            populate: {
                path: "product"
            },
        });

    if (!cart) {
        res.status(500).json({ success: false });
    }
    res.send(order);
});

router.post("/", async (req, res) => {
    const cartItemsIds = Promise.all(
        req.body.cartItems.map(async (cartitem) => {
            let newcartItem = new cartItem({
                quantity: cartitem.quantity,
                product: cartitem.product,
            });

            newcartItem = await newcartItem.save();

            return newcartItem._id;
        })
    );

    const cartItemsIdsResolved = await cartItemsIds;

    const totalPrices = await Promise.all(
        cartItemsIdsResolved.map(async (cartItemId) => {
            const cartItem = await cartItem.findById(cartItemId).populate(
                "product",
                "price"
            );

            const totalPrice = cartItem.product.price * cartItem.quantity;

            return totalPrice;
        })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    console.log(totalPrices);

    let cart = new Cart({
        cartItems: cartItemsIdsResolved,
        name: req.body.name,
        category: req.body.category,
        price: req.body.price
    });
    cart = await cart.save();

    if (!cart) return res.status(400).send("the cart cannot be created!");

    res.status(200).send(cart);
});

router.put("/:id", async (req, res) => {
    const cart = await Cart.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    );

    if (!cart) return res.status(400).send("Cart update Fails!");

    res.send(cart);
});

router.delete("/:id", (req, res) => {
    Cart.findByIdAndRemove(req.params.id)
        .then(async (cart) => {
            if (cart) {
                await cart.cartItems.map(async (cartItem) => {
                    await cartItem.findByIdAndRemove(cartItem);
                });
                return res
                    .status(200)
                    .json({ success: true, message: "the cart is deleted!" });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: "cart not found!" });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});


module.exports = router;
