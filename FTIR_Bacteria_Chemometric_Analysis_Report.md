# FTIR Spectroscopic & Chemometric Analysis Report: 45 Bacterial Isolates

> **Dataset:** `FTIR_data.xlsx` | **Spectra Count:** 795 | **Isolates:** 45 | **Taxa:** 20 Species / 9 Genera | **Wavenumber Range:** 3990.17 cm⁻¹ – 499.49 cm⁻¹ (1,811 data points)

---

## 1. Executive Summary & Dataset Overview

Fourier Transform Infrared (FTIR) spectroscopy provides a rapid, non-destructive, whole-cell biochemical "fingerprint" of micro-organisms. This dataset comprises **795 high-resolution FTIR spectra** recorded from **45 unique bacterial isolates** cultured under standardized conditions (BHI medium at 18°C) across biological and technical replicates.

```
       Bacterial FTIR Dataset Architecture
 ┌─────────────────────────────────────────────────┐
 │ 795 Total FTIR Spectra (1,811 Wavenumbers)      │
 ├─────────────────────────────────────────────────┤
 │ 45 Bacterial Isolates (Isolates 1 – 45)         │
 ├─────────────────────────────────────────────────┤
 │ 9 Bacterial Genera:                             │
 │   • Leifsonia (196 spectra)                     │
 │   • Arthrobacter (158 spectra)                  │
 │   • Cryobacterium (98 spectra)                  │
 │   • Salinibacterium (73 spectra)                │
 │   • Pseudomonas (103 spectra)                   │
 │   • Rhodococcus (76 spectra)                    │
 │   • Psychrobacter (55 spectra)                  │
 │   • Paenibacillus (18 spectra)                  │
 │   • Polaromonas (18 spectra)                    │
 └─────────────────────────────────────────────────┘
```

---

## 2. Spectroscopic Biomarker Regions & Spectral Preprocessing

```
   Absorbance
   (a.u.)
     ▲           ┌──────┐ (Amide I 1650 cm⁻¹)
     │           │      │
     │      ┌────┘      └─────┐
     │  ┌───┘                 └───┐  ┌──────┐ (Carbohydrates 1080 cm⁻¹)
     │  │ Lipids (2920)           └──┘      └───┐
   ──┼──┴───────────────────────────────────────┴──► Wavenumber (cm⁻¹)
       4000      3000        1700    1500  1200 900  500
```

### Infrared Absorption Window Breakdown
1. **W1 — Fatty Acids & Lipids (3000 – 2800 cm⁻¹)**
   - Asymmetric and symmetric C-H stretching of $CH_2$ and $CH_3$ groups in cell membrane phospholipids.
2. **W2 — Proteins / Amide I & II (1700 – 1500 cm⁻¹)**
   - **Amide I (~1650 cm⁻¹)**: C=O peptide bond stretching (secondary structure: $\alpha$-helix, $\beta$-sheet).
   - **Amide II (~1540 cm⁻¹)**: N-H bending coupled with C-N stretching of cell wall and intracellular proteins.
3. **W3 — Mixed & Nucleic Acid Region (1500 – 1200 cm⁻¹)**
   - $CH_2$ bending, $PO_2^-$ asymmetric stretching of phosphodiester backbones in DNA/RNA and cell phospholipids.
4. **W4 — Carbohydrates & Cell Wall Polysaccharides (1200 – 900 cm⁻¹)**
   - C-O-C and C-O ring vibrations of peptidoglycan, teichoic acids, and lipopolysaccharides (LPS).

---

## 3. Chemometric & Machine Learning Results

```
                  Classifier Performance (5-Fold CV)
 ┌───────────────────────────┬────────────────┬───────────────────┐
 │ Model                     │ Target         │ Accuracy          │
 ├───────────────────────────┼────────────────┼───────────────────┤
 │ Support Vector Machine    │ Species Taxa   │ ~81.9%            │
 │ Random Forest Classifier  │ Species Taxa   │ ~78.2%            │
 └───────────────────────────┴────────────────┴───────────────────┘
```

### Key Discriminatory Spectral Bands (Feature Importance)
- **1571 cm⁻¹ & 1569 cm⁻¹**: Protein Amide II structural differences across cold-adapted bacterial species.
- **2925 cm⁻¹**: Phospholipid membrane fatty acid acyl chain C-H asymmetric stretching.
- **1687 cm⁻¹**: Protein Amide I β-sheet / antiparallel C=O stretch.

---

## 4. Generated Analysis Outputs & Files

All data files, figures, and exports have been saved to the workspace:

| File Path | Description |
| :--- | :--- |
| [ftir_raw_data.csv](output_ftir/ftir_raw_data.csv) | Full raw dataset with metadata and 1,811 spectral points |
| [ftir_snv_preprocessed.csv](output_ftir/ftir_snv_preprocessed.csv) | Standard Normal Variate (SNV) standardized spectra |
| [ftir_pca_scores.csv](output_ftir/ftir_pca_scores.csv) | Principal Component scores (PC1 to PC5) per sample |
| [ftir_web_data.json](output_ftir/ftir_web_data.json) | Formatted JSON data feed for web dashboard |
| [raw_vs_snv_spectra.png](output_ftir/raw_vs_snv_spectra.png) | Publication plot comparing Raw, SNV, and 2nd Derivative spectra |
| [pca_scores_loadings.png](output_ftir/pca_scores_loadings.png) | PCA score scatter plot and spectral loadings |
| [hca_dendrogram.png](output_ftir/hca_dendrogram.png) | Hierarchical Cluster Analysis dendrogram of 45 isolates |
| [confusion_matrix.png](output_ftir/confusion_matrix.png) | Confusion matrix of species classification model |
| [spectral_biomarker_regions.png](output_ftir/spectral_biomarker_regions.png) | Infrared biomarker region map & discriminatory peaks |

---

## 5. Web Dashboard Access

An interactive single-page application is hosted in your project directory:
- [index.html](index.html) (Live at `http://localhost:8000`)
