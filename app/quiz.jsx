import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ===== IMAGENS ===== */
import macacoPrego from "../assets/images/quiz/macaco-prego.jpg";
import gorila from "../assets/images/quiz/gorila.jpg";
import chimpanze from "../assets/images/quiz/chimpanze.jpg";
import mandril from "../assets/images/quiz/mandril.jpg";
import orangotango from "../assets/images/quiz/orangotango.jpg";

/* ===== SONS ===== */
import correctSound from "../assets/sounds/correct.mp3";
import wrongSound from "../assets/sounds/wrong.mp3";

/* ===== QUESTÕES ===== */
const QUESTIONS_RAW = [
  { img: macacoPrego, q: "Qual é a raça do macaco da imagem?", opts: ["Macaco-prego", "Babuíno", "Gorila"], c: 0 },
  { img: gorila, q: "Qual é a raça do macaco da imagem?", opts: ["Gorila", "Sagui", "Macaco-aranha"], c: 0 },
  { img: chimpanze, q: "Qual é a raça do macaco da imagem?", opts: ["Chimpanzé", "Mandril", "Orangotango"], c: 0 },
  { img: mandril, q: "Qual é a raça do macaco da imagem?", opts: ["Mandril", "Gorila", "Babuíno"], c: 0 },
  { img: orangotango, q: "Qual é a raça do macaco da imagem?", opts: ["Orangotango", "Chimpanzé", "Gorila"], c: 0 },
];

/* ===== SHUFFLE REAL ===== */
function shuffleQuestion(q) {
  const options = q.opts.map((t, i) => ({ text: t, correct: i === q.c }));
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    ...q,
    options,
    correctIndex: options.findIndex((o) => o.correct),
  };
}

/* ===== COMPONENTE ===== */
export default function Quiz() {
  const [screen, setScreen] = useState("start");
  const [nickname, setNickname] = useState("");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [ranking, setRanking] = useState([]);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  const progress = useRef(new Animated.Value(0)).current;

  /* ===== INIT ===== */
  useEffect(() => {
    loadRanking();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(progress, {
        toValue: (current + 1) / questions.length || 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, [current, questions]);

  /* ===== AUDIO ===== */
  async function play(correct) {
    const { sound } = await Audio.Sound.createAsync(
      correct ? correctSound : wrongSound
    );
    await sound.playAsync();
  }

  /* ===== RANKING ===== */
  async function loadRanking() {
    const data = await AsyncStorage.getItem("@quiz_rank");
    if (data) setRanking(JSON.parse(data));
  }

  async function saveRanking(score) {
    const updated = [...ranking, { nickname, score }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setRanking(updated);
    await AsyncStorage.setItem("@quiz_rank", JSON.stringify(updated));
  }

  /* ===== GAME ===== */
  function startGame() {
    setQuestions(QUESTIONS_RAW.map(shuffleQuestion));
    setAnswers([]);
    setCurrent(0);
    setScreen("game");
  }

  function answer(index) {
    const q = questions[current];
    const correct = index === q.correctIndex;

    play(correct);

    const next = [...answers];
    next[current] = index;
    setAnswers(next);

    fade.setValue(0);
    slide.setValue(30);

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1);
      } else {
        const score = next.filter(
          (a, i) => a === questions[i].correctIndex
        ).length;
        saveRanking(score);
        setScreen("end");
      }
    }, 500);
  }

  /* ===== START ===== */
  if (screen === "start") {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>🐒 Monkey Quiz</Text>
        <TextInput
          style={styles.input}
          placeholder="Seu nickname"
          placeholderTextColor="#5D84A6"
          value={nickname}
          onChangeText={setNickname}
        />
        <TouchableOpacity
          style={[styles.primaryBtn, { opacity: nickname ? 1 : 0.4 }]}
          disabled={!nickname}
          onPress={startGame}
        >
          <Text style={styles.primaryText}>COMEÇAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ===== GAME ===== */
  if (screen === "game") {
    const q = questions[current];
    const width = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });

    return (
      <View style={styles.container}>
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressBar, { width }]} />
        </View>

        <Animated.View
          style={[
            styles.card,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <Image source={q.img} style={styles.image} />
          <Text style={styles.question}>{q.q}</Text>

          {q.options.map((o, i) => (
            <TouchableOpacity
              key={i}
              style={styles.option}
              onPress={() => answer(i)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionText}>{o.text}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    );
  }

  /* ===== END ===== */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.logo}>Resultado</Text>
      <Text style={styles.score}>
        Você acertou {answers.filter(
          (a, i) => a === questions[i].correctIndex
        ).length} de {questions.length}
      </Text>

      <Text style={styles.rankTitle}>🏆 Ranking</Text>
      {ranking.map((r, i) => (
        <Text key={i} style={styles.rank}>
          {i + 1}. {r.nickname} — {r.score}
        </Text>
      ))}
    </ScrollView>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D", padding: 24 },
  logo: { fontSize: 36, color: "#648C79", fontWeight: "900", textAlign: "center", marginBottom: 30 },

  input: {
    borderWidth: 1,
    borderColor: "#204034",
    borderRadius: 16,
    padding: 18,
    color: "#FFF",
    fontSize: 16,
    marginBottom: 20,
  },

  primaryBtn: {
    backgroundColor: "#204034",
    padding: 18,
    borderRadius: 16,
  },
  primaryText: { color: "#FFF", fontSize: 18, fontWeight: "700", textAlign: "center" },

  progressBg: {
    height: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 6,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#648C79",
  },

  card: {
    backgroundColor: "#141414",
    borderRadius: 24,
    padding: 16,
  },

  image: { width: "100%", height: 240, borderRadius: 18, marginBottom: 16 },
  question: { fontSize: 22, color: "#FFF", textAlign: "center", marginBottom: 20 },

  option: {
    backgroundColor: "#204034",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
  },
  optionText: { color: "#FFF", fontSize: 16, textAlign: "center" },

  score: { fontSize: 20, color: "#FFF", textAlign: "center", marginBottom: 20 },

  rankTitle: { fontSize: 22, color: "#5D84A6", textAlign: "center", marginBottom: 10 },
  rank: { color: "#FFF", textAlign: "center", marginBottom: 6 },
});