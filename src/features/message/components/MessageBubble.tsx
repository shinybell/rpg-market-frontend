import { Box, Typography, Avatar } from '@mui/material';
import type { Message } from '../../../types/message';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble = ({ message, isOwnMessage }: MessageBubbleProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 1,
        mb: 2,
      }}
    >
      {!isOwnMessage && (
        <Avatar
          src={message.sender?.profile?.avatar_url}
          alt={message.sender?.profile?.nickname}
          sx={{ width: 32, height: 32 }}
        >
          {message.sender?.profile?.nickname?.[0] || 'U'}
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
        }}
      >
        {!isOwnMessage && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, px: 1 }}>
            {message.sender?.profile?.nickname || 'Unknown User'}
          </Typography>
        )}

        <Box
          sx={{
            backgroundColor: isOwnMessage ? 'primary.main' : 'grey.200',
            color: isOwnMessage ? 'white' : 'text.primary',
            borderRadius: 2,
            px: 2,
            py: 1.5,
            wordBreak: 'break-word',
          }}
        >
          <Typography variant="body1">{message.content}</Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 1 }}>
          {formatTime(message.created_at)}
        </Typography>
      </Box>
    </Box>
  );
};
