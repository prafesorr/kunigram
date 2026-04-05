import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Animated, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import AdminModal from '../../components/AdminModal';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme, ACCENT, ACCENT_DARK } from '../../context/ThemeContext';
 
export default function Workshop() {
  const { theme } = useTheme();
  const [words, setWords] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('?');
  const [adminVisible, setAdminVisible] = useState(false);
  const [adminWord, setAdminWord] = useState<string | null>(null);
  const [cheatReady, setCheatReady] = useState(false);
  const [showCrown, setShowCrown] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;
 
  useFocusEffect(useCallback(() => {
    loadData();
    checkCheat();
    const interval = setInterval(checkCheat, 300);
    return () => clearInterval(interval);
  }, []));
 
  const loadData = async () => {
    const stored = await AsyncStorage.getItem('workshopWords');
    if (stored) setWords(JSON.parse(stored));
    const word = await AsyncStorage.getItem('adminWord_workshop');
    if (word) setAdminWord(word);
    const crown = await AsyncStorage.getItem('showCrown');
    setShowCrown(crown !== 'false');
  };
 
  const checkCheat = async () => {
    const active = await AsyncStorage.getItem('cheatActive_workshop');
    if (active === 'true') {
      setCheatReady(true);
      await AsyncStorage.removeItem('cheatActive_workshop');
    }
  };
 
  const addWord = async () => {
    if (!input.trim()) return;
    const updated = [...words, input.trim().toUpperCase()];
    setWords(updated);
    await AsyncStorage.setItem('workshopWords', JSON.stringify(updated));
    setInput('');
    Keyboard.dismiss();
  };
 
  const removeWord = async (index: number) => {
    const updated = words.filter((_, i) => i !== index);
    setWords(updated);
    await AsyncStorage.setItem('workshopWords', JSON.stringify(updated));
  };
 
  const handleRandom = () => {
    if (words.length === 0) return;
    let next: string;
    if (cheatReady && adminWord) {
      next = adminWord;
      setCheatReady(false);
    } else {
      next = words[Math.floor(Math.random() * words.length)];
    }
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
 
      {/* Title - exactly same position as other tabs */}
      <Text style={[styles.appName, { color: theme.textDim }]}>МАСТЕРСКАЯ</Text>
 
      {/* Input row - lowered slightly */}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bg2, color: theme.text, borderColor: theme.border }]}
          placeholder="новое слово..."
          placeholderTextColor={theme.textDim}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addWord}
          autoCapitalize="characters"
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addWord}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
 
      {/* Center section: result + button + hint */}
      <View style={styles.centerSection}>
        <View style={styles.resultContainer}>
          <Animated.Text style={[styles.result, { color: ACCENT, transform: [{ scale: scaleAnim }] }]}>
            {result}
          </Animated.Text>
        </View>
 
        <TouchableOpacity
          style={[styles.button, { opacity: words.length === 0 ? 0.3 : 1 }]}
          onPress={handleRandom}
          disabled={words.length === 0}
          activeOpacity={0.8}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.btnText}>?</Text>
          </View>
        </TouchableOpacity>
 
        <Text style={[styles.hint, { color: theme.textHint }]}>нажми чтобы узнать</Text>
      </View>
 
      {/* Bottom section: scrollable word list */}
      <View style={styles.listSection}>
        <FlatList
          data={words}
          keyExtractor={(_, i) => i.toString()}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          renderItem={({ item, index }) => (
            <View style={[styles.wordRow, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
              <Text style={[styles.word, { color: theme.text }]}>{item}</Text>
              <TouchableOpacity
                style={[styles.delBtn, { backgroundColor: theme.bg3 }]}
                onPress={() => removeWord(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.del}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.textDim }]}>добавь слова чтобы начать</Text>
          }
        />
      </View>
 
      <AdminModal visible={adminVisible} onClose={() => { setAdminVisible(false); loadData(); }} />
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  secretLeft: { position: 'absolute', top: 0, left: 0, width: 70, height: 70, zIndex: 10 },
  secretRight: { position: 'absolute', top: 0, right: 0, width: 70, height: 70, zIndex: 10 },
  crown: { position: 'absolute', top: 36, fontSize: 22, zIndex: 15 },
 
  // Title - exactly like index and yesno tabs
  appName: { 
    position: 'absolute', 
    top: 60, 
    fontSize: 14, 
    letterSpacing: 6, 
    fontWeight: '600' 
  },
 
  // Input row - lowered and centered
  inputRow: { 
    position: 'absolute',
    top: 100,
    left: 24,
    right: 24,
    flexDirection: 'row',
    zIndex: 5,
  },
  input: { 
    flex: 1, 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 16, 
    borderWidth: 1 
  },
  addBtn: {
    backgroundColor: ACCENT, 
    borderRadius: 12, 
    padding: 14,
    marginLeft: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: 50,
  },
  addBtnText: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
 
  // Center section
  centerSection: {
    alignItems: 'center',
  },
  resultContainer: { 
    height: 120, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 60 
  },
  result: { 
    fontSize: 52, 
    fontWeight: 'bold', 
    letterSpacing: 2 
  },
  button: {
    width: 120, 
    height: 120, 
    borderRadius: 60,
    backgroundColor: ACCENT, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: ACCENT, 
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, 
    shadowRadius: 20, 
    elevation: 10,
  },
  buttonInner: {
    width: 110, 
    height: 110, 
    borderRadius: 55,
    backgroundColor: ACCENT_DARK, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  btnText: { 
    fontSize: 42, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  hint: { 
    marginTop: 24, 
    fontSize: 13, 
    letterSpacing: 2 
  },
 
  // Bottom section - scrollable list with fixed height
  listSection: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 200,
  },
  wordRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 8, 
    borderWidth: 1,
  },
  word: { 
    fontSize: 18, 
    letterSpacing: 1 
  },
  delBtn: { 
    borderRadius: 8, 
    width: 36, 
    height: 36, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  del: { 
    color: ACCENT, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 20, 
    fontSize: 14, 
    letterSpacing: 1 
  },
});