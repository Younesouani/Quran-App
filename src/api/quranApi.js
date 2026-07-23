import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.alquran.cloud/v1';
const SURAHS_CACHE_KEY = '@quran_surahs_list';
const SURAH_DETAIL_PREFIX = '@quran_surah_detail_';

// 1. جلب قائمة السور (مع الحفظ المحلي)
export const fetchAllSurahs = async () => {
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    if (response.ok) {
      const data = await response.json();
      // حفظ القائمة في الذاكرة المحلية
      await AsyncStorage.setItem(SURAHS_CACHE_KEY, JSON.stringify(data.data));
      return { data: data.data, isOffline: false };
    }
  } catch (error) {
    console.log('شبكة غير متوفرة، جلب القائمة من التخزين المحلي...');
  }

  // في حال عدم وجود إنترنت، جلب البيانات المحفوظة
  const cachedData = await AsyncStorage.getItem(SURAHS_CACHE_KEY);
  if (cachedData) {
    return { data: JSON.parse(cachedData), isOffline: true };
  }

  throw new Error('لا يوجد اتصال بالإنترنت ولا توجد بيانات محفوظة مسبقاً.');
};

// 2. جلب تفاصيل السورة (مع الحفظ المحلي)
export const fetchSurahDetails = async (surahNumber) => {
  const cacheKey = `${SURAH_DETAIL_PREFIX}${surahNumber}`;

  try {
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}`);
    if (response.ok) {
      const data = await response.json();
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data.data));
      return { data: data.data, isOffline: false };
    }
  } catch (error) {
    console.log(`شبكة غير متوفرة، جلب السورة ${surahNumber} من التخزين المحلي...`);
  }

  const cachedSurah = await AsyncStorage.getItem(cacheKey);
  if (cachedSurah) {
    return { data: JSON.parse(cachedSurah), isOffline: true };
  }

  throw new Error('تعذر تحميل تفاصيل السورة بدون إنترنت.');
};

