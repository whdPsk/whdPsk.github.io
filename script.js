let currentFocus = -1;  // 현재 포커스된 추천 검색어의 인덱스
let originalInput = '';  // 사용자가 처음 입력한 검색어를 저장하기 위한 변수



// 새 용어 추가 함수
async function addNewEntry() {
    const term = document.getElementById('newTerm').value;
    const definition = document.getElementById('newDefinition').value;
    const imageUpload = document.getElementById('imageUpload').files[0];

    if (term && definition) {
        let imageUrl = '';

        if (imageUpload) {
            const storageRef = storage.ref().child('images/' + imageUpload.name);
            const snapshot = await storageRef.put(imageUpload);
            imageUrl = await snapshot.ref.getDownloadURL();
        }

        db.collection("dictionary").add({
            term: term,
            definition: definition,
            imageUrl: imageUrl
        })
        .then(() => {
            console.log("Entry added successfully");
            loadEntries();  // 새로고침 없이 추가된 내용을 표시하기 위해 데이터를 다시 로드합니다.
            toggleAddEntryForm();  // 단어 추가 폼을 다시 숨깁니다.
        })
        .catch((error) => {
            console.error("Error adding entry: ", error);
        });
    } else {
        alert("Please enter both term and definition.");
    }
}

// 새 용어 추가 폼을 보이거나 숨기는 함수
function toggleAddEntryForm() {
    const addEntryForm = document.getElementById('addEntryForm');
    if (addEntryForm.style.display === 'none') {
        addEntryForm.style.display = 'block';
    } else {
        addEntryForm.style.display = 'none';
    }
}

// 기존 용어 목록 로드 함수
function loadEntries() {
    const entriesDiv = document.getElementById('entries');
    entriesDiv.innerHTML = '';  // 기존 내용을 초기화합니다.

    db.collection("dictionary").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const entry = doc.data();
            const entryDiv = document.createElement('div');
            entryDiv.textContent = `${entry.term}: ${entry.definition}`;
            
            if (entry.imageUrl) {
                const img = document.createElement('img');
                img.src = entry.imageUrl;
                img.style.maxWidth = '100%';
                entryDiv.appendChild(img);
            }

            // 수정 및 삭제 버튼 추가
            const editButton = document.createElement('button');
            editButton.textContent = "Edit";
            editButton.onclick = () => editEntry(doc.id, entry.term, entry.definition, entry.imageUrl);
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteEntry(doc.id);

            entryDiv.appendChild(editButton);
            entryDiv.appendChild(deleteButton);
            entriesDiv.appendChild(entryDiv);
        });
    });
}

// 용어 수정 함수
function editEntry(id, term, oldDefinition, oldImageUrl) {
    const newDefinition = prompt(`Edit definition for ${term}:`, oldDefinition);
    
    if (newDefinition !== null) {
        const imageUpload = document.getElementById('imageUpload').files[0];
        let imageUrl = oldImageUrl;

        if (imageUpload) {
            const storageRef = storage.ref().child('images/' + imageUpload.name);
            storageRef.put(imageUpload).then(snapshot => {
                snapshot.ref.getDownloadURL().then(url => {
                    imageUrl = url;
                    updateEntry(id, newDefinition, imageUrl);
                });
            });
        } else {
            updateEntry(id, newDefinition, imageUrl);
        }
    }
}

function updateEntry(id, newDefinition, imageUrl) {
    db.collection("dictionary").doc(id).update({
        definition: newDefinition,
        imageUrl: imageUrl
    })
    .then(() => {
        console.log("Entry updated successfully");
        loadEntries();
    })
    .catch((error) => {
        console.error("Error updating entry: ", error);
    });
}

// 용어 삭제 함수
function deleteEntry(id) {
    if (confirm("Are you sure you want to delete this entry?")) {
        db.collection("dictionary").doc(id).delete()
        .then(() => {
            console.log("Entry deleted successfully");
            loadEntries();
        })
        .catch((error) => {
            console.error("Error deleting entry: ", error);
        });
    }
}

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
        suggestionsDiv.innerHTML = '';  // 기존 추천 검색어 목록을 초기화
        filteredSuggestions.forEach((suggestion, index) => {
            // 여기서 suggestionDiv 변수를 선언합니다.
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = suggestion;
            suggestionDiv.setAttribute('data-index', index);

            // 마우스 클릭 이벤트 추가
            suggestionDiv.addEventListener('click', function() {
                document.getElementById('searchInput').value = suggestion;
                suggestionsDiv.style.display = 'none';
                currentFocus = -1;  // 포커스를 초기화하여 Tab 탐색이 처음부터 다시 시작되도록 설정
                searchTerm();  // 추천 검색어를 클릭하면 바로 검색 실행
            });

            suggestionsDiv.appendChild(suggestionDiv);
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
        addActive(items);  // 추천 검색어 항목을 활성화
    } else if (event.key === "ArrowUp") {
        // 위 화살표 키로 목록 이동
        event.preventDefault(); // 기본 Tab 동작 방지
        currentFocus--;
        if (currentFocus < 0) currentFocus = items.length - 1; // 첫 항목에서 마지막 항목으로 이동
        addActive(items);  // 추천 검색어 항목을 활성화
    } else if (event.key === "Control") {
        // Ctrl 키를 눌렀을 때만 검색창에 입력
        if (currentFocus > -1 && items.length > 0) {
            document.getElementById('searchInput').value = items[currentFocus].textContent;
        }
    } else if (event.key === "Enter") {
        // Enter 키로 검색 실행
        event.preventDefault();
        searchTerm();
    }
}

function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0; // 포커스가 마지막을 넘어서면 처음으로 돌아감
    if (currentFocus < 0) currentFocus = items.length - 1; // 포커스가 처음을 넘어서면 마지막으로 이동
    items[currentFocus].classList.add("autocomplete-active");

    // 선택된 항목을 입력란에 자동으로 채우기 (Ctrl 키를 누르지 않는 한 이 부분은 실행되지 않음)
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

// 페이지가 로드될 때 기존 항목을 로드합니다.
window.onload = loadEntries;
