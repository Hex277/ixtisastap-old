// Extract group number from the URL (e.g., '1ciqrup.html' -> '1')
const groupMatch = window.location.pathname.match(/(\d)ciqrup\.html$/);
const groupNumber = groupMatch ? groupMatch[1] : '1'; // Default to '1' if not found
const jsonFile = `qrup${groupNumber}.json`;

let globalData = [];

fetch(jsonFile)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${jsonFile}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    globalData = data;
    renderData(data);
    setupEventListeners();

    // Buraya əlavə et:
    window.addEventListener('resize', () => {
      renderData(globalData);
      setupEventListeners();
    });

    window.addEventListener('orientationchange', () => {
      renderData(globalData);
      setupEventListeners();
    });
  })
  .catch(error => {
    console.error('Error loading data:', error);
  });

const groupNames = {
  '1': '1-ci Qrup',
  '2': '2-ci Qrup',
  '3': '3-cü Qrup',
  '4': '4-cü Qrup',
  '5': '5-ci Qrup'
};

const groupTitleElement = document.getElementById('group-title');
if (groupTitleElement) {
  groupTitleElement.textContent = groupNames[groupNumber] || 'Qrup';
}

const navLinks = document.querySelectorAll('#menu-bar ul li a');
navLinks.forEach(link => {
  if (link.getAttribute('href') === `${groupNumber}ciqrup.html`) {
    link.classList.add('active');
  }
});

function setupEventListeners() {
  const searchInput = document.getElementById("search");
  const tehsilSelect = document.getElementById("tehsilSelect");
  const dilSelect = document.getElementById("dilSelect");
  const altSelect = document.getElementById("altSelect");
  const locationSelect = document.getElementById("locationSelect");

  searchInput.removeEventListener("input", applyFilters);
  tehsilSelect.removeEventListener("change", applyFilters);
  dilSelect.removeEventListener("change", applyFilters);
  altSelect.removeEventListener("change", applyFilters);
  locationSelect.removeEventListener("change", applyFilters);

  if (window.innerWidth > 768) {
    searchInput.addEventListener("input", applyFilters); // Yalnız masaüstündə input dəyişdikcə işləsin
  } else {
    const searchBtn = document.getElementById("searchBtn");
    searchBtn.addEventListener("click", applyFilters); // Mobil üçün sadəcə düymə ilə işləsin
  }
  
  tehsilSelect.addEventListener("change", applyFilters);
  dilSelect.addEventListener("change", applyFilters);
  altSelect.addEventListener("change", applyFilters);
  locationSelect.addEventListener("change", applyFilters);
}

const menuToggle = document.getElementById('menu-toggle');
const menuContent = document.getElementById('menu-bar');

menuToggle.addEventListener('click', () => {
  menuContent.classList.toggle('hidden');
});

document.addEventListener('click', function(event) {
  const isClickInside = menuToggle.contains(event.target) || menuContent.contains(event.target);
  if (!isClickInside) {
    menuContent.classList.add('hidden');
  }
});

