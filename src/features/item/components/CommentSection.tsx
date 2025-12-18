import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { commentApi } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

interface Comment {
  id: number;
  item_id: number;
  user_id: number;
  comment: string;
  is_deleted: boolean;
  created_at: string;
  user?: {
    id: number;
    profile?: {
      nickname: string;
      avatar_url?: string;
    };
  };
}

interface CommentSectionProps {
  itemId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ itemId }) => {
  const { user, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      fetchComments();
    }
  }, [itemId, user, authLoading]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await commentApi.getComments(itemId);
      setComments(response.data);
    } catch (error: any) {
      const message = error.response?.data?.error || 'コメントの取得に失敗しました';
      setError(message);
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('ログインが必要です');
      return;
    }
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    console.log('Submitting comment:', newComment.trim());
    try {
      await commentApi.addComment(itemId, newComment.trim());
      setNewComment('');
      fetchComments(); // 再取得
    } catch (error: any) {
      const message = error.response?.data?.error || 'コメントの投稿に失敗しました';
      setError(message);
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentApi.deleteComment(commentId);
      fetchComments(); // 再取得
    } catch (error: any) {
      const message = error.response?.data?.error || 'コメントの削除に失敗しました';
      setError(message);
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        コメント
      </Typography>

      {/* コメント投稿フォーム */}
      {user ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            multiline
            rows={3}
            fullWidth
            inputProps={{ maxLength: 500 }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {newComment.length}/500文字
            </Typography>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !newComment.trim()}
              sx={{ minWidth: 120 }}
            >
              {submitting ? <CircularProgress size={20} /> : 'コメントする'}
            </Button>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          コメントを投稿するにはログインが必要です
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      {/* コメント一覧 */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {comments.map((comment) => (
            <Box key={comment.id} sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar
                  src={comment.user?.profile?.avatar_url}
                  sx={{ width: 32, height: 32 }}
                >
                  {comment.user?.profile?.nickname?.[0] || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {comment.user?.profile?.nickname || '匿名ユーザー'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {comment.comment}
                  </Typography>
                </Box>
                {user && user.uid === comment.user_id?.toString() && (
                  <IconButton
                    onClick={() => handleDelete(comment.id)}
                    size="small"
                    color="error"
                    sx={{ ml: 'auto' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
          {comments.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              まだコメントはありません
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default CommentSection;
