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
  Card,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { itemApi, generationApi } from '../services/api';
import { useImageUpload } from '../hooks/useImageUpload';
import type { ItemCondition, ShippingPayer, ShippingDays, ItemStatus } from '../types/item';
import type { AxiosError } from 'axios';

export const CreateItemPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useImageUpload();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // AI生成用のstate
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    image_url: '',
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    // ファイルサイズチェック（5MB以下）
    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setError('各画像サイズは5MB以下にしてください');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください');
        return;
      }
    }

    setError(null);

    // 既存の画像に追加し、最大5枚に制限
    setSelectedImages(prev => {
      const combined = [...prev, ...newFiles];
      const limited = combined.slice(0, 5);

      // プレビューを再生成
      const newPreviews: string[] = [];
      limited.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === limited.length) {
            setImagePreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });

      return limited;
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // AI生成ハンドラー
  const handleGenerateDescription = async () => {
    if (!formData.name) {
      setError('商品名を入力してからAI生成をお試しください');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      // カテゴリ名を取得
      const categoryMap: Record<number, string> = {
        1: '武器',
        2: '防具',
        3: 'アクセサリー',
        4: '消耗品',
        5: '素材',
      };

      // 状態名を取得
      const conditionMap: Record<ItemCondition, string> = {
        new: '新品',
        like_new: '未使用に近い',
        very_good: '非常に良い',
        good: '良い',
        acceptable: '可',
      };

      const response = await generationApi.generateDescription({
        item_name: formData.name,
        category: categoryMap[formData.category_id],
        condition: conditionMap[formData.condition],
        num_suggestions: 3,
      });

      setSuggestions(response.data.suggestions);
      setShowSuggestions(true);
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || '説明文の生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setFormData((prev) => ({
      ...prev,
      description: suggestion,
    }));
    setShowSuggestions(false);
    setSuggestions([]);
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

      // 画像がある場合はアップロード
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        try {
          imageUrls = await uploadImages(selectedImages);
        } catch {
          setError('画像のアップロードに失敗しました');
          setLoading(false);
          return;
        }
      }

      const images = imageUrls.map((url, index) => ({
        image_url: url,
        display_order: index,
      }));

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
        images,
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
          {/* 画像アップロード */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              商品画像
            </Typography>

            {imagePreviews.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {imagePreviews.map((preview, index) => (
                  <Card key={index} sx={{ maxWidth: 200, position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={preview}
                      alt={`商品画像プレビュー ${index + 1}`}
                      sx={{ height: 150, objectFit: 'contain' }}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.default' },
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Card>
                ))}
                {imagePreviews.length < 5 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 200, height: 150, border: '2px dashed #ccc', borderRadius: 1 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCameraIcon />}
                      size="small"
                    >
                      追加
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  画像を選択
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  ※ 画像サイズは5MB以下、JPG/PNG形式、最大5枚まで
                </Typography>
              </Box>
            )}
          </Box>

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

          {/* AI生成ボタン */}
          <Box sx={{ mt: 1, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={handleGenerateDescription}
              disabled={generating || !formData.name}
              size="small"
            >
              {generating ? 'AI生成中...' : 'AIで説明文を生成'}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              商品名を入力後、クリックするとAIが説明文の候補を提案します
            </Typography>
          </Box>

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

      {/* AI生成候補モーダル */}
      <Dialog
        open={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6">AI生成された説明文候補</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            気に入った候補をクリックすると、商品説明欄に反映されます
          </Typography>
          <List>
            {suggestions.map((suggestion, index) => (
              <Box key={index}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleSelectSuggestion(suggestion)}>
                    <ListItemText
                      primary={`候補 ${index + 1}`}
                      secondary={suggestion}
                      secondaryTypographyProps={{
                        style: { whiteSpace: 'pre-wrap' },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {index < suggestions.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuggestions(false)}>
            キャンセル
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
