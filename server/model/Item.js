const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    firstName: String,
    phone: String,
    notes: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agents'
    },
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees',
        required: true
    }
});

const Item = mongoose.model("items", ItemSchema);
module.exports = Item;