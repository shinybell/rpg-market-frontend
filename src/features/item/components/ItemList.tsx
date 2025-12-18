import { Grid, CircularProgress, Box, Typography } from '@mui/material';
import { ItemCard } from './ItemCard';
import type { Item } from '../../../types/item';

interface ItemListProps {
  items: Item[];
  loading?: boolean;
  emptyMessage?: string;
}

export const ItemList = ({ items, loading = false, emptyMessage = 'アイテムが見つかりませんでした' }: ItemListProps) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
          <ItemCard item={item} />
        </Grid>
      ))}
    </Grid>
  );
};
