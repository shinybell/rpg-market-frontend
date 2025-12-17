import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../hooks/useAuth';
import type { AxiosError } from 'axios';

export const RegisterProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, registerBackend } = useAuth();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerBackend(nickname);
      navigate('/dashboard');
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || '登録に失敗しました');
    } finally {
      setLoading(false);
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
          <Box display="flex" justifyContent="center" mb={2}>
            <PersonIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>

          <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
            プロフィール設定
          </Typography>

          <Box display="flex" justifyContent="center" mb={3}>
            <Chip label={user?.email} color="primary" variant="outlined" />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="ニックネーム"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              fullWidth
              required
              helperText="2〜50文字で入力してください"
              inputProps={{ minLength: 2, maxLength: 50 }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? '登録中...' : '登録する'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};
