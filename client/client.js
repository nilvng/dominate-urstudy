// variables
let clientName = prompt("What's your name?");
var gameId = null;
var playerColor = null;

// estabish connection
let ws = io()

// html element
const btnCreate = document.getElementById("btnCreate");
const formJoin = document.getElementById("formJoin");
const txtGameId = document.getElementById("txtGameId");
const divPlayers = document.getElementById("divPlayers");
const divBoard = document.getElementById("divBoard");
const divGameId = document.getElementById("divGameId");


// wiring events
// 1st event: create game
btnCreate.addEventListener("click", e => {
    const payload = {
        "clientId": clientName
    }
    ws.emit("create", payload)
})

// 2nd event: join game
formJoin.addEventListener("submit", e => {
    e.preventDefault()
    // take game id paste in input field
    if (gameId === null) gameId = txtGameId.value;
    const payload = {
        "clientName": clientName,
        "gameId": gameId
    }
    // ask server to let it join that game
    ws.emit('join',payload)
    //document.querySelector("#txtGameId").value = "";
})

// Listen for response from server
ws.on("create", (message) => {
    console.log("Create " + message.gameId)
    divGameId.textContent =`Game ID: ${message.gameId}`
    })

// event: update state the board
ws.on("play", (res) => {
    console.log("Update game")
    if (!res.state) return;
    for(const b of Object.keys(res.state))
    {
        const color = res.state[b];
        //console.log("ball to update: "+ b)
        const cellElement = document.getElementById("ball" + b);
        cellElement.style.backgroundColor = color
    }
    
})

// 2nd event join
ws.on("join", (res) => {
    console.log("Join game: "+ res.game.id)
    const game = res.game;

    // Player section
    // clear the list of players if any
    while(divPlayers.firstChild)
        divPlayers.removeChild (divPlayers.firstChild)

    game.clients.forEach (c => {
        // show list of players
        const d = document.createElement("div");
        d.style.width = "200px";
        d.style.background = c.color
        d.textContent = c.clientName;
        divPlayers.appendChild(d);
        // colect color of that client from the list
        if (c.clientName === clientName) playerColor = c.color;
    })

    // Board section
    // clear if any
    while(divBoard.firstChild)
    divBoard.removeChild (divBoard.firstChild)

    // draw board
    for (let i = 0; i < game.cells; i++){

        const b = document.createElement("button");
        b.id = "ball" + (i + 1);
        b.tag = i+1
        b.textContent = i+1
        b.style.width = "150px"
        b.style.height = "150px"

        // assign event to send request to server
        b.addEventListener("click", e => {
            b.style.background = playerColor
            const payLoad = {
                "gameId": gameId,
                "cellId": b.tag,
                "color": playerColor
            }
            ws.emit("play",payLoad)
        })
        divBoard.appendChild(b);
    }
})