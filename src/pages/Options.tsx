import { createRoot } from 'react-dom/client';
import OptionsPage from '../components/OptionsPage';

const container = document.getElementById('options-root');
if (container) {
  const root = createRoot(container);
  root.render(<OptionsPage />);
} else {
  console.error('Options root element not found');
} 