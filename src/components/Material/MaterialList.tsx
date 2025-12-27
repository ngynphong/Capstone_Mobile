import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useMaterial from "../../hooks/useMaterial";
import { Material } from "../../types/material";
import { MaterialStackParamList } from "../../types/types";
import useMaterialImageSource from "../../hooks/useMaterialImageSource";
import useMaterialRegister from "../../hooks/useMaterialRegister";
import MaterialService from "../../services/materialService";
import { MaterialRating, MaterialRatingStatistics } from "../../types/material";
import useMaterialRating from "../../hooks/useMaterialRating";

const REGISTERED_MATERIALS_KEY = '@registered_materials';

interface MaterialListProps {
  searchQuery?: string;
  teacherFilter?: string;
  subjectFilter?: string;
}

const MaterialList: React.FC<MaterialListProps> = ({
  searchQuery = '',
  teacherFilter = 'All',
  subjectFilter = 'All',
}) => {
  const {
    materials,
    isLoading,
    isRefreshing,
    error,
    fetchMaterials,
    refreshMaterials,
  } = useMaterial();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registeredMaterials, setRegisteredMaterials] = useState<Set<string>>(new Set());
  const [ratingStats, setRatingStats] = useState<MaterialRatingStatistics | null>(null);
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
  const { source: modalImageSource } = useMaterialImageSource(selectedMaterial?.fileImage);
  const { registerMaterial, isLoading: isRegistering, error: registerError } = useMaterialRegister();
  const {
    ratings,
    fetchRatingsByMaterial,
    isLoading: isLoadingRatings,
  } = useMaterialRating();

  // Filter materials based on search query, teacher, and subject
  const filteredMaterials = useMemo(() => {
    let result = materials;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title?.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.authorName?.toLowerCase().includes(query)
      );
    }

    // Filter by subject (if not "All") - use includes for flexible matching
    if (subjectFilter && subjectFilter !== 'All') {
      const subjectLower = subjectFilter.toLowerCase().trim();
      result = result.filter((m) => {
        const materialSubject = m.subjectName?.toLowerCase().trim() || '';
        return materialSubject.includes(subjectLower) || subjectLower.includes(materialSubject);
      });
    }

    // Filter by teacher (authorName) - use includes for flexible matching
    if (teacherFilter && teacherFilter !== 'All') {
      const filterLower = teacherFilter.toLowerCase().trim();
      result = result.filter((m) => {
        const authorLower = m.authorName?.toLowerCase().trim() || '';
        // Check if either contains the other (handles different name formats)
        return authorLower.includes(filterLower) || filterLower.includes(authorLower);
      });
    }

    return result;
  }, [materials, searchQuery, teacherFilter, subjectFilter]);

  // Lấy thống kê rating khi chọn một material để mở modal
  useEffect(() => {
    const loadRatingStats = async () => {
      if (!selectedMaterial) {
        setRatingStats(null);
        return;
      }
      try {
        const res = await MaterialService.getMaterialRatingStatistics(
          selectedMaterial.id,
        );
        setRatingStats(res.data.data);
      } catch (err) {
        // Không cần show lỗi, chỉ là thông tin phụ
        console.log('Failed to load rating statistics', err);
      }
    };

    loadRatingStats();
  }, [selectedMaterial]);

  const handleOpenRatings = async () => {
    if (!selectedMaterial || !ratingStats || ratingStats.totalRatings === 0) {
      return;
    }

    try {
      await fetchRatingsByMaterial(selectedMaterial.id);
      setShowRatingsModal(true);
    } catch (err) {
      console.log('Failed to load ratings list', err);
      Alert.alert(
        'Thông báo',
        'Không thể tải danh sách đánh giá. Vui lòng thử lại sau.',
      );
    }
  };

  // Hàm lưu danh sách đã đăng ký vào AsyncStorage
  const saveRegisteredMaterials = async (materials: Set<string>) => {
    try {
      const materialsArray = Array.from(materials);
      await AsyncStorage.setItem(REGISTERED_MATERIALS_KEY, JSON.stringify(materialsArray));
      console.log('Saved registered materials to storage:', materialsArray);
    } catch (error) {
      console.error('Error saving registered materials:', error);
    }
  };

  // Load danh sách đã đăng ký từ API khi component mount
  useEffect(() => {
    const loadRegisteredMaterials = async () => {
      try {
        // Gọi API để lấy danh sách đã đăng ký
        const response = await MaterialService.getRegisteredMaterials(0, 100);
        const registeredList = response.data.data.items || [];
        
        // Tạo Set từ danh sách ID của materials đã đăng ký
        const registeredIdsArray = registeredList
          .map((material: Material) => material.id || material.learningMaterialId)
          .filter((id): id is string => Boolean(id));

        const registeredIds = new Set<string>(registeredIdsArray);
        
        setRegisteredMaterials(registeredIds);
        console.log('Loaded registered materials from API:', Array.from(registeredIds));
        
        // Lưu vào AsyncStorage để cache
        await saveRegisteredMaterials(registeredIds);
      } catch (error) {
        console.error('Error loading registered materials from API:', error);
        // Fallback: Load từ AsyncStorage nếu API fail
        try {
          const stored = await AsyncStorage.getItem(REGISTERED_MATERIALS_KEY);
          if (stored) {
            const materialsArray = JSON.parse(stored);
            setRegisteredMaterials(new Set(materialsArray));
            console.log('Loaded registered materials from storage (fallback):', materialsArray);
          }
        } catch (storageError) {
          console.error('Error loading from storage:', storageError);
        }
      }
    };

    loadRegisteredMaterials();
    fetchMaterials();
  }, [fetchMaterials]);

  /** Khi đang loading */
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3CBCB2" />
        <Text style={styles.loadingText}>Loading materials...</Text>
      </View>
    );
  }

  /** Khi lỗi */
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const handleEnroll = () => {
    if (!selectedMaterial) return;
    
    // Nếu đã đăng ký rồi, điều hướng trực tiếp
    if (registeredMaterials.has(selectedMaterial.id)) {
      closeModal();
      navigation.navigate("MaterialDetail", { material: selectedMaterial });
      return;
    }
    
    // Hiển thị modal xác nhận
    setShowConfirmModal(true);
  };

  const handleConfirmRegister = async () => {
    if (!selectedMaterial) return;
    
    try {
      // Gọi API đăng ký học liệu
      console.log('Calling registerMaterial API with ID:', selectedMaterial.id);
      await registerMaterial(selectedMaterial.id);
      console.log('Register material success');
      
      // Đánh dấu đã đăng ký và lưu vào storage
      setRegisteredMaterials(prev => {
        const newSet = new Set(prev).add(selectedMaterial.id);
        saveRegisteredMaterials(newSet);
        return newSet;
      });
      
      // Đóng modal xác nhận
      setShowConfirmModal(false);
      
      // Success
      Alert.alert(
        "Success",
        `You have successfully registered for "${selectedMaterial.title}"!`,
        [
          {
            text: "OK",
            onPress: () => {
              closeModal();
              navigation.navigate("MaterialDetail", { material: selectedMaterial });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Register material error:', error);
      
      // Kiểm tra nếu lỗi là "đã đăng ký rồi" (code 1055)
      const errorCode = error?.response?.data?.code;
      const errorMessage = error?.response?.data?.message || error?.message || registerError;
      
      if (errorCode === 1055 || errorMessage?.includes('already registered') || errorMessage?.includes('đã đăng ký')) {
        // Đánh dấu đã đăng ký ngay lập tức và lưu vào storage
        setRegisteredMaterials(prev => {
          const newSet = new Set(prev).add(selectedMaterial.id);
          saveRegisteredMaterials(newSet);
          return newSet;
        });
        console.log('Material already registered, marking as registered:', selectedMaterial.id);
        
        // Đóng modal xác nhận
        setShowConfirmModal(false);
        
        // Điều hướng trực tiếp
        closeModal();
        navigation.navigate("MaterialDetail", { material: selectedMaterial });
        return;
      }
      
      // Đóng modal xác nhận khi có lỗi khác
      setShowConfirmModal(false);
      
      // Show error message
      Alert.alert("Error", errorMessage || "Unable to register for material. Please try again.", [{ text: "OK" }]);
    }
  };

  const closeModal = () => {
    setSelectedMaterial(null);
    setShowConfirmModal(false);
  };

  /** Khi có dữ liệu */
  return (
    <>
      <FlatList
        data={filteredMaterials}
        keyExtractor={(item) => item.id}
        refreshControl={
           <RefreshControl refreshing={isRefreshing} onRefresh={refreshMaterials} />
        }
        renderItem={({ item }) => (
          <MaterialCard material={item} onPress={() => setSelectedMaterial(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: "#999" }}>No materials available</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16 }}
      />

      <Modal
        transparent
        visible={!!selectedMaterial}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
               <Image
                 source={modalImageSource}
                 style={styles.modalImage}
                 resizeMode="cover"
               />
              <Text style={styles.modalTitle}>{selectedMaterial?.title}</Text>
              <Text style={styles.modalSubtitle}>
                {selectedMaterial?.subjectName} • {selectedMaterial?.authorName}
              </Text>
              {ratingStats && ratingStats.totalRatings > 0 && (
                <TouchableOpacity onPress={handleOpenRatings}>
                  <Text style={styles.modalMeta}>
                    Rating: {ratingStats.averageRating.toFixed(1)} ⭐ ({ratingStats.totalRatings} ratings)
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={styles.modalDescription}>
                {selectedMaterial?.description || "No detailed description yet."}
              </Text>
              {selectedMaterial?.typeName && (
                <Text style={styles.modalMeta}>
                  Type: {selectedMaterial.typeName}
                </Text>
              )}
              {typeof selectedMaterial?.price === 'number' && selectedMaterial.price > 0 && (
                <Text style={styles.modalMeta}>
                  Price: {selectedMaterial.price.toLocaleString('vi-VN')} VND
                </Text>
              )}
              {selectedMaterial?.createdAt && (
                <Text style={styles.modalMeta}>
                  Updated: {new Date(selectedMaterial.createdAt).toLocaleDateString()}
                </Text>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.secondaryBtn} 
                onPress={closeModal}
                disabled={isRegistering}
              >
                <Text style={styles.secondaryText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.primaryBtn, isRegistering && styles.primaryBtnDisabled]} 
                onPress={handleEnroll}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryText}>
                    {selectedMaterial && registeredMaterials.has(selectedMaterial.id) 
                      ? 'Continue' 
                      : 'Register'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Ratings list modal */}
      <Modal
        transparent
        visible={showRatingsModal}
        animationType="fade"
        onRequestClose={() => setShowRatingsModal(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>
              Ratings for "{selectedMaterial?.title}"
            </Text>
            {isLoadingRatings ? (
              <View style={styles.center}>
                <ActivityIndicator size="small" color="#3CBCB2" />
              </View>
            ) : ratings.length === 0 ? (
              <Text style={styles.confirmModalMessage}>
                Chưa có đánh giá nào cho học liệu này.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {ratings.map((r: MaterialRating) => (
                  <View key={r.id} style={{ marginBottom: 12 }}>
                    <Text style={{ fontWeight: '600', marginBottom: 2 }}>
                      {r.userFullName || 'Người dùng ẩn danh'}
                    </Text>
                    <Text style={{ marginBottom: 2 }}>
                      ⭐ {r.rating} {r.comment ? ` - ${r.comment}` : ''}
                    </Text>
                    {r.createdAt && (
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        {new Date(r.createdAt).toLocaleString()}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={styles.confirmPrimaryBtn}
                onPress={() => setShowRatingsModal(false)}
              >
                <Text style={styles.confirmPrimaryText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        transparent
        visible={showConfirmModal}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Confirm Registration</Text>
            <Text style={styles.confirmModalMessage}>
              Are you sure you want to register for "{selectedMaterial?.title}"?
            </Text>
            {selectedMaterial?.typeName === 'TOKEN' && (
              <Text style={styles.confirmModalWarning}>
                ⚠️ This material requires payment with VND. Your balance will be deducted when registering.
              </Text>
            )}
            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={styles.confirmSecondaryBtn}
                onPress={() => setShowConfirmModal(false)}
                disabled={isRegistering}
              >
                <Text style={styles.confirmSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmPrimaryBtn, isRegistering && styles.primaryBtnDisabled]}
                onPress={handleConfirmRegister}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmPrimaryText}>Register</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default MaterialList;

const MaterialCard: React.FC<{
  material: Material;
  onPress: () => void;
}> = ({ material, onPress }) => {
  const { source } = useMaterialImageSource(material.fileImage);
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <Image source={source} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardInfo}>
          <Text style={styles.title}>{material.title}</Text>
          <Text style={styles.desc}>{material.description}</Text>
          <Text style={styles.meta}>
            {material.subjectName} • {material.authorName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#555",
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  cardInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  desc: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 16,
  },
  modalMeta: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 6,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#3CBCB2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
    textAlign: "center",
  },
  confirmModalMessage: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 12,
    textAlign: "center",
  },
  confirmModalWarning: {
    fontSize: 14,
    color: "#DC2626",
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "500",
  },
  confirmModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  confirmSecondaryBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmSecondaryText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmPrimaryBtn: {
    flex: 1,
    backgroundColor: "#3CBCB2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmPrimaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
