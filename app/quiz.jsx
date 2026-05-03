import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView,} from "react-native";

import macacoPrego from "../assets/images/quiz/macaco-prego.jpg";
import gorila from "../assets/images/quiz/gorila.jpg";
import chimpanze from "../assets/images/quiz/chimpanze.jpg";
import mandril from "../assets/images/quiz/mandril.jpg";
import orangotango from "../assets/images/quiz/orangotango.jpg";

const QUESTIONS = [
  {
    id: 1,
    question: "Qual é a raça do macaco da imagem?",
    image: macacoPrego,
    options: ["Macaco-prego", "Babuíno", "Gorila"],
    correct: 0,
  },
  {
    id: 2,
    question: "Qual é a raça do macaco da imagem?",
    image: gorila,
    options: ["Gorila", "Sagui", "Macaco-aranha"],
    correct: 0,
  },
  {
    id: 3,
    question: "Qual é a raça do macaco da imagem?",
    image: chimpanze,
    options: ["Chimpanzé", "Mandril", "Orangotango"],
    correct: 0,
  },
  {
    id: 4,
    question: "Qual é a raça do macaco da imagem?",
    image: mandril,
    options: ["Mandril", "Gorila", "Babuíno"],
    correct: 0,
  },
  {
    id: 5,
    question: "Qual é a raça do macaco da imagem?",
    image: orangotango,
    options: ["Orangotango", "Chimpanzé", "Gorila"],
    correct: 0,
  },
  {
    id: 6,
    question: "Qual desses macacos é conhecido pela inteligência?",
    image: chimpanze,
    options: ["Chimpanzé", "Sagui", "Mandril"],
    correct: 0,
  },
  {
    id: 7,
    question: "Qual desses macacos vive principalmente nas árvores?",
    image: orangotango,
    options: ["Orangotango", "Gorila", "Babuíno"],
    correct: 0,
  },
  {
    id: 8,
    question: "Qual macaco possui coloração facial marcante?",
    image: mandril,
    options: ["Mandril", "Chimpanzé", "Gorila"],
    correct: 0,
  },
  {
    id: 9,
    question: "Qual macaco é típico da América do Sul?",
    image: macacoPrego,
    options: ["Macaco-prego", "Mandril", "Gorila"],
    correct: 0,
  },
  {
    id: 10,
    question: "Qual desses macacos é considerado um grande primata?",
    image: gorila,
    options: ["Gorila", "Sagui", "Macaco-prego"],
    correct: 0,
  },
];

export default function Quiz() {
  const [screen, setScreen] = useState(1);
  const [nickname, setNickname] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);

  function handleAnswer(optionIndex) {
    const newAnswers = [...answers];
    newAnswers[current] = optionIndex;
    setAnswers(newAnswers);

    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
    } else {
      setScreen(3);
    }
  }

  function score() {
    return answers.filter(
      (ans, i) => ans === QUESTIONS[i].correct
    ).length;
  }

//tela 1
  if (screen === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🐒 Monkey Quiz</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu nickname"
          placeholderTextColor="#5D84A6"
          value={nickname}
          onChangeText={setNickname}
        />

        <TouchableOpacity
          style={[
            styles.button,
            { opacity: nickname ? 1 : 0.4 },
          ]}
          disabled={!nickname}
          onPress={() => setScreen(2)}
        >
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
      </View>
    );
  }

//Tela 2 POR FAVOR NÃO MEXER ISACK!!!!!!
  if (screen === 2) {
    const q = QUESTIONS[current];

    return (
      <View style={styles.container}>
        <Text style={styles.progress}>
          {current + 1}/{QUESTIONS.length}
        </Text>

        <Text style={styles.subtitle}>
          Pergunta {current + 1}
        </Text>

        <View style={styles.imageBox}>
          <Image
            source={q.image}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.question}>{q.question}</Text>

        {q.options.map((opt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={() => handleAnswer(index)}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

//tela 3
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Resultado Final</Text>

      <Text style={styles.score}>
        {nickname}, você acertou {score()} de{" "}
        {QUESTIONS.length}
      </Text>

      {QUESTIONS.map((q, i) => {
        const correct = answers[i] === q.correct;
        return (
          <View
            key={q.id}
            style={[
              styles.resultBox,
              {
                borderColor: correct
                  ? "#648C79"
                  : "#5D84A6",
              },
            ]}
          >
            <Text style={styles.resultQuestion}>
              {i + 1}. {q.question}
            </Text>
            <Text
              style={{
                color: correct
                  ? "#648C79"
                  : "#5D84A6",
              }}
            >
              Sua resposta: {q.options[answers[i]]}
            </Text>
            {!correct && (
              <Text style={{ color: "#648C79" }}>
                Correta: {q.options[q.correct]}
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#648C79",
    textAlign: "center",
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 18,
    color: "#5D84A6",
    textAlign: "center",
    marginBottom: 16,
  },
  progress: {
    fontSize: 16,
    color: "#648C79",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#204034",
    borderRadius: 12,
    padding: 16,
    color: "#FFF",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#204034",
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  imageBox: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#204034",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  question: {
    fontSize: 20,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
  },
  option: {
    backgroundColor: "#204034",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
  },
  score: {
    fontSize: 20,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 24,
  },
  resultBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultQuestion: {
    color: "#FFF",
    marginBottom: 6,
  },
});