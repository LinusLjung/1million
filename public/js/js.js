var actions = [];

function goFullscreen() {
  document.documentElement.webkitRequestFullscreen();
}

function handleSubmit(e) {
  e.preventDefault();

  actions.push({
    name: e.target.name.value,
    url: e.target.url.value,
    type: e.target.type.value
  });

  e.target.name.value = '';
  e.target.url.value = '';

  saveActions();

  render();
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

    renderScreen(actions[index], screen);

    localStorage.setItem(screen, JSON.stringify(actions[index]));
  }
}

function renderScreen(action, screen) {
  if (action.type === 'image') {
    document.querySelector(screen === 'preview' ? '#preview' : '#screen').innerHTML = `
      <img src="${action.url}" />
    `;
  }
}

function saveActions() {
  localStorage.setItem('actions', JSON.stringify(actions));
}

function init() {
  document.querySelector('#button-fullscreen').addEventListener('click', goFullscreen, false);
  document.querySelector('form').addEventListener('submit', handleSubmit, false);
  document.querySelector('#actions').addEventListener('click', handleActionsClick, false);

  var data = localStorage.getItem('actions');

  if (!data) {
    localStorage.setItem('actions', (data = JSON.stringify([])));
  }

  actions = JSON.parse(data);

  ['preview', 'view'].forEach(function (screen) {
    let action = localStorage.getItem(screen);

    action && renderScreen(JSON.parse(action), screen);
  });

  render();
}

function renderActions() {
  return actions.reduce(function (accumulated, current, index) {
    return accumulated + `
      <div class="action" data-index="${index}">
        <span>${current.name} - </span>
        <span data-action="preview">Preview</span>
        <span data-action="view">View</span>
        <span data-action="delete">Delete</span>
      </div>
    `;
  }, '');
}

function render() {
  document.querySelector('#actions').innerHTML = renderActions();
}

init();
