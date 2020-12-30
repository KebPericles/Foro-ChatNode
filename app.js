const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var clientes = [];
var mensajes = [];

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
server.listen(PORT, () => console.log('Servidor iniciado en ' + PORT));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/chat/:username', function(req, res) {
    res.sendFile(__dirname + '/public/chat.html');
});

app.post('/login', function(req, res) {
    let username = req.body.username;
    let id = req.body.id;
    clientes.push({ id: id, username: username });
    let iniciar = { clientes: clientes, mensajes: mensajes };
    io.emit('socket_conectado', { id: id, username: username });
    return res.json(iniciar);
});

app.post('/send', function(req, res) {
    let username = req.body.username;
    let id = req.body.id;
    let msg = req.body.text;
    mensajes.push({ id: id, msg: msg, username: username });
    io.emit('mensaje', { id: id, msg: msg, username: username });
    return res.json({ text: 'Mensaje enviado.' });
});

io.on('connection', socket => {
    console.log('Socket conectado', socket.id);
    socket.on('disconnect', () => {
        clientes = clientes.filter(cliente => cliente.id != socket.id);
        console.log("Cliente desconectado: " + socket.id);
        if (clientes.length == 0) {
            mensajes = [];
        }
        io.emit('socket_desconectado', { texto: 'Socket desconectado.', id: socket.id });
    });
});