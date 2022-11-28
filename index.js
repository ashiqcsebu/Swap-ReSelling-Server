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
  

















run().catch(console.log());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});




