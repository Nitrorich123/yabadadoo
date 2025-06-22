const searchBtn = document.getElementById('searchBtn');
const toggleBtn = document.getElementById('loadMore');
const queryInput = document.getElementById('queryInput');
const resultsTable = document.getElementById('resultsTable');
const resultsBody = document.getElementById('resultsBody');

let query = '';
let start = 0;
const limit = 1; // fetch one result at a time
let fetching = false;
let stopRequested = false;

async function fetchOneResult() {
  if (!query || stopRequested) return false;
  try {
    const res = await fetch(`https://api.proxynova.com/comb?query=${encodeURIComponent(query)}&start=${start}&limit=${limit}`);
    if (!res.ok) {
      alert(`Error fetching data: ${res.status}`);
      return false;
    }
    const data = await res.json();
    if (!data.lines || data.lines.length === 0) {
      alert('No more results.');
      return false;
    }
    resultsTable.style.display = 'table';
    data.lines.forEach(line => {
      const [username, password] = line.split(':');
      const row = document.createElement('tr');
      row.innerHTML = `<td>${username}</td><td>${password || ''}</td>`;
      resultsBody.appendChild(row);
    });
    start += limit;
    return true;
  } catch (err) {
    alert(`Error: ${err.message}`);
    return false;
  }
}

async function fetchOnePerSecond() {
  fetching = true;
  stopRequested = false;
  toggleBtn.textContent = 'Stop';
  toggleBtn.disabled = false;

  while (!stopRequested) {
    const hasMore = await fetchOneResult();
    if (!hasMore) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  fetching = false;
  stopRequested = false;
  toggleBtn.textContent = 'Start';
}

searchBtn.addEventListener('click', () => {
  if (fetching) {
    alert('Please stop the current fetch before searching again.');
    return;
  }
  query = queryInput.value.trim();
  if (!query) {
    alert('Please enter a query');
    return;
  }
  start = 0;
  resultsBody.innerHTML = '';
  resultsTable.style.display = 'none';
  toggleBtn.style.display = 'inline-block';
  toggleBtn.textContent = 'Start';
});

toggleBtn.addEventListener('click', () => {
  if (fetching) {
    stopRequested = true;
    toggleBtn.disabled = true;
  } else {
    fetchOnePerSecond();
  }
});
