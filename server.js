const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("WhatsApp Chat Analyzer Backend Running");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  
  console.error("Unhandled error:", err);

  const msg = typeof err?.message === "string" ? err.message : "Internal Server Error";

  if (msg.includes("Unexpected end of form")) {
    return res.status(400).json({
      error: "Malformed multipart/form-data upload. In Postman/Thunder Client, use form-data with a File field named 'chatFile' and do not set the Content-Type header manually.",
    });
  }

  return res.status(500).json({ error: msg });
});

