const { Product } = require('../models/product');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Image is not valid!!');
        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});
const uploadOptions = multer({ storage: storage });


router.get(`/`, async (req, res) => {

    const productList = await Product.find();
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList);

}
)

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product);
})


//create a product
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    console.log(req.body)
    const file = req.file;
    if (!file) return res.status(400).send('Image Not Found');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    //req.body
    let product = new Product({
        name: req.body.name,
        shortCode: req.body.shortCode,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        // "http://localhost:3000/public/upload/image-2323232"
        image: `${basePath}${fileName}`,
        // image: "http://localhost:3000/public/upload/image-2323232",

        countInStock: req.body.countInStock,
        isBest: req.body.isBest,
        dateCreated: req.body.dateCreated,
        origin: req.body.origin

    })
    product = await product.save();
    if (!product)
        return res.status(500).send('Product Creation Failed')
    res.send(product);

}
)

//edit a product
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            shortCode: req.body.shortCode,
            category: req.body.category,
            price: req.body.price,
            description: req.body.description,
            image: imagepath,
            countInStock: req.body.countInStock,
            isBest: req.body.isBest,
            dateCreated: req.body.dateCreated,
            origin: req.body.origin,
        },
        { new: true }
    )

    if (!updatedProduct) return res.status(500).send('Something went wrong in uopdating the product');

    res.send(product);
})

//delete a product
router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'Product deletion seccessful!' })
        } else {
            return res.status(404).json({ success: false, message: "Can't found product!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

//get count of a product

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count)

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount
    });
})


module.exports = router;