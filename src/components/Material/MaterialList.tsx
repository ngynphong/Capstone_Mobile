import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useMaterial from "../../hooks/useMaterial";
import { Material } from "../../types/material";
import { MaterialStackParamList } from "../../types/types";
import useMaterialImageSource from "../../hooks/useMaterialImageSource";


const MaterialList = () => {
  const {
    materials,
    isLoading,
    isRefreshing,
    error,
    fetchMaterials,
    refreshMaterials,
  } = useMaterial();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
  const { source: modalImageSource } = useMaterialImageSource(selectedMaterial?.fileImage);

  /** Gọi API khi component mount */
  useEffect(() => {
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
    const material = selectedMaterial;
    closeModal();
    navigation.navigate("MaterialDetail", { material });
  };

  const closeModal = () => setSelectedMaterial(null);

  /** Khi có dữ liệu */
  return (
    <>
      <FlatList
        data={materials}
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
          <TouchableWithoutFeedback>
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
              <Text style={styles.modalDescription}>
                {selectedMaterial?.description || "Chưa có mô tả chi tiết."}
              </Text>
              {selectedMaterial?.typeName && (
                <Text style={styles.modalMeta}>
                  Hình thức: {selectedMaterial.typeName}
                </Text>
              )}
              {selectedMaterial?.createdAt && (
                <Text style={styles.modalMeta}>
                  Cập nhật: {new Date(selectedMaterial.createdAt).toLocaleDateString()}
                </Text>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={closeModal}>
                <Text style={styles.secondaryText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleEnroll}>
                <Text style={styles.primaryText}>Enroll Now</Text>
              </TouchableOpacity>
            </View>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
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
});
