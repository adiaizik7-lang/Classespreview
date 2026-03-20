
const searchInput = document.getElementById('searchInput');
const visibleCount = document.getElementById('visibleCount');
const modal = document.getElementById('setupModal');
const modalTitle = document.getElementById('modalTitle');
const setupText = document.getElementById('setupText');
const closeModal = document.getElementById('closeModal');
const clearTextBtn = document.getElementById('clearTextBtn');
const downloadTextBtn = document.getElementById('downloadTextBtn');
const saveSetupBtn = document.getElementById('saveSetupBtn');
const setupImagesInput = document.getElementById('setupImages');
const setupImagesPreview = document.getElementById('setupImagesPreview');
const classCards = [...document.querySelectorAll('.class-card')];
const setupButtons = [...document.querySelectorAll('.setup-btn')];

let currentClass = '';
let currentImages = [];

function storageKey(className) {
  return `violetbot-setup::${className}`;
}

function readStoredSetup(className) {
  try {
    const raw = localStorage.getItem(storageKey(className));
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function writeStoredSetup(className, payload) {
  localStorage.setItem(storageKey(className), JSON.stringify(payload));
}

function defaultText(className) {
  return window.CLASS_SETUP_TEMPLATES[className] || `${className}\n\n`;
}

function updateCount() {
  visibleCount.textContent = classCards.filter(card => !card.classList.contains('hidden')).length;
}

function renderImagePreviews() {
  setupImagesPreview.innerHTML = '';
  if (!currentImages.length) return;

  currentImages.forEach((item, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'setup-image-item';

    const img = document.createElement('img');
    img.src = item.dataUrl;
    img.alt = item.name || `setup image ${index + 1}`;

    const actions = document.createElement('div');
    actions.className = 'setup-image-actions';

    const name = document.createElement('div');
    name.className = 'setup-image-name';
    name.textContent = item.name || `image-${index + 1}`;

    const remove = document.createElement('button');
    remove.className = 'remove-image-btn';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      currentImages.splice(index, 1);
      renderImagePreviews();
    });

    actions.append(name, remove);
    wrap.append(img, actions);
    setupImagesPreview.append(wrap);
  });
}

function openSetupModal(className) {
  currentClass = className;
  modalTitle.textContent = `${className} Skill Setup`;

  const stored = readStoredSetup(className);
  setupText.value = stored?.text ?? defaultText(className);
  currentImages = Array.isArray(stored?.images) ? stored.images : [];
  setupImagesInput.value = '';
  renderImagePreviews();
  modal.showModal();
}

function saveCurrentSetup() {
  if (!currentClass) return;
  writeStoredSetup(currentClass, {
    text: setupText.value,
    images: currentImages
  });
}

searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  classCards.forEach(card => {
    const name = card.dataset.class;
    card.classList.toggle('hidden', !name.includes(q));
  });
  updateCount();
});

setupButtons.forEach(btn => {
  btn.addEventListener('click', () => openSetupModal(btn.dataset.class));
});

closeModal.addEventListener('click', () => modal.close());

clearTextBtn.addEventListener('click', () => {
  setupText.value = '';
  currentImages = [];
  setupImagesInput.value = '';
  renderImagePreviews();
  setupText.focus();
});

saveSetupBtn.addEventListener('click', () => {
  saveCurrentSetup();
  saveSetupBtn.textContent = 'Saved';
  setTimeout(() => {
    saveSetupBtn.textContent = 'Save';
  }, 1200);
});

downloadTextBtn.addEventListener('click', () => {
  const blob = new Blob([setupText.value], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const safeName = (currentClass || 'skill-setup').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  a.download = `${safeName}-skill-setup.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
});

setupImagesInput.addEventListener('change', async (e) => {
  const files = [...(e.target.files || [])];
  for (const file of files) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    currentImages.push({
      name: file.name,
      dataUrl
    });
  }
  renderImagePreviews();
  setupImagesInput.value = '';
});

modal.addEventListener('click', (e) => {
  const rect = modal.getBoundingClientRect();
  const inside = (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  );
  if (!inside) modal.close();
});

modal.addEventListener('close', () => {
  saveCurrentSetup();
});

updateCount();
