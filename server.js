const express = require('express');
const app = express();
const Client = require('shopify-buy');
const fetch = require('node-fetch');
const util = require('util');
const cors = require('cors');
const bodyparser = require('body-parser');

app.use(cors());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

PORT = 8000

const client = Client.buildClient({
    domain: 'marenello.myshopify.com',
    storefrontAccessToken: process.env.shopifyToken
}, fetch)
let ckid;
app.post('/test', (req, res) => {
    console.log(req.body);
    customAttributes = []
    Object.keys(req.body).forEach(key => {
        customAttributes.push({key: key, value: req.body[key]})
    });
    let checkoutUrl = '';
    console.log(customAttributes);
    // Create an empty checkout
    client.checkout.create().then((cart) => {
        // Do something with the checkout
        //console.log(JSON.stringify(cart));
        ckid = cart.id;
        console.log(ckid);
        console.log(cart.subtotalPrice);
        return client.product.fetchAll();
    })
    .then(products => {
        products.forEach(product => {
            console.log(product.title);
            //console.log(JSON.stringify(product));
            lineItemsToAdd = [
                {
                    variantId: product.variants[0].id,
                    quantity: 1,
                    customAttributes: customAttributes
                }
            ]
        })
        return client.checkout.addLineItems(ckid, lineItemsToAdd);
    })
    .then(cart => {
        console.log('new cart: ', cart.webUrl);
        checkoutUrl = cart.webUrl;
        return res.json({response: checkoutUrl})
    })
    .catch(err => {
        console.log(err);
    })

    
})

app.get('/', (req, res) => {
    res.json({response: 'success'})
})


app.listen(PORT, () => {
    console.log(`app is running on localhost:${PORT}`)
})