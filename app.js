const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const productRouter = require('./routers/products');
const errorHandler = require("./helpers/error-handler");

const api = process.env.API_URL;

app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

//routers
app.use(`${api}/products`, productRouter)

//http://localhost:3000/api/v1/products



mongoose.connect(process.env.connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'ecommerce'
})
    .then(() => {
        console.log('Databse connected');

    }
    )
    .catch((err) => {
        console.log(err);
    })

app.listen(3000, () => {
    console.log('server is running http://localhost:3000');
}
)