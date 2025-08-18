// Full category data for SearchHub
export const searchCategories = {
  file_search: {
    name: 'File Search', icon: 'folder-open-outline',
    description: "Find specific filetypes in open directories.",
    placeholder: "e.g., daft punk",
    baseQuery: 'intitle:"index of" "last modified" "parent directory"',
    optionsType: 'radio',
    options: [
      { label: "Music", value: "music", checked: true, placeholder: "e.g., daft punk", subOptions: [ {label: ".mp3", value: ".mp3", checked: true}, {label: ".flac", value: ".flac", checked: true}, {label: ".m4a", value: ".m4a"}, {label: ".wav", value: ".wav"}, {label: ".opus", value: ".opus"} ] },
      { label: "Books", value: "books", placeholder: "e.g., nineteen eighty-four", subOptions: [ {label: ".pdf", value: ".pdf", checked: true}, {label: ".epub", value: ".epub", checked: true}, {label: ".doc", value: ".doc"}, {label: ".djvu", value: ".djvu"}, {label: ".mobi", value: ".mobi"} ] },
      { label: "Video", value: "video", placeholder: "e.g., the matrix", subOptions: [ {label: ".mkv", value: ".mkv", checked: true}, {label: ".mp4", value: ".mp4", checked: true}, {label: ".avi", value: ".avi"}, {label: ".mov", value: ".mov"}, {label: ".webm", value: ".webm"} ] },
      { label: "Apps", value: "apps", placeholder: "e.g., photoshop", subOptions: [ {label: ".exe", value: ".exe", checked: true}, {label: ".apk", value: ".apk"}, {label: ".dmg", value: ".dmg"} ] },
      { label: "Archives", value: "archives", placeholder: "e.g., project files", subOptions: [ {label: ".zip", value: ".zip", checked: true}, {label: ".rar", value: ".rar", checked: true}, {label: ".7z", value: ".7z"}, {label: ".tar.gz", value: ".tar.gz"}, {label: ".iso", value: ".iso"}, {label: ".bin", value: ".bin"}, {label: ".cue", value: ".cue"} ] }
    ]
  },
  social: {
    name: 'Social', icon: 'people-outline',
    description: "Search for profiles and content on social media.", placeholder: "e.g., john doe", baseQuery: '', optionsType: 'radio',
    options: [
      { label: "Reddit", value: "site:reddit.com", checked: true, description: "Find discussions, communities, and user comments.", placeholder: "e.g., elon musk" },
      { label: "LinkedIn", value: "site:linkedin.com/in/", description: "Search for professional profiles.", placeholder: "e.g., software engineer" },
      { label: "Facebook", value: "site:facebook.com", description: "Find public profiles, pages, and groups.", placeholder: "e.g., jane smith photographer" },
      { label: "Instagram", value: "site:instagram.com", description: "Search for public profiles and posts.", placeholder: "e.g., national geographic" },
      { label: "TikTok", value: "site:tiktok.com", description: "Find user profiles and video content.", placeholder: "e.g., gordon ramsay" },
      { label: "Telegram", value: "site:t.me", description: "Discover public channels and groups.", placeholder: "e.g., tech news" }
    ]
  },
  code: { name: 'Code Repos', icon: 'code-slash-outline', description: "Search for code across major repositories.", placeholder: "e.g., user authentication", baseQuery: 'site:github.com | site:gitlab.com | site:bitbucket.org', options: [] },
  snippets: {
    name: 'Code Snippets', icon: 'document-text-outline', description: "Search for code snippets, notes, and leaked credentials.", placeholder: "e.g., database password", baseQuery: '', optionsType: 'radio', aiSuggest: true,
    options: [
      { label: "GitHub Gists", value: "site:gist.github.com", checked: true, description: "Find public code snippets and notes on GitHub Gist.", placeholder: "e.g., aws secret key" },
      { label: "Pastebin", value: "site:pastebin.com", description: "Search for leaked credentials and other sensitive text.", placeholder: "e.g., password dump" }
    ]
  },
  intelligence: {
    name: 'Intelligence', icon: 'earth-outline', description: "Perform advanced OSINT and reconnaissance searches.", placeholder: "e.g., example.com", baseQuery: '', optionsType: 'radio', aiSuggest: true,
    options: [
      { label: "Find Subdomains", value: "site:*.", isDomainTarget: true, checked: true, description: "Enter a domain (e.g., example.com) to find its subdomains.", placeholder: "e.g., google.com" },
      { label: "Wayback Machine", value: "wayback", isCustomHandler: true, description: "View historical snapshots of a website.", placeholder: "e.g., example.com" },
      { label: "Gov Docs", value: "site:.gov filetype:pdf", description: "Finds PDF documents on government websites.", placeholder: "e.g., nasa budget" },
      { label: "Edu Docs", value: "site:.edu filetype:pdf", description: "Finds PDF documents on educational websites.", placeholder: "e.g., harvard ai research" }
    ]
  },
  network_devices: { name: 'Network Devices', icon: 'hardware-chip-outline', description: 'Find publicly accessible network devices like cameras, routers, and printers.', placeholder: 'e.g., city name', baseQuery: '', optionsType: 'radio', isSafe: false,
    options: [
      { label: "Webcams", value: 'inurl:view/view.shtml | intitle:"Live View / - AXIS"', checked: true, description: "Searches for publicly accessible security camera feeds.", placeholder: "e.g., new york" },
      { label: "Routers", value: 'intitle:"router configuration"', description: "Finds web interfaces for routers.", placeholder: "e.g., Linksys" },
      { label: "Printers", value: 'intitle:"printer status" inurl:hp/device/', description: "Finds web interfaces for network printers.", placeholder: "e.g., HP LaserJet" }
    ]
  },
  vulnerabilities: { name: 'Vulnerabilities', icon: 'bug-outline', description: "Find common software vulnerabilities and error messages. Use responsibly.", placeholder: "e.g., site:example.com", baseQuery: '', isSafe: false, optionsType: 'radio',
    options: [
      { label: "SQL Errors", value: '"SQL syntax near" | "ORA-00921"', checked: true, description: "Finds pages that are displaying raw SQL error messages.", placeholder: 'e.g., "ORA-00921"' },
      { label: "Exposed API Docs", value: 'inurl:/swagger/index.html', description: "Finds publicly exposed Swagger/OpenAPI documentation for APIs.", placeholder: "e.g., internal api" },
      { label: "Public Trello Boards", value: 'site:trello.com "API Key" | "Password"', description: "Searches public Trello boards for leaked credentials.", placeholder: 'e.g., "Project Credentials" site:trello.com' },
      { label: "Nessus Reports", value: '"This file was generated by Nessus"', description: "Finds publicly accessible vulnerability scan reports.", placeholder: "e.g., company name" }
    ]
  },
  config_files: { name: 'Config Files', icon: 'settings-outline', description: "Find exposed configuration files and credentials. Use responsibly.", placeholder: "e.g., site:github.com", baseQuery: '', isSafe: false, optionsType: 'radio',
    options: [
      { label: "Exposed .env Files", value: 'filename:.env "DB_PASSWORD" | "API_KEY"', checked: true, description: "Finds environment configuration files which often contain credentials.", placeholder: 'e.g., filename:.env "MAIL_PASSWORD"' },
      { label: "Exposed AWS Credentials", value: 'inurl:".aws/credentials"', description: "Searches for publicly exposed Amazon Web Services credential files.", placeholder: 'e.g., "aws_access_key_id"' },
      { label: "Exposed SSH Keys", value: 'inurl:id_rsa -intext:pub', description: "Finds private SSH keys, which should never be public.", placeholder: 'e.g., "BEGIN RSA PRIVATE KEY" filetype:key' },
      { label: "cPanel Configs", value: 'inurl:"/idx_config" "cpanel"', description: "Finds exposed cPanel configuration files.", placeholder: "e.g., site:example.com" },
      { label: "Bash History", value: 'intitle:"Index of" .bash_history', description: "Finds publicly accessible bash command history files.", placeholder: 'e.g., filetype:bash_history "pass"' }
    ]
  },
  exposed_services: { name: 'Exposed Services', icon: 'server-outline', description: "Find publicly accessible services and admin panels. Use responsibly.", placeholder: "e.g., company name", baseQuery: '', isSafe: false, optionsType: 'radio',
    options: [
      { label: "Jenkins Panels", value: 'intitle:"Dashboard [Jenkins]"', checked: true, description: "Finds unsecured Jenkins CI/CD dashboards.", placeholder: "e.g., jenkins" },
      { label: "phpMyAdmin", value: 'inurl:/phpmyadmin/', description: "Finds phpMyAdmin database administration panels.", placeholder: "e.g., inurl:/phpmyadmin/setup/" },
      { label: "Remote Desktop", value: 'intitle:"Remote Desktop Web Connection"', description: "Finds exposed RDP web connection portals.", placeholder: "e.g., company name" },
      { label: "Apache Test Pages", value: 'intitle:"Test Page for Apache"', description: "Finds default Apache server installation pages.", placeholder: 'e.g., intitle:"Apache HTTP Server Test Page"' },
      { label: "Server Stats", value: 'intitle:"Usage Statistics for"', description: "Finds exposed server statistics pages (e.g., AWStats).", placeholder: 'e.g., intitle:"Usage Statistics for" "Generated by Webalizer"' }
    ]
  },
  sensitive_files: { name: 'Sensitive Files', icon: 'document-lock-outline', description: "Find backups, logs, and other potentially sensitive documents. Use responsibly.", placeholder: "e.g., site:example.com", baseQuery: '', isSafe: false, optionsType: 'radio',
    options: [
      { label: "Backup Dumps", value: '"Index of /backup" | "Index of /backups"', checked: true, description: "Finds directories that may contain sensitive backup files.", placeholder: 'e.g., "Index of /backup" "db.sql"' },
      { label: "Access Logs", value: 'intitle:"Index of" access_log', description: "Finds access logs which may store sensitive information.", placeholder: 'e.g., filetype:log "access.log"' },
      { label: "Confidential Docs", value: '"not for distribution" confidential filetype:pdf', description: "Finds PDF documents marked as confidential.", placeholder: 'e.g., "top secret" filetype:pdf' },
      { label: "Financial Spreadsheets", value: 'intitle:"Index of" finance.xls', description: "Finds spreadsheets that may contain financial data.", placeholder: 'e.g., "finance" filetype:xls inurl:private' },
      { label: "Password Lists", value: 'inurl:passlist.txt | filetype:xls username password', description: "Finds files that may contain lists of user credentials.", placeholder: 'e.g., filetype:sql "pass" "user"' },
      { label: "Source Code Backups", value: 'intitle:"Index of" *.php.bak | *.html.bak', description: "Finds backup copies of source code files.", placeholder: 'e.g., "index.php.bak"' }
    ]
  }
};

export function renderCategories(state, dom, icons, renderOptions, buildQueryString, renderPreview, checkSearchButtonState) {
  if (!dom.categoryContainer) return;
  dom.categoryContainer.innerHTML = '';
  Object.entries(searchCategories).forEach(([key, category]) => {
    if (state.isSafeMode && category.isSafe === false) return;
    const card = document.createElement('button');
    const isActive = key === state.activeCategory;
    card.className = 'category-btn w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors duration-200 ease-in-out ' + (isActive ? 'active bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700');
    card.dataset.key = key;
    card.setAttribute('role', 'tab');
    card.setAttribute('aria-selected', isActive);
    card.innerHTML = `<span class="font-medium">${category.name}</span>`;
    card.addEventListener('click', () => {
      state.activeCategory = key;
      renderCategories(state, dom, icons, renderOptions, buildQueryString, renderPreview, checkSearchButtonState);
      renderOptions(key, state, dom, buildQueryString, renderPreview, checkSearchButtonState);
      renderPreview(state, dom, buildQueryString);
      checkSearchButtonState();
    });
    dom.categoryContainer.appendChild(card);
  });
}
