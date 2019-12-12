var mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/decorizer', { useUnifiedTopology: true, useNewUrlParser: true });