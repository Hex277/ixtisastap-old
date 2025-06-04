// --- Qlobal dəyişənlər ---
const groupMatch = window.location.pathname.match(/(\d)ciqrup\.html$/);
const groupNumber = groupMatch ? groupMatch[1] : '1'; 
const jsonFile = `qrup${groupNumber}.json`;
let globalData = [];

const groupNames = {
  '1': '1-ci Qrup',
  '2': '2-ci Qrup',
  '3': '3-cü Qrup',
  '4': '4-cü Qrup',
  '5': '5-ci Qrup'
};

// --- Data yükləmə funksiyası ---
function loadData() {
  fetch(jsonFile)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ${jsonFile}: ${response.statusText}`);
      return response.json();
    })
    .then(data => {
      globalData = data;
      initPage();
    })
    .catch(error => {
      console.error('Error loading data:', error);
    });
}

// --- Səhifənin ilkin tənzimləmələri ---
function initPage() {
  const lang = localStorage.getItem("selectedLanguage") || "en";

  // Qrup başlığını təyin et
  const groupTitleElement = document.getElementById('group-title');
  if (groupTitleElement) {
    groupTitleElement.textContent = groupNames[groupNumber] || 'Qrup';
  }

  // Naviqasiya linklərini aktivləşdir
  const navLinks = document.querySelectorAll('#menu-bar ul li a');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `${groupNumber}ciqrup.html`) {
      link.classList.add('active');
    }
  });

  // İlk render və event listener-lərin qurulması
  renderData(globalData, lang);
  setupEventListeners();

  // Resize və orientationchange üçün handler
  function handleResizeOrientation() {
    const filters = getCurrentFilters();
    const filtered = filterData(globalData, filters);
    renderData(filtered, lang);
    setupEventListeners();
  }

  window.addEventListener('resize', handleResizeOrientation);
  window.addEventListener('orientationchange', handleResizeOrientation);
}

// --- Event listener-lərin qurulması ---
function setupEventListeners() {
  const searchInput = document.getElementById("search");
  const tehsilSelect = document.getElementById("tehsilSelect");
  const dilSelect = document.getElementById("dilSelect");
  const altSelect = document.getElementById("altSelect");
  const locationSelect = document.getElementById("locationSelect");
  const searchBtn = document.getElementById("searchBtn");
  const minScoreInput = document.getElementById("minScore");
  const maxScoreInput = document.getElementById("maxScore");

  // Əvvəlki listenerləri sil
  searchInput.removeEventListener("input", applyFilters);
  tehsilSelect.removeEventListener("change", applyFilters);
  dilSelect.removeEventListener("change", applyFilters);
  altSelect.removeEventListener("change", applyFilters);
  locationSelect.removeEventListener("change", applyFilters);
  minScoreInput.removeEventListener("input", applyFilters);
  maxScoreInput.removeEventListener("input", applyFilters);
  if (searchBtn) searchBtn.removeEventListener("click", applyFilters);

  // Yenidən listener-ləri qur
  if (window.innerWidth > 768) {
    searchInput.addEventListener("input", applyFilters);
    minScoreInput.addEventListener("input", applyFilters);
    maxScoreInput.addEventListener("input", applyFilters);
  } else if (searchBtn) {
    searchBtn.addEventListener("click", applyFilters);
  }

  tehsilSelect.addEventListener("change", applyFilters);
  dilSelect.addEventListener("change", applyFilters);
  altSelect.addEventListener("change", applyFilters);
  locationSelect.addEventListener("change", applyFilters);
}

// --- Data render funksiyası ---
function renderData(data, lang) {
  const tableContainer = document.getElementById('table-container');
  const cardContainer = document.getElementById('card-container');
  const t = translations[lang] || {};
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
              <div class="field" id="ixtisasad"><strong>${t["ixtisas"] || "Ixtisas"}:</strong> ${ixt.ad}</div>
              <div class="field"><strong>${t["dil"] || "Dil"}:</strong> ${ixt.dil}</div>
              <div class="field"><strong>${t["balOdenissiz"] || "Bal (Ödənişsiz)"}:</strong> ${ixt.bal_pulsuz ?? "—"}</div>
              <div class="extra-info" style="display: none;">
                <div class="field"><strong>${t["balOdenisli"] || "Bal (Ödənişli)"}:</strong> ${ixt.bal_pullu ?? "—"}</div>
                <div class="field"><strong>${t["tehsilFormasi"] || "Təhsil forması"}:</strong> ${ixt.tehsil_formasi}</div>
                <div class="field"><strong>${t["altQrup"] || "Alt qrup"}:</strong> ${ixt.alt_qrup}</div>
              </div>
              <a href="#" class="toggle-more" onclick="toggleMore(this); return false;">${t["dahaCox"] || "Daha çox"}</a>
            </div>`;
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
                <th>${t["ixtisas"] || "Ixtisas"}</th>
                <th>${t["tehsilFormasi"] || "Təhsil forması"}</th>
                <th>${t["dil"] || "Dil"}</th>
                <th>${t["altQrup"] || "Alt qrup"}</th>
                <th>${t["balOdenissiz"] || "Bal (Ödənişsiz)"}</th>
                <th>${t["balOdenisli"] || "Bal (Ödənişli)"}</th>
              </tr>
            </thead>
            <tbody>`;

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
            </tr>`;
        });

        htmlTable += `</tbody></table>`;
      });
    });

    tableContainer.innerHTML = htmlTable;
    cardContainer.style.display = "none";
    tableContainer.style.display = "block";
  }
}
// --- Menyu bar ---
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

