const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://yelurirohith2025:WYJPNkGLOKGWPq2u@cluster0.f05nm.mongodb.net/AuthXDB?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  metamaskcode: { type: String, required: true },
  previousLogins: [{
    timestamp: { type: Date, default: Date.now },
    website: { type: String, required: true }
  }]
});

const User = mongoose.model("Users", userSchema);

app.post("/user/signup", async (req, res) => {
  try {
    const { username, password, metamaskcode } = req.body;

    const isExists = await User.findOne({ username });
    if (isExists) {
      return res.status(400).json({ Msg: "User Already Exists" });
    }

    const newUser = new User({
      username,
      password, 
      metamaskcode,
      previousLogins: []
    });

    await newUser.save();
    res.status(201).json({ Msg: "User Created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Msg: "Internal Server Error" });
  }
});


app.post("/user/login", async (req, res) => {
  try {
    const { username, password, metamaskcode } = req.body;

    const user = await User.findOne({ username, password, metamaskcode }); 

    if (!user) {
      return res.status(400).json({ Msg: "Invalid Credentials" });
    }

    const website = req.headers.referer || req.headers.origin || "Unknown Website";

    user.previousLogins.push({ timestamp: new Date(), website });
    await user.save();

    res.status(200).json({
      Msg: "Login Successful",
      UserData: {
        username: user.username,
        metamaskcode: user.metamaskcode,
        previousLogins: user.previousLogins.slice(-5)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Msg: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server Running on Port: ${PORT}`));