var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var interfaces = require('os').networkInterfaces();

app.use(express.static('public'));

var clients = [];

function emitClients() {
  io.emit('clients', JSON.stringify(clients.map(function (client) {
    return {
      id: client.socket.id,
      name: client.name
    };
  })));
}

io.on('connection', function (socket) {
  socket.on('disconnect', function () {
    const index = clients.findIndex(function (client) {
      return client.socket === socket;
    });

    index > -1 && clients.splice(index, 1);

    emitClients();
  });

  socket.on('identify', function (name) {
    clients.push({
      name: name,
      socket: socket
    });

    emitClients();
  });

  socket.on('sendToScreen', function (data) {
    data = JSON.parse(data);

    data.clients
      .map(function (id) {
        return clients.find(function (_client) {
          return _client.socket.id === id
        });
      })
      .forEach(function (client) {
        client.socket.emit('sendToScreen', JSON.stringify(data.media));
      });
  });
});

http.listen(8080, function () {
  console.log('Listening on port 8080');
  console.log('interfaces:');

  for (var interface in interfaces) {
    if (interfaces.hasOwnProperty(interface)) {
      console.log(interface + ': ' + interfaces[interface][0].address);
    }
  }
});
