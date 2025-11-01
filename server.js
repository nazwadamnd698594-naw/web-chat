const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

let users = {}; // simpan username per socket.id

// halaman login
app.get("/", (req, res) => {
  res.render("index");
});

// setelah login, kirim username ke halaman chat
app.post("/chat", (req, res) => {
  const username = req.body.username || "Anonim";
  res.render("chat", { username });
});

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("chat message", { user: "Sistem", message: `${username} bergabung ke obrolan` });
  });

  socket.on("chat message", (msg) => {
    const username = users[socket.id] || "Anonim";
    io.emit("chat message", { user: username, message: msg });
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    if (username) {
      io.emit("chat message", { user: "Sistem", message: `${username} keluar dari obrolan` });
      delete users[socket.id];
    }
  });
});

const PORT = 8000;
http.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
