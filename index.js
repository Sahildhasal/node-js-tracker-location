const express = require("express");
const app = express();
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const path = require("path");

const io = socketio(server);

app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")));

// Store locations
const userLocations = {};

io.on("connection", function(socket) {
    console.log("Connected:", socket.id);

    // Send existing locations to the new user
    socket.emit("existing-locations", userLocations);

    socket.on("send-location", function(data) {
        console.log("send-location called");

        // Store location data
        userLocations[socket.id] = data;
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", function() {
        console.log("User disconnected:", socket.id);
        delete userLocations[socket.id];
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", async (req, res) => {
    return res.render("index");
});

const port = 8001;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
