let files = [];
let socket;

function connectSocket({ host, name }) {
  socket && socket.disconnect();

  socket = io(`${host}:8080`);

  socket.on('files', data => (files = JSON.parse(data), render()));

  socket.emit('identify', name);
}

function goFullscreen() {
  document.documentElement.webkitRequestFullscreen();
}

function handleActionSubmit(e) {
  e.preventDefault();

  actions.push({
    name: e.target.name.value,
    url: e.target.url.value,
    type: e.target.type.value
  });

  e.target.reset();

  saveActions();

  render();
}

function handleSocketSubmit(e) {
  const _socket = {
    name: e.target.name.value,
    host: e.target.host.value
  };

  e.preventDefault();

  connectSocket(_socket);

  localStorage.setItem('socket', JSON.stringify(_socket));

  e.target.reset();
}

function handleActionsClick(e) {
  if (e.target.hasAttribute('data-action')) {
    const screen = e.target.getAttribute('data-action');
    const index = Number(e.target.parentNode.getAttribute('data-index'));

    renderScreen(files[index], screen);
  }
}

function saveActions() {
  localStorage.setItem('actions', JSON.stringify(actions));
}

function init() {
  document.querySelector('#button-fullscreen').addEventListener('click', goFullscreen, false);
  document.querySelector('#socket-form').addEventListener('submit', handleSocketSubmit, false);
  document.querySelector('#actions').addEventListener('click', handleActionsClick, false);

  let _actions = localStorage.getItem('actions');

  if (!_actions) {
    localStorage.setItem('actions', (_actions = JSON.stringify([])));
  }

  actions = JSON.parse(_actions);

  ['preview', 'view'].forEach(function (screen) {
    let action = localStorage.getItem(screen);

    action && renderScreen(JSON.parse(action), screen);
  });

  const socket = localStorage.getItem('socket');

  socket && connectSocket(JSON.parse(socket));

  render();
}

function renderScreen(action, screen) {
  const type = action.match(/\.mp4$/) ? 'video' : 'image';

  document.querySelector(screen === 'preview' ? '#preview' : '#screen').innerHTML = type === 'image' ? `
    <img src="media/${action}" />
  ` : `
  <video autoplay loop muted>
    <source src="media/${action}" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  `;

  localStorage.setItem(screen, JSON.stringify(action));
}

function renderActions() {
  return files.reduce(function (accumulated, current, index) {
    return accumulated + `
      <div class="action" data-index="${index}">
        <span>${current}</span>
        <span class="button" data-action="preview">Preview</span>
        <span class="button" data-action="view">Send to screen</span>
      </div>
    `;
  }, '');
}

function render() {
  document.querySelector('#actions').innerHTML = renderActions();
}

init();
