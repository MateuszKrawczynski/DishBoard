let express  = require('express');
let ws = require('ws');
let os = require('os');
let socket_server = new ws.WebSocket.Server({port: 8080});
let hashmap = {
    numbers: ["__startVAL"],
    content: ["__startVAL"],
    numbers_realized: ["__startVAL"]
};
const getServerIp = () => {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      for (const iface of networkInterfaces[interfaceName]) {
        // Check for IPv4 and ensure it's not an internal (127.0.0.1) address
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return 'IP not found';
  };
let number = 1;
let app = express();
app.set("view engine","ejs");
app.use("/public",express.static("public"));
app.use(express.urlencoded());
socket_server.on('connection' , (socket) => {
    socket.send(JSON.stringify(hashmap));
});




app.listen(80,"0.0.0.0" , ()=> {
    console.log("running on port 80");
});

app.get("/",(req,res) => {
    res.render("buy");
});

app.post("/new",(req,res) =>{
    let content = req.body.content;
    hashmap.numbers.push(number);
    hashmap.content.push(content);
    res.send(`<center><h1 style="font-size:100px;">Number:<br><br>${number}</h1><br><br><h1><a href="/">Order something</a></h1></center>`);
    number++;
    socket_server.clients.forEach((client) => {
        client.send(JSON.stringify(hashmap));
    } );
});

app.get("/display",(req,res) =>{
    res.render("display" , {ip: getServerIp()});
});

app.get("/manage",(req,res) =>{
    res.render("dashboard",  {ip: getServerIp()});
});
app.get("/call/:id" , (req,res) => {
    let num = req.params.id;
    let i = hashmap.numbers.indexOf(num);
    hashmap.content.splice(i,1);
    hashmap.numbers.splice(i,1);
    hashmap.numbers_realized.push(num);
    socket_server.clients.forEach((client) => {
        client.send(JSON.stringify(hashmap));
    } );
    res.redirect("/manage");
});

app.get("/end/:id",(req,res) => {
    let num = req.params.id;
    let i = hashmap.numbers_realized.indexOf(num);
    hashmap.numbers_realized.splice(i,1);
    socket_server.clients.forEach((client) => {
        client.send(JSON.stringify(hashmap));
    } );
    res.redirect("/manage");
});

app.use((req, res) => {
    res.redirect("/");
})