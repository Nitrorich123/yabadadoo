const searchBtn = document.getElementById('searchBtn');
const loadMoreBtn = document.getElementById('loadMore');
const queryInput = document.getElementById('queryInput');
const resultsTable = document.getElementById('resultsTable');
const resultsBody = document.getElementById('resultsBody');

let query = '';
let start = 0;
const limit = 50;

async function fetchResults() {
  if (!query) return;
  loadMoreBtn.disabled = true;
  try {
    const res = await fetch(`https://api.proxynova.com/comb?query=${encodeURIComponent(query)}&start=${start}&limit=${limit}`);
    if (!res.ok) {
      alert(`Error fetching data: ${res.status}`);
      loadMoreBtn.style.display = 'none';
      return;
    }
    const data = await res.json();
    if (!data.lines || data.lines.length === 0) {
      alert('No more results.');
      loadMoreBtn.style.display = 'none';
      return;
    }
    resultsTable.style.display = 'table';
    data.lines.forEach(line => {
      const [username, password] = line.split(':');
      const row = document.createElement('tr');
      row.innerHTML = `<td>${username}</td><td>${password || ''}</td>`;
      resultsBody.appendChild(row);
    });
    start += limit;
    loadMoreBtn.style.display = 'inline-block';
  } catch (err) {
    alert(`Error: ${err.message}`);
    loadMoreBtn.style.display = 'none';
  } finally {
    loadMoreBtn.disabled = false;
  }
}

searchBtn.addEventListener('click', () => {
  query = queryInput.value.trim();
  if (!query) {
    alert('Please enter a query');
    return;
  }
  start = 0;
  resultsBody.innerHTML = '';
  resultsTable.style.display = 'none';
  loadMoreBtn.style.display = 'none';
  fetchResults();
});

loadMoreBtn.addEventListener('click', fetchResults);
