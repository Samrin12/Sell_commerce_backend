const { cart } = require("../models/cart");
const express = require("express");
const { cartItem } = require("../models/cartitem");
const router = express.Router();

router.get(`/`, async (req, res) => {
    const cartList = await cart.find()

    if (!cartList) {
        res.status(500).json({ success: false });
    }
    res.send(cartList);
});

router.get(`/:id`, async (req, res) => {
    const cart = await cart.findById(req.params.id)
        .populate({
            path: "cartItems",
            populate: {
                path: "product"
            },
        });

    if (!cart) {
        res.status(500).json({ success: false });
    }
    res.send(cart);
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

    let cart = new cart({
        cartItems: cartItemsIdsResolved,
        totalPrice: totalPrice
    });
    cart = await cart.save();

    if (!cart) return res.status(400).send("the cart cannot be created!");

    res.status(200).send(cart);
});

router.put("/:id", async (req, res) => {
    const cart = await cart.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    );

    if (!cart) return res.status(400).send("the cart cannot be update!");

    res.send(cart);
});

router.delete("/:id", (req, res) => {
    cart.findByIdAndRemove(req.params.id)
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

router.get("/get/totalsales", async (req, res) => {
    const totalSales = await cart.aggregate([
        { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);

    if (!totalSales) {
        return res.status(400).send("The cart sales cannot be generated");
    }

    res.send({ totalsales: totalSales.pop().totalsales });
});

router.get(`/get/count`, async (req, res) => {
    const cartCount = await cart.countDocuments((count) => count);

    if (!cartCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        cartCount: cartCount,
    });
});


module.exports = router;
