/**
 * 通貨フォーマットユーティリティ
 * RPG世界観に合わせて「G（ゴールド）」表記に統一
 */

/**
 * 金額をゴールド表記にフォーマット
 * @param amount - 金額（円）
 * @returns フォーマットされた文字列（例: "10,000 G"）
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ja-JP')} G`;
};

/**
 * 通貨サフィックス（説明用）
 */
export const CURRENCY_SUFFIX = 'G（ゴールド）';

/**
 * 通貨の注記（決済画面等で表示）
 */
export const CURRENCY_NOTE = '※1G = 1円';
