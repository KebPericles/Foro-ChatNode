var port = null;
var list = document.querySelector('#lista-users');
var username = window.location.pathname.replace('/chat/', '');
var clientes = [];
var server = 'chatxd.herokuapp.com';
var socket = io.connect(server);

function conectarChat() {
    var id = socket.id;
    console.log('id:', socket.id, 'useranme:', username);
    $.post('/login', { username: username, id: id }, function(data) {
        console.log(data);
        clientes = data.clientes;
        let mensajes = data.mensajes;
        list.innerHTML += 'Cargando...';
        var html = '';
        clientes.forEach(function(cliente) {
            html += '<li>' + cliente.username + '</li>';
        });

        mensajes.forEach(mensaje => {
            mensaje.username = mensaje.username.replace('</', '');
            var sanitized = mensaje.msg.replace('</', '');
            sanitized = sanitized.replace('>', '');
            sanitized = sanitized.replace('<', '');
            var msj;
            if (mensaje.id == socket.id) {
                msj = `
        <div class="local-message">
            <strong>${mensaje.username}: </strong>
            <p>${sanitized}</p>
        </div>
        `;
                document.querySelector('.mensajes-container').innerHTML += msj;
            } else {
                msj = `
        <div class="remote-message">
            <strong>${mensaje.username}: </strong>
            <p>${sanitized}</p>
        </div>
        `;
                document.querySelector('.mensajes-container').innerHTML += msj;
            }
        })

        list.innerHTML = html;
        $('.loader').hide();
    });
}

function enviarMensaje(e) {
    if (e.which != 13) return;
    var msg = document.querySelector('#input').value;
    if (msg.length <= 0) return;
    $.post('/send', {
        text: msg,
        username: username,
        id: socket.id
    }, function(data) {
        document.querySelector('#input').value = '';
    });
}

socket.on('mensaje', function(data) {
    data.username = data.username.replace('</', '');
    var sanitized = data.msg.replace('</', '');
    sanitized = sanitized.replace('>', '');
    sanitized = sanitized.replace('<', '');
    var msj;
    if (data.id == socket.id) {
        msj = `
    <div class="local-message">
    <strong>${data.username}: </strong>
    <p>${sanitized}</p>
    </div>
    `;
        document.querySelector('.mensajes-container').innerHTML += msj;
    } else {
        msj = `
    <div class="remote-message">
    <strong>${data.username}: </strong>
    <p>${sanitized}</p>
    </div>
    `;
        document.querySelector('.mensajes-container').innerHTML += msj;
    }
})

socket.on('socket_desconectado', function(data) {
    console.log(data);
    clientes = clientes.filter(function(cliente) {
        console.log(cliente);
        return cliente.id != data.id;
    });
    list.innerHTML += 'Cargando...';
    var html = '';
    clientes.forEach(function(cliente) {
        html += '<li>' + cliente.username + '</li>';
    });
    list.innerHTML = html;
});

socket.on('socket_conectado', function(data) {
    console.log(data);
    clientes.push(data);
    list.innerHTML += 'Cargando...';
    var html = '';
    clientes.forEach(function(cliente) {
        html += '<li>' + cliente.username + '</li>';
    });
    list.innerHTML = html;
});