import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Switch, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, ACCENT } from '../context/ThemeContext';

const DEFAULT_PHRASES = ["ДА", "НЕТ", "РИСКНИ", "ПОЗЖЕ", "100%", "ЗАБУДЬ", "ТВОЙ ШАНС", "НЕ СТОИТ", "СКВИРТ"];
const YESNO = ["ДА", "НЕТ"];

type Props = { visible: boolean; onClose: () => void };

export default function AdminModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [adminWord0, setAdminWord0] = useState<string | null>(null);
  const [adminWord1, setAdminWord1] = useState<string | null>(null);
  const [adminWord2, setAdminWord2] = useState<string | null>(null);
  const [workshopWords, setWorkshopWords] = useState<string[]>([]);
  const [showCrown, setShowCrown] = useState(true);

  useEffect(() => {
    if (visible) loadAll();
  }, [visible]);

  const loadAll = async () => {
    const w0 = await AsyncStorage.getItem('adminWord_index');
    const w1 = await AsyncStorage.getItem('adminWord_yesno');
    const w2 = await AsyncStorage.getItem('adminWord_workshop');
    const ww = await AsyncStorage.getItem('workshopWords');
    const crown = await AsyncStorage.getItem('showCrown');
    setAdminWord0(w0);
    setAdminWord1(w1);
    setAdminWord2(w2);
    if (ww) setWorkshopWords(JSON.parse(ww));
    setShowCrown(crown !== 'false');
  };

  const save = async (word: string) => {
    const keys = ['adminWord_index', 'adminWord_yesno', 'adminWord_workshop'];
    const setters = [setAdminWord0, setAdminWord1, setAdminWord2];
    await AsyncStorage.setItem(keys[selectedTab], word);
    setters[selectedTab](word);
  };

  const toggleCrown = async (val: boolean) => {
    setShowCrown(val);
    await AsyncStorage.setItem('showCrown', val ? 'true' : 'false');
  };

  const getOptions = () => {
    if (selectedTab === 0) return DEFAULT_PHRASES;
    if (selectedTab === 1) return YESNO;
    return workshopWords;
  };

  const getCurrentWord = () => {
    if (selectedTab === 0) return adminWord0;
    if (selectedTab === 1) return adminWord1;
    return adminWord2;
  };

  const TABS = [
    { label: '🎲', name: 'Фразы' },
    { label: '⚖️', name: 'Да/Нет' },
    { label: '⚙️', name: 'Мастерская' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.modalBg}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[s.modal, { backgroundColor: theme.bg2 }]}>
          <Text style={[s.title, { color: ACCENT }]}>👑 Админ слово</Text>

          <View style={s.tabRow}>
            {TABS.map((t, i) => (
              <TouchableOpacity
                key={i}
                style={[s.tabBtn, { backgroundColor: theme.bg3 }, selectedTab === i && s.tabBtnActive]}
                onPress={() => setSelectedTab(i)}
              >
                <Text style={{ fontSize: 18 }}>{t.label}</Text>
                <Text style={[s.tabLabel, { color: theme.textDim }, selectedTab === i && s.tabLabelActive]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.current, { color: theme.textDim }]}>
            Выбрано: <Text style={{ color: ACCENT }}>{getCurrentWord() || 'не задано'}</Text>
          </Text>

          <View style={s.listContainer}>
            <FlatList
              data={getOptions()}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.optionRow, { backgroundColor: theme.bg3 }, getCurrentWord() === item && s.optionRowActive]}
                  onPress={() => save(item)}
                >
                  <Text style={[s.optionText, { color: theme.text }, getCurrentWord() === item && s.optionTextActive]}>
                    {item}
                  </Text>
                  {getCurrentWord() === item && <Text style={{ color: ACCENT }}>✓</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={[s.empty, { color: theme.textDim }]}>Нет слов в мастерской</Text>}
            />
          </View>

          <View style={[s.crownRow, { borderTopColor: theme.border }]}>
            <Text style={[s.crownLabel, { color: theme.text }]}>👑 Показывать корону</Text>
            <Switch
              value={showCrown}
              onValueChange={toggleCrown}
              trackColor={{ false: '#333', true: ACCENT }}
              thumbColor={showCrown ? '#fff' : '#555'}
            />
          </View>

          <TouchableOpacity style={[s.closeBtn, { backgroundColor: theme.bg3 }]} onPress={onClose}>
            <Text style={[s.closeBtnText, { color: theme.text }]}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalBg: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: 520 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  tabRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  tabBtn: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center' },
  tabBtnActive: { borderWidth: 1, borderColor: ACCENT },
  tabLabel: { fontSize: 11, marginTop: 2 },
  tabLabelActive: { color: ACCENT },
  current: { marginBottom: 10, fontSize: 13 },
  listContainer: { height: 220 },
  optionRow: { padding: 14, borderRadius: 8, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionRowActive: { borderWidth: 1, borderColor: ACCENT },
  optionText: { fontSize: 18 },
  optionTextActive: { color: ACCENT, fontWeight: 'bold' },
  empty: { textAlign: 'center', padding: 20 },
  crownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  crownLabel: { fontSize: 16 },
  closeBtn: { marginTop: 12, borderRadius: 8, padding: 12, alignItems: 'center' },
  closeBtnText: { fontSize: 16 },
});