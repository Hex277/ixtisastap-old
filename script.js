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
    const lang = localStorage.getItem("selectedLanguage") || "en";
    renderData(data, lang);
    setupEventListeners();

    // Buraya əlavə et:
    window.addEventListener('resize', () => {
      const filters = getCurrentFilters();
      const filtered = filterData(globalData, filters);
      const lang = localStorage.getItem("selectedLanguage") || "en";
      renderData(filtered, lang);
      setupEventListeners();
    });
    
    window.addEventListener('orientationchange', () => {
      const filters = getCurrentFilters();
      const filtered = filterData(globalData, filters);
      const lang = localStorage.getItem("selectedLanguage") || "en";
      renderData(filtered,lang);
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
document.addEventListener('DOMContentLoaded', () => {
  const menuBar = document.getElementById("menu-bar");
  if (!menuBar) return; // əgər element yoxdursa çıx

  let touchStartX = 0;
  let touchEndX = 0;

  function handleGesture() {
    const swipeDistance = touchStartX - touchEndX;
    const minSwipeDistance = 50; // Minimum sürüşdürmə məsafəsi (piksel)

    // sola sürüşdürdüsə və məsafə kifayət qədərdirsə
    if (swipeDistance > minSwipeDistance) {
      menuBar.classList.add("hidden");
    }
  }

  // Əgər ekran 768 piksel və ya kiçikdirsə, swipe aktivləşdirilir
  if (window.innerWidth <= 768) {
    menuBar.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    menuBar.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    });
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
  const lang = localStorage.getItem("selectedLanguage") || "en"; 
  const t = translations[lang]; 
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
                <th>${t["ixtisas"] || "Ixtisas"}</th>
                <th>${t["tehsilFormasi"] || "Təhsil forması"}</th>
                <th>${t["dil"] || "Dil"}</th>
                <th>${t["altQrup"] || "Alt qrup"}</th>
                <th>${t["balOdenissiz"] || "Bal (Ödənişsiz)"}</th>
                <th>${t["balOdenisli"] || "Bal (Ödənişli)"}</th>
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
document.addEventListener('DOMContentLoaded', () => {
  const filterBar = document.querySelector('.filter-bar');
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  const filterText = filterToggleBtn.querySelector('span');
  const filterIcon = filterToggleBtn.querySelector('img');

  // Əvvəlcə filterlər gizlədilir (mobil üçün)
  if (window.innerWidth <= 768) {
    filterBar.style.display = 'none';
  }

  filterToggleBtn.addEventListener('click', () => {
    const isVisible = filterBar.style.display === 'block';

    if (isVisible) {
      filterBar.style.display = 'none';
      filterText.textContent = 'Filter';
      filterIcon.style.display = 'inline';
    } else {
      filterBar.style.display = 'block';
      filterText.textContent = 'Close';
      filterIcon.style.display = 'none';
    }
  });


});

function applyFilters() {
  const query = document.getElementById("search").value.toLowerCase();
  const selectedTehsil = document.getElementById("tehsilSelect").value;
  const selectedDil = document.getElementById("dilSelect").value;
  const selectedAlt = document.getElementById("altSelect").value;
  const selectedLocation = document.getElementById("locationSelect").value;
  const minScoreInput = document.getElementById("minScore");
  const maxScoreInput = document.getElementById("maxScore");

  const minScore = minScoreInput.value ? parseFloat(minScoreInput.value) : null;
  const maxScore = maxScoreInput.value ? parseFloat(maxScoreInput.value) : null;
  
  let totalResults = 0;

  const filtered = globalData.map(qrup => {
    const filteredUniversitetler = qrup.universitetler.map(uni => {
      const matchedIxtisaslar = uni.ixtisaslar.filter(ixt => {
        const nameMatch = ixt.ad.toLowerCase().includes(query);
        const tehsilMatch = !selectedTehsil || ixt.tehsil_formasi === selectedTehsil;
        const dilMatch = !selectedDil || ixt.dil === selectedDil;
        const altMatch = !selectedAlt || ixt.alt_qrup === selectedAlt;
        const locationMatch = !selectedLocation || uni.yer === selectedLocation;

        const score = ixt.bal_pulsuz;
        const scorePullu = ixt.bal_pullu;
        const scoreMatch = (
          (minScore === null || (score !== undefined && score >= minScore)) &&
          (maxScore === null || (score !== undefined && score <= maxScore)) &&
          (maxScore === null || (score !== undefined && scorePullu <= maxScore))
        );

        return nameMatch && tehsilMatch && dilMatch && altMatch && locationMatch && scoreMatch;
      });

      totalResults += matchedIxtisaslar.length;
      return matchedIxtisaslar.length > 0 ? { ...uni, ixtisaslar: matchedIxtisaslar } : null;
    }).filter(Boolean);

    return filteredUniversitetler.length > 0 ? { ...qrup, universitetler: filteredUniversitetler } : null;
  }).filter(Boolean);

  const resultCountElement = document.getElementById("resultCount");
  if (query || selectedTehsil || selectedDil || selectedAlt || selectedLocation || minScore !== null || maxScore !== null) {
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

  const lang = localStorage.getItem("selectedLanguage") || "en";
  renderData(filtered, lang);
}

// ✅ Desktop və mobil üçün input hadisələrini idarə edən funksiya
function setupEventListeners() {
  const searchInput = document.getElementById("search");
  const tehsilSelect = document.getElementById("tehsilSelect");
  const dilSelect = document.getElementById("dilSelect");
  const altSelect = document.getElementById("altSelect");
  const locationSelect = document.getElementById("locationSelect");

  const minScoreInput = document.getElementById("minScore");
  const maxScoreInput = document.getElementById("maxScore");

  // Əvvəlki hadisələri təmizlə
  searchInput.removeEventListener("input", applyFilters);
  tehsilSelect.removeEventListener("change", applyFilters);
  dilSelect.removeEventListener("change", applyFilters);
  altSelect.removeEventListener("change", applyFilters);
  locationSelect.removeEventListener("change", applyFilters);
  minScoreInput?.removeEventListener("input", applyFilters);
  maxScoreInput?.removeEventListener("input", applyFilters);

  if (window.innerWidth > 768) {
    // ✅ Desktop üçün input hadisələri
    searchInput.addEventListener("input", applyFilters);
    minScoreInput?.addEventListener("input", applyFilters);
    maxScoreInput?.addEventListener("input", applyFilters);
  } else {
    // ✅ Mobil üçün yalnız düymə ilə axtarış
    const searchBtn = document.getElementById("searchBtn");
    searchBtn.addEventListener("click", applyFilters);
  }

  // Hər iki rejimdə aşağıdakılar işə düşür
  tehsilSelect.addEventListener("change", applyFilters);
  dilSelect.addEventListener("change", applyFilters);
  altSelect.addEventListener("change", applyFilters);
  locationSelect.addEventListener("change", applyFilters);
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

  const lang = localStorage.getItem("preferredLang") || "en";
  const t = translations[lang];

  extraInfo.style.display = isVisible ? "none" : "block";
  link.innerText = isVisible ? t["dahaCox"] || "Daha çox" : t["dahaAz"] || "Daha az";
}


function getCurrentFilters() {
  const query = document.getElementById("search").value.toLowerCase();
  const selectedTehsil = document.getElementById("tehsilSelect").value;
  const selectedDil = document.getElementById("dilSelect").value;
  const selectedAlt = document.getElementById("altSelect").value;
  const selectedLocation = document.getElementById("locationSelect").value;

  return { query, selectedTehsil, selectedDil, selectedAlt, selectedLocation };
}

function filterData(data, filters) {
  const { query, selectedTehsil, selectedDil, selectedAlt, selectedLocation } = filters;

  return data.map(qrup => {
    const filteredUniversitetler = qrup.universitetler.map(uni => {
      const matchedIxtisaslar = uni.ixtisaslar.filter(ixt => {
        const nameMatch = ixt.ad.toLowerCase().includes(query);
        const tehsilMatch = !selectedTehsil || ixt.tehsil_formasi === selectedTehsil;
        const dilMatch = !selectedDil || ixt.dil === selectedDil;
        const altMatch = !selectedAlt || ixt.alt_qrup === selectedAlt;
        const locationMatch = !selectedLocation || uni.yer === selectedLocation;

        return nameMatch && tehsilMatch && dilMatch && altMatch && locationMatch;
      });

      return matchedIxtisaslar.length > 0 ? { ...uni, ixtisaslar: matchedIxtisaslar } : null;
    }).filter(Boolean);

    return filteredUniversitetler.length > 0 ? { ...qrup, universitetler: filteredUniversitetler } : null;
  }).filter(Boolean);
}
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
    filterText: "Filters",
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
    filterText: "Filterlər",
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
    filterText: "Filtre",
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

  // Placeholder üçün ayrıca dəyişiklik:
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
  // Səhifəni reload edirik ki, bütün content yenidən yüklənsin və başlıqlar da dəyişsin
  location.reload();
});

window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("selectedLanguage") || "en";
  document.getElementById("language-selector").value = savedLang;
  changeLanguage(savedLang);
  renderData(filteredData || originalData); // renderData funksiyası burada işləsin
});

