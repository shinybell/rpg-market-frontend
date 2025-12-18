import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../hooks/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, loginWithEmail, registerWithEmail, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  // リダイレクト先を取得（デフォルトは /register-profile）
  const from = (location.state as { from?: string })?.from || '/register-profile';

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google ログインエラー:', err);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error('認証エラー:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        py={4}
      >
        <Paper elevation={3} sx={{ width: '100%', p: 4 }}>
          <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
            {isRegister ? '新規登録' : 'ログイン'}
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            RPG Market へようこそ
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleEmailAuth}>
            <Stack spacing={2}>
              <TextField
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
              />

              <TextField
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
              >
                {isRegister ? '登録' : 'ログイン'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              または
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ mb: 2 }}
          >
            Google でログイン
          </Button>

          <Button
            fullWidth
            onClick={() => setIsRegister(!isRegister)}
            sx={{ textTransform: 'none' }}
          >
            {isRegister ? 'アカウントをお持ちの方はこちら' : '新規登録はこちら'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
