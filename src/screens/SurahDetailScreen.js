import React, { useState, useEffect, useRef } from 'react';
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
import { Audio } from 'expo-av';

// تحويل الأرقام الإنجليزية إلى أرقام عربية مشرقية
const toArabicDigits = (num) => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (digit) => arabicDigits[digit]);
};

export function SurahDetailScreen({ surahNumber, onBack, isDarkMode }) {
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const soundRef = useRef(null);

  const formattedSurahNumber = String(surahNumber).padStart(3, '0');
  const audioUrl = `https://server8.mp3quran.net/basit/${formattedSurahNumber}.mp3`;

  useEffect(() => {
    loadSurahDetails();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
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
    try {
      // إذا كان الصوت يعمل بالفعل، نقوم بإيقافه مؤقتاً
      if (soundRef.current && isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      // إذا كان الصوت متوقفاً مؤقتاً، نستكمل التشغيل
      if (soundRef.current && !isPlaying) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }

      // إنشاء وتشغيل الصوت لأول مرة
      setIsBuffering(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setIsBuffering(status.isBuffering);
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        }
      );

      soundRef.current = sound;
      setIsBuffering(false);
      setIsPlaying(true);
    } catch (error) {
      setIsBuffering(false);
      setIsPlaying(false);
      Alert.alert('خطأ', 'تعذر تشغيل الصوت. تأكد من الاتصال بالإنترنت.');
      console.error('Audio Playback Error:', error);
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
        <Text style={[styles.loadingText, { color: theme.accent }]}>جاري تحميل السورة...</Text>
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
          disabled={isBuffering}
        >
          {isBuffering ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.playButtonText}>
              {isPlaying ? '⏹️ إيقاف' : '▶️ تشغيل'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* عرض الآيات متصلة وملء السطور */}
      <ScrollView contentContainerStyle={styles.ayaScrollContent}>
        <View style={[styles.surahContent, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.quranText, { color: theme.text }]}>
            {surah.ayahs.map((ayah) => (
              <Text key={ayah.number}>
                {ayah.text}{' '}
                <Text style={{ color: theme.accent, fontSize: 18 }}>
                  ﴿{toArabicDigits(ayah.numberInSurah)}﴾
                </Text>{' '}
              </Text>
            ))}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB11',
  },
  quranText: {
    fontSize: 22,
    lineHeight: 46,
    textAlign: 'justify',
    writingDirection: 'rtl',
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
