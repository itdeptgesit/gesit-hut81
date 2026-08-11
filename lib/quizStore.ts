import { QuizQuestion, quizQuestions } from './quizData';

export type QuizPhase = "idle" | "lobby" | "countdown" | "question" | "answer" | "leaderboard" | "result";

export interface Participant {
  id: string;
  name: string;
  score: number;
  lastAnswer: number | null;
  answerTime: number | null; // ms taken to answer
  isCorrect: boolean | null;
}

export interface ActiveQuestion extends QuizQuestion {
  shuffledOptions: string[];
  correctShuffledIndex: number;
}

export interface QuizState {
  pin: string | null;
  phase: QuizPhase;
  questions: ActiveQuestion[];
  currentQuestionIndex: number;
  questionStartTime: number | null; // Timestamp when question was shown
  participants: Record<string, Participant>;
}

// Helper to shuffle array
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate active questions with shuffled options
export function generateQuestions(): ActiveQuestion[] {
  const shuffledQs = shuffle(quizQuestions); // shuffle order of questions
  return shuffledQs.map(q => {
    const optionsWithIndex = q.options.map((opt, i) => ({ opt, isCorrect: i === q.correct }));
    const shuffledOptions = shuffle(optionsWithIndex);
    const correctShuffledIndex = shuffledOptions.findIndex(o => o.isCorrect);
    
    return {
      ...q,
      shuffledOptions: shuffledOptions.map(o => o.opt),
      correctShuffledIndex
    };
  });
}

const defaultState: QuizState = {
  pin: null,
  phase: "lobby",
  questions: [], // Will be generated on start
  currentQuestionIndex: 0,
  questionStartTime: null,
  participants: {}
};

// In Next.js dev mode, preserve state across hot-reloads
const globalForQuiz = globalThis as unknown as {
  quizState: QuizState | undefined;
};

export const quizStore = {
  getState: () => {
    if (!globalForQuiz.quizState) {
      globalForQuiz.quizState = { ...defaultState };
    }
    return globalForQuiz.quizState;
  },
  
  resetState: () => {
    globalForQuiz.quizState = { ...defaultState, participants: {} };
    return globalForQuiz.quizState;
  },

  setState: (newState: Partial<QuizState>) => {
    const state = quizStore.getState();
    Object.assign(state, newState);
    return state;
  },

  updateParticipant: (id: string, data: Partial<Participant>) => {
    const state = quizStore.getState();
    if (state.participants[id]) {
      state.participants[id] = { ...state.participants[id], ...data };
    } else if (data.name) {
       // Create new participant
       state.participants[id] = {
         id,
         name: data.name,
         score: 0,
         lastAnswer: null,
         answerTime: null,
         isCorrect: null,
         ...data
       };
    }
    return state;
  }
};
