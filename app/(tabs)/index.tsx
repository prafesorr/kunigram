import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import AdminModal from '../../components/AdminModal';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme, ACCENT, ACCENT_DARK } from '../../context/ThemeContext';

const DEFAULT_PHRASES = ["ДА", "НЕТ", "РИСКНИ", "ПОЗЖЕ", "100%", "ЗАБУДЬ", "ТВОЙ ШАНС", "НЕ СТОИТ", "СКВИРТ"];

export default function Index() {
  const { theme } = useTheme();
  const [result, setResult] = useState("SQRTGRAM");
  const [adminVisible, setAdminVisible] = useState(false);
  const [adminWord, setAdminWord] = useState<string | null>(null);
  const [cheatReady, setCheatReady] = useState(false);
  const [showCrown, setShowCrown] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lastResult = useRef("SQRTGRAM");

  useFocusEffect(useCallback(() => {
    loadData();
    checkCheat();
    const interval = setInterval(checkCheat, 300);
    return () => clearInterval(interval);
  }, []));

  const loadData = async () => {
    const word = await AsyncStorage.getItem('adminWord_index');
    if (word) setAdminWord(word);
    const crown = await AsyncStorage.getItem('showCrown');
    setShowCrown(crown !== 'false');
  };

  const checkCheat = async () => {
    const active = await AsyncStorage.getItem('cheatActive_index');
    if (active === 'true') {
      setCheatReady(true);
      await AsyncStorage.removeItem('cheatActive_index');
    }
  };

  const handleButtonPress = () => {
    let next: string;
    if (cheatReady && adminWord) {
      next = adminWord;
      setCheatReady(false);
    } else {
      const pool = DEFAULT_PHRASES.filter(p => p !== lastResult.current || DEFAULT_PHRASES.length === 1);
      next = pool[Math.floor(Math.random() * pool.length)];
    }
    lastResult.current = next;
    setResult(next);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <TouchableOpacity style={styles.secretLeft} onPress={() => setAdminVisible(true)} />
      <TouchableOpacity style={styles.secretRight} onPress={() => setCheatReady(true)} />
      <ThemeToggle />

      {cheatReady && showCrown && <Text style={styles.crown}>👑</Text>}

      <Text style={[styles.appName, { color: theme.textDim }]}>SQRTGRAM</Text>

      <View style={styles.resultContainer}>
        <Animated.Text style={[styles.result, { color: ACCENT, transform: [{ scale: scaleAnim }] }]}>
          {result}
        </Animated.Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleButtonPress} activeOpacity={0.8}>
        <View style={styles.buttonInner}>
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
  result: { fontSize: 52, fontWeight: 'bold', letterSpacing: 2 },
  button: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
  },
  buttonInner: { width: 110, height: 110, borderRadius: 55, backgroundColor: ACCENT_DARK, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 42, fontWeight: 'bold', color: '#fff' },
  hint: { marginTop: 24, fontSize: 13, letterSpacing: 2 },
});