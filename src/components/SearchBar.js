import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export const SearchBar = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="ابحث باسم السورة أو رقمها..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        textBreakStrategy="simple"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
  },
});

// أضف هذا السطر لحماية الاستيراد
export default SearchBar;

