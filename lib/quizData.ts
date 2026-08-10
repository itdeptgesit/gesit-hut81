export interface QuizQuestion {
  id: number;
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  timeLimit: number;
  category: string;
  emoji: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Pada tanggal berapa Proklamasi Kemerdekaan Indonesia dibacakan?",
    options: ["17 Agustus 1945", "17 Agustus 1950", "1 Juni 1945", "28 Oktober 1928"],
    correct: 0,
    timeLimit: 20,
    category: "Kemerdekaan",
    emoji: "🇮🇩",
  },
  {
    id: 2,
    question: "Siapa yang membacakan teks Proklamasi Kemerdekaan Indonesia?",
    options: ["Soekarno & Hatta", "Soekarno saja", "Mohammad Hatta saja", "Ahmad Soebardjo"],
    correct: 0,
    timeLimit: 20,
    category: "Kemerdekaan",
    emoji: "📜",
  },
  {
    id: 3,
    question: "Di mana naskah Proklamasi Kemerdekaan Indonesia dibacakan?",
    options: [
      "Jl. Pegangsaan Timur No. 56, Jakarta",
      "Istana Merdeka, Jakarta",
      "Gedung Pancasila, Jakarta",
      "Lapangan Ikada, Jakarta",
    ],
    correct: 0,
    timeLimit: 20,
    category: "Kemerdekaan",
    emoji: "🏠",
  },
  {
    id: 4,
    question: "Siapa perancang utama bendera Merah Putih?",
    options: ["Fatmawati", "Dewi Sartika", "R.A. Kartini", "Cut Nyak Dien"],
    correct: 0,
    timeLimit: 15,
    category: "Kemerdekaan",
    emoji: "🚩",
  },
  {
    id: 5,
    question: "Lagu kebangsaan Indonesia Raya diciptakan oleh siapa?",
    options: ["W.R. Supratman", "C. Simanjuntak", "Ismail Marzuki", "Kusbini"],
    correct: 0,
    timeLimit: 15,
    category: "Kemerdekaan",
    emoji: "🎵",
  },
  {
    id: 6,
    question: "Apa semboyan bangsa Indonesia yang tertulis pada lambang negara Garuda Pancasila?",
    options: ["Bhinneka Tunggal Ika", "Tut Wuri Handayani", "Rastra Sewakottama", "Jalesveva Jayamahe"],
    correct: 0,
    timeLimit: 15,
    category: "Kemerdekaan",
    emoji: "🦅",
  },
  {
    id: 7,
    question: "Berapa jumlah bulu pada sayap Garuda Pancasila yang melambangkan tanggal kemerdekaan?",
    options: ["17 helai", "8 helai", "45 helai", "19 helai"],
    correct: 0,
    timeLimit: 20,
    category: "Fun Trivia",
    emoji: "🦚",
  },
  {
    id: 8,
    question: "Indonesia merayakan HUT ke berapa pada tahun 2026?",
    options: ["81", "80", "79", "82"],
    correct: 0,
    timeLimit: 15,
    category: "Fun Trivia",
    emoji: "🎂",
  },
  {
    id: 9,
    question: "Siapakah Presiden pertama Republik Indonesia?",
    options: ["Ir. Soekarno", "Mohammad Hatta", "Soeharto", "B.J. Habibie"],
    correct: 0,
    timeLimit: 10,
    category: "Kemerdekaan",
    emoji: "👑",
  },
  {
    id: 10,
    question: "Pancasila sebagai dasar negara disahkan pada tanggal berapa?",
    options: ["18 Agustus 1945", "1 Juni 1945", "17 Agustus 1945", "22 Juni 1945"],
    correct: 0,
    timeLimit: 20,
    category: "Kemerdekaan",
    emoji: "📖",
  },
  {
    id: 11,
    question: "Apa nama gedung yang menjadi tempat sidang BPUPKI dan PPKI?",
    options: ["Gedung Chuo Sangi-in", "Gedung Merdeka", "Istana Negara", "Gedung Pancasila"],
    correct: 0,
    timeLimit: 20,
    category: "Fun Trivia",
    emoji: "🏛️",
  },
  {
    id: 12,
    question: "Bunga apakah yang menjadi bunga nasional Indonesia (puspa bangsa)?",
    options: ["Melati Putih", "Anggrek Bulan", "Rafflesia Arnoldi", "Mawar Merah"],
    correct: 0,
    timeLimit: 15,
    category: "Fun Trivia",
    emoji: "🌸",
  },
];
