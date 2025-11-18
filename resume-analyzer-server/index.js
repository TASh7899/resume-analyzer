const routes = require('./routes/MainRoute.js');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

const corsOptions = {
  origin: ["http://localhost:5173", "https://resume-frontend-fl09.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use('/api/pdf', routes)

app.get('/test', (req, res) => {
  res.json({ message: "hello world" });
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log("server running on Port", port);
});
