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
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontFamily: 'MedievalSharp, serif',
            color: '#d4af37',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
            textAlign: 'center',
          }}
        >
          ⚔️ 冒険者の市場 ⚔️
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
