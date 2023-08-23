const express = require("express");

const cors = require("cors");

const app = express();

const port = process.env.PORT || 5000;

require("dotenv").config();

app.use(cors());

app.use(express.json());

// mongodb connect

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://toyStore:ZJAfWFIfxFf4k20E@cluster0.pyqmcvy.mongodb.net/?retryWrites=true&w=majority`;

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

    //find data of all toys

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
