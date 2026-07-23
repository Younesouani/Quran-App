import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export const AyahCard = ({ ayah, isPlaying, onPlayPress }) => {
  const number = ayah?.numberInSurah || ayah?.number || '';

  return (
    <View style={[styles.container, isPlaying && styles.playingContainer]}>
      {/* نص الآية ورقمها */}
      <Text style={styles.ayahText}>
        {ayah?.text}{' '}
        <Text style={[styles.ayahNumber, isPlaying && styles.playingNumber]}>
          ﴿{number}﴾
        </Text>
      </Text>

      {/* شريط التحكم بالصوت وزر الاستماع */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playingButton]}
          onPress={onPlayPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.playIcon, isPlaying && styles.playingIconText]}>
            {isPlaying ? '⏸ إيقاف' : '▶ استماع'}
          </Text>
        </TouchableOpacity>

        {isPlaying && (
          <View style={styles.audioIndicator}>
            <Text style={styles.audioText}>🔊 جاري التشغيل...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  playingContainer: {
    borderColor: '#0F9D58',
    backgroundColor: '#F0FDF4',
  },
  ayahText: {
    fontSize: 22,
    lineHeight: 44,
    color: '#111827',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ayahNumber: {
    fontSize: 18,
    color: '#0F9D58',
    fontWeight: 'bold',
  },
  playingNumber: {
    color: '#047857',
  },
  footer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  playButton: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  playingButton: {
    backgroundColor: '#0F9D58',
  },
  playIcon: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F9D58',
  },
  playingIconText: {
    color: '#FFFFFF',
  },
  audioIndicator: {
    alignSelf: 'center',
  },
  audioText: {
    fontSize: 12,
    color: '#0F9D58',
    fontWeight: '600',
  },
});

export default AyahCard;

