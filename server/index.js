const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const Employeemodel = require('./model/Employee');
const Agent = require('./model/Agent');
const Item = require('./model/Item');

const app = express();
app.use(express.json());
app.use(cors());


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  Employeemodel.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password == password) {
          res.json('Success'); // front end acts accordingly after seeing this success
        } else {
          res.json("the password is incorrect");
        }
      } else {
        res.json("no email exists");
      }
    });
});


app.post('/register', (req, res) => {
  Employeemodel.create(req.body)
    .then(employees => res.json(employees))
    .catch(err => res.json(err));
});

mongoose.connect("mongodb://127.0.0.1:27017/employee");

// these are the routes
app.get("/agents", async (req, res) => {
  const agents = await Agent.find();
  res.json(agents);
});

app.post("/agents", async (req, res) => {
  const agent = await Agent.create(req.body);
  res.json(agent);
});

app.delete("/agents/:id", async (req, res) => {
  await Agent.findByIdAndDelete(req.params.id);
  res.json({ message: "Agent deleted" });
});


app.get("/items", async (req, res) => {
  const items = await Item.find().populate('assignedTo', 'name'); 
  res.json(items);
});

// upload file
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  
  try {
    const agents = await Agent.find();
    if (!file || agents.length === 0) {
      if (file) fs.unlinkSync(file.path);
      return res.status(400).json({ error: "File or agents missing" });
    }

    let items = [];
    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        if (row.FirstName && row.Phone) {
          items.push({ firstName: row.FirstName, phone: row.Phone, notes: row.Notes || "" });
        }
      })
      .on("end", async () => {
        fs.unlinkSync(file.path); // Clean it up after reading
        
        const distributed = items.map((item, i) => {
          const agent = agents[i % agents.length];
          return { ...item, assignedTo: agent._id };
        });

        if (distributed.length > 0) {
            await Item.insertMany(distributed);
        }
        res.json({ message: "CSV uploaded and distributed", count: distributed.length });
      });
  } catch (err) {
      if (file) fs.unlinkSync(file.path);
      res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