// --- Filter tətbiq funksiyası ---
function applyFilters() {
  const filters = getCurrentFilters();
  const filtered = filterData(globalData, filters);

  let totalResults = 0;
  filtered.forEach(qrup => {
    qrup.universitetler.forEach(uni => {
      totalResults += uni.ixtisaslar.length;
    });
  });

  const resultCountEl = document.getElementById('resultCount');
  const resultNumberEl = document.getElementById('resultNumber');

  const isFilterApplied = JSON.stringify(filters) !== JSON.stringify({
    search: "",
    uni: "",
    qrup: "",
    type: ""
  });

  if (isFilterApplied) {
    resultNumberEl.textContent = totalResults;
    resultCountEl.style.display = "inline";
  } else {
    resultCountEl.style.display = "none";
  }

  const lang = localStorage.getItem("selectedLanguage") || "en";
  renderData(filtered, lang);
  setupEventListeners();
  changeLanguage(lang);
}

// --- Cari filtr dəyərlərinin alınması ---
function getCurrentFilters() {
  return {
    searchValue: document.getElementById("search").value.trim().toLowerCase(),
    tehsilValue: document.getElementById("tehsilSelect").value,
    dilValue: document.getElementById("dilSelect").value,
    altValue: document.getElementById("altSelect").value,
    locationValue: document.getElementById("locationSelect").value,
    minScore: parseInt(document.getElementById("minScore").value) || 0,
    maxScore: parseInt(document.getElementById("maxScore").value) || 700
  };
}


// --- Data filtr funksiyası ---
function filterData(data, {searchValue, tehsilValue, dilValue, altValue, locationValue, minScore, maxScore}) {
  if (!data) return [];

  const result = data.map(qrup => {
    const filteredUniversities = qrup.universitetler.map(uni => {
      const uniLocationMatches = locationValue === '' || uni.yer.toLowerCase().includes(locationValue.toLowerCase());
      if (!uniLocationMatches) return null;

      const filteredIxtisaslar = uni.ixtisaslar.filter(ixt => {
        if (tehsilValue && ixt.tehsil_formasi !== tehsilValue) return false;
        if (dilValue && ixt.dil !== dilValue) return false;
        if (altValue && ixt.alt_qrup !== altValue) return false;

        if (ixt.bal_pulsuz !== null && ixt.bal_pulsuz !== undefined) {
          const bal = parseInt(ixt.bal_pulsuz);
          if (bal < minScore || bal > maxScore) return false;
        }

        if (searchValue && !ixt.ad.toLowerCase().includes(searchValue)) return false;

        return true;
      });

      if (filteredIxtisaslar.length === 0) return null;

      return {
        ...uni,
        ixtisaslar: filteredIxtisaslar
      };
    }).filter(Boolean);

    return {
      ...qrup,
      universitetler: filteredUniversities
    };
  }).filter(q => q.universitetler.length > 0);

  return result;
}


// --- "Dark mode" ---
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

// --- "Daha çox" linkinə kliklə gizlədilən bölməni açıb-bağlama funksiyası ---
function toggleMore(el) {
  const extraInfo = el.previousElementSibling;
  if (extraInfo.style.display === "none") {
    extraInfo.style.display = "block";
    el.textContent = (localStorage.getItem("selectedLanguage") === "az") ? "Daha az" : "Less";
  } else {
    extraInfo.style.display = "none";
    el.textContent = (localStorage.getItem("selectedLanguage") === "az") ? "Daha çox" : "More";
  }
}

