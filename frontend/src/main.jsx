import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import '@phosphor-icons/web/bold';
import '@/styles/index.css';
import { router } from '@/app/router.jsx';
import { initPwaInstaller } from '@/features/pwa/pwaInstaller.js';
import { registerTemplateActions } from '@/features/templateActions.js';
import { installActionDelegation } from '@/lib/actions.js';

registerTemplateActions();
installActionDelegation();
initPwaInstaller();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
