const express = require("express");
const socketIo = require("socket.io");
const http = require("http");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

require("dotenv").config();

app.use(cors());
app.use(express.json());

const server = http.createServer(app); // Use the Express app as the HTTP server

// const io = socketIo(server);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with the origin of your client application
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // console.log('someone connected')
  socket.on("disconnect", () => {
    // console.log('left');
  });
});

const verifyJwt = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: "not verify parson" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(
    token,
    "c8f7271005d7cb49f09e71f9f24e8989f0126396a8a88cc1e232f15a130bf83e964e120940702b373c6fe477f69e1d9aa744e58dfc420c50f2794c424c688d91",
    (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .send({ error: true, massage: "not verify parson" });
      }
      req.decoded = decoded;
      next();
    }
  );
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { error } = require("console");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pyqmcvy.mongodb.net/?retryWrites=true&w=majority`; //use monir

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ir3lm70.mongodb.net/?retryWrites=true&w=majority`; //use habib

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

    const resultCollection = client
      .db("Eresult")
      .collection("resultCollection"); //for getting all results
    const reCheckCollection = client.db("Eresult").collection("reCheck"); //for getting all rechecks
    const usersCollection = client.db("Eresult").collection("usersCollection"); //for getting all rechecks
    const notificationsCollection = client
      .db("Eresult")
      .collection("notifications");

    app.get("/allResults", async (req, res) => {
      const cursor = resultCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/allResults', async (req, res) => {
      const cursor = req.body;
      const result = await resultCollection.insertOne(cursor);
      res.send(result)
    })

    // search by id

    app.get("/allResults/:id", async (req, res) => {
      const allResultsId = req.params.id;
      const query = { _id: new ObjectId(allResultsId) };
      const option = {
        projection: {
          Name: 1,
          classId: 1,
          finalTerm: 1,
          midTerm: 1,
        },
      };
      const results = await resultCollection.findOne(query, option);
      res.send(results);
    });

    app.patch("/allResults/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const term = req.body;
      let updateTermField;

      if (req.query.term === "finalTerm") {
        updateTermField = "finalTerm";
      } else if (req.query.term === "midTerm") {
        updateTermField = "midTerm";
      } else {
        return res.status(400).json({ error: "Invalid term specified" });
      }

      const updateTerm = {
        $set: {
          [updateTermField]: {
            Bangla: parseInt(term.Bangla),
            Biology: parseInt(term.Biology),
            Chemistry: parseInt(term.Chemistry),
            English: parseInt(term.English),
            Math: parseInt(term.Math),
            Physics: parseInt(term.Physics),
          },
        },
      };

      const result = await resultCollection.updateOne(
        filter,
        updateTerm,
        options
      );
      res.send(result);
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

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(
        user,
        "c8f7271005d7cb49f09e71f9f24e8989f0126396a8a88cc1e232f15a130bf83e964e120940702b373c6fe477f69e1d9aa744e58dfc420c50f2794c424c688d91",
        { expiresIn: "100h" }
      );
      res.send(token);
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

    //get recheck by class id(roll number)
    app.get("/reCheck/:classId", async (req, res) => {
      const classId = parseInt(req.params.classId);

      const result = await reCheckCollection.findOne({
        classId: parseInt(classId),
      });
      res.send(result);
    });

    //get recheck by _id
    app.get("/reCheckDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const getFromCollection = await reCheckCollection.find(query).toArray();
      res.send(getFromCollection);
    });

    //recheck delete from collection
    app.delete("/reCheckDelete/:id", async (req, res) => {
      const id = req.params.id;
      const deleteId = { _id: new ObjectId(id) };
      const deleteFromCollection = await reCheckCollection.deleteOne(deleteId);
      res.send(deleteFromCollection);
    });

    //give feedback and set noitifications
    app.patch("/reCheckFeedback/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const feedBackText = req.body;
      const forNotify = {
        email: feedBackText.to,
        notify: feedBackText.notify,
      };
      const notify = await notificationsCollection.insertOne(forNotify);
      const setUpdated = {
        $set: {
          feedback: feedBackText.feedback,
          rechecked: feedBackText.reCheck,
        },
      };
      const result = await reCheckCollection.updateOne(
        filter,
        setUpdated,
        options
      );

      res.send({ result, notify });
    });

    app.get("/notification", async (req, res) => {
      const email = req.query.email;
      // console.log(email)
      const query = {
        email: email,
      };
      const result = await notificationsCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/clearnoti", async (req, res) => {
      const email = req.query.email;
      const query = {
        email: email,
      };
      const result = await notificationsCollection.deleteMany(query);
      res.send(result);
    });

    app.get("/reCheckUser", async (req, res) => {
      const email = req.query.email;
      const query = {
        email: email,
      };
      const result = await reCheckCollection.find(query).toArray();
      res.send(result);
    });

    //User Collections API

    app.post("/addUser", async (req, res) => {
      const userInfo = req.body;
      const query = {
        email: userInfo.email,
      };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "User already added" });
      } else {
        const result = await usersCollection.insertOne(userInfo);
        res.send(result);
      }
    });

    //Checking admin or not
    app.get("/user/isAdmin", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };

      return res.send(result);
    });

    //Manage User
    app.get("/userList", async (req, res) => {
      const userlist = await usersCollection.find().toArray();
      res.send(userlist);
    });

    app.patch("/userList/admin/:id", async (req, res) => {
      const id = req.params.id;
      const doc = req.body;
      const filter = { _id: new ObjectId(id) };
      const forNotify = {
        email: doc.to,
        notify: doc.notify,
      };
      const notify = await notificationsCollection.insertOne(forNotify);
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send({ result, notify });
    });
    app.delete("/deleteUser/:id", async (req, res) => {
      const id = req.params.id;
      const deleteId = { _id: new ObjectId(id) };
      const deleteFromCollection = await usersCollection.deleteOne(deleteId);
      res.send(deleteFromCollection);
    });

    app.get("/userInfo", async (req, res) => {
      const email = req.query.email;
      // console.log(email)
      const query = {
        email: email,
      };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.get("/getStats", async (req, res) => {
      const rechekedlist = { rechecked: "No" };
      const adminQuery = { role: "admin" };
      const totaluser = await usersCollection.find().toArray();
      const reviews = await reCheckCollection.find().toArray();
      const pending = await reCheckCollection.find(rechekedlist).toArray();
      const totalResult = await resultCollection.find().toArray();
      const admin = await usersCollection.find(adminQuery).toArray();
      const students = totaluser.length - admin.length;
      const rechecked = reviews.length - pending.length;
      res.send({
        totaluser: totaluser.length,
        reviews: reviews.length,
        pending: pending.length,
        rechecked,
        admin: admin.length,
        students,
        totalResult: totalResult.length,
      });
    });

    // searchbar start------------
    const indexKeys = { Name: 1, classId: 1 };
    const indexOptions = { Name: "NameClassId" };
    const result = await resultCollection.createIndex(indexKeys, indexOptions);

    app.get("/resultSearchByName/:text", async (req, res) => {
      const text = req.params.text;
      const result = await resultCollection
        .find({
          $or: [
            { Name: { $regex: text, $options: "i" } },
            { classId: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    // searchbar end------------

    app.patch("/updateUser", async (req, res) => {
      const updatedata = req.body;
      const email = updatedata.email;
      const query = { email: email };
      const updateDoc = {
        $set: {
          name: updatedata.name,
          roll: updatedata.roll,
          age: updatedata.age,
          address: updatedata.home,
          phone: updatedata.phone,
          gender: updatedata.gender,
          blood: updatedata.blood,
        },
      };
      const updateInfo = await usersCollection.updateOne(query, updateDoc);
      res.send(updateInfo);
    });
    //review Delete

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

// app.get("/", (req, res) => {
//   res.send("Server is running");
// });

// app.listen(port, () => {
//   console.log("Port is:", port);

// });

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
