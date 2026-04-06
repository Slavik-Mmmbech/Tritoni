function navigateTo(page) {
    window.location.href = page;
}

const path = window.location.pathname;

if (path.endsWith("main_analysis.html")) {
    setupIdentificationPage();
}
if (path.endsWith("database.html")) {
    setupProjectsPage();
}
if (path.endsWith("add.species.html")) {
    setupCreateCardPage();
}

function setupIdentificationPage() {
    const modeInputs = document.querySelectorAll("input[name='searchMode']");
    const speciesWrap = document.getElementById("speciesWrap");
    const territoryWrap = document.getElementById("territoryWrap");
    const renameNeeded = document.getElementById("renameNeeded");
    const newFilename = document.getElementById("newFilename");
    const runBtn = document.getElementById("runIdentifyBtn");
    const pipelineLog = document.getElementById("pipelineLog");
    const foundResult = document.getElementById("foundResult");
    const notFoundResult = document.getElementById("notFoundResult");
    const simulateNotFound = document.getElementById("simulateNotFound");

    function updateModeFields() {
        const selected = document.querySelector("input[name='searchMode']:checked")?.value;
        speciesWrap.classList.toggle("hidden", selected !== "species");
        territoryWrap.classList.toggle("hidden", selected !== "territory");
    }

    modeInputs.forEach((input) => input.addEventListener("change", updateModeFields));
    updateModeFields();

    renameNeeded.addEventListener("change", () => {
        newFilename.classList.toggle("hidden", !renameNeeded.checked);
    });

    runBtn.addEventListener("click", () => {
        pipelineLog.innerHTML = "";
        foundResult.classList.add("hidden");
        notFoundResult.classList.add("hidden");

        const steps = [
            "Фото загружено и проверено.",
            "YOLO: выделение контуров тритона.",
            "Формирование эмбеддинга признаков.",
            "Сравнение с записями БД."
        ];

        steps.forEach((step, index) => {
            setTimeout(() => {
                const item = document.createElement("li");
                item.textContent = step;
                pipelineLog.appendChild(item);
            }, index * 350);
        });

        setTimeout(() => {
            if (simulateNotFound.checked) {
                notFoundResult.classList.remove("hidden");
                showToast("Обработка завершена: совпадений нет.");
                return;
            }
            foundResult.classList.remove("hidden");
            showToast("Обработка завершена: найдено совпадение.");
        }, steps.length * 350 + 200);
    });
}

