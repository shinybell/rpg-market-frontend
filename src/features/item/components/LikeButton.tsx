import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { likeApi } from '../../../services/api';

interface LikeButtonProps {
  itemId: number;
  initialLikesCount: number;
  isLiked?: boolean;
  onLikeChange?: (likesCount: number, isLiked: boolean) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  itemId,
  initialLikesCount,
  isLiked: initialIsLiked,
  onLikeChange,
}) => {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [liked, setLiked] = useState(initialIsLiked || false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await likeApi.getLikeStatus(itemId);
        setLiked(response.data.liked);
        setInitialized(true);
      } catch (error) {
        console.error('Failed to fetch like status:', error);
        setInitialized(true); // エラー時も初期化完了
      }
    };

    if (!initialized) {
      fetchLikeStatus();
    }
  }, [itemId, initialized]);

  const handleLike = async () => {
    if (loading || !initialized) return;
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

  if (!initialized) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton disabled>
          <FavoriteBorderIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {likesCount}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        onClick={handleLike}
        disabled={loading}
        sx={{
          color: liked ? 'error.main' : 'text.secondary',
          '&:hover': {
            color: 'error.main',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
      <Typography variant="body2" color="text.secondary">
        {likesCount}
      </Typography>
    </Box>
  );
};

export default LikeButton;
