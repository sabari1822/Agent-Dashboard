const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
   
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees', 
        required: true
    }
});

const Agent = mongoose.model("agents", AgentSchema);
module.exports = Agent;