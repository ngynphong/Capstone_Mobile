import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { getPublicMaterials } from "../../services/materialService";
import { Material } from "../../types/material";


const MaterialList = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Gọi API */
  const fetchMaterials = async () => {
    try {
      setError(null);
      const res = await getPublicMaterials();
      setMaterials(res.data.items);
    } catch (err: any) {
      console.error("❌ Error loading materials:", err);
      setError(err.message || "Failed to load materials");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /** Tải lại khi kéo xuống */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMaterials();
  }, []);

  /** Gọi API khi component mount */
  useEffect(() => {
    fetchMaterials();
  }, []);

  /** Khi đang loading */
  if (loading) {
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

  /** Khi có dữ liệu */
  return (
    <FlatList
      data={materials}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.meta}>
            {item.subjectName} • {item.authorName}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={{ color: "#999" }}>No materials available</Text>
        </View>
      }
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

export default MaterialList;

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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
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
});
