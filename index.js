const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
var jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// J2j2FABttabBEFOD

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGOuri;

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

    const recipeMenuCollaction = client
      .db("food-recipe-and-order")
      .collection("viewmenu");

    const orderMeneCollaction = client
      .db("food-recipe-and-order")
      .collection("orderMenu");
    const cartdCollaction = client
      .db("food-recipe-and-order")
      .collection("carts");
    const userCollaction = client
      .db("food-recipe-and-order")
      .collection("users");

    // --------------------- jwt -----------------------------

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET, { expiresIn: "1h" });
      res.send({ token });
    });

    // --------------------- jwt middleware -----------------------------

    const verifyToken = (req, res, next) => {
      // console.log("insert verify token", req.headers.authorization);
      if(!req.headers.authorization){
        return res.status(401).send({ message: "Unauthorized" });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "Unauthorized" });
          }
          req.decoded = decoded;
          next();
        });
    };

    // --------------------- verify admin -----------------------------
    const veryfyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollaction.findOne(query);
      const isAdmin = user?.role === "admin";

      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    // --------------------- recipe -----------------------------
    app.get("/recipeMenu", async (req, res) => {
      const result = await recipeMenuCollaction.find().toArray();
      res.send(result);
    });

    
    // --------------------- recipe -----------------------------
    app.get("/recipeMenu/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recipeMenuCollaction.findOne(query);
      res.send(result);
    });

    // ---------------------- paginations ----------------------------

    app.get("/totalCount", async (req, res) => {
      const count = await orderMeneCollaction.estimatedDocumentCount();
      res.send({ count });
    });

    // ---------------------- order ----------------------------

    app.get("/order", async (req, res) => {
      const result = await orderMeneCollaction.find().toArray();
      res.send(result);
    });

    // --------------------- send data database -----------------------------
    app.post('/order', verifyToken, veryfyAdmin, async(req,res) =>{
      const data = req.body;
      const result = await orderMeneCollaction.insertOne(data)
      res.send(result);
    })
    // ---------------------- carts collections ----------------------------
    app.post("/carts", async (req, res) => {
      const cartdItem = req.body;
      const result = await cartdCollaction.insertOne(cartdItem);
      res.send(result);
    });
    // ---------------------- carts total item ----------------------------
    app.get("/carts", async (req, res) => {
      // use anujai carts ar data loading kora jonno email & query
      const email = req.query.email;
      const query = { email: email };
      const result = await cartdCollaction.find(query).toArray();
      res.send(result);
    });

    // ---------------------- carts Delete item ----------------------------
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartdCollaction.deleteOne(query);
      res.send(result);
    });

    // ---------------------- user data send database ----------------------------
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollaction.findOne(query);
      if (existingUser) {
        return res.send({ message: "user all ready exist", insertedId: null });
      }
      const result = await userCollaction.insertOne(user);
      res.send(result);
    });

    // ---------------------- all user get ----------------------------

    app.get("/users", verifyToken, veryfyAdmin, async (req, res) => {
      console.log(req.headers);
      const result = await userCollaction.find().toArray();
      res.send(result);
    });

    // ---------------------- admin user delet ----------------------------
    app.delete("/users/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollaction.deleteOne(query);
      res.send(result);
    });

    // ---------------------- admin user delet ----------------------------
    app.patch(
      "/users/admin/:id",
      verifyToken,
      veryfyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await userCollaction.updateOne(filter, updateDoc);
        res.send(result);
      }
    );

    // ---------------------- admin or not chack ----------------------------
    
    app.get('/users/admin/:email', verifyToken, async(req,res)=>{
      const email = req.params.email;
      if(email !== req.decoded.email){
        return res.status(403).send({message:'forbidden access'})
      }
      const query = {email : email}
      const user = await userCollaction.findOne(query);
      let admin = false;
      if(user){
        admin = user?.role === 'admin';
      }

      res.send({admin});

    })


    console.log("You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);
