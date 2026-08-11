// FTIR Dashboard Client Application

let globalData = null;
let spectralChartInstance = null;
let overviewChartInstance = null;
let pcaScoreChartInstance = null;
let pcaLoadingChartInstance = null;

const GENUS_COLORS = {
    "Art": "#3b82f6",
    "Cry": "#8b5cf6",
    "Lei": "#10b981",
    "Pae": "#f59e0b",
    "Pol": "#ec4899",
    "Pse": "#06b6d4",
    "Psy": "#f43f5e",
    "Rho": "#84cc16",
    "Sal": "#a855f7"
};

document.addEventListener("DOMContentLoaded", async () => {
    initTabNavigation();
    await loadData();
    if (globalData) {
        initOverviewChart();
        initSpectralViewer();
        initPCACharts();
    }
});

function initTabNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const pages = document.querySelectorAll(".tab-page");
    const pageTitle = document.getElementById("page-title");
    const pageDesc = document.getElementById("page-desc");

    const titles = {
        "overview": { title: "Dataset Overview", desc: "FTIR spectral analysis of 45 bacterial isolates cultured at 18°C on BHI medium" },
        "spectral": { title: "Interactive Spectral Viewer", desc: "Absorbance vs Wavenumber (4000 - 500 cm⁻¹) with SNV & 2nd derivative filtering" },
        "pca": { title: "Principal Component Analysis (PCA)", desc: "Unsupervised dimensionality reduction and spectral loading weights" },
        "clustering": { title: "Taxonomy & HCA Dendrogram", desc: "Hierarchical Cluster Analysis of 45 bacterial isolates" },
        "machinelearning": { title: "Machine Learning & Biomarkers", desc: "Classification accuracy models and discriminatory infrared absorption bands" },
        "downloads": { title: "Data Export & Downloads", desc: "Download preprocessed CSV datasets and structured JSON feeds" }
    };

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetTab = item.getAttribute("data-tab");
            navItems.forEach(n => n.classList.remove("active"));
            pages.forEach(p => p.classList.remove("active"));

            item.classList.add("active");
            document.getElementById(`${targetTab}-tab`).classList.add("active");

            if (titles[targetTab]) {
                pageTitle.textContent = titles[targetTab].title;
                pageDesc.textContent = titles[targetTab].desc;
            }
        });
    });
}

async function loadData() {
    try {
        const response = await fetch("output_ftir/ftir_web_data.json");
        if (!response.ok) throw new Error("JSON file not found");
        globalData = await response.json();
        console.log("Loaded web dataset:", globalData);
        populateGenusDropdown();
    } catch (err) {
        console.warn("Could not fetch output_ftir/ftir_web_data.json directly, initializing fallback sample view.", err);
    }
}

function populateGenusDropdown() {
    const select = document.getElementById("genus-select");
    if (!globalData || !globalData.isolate_means) return;

    const genera = new Set();
    Object.values(globalData.isolate_means).forEach(item => genera.add(item.genus));

    select.innerHTML = '<option value="ALL">All Genera (Overlay)</option>';
    Array.from(genera).sort().forEach(gen => {
        const opt = document.createElement("option");
        opt.value = gen;
        opt.textContent = `Genus: ${gen}`;
        select.appendChild(opt);
    });
}

// 1. Overview Chart
function initOverviewChart() {
    const ctx = document.getElementById("overviewTaxaChart")?.getContext("2d");
    if (!ctx || !globalData || !globalData.taxa_counts) return;

    const labels = Object.keys(globalData.taxa_counts);
    const data = Object.values(globalData.taxa_counts);

    overviewChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Spectra Count",
                data: data,
                backgroundColor: labels.map(label => {
                    const gen = label.split(" ")[0];
                    return GENUS_COLORS[gen] || "#3b82f6";
                }),
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: "#232f48" },
                    ticks: { color: "#94a3b8", font: { size: 10 }, rotation: 45 }
                },
                y: {
                    grid: { color: "#232f48" },
                    ticks: { color: "#94a3b8" }
                }
            }
        }
    });
}

