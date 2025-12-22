import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useScroll } from '../../context/ScrollContext';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import MenuSection from '../../components/Profile/MenuSection';
import EditParentProfileModal from '../../components/Parent/EditParentProfileModal';
import ChangePasswordModal from '../../components/Profile/ChangePasswordModal';
import { getPaymentsByUser, getAllTransactions, transferParentToStudent } from '../../services/paymentService';
import ParentService from '../../services/parentService';
import type { WalletTransaction } from '../../types/storeTypes';
import type { ChildInfo } from '../../types/parent';

const ParentProfileScreen = () => {
  const { user, logout, refreshUser } = useAuth();
  const { handleScroll } = useScroll();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [transferStudentId, setTransferStudentId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childrenError, setChildrenError] = useState<string | null>(null);

  const handleProfileUpdated = async () => {
    try {
      await refreshUser();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleChangeAvatar = () => {
    Alert.alert('Change avatar', 'The change avatar feature will be developed soon!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'The settings feature will be developed soon!');
  };

  const handleSubscription = () => {
    Alert.alert('Subscription', 'The subscription feature will be developed soon!');
  };

  const handleTransferToChild = () => {
    setTransferError(null);
    setTransferSuccess(null);
    // refresh children list when opening modal
    fetchChildren();
    setTransferModalVisible(true);
  };

  const handleConfirmTransfer = () => {
    setTransferError(null);
    setTransferSuccess(null);
    if (!transferStudentId.trim() || !transferAmount.trim()) {
      setTransferError('Please select student and enter amount.');
      return;
    }
    const amountNumber = Number(transferAmount);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setTransferError('Amount must be greater than 0.');
      return;
    }

    const parentId = user?.id;
    if (!parentId) {
      setTransferError('Missing parent id.');
      return;
    }

    const doTransfer = async () => {
      try {
        setTransferLoading(true);
        setTransferError(null);
        setTransferSuccess(null);
        const res = await transferParentToStudent(
          parentId,
          transferStudentId.trim(),
          amountNumber,
        );
        setTransferSuccess(res?.message || 'Transfer success.');
        // Refresh balance & transactions after transfer
        await Promise.all([refreshWallet(), refreshTransactions()]);
        setTransferModalVisible(false);
      } catch (error: any) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'Transfer failed.';
        setTransferError(msg);
      } finally {
        setTransferLoading(false);
      }
    };

    doTransfer();
  };

  const handleSupport = () => {
    Alert.alert('Support', 'The support feature will be developed soon!');
  };

  // Lấy số dư ví từ API GET /payments/by-user
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setWalletLoading(true);
        setWalletError(null);

        const res = await getPaymentsByUser();
        // API spec: { code, message, data: { amount, ... } }
        const amount = res?.data?.amount;
        if (typeof amount === 'number') {
          setWalletBalance(amount);
        } else {
          setWalletBalance(0);
        }
      } catch (error: any) {
        console.error('Failed to load wallet balance:', error);
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'Không thể tải số dư ví.';
        setWalletError(msg);
        setWalletBalance(0);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWallet();
  }, []);

  const fetchChildren = async () => {
    try {
      setChildrenLoading(true);
      setChildrenError(null);
      const res = await ParentService.getChildren();
      const list = res?.data?.data || [];
      setChildren(list);
      // auto select first child if none selected
      if (!transferStudentId && list.length > 0) {
        setTransferStudentId(list[0].studentId);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Cannot load linked students.';
      setChildrenError(msg);
    } finally {
      setChildrenLoading(false);
    }
  };

  const refreshWallet = async () => {
    try {
      setWalletLoading(true);
      setWalletError(null);

      const res = await getPaymentsByUser();
      const amount = res?.data?.amount;
      if (typeof amount === 'number') {
        setWalletBalance(amount);
      } else {
        setWalletBalance(0);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải số dư ví.';
      setWalletError(msg);
      setWalletBalance(0);
    } finally {
      setWalletLoading(false);
    }
  };

  // Lấy lịch sử giao dịch ví từ API GET /api/transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTransactionsLoading(true);
        setTransactionsError(null);

        const list = await getAllTransactions();
        // API /api/transactions trả về tất cả giao dịch của user hiện tại (đã auth)
        // Sắp xếp mới nhất lên đầu
        const sorted = [...list].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setTransactions(sorted);
      } catch (error: any) {
        console.error('Failed to load wallet transactions:', error);
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'Không thể tải lịch sử giao dịch.';
        setTransactionsError(msg);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const refreshTransactions = async () => {
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      const list = await getAllTransactions();
      const sorted = [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setTransactions(sorted);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải lịch sử giao dịch.';
      setTransactionsError(msg);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit profile',
      subtitle: 'Update your occupation',
      icon: '👤',
      onPress: () => setIsEditModalVisible(true),
    },
    {
      id: 'subscription',
      title: 'Subscription',
      subtitle: 'Manage your subscription and payment',
      icon: '💎',
      onPress: handleSubscription,
    },
    {
      id: 'wallet',
      title: 'Wallet',
      subtitle: 'View balance & transactions',
      icon: '💰',
      onPress: () => setIsWalletVisible(true),
    },
    {
      id: 'change-password',
      title: 'Change password',
      subtitle: 'Update your password',
      icon: '🔒',
      onPress: () => setIsChangePasswordModalVisible(true),
    },
    {
      id: 'support',
      title: 'Support',
      subtitle: 'Contact support and help',
      icon: '📞',
      onPress: handleSupport,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App options and notifications',
      icon: '⚙️',
      onPress: handleSettings,
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Logout from account',
      icon: '🚪',
      onPress: handleLogout,
      variant: 'danger' as const,
      showArrow: false,
    },

  ];

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Loading user information...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 mb-10">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header with gradient background */}
        <ProfileHeader
          user={user}
          onChangeAvatar={handleChangeAvatar}
        />

        {/* Additional Profile Info */}
        <View className="px-6 pb-6 mt-4">
          <View className="bg-white rounded-2xl p-6 shadow-sm">

            {/* Date of Birth */}
            <View className="flex-row items-center mb-4">
              <Text className="text-sm font-semibold text-gray-600 flex-1">
                Date of Birth:
              </Text>
              <Text className="text-base font-medium text-gray-800">
                {user?.dob || 'Not updated'}
              </Text>
            </View>

            {/* Occupation */}
            <View className="flex-row items-center">
              <Text className="text-sm font-semibold text-gray-600 flex-1">
                Occupation:
              </Text>
              <Text className="text-base font-medium text-gray-800">
                {user.parentProfile?.occupation || 'Not updated'}
              </Text>
            </View>

          </View>
        </View>


        {/* Menu Items */}
        <MenuSection items={menuItems} />
      </ScrollView>

      {/* Modals */}
      {/* Wallet Modal */}
      <Modal
        visible={isWalletVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsWalletVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Parent Wallet
              </Text>
              <TouchableOpacity onPress={() => setIsWalletVisible(false)}>
                <Text className="text-sm text-gray-500 font-medium">
                  Close
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-600">
                  Current balance
                </Text>
                {walletLoading ? (
                  <Text className="text-base text-gray-500 mt-1">
                    Đang tải số dư...
                  </Text>
                ) : walletError ? (
                  <Text className="text-xs text-red-500 mt-1">
                    {walletError}
                  </Text>
                ) : (
                  <Text className="text-2xl font-bold text-emerald-600 mt-1">
                    {walletBalance !== null
                      ? `${walletBalance.toLocaleString('vi-VN')} VND`
                      : '0 VND'}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={handleTransferToChild}
                className="px-4 py-2 rounded-full bg-emerald-500"
                disabled={transferLoading}
              >
                {transferLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-sm font-semibold">
                    Transfer to child
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Transfer form will be shown in nested modal */}

            <View className="border-t border-gray-100 pt-4 flex-1">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-700">
                  Recent transactions
                </Text>
              </View>

              {transactionsLoading ? (
                <Text className="text-sm text-gray-500">
                  Đang tải lịch sử giao dịch...
                </Text>
              ) : transactionsError ? (
                <Text className="text-xs text-red-500">
                  {transactionsError}
                </Text>
              ) : transactions.length === 0 ? (
                <Text className="text-sm text-gray-500">
                  Chưa có giao dịch nào.
                </Text>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {transactions.map((tx) => {
                    const isIn = (tx.amount ?? 0) >= 0;
                    const amountAbs = Math.abs(tx.amount ?? 0);
                    const description =
                      tx.description ||
                      tx.externalReference ||
                      (isIn ? 'Top up wallet' : 'Wallet transfer');

                    return (
                      <View
                        key={tx.id}
                        className="flex-row items-center justify-between py-2"
                      >
                        <View className="flex-1 mr-2">
                          <Text className="text-sm font-medium text-gray-800">
                            {description}
                          </Text>
                          <Text className="text-xs text-gray-500 mt-1">
                            {new Date(tx.createdAt).toLocaleString('vi-VN')}
                          </Text>
                          {typeof tx.balanceAfter === 'number' && (
                            <Text className="text-xs text-gray-600 mt-1">
                              Balance after transaction:{' '}
                              {tx.balanceAfter.toLocaleString('vi-VN')} VND
                            </Text>
                          )}
                        </View>
                        <Text
                          className={`text-sm font-semibold ${
                            isIn ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {isIn ? '+' : '-'}{' '}
                          {amountAbs.toLocaleString('vi-VN')} VND
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>
      {/* Transfer nested modal */}
      <Modal
        visible={transferModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTransferModalVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Transfer to student
              </Text>
              <TouchableOpacity onPress={() => setTransferModalVisible(false)}>
                <Text className="text-sm text-gray-500 font-medium">Close</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Select linked student
              </Text>
              {childrenLoading ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : childrenError ? (
                <Text className="text-xs text-red-500">{childrenError}</Text>
              ) : children.length === 0 ? (
                <Text className="text-xs text-gray-500">
                  No linked students. Please link a student first.
                </Text>
              ) : (
                <ScrollView
                  style={{ maxHeight: 150 }}
                  showsVerticalScrollIndicator={false}
                >
                  {children.map((child) => {
                    const selected = transferStudentId === child.studentId;
                    return (
                      <TouchableOpacity
                        key={child.studentId}
                        className={`mb-2 p-3 rounded-lg border ${
                          selected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'
                        }`}
                        onPress={() => setTransferStudentId(child.studentId)}
                      >
                        <Text className="text-sm font-semibold text-gray-900">
                          {child.studentName || 'Unnamed'}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          Email: {child.email}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
            <TextInput
              placeholder="Amount (VND)"
              value={transferAmount}
              onChangeText={setTransferAmount}
              keyboardType="numeric"
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3 text-sm"
            />

            {transferError && (
              <Text className="text-xs text-red-500 mb-2">{transferError}</Text>
            )}
            {transferSuccess && (
              <Text className="text-xs text-emerald-600 mb-2">
                {transferSuccess}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleConfirmTransfer}
              className="mt-2 bg-emerald-500 rounded-full py-3 items-center"
              disabled={transferLoading}
            >
              {transferLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Confirm transfer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <EditParentProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      <ChangePasswordModal
        visible={isChangePasswordModalVisible}
        onClose={() => setIsChangePasswordModalVisible(false)}
      />
    </View>
  );
};

export default ParentProfileScreen;
