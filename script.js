let currentFocus = -1;

// 예상 검색어 데이터 로드 함수
async function loadSuggestions() {
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
}

// 데이터 로드 함수
async function loadData() {
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
}

// 예상 검색어 보여주기
async function showSuggestions() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const suggestionsDiv = document.getElementById('suggestions');

    if (searchInput.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const data = await loadSuggestions();
    const suggestions = data.map(entry => entry.term);
    const filteredSuggestions = suggestions.filter(term => term.toLowerCase().includes(searchInput));

    if (filteredSuggestions.length > 0) {
        suggestionsDiv.innerHTML = '';
        filteredSuggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.textContent = suggestion;
            div.setAttribute('data-index', index);
            div.onclick = function() {
                document.getElementById('searchInput').value = suggestion;
                suggestionsDiv.style.display = 'none';
                currentFocus = -1;
            };
            suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }

    currentFocus = -1;  // 검색할 때마다 초기화
}

function handleKeyDown(event) {
    const suggestionsDiv = document.getElementById('suggestions');
    const items = suggestionsDiv.getElementsByTagName('div');

    if (event.key === "ArrowDown") {
        // 아래로 이동
        currentFocus++;
        addActive(items);
    } else if (event.key === "ArrowUp") {
        // 위로 이동
        currentFocus--;
        addActive(items);
    } else if (event.key === "Enter") {
        // 선택된 항목 입력
        event.preventDefault();
        if (currentFocus > -1) {
            if (items) items[currentFocus].click();
        }
    } else if (event.key === "Tab") {
        // Tab 키로 다음 항목으로 이동
        event.preventDefault(); // 기본 Tab 동작 방지
        currentFocus++;
        addActive(items);
    }
}

function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("autocomplete-active");
}

function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("autocomplete-active");
    }
}

document.getElementById('searchInput').addEventListener('keydown', handleKeyDown);

// 검색 함수
async function searchTerm() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // 결과 영역 초기화
    
    const data = await loadData();

    const found = data.filter(entry => entry.term.toLowerCase() === searchInput);

    if (found.length > 0) {
        const term = found[0].term;
        const definition = found[0].definition;
        resultDiv.innerHTML = `<h2>${term}</h2><p>${definition}</p>`;
    } else {
        resultDiv.innerHTML = `<p>No results found for "${searchInput}".</p>`;
    }
}