// --- Səhifə yüklənəndə ---
document.addEventListener("DOMContentLoaded", () => {
  loadData();
});

const translations = {
  en: {
    siteName: "IxtisasTap.com",
    group1: "Group 1",
    group2: "Group 2",
    group3: "Group 3",
    group4: "Group 4",
    group5: "Group 5 (Coming soon)",
    about: "About Us",
    pageTitle1: "Group 1 Specialties 2025",
    pageTitle2: "Group 2 Specialties 2025",
    pageTitle3: "Group 3 Specialties 2025",
    pageTitle4: "Group 4 Specialties 2025",
    pageTitle5: "Group 5 Specialties 2025",
    searchBtn: "Search",
    searchPlaceholder: "Search for specialty...",
    found: "found.",
    eduAll: "Full-time / Part-time",
    eduEyani: "Full-time",
    eduQiyabi: "Part-time",
    langAll: "All languages",
    langAz: "Azerbaijani",
    langEn: "English",
    langTr: "Turkish",
    langRu: "Russian",
    langCh: "Chinese",
    langAr: "Arabic",
    langFa: "Persian",
    langUk: "Ukrainian",
    langFr: "French",
    langKo: "Korean",
    langCz: "Czech",
    langPo: "Polish",
    langIs: "Spanish",
    langEr: "Armenian",
    altAll: "All subgroups",
    cityAll: "All cities",
    ixtisas: "Specialty",
    tehsilFormasi: "Education type",
    dil: "Language",
    altQrup: "Subgroup",
    balOdenissiz: "Score (Free)",
    balOdenisli: "Score (Paid)",
    dahaCox: "More",
    dahaAz: "Show less",
    aboutUs: "About Us",
    about: "About Us & Contact",
    aboutParagraph1: "This website was created to fundamentally transform the specialty selection process in Azerbaijan. The abundance and fragmentation of information in the education sector hinder users from finding the right specialty. Our goal is to simplify the selection process by providing the most comprehensive, up-to-date, and accessible information to students and specialty seekers.",
    aboutParagraph2: "We have compiled a wide range of specialties and related information into one platform. We follow the latest educational trends and constantly update our database based on the needs of our users. The information we provide about specialties covers important aspects such as academic programs, future prospects, and career opportunities.",
    aboutParagraph3: "User experience is our top priority. With an intuitive search system, easy-to-understand interface, and extensive filtering options, everyone can easily find the specialty that suits their needs. Our goal is to be a leading and reliable platform in the field of education in Azerbaijan.",
    aboutParagraph4: "We value feedback from our users. We always listen to your opinions and strive to improve our website further. Guiding you in your specialty selection journey is our main mission.",
    contactTitle: "Contact",
    emailLabel: "Email",
    phoneLabel: "Phone",
    locationLabel: "Location",
    locationValue: "Baku, Azerbaijan",
    footerText: "All rights reserved."
  },
  az: {
    siteName: "IxtisasTap.com",
    group1: "1ci Qrup",
    group2: "2ci Qrup",
    group3: "3cü Qrup",
    group4: "4cü Qrup",
    group5: "5ci Qrup (Tezliklə)",
    about: "Haqqımızda",
    pageTitle1: "1ci Qrup Ixtisaslar 2025",
    pageTitle2: "2ci Qrup Ixtisaslar 2025",
    pageTitle3: "3ci Qrup Ixtisaslar 2025",
    pageTitle4: "4ci Qrup Ixtisaslar 2025",
    pageTitle5: "5ci Qrup Ixtisaslar 2025",
    searchBtn: "Axtar",
    searchPlaceholder: "Ixtisas axtar...",
    found: "nəticə tapıldı.",
    eduAll: "Əyani / Qiyabi",
    eduEyani: "Əyani",
    eduQiyabi: "Qiyabi",
    langAll: "Bütün dillər",
    langAz: "Azərbaycan dili",
    langEn: "İngilis dili",
    langTr: "Türk dili",
    langRu: "Rus dili",
    langCh: "Çin dili",
    langAr: "Ərəb dili",
    langFa: "Fars dili",
    langUk: "Ukrayna dili",
    langFr: "Fransız dili",
    langKo: "Koreya dili",
    langCz: "Çex dili",
    langPo: "Polyak dili",
    langIs: "İspan dili",
    langEr: "Erməni dili",
    altAll: "Bütün alt qruplar",
    cityAll: "Bütün şəhərlər",
    ixtisas: "Ixtisas",
    tehsilFormasi: "Təhsil forması",
    dil: "Dil",
    altQrup: "Alt qrup",
    balOdenissiz: "Bal (Ödənişsiz)",
    balOdenisli: "Bal (Ödənişli)",
    dahaCox: "Daha çox",
    dahaAz: "Daha az",
    aboutUs: "Haqqımızda",
    about: "Haqqımızda və Əlaqə",
    aboutParagraph1: "Sayt Azərbaycanda ixtisas seçimi prosesini köklü şəkildə dəyişdirmək üçün yaradılıb. Təhsil sahəsində mövcud olan məlumatların çoxluğu və dağınıqlığı istifadəçilərin doğru ixtisas tapmasına mane olur. Məqsədimiz, tələbələrə və ixtisas axtaranlara ən dolğun, ən aktual və ən əlçatan məlumatları təqdim etməklə, seçim prosesini asanlaşdırmaqdır.",
    aboutParagraph2: "Saytımızda müxtəlif ixtisaslar və onlara aid geniş məlumat bazası bir araya gətirilib. Biz, ən yeni təhsil trendlərini izləyir, istifadəçilərimizin ehtiyaclarını nəzərə alaraq daima məlumat bazamızı yeniləyirik. İxtisaslar haqqında təqdim etdiyimiz məlumatlar, təhsil müəssisələrinin proqramları, ixtisasın gələcək perspektivləri və iş imkanları kimi vacib aspektləri əhatə edir.",
    aboutParagraph3: "Biz, istifadəçi təcrübəsini ön planda saxlayırıq. Saytımızda intuitiv axtarış sistemi, asan anlaşılan interfeys və geniş filtrasiya imkanları vasitəsilə hər kəs öz ehtiyacına uyğun ixtisası rahatlıqla tapa bilər. Məqsədimiz, Azərbaycanda təhsil sahəsində qabaqcıl və etibarlı platforma olmaqdır.",
    aboutParagraph4: "İstifadəçilərimizin rəyləri bizim üçün önəmlidir. Hər zaman sizin fikirlərinizi dinləyir, saytımızı daha da təkmilləşdirmək üçün çalışırıq. İxtisas seçiminizdə sizə yol göstərmək bizim əsas məqsədimizdir.",
    contactTitle: "Əlaqə",
    emailLabel: "E-poçt",
    phoneLabel: "Telefon",
    locationLabel: "Ünvan",
    locationValue: "Bakı, Azərbaycan",
    footerText: "Bütün hüquqlar qorunur."
  },
  tr: {
    siteName: "IxtisasTap.com",
    group1: "1. Grup",
    group2: "2. Grup",
    group3: "3. Grup",
    group4: "4. Grup",
    group5: "5. Grup (Yakında)",
    about: "Hakkımızda",
    pageTitle1: "1. Grup Bölümleri 2025",
    pageTitle2: "2. Grup Bölümleri 2025",
    pageTitle3: "3. Grup Bölümleri 2025",
    pageTitle4: "4. Grup Bölümleri 2025",
    pageTitle5: "5. Grup Bölümleri 2025",
    searchBtn: "Ara",
    searchPlaceholder: "Bölüm ara...",
    found: "sonuç bulundu.",
    eduAll: "Örgün / Uzaktan",
    eduEyani: "Örgün",
    eduQiyabi: "Uzaktan",
    langAll: "Tüm diller",
    langAz: "Azerbaycanca",
    langEn: "İngilizce",
    langTr: "Türkçe",
    langRu: "Rusça",
    langCh: "Çince",
    langAr: "Arapça",
    langFa: "Farsça",
    langUk: "Ukraynaca",
    langFr: "Fransızca",
    langKo: "Korece",
    langCz: "Çekçe",
    langPo: "Lehçe",
    langIs: "İspanyolca",
    langEr: "Ermenice",

    altAll: "Tüm alt gruplar",
    cityAll: "Tüm şehirler",
    ixtisas: "Bölüm",
    tehsilFormasi: "Eğitim türü",
    dil: "Dil",
    altQrup: "Alt grup",
    balOdenissiz: "Puan (Ücretsiz)",
    balOdenisli: "Puan (Ücretli)",
    dahaCox: "Daha fazla",
    dahaAz: "Daha az",
    aboutUs: "Hakkımızda",
    about: "Hakkımızda ve İletişim",
    aboutParagraph1: "Bu site, Azerbaycan'da bölüm seçme sürecini köklü bir şekilde değiştirmek amacıyla oluşturulmuştur. Eğitim alanındaki bilgi fazlalığı ve dağınıklık, kullanıcıların doğru bölümü bulmalarını zorlaştırıyor. Amacımız, öğrencilere ve bölüm arayanlara en kapsamlı, en güncel ve en erişilebilir bilgileri sunarak seçim sürecini kolaylaştırmaktır.",
    aboutParagraph2: "Sitemizde çeşitli bölümler ve onlara ait geniş bir bilgi veritabanı bir araya getirilmiştir. En son eğitim trendlerini takip ediyor, kullanıcılarımızın ihtiyaçlarını göz önünde bulundurarak veritabanımızı sürekli güncelliyoruz. Bölümler hakkında sunduğumuz bilgiler; program detayları, gelecekteki olanaklar ve iş imkanları gibi önemli konuları kapsıyor.",
    aboutParagraph3: "Kullanıcı deneyimini ön planda tutuyoruz. Sitemizde sezgisel arama sistemi, kolay anlaşılır arayüz ve geniş filtreleme seçenekleri sayesinde herkes ihtiyacına uygun bölümü rahatlıkla bulabilir. Amacımız, Azerbaycan'da eğitim alanında öncü ve güvenilir bir platform olmaktır.",
    aboutParagraph4: "Kullanıcılarımızın görüşleri bizim için değerlidir. Her zaman fikirlerinizi dinliyor ve sitemizi daha da geliştirmek için çalışıyoruz. Bölüm seçiminizde size yol göstermek bizim en temel amacımızdır.",
    contactTitle: "İletişim",
    emailLabel: "E-posta",
    phoneLabel: "Telefon",
    locationLabel: "Adres",
    locationValue: "Bakü, Azerbaycan",
    footerText: "Tüm hakları saklıdır."
  }
};
function changeLanguage(lang) {
  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.innerText = translations[lang][key];
    }
  });

  const placeholderEl = document.querySelector("[data-i18n-placeholder]");
  if (placeholderEl) {
    const key = placeholderEl.getAttribute("data-i18n-placeholder");
    if (translations[lang][key]) {
      placeholderEl.setAttribute("placeholder", translations[lang][key]);
    }
  }
}

