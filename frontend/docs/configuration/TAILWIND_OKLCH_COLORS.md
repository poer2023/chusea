# Tailwind CSS v4.0 + OKLCH Color System

This project uses **Tailwind CSS v4.0** with a comprehensive **OKLCH color system** that provides superior color accuracy, accessibility, and dark mode support.

## 🎨 Color System Overview

### OKLCH Color Format
```css
oklch(L C H [/ A])
```
- **L (Lightness)**: 0-1 (0 = black, 1 = white)
- **C (Chroma)**: 0-0.4+ (0 = gray, higher = more vivid)
- **H (Hue)**: 0-360 degrees
- **A (Alpha)**: 0-1 (optional, for transparency)

### Advantages of OKLCH
✅ **Perceptually uniform** - Equal lightness values appear equally bright  
✅ **Better color accuracy** - More accurate than RGB/HSL  
✅ **Accessibility-friendly** - Easier to maintain proper contrast ratios  
✅ **Future-proof** - Modern color space supported by latest browsers  

## 🎨 Color Scales

All colors follow a consistent 50-950 scale for maximum flexibility:

### Primary Colors (Blue)
```css
--primary-50:  oklch(0.97 0.02 250)  /* Very light blue */
--primary-100: oklch(0.93 0.05 250)  /* Light blue */
--primary-200: oklch(0.87 0.08 250)  /* Lighter blue */
--primary-300: oklch(0.78 0.12 250)  /* Light-medium blue */
--primary-400: oklch(0.68 0.16 250)  /* Medium-light blue */
--primary-500: oklch(0.58 0.20 250)  /* Base primary blue */
--primary-600: oklch(0.48 0.18 250)  /* Medium-dark blue */
--primary-700: oklch(0.38 0.16 250)  /* Dark blue */
--primary-800: oklch(0.28 0.12 250)  /* Darker blue */
--primary-900: oklch(0.18 0.08 250)  /* Very dark blue */
--primary-950: oklch(0.10 0.04 250)  /* Darkest blue */
```

### Secondary Colors (Slate/Gray)
```css
--secondary-50:  oklch(0.98 0.01 250)  /* Very light gray */
--secondary-100: oklch(0.95 0.01 250)  /* Light gray */
--secondary-200: oklch(0.90 0.01 250)  /* Lighter gray */
--secondary-300: oklch(0.83 0.02 250)  /* Light-medium gray */
--secondary-400: oklch(0.70 0.02 250)  /* Medium-light gray */
--secondary-500: oklch(0.55 0.02 250)  /* Base secondary gray */
--secondary-600: oklch(0.42 0.02 250)  /* Medium-dark gray */
--secondary-700: oklch(0.32 0.02 250)  /* Dark gray */
--secondary-800: oklch(0.22 0.01 250)  /* Darker gray */
--secondary-900: oklch(0.15 0.01 250)  /* Very dark gray */
--secondary-950: oklch(0.08 0.01 250)  /* Darkest gray */
```

### Accent Colors (Purple)
```css
--accent-50:  oklch(0.97 0.02 280)  /* Very light purple */
--accent-100: oklch(0.92 0.05 280)  /* Light purple */
--accent-200: oklch(0.85 0.08 280)  /* Lighter purple */
--accent-300: oklch(0.75 0.12 280)  /* Light-medium purple */
--accent-400: oklch(0.65 0.16 280)  /* Medium-light purple */
--accent-500: oklch(0.55 0.20 280)  /* Base accent purple */
--accent-600: oklch(0.45 0.18 280)  /* Medium-dark purple */
--accent-700: oklch(0.35 0.16 280)  /* Dark purple */
--accent-800: oklch(0.25 0.12 280)  /* Darker purple */
--accent-900: oklch(0.18 0.08 280)  /* Very dark purple */
--accent-950: oklch(0.10 0.04 280)  /* Darkest purple */
```

### Success Colors (Green)
```css
--success-50:  oklch(0.97 0.02 140)  /* Very light green */
--success-100: oklch(0.92 0.05 140)  /* Light green */
--success-200: oklch(0.86 0.08 140)  /* Lighter green */
--success-300: oklch(0.78 0.12 140)  /* Light-medium green */
--success-400: oklch(0.68 0.15 140)  /* Medium-light green */
--success-500: oklch(0.58 0.18 140)  /* Base success green */
--success-600: oklch(0.48 0.16 140)  /* Medium-dark green */
--success-700: oklch(0.38 0.14 140)  /* Dark green */
--success-800: oklch(0.28 0.10 140)  /* Darker green */
--success-900: oklch(0.20 0.08 140)  /* Very dark green */
--success-950: oklch(0.12 0.04 140)  /* Darkest green */
```

### Warning Colors (Orange/Yellow)
```css
--warning-50:  oklch(0.98 0.02 60)   /* Very light orange */
--warning-100: oklch(0.94 0.05 60)   /* Light orange */
--warning-200: oklch(0.88 0.08 60)   /* Lighter orange */
--warning-300: oklch(0.80 0.12 60)   /* Light-medium orange */
--warning-400: oklch(0.72 0.15 60)   /* Medium-light orange */
--warning-500: oklch(0.64 0.18 60)   /* Base warning orange */
--warning-600: oklch(0.56 0.16 60)   /* Medium-dark orange */
--warning-700: oklch(0.46 0.14 60)   /* Dark orange */
--warning-800: oklch(0.36 0.10 60)   /* Darker orange */
--warning-900: oklch(0.26 0.08 60)   /* Very dark orange */
--warning-950: oklch(0.16 0.04 60)   /* Darkest orange */
```

