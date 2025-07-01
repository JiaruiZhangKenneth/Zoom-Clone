const express = require("express");
const fs = require("fs");
const https = require("https");
const { v4: uuidV4 } = require("uuid");
const { Server } = require("socket.io");

const app = express();

// Load SSL cert and key
const server = https.createServer(
    {
        key: fs.readFileSync("/home/ubuntu/ssl/privkey.pem"),
        cert: fs.readFileSync("/home/ubuntu/ssl/cert.pem"),
    },
    app
    );

// Initialize Socket.IO
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

    app.get("/", (req, res) => {
    res.redirect(`/${uuidV4()}`);
    });

    app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
    });

    io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId); // Notify to all other users in the room that a new user has connected

        socket.on("disconnect", () => {
        socket.to(roomId).emit("user-disconnected", userId);
        });
    });
    });

server.listen(3030);
