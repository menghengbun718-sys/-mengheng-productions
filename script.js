document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('productGrid');
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterButton = document.getElementById('filterButton');
  const filterMenu = document.getElementById('filterMenu');

  let activeFilter = 'all';

  // --- Filter dropdown open/close ---
  filterButton.addEventListener('click', () => {
    const isOpen = filterMenu.classList.toggle('open');
    filterButton.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!filterButton.contains(e.target) && !filterMenu.contains(e.target)) {
      filterMenu.classList.remove('open');
      filterButton.setAttribute('aria-expanded', 'false');
    }
  });

  filterMenu.querySelectorAll('button[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      filterMenu.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      filterButton.firstChild.textContent = btn.textContent.trim() + ' ';
      filterMenu.classList.remove('open');
      filterButton.setAttribute('aria-expanded', 'false');
      applyFilters();
    });
  });

  // --- Search ---
  searchInput.addEventListener('input', applyFilters);

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesCategory = activeFilter === 'all' || (card.dataset.category || '').toLowerCase() === activeFilter.toLowerCase();
      const matchesSearch = !query || (card.dataset.search || '').toLowerCase().includes(query);
      const visible = matchesCategory && matchesSearch;
      card.hidden = !visible;
      if (visible) visibleCount++;
    });

    emptyState.hidden = visibleCount !== 0;
  }

  // --- Downloads ---
  // Real files use plain <a href="..." download> links and need no JS.
  // This only handles leftover placeholder <button> cards with data-content.
  grid.querySelectorAll('button.download-button[data-content]').forEach((button) => {
    button.addEventListener('click', () => {
      const fileName = button.dataset.file || 'mengheng-download.txt';
      const content = (button.dataset.content || '').replace(/\\n/g, '\n');

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const originalLabel = button.innerHTML;
      button.classList.add('done');
      button.innerHTML = 'Downloaded <span>&#10003;</span>';
      setTimeout(() => {
        button.classList.remove('done');
        button.innerHTML = originalLabel;
      }, 1800);
    });
  });

  // --- Requirements modal for real-file download links ---
  const specsOverlay = document.getElementById('specsOverlay');
  const specsTitle = document.getElementById('specsModalTitle');
  const specsLine = document.getElementById('specsModalSpecs');
  const specsConfirm = document.getElementById('specsConfirm');
  const specsClose = document.getElementById('specsClose');

  function closeSpecs() {
    specsOverlay.classList.remove('open');
  }

  grid.querySelectorAll('a.download-button[data-specs]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      specsTitle.textContent = link.dataset.name || 'This product';
      if (link.dataset.specsList) {
        specsLine.innerHTML = `<ul class="specs-list">${link.dataset.specsList.split('|').map((spec) => `<li>${spec}</li>`).join('')}</ul>`;
      } else {
        specsLine.textContent = link.dataset.specs || '';
      }
      specsConfirm.href = link.getAttribute('href');
      specsConfirm.setAttribute('download', link.getAttribute('download') || '');
      specsOverlay.classList.add('open');
    });
  });

  specsConfirm.addEventListener('click', () => {
    // Let the native download proceed, then close the modal shortly after.
    setTimeout(closeSpecs, 200);
  });
  specsClose.addEventListener('click', closeSpecs);
  specsOverlay.addEventListener('click', (e) => {
    if (e.target === specsOverlay) closeSpecs();
  });
});