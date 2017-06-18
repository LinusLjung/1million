let actions = [];
let clients = [];
let socket;

function connectSocket({ host, name }) {
  socket && socket.disconnect();

  socket = io(`${host}:8080`);

  socket.on('clients', data => (clients = JSON.parse(data), render()));
  socket.on('sendToScreen', data => renderScreen(JSON.parse(data), 'screen'));

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

    if (screen === 'delete') {
      actions.splice(index, 1);
      saveActions();
      render();
    }

    screen === 'view' && socket.emit('sendToScreen', JSON.stringify({
      clients: (function() {
        const checkboxes = document.querySelector('#clients').querySelectorAll('input');
        const _clients = [];

        for (let i = 0; i < checkboxes.length; i++) {
          checkboxes[i].checked && _clients.push(clients[i].id);
        }

        return _clients;
      })(),
      media: actions[index]
    }));

    screen === 'preview' && renderScreen(actions[index], screen);
  }
}

function renderScreen(action, screen) {
  document.querySelector(screen === 'preview' ? '#preview' : '#screen').innerHTML = action.type === 'image' ? `
    <img src="${action.url}" />
  ` : `
  <video autoplay loop muted>
    <source src="${action.url}" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  `;

  localStorage.setItem(screen, JSON.stringify(action));
}

function saveActions() {
  localStorage.setItem('actions', JSON.stringify(actions));
}

function init() {
  document.querySelector('#button-fullscreen').addEventListener('click', goFullscreen, false);
  document.querySelector('#action-form').addEventListener('submit', handleActionSubmit, false);
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

function renderActions() {
  return actions.reduce(function (accumulated, current, index) {
    return accumulated + `
      <div class="action" data-index="${index}">
        <span>${current.name} (${current.type}) - </span>
        <span data-action="preview">Preview</span>
        <span data-action="delete">Delete</span>

        <div id="clients">
          ${clients
            .reduce((accumulated, current, i) => accumulated += `
              <div>
                <input type="checkbox" id="client-${index}-${i}" value="${current.id}"/>
                <label for="client-${index}-${i}">${current.name}</label>
              </div>
            `, '')
          }
        </div>
        <span data-action="view">Send to screen</span>
      </div>
    `;
  }, '');
}

function render() {
  document.querySelector('#actions').innerHTML = renderActions();
}

init();
