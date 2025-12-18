import React, { useState } from 'react';
import { followApi } from '../../../services/api';

interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing,
  onFollowChange,
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await followApi.removeFollow(userId);
        setFollowing(false);
      } else {
        await followApi.addFollow(userId);
        setFollowing(true);
      }
      onFollowChange?.(following);
    } catch (error) {
      console.error('Follow operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded ${
        following ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'
      } hover:opacity-80 disabled:opacity-50`}
    >
      {loading ? '処理中...' : following ? 'フォロー中' : 'フォロー'}
    </button>
  );
};

export default FollowButton;
