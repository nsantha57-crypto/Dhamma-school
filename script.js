document.addEventListener('DOMContentLoaded', () => {

    // --- NAV & TABS --- //

    window.switchTab = function (tabId) {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const target = document.getElementById(tabId);
        if (target) target.classList.add('active');

        document.querySelectorAll('.nav-links li').forEach(li => {
            li.classList.remove('active');
        });

        // Match active link approximately
        const links = document.querySelectorAll('.nav-links li');
        for (let li of links) {
            if (li.getAttribute('onclick') && li.getAttribute('onclick').includes(tabId)) {
                li.classList.add('active');
                break;
            }
        }
    };

    window.switchSubTab = function (subTabId) {
        document.querySelectorAll('.sub-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(subTabId).classList.add('active');

        document.querySelectorAll('.sub-tab').forEach(btn => {
            btn.classList.remove('active');
        });

        const tabs = document.querySelectorAll('.sub-tab');
        for (let btn of tabs) {
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(subTabId)) {
                btn.classList.add('active');
                break;
            }
        }
    };


    // --- DATA HANDLING --- //

    // Identifiers for table bodies that we want to save
    const editableIds = [
        'teacher-list-body',
        'prefect-list-body',
        'student-list-body',
        'std-att-body',
        'tch-att-body',
        'prf-att-body',
        'flower-list-body'
    ];

    const singleFieldIds = [
        'school-principal-name', 'school-principal-duties',
        'school-vp-name', 'school-vp-duties',
        'role-discipline', 'role-abhidharma', 'role-pali', 'role-prefect-master',
        'prefect-duties'
    ];

    // Also grab all other contenteditable areas by a unique selector if possible.
    // For now, let's just save the main tables.
    // To properly save the "Admin" text fields, we need to locate them.
    // Let's add IDs or Data attributes to them dynamically or save the whole section.
    // Saving the entire innerHTML of a section is risky if structure changes, but for
    // simple text fields it's okay. Let's try to be more specific.
    // Actually, simple strategy: Auto-save ANY change to localStorage using a MutationObserver
    // or input listener on contenteditable elements.

    function saveContent(element) {
        // Generate a path or ID. If no ID, use path index?
        // Simplest: The user only needs tables saved mostly.
        // For admin fields, let's just save by their parent class + index.
    }

    // Load Data
    editableIds.forEach(id => {
        const saved = localStorage.getItem('siridhamma_' + id);
        const el = document.getElementById(id);
        if (saved && el) {
            el.innerHTML = saved;
        } else if (el) {
            // Initial Seed
            if (id === 'prefect-list-body') {
                for (let i = 0; i < 20; i++) window.addRow(id);
            } else if (id !== 'std-att-body' && id !== 'tch-att-body' && id !== 'prf-att-body') {
                // Don't auto-add rows to attendance, start empty
                window.addRow(id);
            }
        }
    });

    singleFieldIds.forEach(id => {
        const saved = localStorage.getItem('siridhamma_' + id);
        const el = document.getElementById(id);
        if (saved && el) {
            el.innerHTML = saved;
        }
    });

    // Save on Input
    document.body.addEventListener('input', (e) => {
        const target = e.target;

        // 1. Check if inside a known table
        const tbody = target.closest('tbody');
        if (tbody && editableIds.includes(tbody.id)) {
            localStorage.setItem('siridhamma_' + tbody.id, tbody.innerHTML);
            return;
        }

        // 2. Check for single fields
        if (target.id && singleFieldIds.includes(target.id)) {
            localStorage.setItem('siridhamma_' + target.id, target.innerHTML);
        } else {
            // If the target is inside a container we track (e.g. UL inside a tracked DIV?)
            // Actually, principal-duties is the UL itself. So editing LI inside it bubbles up.
            const parent = target.closest('[id]');
            if (parent && singleFieldIds.includes(parent.id)) {
                localStorage.setItem('siridhamma_' + parent.id, parent.innerHTML);
            }
        }
    });

    // --- ROW ADDITION --- //

    window.addRow = function (tbodyId) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        const colCount = tbody.parentElement.querySelectorAll('th').length;
        const tr = document.createElement('tr');

        for (let i = 0; i < colCount; i++) {
            const td = document.createElement('td');
            td.contentEditable = "true";
            if (i === 0) {
                td.innerText = tbody.children.length + 1;
            } else {
                td.innerText = ""; // Empty for cleaner look
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
        // Save immediately
        localStorage.setItem('siridhamma_' + tbodyId, tbody.innerHTML);
    };

    window.addAttendanceRow = function (tbodyId) {
        const tbody = document.getElementById(tbodyId);
        const tr = document.createElement('tr');

        const tdDate = document.createElement('td');
        tdDate.innerText = new Date().toISOString().split('T')[0];
        tdDate.contentEditable = "true";
        tr.appendChild(tdDate);

        const tdName = document.createElement('td');
        tdName.innerText = "";
        tdName.contentEditable = "true";
        tr.appendChild(tdName);

        const tdExtra = document.createElement('td'); // Grade/Time/Duty
        tdExtra.innerText = "";
        tdExtra.contentEditable = "true";
        tr.appendChild(tdExtra);

        const tdStatus = document.createElement('td'); // Status
        tdStatus.innerText = "Present";
        tdStatus.contentEditable = "true";
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
        localStorage.setItem('siridhamma_' + tbodyId, tbody.innerHTML);
    };

    window.addGenericRow = function (tbodyId, colCount) {
        const tbody = document.getElementById(tbodyId);
        const tr = document.createElement('tr');
        for (let i = 0; i < colCount; i++) {
            const td = document.createElement('td');
            td.contentEditable = "true";
            td.innerText = "";
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
        localStorage.setItem('siridhamma_' + tbodyId, tbody.innerHTML);
    };


    // --- BACKUP & RESTORE --- //

    window.exportData = function () {
        const data = {};
        // Save tables
        editableIds.forEach(id => {
            data[id] = localStorage.getItem('siridhamma_' + id);
        });
        // Save Single Fields
        singleFieldIds.forEach(id => {
            data[id] = localStorage.getItem('siridhamma_' + id);
        });

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'siridhamma_data_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    window.importData = function (input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                Object.keys(data).forEach(key => {
                    localStorage.setItem('siridhamma_' + key, data[key]);
                });
                alert('Data restored successfully! The page will reload.');
                location.reload();
            } catch (err) {
                alert('Error parsing file: ' + err);
            }
        };
        reader.readAsText(file);
    };

});
