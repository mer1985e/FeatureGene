# Tailwind CSS Production Setup

This project now uses Tailwind CSS properly for production instead of the CDN.

## Prerequisites

1. **Install Node.js**: Download and install Node.js from https://nodejs.org/
2. **Verify installation**: Run `node --version` and `npm --version` in your terminal

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Build CSS for Production
```bash
npm run build-css-prod
```


### 3. Development Mode (Optional)
For development with auto-rebuild on file changes:
```bash
npm run build-css
```

## File Structure

```
static/css/
├── input.css          # Tailwind source file
├── tailwind.css       # Built CSS (generated)
├── main.css          # Your custom styles
└── components.css    # Component styles
```

## Customization

Edit `static/css/input.css` to add custom styles or modify Tailwind configuration in `tailwind.config.js`.

## Build Process

The build process:
1. Scans your HTML templates and JS files
2. Extracts only the Tailwind classes you actually use
3. Generates optimized CSS in `static/css/tailwind.css`
4. Minifies for production

Your Flask app will now serve the optimized Tailwind CSS instead of loading from CDN.
