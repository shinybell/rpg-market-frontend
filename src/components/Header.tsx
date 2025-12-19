import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import StorefrontIcon from '@mui/icons-material/Storefront';

export const Header = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDashboard = () => {
    handleMenuClose();
    navigate('/dashboard');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/register-profile');
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {/* ロゴ・タイトル */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => navigate('/items')}
          sx={{ mr: 2 }}
        >
          <StorefrontIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 0, cursor: 'pointer', mr: 4 }}
          onClick={() => navigate('/items')}
        >
          RPG Market
        </Typography>

        {/* ナビゲーションリンク */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/items')}>
            アイテム一覧
          </Button>
          {user && (
            <Button color="inherit" onClick={() => navigate('/items/new')}>
              出品する
            </Button>
          )}
        </Box>

        {/* ユーザーメニュー */}
        {user && profile ? (
          <Box>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar 
                src={profile.profile?.avatar_url} 
                alt={profile.profile?.nickname || 'User'}
              >
                {profile.profile?.nickname?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleDashboard}>ダッシュボード</MenuItem>
              <MenuItem onClick={handleProfile}>プロフィール編集</MenuItem>
              <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            ログイン
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
