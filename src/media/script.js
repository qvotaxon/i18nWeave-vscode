const vscode = acquireVsCodeApi();
const filterInput = document.getElementById('filterInput');
const jsonTable = document.getElementById('jsonTable');
const rows = jsonTable.getElementsByTagName('tr');

document.getElementById('saveButton').addEventListener('click', save);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
filterInput.addEventListener('keyup', handleFilterInput);

function save() {
    const table = document.getElementById('jsonTable');
    const jsonData = {};
    for (let i = 1; i < table.rows.length; i++) {
        const key = table.rows[i].cells[0].innerText;
        const value = table.rows[i].cells[1].innerText;
        setNestedValue(jsonData, key.split('.'), value);
    }
    vscode.postMessage({ command: 'save', jsonData: JSON.stringify(jsonData, null, 2) });
}

function handleKeyDown(event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        save();
    }

    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        focusFilterInput();
    }

    if (event.key === 'Escape') {
        event.preventDefault();

        if (filterInput === document.activeElement) {
            clearFilterInput();
        }
    }
}

function handleDOMContentLoaded() {
    focusFilterInput();
    styleTableRows();
}

function handleFilterInput() {
    const filterValue = filterInput.value.toLowerCase();

    for (let i = 1; i < rows.length; i++) {
        const keyColumn = rows[i].getElementsByTagName('td')[0];
        const valueColumn = rows[i].getElementsByTagName('td')[1];

        if (
            keyColumn.innerHTML.toLowerCase().indexOf(filterValue) > -1 ||
            valueColumn.innerHTML.toLowerCase().indexOf(filterValue) > -1
        ) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }

    styleTableRows();
}

function setNestedValue(obj, path, value) {
    const lastKey = path.pop();
    const lastObj = path.reduce((obj, key) => obj[key] = obj[key] || {}, obj);
    lastObj[lastKey] = value;
}

function focusFilterInput() {
    filterInput.focus();
}

function clearFilterInput() {
    filterInput.value = '';
    filterInput.dispatchEvent(new Event('keyup'));
}

function styleTableRows() {
    let styledRowCount = 0;
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        const keyColumn = row.getElementsByTagName('td')[0];
        const valueColumn = row.getElementsByTagName('td')[1];

        if (row.style.display !== 'none') {
            keyColumn.style.backgroundColor = styledRowCount % 2 === 0 ? 'var(--vscode-tab-inactiveBackground)' : 'var(--vscode-tab-activeBackground)';
            valueColumn.style.backgroundColor = styledRowCount % 2 === 0 ? 'var(--vscode-tab-inactiveBackground)' : 'var(--vscode-tab-activeBackground)';
            styledRowCount++;
        }
    }
}
