# Pixel Art Editor

A beautiful React application for transforming images into pixel art with customizable pixelation and noise effects.

## Features

- 🎨 **Pixelation Control**: Adjust pixel size from fine detail to chunky retro look
- 📸 **Noise Effects**: Add vintage grain effects to your pixel art
- 💾 **Export Options**: Export as SVG (scalable) or PNG
- 🎭 **Clean UI**: Modern, minimal interface with smooth animations
- ⚡ **Fast Processing**: Real-time image processing with canvas API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Usage

1. Click "Upload Image" to select an image file
2. Adjust the **Pixelation** slider to control pixel size (1-50px)
3. Adjust the **Noise** slider to add grain effects (0-100%)
4. Click "Export SVG" or "Export PNG" to download your pixel art
5. Use "Reset" to restore default settings

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
pixel-and-noise/
├── src/
│   ├── components/
│   │   └── PixelArtEditor.tsx  # Main component
│   ├── App.tsx                  # App entry point
│   ├── main.tsx                 # React DOM render
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies
```

## License

MIT

