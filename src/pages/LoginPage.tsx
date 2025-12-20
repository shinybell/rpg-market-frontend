import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { loginWithGoogle, loginWithEmail, registerWithEmail, error, user, isNewUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    if (user) {
      if (isNewUser) {
        navigate('/register-profile');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, isNewUser, navigate]);

  const handleGoogleLogin = async () => {
    console.log('handleGoogleLogin called');
    try {
      console.log('Calling loginWithGoogle...');
      await loginWithGoogle();
      // signInWithRedirect will redirect, no need to navigate
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
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            p: 4,
            background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)',
            border: '3px solid #8b7355',
            boxShadow: 'inset 0 0 30px rgba(139, 115, 85, 0.15), 0 8px 24px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            '&::before': {
              content: '"⚔️"',
              position: 'absolute',
              top: -15,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)',
              padding: '0 20px',
              border: '2px solid #8b7355',
              borderRadius: '50%',
            },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            textAlign="center"
            gutterBottom
            sx={{
              fontFamily: 'MedievalSharp, serif',
              color: '#8b7355',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
              mb: 1,
            }}
          >
            {isRegister ? '🏰 ギルド登録' : '🏰 ギルド入口'}
          </Typography>

          <Typography
            variant="body2"
            textAlign="center"
            mb={3}
            sx={{
              color: '#5d4037',
              fontFamily: 'Cinzel, serif',
              fontStyle: 'italic',
            }}
          >
            RPG Market へようこそ、冒険者よ
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
