import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import AdminModal from '../../components/AdminModal';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme, ACCENT, ACCENT_DARK } from '../../context/ThemeContext';

export default function YesNo() {
  const { theme } = useTheme();
  const [result, setResult] = useState('?');
  const [isYes, setIsYes] = useState<boolean | null>(null);
  const [adminVisible, setAdminVisible] = useState(false);
  const [adminWord, setAdminWord] = useState<string | null>(null);
  const [cheatReady, setCheatReady] = useState(false);
  const [showCrown, setShowCrown] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const lastResult = useRef('');

  useFocusEffect(useCallback(() => {
    loadData();
    checkCheat();
    const interval = setInterval(checkCheat, 300);
    return () => clearInterval(interval);
  }, []));

  const loadData = async () => {
    const word = await AsyncStorage.getItem('adminWord_yesno');
    if (word) setAdminWord(word);
    const crown = await AsyncStorage.getItem('showCrown');
    setShowCrown(crown !== 'false');
  };

  const checkCheat = async () => {
    const active = await AsyncStorage.getItem('cheatActive_yesno');
    if (active === 'true') {
      setCheatReady(true);
      await AsyncStorage.removeItem('cheatActive_yesno');
    }
  };

  const handlePress = () => {
    let next: string;
    if (cheatReady && adminWord) {
      next = adminWord;
      setCheatReady(false);
    } else {
      next = Math.random() > 0.5 ? 'ДА' : 'НЕТ';
    }
    const yes = next === 'ДА';

    if (next === lastResult.current) {
      if (!yes) {
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      } else {
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
    } else {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.4, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }

    lastResult.current = next;
    setResult(next);
    setIsYes(yes);
  };

  const color = isYes === null ? ACCENT : isYes ? '#22c55e' : '#ef4444';
  const btnBg = isYes === null ? ACCENT : isYes ? '#16a34a' : '#dc2626';
  const btnInner = isYes === null ? ACCENT_DARK : isYes ? '#15803d' : '#b91c1c';

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <TouchableOpacity style={styles.secretLeft} onPress={() => setAdminVisible(true)} />
      <TouchableOpacity style={styles.secretRight} onPress={() => setCheatReady(true)} />
      <ThemeToggle />

      {cheatReady && showCrown && <Text style={styles.crown}>👑</Text>}

      <Text style={[styles.appName, { color: theme.textDim }]}>ДА ИЛИ НЕТ</Text>

      <View style={styles.resultContainer}>
        <Animated.Text style={[
          styles.result, { color,
          transform: [{ scale: scaleAnim }, { translateX: shakeAnim }, { translateY: bounceAnim }] }
        ]}>
          {result}
        </Animated.Text>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: btnBg, shadowColor: btnBg }]} onPress={handlePress} activeOpacity={0.8}>
        <View style={[styles.buttonInner, { backgroundColor: btnInner }]}>
          <Text style={styles.btnText}>?</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.hint, { color: theme.textHint }]}>нажми чтобы узнать</Text>

      <AdminModal visible={adminVisible} onClose={() => { setAdminVisible(false); loadData(); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  secretLeft: { position: 'absolute', top: 0, left: 0, width: 70, height: 70 },
  secretRight: { position: 'absolute', top: 0, right: 0, width: 70, height: 70 },
  crown: { position: 'absolute', top: 36, fontSize: 22 },
  appName: { position: 'absolute', top: 60, fontSize: 14, letterSpacing: 6, fontWeight: '600' },
  resultContainer: { height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 60 },
  result: { fontSize: 64, fontWeight: 'bold', letterSpacing: 2 },
  button: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
  },
  buttonInner: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 42, fontWeight: 'bold', color: '#fff' },
  hint: { marginTop: 24, fontSize: 13, letterSpacing: 2 },
});