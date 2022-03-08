const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const app = express();

// Init Middleware
app.use(bodyparser());
app.use(express.json({ extended: false }));

// Define Routes
app.use("/signature", require("./routes/api/signatureAPI"));
app.use(express.static(path.join(__dirname, "./mechashibas-nft/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./mechashibas-nft/build/index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
