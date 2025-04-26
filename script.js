let carriers = [];
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const productNameInput = document.getElementById('productName');
    const freezingDegreeInput = document.getElementById('freezingDegree');
    const transportTempInput = document.getElementById('temperatureMode');
    const transportDurationInput = document.getElementById('transportTime');
    const coefficientInput = document.getElementById('coefficient');
    const productWeightInput = document.getElementById('productWeight');
    const productTable = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    const clearTableButton = document.getElementById('clearTableButton');

    document.getElementById("downloadCsvBtn").addEventListener("click", downloadCarrierTable);

    

    function saveProductData() {
        const productData = {
            productName: productNameInput.value,
            freezingDegree: freezingDegreeInput.value,
            transportTemp: transportTempInput.value,
            weight: productWeightInput.value,
            transportDuration: transportDurationInput.value,
            coefficient: coefficientInput.value,
        };

        let data = localStorage.getItem('productData');
        let productDataArray = data ? JSON.parse(data) : [];
        productDataArray.push(productData);
        localStorage.setItem('productData', JSON.stringify(productDataArray));
        productForm.reset();
        displayProductData();
    }

    function displayProductData() {
        productTable.innerHTML = "";
        const data = localStorage.getItem('productData');

        if (data) {
            JSON.parse(data).forEach((productData, index) => {
                let row = productTable.insertRow();
                row.insertCell().innerHTML = index + 1;
                row.insertCell().innerHTML = productData.productName;
                row.insertCell().innerHTML = productData.freezingDegree;
                row.insertCell().innerHTML = productData.transportTemp;
                row.insertCell().innerHTML = productData.weight;
                row.insertCell().innerHTML = productData.transportDuration;
                row.insertCell().innerHTML = productData.coefficient;
            });
        } else {
            let row = productTable.insertRow();
            let cell = row.insertCell();
            cell.colSpan = 6;
            cell.textContent = 'Данные о продукте не найдены.';
        }
    }

    productForm.addEventListener('submit', e => {
        e.preventDefault();
        saveProductData();
    });

    clearTableButton.addEventListener('click', () => {
        localStorage.removeItem('productData');
        displayProductData();
    });

    displayProductData();

    

    

    // База перевозчиков
    const carrierControls = document.getElementById("carrierControls");
    const carrierTableBody = document.querySelector("#carrierTable tbody");

    function renderCarrierTable() {
        carrierTableBody.innerHTML = "";
        carriers.forEach(c => {
            const row = carrierTableBody.insertRow();
            row.insertCell().textContent = c.NP;
            row.insertCell().textContent = Object.entries(c.Kc).map(([k, v]) => `${k}:${v}`).join(', ');
            row.insertCell().textContent = c.Ref.join(', ');
            row.insertCell().textContent = c.rat;
        });
    }

    document.getElementById("addCarrierForm").addEventListener("submit", e => {
        e.preventDefault();
        const form = e.target;
        const newCarrier = {
            NP: form.NP.value,
            Kc: {
                "<500": parseFloat(form.t500.value),
                "<1500": parseFloat(form.t1500.value),
                "<3000": parseFloat(form.t3000.value),
                ">5000": parseFloat(form.t5000.value),
            },
            Ref: form.Ref.value.split(',').map(r => r.trim().toUpperCase()),
            rat: Math.min(Math.max(parseFloat(form.rat.value), 1.1), 5.0)
        };
        carriers.push(newCarrier);
        localStorage.setItem("carCarriers", JSON.stringify(carriers));
        form.reset();
        renderCarrierTable();
    });

    document.getElementById("carrierCsvInput").addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            carriers = [];
            const lines = e.target.result.split('\n').filter(l => l.trim());
            lines.slice(1).forEach(line => {
                const [NP, tariffsRaw, refRaw, ratRaw] = line.split(';');
                const Kc = Object.fromEntries(tariffsRaw.split(',').map(t => {
                    const [range, price] = t.split(':');
                    return [range.trim(), parseFloat(price)];
                }));
                const Ref = refRaw.split(',').map(r => r.trim().toUpperCase());
                const rat = parseFloat(ratRaw);
                carriers.push({ NP, Kc, Ref, rat });
            });
            localStorage.setItem("carCarriers", JSON.stringify(carriers));
            renderCarrierTable();
        };
        reader.readAsText(file);
    });
            const savedCarriers = localStorage.getItem("carCarriers");
            if (savedCarriers) {
                carriers = JSON.parse(savedCarriers);
            }

    renderCarrierTable();

    document.getElementById("toggleCarrierBlock").addEventListener("click", () => {
        const container = document.getElementById("carrierControls");
        const toggleBtn = document.getElementById("toggleCarrierBlock");
        const isVisible = container.style.display === "block";
        container.style.display = isVisible ? "none" : "block";
        toggleBtn.textContent = isVisible ? "➕" : "➖";
    });

});
        //кнопка скачки CSV //
        function downloadCarrierTable() {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Название перевозчика;Тарифы;Классы рефрижераторов;Рейтинг\n";

            carriers.forEach(c => {
                const tariffs = Object.entries(c.Kc).map(([k, v]) => `${k}:${v}`).join(', ');
                const ref = c.Ref.join(', ');
                csvContent += `${c.NP};${tariffs};${ref};${c.rat}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "carriers.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
