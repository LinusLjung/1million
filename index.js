var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var watch = require('node-watch');
var fs = require('fs');

app.use(express.static('public'));

function emitFiles() {
  fs.readdir('public/media', null, function (err, files) {
    io.emit('files', JSON.stringify(files.filter(function (file) { return file !== '.DS_Store'; })));
  });
}

io.on('connection', function (socket) {
  emitFiles();
});

watch('public/media/', function (e, name) {
  emitFiles();
});

http.listen(8080, function () {
  console.log('Listening on port 8080');
});
