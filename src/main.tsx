import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { abrirAlmacen } from './lib/almacen.ts';
import { crearStore } from './lib/store.ts';

const store = crearStore(abrirAlmacen());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
);
