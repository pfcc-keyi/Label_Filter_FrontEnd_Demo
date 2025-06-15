# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Label Filter Application - Local Development Guide

A React-based Excel data filtering application with intelligent label matching and dimension-based filtering.

## 📋 Prerequisites

Before running this application locally, ensure you have the following installed:

### Required Software
- **Node.js** (version 16.x or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version` and `npm --version`
- **VS Code** (recommended)
  - Download from: https://code.visualstudio.com/
- **Git** (for version control)
  - Download from: https://git-scm.com/

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint

## 🚀 Getting Started

### Step 1: Open Project in VS Code

1. **Open VS Code**
2. **Open the project folder**:
   - Method 1: `File` → `Open Folder` → Select `label-filter-app` folder
   - Method 2: Open terminal and navigate to project directory, then run `code .`

### Step 2: Install Dependencies

1. **Open VS Code Terminal**:
   - Press `Ctrl + `` ` (backtick) or `View` → `Terminal`
   - Or use `Terminal` → `New Terminal`

2. **Install project dependencies**:
   ```bash
   npm install
   ```

   This will install all required packages including:
   - React 18
   - TypeScript
   - Vite (build tool)
   - Ant Design (UI components)
   - xlsx (Excel file processing)

### Step 3: Verify Project Structure

Ensure your project structure looks like this:
```
label-filter-app/
├── public/
│   ├── data/
│   │   ├── business_line_labels.txt
│   │   ├── role_labels.txt
│   │   ├── developer_tech_skills_labels.txt
│   │   ├── generic_labels.txt
│   │   └── language_labels.txt
│   ├── sample_data.xlsx
│   └── vite.svg
├── src/
│   ├── components/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Step 4: Start Development Server

1. **Run the development server**:
   ```bash
   npm run dev
   ```

2. **Expected output**:
   ```
   VITE v4.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ➜  press h to show help
   ```

3. **Open the application**:
   - The application will automatically open in your default browser
   - If not, manually navigate to: `http://localhost:5173/`

### Step 5: Verify Application is Running

You should see:
- 📊 **Header**: "Label Filter - Excel Data Intelligent Filtering Tool"
- 📄 **File Upload Section**: Drag & drop area for Excel files
- 🔍 **Filter Builder**: Will appear after uploading data
- 📋 **Results Section**: Will show filtered results

## 🛠️ Available Scripts

In the project directory, you can run:

### `npm run dev`
- Starts the development server
- Hot reload enabled (changes reflect immediately)
- Opens on `http://localhost:5173/`

### `npm run build`
- Builds the app for production
- Creates optimized bundle in `dist/` folder

### `npm run preview`
- Preview the production build locally
- Run after `npm run build`

### `npm run lint`
- Runs ESLint to check code quality
- Identifies potential issues and style problems

## 📁 Key Files and Directories

### Source Code
- **`src/App.tsx`**: Main application component
- **`src/main.tsx`**: Application entry point
- **`src/types/index.ts`**: TypeScript type definitions
- **`src/utils/`**: Utility functions for Excel processing and filtering

### Public Assets
- **`public/data/`**: Label definition files (txt format)
- **`public/sample_data.xlsx`**: Sample Excel file for testing

### Configuration
- **`package.json`**: Project dependencies and scripts
- **`vite.config.ts`**: Vite build configuration
- **`tsconfig.json`**: TypeScript configuration

## 🧪 Testing the Application

### 1. Upload Test Data
- Use the provided `sample_data.xlsx` file
- Or create your own Excel file with columns: `file_name`, `dimension`, `value`

### 2. Apply Filters
- Select labels from the 5 dimension cards
- Logic: Different dimensions = AND, Same dimension labels = OR
- Results update automatically

### 3. Export Results
- Click "Export Results" button to download filtered data as Excel

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Issue: `npm install` fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### Issue: Port 5173 already in use
**Solution:**
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

#### Issue: TypeScript errors
**Solution:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Install missing type definitions
npm install --save-dev @types/node
```

#### Issue: Label files not loading
**Symptoms:** Filter cards show empty or backup data

**Solution:**
1. Verify `public/data/` folder contains all `.txt` files
2. Check browser console for 404 errors
3. Ensure files have proper line breaks and UTF-8 encoding

#### Issue: Excel upload fails
**Symptoms:** "Failed to parse Excel file" error

**Solution:**
1. Ensure file is `.xlsx` or `.xls` format
2. Check file has required columns: `file_name`, `dimension`, `value`
3. Verify file is not corrupted

### Browser Console Debugging

1. **Open Developer Tools**: `F12` or `Ctrl+Shift+I`
2. **Check Console tab** for error messages
3. **Enable debug mode** in the application for detailed logs

## 🔧 Development Tips

### Hot Reload
- Save any file to see changes instantly
- No need to refresh browser manually

### VS Code Integration
- Use `Ctrl+Shift+P` → "TypeScript: Restart TS Server" if IntelliSense stops working
- Install recommended extensions for better development experience

### Debugging
- Use `console.log()` statements in code
- Enable debug mode in application for filter matching details
- Use VS Code debugger with browser integration

## 📱 Browser Compatibility

Tested and supported browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚀 Next Steps

After successfully running locally:
1. **Customize label files** in `public/data/`
2. **Test with your own Excel data**
3. **Deploy to production** using services like Vercel, Netlify, or GitHub Pages

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify all prerequisites are installed
3. Check browser console for detailed error messages
4. Ensure all required files are present in the project structure

---

**Happy coding! 🎉**
