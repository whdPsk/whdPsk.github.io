let currentFocus = -1;
let originalInput = '';  // 사용자가 처음 입력한 검색어를 저장하기 위한 변수

// 예상 검색어 데이터 로드 함수
async function loadSuggestions() {
    const response = await fetch('data.json');  // data.json을 사용
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

    originalInput = searchInput;  // 사용자가 입력한 검색어를 저장
    const data = await loadSuggestions();
    const suggestions = data.map(entry => entry.term);
    const filteredSuggestions = suggestions.filter(term => term.toLowerCase().includes(searchInput));

    if (filteredSuggestions.length > 0) {
        suggestionsDiv.innerHTML = '';
        filteredSuggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.textContent = suggestion;
            div.setAttribute('data-index', index);
            suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }

    currentFocus = -1;
}

function handleKeyDown(event) {
    const suggestionsDiv = document.getElementById('suggestions');
    const items = suggestionsDiv.getElementsByTagName('div');

    if (event.key === "ArrowDown" || event.key === "Tab") {
        // 아래 화살표 키나 Tab 키로 목록 이동
        event.preventDefault(); // 기본 Tab 동작 방지
        currentFocus++;
        if (currentFocus >= items.length) currentFocus = 0; // 마지막 항목에서 다시 첫 번째 항목으로
        addActive(items);
    } else if (event.key === "ArrowUp") {
        // 위 화살표 키로 목록 이동
        currentFocus--;
        if (currentFocus < 0) currentFocus = items.length - 1; // 첫 항목에서 마지막 항목으로
        addActive(items);
    } else if (event.key === "Enter") {
        event.preventDefault();
        // Enter 키를 누르면 검색 실행
        searchTerm();
    }
}

function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("autocomplete-active");

    // 선택된 항목을 입력란에 자동으로 채우지 않고, 원래 입력된 검색어 유지
    document.getElementById('searchInput').value = originalInput;
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
