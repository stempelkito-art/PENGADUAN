import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalPrintListeners } from './utils/printHelper';

// Inisialisasi pendengar event cetak untuk memproteksi judul dokumen & tanggal bawaan peramban
setupGlobalPrintListeners();

createRoot(document.getElementById('root')!).render(<App />);
