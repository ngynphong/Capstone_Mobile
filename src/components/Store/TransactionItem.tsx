import React from 'react';
import { View, Text } from 'react-native';
import { Transaction } from '../../types/storeTypes';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string = 'VND') => {
    // Format số tiền theo định dạng VND
    const formattedAmount = Math.abs(amount).toLocaleString('vi-VN');
    return `${formattedAmount} ₫`;
  };

  // Kiểm tra loại giao dịch dựa trên description và referenceId
  const getTransactionType = () => {
    const description = transaction.description || '';
    const referenceId = transaction.referenceId || '';
    const combinedText = `${description} ${referenceId}`.toUpperCase();
    
    // Kiểm tra TOP UP WALLET (nạp tiền) - màu xanh và dấu +
    if (combinedText.includes('TOP UP WALLET')) {
      return { color: 'text-green-600', sign: '+' };
    }
    
    // Kiểm tra PAYMENT LEARNING (thanh toán học liệu) - màu đỏ và dấu -
    if (combinedText.includes('PAYMENT LEARNING')) {
      return { color: 'text-red-600', sign: '-' };
    }
    
    // Mặc định: refund thì xanh và +, còn lại thì đỏ và -
    return transaction.type === 'refund' 
      ? { color: 'text-green-600', sign: '+' }
      : { color: 'text-gray-900', sign: '-' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'pending':
        return ''; // Bỏ icon đồng hồ cát
      case 'failed':
        return '✗';
      case 'cancelled':
        return '🚫';
      default:
        return '•';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'token_purchase':
        return '🪙';
      case 'subscription':
        return '👑';
      case 'refund':
        return '↩️';
      default:
        return '💳';
    }
  };

  return (
    <View className="mx-6 mb-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {/* Transaction type icon */}
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
            <Text className="text-lg">{getTypeIcon(transaction.type)}</Text>
          </View>

          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-base mb-1">
              {transaction.description}
            </Text>

            <View className="flex-row items-center">
              <Text className="text-gray-500 text-sm mr-3">
                {formatDate(transaction.createdAt)}
              </Text>

              {transaction.paymentMethod && (
                <Text className="text-gray-500 text-sm">
                  • {transaction.paymentMethod}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View className="items-end">
          {/* Amount */}
          {(() => {
            const transactionType = getTransactionType();
            return (
              <Text className={`font-bold text-base mb-1 ${transactionType.color}`}>
                {transactionType.sign}{formatAmount(transaction.amount, transaction.currency)}
              </Text>
            );
          })()}

          {/* Status */}
          <View className="flex-row items-center">
            {getStatusIcon(transaction.status) && (
              <Text className={`text-xs mr-1 ${getStatusColor(transaction.status)}`}>
                {getStatusIcon(transaction.status)}
              </Text>
            )}
            <Text className={`text-xs font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Reference ID for debugging (optional) */}
      {transaction.referenceId && (
        <Text className="text-gray-400 text-xs mt-2 ml-13">
          Ref: {transaction.referenceId}
        </Text>
      )}
    </View>
  );
};

export default TransactionItem;
