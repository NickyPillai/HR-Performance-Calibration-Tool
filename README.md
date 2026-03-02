# 🚀 AI-Powered Performance Calibration Tool
**Bridging the gap between manual appraisals and data-driven leadership.**

## 📌 The Problem
Many HR leaders and executives operate in a "data vacuum" during appraisal cycles. Without expensive, enterprise-level HRMS platforms, there is a total **lack of visibility** into organization-wide performance trends. This leads to:
- Significant **deviations** from pre-planned appraisal budgets/marks.
- Unidentified bias across different departments.
- No centralized "Eagle Eye" view to perform real-time course correction.

## 🎯 Product Vision
To provide an intuitive, high-level workspace for HR managers and leadership who lack sophisticated performance tools. This platform transforms fragmented appraisal data into a strategic dashboard, allowing for instant identification of rating inflation or deflation and facilitating immediate alignment with organizational goals.

## ✨ The Solution
A lightweight SaaS prototype designed for rapid decision-making:
- **Eagle Eye Dashboard:** Instant visualization of all ratings against pre-set thresholds.
- **Departmental Deep-Dives:** Identify specific teams needing course correction to maintain grading parity.
- **Real-Time Calibration:** Update ratings on the fly and export "Audit-Ready" reports for stakeholder review.

---

## 🏗 Tech Stack & Architecture (High-Level)
Built with a "Product-Led" mindset, focusing on speed-to-market and user experience:

- **Frontend:** Next.js (React) for a fast, responsive interface.
- **Deployment:** Vercel (Cloud Hosting) for seamless CI/CD.
- **Data Handling:** JSON-based state management for secure, client-side data processing.
- **AI Integration:** Leveraging LLM-driven prompting (Claude) to summarize calibration trends and suggest corrective actions.



---

## 📈 Impact & Metrics
By implementing this calibration layer, organizations can achieve:
- **100% Visibility:** Total transparency into appraisal deviations across the entire hierarchy.
- **Reduced Merit Blur:** A projected **25% improvement** in rating accuracy by aligning manager inputs with pre-set organizational curves.
- **Operational Efficiency:** Slashed the time spent on manual "Report Consolidation" from days to minutes.

---
**Author:** Nicky Pillai | Product Manager



# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
