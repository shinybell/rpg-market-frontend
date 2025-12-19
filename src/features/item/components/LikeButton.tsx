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
  const [liked, setLiked] = useState(initialIsLiked ?? false);
  const [loading, setLoading] = useState(false);

  // Only fetch like status if not provided by parent
  useEffect(() => {
    if (initialIsLiked === undefined) {
      const fetchLikeStatus = async () => {
        try {
          const response = await likeApi.getLikeStatus(itemId);
          setLiked(response.data.liked);
        } catch (error) {
          console.error('Failed to fetch like status:', error);
        }
      };
      fetchLikeStatus();
    }
  }, [itemId, initialIsLiked]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (liked) {
        await likeApi.removeLike(itemId);
        setLikesCount(prev => prev - 1);
        setLiked(false);
        onLikeChange?.(likesCount - 1, false);
      } else {
        await likeApi.addLike(itemId);
        setLikesCount(prev => prev + 1);
        setLiked(true);
        onLikeChange?.(likesCount + 1, true);
      }
    } catch (error) {
      console.error('Like operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

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
