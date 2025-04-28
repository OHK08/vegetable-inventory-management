const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const {MongoClient, ObjectId} = require("mongodb");
const cors = require("cors")({origin: true});

// Initialize Firebase Admin
admin.initializeApp();

// MongoDB Connection
const uri = "mongodb+srv://omshreekenjaleok:omshreek@vegetableshop.uq4okdw.mongodb.net/vegetableshop?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let db;

// Initialize Express
const app = express();
app.use(cors);
app.use(express.json());

/**
 * Establishes a connection to the MongoDB database.
 * @return {Promise<Db>} The MongoDB database instance.
 */
async function connectToMongo() {
  if (!db) {
    try {
      await client.connect();
      db = client.db("database");
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      throw new Error("Failed to connect to MongoDB: " + error.message);
    }
  }
  return db;
}

/**
 * Validates vegetable data for required fields and category.
 * @param {Object} data - The vegetable data to validate.
 * @param {string} data.name - The name of the vegetable.
 * @param {number|string} data.price - The price of the vegetable.
 * @param {string} data.category - The category of the vegetable.
 * @return {Object} Validation result with isValid and error.
 */
function validateVegetableData(data) {
  const {name, price, category} = data;
  if (!name || name.trim() === "") {
    return {isValid: false, error: "Name is required and cannot be empty"};
  }
  if (price == null || isNaN(Number(price)) || Number(price) < 0) {
    return {isValid: false, error: "Price must be a valid non-negative number"};
  }
  if (!category) {
    return {isValid: false, error: "Category is required"};
  }
  const validCategories = [
    "stem", "root", "bulb", "leaves",
    "fruits", "herb", "seeds", "vegetable",
  ];
  if (!validCategories.includes(category)) {
    return {
      isValid: false,
      error: `Category must be one of: ${validCategories.join(", ")}`,
    };
  }
  return {isValid: true, error: null};
}

/**
 * Validates daily stock vegetable entries.
 * @param {Array} vegetables - Array of vegetable stock entries.
 * @param {Object} vegetablesCollection - MongoDB vegetables collection.
 * @return {Promise<Object>} Validation result with isValid and error.
 */
async function validateDailyStockVegetables(vegetables, vegetablesCollection) {
  if (!Array.isArray(vegetables)) {
    return {isValid: false, error: "Vegetables must be an array"};
  }
  for (const veg of vegetables) {
    if (!veg.id || typeof veg.id !== "string" || !/^[0-9a-fA-F]{24}$/.test(veg.id)) {
      return {isValid: false, error: "Each vegetable must have a valid 24-character hexadecimal id"};
    }
    if (typeof veg.quantity !== "number" || veg.quantity < 0 || isNaN(veg.quantity)) {
      return {isValid: false, error: "Each vegetable must have a valid non-negative quantity"};
    }
    if (!veg.photo || typeof veg.photo !== "string" || veg.photo.trim() === "") {
      return {isValid: false, error: "Each vegetable must have a non-empty photo URL"};
    }
    try {
      const exists = await vegetablesCollection.findOne({_id: new ObjectId(veg.id)});
      if (!exists) {
        return {isValid: false, error: `Vegetable with id ${veg.id} not found`};
      }
    } catch (error) {
      console.error("Error validating vegetable id:", error);
      return {isValid: false, error: "Invalid vegetable id format"};
    }
  }
  return {isValid: true, error: null};
}

/**
 * Validates date string in YYYY-MM-DD format.
 * @param {string} date - Date string to validate.
 * @return {boolean} True if valid, false otherwise.
 */
function isValidDate(date) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const parsed = new Date(date);
  return parsed instanceof Date && !isNaN(parsed) && date === parsed.toISOString().split("T")[0];
}

/**
 * Gets today's date in YYYY-MM-DD format.
 * @return {string} Today's date.
 */
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Gets the previous day's date in YYYY-MM-DD format.
 * @return {string} Previous day's date.
 */
function getPreviousDayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

/**
 * Middleware to connect to MongoDB and set collections.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function mongoMiddleware(req, res, next) {
  try {
    const db = await connectToMongo();
    req.collections = {
      vegetables: db.collection("vegetables"),
      dailyStock: db.collection("daily_stock"),
    };
    next();
  } catch (error) {
    console.error("MongoDB middleware error:", error);
    res.status(500).json({error: "Failed to connect to database"});
  }
}

// Apply middleware to all routes
app.use(mongoMiddleware);

// Vegetables CRUD Endpoints

/**
 * POST /vegetables: Create a new vegetable.
 */
app.post("/vegetables", async (req, res) => {
  try {
    console.log("POST /vegetables:", req.body);
    const vegetableData = req.body;
    const validation = validateVegetableData(vegetableData);
    if (!validation.isValid) {
      console.log("Validation failed:", validation.error);
      return res.status(400).json({error: validation.error});
    }
    const processedData = {
      ...vegetableData,
      price: Number(vegetableData.price),
      photo: vegetableData.photo || "",
      createdAt: new Date(),
    };
    console.log("Inserting vegetable:", processedData);
    const result = await req.collections.vegetables.insertOne(processedData);
    console.log("Insert result:", result);
    res.status(201).json({
      id: result.insertedId,
      message: "Vegetable created",
    });
  } catch (error) {
    console.error("POST /vegetables error:", error);
    res.status(500).json({error: "Server error while creating vegetable"});
  }
});

/**
 * GET /vegetables: Get all vegetables.
 */
app.get("/vegetables", async (req, res) => {
  try {
    console.log("GET /vegetables");
    const vegetables = await req.collections.vegetables.find().toArray();
    res.status(200).json(vegetables);
  } catch (error) {
    console.error("GET /vegetables error:", error);
    res.status(500).json({error: "Server error while fetching vegetables"});
  }
});

/**
 * GET /vegetables/:id: Get a specific vegetable.
 */
app.get("/vegetables/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("GET /vegetables/:id", id);
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({error: "Invalid ID format: Must be a 24-character hexadecimal string"});
    }
    const vegetable = await req.collections.vegetables.findOne({_id: new ObjectId(id)});
    if (!vegetable) {
      return res.status(404).json({error: "Vegetable not found"});
    }
    res.status(200).json(vegetable);
  } catch (error) {
    console.error("GET /vegetables/:id error:", error);
    res.status(500).json({error: "Server error while fetching vegetable"});
  }
});

/**
 * PUT /vegetables/:id: Update a vegetable.
 */
app.put("/vegetables/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("PUT /vegetables/:id", id, req.body);
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({error: "Invalid ID format: Must be a 24-character hexadecimal string"});
    }
    const vegetableData = req.body;
    const validation = validateVegetableData(vegetableData);
    if (!validation.isValid) {
      console.log("Validation failed:", validation.error);
      return res.status(400).json({error: validation.error});
    }
    const processedData = {
      ...vegetableData,
      price: Number(vegetableData.price),
    };
    const result = await req.collections.vegetables.updateOne(
        {_id: new ObjectId(id)},
        {
          $set: {
            ...processedData,
            updatedAt: new Date(),
          },
        },
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({error: "Vegetable not found"});
    }
    res.status(200).json({message: "Vegetable updated"});
  } catch (error) {
    console.error("PUT /vegetables/:id error:", error);
    res.status(500).json({error: "Server error while updating vegetable"});
  }
});

/**
 * DELETE /vegetables/:id: Delete a vegetable.
 */
