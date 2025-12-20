import { Box, Paper, Typography, Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

/**
 * 店主ナビゲーターコンポーネント
 * RPG世界観を演出するため、時間帯やページに応じてセリフを変化させる
 */
export const ShopkeeperNavigator = () => {
  const location = useLocation();

  // 時間帯に応じた挨拶を取得
  const getGreeting = useCallback((): string => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 10) {
      return 'おはよう！早起きは三文の徳、って言うだろう？今日も良い品が入ってるぜ。';
    } else if (hour >= 10 && hour < 18) {
      return 'ようこそ！今日はどんな伝説の品を探しに来たんだい？';
    } else if (hour >= 18 && hour < 23) {
      return 'いらっしゃい！夜の市場には珍しい品が並ぶもんさ。';
    } else {
      return 'こんな時間に...よほど探してる品があるんだな。俺も付き合うぜ。';
    }
  }, []);

  // ページに応じたセリフを取得
  const getPageSpecificMessage = useCallback((): string | null => {
    const path = location.pathname;

    if (path === '/items') {
      return '店内の品を自由に見ていってくれ。気になるものがあったら声をかけてくれよな。';
    } else if (path === '/items/new') {
      return '品物を鑑定に出すのか？ギルドの鑑定士が丁寧に調べてくれるぜ。';
    } else if (path.startsWith('/items/') && path.includes('/edit')) {
      return '品物の情報を更新するのか。詳しく書いた方が冒険者たちの目に留まるぞ。';
    } else if (path.startsWith('/items/search')) {
      return '探し物は見つかったか？見つからなかったらまた声をかけてくれ。';
    } else if (path === '/dashboard') {
      return 'お疲れさん！冒険の成果を確認していくといい。';
    } else if (path.startsWith('/items/')) {
      return 'ほう、目が高いな。それは良い品だぜ。';
    }

    return null;
  }, [location.pathname]);

  // 表示するメッセージを決定（ページ固有メッセージ優先、なければ挨拶）
  const message = useMemo(() => {
    return getPageSpecificMessage() || getGreeting();
  }, [getPageSpecificMessage, getGreeting]);

  return (
    <Paper
      elevation={3}
      sx={{
        mb: 3,
        p: 2.5,
        background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)',
        border: '3px solid #8b7355',
        borderLeft: '6px solid #d4af37',
        boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        position: 'relative',
        '&::before': {
          content: '"⚜"',
          position: 'absolute',
          top: -12,
          left: -12,
          fontSize: '1.5rem',
          color: '#d4af37',
        },
        '&::after': {
          content: '"⚜"',
          position: 'absolute',
          bottom: -12,
          right: -12,
          fontSize: '1.5rem',
          color: '#d4af37',
        },
      }}
    >
      {/* 店主のアバター */}
      <Avatar
        sx={{
          width: 64,
          height: 64,
          bgcolor: '#d4af37',
          fontSize: '2.5rem',
          border: '3px solid #8b7355',
          boxShadow: '0 0 12px rgba(212, 175, 55, 0.5)',
        }}
      >
        🧙
      </Avatar>

      {/* セリフ */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 0.5,
            fontWeight: 'bold',
            color: '#8b7355',
            fontFamily: 'Cinzel, serif',
            letterSpacing: '1px',
          }}
        >
          店主
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontStyle: 'italic',
            color: '#1a1410',
            fontFamily: 'Cinzel, serif',
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Paper>
  );
};
