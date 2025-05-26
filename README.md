# GreenCard Buddy Chrome Extension

A Chrome extension to help manage your green card application process with smart reminders and notifications.

## Features

- Smart reminder system for important dates (biometrics, interviews, RFE deadlines)
- Chrome notifications for upcoming appointments
- Clean and intuitive user interface
- Easy to use reminder management

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/greencard-buddy.git
cd greencard-buddy
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder from this project

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
  ├── components/     # React components
  ├── services/      # Service layer (notifications, etc.)
  ├── utils/         # Utility functions
  ├── types/         # TypeScript type definitions
  └── popup/         # Extension popup UI
```

## License

MIT License 