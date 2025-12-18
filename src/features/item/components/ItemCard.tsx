import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Item } from '../../../types/item';

interface ItemCardProps {
  item: Item;
}

const conditionLabels: Record<string, string> = {
  new: '新品',
  like_new: '未使用に近い',
  very_good: '非常に良い',
  good: '良い',
  acceptable: '可',
};

export const ItemCard = ({ item }: ItemCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/items/${item.id}`);
  };

  const mainImage = item.images?.[0]?.image_url || '/placeholder.jpg';

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={handleClick}
    >
      <CardMedia
        component="img"
        height="200"
        image={mainImage}
        alt={item.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Typography variant="h6" component="div" noWrap>
          {item.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1 }}>
          <Typography variant="h5" color="primary" fontWeight="bold">
            ¥{item.price.toLocaleString()}
          </Typography>
          <Chip
            label={conditionLabels[item.condition]}
            size="small"
            color="default"
            sx={{ ml: 'auto' }}
          />
        </Box>
        {item.seller?.profile && (
          <Typography variant="body2" color="text.secondary">
            出品者: {item.seller.profile.nickname}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            👁 {item.view_count}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ❤️ {item.likes_count}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
