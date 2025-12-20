import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Container,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  CardMedia,
  CardActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MessageIcon from '@mui/icons-material/Message';
import AddIcon from '@mui/icons-material/Add';
import { userApi, extendedItemApi, walletApi } from '../services/api';
import { useImageUpload } from '../hooks/useImageUpload';
import type { AxiosError } from 'axios';
import { transactionStatusLabels, paymentStatusLabels, itemStatusLabels } from '../constants/transaction';
import type { Item } from '../types/item';
import type { Transaction } from '../types/message';
import { formatCurrency } from '../utils/currency';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { uploadImages } = useImageUpload();

  // タブ管理
  const [currentTab, setCurrentTab] = useState(0);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [myPurchases, setMyPurchases] = useState<Transaction[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [messageLoadingId, setMessageLoadingId] = useState<number | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  // プロフィール編集用の状態
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    nickname: '',
    bio: '',
    avatar_url: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // アカウント削除用の状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // チャージ用の状態
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState<string>('');
  const [chargeLoading, setChargeLoading] = useState(false);
  const [chargeError, setChargeError] = useState<string | null>(null);
  const [chargeSuccess, setChargeSuccess] = useState(false);

  // 出品商品と購入商品を取得
  useEffect(() => {
    const fetchItems = async () => {
      setItemsLoading(true);
      try {
        const [itemsResponse, purchasesResponse] = await Promise.all([
          extendedItemApi.getMyItems(),
          extendedItemApi.getMyPurchases(),
        ]);
        setMyItems(itemsResponse.data || []);
        setMyPurchases(purchasesResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } finally {
        setItemsLoading(false);
      }
    };

    fetchItems();
  }, []);

  // ログアウト処理
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // プロフィール編集ダイアログを開く
  const handleOpenEditDialog = () => {
    if (profile?.profile) {
      setEditData({
        nickname: profile.profile.nickname,
        bio: profile.profile.bio || '',
        avatar_url: profile.profile.avatar_url || '',
      });
      setAvatarPreview(profile.profile.avatar_url || '');
    }
    setEditError(null);
    setEditDialogOpen(true);
  };

  // アバター画像アップロード
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setEditError('画像サイズは5MB以下にしてください');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setEditError('画像ファイルを選択してください');
      return;
    }

    setAvatarFile(file);

    // プレビュー生成
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setEditError(null);
  };

  // プロフィール更新
  const handleUpdateProfile = async () => {
    setEditLoading(true);
    setEditError(null);

    try {
      let avatarUrl = editData.avatar_url;

      // 新しいアバター画像がある場合はアップロード
      if (avatarFile) {
        try {
          const urls = await uploadImages([avatarFile]);
          avatarUrl = urls[0];
        } catch {
          setEditError('画像のアップロードに失敗しました');
          setEditLoading(false);
          return;
        }
      }

      await userApi.updateProfile({
        nickname: editData.nickname,
        bio: editData.bio,
        avatar_url: avatarUrl,
      });

      // 成功したらダイアログを閉じてページをリロード
      setEditDialogOpen(false);
      window.location.reload();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setEditError(error.response?.data?.error || 'プロフィールの更新に失敗しました');
    } finally {
      setEditLoading(false);
    }
  };

  // アカウント削除
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('確認用テキストが正しくありません');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await userApi.deleteUser();
      await logout();
      navigate('/login');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setDeleteError(error.response?.data?.error || 'アカウントの削除に失敗しました');
    } finally {
      setDeleteLoading(false);
    }
  };

  // チャージダイアログを開く
  const handleOpenChargeDialog = () => {
    setChargeAmount('');
    setChargeError(null);
    setChargeSuccess(false);
    setChargeDialogOpen(true);
  };

  // チャージ実行
  const handleCharge = async () => {
    const amount = parseInt(chargeAmount);

    if (!amount || amount <= 0) {
      setChargeError('有効な金額を入力してください');
      return;
    }

    if (amount > 100000) {
      setChargeError('チャージ金額は100,000円以下にしてください');
      return;
    }

    setChargeLoading(true);
    setChargeError(null);

    try {
      await walletApi.chargeBalance(amount, 'ダッシュボードからのチャージ');
      setChargeSuccess(true);

      // 成功後、ウォレット情報を再取得するためにページをリロード
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setChargeError(error.response?.data?.error || 'チャージに失敗しました');
    } finally {
      setChargeLoading(false);
    }
  };

  // プリセット金額を設定
  const handlePresetAmount = (amount: number) => {
    setChargeAmount(amount.toString());
  };

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box>Loading...</Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
        ⚔️ 冒険者ステータス
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        あなたの冒険の記録と実績
      </Typography>

      <Grid container spacing={3}>
        {/* プロフィールカード */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ background: 'linear-gradient(145deg, #fff 0%, #f0f0f0 100%)' }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  src={profile.profile?.avatar_url}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    border: '3px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  {profile.profile?.nickname.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {profile.profile?.nickname}
                </Typography>
                <Chip
                  label="見習い商人"
                  color="secondary"
                  sx={{ mb: 1, fontWeight: 'bold' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                  Lv. {Math.floor((myItems.length + myPurchases.length) / 3) + 1}
                </Typography>
                {profile.profile?.bio && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    {profile.profile.bio}
                  </Typography>
                )}

                {/* RPG風ステータス */}
                <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📊 ステータス
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption">⚔️ 出品力</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {Math.min(100, myItems.length * 10)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption">🛡️ 購入力</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {Math.min(100, myPurchases.length * 15)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption">✨ 評価</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {Math.min(100, (myItems.filter(i => i.status === 'sold_out').length * 20))}
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={profile.email}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleOpenEditDialog}
                  fullWidth
                >
                  プロフィール編集
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* アカウント情報 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontFamily: 'MedievalSharp, serif', color: '#d4af37' }}>
              💰 所持金・魔力
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* ゴールド */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                border: '2px solid #d4af37',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Cinzel, serif',
                      color: '#8b7355',
                      fontWeight: 700,
                    }}
                  >
                    💰 ゴールド
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Cinzel, serif',
                    color: '#d4af37',
                    fontWeight: 800,
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {formatCurrency(profile.wallet?.balance || 0)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenChargeDialog}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4e5a1 100%)',
                  color: '#5a4a2a',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f4e5a1 0%, #d4af37 100%)',
                  },
                }}
              >
                チャージ
              </Button>
            </Box>

            {/* MP */}
            <Box
              sx={{
                p: 2,
                background: 'linear-gradient(135deg, rgba(74, 124, 44, 0.1) 0%, rgba(74, 124, 44, 0.05) 100%)',
                border: '2px solid #f093fb',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Cinzel, serif',
                      color: '#ac5e68ff',
                      fontWeight: 700,
                    }}
                  >
                    ✨ マジックポイント
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Cinzel, serif',
                    color: '#f5576c',
                    fontWeight: 800,
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {profile.wallet?.points.toLocaleString() || 0} MP
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* アクション */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              アカウント管理
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                fullWidth
              >
                ログアウト
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForeverIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                fullWidth
              >
                アカウント削除
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* ウォレット情報
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceWalletIcon
                  sx={{ fontSize: 40, mr: 2 }}
                />
                <Typography variant="h6">💰 所持金</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(profile.wallet?.balance || 0)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, mt: 1, display: 'block' }}>
                冒険で得た報酬
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StarsIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">✨ マジックポイント</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {profile.wallet?.points.toLocaleString() || 0} MP
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, mt: 1, display: 'block' }}>
                特別な力を秘めたポイント
              </Typography>
            </CardContent>
          </Card>
        </Grid> */}

        {/* 商品一覧セクション */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ mt: 3 }}>
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => setCurrentTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`出品中の商品 (${myItems.filter(i => i.status === 'on_sale').length})`} />
              <Tab label={`下書き (${myItems.filter(i => i.status === 'draft').length})`} />
              <Tab label={`売却済み (${myItems.filter(i => i.status === 'sold_out').length})`} />
              <Tab label={`購入した商品 (${myPurchases.length})`} />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {messageError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {messageError}
                </Alert>
              )}
              {itemsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Typography>読み込み中...</Typography>
                </Box>
              ) : (
                <>
                  {/* 出品中/下書き/売却済みタブ */}
                  {currentTab >= 0 && currentTab <= 2 && (
                    <Grid container spacing={2}>
                      {(() => {
                        const statusMap: Record<number, Item['status']> = {
                          0: 'on_sale',
                          1: 'draft',
                          2: 'sold_out',
                        };
                        const status = statusMap[currentTab];
                        const filtered = myItems.filter((i) => i.status === status);

                        if (filtered.length === 0) {
                          return (
                            <Grid size={{ xs: 12 }}>
                              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                {status === 'on_sale' && '出品中の商品がありません'}
                                {status === 'draft' && '下書きの商品がありません'}
                                {status === 'sold_out' && '売却済みの商品がありません'}
                              </Typography>
                            </Grid>
                          );
                        }

                        return filtered.map((item) => (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                            <Card>
                              {item.images && item.images.length > 0 && (
                                <CardMedia
                                  component="img"
                                  height="200"
                                  image={item.images[0].image_url}
                                  alt={item.name}
                                  sx={{ objectFit: 'cover' }}
                                />
                              )}
                              <CardContent>
                                <Typography variant="h6" noWrap>
                                  {item.rpg_name || item.name}
                                </Typography>
                                <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                                  {formatCurrency(item.price)}
                                </Typography>
                                <Chip
                                  label={itemStatusLabels[item.status]}
                                  size="small"
                                  color={item.status === 'on_sale' ? 'success' : 'default'}
                                  sx={{ mt: 1 }}
                                />
                              </CardContent>
                              <CardActions sx={{ flexDirection: 'column', gap: 1 }}>
                                <Button
                                  size="small"
                                  onClick={() => navigate(`/items/${item.id}`)}
                                  fullWidth
                                >
                                  商品詳細
                                </Button>

                                {status === 'draft' && (
                                  <Button size="small" onClick={() => navigate(`/items/${item.id}/edit`)} fullWidth>
                                    編集
                                  </Button>
                                )}

                                {status === 'sold_out' && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<MessageIcon />}
                                    onClick={async () => {
                                      setMessageError(null);
                                      setMessageLoadingId(item.id);
                                      try {
                                        // まずフロントの購入履歴から該当取引を探す
                                        let localTx = myPurchases.find((t) => t.item_id === item.id);

                                        // 見つからなければ購入履歴を最新化して再検索（購入直後のケースに対応）
                                        if (!localTx) {
                                          try {
                                            const purchasesRes = await extendedItemApi.getMyPurchases();
                                            setMyPurchases(purchasesRes.data || []);
                                            localTx = (purchasesRes.data || []).find((t: Transaction) => t.item_id === item.id);
                                          } catch (err) {
                                            console.error('Failed to refresh purchases:', err);
                                          }
                                        }

                                        if (localTx && localTx.id) {
                                          navigate(`/messages/${localTx.id}`);
                                        } else {
                                          const res = await extendedItemApi.getItemTransaction(item.id);
                                          const tx: Transaction = res.data;
                                          if (!tx || !tx.id) {
                                            setMessageError('取引情報が見つかりません');
                                          } else {
                                            navigate(`/messages/${tx.id}`);
                                          }
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        setMessageError('取引情報の取得に失敗しました');
                                      } finally {
                                        setMessageLoadingId(null);
                                      }
                                    }}
                                    disabled={messageLoadingId === item.id}
                                    fullWidth
                                  >
                                    メッセージ
                                  </Button>
                                )}
                              </CardActions>
                            </Card>
                          </Grid>
                        ));
                      })()}
                    </Grid>
                  )}

                  {/* 購入商品タブ */}
                  {currentTab === 3 && (
                    <Grid container spacing={2}>
                      {myPurchases.length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                            購入した商品がありません
                          </Typography>
                        </Grid>
                      ) : (
                        myPurchases.map((transaction) => (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={transaction.id}>
                            <Card>
                              {transaction.item?.images && transaction.item.images.length > 0 && (
                                <CardMedia
                                  component="img"
                                  height="200"
                                  image={transaction.item.images[0].image_url}
                                  alt={transaction.item.name}
                                  sx={{ objectFit: 'cover' }}
                                />
                              )}
                              <CardContent>
                                <Typography variant="h6" noWrap>
                                  {transaction.item?.name}
                                </Typography>
                                <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                                  {formatCurrency(transaction.price)}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                  <Chip label={transactionStatusLabels[transaction.transaction_status] || transaction.transaction_status} size="small" />
                                  <Chip label={paymentStatusLabels[transaction.payment_status] || transaction.payment_status} size="small" color="primary" />
                                </Box>
                              </CardContent>
                              <CardActions sx={{ flexDirection: 'column', gap: 1 }}>
                                <Button
                                  size="small"
                                  onClick={() => navigate(`/items/${transaction.item_id}`)}
                                  fullWidth
                                >
                                  商品詳細
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<MessageIcon />}
                                  onClick={() => navigate(`/messages/${transaction.id}`)}
                                  fullWidth
                                >
                                  メッセージ
                                </Button>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))
                      )}
                    </Grid>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* プロフィール編集ダイアログ */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>プロフィール編集</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}

          {/* アバター画像 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={avatarPreview}
              sx={{ width: 100, height: 100, mb: 2 }}
            >
              {editData.nickname.charAt(0).toUpperCase()}
            </Avatar>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCameraIcon />}
              size="small"
            >
              画像を変更
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Button>
          </Box>

          <TextField
            fullWidth
            label="ニックネーム"
            value={editData.nickname}
            onChange={(e) => setEditData({ ...editData, nickname: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="自己紹介"
            value={editData.bio}
            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleUpdateProfile} variant="contained" disabled={editLoading || !editData.nickname}>
            {editLoading ? '更新中...' : '更新'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* アカウント削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>アカウント削除</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}

          <Alert severity="warning" sx={{ mb: 2 }}>
            この操作は取り消せません。アカウントを削除すると、すべてのデータが完全に削除されます。
          </Alert>

          <Typography variant="body2" sx={{ mb: 2 }}>
            本当に削除する場合は、下のテキストフィールドに <strong>DELETE</strong> と入力してください。
          </Typography>

          <TextField
            fullWidth
            label="確認用テキスト"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
          >
            {deleteLoading ? '削除中...' : '削除'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* チャージダイアログ */}
      <Dialog open={chargeDialogOpen} onClose={() => setChargeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>💰 ゴールドをチャージ</DialogTitle>
        <DialogContent>
          {chargeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {chargeError}
            </Alert>
          )}
          {chargeSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              チャージが完了しました！
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            チャージする金額を入力してください（上限: 100,000円）
          </Typography>

          {/* プリセット金額ボタン */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {[1000, 3000, 5000, 10000, 30000, 50000].map((amount) => (
              <Button
                key={amount}
                variant="outlined"
                size="small"
                onClick={() => handlePresetAmount(amount)}
                sx={{ minWidth: '80px' }}
              >
                {formatCurrency(amount)}
              </Button>
            ))}
          </Box>

          <TextField
            fullWidth
            label="チャージ金額"
            type="number"
            value={chargeAmount}
            onChange={(e) => setChargeAmount(e.target.value)}
            margin="normal"
            required
            InputProps={{
              inputProps: { min: 1, max: 100000 },
            }}
            helperText="1円〜100,000円の範囲で入力してください"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChargeDialogOpen(false)} disabled={chargeLoading}>
            キャンセル
          </Button>
          <Button
            onClick={handleCharge}
            variant="contained"
            disabled={chargeLoading || !chargeAmount || chargeSuccess}
          >
            {chargeLoading ? 'チャージ中...' : 'チャージ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
