
const searchInput = document.getElementById('searchInput');
const visibleCount = document.getElementById('visibleCount');
const modal = document.getElementById('setupModal');
const modalTitle = document.getElementById('modalTitle');
const setupText = document.getElementById('setupText');
const closeModal = document.getElementById('closeModal');
const clearTextBtn = document.getElementById('clearTextBtn');
const downloadTextBtn = document.getElementById('downloadTextBtn');
const classCards = [...document.querySelectorAll('.class-card')];
const setupButtons = [...document.querySelectorAll('.setup-btn')];

let currentClass = '';

function updateCount() {
  visibleCount.textContent = classCards.filter(card => !card.classList.contains('hidden')).length;
}

function openSetupModal(className) {
  currentClass = className;
  modalTitle.textContent = `${className} Skill Setup`;
  setupText.value = window.CLASS_SETUP_TEMPLATES[className] || `${className}\n\n`;
  modal.showModal();
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
clearTextBtn.addEventListener('click', () => { setupText.value = ''; setupText.focus(); });

downloadTextBtn.addEventListener('click', () => {
  const blob = new Blob([setupText.value], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const safeName = (currentClass || 'skill-setup').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  a.download = `${safeName}-skill-setup.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
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

updateCount();
