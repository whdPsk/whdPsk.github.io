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

    // `data.json`에서 직접 데이터를 가져와서 예상 검색어로 사용
    const data = await loadData();
    const suggestions = data.map(entry => entry.term); // 데이터의 'term' 필드만 사용
    const filteredSuggestions = suggestions.filter(term => term.toLowerCase().includes(searchInput));

    if (filteredSuggestions.length > 0) {
        suggestionsDiv.innerHTML = '';
        filteredSuggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.textContent = suggestion;
            div.onclick = function() {
                document.getElementById('searchInput').value = suggestion;
                suggestionsDiv.style.display = 'none';
            };
            suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

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
