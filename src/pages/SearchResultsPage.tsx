import { Container, Typography, Box, Alert, Chip } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { ItemList } from '../features/item/components/ItemList';
import type { Item } from '../types/item';

interface LocationState {
  items: Item[];
  query: string;
  keywords: string[];
}

export const SearchResultsPage = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          検索結果がありません。ヘッダーの検索バーから検索してください。
        </Alert>
      </Container>
    );
  }

  const { items, query, keywords } = state;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          検索結果
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          「{query}」の検索結果
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            抽出されたキーワード:
          </Typography>
          {keywords.map((keyword, index) => (
            <Chip key={index} label={keyword} size="small" />
          ))}
        </Box>
      </Box>

      {items.length === 0 ? (
        <Alert severity="info">
          該当するアイテムが見つかりませんでした。別のキーワードで検索してください。
        </Alert>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {items.length}件のアイテムが見つかりました
          </Typography>
          <ItemList items={items} loading={false} />
        </Box>
      )}
    </Container>
  );
};
