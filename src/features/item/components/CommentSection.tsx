import React, { useState, useEffect } from 'react';
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
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">コメント</h3>

      {/* コメント投稿フォーム */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="w-full p-2 border rounded resize-none"
            rows={3}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? '投稿中...' : 'コメントする'}
          </button>
          {error && <p className="mt-2 text-red-500">{error}</p>}
        </form>
      ) : (
        <p className="mb-4 text-gray-500">コメントを投稿するにはログインが必要です</p>
      )}

      {/* コメント一覧 */}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {comment.user?.profile?.nickname || '匿名ユーザー'}
                  </p>
                  <p className="text-gray-700">{comment.comment}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p>コメントはありません</p>}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
