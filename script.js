// 데이터 로드 함수
async function loadData() {
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
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
