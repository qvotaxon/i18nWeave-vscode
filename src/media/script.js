const vscode = acquireVsCodeApi();
const filterInput = document.getElementById('filterInput');
const jsonTable = document.getElementById('jsonTable');
const rows = jsonTable.getElementsByTagName('tr');

document.getElementById('saveButton').addEventListener('click', () => save());

document.addEventListener('keydown', function (event) {
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
            blurFilterInput();
        }
    }
});

filterInput.addEventListener('keyup', function () {
    const filterValue = filterInput.value.toLowerCase();

    const table = document.getElementById('jsonTable');
    for (let i = 1, row; row = table.rows[i]; i++) {
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
});

/**
 * Sets a nested value in an object based on the provided path.
 * 
 * @param {Object} obj - The object to set the value in.
 * @param {Array} path - An array of keys representing the path.
 * @param {string} value - The value to set.
 */
function setNestedValue(obj, path, value) {
    const lastKey = path.pop();
    const lastObj = path.reduce((obj, key) => obj[key] = obj[key] || {}, obj);
    lastObj[lastKey] = value;
}

function save() {
    const table = document.getElementById('jsonTable');
    const jsonData = {};
    for (let i = 1, row; row = table.rows[i]; i++) {
        const key = row.cells[0].innerText;
        const value = row.cells[1].innerText;
        setNestedValue(jsonData, key.split('.'), value);
    }
    vscode.postMessage({ command: 'save', jsonData: JSON.stringify(jsonData, null, 2) });
}

function focusFilterInput() {
    filterInput.focus();
}

function blurFilterInput() {
    filterInput.blur();
}

function clearFilterInput() {
    filterInput.value = '';
    filterInput.dispatchEvent(new Event('keyup'));
}