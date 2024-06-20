const vscode = acquireVsCodeApi();

document.getElementById('saveButton').addEventListener('click', () => {
    const table = document.getElementById('jsonTable');
    const jsonData = {};
    for (let i = 1, row; row = table.rows[i]; i++) {
        const key = row.cells[0].innerText;
        const value = row.cells[1].innerText;
        setNestedValue(jsonData, key.split('.'), value);
    }
    vscode.postMessage({ command: 'save', jsonData: JSON.stringify(jsonData, null, 2) });
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