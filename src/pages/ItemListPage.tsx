import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Alert,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ItemList } from '../features/item/components/ItemList';
import { itemApi } from '../services/api';
import type { Item } from '../types/item';
import type { AxiosError } from 'axios';

export const ItemListPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchItems = async (keyword?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = keyword
        ? await itemApi.searchItems(keyword)
        : await itemApi.getItems();
      setItems(response.data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setError(error.response?.data?.error || 'アイテムの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = event.target.value;
    setSearchKeyword(keyword);

    if (keyword.trim()) {
      fetchItems(keyword);
    } else {
      fetchItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            アイテム一覧
          </Typography>
          <TextField
            fullWidth
            placeholder="アイテムを検索..."
            value={searchKeyword}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mt: 2 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/items/new')}
          sx={{ minWidth: 120, height: 56 }}
        >
          出品する
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <ItemList items={items} loading={loading} />
    </Container>
  );
};
