const express = require("express");

const cors = require("cors");

const jwt = require('jsonwebtoken');

const app = express();

const port = process.env.PORT || 5000;

require("dotenv").config();

app.use(cors());

app.use(express.json());

const  verifyJwt = (req,res,next) => {
  const authorization = req.headers.authorization;
    if(!authorization) {
      return res.status(401).send({error: true, message: 'not verify parson'})
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token,'c8f7271005d7cb49f09e71f9f24e8989f0126396a8a88cc1e232f15a130bf83e964e120940702b373c6fe477f69e1d9aa744e58dfc420c50f2794c424c688d91',(err,decoded) => {
      if(err) {
        return res.status(401).send({error: true, massage: 'not verify parson'})
      }
      req.decoded = decoded;
      next()
    })

}


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

      .collection("resultCollection"); //for getting all results
    const reCheckCollection = client

      .db("Eresult")

      .collection("reCheck"); //for getting all results

    // app.get("/allResults", async (req, res) => {
    //   const results = await resultCollection.find({}).toArray();
    //   res.send(results);
    // });

    app.get("/allResults", async (req, res) => {
      const cursor = resultCollection.find();
      const result = await cursor.toArray()
      res.send(result);
    })

    // search by id

    app.get("/allResults/:id", async (req, res) => {
      const allResultsId = req.params.id;
      const query = { _id: new ObjectId(allResultsId) }
      const option = {
        projection: {
          Name: 1, classId: 1, finalTerm: 1
        }
      }
      const results = await resultCollection.findOne(query, option);
      res.send(results);
    });

    app.patch("/allResults/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const term = req.body;
      const final = {
        $set: {
          finalTerm: {
            Bangla: parseInt(term.Bangla),
            Biology: parseInt(term.Biology),
            Chemistry: parseInt(term.Chemistry),
            English: parseInt(term.English),
            Math: parseInt(term.Math),
            Physics: parseInt(term.Physics)
          }

        }
      }
      const result = await resultCollection.updateOne(filter, final, options);
      res.send(result)
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

    app.post('/jwt', (req , res) => {
      const user = req.body
      const token = jwt.sign(user, 'c8f7271005d7cb49f09e71f9f24e8989f0126396a8a88cc1e232f15a130bf83e964e120940702b373c6fe477f69e1d9aa744e58dfc420c50f2794c424c688d91', {expiresIn: '100h'})
      res.send(token)
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
