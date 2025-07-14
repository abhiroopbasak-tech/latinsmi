let data = [];
volume = 1;
page = 1;

async function loadData() {
  const response = await fetch('data/Latinismi.tsv');
  const text = await response.text();

  const lines = text.trim().split(/\r?\n/).filter(line => line.trim() !== '');
  const headers = lines[0].split('\t');
  data = lines.slice(1).map(line => {
    const values = line.split('\t');
    const row = {};
    headers.forEach((h, i) => row[h.trim()] = values[i] ? values[i].trim() : '');
    return row;
  });

  console.log("Parsed data:", data);
  console.log("Headers:", headers);

  populateDropdowns(data);
  renderTable(data, headers);
}

function expandRanges(values) {
  const expanded = new Set();
  values.forEach(value => {
    if (!value) return;
    const parts = value.split(/[-–]/).map(p => p.trim());
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const start = parseInt(parts[0], 10);
      const end = parseInt(parts[1], 10);
      for (let i = start; i <= end; i++) expanded.add(i.toString());
    } else {
      expanded.add(value);
    }
  });
  return Array.from(expanded).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function populateDropdowns(data) {
  const dropdownMap = {
    'volumeSearch': 'Volume',
    'fascicoloSearch': 'Fascicolo',
    'dataSearch': 'Data pubbl.',
    'colStartSearch': 'Nr. col. inizio',
    'colEndSearch': 'Nr. col. fine'
  };

  for (const [elementId, field] of Object.entries(dropdownMap)) {
    const rawValues = data.map(row => row[field]).filter(v => v && v !== '?');
    const values = expandRanges(rawValues);
    const dropdown = document.getElementById(elementId);
    if (dropdown) {
      dropdown.innerHTML = '<option value="">-- Any --</option>' +
        values.map(v => `<option value="${v}">${v}</option>`).join('');
    }
  }

  // Populate Autore1 dropdown only
  const authorDropdown = document.getElementById('autore1Search');
  if (authorDropdown) {
    const authors = Array.from(
      new Set(data.map(row => row['Autore1']).filter(v => v && v !== '?'))
    ).sort();
    authorDropdown.innerHTML = '<option value="">-- Any --</option>' +
      authors.map(v => `<option value="${v}">${v}</option>`).join('');
  }
}


function expandFieldValue(fieldValue) {
  if (!fieldValue) return [];
  const parts = fieldValue.split(/[-–]/).map(p => p.trim());
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);
    return Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());
  }
  return [fieldValue];
}

function matchesDropdownField(rowValue, query) {
  const expanded = expandFieldValue(rowValue);
  return expanded.includes(query);
}

function searchDatabase(queries, fields) {
  const allBlank = Object.values(queries).every(v => !v);
  if (allBlank) return data;

  return data.filter(row => {
    return fields.every(field => {
      const query = queries[field];
      if (!query) return true;

      const value = String(row[field] || '');

      if (['Volume', 'Fascicolo', 'Data pubbl.', 'Nr. col. inizio', 'Nr. col. fine'].includes(field)) {
        return matchesDropdownField(value, query);
      }

      if (['Autore1', 'Autore2', 'Autore3', 'Autore4'].includes(field)) {
        return row[field] === query;
      }

      const phraseMatchPattern = /\"(.*?)\"/g;
      const phrases = [...query.matchAll(phraseMatchPattern)].map(match => match[1]);
      const remainingQuery = query.replace(phraseMatchPattern, '').trim();
      const words = remainingQuery.split(/\s+/).filter(Boolean);

      let matchScore = 0;
      for (const word of words) {
        const regex = new RegExp(word.replace(/\*/g, '.*'), 'i');
        if (regex.test(value)) matchScore += 1;
      }

      for (const phrase of phrases) {
        if (value.toLowerCase().includes(phrase.toLowerCase())) matchScore += 5;
      }

      return matchScore > 0;
    });
  });
}

function renderTable(rows, headers) {
  const container = document.getElementById('results');
  console.log("Rendering rows:", rows.length);

  if (!rows.length) {
    container.innerHTML = '<p>No results found.</p>';
    return;
  }

  const thead = `
    <thead>
      <tr>
        <th>🔗</th>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
  `;

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
         class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
      <path fill-rule="evenodd"
            d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 
               1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 
               .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
      <path fill-rule="evenodd"
            d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 
               9.146a.5.5 0 1 0 .708.708L15 
               1.707V5.5a.5.5 0 0 0 1 0z"/>
    </svg>
  `;

  const maxLength = 100; // threshold for expanding long content

  const tbody = rows.map(row => {
    const volumeText = row['Volume'] || '';
    const pageText = row['Nr. col. inizio'] || '';

    let volume = (volumeText.match(/^(\d+)/) || [])[1];
    let page = (pageText.match(/^(\d+)/) || [])[1];

    if (!volume || isNaN(volume)) volume = '1';
    if (!page || isNaN(page)) page = '1';

    const url = `https://stampa.lei-digitale.it/volumes/?sector=germanismi&volume=${volume}&page=${page}`;
    const linkCell = `<td><a href="${url}" target="_blank" title="Open article">${svgIcon}</a></td>`;

    const dataCells = headers.map(h => {
      const cellData = row[h] || '';
      if (cellData.length > maxLength) {
        // expandable with summary for long text
        return `<td><details><summary>${cellData.slice(0, maxLength)}...</summary>${cellData}</details></td>`;
      } else {
        return `<td>${cellData}</td>`;
      }
    }).join('');

    return `<tr>${linkCell}${dataCells}</tr>`;
  }).join('');

  container.innerHTML = `<table class="styled-table">${thead}<tbody>${tbody}</tbody></table>`;
}


function runSearch() {
  const queries = {
    'Titolo articolo': document.getElementById('titleSearch').value,
    'Volume': document.getElementById('volumeSearch').value,
    'Fascicolo': document.getElementById('fascicoloSearch').value,
    'Data pubbl.': document.getElementById('dataSearch').value,
    'Nr. col. inizio': document.getElementById('colStartSearch').value,
    'Nr. col. fine': document.getElementById('colEndSearch').value,
    'Autore1': document.getElementById('autore1Search').value
  };

  const fields = Object.keys(queries);
  const results = searchDatabase(queries, fields);
  renderTable(results, Object.keys(data[0] || {}));
}




document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchBtn').addEventListener('click', runSearch);
  loadData();
});
