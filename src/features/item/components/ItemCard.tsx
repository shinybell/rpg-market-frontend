import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Item } from '../../../types/item';
import { conditionLabels } from '../../../constants/item';
import { formatCurrency } from '../../../utils/currency';

interface ItemCardProps {
  item: Item;
}

export const ItemCard = ({ item }: ItemCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/items/${item.id}`);
  };

  const mainImage = item.images?.[0]?.image_url || '/placeholder.jpg';

  // レアリティを価格から判定（簡易版）
  const getRarity = (price: number) => {
    if (price >= 5000) return { label: '伝説級', color: '#d4af37', glow: 'rgba(212, 175, 55, 0.6)' };
    if (price >= 2000) return { label: '希少', color: '#c0c0c0', glow: 'rgba(192, 192, 192, 0.5)' };
    if (price >= 1000) return { label: '上質', color: '#cd7f32', glow: 'rgba(205, 127, 50, 0.4)' };
    return { label: '一般', color: '#8b7355', glow: 'rgba(139, 115, 85, 0.3)' };
  };

  const rarity = getRarity(item.price);

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)',
        border: '3px solid #8b7355',
        boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 4px 8px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'visible',
        '&::before': {
          content: '"⚜"',
          position: 'absolute',
          top: -10,
          left: -10,
          fontSize: '1.2rem',
          color: '#d4af37',
          zIndex: 1,
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
        },
        '&::after': {
          content: '"⚜"',
          position: 'absolute',
          bottom: -10,
          right: -10,
          fontSize: '1.2rem',
          color: '#d4af37',
          zIndex: 1,
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
        },
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `inset 0 0 20px rgba(139, 115, 85, 0.2), 0 12px 24px rgba(0, 0, 0, 0.4), 0 0 20px ${rarity.glow}`,
          borderColor: rarity.color,
          '& .item-image': {
            transform: 'scale(1.05)',
          },
        },
      }}
      onClick={handleClick}
    >
      {/* レアリティバッジ */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          bgcolor: rarity.color,
          color: '#1a1410',
          px: 1.5,
          py: 0.5,
          borderRadius: '4px',
          fontFamily: 'Cinzel, serif',
          fontSize: '0.75rem',
          fontWeight: 700,
          zIndex: 2,
          border: '2px solid #1a1410',
          boxShadow: `0 2px 8px ${rarity.glow}`,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {rarity.label}
      </Box>

      <CardMedia
        component="img"
        height="200"
        image={mainImage}
        alt={item.name}
        className="item-image"
        sx={{
          objectFit: 'cover',
          borderBottom: '2px solid #8b7355',
          transition: 'transform 0.3s ease',
        }}
      />
      <CardContent sx={{ position: 'relative' }}>
        <Typography
          variant="h6"
          component="div"
          noWrap
          sx={{
            fontFamily: 'Cinzel, serif',
            color: '#1a1410',
            fontWeight: 700,
            textShadow: '1px 1px 2px rgba(212, 175, 55, 0.3)',
            mb: 1,
          }}
        >
          {item.rpg_name || item.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1.5 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(212, 175, 55, 0.2)',
            px: 1.5,
            py: 0.5,
            borderRadius: '4px',
            border: '2px solid #d4af37',
          }}>
            <Typography
              variant="h6"
              sx={{
                color: '#8b7355',
                fontWeight: 800,
                fontFamily: 'Cinzel, serif',
                fontSize: '1.1rem',
              }}
            >
              {formatCurrency(item.price)}
            </Typography>
          </Box>
          <Chip
            label={conditionLabels[item.condition]}
            size="small"
            sx={{
              ml: 'auto',
              bgcolor: '#8b7355',
              color: '#f5e6d3',
              fontFamily: 'Cinzel, serif',
              fontWeight: 600,
              border: '1px solid #5d4037',
            }}
          />
        </Box>

        {item.seller?.profile && (
          <Typography
            variant="body2"
            sx={{
              color: '#5d4037',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.85rem',
              mb: 0.5,
            }}
          >
            🧑 提供: {item.seller.profile.nickname}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#5d4037',
              fontFamily: 'Cinzel, serif',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            👁 {item.view_count}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#5d4037',
              fontFamily: 'Cinzel, serif',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            ❤️ {item.likes_count}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
