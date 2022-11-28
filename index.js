const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

 const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.plfe0ce.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyingToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).send("sorry unauthrize access");
  }
  const token = header.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}


async function run() {
  try {
    const userscollection = client.db("swapdb").collection("users");
    const productcategoriesCollection = client.db("swapdb").collection("productcategories");
    const allProductscollection = client.db("swapdb").collection("allProducts");
    const bookedproductcollection = client.db("swapdb").collection("bookedproduct");

    // A function for veryfy admin
    const adminVerify = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await userscollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

 // get  opareton
  // get all categories data
      app.get("/categories", async (req, res) => {
        const query = {};
        const categoriyes = await productcategoriesCollection
          .find(query)
          .toArray();
        res.send(categoriyes);
      });
  
  // get spcifiq data
  app.get("/categories/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const categore = await productcategoriesCollection.findOne(query);
    res.send(categore);
  });

 // get booked product for buying
 app.get("/product/parces/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await bookedproductcollection.findOne(query);
  res.send(result);
});

  // get all seller -- jwt & admin route
  app.get("/seller", verifyingToken, adminVerify, async (req, res) => {
    const email = req.query.email;
    const decodedEmail = req.decoded.email;
    if (email !== decodedEmail) {
      return res.status(403).send({ message: "forbidden access" });
    }
    const query = { role: "seller" };
    const seller = await userscollection.find(query).toArray();
    res.send(seller);
  });

     // get campain data
     app.get("/campain", async (req, res) => {
      const query = {
        campain: true,
        sold:false
      };
      const campaininfo = await allProductscollection.find(query).toArray();
      res.send(campaininfo);
    });

    // get all seller
    app.get("/bayer", verifyingToken, adminVerify, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { role: "bayer" };
      const seller = await userscollection.find(query).toArray();
      res.send(seller);
    });
    // get similar type of data
    app.get("/allproducts/", verifyingToken, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const brand_name = req.query.category_name;
      const query = { 
        brand_name: brand_name,
        sold: false
     };
      const result = await allProductscollection.find(query).toArray();
      res.send(result);
    });

// get my product
      // jwt will be apply here
      app.get("/myproduct", verifyingToken, async (req, res) => {
        const email = req.query.email;
        const decodedEmail = req.decoded.email;
        if (email !== decodedEmail) {
          return res.status(403).send({ message: "forbidden access" });
        }
        const query = { userEmail: email };
        const result = await allProductscollection.find(query).toArray();
        res.send(result);
      });
  















run().catch(console.log());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});




