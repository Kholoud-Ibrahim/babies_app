# Twin Blossoms 🌸

A beautiful, interactive app for expecting twin girls! Share the joy with family and friends through gift registries, heartfelt messages, and updates.

## Features

- **🏠 Home** - Welcome page with countdown timer to the due date
- **🎁 Gift Registry** - Browse and claim gifts with filtering by category, budget, and priority
- **💌 Send Love** - Create and send beautiful customized cards
- **👶 Baby Updates** - Follow the pregnancy journey with updates and photos
- **📖 Guest Book** - Leave heartfelt messages for the twins to read someday

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd babies_app

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Customization

### Update Due Date

Edit `src/pages/Home.jsx` and change the `DUE_DATE` constant:

```javascript
const DUE_DATE = new Date('2026-06-15')
```

### Update Registry Items

Edit `src/App.jsx` and modify the `initialRegistryItems` array to add/remove gift items.

### Update Baby Names

When the names are chosen, you can update the labels in `src/pages/Home.jsx` in the twins illustration section.

## Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Color Palette

- Rose Deep: `#c17b7b`
- Rose Medium: `#d4a5a5`
- Rose Light: `#f5e6e0`
- Gold: `#d4a853`
- Sage: `#a8b5a0`
- Cream: `#fffbf7`

## Fonts

- Display: Cormorant Garamond
- Body: Outfit

---

Made with 💕 for our little blossoms

