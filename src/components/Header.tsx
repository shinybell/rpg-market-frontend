import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, Button, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generationApi, itemApi } from '../services/api';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SearchIcon from '@mui/icons-material/Search';

export const Header = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    try {
      setIsSearching(true);
      // Gemini APIでクエリを変換
      const conversionResponse = await generationApi.convertSearchQuery(searchQuery);
      const keywords = conversionResponse.data.keywords;

      // キーワードで検索
      const searchResponse = await itemApi.searchItemsByKeywords(keywords);

      // 検索結果ページに遷移（ステートで結果を渡す）
      navigate('/items/search', {
        state: {
          items: searchResponse.data,
          query: searchQuery,
          keywords: keywords
        }
      });

      // 検索欄をクリア
      setSearchQuery('');
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
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
          sx={{ flexGrow: 0, cursor: 'pointer', mr: 2 }}
          onClick={() => navigate('/items')}
        >
          RPG Market
        </Typography>

        {/* 検索バー */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ flexGrow: 1, maxWidth: 600, mx: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="こんなものが欲しい..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isSearching}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isSearching ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SearchIcon />
                  )}
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                color: 'white',
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* ナビゲーションリンク */}
        <Box sx={{ flexGrow: 0, display: 'flex', gap: 2 }}>
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
