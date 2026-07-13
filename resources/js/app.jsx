import { createRoot } from 'react-dom/client';
import { StoreProvider } from './store';
import App from './components/App';

createRoot(document.getElementById('root')).render(
    <StoreProvider>
        <App />
    </StoreProvider>
);
