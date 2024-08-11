const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// J2j2FABttabBEFOD

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://tanvirislam3912:4nTjsdgFIXPUlNg9@cluster0.mctsotv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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


    const orderMeneCollaction = client.db('food-recipe-and-order').collection('orderMenu')
    const cartdCollaction = client.db('food-recipe-and-order').collection('carts')

    // --------------------- recipe -----------------------------
    app.get("/recipeMenu", async (req, res) => {
      const result = await recipeMenuCollaction.find().toArray();
      res.send(result);
    });

    app.get("/recipeMenu/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recipeMenuCollaction.findOne(query);
      res.send(result);
    });
    // --------------------- recipe -----------------------------

    // ---------------------- paginations ----------------------------

    app.get('/totalCount', async(req,res)=>{
      const count = await orderMeneCollaction.estimatedDocumentCount()
      res.send({count})
    })

    // ---------------------- order ----------------------------

    app.get('/order', async(req,res)=>{
      const result = await orderMeneCollaction.find().toArray();
      res.send(result);
    })

    // ---------------------- carts collections ----------------------------
    app.post('/carts', async(req,res) =>{
      const cartdItem = req.body;
      const result = await cartdCollaction.insertOne(cartdItem)
      res.send(result);
    })
    // ---------------------- carts total item ----------------------------
    app.get('/carts', async(req,res) =>{
      const result = await cartdCollaction.find().toArray();
      res.send(result);
    })
    

    console.log("You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);
