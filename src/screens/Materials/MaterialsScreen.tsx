import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import SearchBar from './SearchBar';
import FilterButton from './FilterButton';
import FilterModal from './FilterModal';
import MaterialList from '../../components/Material/MaterialList';
import { AuthContext } from '../../context/AuthContext';

const MaterialsScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const auth = useContext(AuthContext);

  if (!auth?.isLoggedIn) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Please login to view materials</Text>
      </View>
    );
  }

  const handleFilterPress = () => {
    setFilterModalVisible(true);
  };

  const handleFilterClose = () => {
    setFilterModalVisible(false);
  };

  const handleFilterClearAll = () => {
    console.log('Clear all filters');
    // Add clear all logic here
  };

  const handleFilterSubmit = () => {
    console.log('Apply filters');
    setFilterModalVisible(false);
    // Add submit logic here
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Materials</Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search Material"
      />

      {/* Filter Button */}
      <FilterButton onPress={handleFilterPress} />

      {/* Materials List */}
      <View style={styles.materialsContainer}>
        <MaterialList />
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={handleFilterClose}
        onClearAll={handleFilterClearAll}
        onSubmit={handleFilterSubmit}
      />
    </View>
  );
};

export default MaterialsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#3CBCB2",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  materialsContainer: {
    flex: 1,
    marginTop: 16,
  }
});
