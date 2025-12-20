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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MessageIcon from '@mui/icons-material/Message';
import { itemApi, addressApi, extendedItemApi } from '../services/api';
import type { Item } from '../types/item';
import type { Address } from '../types/address';
import type { Transaction } from '../types/message';
import type { AxiosError } from 'axios';
import LikeButton from '../features/item/components/LikeButton';
import CommentSection from '../features/item/components/CommentSection';
import { useAuth } from '../hooks/useAuth';
import { conditionLabels, shippingPayerLabels, shippingDaysLabels } from '../constants/item';

export const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new' | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [pointsUsed, setPointsUsed] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  // 新規住所作成用のstate
  const [newAddress, setNewAddress] = useState({
    name: '',
    postal_code: '',
    address: '',
    phone: '',
  });
  const [creatingAddress, setCreatingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Fetch item when ID changes
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

  // Fetch addresses once when user is authenticated
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;

      try {
        const response = await addressApi.getAddresses();
        setAddresses(response.data);
      } catch (err) {
        console.error('Addresses fetch failed', err);
      }
    };

    fetchAddresses();
  }, [user]);

  // 取引情報を取得（購入者または出品者の場合のみ）
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id || !profile) return;

      try {
        const response = await extendedItemApi.getItemTransaction(Number(id));
        setTransaction(response.data);
      } catch {
        // 取引が存在しない、またはアクセス権限がない場合はエラーを無視
        setTransaction(null);
      }
    };

    fetchTransaction();
  }, [id, profile]);

  const handleCreateAddress = async () => {
    // バリデーション
    if (!newAddress.name || !newAddress.postal_code || !newAddress.address || !newAddress.phone) {
      setAddressError('全ての項目を入力してください');
      return;
    }

    if (!/^\d{3}-?\d{4}$/.test(newAddress.postal_code)) {
      setAddressError('郵便番号は7桁の数字で入力してください（例: 123-4567）');
      return;
    }

    if (!/^0\d{9,10}$/.test(newAddress.phone.replace(/-/g, ''))) {
      setAddressError('電話番号が正しくありません（例: 090-1234-5678）');
      return;
    }

    setCreatingAddress(true);
    setAddressError(null);

    try {
      const response = await addressApi.createAddress(newAddress);
      const createdAddress = response.data;

      // 住所リストに追加
      setAddresses([...addresses, createdAddress]);

      // 作成した住所を自動選択
      setSelectedAddressId(createdAddress.id);

      // フォームをリセット
      setNewAddress({ name: '', postal_code: '', address: '', phone: '' });

      alert('住所を登録しました');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setAddressError(error.response?.data?.error || '住所の登録に失敗しました');
    } finally {
      setCreatingAddress(false);
    }
  };

  const handlePurchase = async () => {
    if (!item || !selectedAddressId || selectedAddressId === 'new') return;

    setPurchasing(true);
    try {
      await itemApi.purchaseItem(item.id, {
        address_id: selectedAddressId as number,
        payment_method: paymentMethod,
        points_used: pointsUsed,
      });
      alert('購入が完了しました！');
      setOpenPurchaseModal(false);
      setConfirmDialogOpen(false);
      // 必要に応じてアイテム再取得
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      alert(error.response?.data?.error || '購入に失敗しました');
    } finally {
      setPurchasing(false);
    }
  };

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

  // 出品者本人かどうかを判定
  const isOwner = profile && item.seller_id === profile.id;

  // アイテム削除（出品キャンセル）処理
  const handleDeleteItem = async () => {
    if (!item || !window.confirm('本当にこのアイテムを削除しますか？')) return;

    try {
      await itemApi.deleteItem(item.id);
      alert('アイテムを削除しました');
      navigate('/items');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      alert(error.response?.data?.error || 'アイテムの削除に失敗しました');
    }
  };

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

          {/* 購入ボタン / 編集・削除ボタン */}
          {isOwner ? (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => navigate(`/items/${item.id}/edit`)}
              >
                編集する
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                color="error"
                onClick={handleDeleteItem}
              >
                削除
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={item.status !== 'on_sale' || item.stock === 0}
              onClick={() => setOpenPurchaseModal(true)}
              sx={{ mb: 2 }}
            >
              {item.status === 'on_sale' && item.stock > 0 ? '購入する' : '売り切れ'}
            </Button>
          )}

          {/* DMボタン（購入者または出品者の場合のみ表示） */}
          {transaction && (
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<MessageIcon />}
              onClick={() => navigate(`/messages/${transaction.id}`)}
              sx={{ mb: 2 }}
            >
              メッセージ
            </Button>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              👁 {item.view_count} 閲覧
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

        {/* いいねとコメント数 */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <LikeButton
                itemId={item.id}
                initialLikesCount={item.likes_count}
              />
              <Typography variant="body2" color="text.secondary">
                💬 コメント {item.comments_count || 0}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* コメントセクション */}
        <Grid size={{ xs: 12 }}>
          <CommentSection itemId={item.id} />
        </Grid>
      </Grid>

      {/* 購入モーダル */}
      <Dialog open={openPurchaseModal} onClose={() => setOpenPurchaseModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>購入確認</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>配送先</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>配送先を選択</InputLabel>
            <Select
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value as number | 'new')}
            >
              {addresses.map((addr) => (
                <MenuItem key={addr.id} value={addr.id}>
                  {addr.name} - {addr.postal_code} {addr.address}
                </MenuItem>
              ))}
              <MenuItem value="new">
                <strong>+ 新規住所を登録</strong>
              </MenuItem>
            </Select>
          </FormControl>

          {/* 新規住所作成フォーム */}
          {selectedAddressId === 'new' && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                新規住所登録
              </Typography>

              {addressError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {addressError}
                </Alert>
              )}

              <TextField
                fullWidth
                label="宛名"
                value={newAddress.name}
                onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                margin="normal"
                required
                helperText="例: 山田太郎"
              />

              <TextField
                fullWidth
                label="郵便番号"
                value={newAddress.postal_code}
                onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                margin="normal"
                required
                helperText="例: 123-4567"
              />

              <TextField
                fullWidth
                label="住所"
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                margin="normal"
                required
                multiline
                rows={2}
                helperText="例: 東京都渋谷区渋谷1-1-1"
              />

              <TextField
                fullWidth
                label="電話番号"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                margin="normal"
                required
                helperText="例: 090-1234-5678"
              />

              <Button
                variant="contained"
                onClick={handleCreateAddress}
                disabled={creatingAddress}
                fullWidth
                sx={{ mt: 2 }}
              >
                {creatingAddress ? <CircularProgress size={24} /> : '住所を登録'}
              </Button>
            </Paper>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>支払い方法</Typography>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel value="wallet" control={<Radio />} label="ウォレット残高" />
            <FormControlLabel value="card" control={<Radio />} label="クレジットカード" />
          </RadioGroup>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>ポイント使用</Typography>
          <TextField
            type="number"
            value={pointsUsed}
            onChange={(e) => setPointsUsed(Math.max(0, parseInt(e.target.value) || 0))}
            fullWidth
            margin="normal"
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>最終料金</Typography>
          <Typography variant="body1">¥{Math.max(0, item.price - pointsUsed)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPurchaseModal(false)}>キャンセル</Button>
          <Button
            onClick={() => setConfirmDialogOpen(true)}
            variant="contained"
            disabled={!selectedAddressId || selectedAddressId === 'new'}
          >
            購入確認へ
          </Button>
        </DialogActions>
      </Dialog>

      {/* 確認ダイアログ */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>最終確認</DialogTitle>
        <DialogContent>
          <Typography>本当に購入しますか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handlePurchase} variant="contained" disabled={purchasing}>
            {purchasing ? <CircularProgress size={20} /> : '購入'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
