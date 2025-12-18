import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterProfilePage } from './pages/RegisterProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { ItemListPage } from './pages/ItemListPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { CreateItemPage } from './pages/CreateItemPage';
import { theme } from './theme/theme';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  return user ? <>{children}</> : <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
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
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route
            path="/items/new"
            element={
              <PrivateRoute>
                <CreateItemPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/items" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
