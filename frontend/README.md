# AI Writing Tool - Frontend (2025)

Modern Next.js 15 frontend for the AI Writing Tool, built with React 19 and the latest 2025 technology stack.

## 🚀 Technology Stack

- **Framework**: Next.js 15.3.5 with App Router
- **React**: 19.0.0 with Server Components
- **TypeScript**: 5.x with strict mode
- **Styling**: Tailwind CSS v4.0 with OKLCH color space
- **Linting**: ESLint 9 + Prettier
- **Git Hooks**: Husky + lint-staged

## 📋 Features Implemented

### ✅ M0.1: Next.js 15 Project Setup
- Next.js 15 with App Router enabled
- React 19 Server Components configuration
- TypeScript 5.x with strict mode enabled
- ESLint + Prettier + Git hooks setup
- Tailwind CSS v4.0 with @theme directive
- OKLCH color space implementation
- Production-ready build configuration

### ✅ M0.2: State Management & Core Components
- Zustand v5 state management with TypeScript
- TanStack Query v5 for server state
- tRPC v11 integration for type-safe APIs
- Holy Grail layout implementation
- UI component library with animations
- Performance-optimized animation system

### ✅ M0.3: Advanced Features
- Comprehensive testing infrastructure (Vitest + Playwright)
- FastAPI backend integration
- WebSocket real-time communication
- Advanced animation performance optimization
- Complete documentation system

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm

### Installation
```bash
npm install
```

### Development Commands
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Type checking
npm run type-check
```

### Git Hooks
Pre-commit hooks are automatically set up to:
- Run ESLint with auto-fix
- Format code with Prettier
- Run TypeScript type checking

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with OKLCH colors
└── components/            # React components (to be added)
```

## 🎨 Design System

### Color Scheme (OKLCH)
- **Background**: oklch(1 0 0) / oklch(0.05 0 0) (dark)
- **Primary**: oklch(0.5 0.2 250)
- **Workflow Node Colors**:
  - Pending: oklch(0.8 0.05 60)
  - Running: oklch(0.7 0.15 220)
  - Pass: oklch(0.7 0.15 140)
  - Fail: oklch(0.7 0.15 20)

### Typography
- **Font**: Inter (variable font)
- **CSS Custom Properties**: Available for all design tokens

## 📊 Code Quality

- **TypeScript**: Strict mode with additional safety checks
- **ESLint**: Next.js recommended + custom rules
- **Prettier**: Consistent code formatting
- **Lint-staged**: Pre-commit quality checks

## 📚 Documentation

### Quick Links
- **[📋 Documentation Index](docs/README.md)** - Complete documentation overview
- **[📝 Changelog](CHANGELOG.md)** - Detailed development history and milestones
- **[🧪 Testing Report](docs/implementation/TESTING_REPORT.md)** - Comprehensive testing results
- **[🎨 Animation Guide](docs/ANIMATION_GUIDE.md)** - Complete animation component library

### Development Guides
- **[⚙️ Configuration](docs/configuration/)** - Tailwind v4, OKLCH colors, and setup guides
- **[🔗 Integration](docs/integration/)** - tRPC, FastAPI, and third-party integrations
- **[📖 Technical Reference](docs/technical-reference/)** - APIs, types, and technical documentation
- **[🏗️ Implementation](docs/implementation/)** - Detailed implementation guides and patterns

## 🔄 Next Steps

- **M1**: Advanced AI writing features
- **M2**: Enhanced workflow engine
- **M3**: PWA implementation  
- **M4**: Advanced analytics and optimization

## 📈 Performance

- **First Load JS**: ~101 kB (optimized)
- **Static Generation**: Enabled for all pages
- **Build Time**: < 10 seconds
- **Lighthouse Score**: Optimized for Core Web Vitals

---

Built with ❤️ using the latest 2025 web technologies.
