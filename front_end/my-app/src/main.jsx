import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import AboutPage from './pages/about.jsx';
import FileNotFound from './pages/fileNotFound.jsx';
import Resources from './pages/resources.jsx'
import Contact from './pages/contact.jsx'

const router = createBrowserRouter([{
  path: '/',
  element: <App />,
  errorElement: <FileNotFound />
},
{
  path: '/about',
  element: <AboutPage />,
  errorElement: <FileNotFound />
},
{
  path: '/resources',
  element: <Resources />,
  errorElement: <FileNotFound />,
},
{
  path: '/contact',
  element: <Contact/>,
  errorElement: <FileNotFound />,
}
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
