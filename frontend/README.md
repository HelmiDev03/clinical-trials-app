# ClinicalTrials Data Frontend

React-based frontend application for the Clinical Trials Analytics Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration:
```
# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev  # Starts on port 8080
```

4. Build for production:
```bash
npm run build
```

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Recharts** for data visualization
- **React Query** for data fetching and caching
- **React Router** for navigation

## Environment Variables

- `VITE_API_URL` - Backend API URL (http://localhost:5000/api)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- **Real-time Search**: Search clinical trials by condition, intervention, etc.
- **Advanced Filtering**: Filter by status, country, phase, etc.
- **Interactive Charts**: Visualize trial data with animated charts
- **Fully Responsive Design**: Optimized for all screen sizes including desktop, tablet, and mobile devices
- **Mobile-First Experience**: Touch-friendly interface with mobile-optimized navigation and charts
- **Adaptive Layouts**: Content automatically adjusts and reorganizes for optimal viewing on any device
- **Dark Mode**: Automatic dark/light theme support
