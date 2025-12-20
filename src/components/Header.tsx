import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, Button, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generationApi, itemApi } from '../services/api';
import CastleIcon from '@mui/icons-material/Castle';
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
          sx={{
            mr: 2,
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s',
            }
          }}
        >
          <CastleIcon sx={{ fontSize: '2rem', color: '#d4af37' }} />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 0,
            cursor: 'pointer',
            mr: 2,
            fontFamily: 'MedievalSharp, serif',
            color: '#d4af37',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            letterSpacing: '1px',
          }}
          onClick={() => navigate('/items')}
        >
          ⚔️ RPG Market
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
            placeholder="🧙 店主に聞く:「こんな品はないか？」"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isSearching}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isSearching ? (
                    <CircularProgress size={20} sx={{ color: '#d4af37' }} />
                  ) : (
                    <SearchIcon sx={{ color: '#d4af37' }} />
                  )}
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'rgba(245, 230, 211, 0.15)',
                border: '2px solid #8b7355',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(245, 230, 211, 0.25)',
                  borderColor: '#d4af37',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(245, 230, 211, 0.2)',
                  borderColor: '#f4e4c1',
                  boxShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                color: '#f5e6d3',
                '& input': {
                  color: '#f5e6d3',
                },
                '& input::placeholder': {
                  color: '#d4c5b0',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Spacer to push navigation and user menu to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* ナビゲーションリンク */}
        <Box sx={{ flexGrow: 0, display: 'flex', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/items')}>
            📜 商店
          </Button>
          {user && (
            <Button color="inherit" onClick={() => navigate('/items/new')}>
              🔍 鑑定依頼
            </Button>
          )}
        </Box>

        {/* ユーザーメニュー */}
        {user && profile ? (
          <Box sx={{ ml: 2 }}>
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
              PaperProps={{
                sx: {
                  background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)',
                  border: '2px solid #8b7355',
                  boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 4px 12px rgba(0, 0, 0, 0.3)',
                  mt: 1,
                  '& .MuiMenuItem-root': {
                    color: '#1a1410',
                    fontFamily: 'Cinzel, serif',
                    '&:hover': {
                      backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={handleDashboard}>ダッシュボード</MenuItem>
              {/* <MenuItem onClick={handleProfile}>プロフィール編集</MenuItem> */}
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
