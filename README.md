# Latinismi Search Interface

A simple web-based interface to search and explore metadata from the **Latinismi** dataset. Supports field-based filtering, advanced search syntax, and expandable long entries.

---



## 📁 Project Structure

```plaintext
latinismi-search/
├── index.html           # Main HTML interface
├── style.css            # CSS styling for the table and layout
├── search.js            # JavaScript logic for loading data, filtering, and rendering
├── README.md            # Project documentation (this file)
└── data/
    └── latinismi.tsv   # Excel-exported TSV data file with headers

---

---

## ✨ Features

- Dynamic dropdowns based on dataset fields
- Range-aware filtering (e.g. Volume 1–5)
- Wildcard and phrase search support
- Expandable cells for long entries
- Direct links to scanned PDF articles

---

## 🔍 Searchable Fields

Only fields present and populated in the TSV file are included:

- **Titolo articolo** (free-text search)
- **Volume** (dropdown)
- **Fascicolo** (dropdown)
- **Data pubbl.** (dropdown)
- **Nr. col. inizio** (dropdown)
- **Nr. col. fine** (dropdown)
- **Autore1** (dropdown)

> Note: Fields such as `Autore2`, `Settore`, `Lingua`, etc., are excluded if found empty across the dataset.

---

## ✅ Usage Instructions

1. Place your `Latinismi.tsv` file in the `data/` directory.
2. Open `index.html` in your browser.
3. Use the form to filter by metadata fields or enter search queries.
4. Click the 🔗 icon to open the corresponding article scan.

---

## 🔤 Search Syntax

- `"exact phrase"` → Matches exact phrase
- `fide*` → Matches wildcard (e.g., `fides`, `fidelis`)
- Combine dropdowns and text fields for narrow filtering

---

## ⚙️ Customization

To add or remove search fields:

- **`populateDropdowns()`** in `script.js`:
  Updates dropdown content for fields like Volume, Fascicolo, etc.

- **`runSearch()`** in `script.js`:
  Controls which fields are queried during search.

- **`index.html`**:
  Add or remove search fields in the HTML form.

---

## 🧪 Technical Notes

- The TSV is parsed client-side with tab (`\t`) separators.
- Fields with empty values or placeholder `?` are removed from dropdowns.

---

## 👨‍💻 Developers

Created as part of the **LEI Digitale** project.

- Developer: Abhiroop Basak  
- Team: *Lessico Etimologico Italiano* (LEI)

---

## 📜 License

For academic and internal use only.  
Contact the LEI editorial team for external distribution or reuse.

