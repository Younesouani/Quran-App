import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchSurahDetails } from '../api/quranApi';
import * as Audio from 'expo-audio';

// تحويل الأرقام الإنجليزية إلى أرقام عربية مشرقية (١، ٢، ٣)
const toArabicDigits = (num) => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (digit) => arabicDigits[digit]);
};

// مكون شارة رقم الآية المزخرفة بطريقة ممتدة ومضبوطة
const AyahBadge = ({ number, isDarkMode }) => {
  return (
    <View style={badgeStyles.badgeContainer}>
      <Text style={[badgeStyles.badgeDecoration, { color: isDarkMode ? '#F59E0B' : '#0F9D58' }]}>
        ۝
      </Text>
      <View style={badgeStyles.numberOverlay}>
        <Text style={[badgeStyles.badgeNumber, { color: isDarkMode ? '#F8FAFC' : '#065F46' }]}>
          {toArabicDigits(number)}
        </Text>
      </View>
    </View>
  );
};

export function SurahDetailScreen({ surahNumber, onBack, isDarkMode }) {
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadSurahDetails();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [surahNumber]);

  const loadSurahDetails = async () => {
    try {
      setLoading(true);
      const res = await fetchSurahDetails(surahNumber);
      if (res && res.data) {
        setSurah(res.data);
      }
    } catch (error) {
      console.error('Error loading surah details:', error);
    } finally {
      setLoading(false);
    }
  };

  const playSurahAudio = async () => {
    if (!surah || !surah.number) return;

    try {
      if (isPlaying) {
        await sound.stopAsync();
        setIsPlaying(false);
        return;
      }

      setLoading(true);
      if (sound) {
        await sound.unloadAsync();
      }
      const audioUrl = `https://download.quranicaudio.com/qdc/abdul_basit/murattal/${surah.number}.mp3`;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('خطأ', 'تعذر تحميل الصوت. تأكد من الاتصال بالإنترنت.');
      console.error('Audio error:', error);
    }
  };

  const theme = {
    bg: isDarkMode ? '#0F172A' : '#FAF9F6',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#065F46',
    accent: isDarkMode ? '#F59E0B' : '#0F9D58',
    backBtn: isDarkMode ? '#94A3B8' : '#6B7280',
    headerText: isDarkMode ? '#F59E0B' : '#065F46',
    ayaNumText: isDarkMode ? '#94A3B8' : '#0F9D58',
  };

  if (loading && !surah) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.accent }]}>جاري تحميل الآيات...</Text>
      </View>
    );
  }

  if (!surah) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>تعذر تحميل السورة.</Text>
        <TouchableOpacity style={styles.errorBackBtn} onPress={onBack}>
          <Text style={{ color: '#FFFFFF' }}>عودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* هيدر الشاشة */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.backBtn }]}>🔙 عودة</Text>
        </TouchableOpacity>
        <Text style={[styles.surahName, { color: theme.headerText }]}>
          {surah.name}
        </Text>
      </View>

      {/* كرت مشغل الصوت */}
      <View style={[styles.audioCard, { backgroundColor: theme.cardBg }]}>
        <View style={styles.audioInfo}>
          <Text style={[styles.reciterName, { color: theme.text }]}>
            الشيخ عبد الباسط عبد الصمد
          </Text>
          <Text style={[styles.audioDesc, { color: theme.ayaNumText }]}>
            تلاوة السورة كاملة
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: theme.accent }]} 
          onPress={playSurahAudio}
        >
          {loading && !surah ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.playButtonText}>
              {isPlaying ? '⏹️ إيقاف' : '▶️ تشغيل'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* عرض الآيات متتابعة وبزخرفة إسلامية مضبوطة */}
      <ScrollView contentContainerStyle={styles.ayaScrollContent}>
        <View style={[styles.surahContent, { backgroundColor: theme.cardBg }]}>
          <View style={styles.ayaContainer}>
            {surah.ayahs.map((ayah) => (
              <React.Fragment key={ayah.number}>
                <Text style={[styles.ayahText, { color: theme.text }]}>
                  {ayah.text}
                </Text>
                <AyahBadge number={ayah.numberInSurah} isDarkMode={isDarkMode} />
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const badgeStyles = StyleSheet.create({
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    width: 32,
    height: 32,
  },
  badgeDecoration: {
    fontSize: 28,
    position: 'absolute',
  },
  numberOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNumber: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB33',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  surahName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  audioCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB11',
  },
  audioInfo: {
    flex: 1,
  },
  reciterName: {
    fontSize: 16,
    fontWeight: '600',
  },
  audioDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  playButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ayaScrollContent: {
    paddingBottom: 20,
  },
  surahContent: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB11',
  },
  ayaContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  ayahText: {
    fontSize: 20,
    lineHeight: 42,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  errorBackBtn: {
    backgroundColor: '#065F46',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});

export default SurahDetailScreen;

