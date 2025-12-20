// Transaction status labels
export const transactionStatusLabels: Record<string, string> = {
    awaiting_payment: '支払い待ち',
    awaiting_ship: '発送待ち',
    shipped: '発送済み',
    delivered: '配達完了',
    cancelled: 'キャンセル',
    completed: '完了',
};

// Payment status labels
export const paymentStatusLabels: Record<string, string> = {
    pending: '支払い待ち',
    captured: '支払い済み',
    failed: '支払い失敗',
    refunded: '返金済み',
    cancelled: 'キャンセル',
};

// Item status labels
export const itemStatusLabels: Record<string, string> = {
    sold_out: '売却済み',
    on_sale: '出品中',
    draft: '下書き',
    trading: '取引中',
    suspended: '停止中',
};