### Error Colors (Red)
```css
--error-50:  oklch(0.97 0.02 20)    /* Very light red */
--error-100: oklch(0.92 0.05 20)    /* Light red */
--error-200: oklch(0.86 0.08 20)    /* Lighter red */
--error-300: oklch(0.78 0.12 20)    /* Light-medium red */
--error-400: oklch(0.68 0.15 20)    /* Medium-light red */
--error-500: oklch(0.58 0.18 20)    /* Base error red */
--error-600: oklch(0.48 0.16 20)    /* Medium-dark red */
--error-700: oklch(0.38 0.14 20)    /* Dark red */
--error-800: oklch(0.28 0.10 20)    /* Darker red */
--error-900: oklch(0.20 0.08 20)    /* Very dark red */
--error-950: oklch(0.12 0.04 20)    /* Darkest red */
```

## 🔄 Workflow Node Colors

Special colors designed for workflow states as per PRD requirements:

```css
--node-pending: oklch(0.85 0.08 60)   /* Pending state - Light amber */
--node-running: oklch(0.65 0.15 220)  /* Running state - Medium blue */
--node-pass:    oklch(0.65 0.15 140)  /* Success state - Medium green */
--node-fail:    oklch(0.65 0.15 20)   /* Failure state - Medium red */
```

## 🌙 Dark Mode Support

The system automatically adapts colors for dark mode using `prefers-color-scheme: dark`:

- **Primary colors**: Slightly brighter and less saturated
- **Neutral scale**: Inverted for proper contrast
- **Workflow nodes**: Enhanced visibility in dark environments
- **Semantic assignments**: Automatically adjusted backgrounds and text

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance
All color combinations meet or exceed WCAG 2.1 AA standards:
- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text**: 3:1 contrast ratio minimum  
- **UI components**: 3:1 contrast ratio minimum

### Accessibility Utilities
```css
.text-contrast-high      /* High contrast dark text */
.text-contrast-high-dark /* High contrast light text */
.text-on-primary         /* AA compliant text on primary */
.text-on-secondary       /* AA compliant text on secondary */
.text-on-success         /* AA compliant text on success */
.text-on-warning         /* AA compliant text on warning */
.text-on-error           /* AA compliant text on error */
```

### Motion and Contrast Preferences
- **Reduced motion**: Respects `prefers-reduced-motion`
- **High contrast**: Supports `prefers-contrast: high`
- **Focus indicators**: Enhanced focus rings with proper contrast

## 🚀 Usage Examples

### Using Tailwind Classes
```html
<!-- Primary colors -->
<div class="bg-primary-500 text-white">Primary Button</div>
<div class="bg-primary-100 text-primary-900">Light Primary Background</div>

<!-- Workflow states -->
<div class="node-pending">Pending Task</div>
<div class="node-running">Running Process</div>
<div class="node-pass">Completed Successfully</div>
<div class="node-fail">Failed Process</div>

<!-- Accessibility compliant combinations -->
<div class="bg-success-500 text-on-success">Success Message</div>
<div class="bg-warning-400 text-on-warning">Warning Alert</div>
```

### Using CSS Custom Properties
```css
.custom-component {
  background-color: var(--primary-500);
  color: var(--neutral-50);
  border-color: var(--primary-600);
}

.workflow-card {
  background-color: var(--node-pending);
  border-left: 4px solid var(--warning-500);
}
```

### Direct OKLCH Usage
```css
.special-element {
  background-color: oklch(0.75 0.15 250);
  color: oklch(0.98 0.02 250);
  box-shadow: 0 4px 6px oklch(0.25 0.08 250 / 0.15);
}
```

## 🔧 Configuration Files

### PostCSS Configuration
```javascript
// postcss.config.mjs
const config = {
  plugins: ['@tailwindcss/postcss'],
};
export default config;
```

### Next.js Compatibility
- ✅ **Next.js 15.3.5**: Fully compatible
- ✅ **Turbopack**: Optimized build performance
- ✅ **App Router**: Full support
- ✅ **Server Components**: Works seamlessly

## 📊 Browser Support

OKLCH color space is supported in:
- ✅ **Chrome 111+**
- ✅ **Firefox 113+**  
- ✅ **Safari 15.4+**
- ✅ **Edge 111+**

For older browsers, colors gracefully fallback to RGB equivalents.

## 🎯 Best Practices

1. **Use semantic colors** for consistent theming
2. **Leverage the full scale** (50-950) for subtle variations
3. **Test in both light and dark modes**
4. **Verify accessibility** with contrast checkers
5. **Use workflow node colors** for status indicators
6. **Respect user preferences** (motion, contrast)

## 🔍 Testing

Test your implementation:
```bash
npm run dev    # Start development server
npm run build  # Test production build
```

Visit `http://localhost:3000` to see the colors in action!