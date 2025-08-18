// Options panel logic
export function renderOptions(key, state, dom, buildQueryString, renderPreview, checkSearchButtonState) {

  const category = state.categories[key];
  // Hide options for unsafe categories in Safe Mode
  if (!category) {
    console.error('Category not found:', key);
    return;
  }
  if (state.isSafeMode && category.isSafe === false) {
    dom.optionsTitle.textContent = `2. Options for ${category.name}`;
    dom.optionsDescription.textContent = category.description;
    dom.optionsContainer.innerHTML = `
      <div class="flex items-center gap-2 text-yellow-400 text-xs">
        <span class="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
        <span>Category hidden by Safe Mode</span>
      </div>
      <p class="mt-2 text-yellow-400">This category is hidden in Safe Mode for your protection.</p>
    `;
    return;
  }
  dom.optionsTitle.textContent = `2. Options for ${category.name}`;
  dom.optionsDescription.textContent = category.description;
  dom.searchQuery.placeholder = category.placeholder || 'Enter your search query...';
  dom.optionsContainer.innerHTML = '';

  if (!category.options || category.options.length === 0) {
    dom.optionsContainer.innerHTML = '<p class="text-gray-500">No specific options. Just type your query and search.</p>';
    return;
  }

  // Special handling for file_search with subOptions
  if (key === 'file_search') {
    // Render main file type options (Music, Books, etc.)
    const subCategoryContainer = document.createElement('div');
    subCategoryContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4';
    category.options.forEach((subCat, idx) => {
      const subCatId = `subcat_${key}_${idx}`; // Use index for safe ID
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.id = subCatId;
      radio.name = 'file_search_type';
      radio.value = subCat.value;
      radio.checked = !!subCat.checked;
      radio.className = 'hidden';
      radio.addEventListener('change', () => {
        // Update all radio buttons and their labels by index
        category.options.forEach((opt, i) => {
          const otherRadio = document.getElementById(`subcat_${key}_${i}`);
          const otherLabel = document.querySelector(`label[for="subcat_${key}_${i}"]`);
          if (otherRadio && otherLabel) {
            opt.checked = (i === idx);
            if (opt.checked) {
              otherLabel.classList.add('active', 'bg-blue-600', 'text-white');
            } else {
              otherLabel.classList.remove('active', 'bg-blue-600', 'text-white');
            }
          }
        });
        dom.searchQuery.placeholder = subCat.placeholder || category.placeholder;
        renderOptions(key, state, dom, buildQueryString, renderPreview, checkSearchButtonState);
        renderPreview(state, dom, buildQueryString);
      });
      const label = document.createElement('label');
      label.htmlFor = subCatId;
      label.className = 'option-btn cursor-pointer block w-full text-center p-3 border-2 border-gray-600 rounded-md text-sm font-medium' + (subCat.checked ? ' active bg-blue-600 text-white' : '');
      label.textContent = subCat.label;
      label.tabIndex = 0;
      subCategoryContainer.appendChild(radio);
      subCategoryContainer.appendChild(label);
    });
    dom.optionsContainer.appendChild(subCategoryContainer);

    // Render subOptions for the selected file type
    const selectedSubCat = category.options.find(opt => opt.checked) || category.options[0];
    if (selectedSubCat && selectedSubCat.subOptions) {
      if (selectedSubCat.subOptions.length > 0) {
        const subOptionsContainer = document.createElement('div');
        subOptionsContainer.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 border-t border-gray-700 pt-4 mt-4';
        selectedSubCat.subOptions.forEach((option, idx) => {
          const optionId = `sub_option_${key}_${selectedSubCat.label.replace(/\s+/g, '_')}_${idx}`; // Use safe ID
          const div = document.createElement('div');
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.id = optionId;
          input.name = 'file_search_suboption';
          input.value = option.value;
          input.checked = !!option.checked;
          input.className = 'hidden';
          const label = document.createElement('label');
          label.htmlFor = optionId;
          label.className = 'option-btn cursor-pointer block w-full text-center p-3 border-2 border-gray-600 rounded-md text-sm font-medium' + (option.checked ? ' active bg-blue-600 text-white' : '');
          label.textContent = option.label;
          label.tabIndex = 0;
          input.addEventListener('change', () => {
            option.checked = input.checked;
            if (input.checked) {
              label.classList.add('active', 'bg-blue-600', 'text-white');
            } else {
              label.classList.remove('active', 'bg-blue-600', 'text-white');
            }
            renderPreview(state, dom, buildQueryString);
          });
          div.appendChild(input);
          div.appendChild(label);
          subOptionsContainer.appendChild(div);
        });
        dom.optionsContainer.appendChild(subOptionsContainer);
      }
    }
    checkSearchButtonState && checkSearchButtonState();
    return;
  }

  // Default: render options as radio or checkbox
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2';

  category.options.forEach((option, idx) => {
    const optionId = `${key}_option_${idx}`; // Use index for safe ID
    const div = document.createElement('div');
    const input = document.createElement('input');
    input.type = category.optionsType || 'radio';
    input.id = optionId;
    input.name = key;
    input.value = option.value;
    input.checked = !!option.checked;
    input.className = 'hidden';

    const label = document.createElement('label');
    label.htmlFor = optionId;
    label.className = 'option-btn cursor-pointer block w-full text-center p-3 border-2 border-gray-600 rounded-md text-sm font-medium' + 
      (option.checked ? ' active bg-blue-600 text-white' : '');
    label.textContent = option.label;
    label.tabIndex = 0;

    // Tooltip for option description
    if (option.description) {
      const tooltip = document.createElement('span');
      tooltip.className = 'option-tooltip hidden absolute left-1/2 z-10 -translate-x-1/2 mt-2 px-3 py-2 rounded bg-gray-900 text-xs text-gray-100 shadow-lg border border-gray-700';
      tooltip.textContent = option.description;
      label.style.position = 'relative';
      label.appendChild(tooltip);
      label.addEventListener('mouseenter', () => { tooltip.classList.remove('hidden'); });
      label.addEventListener('mouseleave', () => { tooltip.classList.add('hidden'); });
      label.addEventListener('focus', () => { tooltip.classList.remove('hidden'); });
      label.addEventListener('blur', () => { tooltip.classList.add('hidden'); });
    }

    // Add warning for DuckDuckGo PDF search limitation
    if ((option.label === 'Gov Docs' || option.label === 'Edu Docs')) {
      const warn = document.createElement('div');
      warn.className = 'text-xs text-yellow-400 mt-1';
      warn.textContent = 'Note: DuckDuckGo may not fully support filetype:pdf. Results may be limited.';
      div.appendChild(warn);
    }

    input.addEventListener('change', () => {
      if (input.type === 'radio') {
        // For radio buttons, first update all options and labels by index
        category.options.forEach((opt, i) => {
          const otherInput = document.getElementById(`${key}_option_${i}`);
          const otherLabel = document.querySelector(`label[for="${key}_option_${i}"]`);
          if (otherInput && otherLabel) {
            opt.checked = otherInput === input;
            if (opt.checked) {
              otherLabel.classList.add('active', 'bg-blue-600', 'text-white');
            } else {
              otherLabel.classList.remove('active', 'bg-blue-600', 'text-white');
            }
          }
        });
      } else {
        // For checkboxes, just toggle this option
        option.checked = input.checked;
        if (input.checked) {
          label.classList.add('active', 'bg-blue-600', 'text-white');
        } else {
          label.classList.remove('active', 'bg-blue-600', 'text-white');
        }
      }
      dom.searchQuery.placeholder = option.placeholder || category.placeholder || '';
      renderPreview(state, dom, buildQueryString);
    });

    div.appendChild(input);
    div.appendChild(label);
    optionsContainer.appendChild(div);
  });

  dom.optionsContainer.appendChild(optionsContainer);
  checkSearchButtonState && checkSearchButtonState();
}
