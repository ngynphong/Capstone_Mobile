import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useStudentFinancialStats } from '../../hooks/useStudentFinancialStats';
import { ProfileStackParamList } from '../../types/types';
import {
    ChevronLeft,
    Wallet,
    ShoppingBag,
    TrendingDown,
    CreditCard,
    Calendar,
    BookOpen,
    FileText,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

const StudentFinancialStatsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();
    const {
        stats,
        totalSpent,
        totalRegisteredMaterials,
        currentBalance,
        spendingBySubject,
        spendingByType,
        monthlySpending,
        recentPurchases,
        loading,
        fetchStats,
    } = useStudentFinancialStats();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Get max spending value for progress bar calculation
    const maxSubjectSpending = Object.values(spendingBySubject).length > 0
        ? Math.max(...Object.values(spendingBySubject))
        : 1;

    const maxTypeSpending = Object.values(spendingByType).length > 0
        ? Math.max(...Object.values(spendingByType))
        : 1;

    // Color palette for charts
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4'];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View style={{ backgroundColor: '#3CBCB2' }} className="px-6 pt-4 pb-8 rounded-b-3xl shadow-lg">
                {/* Back Button and Title */}
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold flex-1">Thống kê tài chính</Text>
                </View>

                <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1 mr-4">
                        <Text className="text-white/70 text-xs font-medium uppercase tracking-wider">
                            Xin chào
                        </Text>
                        <Text className="text-white text-2xl font-bold mt-2 mb-1">
                            {user?.firstName || 'Student'}
                        </Text>
                        <Text className="text-white/80 text-sm leading-5">
                            Theo dõi chi tiêu{'\n'}của bạn 💰
                        </Text>
                    </View>

                    {/* User Avatar */}
                    <View className="items-center">
                        <View className="w-16 h-16 bg-white rounded-full items-center justify-center p-0.5">
                            <View className="w-full h-full bg-teal-500 rounded-full items-center justify-center overflow-hidden">
                                {user?.imgUrl ? (
                                    <Image
                                        source={{ uri: user.imgUrl }}
                                        className="w-full h-full rounded-full"
                                    />
                                ) : (
                                    <Text className="text-2xl">👤</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Stats Bar */}
                <View className="flex-row items-center justify-between bg-white/10 rounded-xl px-4 py-3 backdrop-blur">
                    <View className="items-center flex-1">
                        <Text className="text-white text-xl font-bold">{formatCurrency(currentBalance)}</Text>
                        <Text className="text-white/70 text-xs mt-0.5">Số dư</Text>
                    </View>
                    <View className="w-px h-8 bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-white text-xl font-bold">{formatCurrency(totalSpent)}</Text>
                        <Text className="text-white/70 text-xs mt-0.5">Đã chi</Text>
                    </View>
                    <View className="w-px h-8 bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-white text-xl font-bold">{totalRegisteredMaterials}</Text>
                        <Text className="text-white/70 text-xs mt-0.5">Tài liệu</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3CBCB2']} />
                }
                showsVerticalScrollIndicator={false}
            >
                {loading && !stats ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#3CBCB2" />
                        <Text className="text-gray-500 mt-4">Đang tải thống kê...</Text>
                    </View>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <View className="px-6 py-6">
                            <Text className="text-lg font-bold text-gray-800 mb-4">📊 Tổng quan</Text>
                            <View className="flex-row flex-wrap justify-between">
                                {/* Current Balance */}
                                <View className="w-[48%] mb-4">
                                    <View style={{ backgroundColor: '#10B981' }} className="rounded-2xl p-4 shadow-md">
                                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                                            <Wallet size={20} color="white" />
                                        </View>
                                        <Text className="text-white text-xl font-bold" numberOfLines={1}>
                                            {formatCurrency(currentBalance)}
                                        </Text>
                                        <Text className="text-white/90 text-sm mt-1">Số dư hiện tại</Text>
                                    </View>
                                </View>

                                {/* Total Spent */}
                                <View className="w-[48%] mb-4">
                                    <View style={{ backgroundColor: '#EF4444' }} className="rounded-2xl p-4 shadow-md">
                                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                                            <TrendingDown size={20} color="white" />
                                        </View>
                                        <Text className="text-white text-xl font-bold" numberOfLines={1}>
                                            {formatCurrency(totalSpent)}
                                        </Text>
                                        <Text className="text-white/90 text-sm mt-1">Tổng đã chi</Text>
                                    </View>
                                </View>

                                {/* Total Materials */}
                                <View className="w-[48%] mb-4">
                                    <View style={{ backgroundColor: '#3B82F6' }} className="rounded-2xl p-4 shadow-md">
                                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                                            <ShoppingBag size={20} color="white" />
                                        </View>
                                        <Text className="text-white text-3xl font-bold">{totalRegisteredMaterials}</Text>
                                        <Text className="text-white/90 text-sm mt-1">Tài liệu đã mua</Text>
                                    </View>
                                </View>

                                {/* Average per material */}
                                <View className="w-[48%] mb-4">
                                    <View style={{ backgroundColor: '#8B5CF6' }} className="rounded-2xl p-4 shadow-md">
                                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                                            <CreditCard size={20} color="white" />
                                        </View>
                                        <Text className="text-white text-xl font-bold" numberOfLines={1}>
                                            {totalRegisteredMaterials > 0
                                                ? formatCurrency(totalSpent / totalRegisteredMaterials)
                                                : formatCurrency(0)}
                                        </Text>
                                        <Text className="text-white/90 text-sm mt-1">Trung bình/tài liệu</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Spending by Subject */}
                        {Object.keys(spendingBySubject).length > 0 && (
                            <View className="px-6 pb-6">
                                <View className="flex-row items-center mb-4">
                                    <BookOpen size={20} color="#374151" />
                                    <Text className="text-lg font-bold text-gray-800 ml-2">Chi tiêu theo môn học</Text>
                                </View>
                                <View className="bg-white rounded-2xl p-4 shadow-sm">
                                    {Object.entries(spendingBySubject).map(([subject, amount], index) => (
                                        <View key={subject} className={index > 0 ? 'mt-4' : ''}>
                                            <View className="flex-row justify-between mb-2">
                                                <Text className="text-gray-700 font-medium flex-1 mr-2" numberOfLines={1}>
                                                    {subject}
                                                </Text>
                                                <Text className="font-bold" style={{ color: colors[index % colors.length] }}>
                                                    {formatCurrency(amount)}
                                                </Text>
                                            </View>
                                            <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(amount / maxSubjectSpending) * 100}%`,
                                                        backgroundColor: colors[index % colors.length],
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Spending by Type */}
                        {Object.keys(spendingByType).length > 0 && (
                            <View className="px-6 pb-6">
                                <View className="flex-row items-center mb-4">
                                    <FileText size={20} color="#374151" />
                                    <Text className="text-lg font-bold text-gray-800 ml-2">Chi tiêu theo loại</Text>
                                </View>
                                <View className="bg-white rounded-2xl p-4 shadow-sm">
                                    {Object.entries(spendingByType).map(([type, amount], index) => (
                                        <View key={type} className={index > 0 ? 'mt-4' : ''}>
                                            <View className="flex-row justify-between mb-2">
                                                <Text className="text-gray-700 font-medium flex-1 mr-2" numberOfLines={1}>
                                                    {type}
                                                </Text>
                                                <Text className="font-bold" style={{ color: colors[(index + 3) % colors.length] }}>
                                                    {formatCurrency(amount)}
                                                </Text>
                                            </View>
                                            <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(amount / maxTypeSpending) * 100}%`,
                                                        backgroundColor: colors[(index + 3) % colors.length],
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Monthly Spending */}
                        {Object.keys(monthlySpending).length > 0 && (
                            <View className="px-6 pb-6">
                                <View className="flex-row items-center mb-4">
                                    <Calendar size={20} color="#374151" />
                                    <Text className="text-lg font-bold text-gray-800 ml-2">Chi tiêu theo tháng</Text>
                                </View>
                                <View className="bg-white rounded-2xl p-4 shadow-sm">
                                    {Object.entries(monthlySpending)
                                        .sort((a, b) => b[0].localeCompare(a[0]))
                                        .slice(0, 6)
                                        .map(([month, amount], index) => (
                                            <View key={month} className={`flex-row justify-between py-3 ${index > 0 ? 'border-t border-gray-100' : ''}`}>
                                                <Text className="text-gray-700 font-medium">{month}</Text>
                                                <Text className="font-bold text-teal-600">{formatCurrency(amount)}</Text>
                                            </View>
                                        ))}
                                </View>
                            </View>
                        )}

                        {/* Recent Purchases */}
                        <View className="px-6 pb-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <ShoppingBag size={20} color="#374151" />
                                    <Text className="text-lg font-bold text-gray-800 ml-2">Giao dịch gần đây</Text>
                                </View>
                            </View>

                            {recentPurchases.length === 0 ? (
                                <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                                    <View className="w-20 h-20 bg-teal-100 rounded-full items-center justify-center mb-4">
                                        <ShoppingBag size={40} color="#3CBCB2" />
                                    </View>
                                    <Text className="text-gray-800 font-semibold text-lg mb-2">
                                        Chưa có giao dịch
                                    </Text>
                                    <Text className="text-gray-500 text-center">
                                        Bạn chưa mua tài liệu nào.{'\n'}Hãy khám phá thư viện!
                                    </Text>
                                </View>
                            ) : (
                                <View className="space-y-3">
                                    {recentPurchases.slice(0, 5).map((purchase, index) => (
                                        <View
                                            key={purchase.materialId}
                                            className="bg-white rounded-2xl p-4 shadow-sm mb-2 flex-row"
                                        >
                                            {/* Material Image */}
                                            <View className="w-16 h-16 rounded-xl overflow-hidden mr-3 bg-gray-100">
                                                {purchase.fileImage ? (
                                                    <Image
                                                        source={{ uri: purchase.fileImage }}
                                                        className="w-full h-full"
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View className="w-full h-full items-center justify-center bg-teal-100">
                                                        <BookOpen size={24} color="#3CBCB2" />
                                                    </View>
                                                )}
                                            </View>

                                            {/* Material Info */}
                                            <View className="flex-1">
                                                <Text className="font-bold text-gray-800 text-base" numberOfLines={2}>
                                                    {purchase.title}
                                                </Text>
                                                <View className="flex-row items-center mt-1">
                                                    <Text className="text-gray-500 text-sm">{purchase.subjectName}</Text>
                                                    <Text className="text-gray-300 mx-2">•</Text>
                                                    <Text className="text-gray-500 text-sm">{purchase.typeName}</Text>
                                                </View>
                                                <View className="flex-row items-center justify-between mt-2">
                                                    <Text className="text-gray-400 text-xs">
                                                        {formatDate(purchase.purchasedDate)}
                                                    </Text>
                                                    <Text className="font-bold text-teal-600">
                                                        {formatCurrency(purchase.price)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Bottom Spacing */}
                        <View className="h-20" />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default StudentFinancialStatsScreen;