document.getElementById("language-selector").addEventListener("change", function () {
  const selectedLang = this.value;
  localStorage.setItem("selectedLanguage", selectedLang);
  location.reload();
});

window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("selectedLanguage") || "en";
  document.getElementById("language-selector").value = savedLang;
  changeLanguage(savedLang);
  renderData(filteredData || originalData);
});
 

const tableContainer = document.getElementById('table-container');
  const cardContainer = document.getElementById('card-container');

  const isMobile = () => window.innerWidth <= 768;

  function setupTableView() {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    const visibleCount = Math.ceil(tableContainer.clientHeight / rowHeight) + 5;

    function createRow(index) {
      const tr = document.createElement('tr');
      tr.style.height = rowHeight + 'px';
      return tr;
    }

    function renderRows(start) {
      tbody.innerHTML = '';
      const fragment = document.createDocumentFragment();

      for (let i = start; i < start + visibleCount && i < totalRows; i++) {
        fragment.appendChild(createRow(i));
      }
      tbody.appendChild(fragment);
    }

    function onScroll() {
      const scrollTop = tableContainer.scrollTop;
      const startRow = Math.floor(scrollTop / rowHeight);
      renderRows(startRow);
    }

    renderRows(0);
    tableContainer.addEventListener('scroll', onScroll);
  }

  function setupCardView() {
    cardContainer.innerHTML = '';

    for (let i = 0; i < totalRows; i++) {
      const card = document.createElement('div');
      card.className = 'card-item';
      cardContainer.appendChild(card);
    }
  }

  function renderView() {
    if (isMobile()) {
      tableContainer.style.display = 'none';
      cardContainer.style.display = 'block';
      setupCardView();
    } else {
      cardContainer.style.display = 'none';
      tableContainer.style.display = 'block';
      setupTableView();
    }
  }

  let currentIsMobile = isMobile();

  window.addEventListener('resize', () => {
    const newIsMobile = isMobile();
    if (newIsMobile !== currentIsMobile) {
      currentIsMobile = newIsMobile;
      renderView(); // sadəcə görünüşü yenilə, reload etmə
    }
  });
