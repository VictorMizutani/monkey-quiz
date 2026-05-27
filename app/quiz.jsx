import React, { useEffect, useRef, useState } from "react";
import {View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Animated, ScrollView } from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import macacoPrego from "../assets/images/quiz/macaco-prego.jpg";
import gorila from "../assets/images/quiz/gorila.jpg";
import chimpanze from "../assets/images/quiz/chimpanze.jpg";
import mandril from "../assets/images/quiz/mandril.jpg";
import orangotango from "../assets/images/quiz/orangotango.jpg";
import correctSound from "../assets/images/sounds/correct.mp3";
import wrongSound from "../assets/images/sounds/wrong.mp3";

const QUESTIONS_RAW = [
  { img: macacoPrego, q: "Qual é a raça do macaco da imagem?", opts: ["Macaco-prego", "Babuíno", "Gorila"], c: 0 },
  { img: gorila, q: "Qual é a raça do macaco da imagem?", opts: ["Gorila", "Sagui", "Macaco-aranha"], c: 0 },
  { img: chimpanze, q: "Qual é a raça do macaco da imagem?", opts: ["Chimpanzé", "Mandril", "Orangotango"], c: 0 },
  { img: mandril, q: "Qual é a raça do macaco da imagem?", opts: ["Mandril", "Gorila", "Babuíno"], c: 0 },
  { img: orangotango, q: "Qual é a raça do macaco da imagem?", opts: ["Orangotango", "Chimpanzé", "Gorila"], c: 0 },
];

function shuffleQuestion(q) {
  const options = q.opts.map((t, i) => ({ text: t, correct: i === q.c }));
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { ...q, options, correctIndex: options.findIndex(o => o.correct) };
}

export default function Quiz() {
  const [screen, setScreen] = useState("start");
  const [nickname, setNickname] = useState("");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [ranking, setRanking] = useState([]);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRanking();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(progress, {
        toValue: questions.length ? current / questions.length : 0,
        duration: 350,
        useNativeDriver: false,
      }),
    ]).start();
  }, [current, questions]);

  async function play(correct) {
    const { sound } = await Audio.Sound.createAsync(
      correct ? correctSound : wrongSound
    );
    await sound.playAsync();
  }

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

  function startGame() {
    setQuestions(QUESTIONS_RAW.map(shuffleQuestion));
    setAnswers([]);
    setCurrent(0);
    setScreen("game");
  }

  function answer(index) {
    const correct = index === questions[current].correctIndex;
    play(correct);

    const next = [...answers];
    next[current] = index;
    setAnswers(next);

    fade.setValue(0);
    slide.setValue(20);

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
    }, 450);
  }

  if (screen === "start") {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>Monkey Quiz</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nickname"
          placeholderTextColor="#7CA89A"
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

        <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <Image source={q.img} style={styles.image} />
          <Text style={styles.question}>{q.q}</Text>

          {q.options.map((o, i) => (
            <TouchableOpacity
              key={i}
              style={styles.option}
              onPress={() => answer(i)}
              activeOpacity={0.85}
            >
              <Text style={styles.optionText}>{o.text}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>Resultado</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreBig}>
          {answers.filter((a, i) => a === questions[i].correctIndex).length}
        </Text>
        <Text style={styles.scoreLabel}>ACERTOS</Text>
      </View>

      <Text style={styles.rankTitle}>Ranking</Text>

      {ranking.map((r, i) => (
        <View
          key={i}
          style={[
            styles.rankCard,
            r.nickname === nickname && styles.rankHighlight,
          ]}
        >
          <Text style={styles.rankPos}>{["🥇", "🥈", "🥉"][i] || i + 1}</Text>
          <Text style={styles.rankName}>{r.nickname}</Text>
          <Text style={styles.rankScore}>{r.score}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0B1210",
    padding: 24,
    justifyContent: "center",
  },

  logo: {
    fontSize: 36,
    color: "#7FD1AE",
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 32,
  },

  input: {
    borderWidth: 1,
    borderColor: "#2E4D40",
    borderRadius: 18,
    padding: 18,
    color: "#FFF",
    fontSize: 16,
    marginBottom: 24,
  },

  primaryBtn: {
    backgroundColor: "#2E8B6F",
    padding: 18,
    borderRadius: 18,
  },

  primaryText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  progressBg: {
    height: 14,
    backgroundColor: "#1C2E27",
    borderRadius: 10,
    marginBottom: 24,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#7FD1AE",
  },

  card: {
    backgroundColor: "#121F1A",
    borderRadius: 26,
    padding: 18,
  },

  image: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    marginBottom: 18,
  },

  question: {
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 22,
    fontWeight: "700",
  },

  option: {
    backgroundColor: "#1F3A30",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },

  optionText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },

  scoreCard: {
    alignItems: "center",
    backgroundColor: "#121F1A",
    borderRadius: 28,
    padding: 28,
    marginBottom: 30,
  },

  scoreBig: {
    fontSize: 64,
    fontWeight: "900",
    color: "#7FD1AE",
  },

  scoreLabel: {
    color: "#9ACDB7",
    fontSize: 14,
    letterSpacing: 2,
  },

  rankTitle: {
    fontSize: 22,
    color: "#9ACDB7",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "700",
  },

  rankCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121F1A",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  rankHighlight: {
    borderWidth: 1,
    borderColor: "#7FD1AE",
  },

  rankPos: {
    fontSize: 22,
    width: 40,
    textAlign: "center",
  },

  rankName: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  rankScore: {
    color: "#7FD1AE",
    fontSize: 16,
    fontWeight: "800",
  },
});