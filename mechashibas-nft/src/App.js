import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';
import ErrorPage from './pages/error';
import SuspenseFallback from './pages/suspense';
import AppRoutes from './routes';

const App = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <BrowserRouter>
        <Suspense fallback={<SuspenseFallback />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
