import React, { useState } from 'react';
import { likeApi } from '../../../services/api';

interface LikeButtonProps {
  itemId: number;
  initialLikesCount: number;
  isLiked: boolean;
  onLikeChange?: (likesCount: number, isLiked: boolean) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  itemId,
  initialLikesCount,
  isLiked,
  onLikeChange,
}) => {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [liked, setLiked] = useState(isLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (liked) {
        await likeApi.removeLike(itemId);
        setLikesCount(prev => prev - 1);
        setLiked(false);
      } else {
        await likeApi.addLike(itemId);
        setLikesCount(prev => prev + 1);
        setLiked(true);
      }
      onLikeChange?.(likesCount, liked);
    } catch (error) {
      console.error('Like operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-1 px-3 py-1 rounded ${
        liked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
      } hover:opacity-80 disabled:opacity-50`}
    >
      <span>❤️</span>
      <span>{likesCount}</span>
    </button>
  );
};

export default LikeButton;
