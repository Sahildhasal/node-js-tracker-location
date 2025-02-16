const socket = io();
console.log("socket: ", socket);

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { longitude, latitude } = position.coords;
            socket.emit("send-location", { longitude, latitude });
        },
        (error) => {
            console.error("error from geolocation in script.js file: ", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
        }
    );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

// Receive all existing locations when a new client connects
socket.on("existing-locations", (locations) => {
    console.log("Existing locations:", locations);
    for (const id in locations) {
        const { latitude, longitude } = locations[id];
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle new location updates
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude], 16);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    console.log("User disconnected:", id);
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
