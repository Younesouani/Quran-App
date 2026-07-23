import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_READ_KEY = '@quran_last_read';
const THEME_KEY = '@quran_theme_mode';

// 1. حفظ آخر سورة تم فتحها
export const saveLastRead = async (surahNumber, surahName) => {
  try {
    const data = { surahNumber, surahName, timestamp: new Date().toISOString() };
    await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving last read:', error);
  }
};

// 2. جلب آخر سورة تم فتحها
export const getLastRead = async () => {
  try {
    const data = await AsyncStorage.getItem(LAST_READ_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting last read:', error);
    return null;
  }
};

// 3. حفظ الوضع (ليلي / نهاري)
export const saveThemeMode = async (isDark) => {
  try {
    await AsyncStorage.setItem(THEME_KEY, JSON.stringify(isDark));
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

// 4. جلب الوضع المحفوظ
export const getThemeMode = async () => {
  try {
    const data = await AsyncStorage.getItem(THEME_KEY);
    return data !== null ? JSON.parse(data) : false;
  } catch (error) {
    console.error('Error getting theme:', error);
    return false;
  }
};

