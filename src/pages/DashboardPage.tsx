import { useState } from 'react';
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
  IconButton,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarsIcon from '@mui/icons-material/Stars';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { userApi } from '../services/api';
import { useImageUpload } from '../hooks/useImageUpload';
import type { AxiosError } from 'axios';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { uploadImages } = useImageUpload();

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

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box>Loading...</Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        ダッシュボード
      </Typography>

      <Grid container spacing={3}>
        {/* プロフィールカード */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
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
                  }}
                >
                  {profile.profile?.nickname.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {profile.profile?.nickname}
                </Typography>
                {profile.profile?.bio && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    {profile.profile.bio}
                  </Typography>
                )}
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
            <Typography variant="h5" gutterBottom>
              アカウント情報
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                ユーザーID
              </Typography>
              <Typography variant="body1">#{profile.id}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                メールアドレス
              </Typography>
              <Typography variant="body1">{profile.email}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Firebase UID
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {profile.firebase_uid}
              </Typography>
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

        {/* ウォレット情報 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceWalletIcon
                  sx={{ fontSize: 40, color: 'primary.main', mr: 2 }}
                />
                <Typography variant="h6">ウォレット残高</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                ¥{profile.wallet?.balance.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StarsIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Typography variant="h6">ポイント</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {profile.wallet?.points.toLocaleString() || 0} pt
              </Typography>
            </CardContent>
          </Card>
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
    </Container>
  );
};