function renderData(data) {
  const tableContainer = document.getElementById('table-container');
  const cardContainer = document.getElementById('card-container');
  
  const isMobile = window.innerWidth <= 768;

  tableContainer.innerHTML = "";
  cardContainer.innerHTML = "";

  if (isMobile) {
    let htmlCard = '';

    data.forEach(qrup => {
      qrup.universitetler.forEach(uni => {
        htmlCard += `<div class="uni-basliq">${uni.universitet}</div>`;
        uni.ixtisaslar.forEach(ixt => {
          htmlCard += `
            <div class="card">
              <div class="field" id="ixtisasad"><strong>Ixtisas:</strong> ${ixt.ad}</div>
              <div class="field"><strong>Dil:</strong> ${ixt.dil}</div>
              <div class="field" id="balodenissiz"><strong>Bal (Ödənişsiz): ${ixt.bal_pulsuz ?? "—"}</strong></div>
              <div class="extra-info" style="display: none;">
                <div class="field"><strong>Bal (Ödənişli): ${ixt.bal_pullu ?? "—"}</strong></div>
                <div class="field"><strong>Təhsil forması:</strong> ${ixt.tehsil_formasi}</div>
                <div class="field"><strong>Alt qrup:</strong> ${ixt.alt_qrup}</div>
              </div>
              <a href="#" class="toggle-more" onclick="toggleMore(this); return false;">Daha çox</a>
            </div>
          `;
        });
      });
    });

    cardContainer.innerHTML = htmlCard;
    tableContainer.style.display = "none";
    cardContainer.style.display = "block";

  } else {
    let htmlTable = '';

    data.forEach(qrup => {
      qrup.universitetler.forEach(uni => {
        htmlTable += `<div class="uni-basliq">${uni.universitet}</div>`;
        htmlTable += `
          <table>
            <thead>
              <tr>
                <th>Ixtisas</th>
                <th>Təhsil forması</th>
                <th>Dil</th>
                <th>Alt qrup</th>
                <th>Bal (Ödənişsiz)</th>
                <th>Bal (Ödənişli)</th>
              </tr>
            </thead>
            <tbody>
        `;

        uni.ixtisaslar.forEach((ixt, index) => {
          const zebraClass = index % 2 === 0 ? 'even-row' : '';
          htmlTable += `
            <tr class="${zebraClass}">
              <td>${ixt.ad}</td>
              <td>${ixt.tehsil_formasi}</td>
              <td>${ixt.dil}</td>
              <td>${ixt.alt_qrup}</td>
              <td>${ixt.bal_pulsuz ?? "—"}</td>
              <td>${ixt.bal_pullu ?? "—"}</td>
            </tr>
          `;
        });

        htmlTable += `</tbody></table>`;
      });
    });

    tableContainer.innerHTML = htmlTable;
    cardContainer.style.display = "none";
    tableContainer.style.display = "block";
  }
}


function applyFilters() {
  const query = document.getElementById("search").value.toLowerCase();
  const selectedTehsil = document.getElementById("tehsilSelect").value;
  const selectedDil = document.getElementById("dilSelect").value;
  const selectedAlt = document.getElementById("altSelect").value;
  const selectedLocation = document.getElementById("locationSelect").value;
  let totalResults = 0;

  const filtered = globalData.map(qrup => {
    const filteredUniversitetler = qrup.universitetler.map(uni => {
      const matchedIxtisaslar = uni.ixtisaslar.filter(ixt => {
        const nameMatch = ixt.ad.toLowerCase().includes(query);
        const tehsilMatch = !selectedTehsil || ixt.tehsil_formasi === selectedTehsil;
        const dilMatch = !selectedDil || ixt.dil === selectedDil;
        const altMatch = !selectedAlt || ixt.alt_qrup === selectedAlt;
        const locationMatch = !selectedLocation || uni.yer === selectedLocation;

        return nameMatch && tehsilMatch && dilMatch && altMatch && locationMatch;
      });

      totalResults += matchedIxtisaslar.length;

      return matchedIxtisaslar.length > 0 ? { ...uni, ixtisaslar: matchedIxtisaslar } : null;
    }).filter(Boolean);

    return filteredUniversitetler.length > 0 ? { ...qrup, universitetler: filteredUniversitetler } : null;
  }).filter(Boolean);

  const resultCountElement = document.getElementById("resultCount");
  if (query || selectedTehsil || selectedDil || selectedAlt || selectedLocation) {
    if (totalResults > 0) {
      resultCountElement.innerText = `${totalResults} nəticə tapıldı.`;
      resultCountElement.style.display = "block";
    } else {
      resultCountElement.innerText = "Nəticə tapılmadı.";
      resultCountElement.style.display = "block";
    }
  } else {
    resultCountElement.style.display = "none";
  }

  renderData(filtered);
}

const toggleBtn = document.getElementById('toggle-dark-mode');
const toggleIcon = document.getElementById('icon');

// Sayt yüklənəndə əvvəlki rejimi yoxla
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  toggleIcon.src = "moon.png";
} else {
  document.body.classList.remove('dark-mode');
  toggleIcon.src = "sun.png";
}

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
    toggleIcon.src = "sun.png";
  } else {
    localStorage.setItem('darkMode', 'disabled');
    toggleIcon.src = "moon.png";
  }
});


function toggleMore(link) {
  const card = link.closest('.card');
  const extraInfo = card.querySelector('.extra-info');
  const isVisible = extraInfo.style.display === "block";

  extraInfo.style.display = isVisible ? "none" : "block";
  link.innerText = isVisible ? "Daha çox" : "Daha az";
}

