// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const jwt = require('jsonwebtoken'); // Import jwt

// Import models and middleware
const Employeemodel = require('./model/Employee');
const Agent = require('./model/Agent');
const Item = require('./model/Item');
const authMiddleware = require('./authMiddleware'); 

const app = express();
app.use(express.json());
app.use(cors());

// Use a secret key for JWT
const JWT_SECRET = "your-secret-key";

// --- AUTHENTICATION ROUTES ---

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    Employeemodel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    // On success, create a token with user's ID
                    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
                    res.json({ message: 'Success', token: token });
                } else {
                    res.status(401).json("The password is incorrect");
                }
            } else {
                res.status(404).json("No email exists");
            }
        })
        .catch(err => res.status(500).json(err));
});

app.post('/register', (req, res) => {
    Employeemodel.create(req.body)
        .then(employees => res.json(employees))
        .catch(err => res.json(err));
});

mongoose.connect("mongodb://127.0.0.1:27017/employee");

// --- PROTECTED ROUTES (Apply middleware) ---

// Find only agents created by the logged-in user
app.get("/agents", authMiddleware, async (req, res) => {
    const agents = await Agent.find({ createdBy: req.user._id });
    res.json(agents);
});

// Create an agent and link it to the logged-in user
app.post("/agents", authMiddleware, async (req, res) => {
    const agentData = { ...req.body, createdBy: req.user._id };
    const agent = await Agent.create(agentData);
    res.json(agent);
});

// Ensure a user can only delete their own agents
app.delete("/agents/:id", authMiddleware, async (req, res) => {
    await Agent.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    res.json({ message: "Agent deleted" });
});

// Find only items created by the logged-in user
app.get("/items", authMiddleware, async (req, res) => {
    const items = await Item.find({ createdBy: req.user._id }).populate('assignedTo', 'name');
    res.json(items);
});

// File upload route
const upload = multer({ dest: "uploads/" });
app.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    
    const file = req.file;
    const userId = req.user._id; // Get user ID from middleware

    try {
        // Fetch only agents belonging to the current user
        const agents = await Agent.find({ createdBy: userId });
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
                fs.unlinkSync(file.path);

                const distributed = items.map((item, i) => {
                    const agent = agents[i % agents.length];
                    
                    return { ...item, assignedTo: agent._id, createdBy: userId };
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