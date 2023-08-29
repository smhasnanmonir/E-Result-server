const express = require("express");

const cors = require("cors");

const app = express();

const port = process.env.PORT || 5000;

require("dotenv").config();

app.use(cors());

app.use(express.json());

// mongodb connect

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { error } = require("console");

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pyqmcvy.mongodb.net/?retryWrites=true&w=majority`; //use monir

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ir3lm70.mongodb.net/?retryWrites=true&w=majority`; //use habib 

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


    const resultCollection = client.db("Eresult").collection("resultCollection"); //for getting all results
    const reCheckCollection = client.db("Eresult").collection("reCheck"); //for getting all rechecks
    const usersCollection = client.db("Eresult").collection("usersCollection"); //for getting all rechecks

    app.get("/allResults", async (req, res) => {
      const results = await resultCollection.find({}).toArray();
      res.send(results);
    });

    app.post("/allResults", async (req, res) => {
      const newItem = req.body;
      const result = await reCheckCollection.insertOne(newItem);
      res.send(result);
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

    app.get("/allResults/:examType/:classId", async (req, res) => {
      const examType = req.params.examType.toString();
      const classId = parseInt(req.params.classId);
      const document = await resultCollection.findOne({ classId: classId });
      if (examType === "midTerm") {
        const examData = document?.result[0]?.midTerm;
        res.send({ examData });
      } else if (examType === "finalTerm") {
        const examData = document?.result[1]?.finalTerm;
        res.send({ examData });
      } else {
        res.send("Not Found");
      }
    });

    //reCheck api

    app.post("/reCheck", async (req, res) => {
      const newItem = req.body;
      const result = await reCheckCollection.insertOne(newItem);
      res.send(result);
    });

    app.get("/reCheck", async (req, res) => {
      const result = await reCheckCollection.find().toArray();
      res.send(result);
    });

    app.get("/reCheck/:classId", async (req, res) => {
      const classId = parseInt(req.params.classId);

      const result = await reCheckCollection.findOne({
        classId: parseInt(classId),
      });
      res.send(result);
    });

    app.get("/reCheckUser", async (req, res) => {
      const email = req.query.email;
      const query = {
        email: email
      }
      const result = await reCheckCollection.find(query).toArray();
      res.send(result);
    });

    //User Collections API

    app.post('/addUser', async(req, res) => {
      const userInfo = req.body;
      const query = {
        email : userInfo.email
      }
      const existingUser = await usersCollection.findOne(query);
      if(existingUser){
        res.send({message : "User already added" });
      }else{
        const result = await usersCollection.insertOne(userInfo);
        res.send(result);
      }
    })

    //Checking admin or not
    app.get('/user/isAdmin',async(req, res) => {
      const email = req.query.email;
 
      const query = {email: email}
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === 'admin'}
    
      return res.send(result)
    })

    // Send a ping to confirm a successful connection

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
  res.send("Server is running");
});

app.listen(port, () => {
  console.log("Port is:", port);
});
