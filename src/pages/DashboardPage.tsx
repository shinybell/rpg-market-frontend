import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Paper,
  Grid,  // ← v7では Grid を直接インポート
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarsIcon from '@mui/icons-material/Stars';
import VerifiedIcon from '@mui/icons-material/Verified';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!profile) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* ヘッダー */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RPG Market
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* プロフィールカード */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                    }}
                  >
                    {profile.profile?.nickname.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    {profile.profile?.nickname}
                  </Typography>
                  <Chip
                    label={profile.email}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 詳細情報 */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                アカウント情報
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Firebase UID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {profile.firebase_uid}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  メールアドレス
                </Typography>
                <Typography variant="body1">{profile.email}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  ユーザーID
                </Typography>
                <Typography variant="body1">#{profile.id}</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* ウォレット情報 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalanceWalletIcon
                    sx={{ fontSize: 40, color: 'primary.main', mr: 2 }}
                  />
                  <Typography variant="h6">ウォレット残高</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  ¥{profile.wallet?.balance.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <StarsIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Typography variant="h6">ポイント</Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {profile.wallet?.points.toLocaleString() || 0} pt
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 成功メッセージ */}
          <Grid size={{ xs: 12 }}>
            <Paper
              sx={{
                p: 3,
                bgcolor: 'success.light',
                color: 'success.contrastText',
              }}
            >
              <Box display="flex" alignItems="center">
                <VerifiedIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    バックエンドとの連携成功！
                  </Typography>
                  <Typography variant="body2">
                    Firebase認証とバックエンドAPIが正常に動作しています。
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
