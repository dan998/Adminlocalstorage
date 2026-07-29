const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;

const server = new WebSocket.Server({
    port: PORT,
    host: "0.0.0.0"
});


let clients = [];


server.on("connection", socket => {

    console.log("Client connected");


    clients.push(socket);


    socket.on("message", message => {

        console.log(
            "Forwarding:",
            message.toString()
        );


        clients.forEach(client => {

            if(
                client !== socket &&
                client.readyState === WebSocket.OPEN
            ){

                client.send(
                    message.toString()
                );

            }

        });

    });



    socket.on("close",()=>{

        clients =
        clients.filter(
            c => c !== socket
        );

    });

});


console.log(
`WebSocket running on ${PORT}`
);