app.delete("/vegetables/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("DELETE /vegetables/:id", id);
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({error: "Invalid ID format: Must be a 24-character hexadecimal string"});
    }
    const result = await req.collections.vegetables.deleteOne({_id: new ObjectId(id)});
    if (result.deletedCount === 0) {
      return res.status(404).json({error: "Vegetable not found"});
    }
    res.status(200).json({message: "Vegetable deleted"});
  } catch (error) {
    console.error("DELETE /vegetables/:id error:", error);
    res.status(500).json({error: "Server error while deleting vegetable"});
  }
});

// Daily Stock CRUD Endpoints

/**
 * POST /daily-stock: Create or update daily stock for a specified date (default: today).
 */
app.post("/daily-stock", async (req, res) => {
  try {
    const {vegetables, date = getTodayDate()} = req.body;
    console.log("POST /daily-stock", {date, vegetables});
    if (!isValidDate(date)) {
      return res.status(400).json({
        error: "Invalid date format: Use YYYY-MM-DD",
      });
    }
    const validation = await validateDailyStockVegetables(
        vegetables,
        req.collections.vegetables,
    );
    if (!validation.isValid) {
      console.log("Validation failed:", validation.error);
      return res.status(400).json({error: validation.error});
    }
    const existingStock = await req.collections.dailyStock.findOne({_id: date});
    let result;
    if (existingStock) {
      // Merge quantities for existing vegetables, append new ones
      const updatedVegetables = [...existingStock.vegetables];
      for (const newVeg of vegetables) {
        const existingVegIndex = updatedVegetables.findIndex(
            (veg) => veg.id === newVeg.id,
        );
        if (existingVegIndex !== -1) {
          // Update quantity for existing vegetable
          updatedVegetables[existingVegIndex].quantity += newVeg.quantity;
          updatedVegetables[existingVegIndex].photo = newVeg.photo; // Update photo if provided
        } else {
          // Append new vegetable
          updatedVegetables.push(newVeg);
        }
      }
      result = await req.collections.dailyStock.updateOne(
          {_id: date},
          {
            $set: {
              vegetables: updatedVegetables,
              updatedAt: new Date(),
            },
          },
      );
      console.log("Updated existing daily stock:", result);
    } else {
      // Create new document
      const stockData = {
        _id: date,
        vegetables,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      console.log("Inserting new daily stock:", stockData);
      result = await req.collections.dailyStock.insertOne(stockData);
      console.log("Insert result:", result);
    }
    res.status(201).json({
      id: date,
      message: existingStock ?
        "Vegetables merged or appended to daily stock" :
        "Daily stock created",
    });
  } catch (error) {
    console.error("POST /daily-stock error:", error);
    res.status(500).json({error: "Server error while creating or updating daily stock"});
  }
});

/**
 * GET /daily-stock: Get all daily stock records.
 */
app.get("/daily-stock", async (req, res) => {
  try {
    console.log("GET /daily-stock");
    const stocks = await req.collections.dailyStock.find().toArray();
    res.status(200).json(stocks);
  } catch (error) {
    console.error("GET /daily-stock error:", error);
    res.status(500).json({error: "Server error while fetching daily stocks"});
  }
});

/**
 * GET /daily-stock/:date: Get daily stock for a specific date or previous day if date is "previous-day".
 */
app.get("/daily-stock/:date", async (req, res) => {
  try {
    const dateParam = req.params.date;
    console.log("GET /daily-stock/:date", dateParam);
    let queryDate;
    if (dateParam === "previous-day") {
      queryDate = getPreviousDayDate();
      console.log("Fetching previous day's stock for:", queryDate);
    } else {
      if (!isValidDate(dateParam)) {
        return res.status(400).json({
          error: "Invalid date format: Use YYYY-MM-DD",
        });
      }
      queryDate = dateParam;
    }

    const stock = await req.collections.dailyStock.findOne({_id: queryDate});
    if (!stock) {
      return res.status(404).json({
        error: `Daily stock not found for ${dateParam === "previous-day" ? "previous day" : queryDate}`,
      });
    }
    res.status(200).json(stock);
  } catch (error) {
    console.error("GET /daily-stock/:date error:", error);
    res.status(500).json({error: "Server error while fetching daily stock"});
  }
});

/**
 * PUT /daily-stock/:date: Update daily stock for a specific date.
 */
app.put("/daily-stock/:date", async (req, res) => {
  try {
    const date = req.params.date;
    const {vegetables} = req.body;
    console.log("PUT /daily-stock/:date", {date, vegetables});
    if (!isValidDate(date)) {
      return res.status(400).json({
        error: "Invalid date format: Use YYYY-MM-DD",
      });
    }
    const validation = await validateDailyStockVegetables(
        vegetables,
        req.collections.vegetables,
    );
    if (!validation.isValid) {
      console.log("Validation failed:", validation.error);
      return res.status(400).json({error: validation.error});
    }
    const stockData = {
      _id: date,
      vegetables,
      updatedAt: new Date(),
    };
    const result = await req.collections.dailyStock.replaceOne(
        {_id: date},
        stockData,
        {upsert: true},
    );
    res.status(200).json({
      id: date,
      message: result.upsertedCount ?
      "Daily stock created" : "Daily stock updated",
    });
  } catch (error) {
    console.error("PUT /daily-stock/:date error:", error);
    res.status(500).json({error: "Server error while updating daily stock"});
  }
});

/**
 * DELETE /daily-stock/:date: Delete daily stock for a specific date.
 */
app.delete("/daily-stock/:date", async (req, res) => {
  try {
    const date = req.params.date;
    console.log("DELETE /daily-stock/:date", date);
    if (!isValidDate(date)) {
      return res.status(400).json({
        error: "Invalid date format: Use YYYY-MM-DD",
      });
    }
    const result = await req.collections.dailyStock.deleteOne({_id: date});
    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: "Daily stock not found for this date",
      });
    }
    res.status(200).json({message: "Daily stock deleted"});
  } catch (error) {
    console.error("DELETE /daily-stock/:date error:", error);
    res.status(500).json({error: "Server error while deleting daily stock"});
  }
});

