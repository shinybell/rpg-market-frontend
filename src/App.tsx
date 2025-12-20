import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { RegisterProfilePage } from './pages/RegisterProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { ItemListPage } from './pages/ItemListPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { CreateItemPage } from './pages/CreateItemPage';
import { EditItemPage } from './pages/EditItemPage';
import { MessagePage } from './pages/MessagePage';
import { theme } from './theme/theme';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isNewUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (isNewUser && location.pathname !== '/register-profile') {
          navigate('/register-profile');
        } else if (!isNewUser && location.pathname === '/register-profile') {
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, isNewUser, navigate, location]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user || (isNewUser && location.pathname !== '/register-profile')) {
    return null;
  }

  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideHeaderPaths = ['/login', '/register-profile'];
  const showHeader = !hideHeaderPaths.includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/register-profile"
                element={
                  <PrivateRoute>
                    <RegisterProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route path="/items" element={<ItemListPage />} />
              <Route path="/items/search" element={<SearchResultsPage />} />
              <Route
                path="/items/new"
                element={
                  <PrivateRoute>
                    <CreateItemPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/items/:id/edit"
                element={
                  <PrivateRoute>
                    <EditItemPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/items/:id"
                element={
                  <PrivateRoute>
                    <ItemDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/messages/:transactionId"
                element={
                  <PrivateRoute>
                    <MessagePage />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/items" />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
