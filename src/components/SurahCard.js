import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export const SurahCard = ({ surah, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{surah?.number}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.arabicName}>{surah?.name}</Text>
        <Text style={styles.subText}>
          {surah?.englishName} • {surah?.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah?.numberOfAyahs} آية
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  numberBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F9D58',
  },
  infoContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  arabicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

// أضف هذا السطر لحماية الاستيراد
export default SurahCard;