// 2. Interactive Spectral Viewer
function initSpectralViewer() {
    const ctx = document.getElementById("spectralChart")?.getContext("2d");
    if (!ctx || !globalData) return;

    const prepSelect = document.getElementById("prep-select");
    const genusSelect = document.getElementById("genus-select");
    const regionSelect = document.getElementById("region-highlight");

    function renderSpectralChart() {
        const mode = prepSelect.value;
        const selectedGenus = genusSelect.value;
        const region = regionSelect.value;

        let wavenumbers = globalData.wavenumbers;
        let datasets = [];

        // Build datasets from isolate_means
        Object.values(globalData.isolate_means).forEach(iso => {
            if (selectedGenus !== "ALL" && iso.genus !== selectedGenus) return;

            let yValues = iso.mean_snv;
            if (mode === "raw") yValues = iso.mean_raw;
            if (mode === "deriv2") yValues = iso.mean_deriv2;

            // Subsample for fast Chart.js rendering (every 4th point)
            const step = 4;
            const subW = [];
            const subY = [];

            for (let i = 0; i < wavenumbers.length; i += step) {
                const w = wavenumbers[i];
                // Region filter
                if (region === "w1" && (w < 2800 || w > 3000)) continue;
                if (region === "w2" && (w < 1500 || w > 1700)) continue;
                if (region === "w3" && (w < 1200 || w > 1500)) continue;
                if (region === "w4" && (w < 900 || w > 1200)) continue;

                subW.push(w);
                subY.push(yValues[i]);
            }

            datasets.push({
                label: `Iso ${iso.isolate} (${iso.taxon})`,
                data: subY,
                borderColor: GENUS_COLORS[iso.genus] || "#3b82f6",
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.1
            });
        });

        // Wavenumber labels
        let displayWavenumbers = wavenumbers.filter((_, i) => i % 4 === 0);
        if (region === "w1") displayWavenumbers = displayWavenumbers.filter(w => w >= 2800 && w <= 3000);
        if (region === "w2") displayWavenumbers = displayWavenumbers.filter(w => w >= 1500 && w <= 1700);
        if (region === "w3") displayWavenumbers = displayWavenumbers.filter(w => w >= 1200 && w <= 1500);
        if (region === "w4") displayWavenumbers = displayWavenumbers.filter(w => w >= 900 && w <= 1200);

        if (spectralChartInstance) spectralChartInstance.destroy();

        spectralChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: displayWavenumbers,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'nearest', intersect: false },
                plugins: {
                    legend: {
                        display: datasets.length <= 15,
                        position: 'top',
                        labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } }
                    }
                },
                scales: {
                    x: {
                        reverse: true, // FTIR standard: high to low wavenumber
                        grid: { color: "#232f48" },
                        ticks: { color: "#94a3b8", maxTicksLimit: 12 },
                        title: { display: true, text: 'Wavenumber (cm⁻¹)', color: '#f8fafc' }
                    },
                    y: {
                        grid: { color: "#232f48" },
                        ticks: { color: "#94a3b8" },
                        title: { display: true, text: mode.toUpperCase() + ' Intensity', color: '#f8fafc' }
                    }
                }
            }
        });
    }

    prepSelect.addEventListener("change", renderSpectralChart);
    genusSelect.addEventListener("change", renderSpectralChart);
    regionSelect.addEventListener("change", renderSpectralChart);

    renderSpectralChart();
}

// 3. PCA Score and Loading Charts
function initPCACharts() {
    const scoreCtx = document.getElementById("pcaScoreChart")?.getContext("2d");
    const loadingCtx = document.getElementById("pcaLoadingChart")?.getContext("2d");

    if (!globalData || !globalData.pca) return;

    const pca = globalData.pca;

    // Group score points by Genus
    const genusScores = {};
    pca.scores.forEach(s => {
        if (!genusScores[s.genus]) genusScores[s.genus] = [];
        genusScores[s.genus].push({ x: s.pc1, y: s.pc2, label: `Iso ${s.isolate}: ${s.taxon}` });
    });

    const scoreDatasets = Object.keys(genusScores).map(gen => ({
        label: `Genus: ${gen}`,
        data: genusScores[gen],
        backgroundColor: GENUS_COLORS[gen] || "#3b82f6",
        pointRadius: 4,
        pointHoverRadius: 7
    }));

    if (pcaScoreChartInstance) pcaScoreChartInstance.destroy();
    pcaScoreChartInstance = new Chart(scoreCtx, {
        type: "scatter",
        data: { datasets: scoreDatasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8', boxWidth: 10 } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw.label} (PC1: ${ctx.raw.x}, PC2: ${ctx.raw.y})`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: `PC1 (${pca.pc1_var}% var)`, color: '#f8fafc' },
                    grid: { color: "#232f48" },
                    ticks: { color: "#94a3b8" }
                },
                y: {
                    title: { display: true, text: `PC2 (${pca.pc2_var}% var)`, color: '#f8fafc' },
                    grid: { color: "#232f48" },
                    ticks: { color: "#94a3b8" }
                }
            }
        }
    });

    // Loadings Plot
    const step = 4;
    const subW = globalData.wavenumbers.filter((_, i) => i % step === 0);
    const pc1Load = pca.loadings.pc1.filter((_, i) => i % step === 0);
    const pc2Load = pca.loadings.pc2.filter((_, i) => i % step === 0);

    if (pcaLoadingChartInstance) pcaLoadingChartInstance.destroy();
    pcaLoadingChartInstance = new Chart(loadingCtx, {
        type: "line",
        data: {
            labels: subW,
            datasets: [
                { label: `PC1 Loading (${pca.pc1_var}%)`, data: pc1Load, borderColor: '#3b82f6', borderWidth: 1.5, pointRadius: 0 },
                { label: `PC2 Loading (${pca.pc2_var}%)`, data: pc2Load, borderColor: '#f43f5e', borderWidth: 1.5, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8' } }
            },
            scales: {
                x: {
                    reverse: true,
                    grid: { color: "#232f48" },
                    ticks: { color: "#94a3b8", maxTicksLimit: 10 },
                    title: { display: true, text: 'Wavenumber (cm⁻¹)', color: '#f8fafc' }
                },
                y: {
                    grid: { color: "#232f48" },
                    ticks: { color: "#94a3b8" },
                    title: { display: true, text: 'Loading Weight', color: '#f8fafc' }
                }
            }
        }
    });
}
