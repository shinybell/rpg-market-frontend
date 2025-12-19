import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Avatar,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useWebSocket } from '../hooks/useWebSocket';
import { MessageBubble } from '../features/message/components/MessageBubble';
import { messageApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Transaction } from '../types/message';

export const MessagePage = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, setMessages, connected, error, sendMessage } = useWebSocket(
    Number(transactionId)
  );

  // 取引情報を取得
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) return;

      try {
        setLoading(true);
        // 取引情報を取得（transactionId は transaction の ID）
        const txResponse = await messageApi.getTransaction(Number(transactionId));
        setTransaction(txResponse.data);

        // 既存メッセージを取得
        const messagesResponse = await messageApi.getMessages(Number(transactionId));
        setMessages(messagesResponse.data || []);
      } catch (err) {
        console.error('Failed to load transaction:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, setMessages]);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // IME の確定タイミングによる入力残りを防ぐため、送信時は入力を先にクリアしてから送信する
  const handleSendMessage = () => {
    const content = inputMessage.trim();
    if (!content || !connected) return;

    // 先に入力欄をクリアしておく（IME確定などで残ってしまう問題対策）
    setInputMessage('');
    sendMessage(content);
  };
  const composingRef = useRef(false);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // IME 変換中は送信しない
    if (e.nativeEvent?.isComposing || composingRef.current) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!transaction) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">取引情報が見つかりません</Alert>
      </Container>
    );
  }

  // 相手のユーザー情報を取得（未使用のため削除）

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            {transaction.item?.images?.[0] && (
              <Avatar
                src={transaction.item.images[0].image_url}
                alt={transaction.item.name}
                variant="rounded"
                sx={{ width: 40, height: 40 }}
              />
            )}
            <Box>
              <Typography variant="h6">{transaction.item?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                取引ID: #{transaction.id}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={connected ? '接続中' : '切断'}
            color={connected ? 'success' : 'error'}
            size="small"
          />
        </Toolbar>
      </AppBar>

      {/* メッセージエリア */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          backgroundColor: 'grey.50',
          p: 2,
        }}
      >
        <Container maxWidth="md">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {messages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                minHeight: 200,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                メッセージがありません。最初のメッセージを送信してみましょう。
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.sender_id === profile?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </Container>
      </Box>

      {/* 入力エリア */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="メッセージを入力..."
              value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                onCompositionStart={() => (composingRef.current = true)}
                onCompositionEnd={() => (composingRef.current = false)}
              disabled={!connected}
              variant="outlined"
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !connected}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'grey.300',
                  color: 'grey.500',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};
