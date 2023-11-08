const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

const port = process.env.PORT || 5000;
const jwtSecret = process.env.ACCESS_TOKEN_SECRET;

// middleware

app.use(
  cors({
    origin: [
      "https://food-donation-f7d5a.web.app",
      "https://food-donation-f7d5a.firebaseapp.com",
      // "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  // console.log("token in middleware", token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

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

    // await client.connect();
    // Send a ping to confirm a successful connection

    const donationCollection = client.db("donationDB").collection("products");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      // console.log("user for token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      // console.log("logging out", user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

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
    app.get("/products/user", verifyToken, async (req, res) => {
      // console.log(req.query.userEmail);
      // console.log("token owner info", req.user);
      if (req.user.email !== req.query.userEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      let query = {};
      if (req.query?.userEmail) {
        query = { userEmail: req.query.userEmail };
      }
      const result = await donationCollection.find(query).toArray();
      res.send(result);
    });

    // get products based on user email
    app.get("/request/user", async (req, res) => {
      // console.log(req.query.userEmail);
      let query = {};
      if (req.query?.requesterEmail) {
        query = { requesterEmail: req.query.requesterEmail };
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
        // console.log(updateProduct);
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
            requesterPhotoURL: updateProduct.requesterPhotoURL,
            requesterName: updateProduct.requesterName,
            requestDate: updateProduct.requestDate,
            donation: updateProduct.donation,
            status: "Pending",
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

    // patch a product
    app.patch("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const option = { upsert: true };
        const updateProduct = req.body;
        // console.log(updateProduct);
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

    // update the status
    app.patch("/products/status/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateProduct = req.body;
        // console.log(updateProduct);
        const product = {
          $set: {
            status: updateProduct.status,
          },
        };
        // console.log(product);
        const result = await donationCollection.updateOne(filter, product);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    app.patch("/products/requesterEmail/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateProduct = req.body;
        // console.log(updateProduct);
        const product = {
          $set: {
            requesterEmail: updateProduct.requesterEmail,
          },
        };
        // console.log(product);
        const result = await donationCollection.updateOne(filter, product);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    // delete a product
    app.delete("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        // console.log(query);
        const result = await donationCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    // await client.db("admin").command({ ping: 1 });
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

