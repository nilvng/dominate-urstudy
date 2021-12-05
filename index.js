const http = require("http");
const app = require("express")()
app.get("/", (req,res)=> res.sendFile(__dirname + "/index.html"))
app.listen(9091, () => console.log("Listening on port 9091"))

const websocket = require('websocket').server
const server = http.createServer();
const PORT = 9090
server.listen(PORT, () => console.log(`Listening ... on ${PORT}`));

const clients = {};
const games = {};

const  wsServer = new websocket({
    "httpServer": server
})

wsServer.on("request", req => {
    // tcp connection established
    const connection = req.accept(null, req.origin);
       // once connect, create uid for client
       const clientId = guid()

       // save user preference
       clients[clientId] = {
           "connection": connection
       }
   
       const payload = {
           "method": "connect",
           "clientId": clientId
       }
   
       // send back client connection
       connection.send(JSON.stringify(payload))
   
    connection.on("open", () => console.log("opened!"))
    connection.on("closed", () => console.log("closed!"))
    connection.on("message", message => {
        console.log("message!");
        const res = JSON.parse(message.utf8Data) // may fail if itsnt json
        
        // request to Create a game
        if (res.method === "create"){
            const clientId = res.clientId
            const gameId = guid()
            games[gameId] = {
                "id": gameId,
                "cells": 20,
                "clients": []
            }
            const payload = {
                "method": "create",
                "game": gameId
            }
            // respond back to user
            const con = clients[clientId].connection
            con.send(JSON.stringify(payload))
        }

            // request to Join a game
            if (res.method === "join"){
                const clientId = res.clientId
                const gameId = res.gameId
                const game = games[gameId] 

                if (games[gameId].clients.length >= 3) 
                {
                    //sorry max players reach
                    return;
                }
                if (games[gameId].clients.length == 2) broadcastState() // first click will start the game

                const color =  {"0": "Red", "1": "Green", "2": "Blue"}[game.clients.length]
                games[gameId].clients.push({
                    "clientId": clientId,
                    "color": color
                })

                const payload = {
                    "method": "join",
                    "game": game
                }
                // broadcast all users
                //loop through all clients and tell them that people has joined
                games[gameId].clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payload))
            })
            }

            if (res.method === "play"){

                const gameid= res.gameId;
                const cellId = res.cellId;
                const color = res.color;

                let state = games[gameid].state;

                if (!state) {
                    state = {} // initialize state of board, if hasnt already
                }

                state[cellId] = color;
                games[gameid].state = state;
                console.log("play " + games[gameid].state[cellId] + "cell: "+ cellId)
            }


    })

 

})

function broadcastState(){
    console.log('broadcastin!!')
    // update every games
    for (const g of Object.keys(games)) {
        const game = games[g]
        const s = game.state
        console.log("state before sent: " + s)
        const payload = {
            "method": "update",
            "state": s
        }
        game.clients.forEach( c => {
            clients[c.clientId].connection.send(JSON.stringify(payload))
        })
}
    setTimeout(broadcastState, 500);
}

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
 
