import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Paper,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { itemApi } from '../services/api';
import type { Item } from '../types/item';
import type { AxiosError } from 'axios';

const conditionLabels: Record<string, string> = {
  new: '新品',
  like_new: '未使用に近い',
  very_good: '非常に良い',
  good: '良い',
  acceptable: '可',
};

const shippingPayerLabels: Record<string, string> = {
  buyer: '購入者負担',
  seller: '出品者負担',
};

const shippingDaysLabels: Record<string, string> = {
  '1-2': '1〜2日で発送',
  '2-3': '2〜3日で発送',
  '4-7': '4〜7日で発送',
};

export const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await itemApi.getItem(parseInt(id, 10));
        setItem(response.data);
      } catch (err) {
        const error = err as AxiosError<{ error: string }>;
        setError(error.response?.data?.error || 'アイテムの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !item) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'アイテムが見つかりません'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/items')} sx={{ mt: 2 }}>
          一覧に戻る
        </Button>
      </Container>
    );
  }

  const sortedImages = item.images?.sort((a, b) => a.display_order - b.display_order) || [];
  const mainImage = sortedImages[selectedImageIndex]?.image_url || '/placeholder.jpg';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/items')} sx={{ mb: 2 }}>
        一覧に戻る
      </Button>

      <Grid container spacing={4}>
        {/* 画像 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2, position: 'relative' }}>
            {/* メイン画像 */}
            <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <Box
                component="img"
                src={mainImage}
                alt={item.name}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 400,
                  objectFit: 'contain',
                }}
                crossOrigin="anonymous"
              />

              {/* 左矢印 */}
              {sortedImages.length > 1 && selectedImageIndex > 0 && (
                <IconButton
                  onClick={() => setSelectedImageIndex((prev) => prev - 1)}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}

              {/* 右矢印 */}
              {sortedImages.length > 1 && selectedImageIndex < sortedImages.length - 1 && (
                <IconButton
                  onClick={() => setSelectedImageIndex((prev) => prev + 1)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              )}
            </Box>

            {/* 画像カウンター */}
            {sortedImages.length > 1 && (
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                {selectedImageIndex + 1} / {sortedImages.length}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* アイテム情報 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h4" gutterBottom>
            {item.name}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={conditionLabels[item.condition]} color="primary" />
            <Chip label={item.status === 'on_sale' ? '販売中' : '売り切れ'} />
          </Box>

          <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
            ¥{item.price.toLocaleString()}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* 出品者情報 */}
          {item.seller?.profile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar src={item.seller.profile.avatar_url}>
                {item.seller.profile.nickname[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  出品者
                </Typography>
                <Typography variant="body1">{item.seller.profile.nickname}</Typography>
              </Box>
            </Box>
          )}

          {/* 配送情報 */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              配送について
            </Typography>
            <Typography variant="body2" color="text.secondary">
              送料: {shippingPayerLabels[item.shipping_payer]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              発送目安: {shippingDaysLabels[item.shipping_days]}
            </Typography>
          </Paper>

          {/* 購入ボタン */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={item.status !== 'on_sale' || item.stock === 0}
            sx={{ mb: 2 }}
          >
            {item.status === 'on_sale' && item.stock > 0 ? '購入する' : '売り切れ'}
          </Button>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              👁 {item.view_count} 閲覧
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ❤️ {item.likes_count} いいね
            </Typography>
            <Typography variant="caption" color="text.secondary">
              📦 在庫 {item.stock}
            </Typography>
          </Box>
        </Grid>

        {/* 商品説明 */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              商品の説明
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {item.description}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
