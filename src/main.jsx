import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ModeProvider } from './context/ModeContext';
import { ItemProvider } from './context/ItemContext';
import { NotificationProvider } from './context/NotificationContext';
import App from './App';

// Fonts and icons are bundled locally, so the app also works without internet
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'material-symbols/outlined.css';
import './index.css';

// Providers wrap the whole app so every page can use the shared data
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <ModeProvider>
          <ItemProvider>
            <App />
          </ItemProvider>
        </ModeProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
);
