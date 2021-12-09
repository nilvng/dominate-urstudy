const express = require('express');
const app = express();
const http = require("http");
const server = http.createServer(app);

const {Server } = require("socket.io");
const io = new Server(server);
app.use("/client",express.static("./client/"))
app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})

const games = {};

io.on("connection", (socket) => {
    console.log("User connected")

    socket.on("create", data => {

        const gameId = guid()
        games[gameId] = {
            "id": gameId,
            "cells": 20,
            "clients": []
        }
        const payload = {
            gameId
        }
        // respond back to user
        socket.emit('create',payload)
        })

    socket.on("join", data => {
        const clientName = data.clientName
        const gameId = data.gameId
        console.log("client: "+ socket.id + " join: "+ gameId)
        socket.join(gameId);

        //sorry max players reach
        if (games[gameId].clients.length >= 3) return;

        const color =  {"0": "Red", "1": "Green", "2": "Blue"}[games[gameId].clients.length]
        games[gameId].clients.push({
            clientName,
            color
        })
        const payload = {
            game: games[gameId]
                }
        // inform other users
        io.to(gameId).emit('join',payload)
        })

        socket.on("play", data => {
            
            const gameId= data.gameId;
            const cellId = data.cellId;
            const color = data.color;

            let state = games[gameId].state;

            if (!state) {
                state = {} // initialize state of board, if hasnt already
            }

            state[cellId] = color;
            games[gameId].state = state;
            io.to(gameId).emit("play",{state})
            //console.log("play " + games[gameid].state[cellId] + "cell: "+ cellId)
        })
    })

 

const PORT = process.env.PORT || 9090
server.listen(PORT, () => console.log(`Listening ... on ${PORT}`));


function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
 
