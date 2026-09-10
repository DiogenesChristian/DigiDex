
const API = 'https://digi-api.com/api/v1/digimon';

const form = document.querySelector('#search-form');
const search = document.querySelector('#search');
const level = document.querySelector('#level');
const grid = document.querySelector('#digimon-grid');
const status = document.querySelector('#status');
const count = document.querySelector('#result-count');
const loadMore = document.querySelector('#load-more');
const dialog = document.querySelector('#details-dialog');
const dialogContent = document.querySelector('#dialog-content');
const locationButton = document.querySelector('#location-button');
const locationStatus = document.querySelector('#location-status');
const installButton = document.querySelector('#install-button');

let page = 0;
let hasNext = false;
let activeController;
let deferredInstallPrompt = null;

function escapeHtml(value = '') {
  const el = document.createElement('span');
  el.textContent = value;
  return el.innerHTML;
}

function getLevel(digimon) {
  return digimon.levels?.[0]?.level || 'Não informado';
}

function getImage(digimon) {
  return digimon.images?.[0]?.href || digimon.image || '';
}

function setStatus(message = '', isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function renderCards(digimons, append = false) {
  if (!append) grid.replaceChildren();

  const fragment = document.createDocumentFragment();

  digimons.forEach((digimon) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.id = digimon.id;
    card.setAttribute('aria-label', `Ver detalhes de ${digimon.name}`);

    const image = getImage(digimon);
    card.innerHTML = `
      <div class="card-image">
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(digimon.name)}" loading="lazy">` : ''}
      </div>
      <div class="card-info">
        <div class="card-meta">
          <span>#${String(digimon.id).padStart(3, '0')}</span>
          <span class="tag">${escapeHtml(getLevel(digimon))}</span>
        </div>
        <h3>${escapeHtml(digimon.name)}</h3>
      </div>`;
    fragment.append(card);
  });

  grid.append(fragment);
}

async function loadDigimons({ next = false } = {}) {
  if (activeController) activeController.abort();
  activeController = new AbortController();

  if (!next) page = 0;

  const params = new URLSearchParams({
    page: String(page),
    pageSize: '12'
  });

  if (search.value.trim()) params.set('name', search.value.trim());
  if (level.value) params.set('level', level.value);

  setStatus('Consultando o Mundo Digital...');
  loadMore.hidden = true;

  try {
    const response = await fetch(`${API}?${params}`, {
      signal: activeController.signal
    });

    if (!response.ok) throw new Error('A API não respondeu como esperado.');

    const data = await response.json();
    const items = data.content || [];

    renderCards(items, next);
    hasNext = Boolean(data.pageable?.nextPage);
    loadMore.hidden = !hasNext;

    const total = data.pageable?.totalElements;
    count.textContent = total
      ? `${total} registro${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`
      : `${items.length} registros exibidos`;

    setStatus(items.length ? '' : 'Nenhum Digimon encontrado. Tente outro termo ou nível.');
  } catch (error) {
    if (error.name === 'AbortError') return;

    grid.replaceChildren();
    count.textContent = 'Busca indisponível';
    setStatus('Não foi possível conectar à Digi-API agora. Verifique sua conexão e tente novamente.', true);
  } finally {
    activeController = null;
  }
}

async function openDetails(id) {
  dialogContent.innerHTML = '<div class="detail-text"><p class="eyebrow">CARREGANDO</p><h2 id="dialog-title">Buscando dados...</h2></div>';
  dialog.showModal();

  try {
    const response = await fetch(`${API}/${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error();

    const d = await response.json();
    const image = getImage(d);

    const fields = [
      ['Nível', d.levels?.map(x => x.level).join(', ')],
      ['Atributo', d.attributes?.map(x => x.attribute).join(', ')],
      ['Tipo', d.types?.map(x => x.type).join(', ')],
      ['Campo', d.fields?.map(x => x.field).join(', ')],
      ['X-Antibody', d.xAntibody ? 'Sim' : 'Não']
    ].filter(([, value]) => value);

    dialogContent.innerHTML = `
      <div class="detail-layout">
        <div class="detail-image">
          ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(d.name)}">` : ''}
        </div>
        <div class="detail-text">
          <p class="eyebrow">REGISTRO #${String(d.id).padStart(3, '0')}</p>
          <h2 id="dialog-title">${escapeHtml(d.name)}</h2>
          <dl class="data-list">
            ${fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}
          </dl>
        </div>
      </div>`;
  } catch {
    dialogContent.innerHTML = '<div class="detail-text"><p class="eyebrow">ERRO</p><h2 id="dialog-title">Registro indisponível</h2><p>Tente abrir este Digimon novamente em alguns instantes.</p></div>';
  }
}

function useGeolocation() {
  if (!navigator.geolocation) {
    locationStatus.textContent = 'Seu navegador não oferece geolocalização.';
    return;
  }

  locationButton.disabled = true;
  locationButton.textContent = 'Obtendo localização...';
  locationStatus.textContent = 'Solicitando permissão ao dispositivo...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      locationStatus.innerHTML =
        `Latitude: <strong>${latitude.toFixed(5)}</strong><br>` +
        `Longitude: <strong>${longitude.toFixed(5)}</strong><br>` +
        `Precisão aproximada: <strong>${Math.round(accuracy)} m</strong>`;

      locationButton.disabled = false;
      locationButton.textContent = '📍 Atualizar localização';
    },
    (error) => {
      const messages = {
        1: 'Permissão negada. Autorize a localização e tente novamente.',
        2: 'Não foi possível determinar sua localização.',
        3: 'A solicitação demorou demais. Tente novamente.'
      };

      locationStatus.textContent = messages[error.code] || 'Erro ao obter localização.';
      locationButton.disabled = false;
      locationButton.textContent = '📍 Tentar novamente';
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  console.log(deferredInstallPrompt)
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

window.addEventListener('appinstalled', () => {
  installButton.hidden = true;
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  loadDigimons();
});

level.addEventListener('change', () => loadDigimons());

loadMore.addEventListener('click', () => {
  page += 1;
  loadDigimons({ next: true });
});

grid.addEventListener('click', (event) => {
  const card = event.target.closest('.card');
  if (card) openDetails(card.dataset.id);
});

document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());

dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

locationButton.addEventListener('click', useGeolocation);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.error('Falha ao registrar Service Worker:', error);
    });
  });
}

loadDigimons();
