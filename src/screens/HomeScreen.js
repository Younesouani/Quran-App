import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchAllSurahs } from '../api/quranApi';
import {
  saveLastRead,
  getLastRead,
  saveThemeMode,
  getThemeMode,
} from '../services/storageService';
import SurahCardImport from '../components/SurahCard';
import SearchBarImport from '../components/SearchBar';
import SurahDetailScreenImport from './SurahDetailScreen';

const SurahCard = SurahCardImport.SurahCard || SurahCardImport;
const SearchBar = SearchBarImport.SearchBar || SearchBarImport;
const SurahDetailScreen = SurahDetailScreenImport.SurahDetailScreen || SurahDetailScreenImport;

const JUZ_LIST = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `الجزء ${i + 1}`,
}));

export function HomeScreen() {
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [lastRead, setLastRead] = useState(null);
  const [activeTab, setActiveTab] = useState('surahs');
  const [isDarkMode, setIsDarkMode] = useState(false); // 👈 حالة الوضع الليلي

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAllSurahs();
      if (res && res.data) {
        setSurahs(res.data);
        setFilteredSurahs(res.data);
      }
      const savedLastRead = await getLastRead();
      setLastRead(savedLastRead);

      const savedTheme = await getThemeMode();
      setIsDarkMode(savedTheme);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await saveThemeMode(newMode);
  };

  const handleOpenSurah = async (surahNumber, surahName) => {
    await saveLastRead(surahNumber, surahName);
    setLastRead({ surahNumber, surahName });
    setSelectedSurah(surahNumber);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredSurahs(surahs);
      return;
    }
    const filtered = surahs.filter((surah) => {
      const nameMatch = surah.name?.includes(text);
      const numberMatch = surah.number?.toString() === text.trim();
      return nameMatch || numberMatch;
    });
    setFilteredSurahs(filtered);
  };

  // لوحة الألوان بناءً على الوضع
  const theme = {
    bg: isDarkMode ? '#0F172A' : '#FAF9F6',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#065F46',
    subText: isDarkMode ? '#94A3B8' : '#4B5563',
    tabBg: isDarkMode ? '#1E293B' : '#E5E7EB',
    activeTabBg: isDarkMode ? '#334155' : '#FFFFFF',
    accent: isDarkMode ? '#F59E0B' : '#065F46',
  };

  if (selectedSurah) {
    return (
      <SurahDetailScreen
        surahNumber={selectedSurah}
        isDarkMode={isDarkMode}
        onBack={() => setSelectedSurah(null)}
      />
    );
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.accent }]}>
          جاري تحميل المصحف الشريف...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* هيدر التطبيق مع زر التبديل والشعار */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.themeToggleBtn} onPress={toggleTheme}>
          <Text style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>

        <View style={styles.logoTitleGroup}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>القرآن الكريم</Text>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* بطاقة واصل القراءة */}
      {lastRead && (
        <TouchableOpacity
          style={[styles.lastReadCard, { backgroundColor: isDarkMode ? '#1E293B' : '#065F46' }]}
          onPress={() => handleOpenSurah(lastRead.surahNumber, lastRead.surahName)}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.lastReadLabel}>📌 واصل القراءة</Text>
            <Text style={styles.lastReadSurah}>{lastRead.surahName}</Text>
          </View>
          <Text style={styles.continueText}>متابعة ←</Text>
        </TouchableOpacity>
      )}

      {/* التبويب بين السور والأجزاء */}
      <View style={[styles.tabContainer, { backgroundColor: theme.tabBg }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'surahs' && { backgroundColor: theme.activeTabBg },
          ]}
          onPress={() => setActiveTab('surahs')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'surahs' ? theme.accent : theme.subText },
            ]}
          >
            السور ({surahs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'juz' && { backgroundColor: theme.activeTabBg },
          ]}
          onPress={() => setActiveTab('juz')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'juz' ? theme.accent : theme.subText },
            ]}
          >
            الأجزاء (30)
          </Text>
        </TouchableOpacity>
      </View>

      {/* عرض قائمة السور أو الأجزاء */}
      {activeTab === 'surahs' ? (
        <>
          <SearchBar value={searchQuery} onChangeText={handleSearch} isDarkMode={isDarkMode} />
          <FlatList
            data={filteredSurahs}
            keyExtractor={(item) => item.number.toString()}
            renderItem={({ item }) => (
              <SurahCard
                surah={item}
                isDarkMode={isDarkMode}
                onPress={() => handleOpenSurah(item.number, item.name)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      ) : (
        <FlatList
          data={JUZ_LIST}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.juzCard,
                { backgroundColor: theme.cardBg, borderColor: isDarkMode ? '#334155' : '#E5E7EB' },
              ]}
              onPress={() => handleOpenSurah(item.id, item.name)}
            >
              <Text style={[styles.juzNumber, { color: theme.accent }]}>📖 {item.id}</Text>
              <Text style={[styles.juzName, { color: theme.text }]}>{item.name}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  logoTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lastReadCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  lastReadLabel: {
    color: '#A7F3D0',
    fontSize: 12,
  },
  lastReadSurah: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  continueText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row-reverse',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  juzCard: {
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  juzNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  juzName: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default HomeScreen;

