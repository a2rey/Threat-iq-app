export function renderTableReport(data, container) {
    // Helper function to render an object as a table
    function renderTable(obj) {
        let rows = '';
        for (const key in obj) {
        let value = obj[key];
        if (typeof value === 'object' && !Array.isArray(value)) {
            value = renderTable(value); // Nested object as a nested table
        } else if (Array.isArray(value)) {
            value = value.join(', ');
        }
        rows += `<tr><th>${key}</th><td>${value}</td></tr>`;
        }
        return `<table>${rows}</table>`;
    }

    // Render main sections
    function renderJSONtoTable(data) {
        let html = '';
        for (const section in data) {
        html += `
            <div class="section">
            <h3>${section}</h3>
            ${renderTable(data[section])}
            </div>
        `;
        }
        return html;
    }
    container.innerHTML = renderJSONtoTable(data);
}
