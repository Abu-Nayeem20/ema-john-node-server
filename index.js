const express = require("express");
const { MongoClient } = require('mongodb');
const cors = require("cors");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f1hps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("emaJohnDB");
      const productCollection = database.collection("products");
      const orderCollection = database.collection("orders");

      // GET API
      app.get('/products', async (req, res) => {
          const cursor = productCollection.find({});
          const page = req.query.page;
          const size = parseInt(req.query.size);
          let products;
          const count = await cursor.count();
          if(page){
            products = await cursor.skip(page * size).limit(size).toArray();
          }
          else{
             products = await cursor.toArray();
          }
          res.send({
            count,
            products
          });
      });

      // Use post to get data by keys
      app.post('/products/bykeys', async (req, res) => {
        const keys = req.body;
        const query = { key: { $in: keys } };
        const products = await productCollection.find(query).toArray();
        res.json(products);
      });

      // order API

    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    })

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);




app.get('/', (req, res) =>{
    res.send("ema-John server running");
});

app.listen(port, () =>{
    console.log("server running on port", port);
})