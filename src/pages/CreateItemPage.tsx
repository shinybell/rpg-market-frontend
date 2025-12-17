import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { itemApi } from '../services/api';
import type { ItemCondition, ShippingPayer, ShippingDays, ItemStatus } from '../types/item';
import type { AxiosError } from 'axios';

export const CreateItemPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    category_id: 1,
    name: '',
    description: '',
    price: '',
    stock: '1',
    condition: 'new' as ItemCondition,
    shipping_payer: 'seller' as ShippingPayer,
    shipping_days: '2-3' as ShippingDays,
    status: 'on_sale' as ItemStatus,
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    // バリデーション
    if (!formData.name || formData.name.length < 1) {
      setError('商品名は必須です（1文字以上）');
      return;
    }
    if (!formData.description || formData.description.length < 10) {
      setError('商品説明は10文字以上必要です');
      return;
    }
    const price = parseInt(formData.price, 10);
    if (isNaN(price) || price < 0) {
      setError('価格は0以上の数値を入力してください');
      return;
    }
    const stock = parseInt(formData.stock, 10);
    if (isNaN(stock) || stock < 1) {
      setError('在庫数は1以上の数値を入力してください');
      return;
    }

    try {
      setLoading(true);
      await itemApi.createItem({
        category_id: formData.category_id,
        name: formData.name,
        description: formData.description,
        price,
        stock,
        condition: formData.condition,
        shipping_payer: formData.shipping_payer,
        shipping_days: formData.shipping_days,
        status: formData.status,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/items');
      }, 1500);
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || 'アイテムの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/items')} sx={{ mb: 2 }}>
        一覧に戻る
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          アイテムを出品する
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            アイテムを出品しました！一覧ページに移動します...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* 商品名 */}
          <TextField
            fullWidth
            required
            label="商品名"
            value={formData.name}
            onChange={handleChange('name')}
            margin="normal"
            helperText="1〜255文字"
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />

          {/* 商品説明 */}
          <TextField
            fullWidth
            required
            multiline
            rows={6}
            label="商品説明"
            value={formData.description}
            onChange={handleChange('description')}
            margin="normal"
            helperText="10文字以上で詳しく記載してください"
          />

          {/* 価格 */}
          <TextField
            fullWidth
            required
            type="number"
            label="価格"
            value={formData.price}
            onChange={handleChange('price')}
            margin="normal"
            slotProps={{
                input: {
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                },
                htmlInput: {
                min: 0,
                step: 1,
                },
            }}
            helperText="0以上の整数"
          />

          {/* 在庫数 */}
          <TextField
            fullWidth
            required
            type="number"
            label="在庫数"
            value={formData.stock}
            onChange={handleChange('stock')}
            margin="normal"
            helperText="1以上の数値"
            slotProps={{
                htmlInput: {
                    min: 1,
                    step: 1,
                },
            }}
          />

          {/* 商品の状態 */}
          <FormControl fullWidth margin="normal">
            <InputLabel>商品の状態</InputLabel>
            <Select
              value={formData.condition}
              onChange={handleChange('condition')}
              label="商品の状態"
            >
              <MenuItem value="new">新品</MenuItem>
              <MenuItem value="like_new">未使用に近い</MenuItem>
              <MenuItem value="very_good">非常に良い</MenuItem>
              <MenuItem value="good">良い</MenuItem>
              <MenuItem value="acceptable">可</MenuItem>
            </Select>
          </FormControl>

          {/* 送料負担 */}
          <FormControl fullWidth margin="normal">
            <InputLabel>送料負担</InputLabel>
            <Select
              value={formData.shipping_payer}
              onChange={handleChange('shipping_payer')}
              label="送料負担"
            >
              <MenuItem value="seller">出品者負担</MenuItem>
              <MenuItem value="buyer">購入者負担</MenuItem>
            </Select>
          </FormControl>

          {/* 発送までの日数 */}
          <FormControl fullWidth margin="normal">
            <InputLabel>発送までの日数</InputLabel>
            <Select
              value={formData.shipping_days}
              onChange={handleChange('shipping_days')}
              label="発送までの日数"
            >
              <MenuItem value="1-2">1〜2日で発送</MenuItem>
              <MenuItem value="2-3">2〜3日で発送</MenuItem>
              <MenuItem value="4-7">4〜7日で発送</MenuItem>
            </Select>
          </FormControl>

          {/* カテゴリ */}
          <FormControl fullWidth margin="normal">
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={formData.category_id}
              onChange={handleChange('category_id')}
              label="カテゴリ"
            >
              <MenuItem value={1}>武器</MenuItem>
              <MenuItem value={2}>防具</MenuItem>
              <MenuItem value={3}>アクセサリー</MenuItem>
              <MenuItem value={4}>消耗品</MenuItem>
              <MenuItem value={5}>素材</MenuItem>
            </Select>
          </FormControl>

          {/* 公開状態 */}
          <FormControl fullWidth margin="normal">
            <InputLabel>公開状態</InputLabel>
            <Select
              value={formData.status}
              onChange={handleChange('status')}
              label="公開状態"
            >
              <MenuItem value="draft">下書き</MenuItem>
              <MenuItem value="on_sale">販売中</MenuItem>
            </Select>
          </FormControl>

          {/* 送信ボタン */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/items')}
              fullWidth
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : '出品する'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
