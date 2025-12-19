import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { itemApi } from '../services/api';
import { useImageUpload } from '../hooks/useImageUpload';
import type { ItemCondition, ShippingPayer, ShippingDays, ItemStatus, Item } from '../types/item';
import type { AxiosError } from 'axios';

export const EditItemPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useImageUpload();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ image_url: string; display_order: number }>>([]);

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

  // アイテムデータを取得
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      try {
        setFetchLoading(true);
        const response = await itemApi.getItem(parseInt(id, 10));
        const item: Item = response.data;

        // フォームデータに既存データをセット
        setFormData({
          category_id: item.category_id,
          name: item.name,
          description: item.description,
          price: item.price.toString(),
          stock: item.stock.toString(),
          condition: item.condition,
          shipping_payer: item.shipping_payer,
          shipping_days: item.shipping_days,
          status: item.status,
        });

        // 既存の画像をセット
        if (item.images && item.images.length > 0) {
          const sortedImages = [...item.images].sort((a, b) => a.display_order - b.display_order);
          setExistingImages(sortedImages.map(img => ({ image_url: img.image_url, display_order: img.display_order })));
          setImagePreviews(sortedImages.map(img => img.image_url));
        }
      } catch (err) {
        const error = err as AxiosError<{ error: string }>;
        setError(error.response?.data?.error || 'アイテムの取得に失敗しました');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchItem();
  }, [id]);

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

    // 既存の画像 + 新規画像を合わせて最大5枚に制限
    const totalImages = existingImages.length + selectedImages.length + newFiles.length;
    if (totalImages > 5) {
      setError('画像は最大5枚までです');
      return;
    }

    // 新規画像を追加
    setSelectedImages(prev => {
      const combined = [...prev, ...newFiles];

      // プレビューを再生成
      const newPreviews: string[] = [];
      combined.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === combined.length) {
            setImagePreviews([...existingImages.map(img => img.image_url), ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      return combined;
    });
  };

  const handleRemoveImage = (index: number) => {
    const existingImagesCount = existingImages.length;
    
    if (index < existingImagesCount) {
      // 既存画像を削除
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // 新規画像を削除
      const newImageIndex = index - existingImagesCount;
      setSelectedImages((prev) => {
        const updated = prev.filter((_, i) => i !== newImageIndex);
        
        // プレビューを再生成
        const newPreviews: string[] = [];
        updated.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            if (newPreviews.length === updated.length) {
              setImagePreviews([...existingImages.map(img => img.image_url), ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        });
        
        return updated;
      });
    }
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
    if (isNaN(stock) || stock < 0) {
      setError('在庫数は0以上の数値を入力してください');
      return;
    }

    try {
      setLoading(true);

      // 新規画像がある場合はアップロード
      let newImageUrls: string[] = [];
      if (selectedImages.length > 0) {
        try {
          newImageUrls = await uploadImages(selectedImages);
        } catch {
          setError('画像のアップロードに失敗しました');
          setLoading(false);
          return;
        }
      }

      // 既存画像と新規画像を結合
      const allImageUrls = [
        ...existingImages.map(img => img.image_url),
        ...newImageUrls,
      ];
      const images = allImageUrls.map((url, index) => ({
        image_url: url,
        display_order: index,
      }));

      await itemApi.updateItem(parseInt(id!, 10), {
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
        navigate(`/items/${id}`);
      }, 1500);
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || 'アイテムの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/items/${id}`)} sx={{ mb: 2 }}>
        詳細に戻る
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          アイテムを編集する
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            アイテムを更新しました！詳細ページに移動します...
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
                      crossOrigin="anonymous"
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
            helperText="0以上の数値"
            slotProps={{
                htmlInput: {
                    min: 0,
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
              <MenuItem value="sold_out">売り切れ</MenuItem>
              <MenuItem value="suspended">停止中</MenuItem>
            </Select>
          </FormControl>

          {/* 送信ボタン */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/items/${id}`)}
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
              {loading ? <CircularProgress size={24} /> : '更新する'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
