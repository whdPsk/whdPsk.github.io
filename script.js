let currentFocus = -1;  // 현재 포커스된 추천 검색어의 인덱스
let originalInput = '';  // 사용자가 처음 입력한 검색어를 저장하기 위한 변수

// 예상 검색어 데이터 로드 함수
async function loadSuggestions() {
    const response = await fetch('data.json');  // data.json을 사용
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
    const filteredSuggestions = suggestions.filter(term => term.toLowerCase().includes(originalInput)); // 원래 검색어로 필터링

    if (filteredSuggestions.length > 0) {
        suggestionsDiv.innerHTML = '';
        filteredSuggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.textContent = suggestion;
            div.setAttribute('data-index', index);

            // 마우스 클릭 이벤트 추가
            div.addEventListener('click', function() {
                document.getElementById('searchInput').value = suggestion;
                suggestionsDiv.style.display = 'none';
                currentFocus = -1;  // 포커스를 초기화하여 Tab 탐색이 처음부터 다시 시작되도록 설정
            });

            suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = 'block';

        currentFocus = -1;  // 포커스를 초기화하여 검색어 입력만 했을 때는 선택되지 않도록
    } else {
        suggestionsDiv.style.display = 'none';
    }
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
        event.preventDefault(); // 기본 Tab 동작 방지
        currentFocus--;
        if (currentFocus < 0) currentFocus = items.length - 1; // 첫 항목에서 마지막 항목으로
        addActive(items);
    } else if (event.key === "Enter") {
        event.preventDefault();
        if (currentFocus > -1 && items.length > 0) {
            // 추천 검색어를 선택한 상태에서 Enter를 누르면 해당 항목이 입력란에 채워짐
            document.getElementById('searchInput').value = items[currentFocus].textContent;
            searchTerm();  // Enter 키를 누르면 검색 실행
        }
    }
}

function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0; // 포커스가 마지막을 넘어서면 처음으로 돌아감
    if (currentFocus < 0) currentFocus = items.length - 1; // 포커스가 처음을 넘어서면 마지막으로 이동
    items[currentFocus].classList.add("autocomplete-active");

    // 선택된 항목을 입력란에 자동으로 채우기
    document.getElementById('searchInput').value = items[currentFocus].textContent;
}

function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("autocomplete-active");
    }
}

document.getElementById('searchInput').addEventListener('keydown', handleKeyDown);

// 검색 함수 - 새로운 페이지로 이동하여 결과 출력
function searchTerm() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    
    // 추천 검색어 박스 숨기기
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.style.display = 'none';
    suggestionsDiv.innerHTML = ''; // 추천 검색어 내용도 초기화

    if (searchInput) {
        // 검색어를 URL 파라미터로 전달하여 새로운 페이지로 이동
        window.location.href = `result.html?query=${encodeURIComponent(searchInput)}`;
    }
}
