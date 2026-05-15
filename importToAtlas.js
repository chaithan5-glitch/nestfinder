require('dotenv').config();
const mongoose = require("mongoose");
const fs = require("fs");
const Property = require("./backend/models/Property");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to Atlas..."));

async function importData() {
    const raw = JSON.parse(fs.readFileSync('./properties.json', 'utf-8'));

    // Fix MongoDB Extended JSON format from Compass export
    const cleaned = raw.map(p => {
        const obj = { ...p };

        // Fix _id
        if (obj._id && obj._id.$oid) obj._id = new mongoose.Types.ObjectId(obj._id.$oid);

        // Fix dates
        if (obj.createdAt && obj.createdAt.$date) obj.createdAt = new Date(obj.createdAt.$date);
        if (obj.updatedAt && obj.updatedAt.$date) obj.updatedAt = new Date(obj.updatedAt.$date);

        return obj;
    });

    await Property.deleteMany();
    await Property.insertMany(cleaned);
    console.log(`✅ ${cleaned.length} properties imported to Atlas!`);
    mongoose.disconnect();
}

importData();