function setupProjectsPage() {
    const projectsList = document.getElementById("projectsList");
    const projectCardPanel = document.getElementById("projectCardPanel");
    const historyBox = document.getElementById("historyBox");
    const idSearch = document.getElementById("projectIdSearch");
    const speciesFilter = document.getElementById("speciesFilter");
    const territoryFilter = document.getElementById("territoryFilter");
    const runSearchBtn = document.getElementById("runProjectSearchBtn");
    const clearBtn = document.getElementById("clearProjectSearchBtn");
    const saveBtn = document.getElementById("saveCardBtn");
    const showHistoryBtn = document.getElementById("showHistoryBtn");
    const deleteBtn = document.getElementById("deleteCardBtn");

    const cardId = document.getElementById("cardId");
    const cardSpecies = document.getElementById("cardSpecies");
    const cardTerritory = document.getElementById("cardTerritory");
    const cardNotes = document.getElementById("cardNotes");

    let selectedId = null;
    let projectData = [
        { id: "TR-1001", species: "Triturus cristatus", territory: "Калуга", notes: "Стабильная популяция", history: [] },
        { id: "TR-1002", species: "Lissotriton vulgaris", territory: "Татарстан", notes: "Наблюдение у берега", history: ["22.03: создана карта"] },
        { id: "TR-1003", species: "Triturus dobrogicus", territory: "Воронеж", notes: "Повторный осмотр в апреле", history: [] }
    ];

    function renderList(items) {
        projectsList.innerHTML = "";
        if (!items.length) {
            projectsList.innerHTML = "<p class='subtitle'>Ничего не найдено по текущим условиям.</p>";
            return;
        }
        items.forEach((item) => {
            const el = document.createElement("button");
            el.className = "project-item";
            el.innerHTML = `<strong>${item.id}</strong><br>${item.species} · ${item.territory}`;
            el.addEventListener("click", () => openCard(item.id));
            if (item.id === selectedId) {
                el.classList.add("active");
            }
            projectsList.appendChild(el);
        });
    }

    function applyFilters() {
        const idValue = idSearch.value.trim().toLowerCase();
        const speciesValue = speciesFilter.value.trim().toLowerCase();
        const territoryValue = territoryFilter.value.trim().toLowerCase();
        const filtered = projectData.filter((item) => {
            const idOk = !idValue || item.id.toLowerCase().includes(idValue);
            const speciesOk = !speciesValue || item.species.toLowerCase().includes(speciesValue);
            const territoryOk = !territoryValue || item.territory.toLowerCase().includes(territoryValue);
            return idOk && speciesOk && territoryOk;
        });
        renderList(filtered);
    }

    function openCard(id) {
        const item = projectData.find((project) => project.id === id);
        if (!item) return;
        selectedId = id;
        cardId.value = item.id;
        cardSpecies.value = item.species;
        cardTerritory.value = item.territory;
        cardNotes.value = item.notes;
        historyBox.classList.add("hidden");
        projectCardPanel.classList.remove("hidden");
        applyFilters();
    }

    runSearchBtn.addEventListener("click", applyFilters);
    clearBtn.addEventListener("click", () => {
        idSearch.value = "";
        speciesFilter.value = "";
        territoryFilter.value = "";
        applyFilters();
    });

    saveBtn.addEventListener("click", () => {
        const item = projectData.find((project) => project.id === selectedId);
        if (!item) return;
        item.species = cardSpecies.value.trim();
        item.territory = cardTerritory.value.trim();
        item.notes = cardNotes.value.trim();
        item.history.push(`${new Date().toLocaleDateString("ru-RU")}: обновлены данные карты`);
        applyFilters();
        showToast("Изменения карты сохранены (шаблонно).");
    });

    showHistoryBtn.addEventListener("click", () => {
        const item = projectData.find((project) => project.id === selectedId);
        if (!item) return;
        if (!item.history.length) {
            historyBox.innerHTML = "История изменений отсутствует.";
        } else {
            historyBox.innerHTML = item.history.map((row) => `<div>${row}</div>`).join("");
        }
        historyBox.classList.remove("hidden");
    });

    deleteBtn.addEventListener("click", () => {
        if (!selectedId) return;
        projectData = projectData.filter((item) => item.id !== selectedId);
        selectedId = null;
        projectCardPanel.classList.add("hidden");
        applyFilters();
        showToast("Карта удалена из шаблонного списка.");
    });

    applyFilters();
}

function setupCreateCardPage() {
    const form = document.getElementById("createCardForm");
    const resetBtn = document.getElementById("resetCardFormBtn");
    const previewPanel = document.getElementById("cardPreviewPanel");
    const preview = document.getElementById("cardPreview");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const values = {
            id: document.getElementById("newCardId").value.trim(),
            species: document.getElementById("newCardSpecies").value.trim(),
            territory: document.getElementById("newCardTerritory").value.trim(),
            location: document.getElementById("newCardLocation").value.trim(),
            date: document.getElementById("newCardDate").value,
            photo: document.getElementById("newCardPhoto").files[0]?.name || "не выбрано",
            notes: document.getElementById("newCardNotes").value.trim()
        };

        preview.innerHTML = `
            <p><strong>ID:</strong> ${values.id}</p>
            <p><strong>Вид:</strong> ${values.species}</p>
            <p><strong>Территория:</strong> ${values.territory || "-"}</p>
            <p><strong>Координаты:</strong> ${values.location || "-"}</p>
            <p><strong>Дата:</strong> ${values.date || "-"}</p>
            <p><strong>Фото:</strong> ${values.photo}</p>
            <p><strong>Примечания:</strong> ${values.notes || "-"}</p>
        `;

        previewPanel.classList.remove("hidden");
        showToast("Черновик карты создан.");
    });

    resetBtn.addEventListener("click", () => {
        form.reset();
        previewPanel.classList.add("hidden");
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2100);
}