import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { ItemList } from '../features/item/components/ItemList';
import { itemApi } from '../services/api';
import type { Item } from '../types/item';
import type { AxiosError } from 'axios';

export const ItemListPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await itemApi.getItems();
        setItems(response.data);
      } catch (err) {
        const error = err as AxiosError<{ error: string }>;
        setError(error.response?.data?.error || 'アイテムの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          アイテム一覧
        </Typography>
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