/**
 * DELETE /daily-stock/:date/vegetable/:vegetableId:
 * Delete a specific vegetable from a date's stock.
 */
app.delete("/daily-stock/:date/vegetable/:vegetableId", async (req, res) => {
  try {
    const {date, vegetableId} = req.params;
    console.log(
        "DELETE /daily-stock/:date/vegetable/:vegetableId",
        {date, vegetableId},
    );
    if (!isValidDate(date)) {
      return res.status(400).json({error: "Invalid date format: Use YYYY-MM-DD"});
    }
    if (!vegetableId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({error: "Invalid vegetable ID format: Must be a 24-character hexadecimal string"});
    }
    const result = await req.collections.dailyStock.updateOne(
        {_id: date},
        {$pull: {vegetables: {id: vegetableId}}},
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({error: "Daily stock not found for this date"});
    }
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        error: "Vegetable not found in daily stock",
      });
    }
    res.status(200).json({message: "Vegetable removed from daily stock"});
  } catch (error) {
    console.error(
        "DELETE /daily-stock/:date/vegetable/:vegetableId error:", error,
    );
    res.status(500).json({
      error: "Server error while removing vegetable from daily stock",
    });
  }
});

/**
 * Handle invalid routes.
 */
app.use((req, res) => {
  console.log("Invalid route:", req.method, req.path);
  res.status(404).json({error: "Endpoint not found"});
});

/**
 * Global error handler.
 */
app.use((error, req, res, next) => {
  console.error("Global error:", error);
  res.status(500).json({error: `Internal server error: ${error.message}`});
});

// Export Firebase Function
exports.omshreeVegies = functions.https.onRequest(async (req, res) => {
  try {
    await app(req, res);
  } finally {
    if (client.topology && client.topology.isConnected()) {
      await client.close();
      db = null;
      console.log("MongoDB connection closed");
    }
  }
});
