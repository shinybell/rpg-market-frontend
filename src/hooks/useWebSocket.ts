import { useEffect, useRef, useState, useCallback } from 'react';
import { auth } from '../config/firebase';
import type { Message } from '../types/message';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/ws';

export const useWebSocket = (transactionId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(async () => {
    try {
      // 既に接続中または接続中のインスタンスがある場合は二重接続を防ぐ
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        console.log('WebSocket already connected or connecting, skip creating a new one');
        return;
      }
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setError('認証が必要です');
        return;
      }

      const ws = new WebSocket(
        `${WS_BASE_URL}/transactions/${transactionId}`
      );

      ws.onopen = () => {
        console.log('WebSocket connected, sending auth...');
        // 接続後すぐに認証メッセージを送信
        ws.send(JSON.stringify({ type: 'auth', token }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // 認証成功メッセージの処理
          if (data.type === 'auth_success') {
            console.log('Authentication successful');
            setConnected(true);
            setError(null);
            return;
          }

          // エラーメッセージの処理
          if (data.error) {
            console.error('WebSocket error:', data.error);
            setError(data.error);
            setConnected(false);
            ws.close();
            return;
          }

          // 通常のメッセージ
          const message: Message = data;
          // 重複を防ぐ（同一IDのメッセージが既に存在する場合は追加しない）
          setMessages((prev) => {
            if (message.id && prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('接続エラーが発生しました');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);

        // 5秒後に自動再接続
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Reconnecting...');
          connect();
        }, 5000);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('接続に失敗しました');
    }
  }, [transactionId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!wsRef.current || !connected) {
        setError('接続されていません');
        return;
      }

      try {
        wsRef.current.send(JSON.stringify({ content }));
      } catch (err) {
        console.error('Failed to send message:', err);
        setError('メッセージの送信に失敗しました');
      }
    },
    [connected]
  );

  return { messages, setMessages, connected, error, sendMessage };
};
