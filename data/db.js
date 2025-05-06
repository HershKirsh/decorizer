const Mongoose = require('mongoose');
const db_uri = process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/decorizer`;
const connectDB = async () => {
  const options = {useNewUrlParser: true, useUnifiedTopology: true};
  if (process.env.DB_NAME) options.dbName = process.env.DB_NAME;
  const connection = await Mongoose.connect(db_uri, options);
  console.log(`MongoDB Connected (DB name: ${connection.connections[0].name})`);
};

module.exports = connectDB;