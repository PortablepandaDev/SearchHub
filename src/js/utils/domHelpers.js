// Helper functions for safe DOM manipulation
export function createSvgIcon(path, width = 24, height = 24) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathEl.setAttribute('d', path);
  svg.appendChild(pathEl);
  return svg;
}

export function historyRow(item, index) {
  const row = document.createElement('div');
  row.className = 'bg-gray-800 p-2 rounded-md flex justify-between items-center text-sm';

  const link = document.createElement('a');
  link.href = item.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'truncate hover:text-blue-400 flex-1 mr-2';
  link.title = item.query;
  link.textContent = item.query;

  const btn = document.createElement('button');
  btn.title = 'Add to Favorites';
  btn.dataset.index = index;
  btn.className = 'add-fav-btn icon-btn p-1 rounded-full';
  
  // Star icon
  btn.appendChild(createSvgIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'));

  const right = document.createElement('div');
  right.className = 'flex items-center gap-1';
  
  const when = document.createElement('span');
  when.className = 'text-gray-500 text-xs whitespace-nowrap hidden md:inline';
  when.textContent = ` · ${new Date(item.date).toLocaleString()}`;

  right.append(when, btn);
  row.append(link, right);
  return row;
}

export function favoriteRow(item, index) {
  const row = document.createElement('div');
  row.className = 'bg-gray-800 border-l-4 border-yellow-500 p-2 rounded-md flex justify-between items-center text-sm';

  const link = document.createElement('a');
  link.href = item.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'truncate hover:text-blue-400 flex-1 mr-2';
  link.title = item.query;
  link.textContent = item.query;

  const btn = document.createElement('button');
  btn.title = 'Remove from Favorites';
  btn.dataset.index = index;
  btn.className = 'remove-fav-btn icon-btn p-1 rounded-full';
  
  // X icon
  btn.appendChild(createSvgIcon('M18 6L6 18M6 6l12 12'));

  const right = document.createElement('div');
  right.className = 'flex items-center gap-1';
  
  const when = document.createElement('span');
  when.className = 'text-gray-500 text-xs whitespace-nowrap hidden md:inline';
  when.textContent = ` · ${new Date(item.date).toLocaleString()}`;

  right.append(when, btn);
  row.append(link, right);
  return row;
}

export function templateRow(item, index) {
  const row = document.createElement('div');
  row.className = 'bg-gray-800 p-2 rounded-md flex justify-between items-center text-sm';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'truncate flex-1 mr-2';
  nameSpan.textContent = item.name;

  const btnContainer = document.createElement('div');
  btnContainer.className = 'flex items-center gap-1';

  const loadBtn = document.createElement('button');
  loadBtn.title = 'Load Template';
  loadBtn.dataset.index = index;
  loadBtn.className = 'load-template-btn icon-btn p-1 rounded-full';
  loadBtn.appendChild(createSvgIcon('M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'));

  const deleteBtn = document.createElement('button');
  deleteBtn.title = 'Delete Template';
  deleteBtn.dataset.index = index;
  deleteBtn.className = 'delete-template-btn icon-btn p-1 rounded-full text-red-500';
  deleteBtn.appendChild(createSvgIcon('M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'));

  btnContainer.append(loadBtn, deleteBtn);
  row.append(nameSpan, btnContainer);
  return row;
}
