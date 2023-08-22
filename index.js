const express = require("express");
const app = express();
const port = process.env.PORT || 5200;
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pyqmcvy.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const resultCollection = client
      .db("Eresult")
      .collection("resultCollection");
    app.get("/allResults", async (req, res) => {
      const results = await resultCollection.find({}).toArray();
      res.send(results);
    });

    app.get("/allResults/:classId", async (req, res) => {
      const classId = parseInt(req.params.classId);
      const result = await resultCollection.findOne({ classId: classId });
      res.send(result);
    });
    app.get("/allResults/section/:section", async (req, res) => {
      const section = parseInt(req.params.section);
      const result = await resultCollection
        .find({ section: section })
        .toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("E result server is running.");
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
