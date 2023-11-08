const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2dhdxvg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    await client.connect();
    // Send a ping to confirm a successful connection

    const donationCollection = client.db("donationDB").collection("products");

    // get all the products
    app.get("/products", async (req, res) => {
      try {
        const products = donationCollection.find();
        const result = await products.toArray();
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    // get products based on user email
    app.get("/products/user", async (req, res) => {
      // console.log(req.query.userEmail);
      let query = {};
      if (req.query?.userEmail) {
        query = { userEmail: req.query.userEmail };
      }
      const result = await donationCollection.find(query).toArray();
      res.send(result);
    });

    // get a product based on id
    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await donationCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    // create a product
    app.post("/addProduct", async (req, res) => {
      try {
        const product = req.body;
        // console.log(product);
        const result = await donationCollection.insertOne(product);
        res.send(result);
      } catch (error) {
        // console.log(error);
        res.send(error);
      }
    });

    // update a product
    app.put("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const option = { upsert: true };
        const updateProduct = req.body;
        console.log(updateProduct);
        const product = {
          $set: {
            foodName: updateProduct.foodName,
            foodQuantity: updateProduct.foodQuantity,
            date: updateProduct.date,
            location: updateProduct.location,
            foodImg: updateProduct.foodImg,
            userDisplayName: updateProduct.userDisplayName,
            userPhotoURL: updateProduct.userPhotoURL,
            userEmail: updateProduct.userEmail,
            requesterEmail: updateProduct.requesterEmail,
            requestDate: updateProduct.requestDate,
            donation: updateProduct.donation,
            notes: updateProduct.notes,
          },
        };
        // console.log(product);
        const result = await donationCollection.updateOne(
          filter,
          product,
          option
        );
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    app.patch("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const option = { upsert: true };
        const updateProduct = req.body;
        console.log(updateProduct);
        const product = {
          $set: {
            foodName: updateProduct.foodName,
            foodQuantity: updateProduct.foodQuantity,
            date: updateProduct.date,
            location: updateProduct.location,
            foodImg: updateProduct.foodImg,
            notes: updateProduct.notes,
          },
        };
        // console.log(product);
        const result = await donationCollection.updateOne(
          filter,
          product,
          option
        );
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Food donation server running");
});

app.listen(port, () => {
  console.log(`food donation server running at ${port}`);
});
