import {
  Exam,
  Question,
  ExamAttempt,
  Subject,
  ExamFilters,
  ExamSortOption,
} from '../types/examTypes';

// Mock data for development - replace with actual API calls
const SUBJECTS: Subject[] = [
  {id: '1', name: 'All', color: '#3CBCB2'},
  {id: '2', name: 'Math', color: '#FF6B6B'},
  {id: '3', name: 'History', color: '#4ECDC4'},
  {id: '4', name: 'Art', color: '#45B7D1'},
  {id: '5', name: 'Biology', color: '#96CEB4'},
  {id: '6', name: 'Chemistry', color: '#FFEAA7'},
  {id: '7', name: 'Physics', color: '#DDA0DD'},
  {id: '8', name: 'English', color: '#98D8C8'},
  {id: '9', name: 'Music', color: '#F7DC6F'},
];

const MOCK_EXAMS: Exam[] = [
  {
    id: '1',
    title: 'English Language Test',
    subject: SUBJECTS[7], // English
    level: 'B1',
    sentences: 40,
    questions: 40,
    duration: 60,
    attempts: 200,
    difficulty: 'Medium',
    description: 'Comprehensive English language proficiency test',
  },
  {
    id: '2',
    title: 'Advanced Mathematics',
    subject: SUBJECTS[1], // Math
    level: 'C1',
    sentences: 5,
    questions: 40,
    duration: 90,
    attempts: 150,
    difficulty: 'Hard',
    description: 'Advanced calculus and algebra problems',
  },
  {
    id: '3',
    title: 'History of Arts',
    subject: SUBJECTS[3], // Art
    level: 'A2',
    sentences: 8,
    questions: 60,
    duration: 45,
    attempts: 75,
    difficulty: 'Easy',
    description: 'Art history from Renaissance to modern times',
  },
  {
    id: '4',
    title: 'Physics Olympiad Prep',
    subject: SUBJECTS[6], // Physics
    level: 'C2',
    sentences: 4,
    questions: 30,
    duration: 120,
    attempts: 45,
    difficulty: 'Hard',
    description: 'Advanced physics problems for olympiad preparation',
  },
  {
    id: '5',
    title: 'Biology Basics',
    subject: SUBJECTS[4], // Biology
    level: 'A1',
    sentences: 10,
    questions: 70,
    duration: 50,
    attempts: 120,
    difficulty: 'Easy',
    description: 'Fundamental biology concepts and principles',
  },
  {
    id: '6',
    title: 'Chemistry Exam',
    subject: SUBJECTS[5], // Chemistry
    level: 'B2',
    sentences: 6,
    questions: 45,
    duration: 75,
    attempts: 90,
    difficulty: 'Medium',
    description: 'Organic and inorganic chemistry fundamentals',
  },
  {
    id: '7',
    title: 'Music Theory',
    subject: SUBJECTS[8], // Music
    level: 'B1',
    sentences: 7,
    questions: 55,
    duration: 60,
    attempts: 60,
    difficulty: 'Medium',
    description: 'Music theory and composition basics',
  },
  {
    id: '8',
    title: 'General Knowledge',
    subject: SUBJECTS[2], // History
    level: 'A2',
    sentences: 10,
    questions: 100,
    duration: 60,
    attempts: 300,
    difficulty: 'Medium',
    description: 'General knowledge across various topics',
  },
];

const MOCK_QUESTIONS: Record<string, Question[]> = {
  '1': [
    // English Language Test questions
    {
      id: 'q1',
      type: 'MCQ',
      question: 'The cat is sleeping _____ the table.',
      options: ['on', 'in', 'at', 'under'],
      correctAnswer: 'on',
      explanation: 'The correct preposition is "on" for this context.',
    },
    {
      id: 'q2',
      type: 'MCQ',
      question: 'She _____ to the store every day.',
      options: ['go', 'goes', 'is going', 'went'],
      correctAnswer: 'goes',
      explanation: 'Third person singular requires "goes".',
    },
    {
      id: 'q3',
      type: 'MCQ',
      question: 'I _____ my homework yesterday.',
      options: ['finish', 'finished', 'finishes', 'finishing'],
      correctAnswer: 'finished',
      explanation: 'Past tense requires "finished".',
    },
    {
      id: 'q4',
      type: 'MCQ',
      question: 'They _____ to the movies last night.',
      options: ['go', 'goes', 'went', 'going'],
      correctAnswer: 'went',
      explanation: 'Past tense requires "went".',
    },
    {
      id: 'q5',
      type: 'FRQ',
      question: 'Explain the main theme of "To Kill a Mockingbird."',
      explanation:
        'The novel explores themes of racial injustice, moral growth, and empathy.',
    },
    {
      id: 'q6',
      type: 'FRQ',
      question: 'Describe the process of photosynthesis.',
      explanation:
        'Photosynthesis is the process by which plants convert light energy into chemical energy.',
    },
  ],
  '2': [
    // Advanced Mathematics questions
    {
      id: 'm1',
      type: 'MCQ',
      question: 'What is the derivative of x²?',
      options: ['x', '2x', 'x²', '2x²'],
      correctAnswer: '2x',
      explanation: 'The derivative of x² is 2x using power rule.',
    },
    {
      id: 'm2',
      type: 'MCQ',
      question: 'What is the integral of 2x?',
      options: ['x', 'x²', '2x²', 'x² + C'],
      correctAnswer: 'x² + C',
      explanation: 'The integral of 2x is x² + C.',
    },
    {
      id: 'm3',
      type: 'MCQ',
      question: 'Solve for x: 2x + 3 = 7',
      options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
      correctAnswer: 'x = 2',
      explanation: '2x + 3 = 7, so 2x = 4, x = 2.',
    },
    {
      id: 'm4',
      type: 'FRQ',
      question: 'Explain the Pythagorean theorem and provide an example.',
      explanation:
        'Pythagorean theorem states that in a right triangle, a² + b² = c² where c is the hypotenuse.',
    },
    {
      id: 'm5',
      type: 'FRQ',
      question: 'Describe how to find the area of a circle.',
      explanation: 'The area of a circle is πr² where r is the radius.',
    },
  ],
  '3': [
    // History of Arts questions
    {
      id: 'a1',
      type: 'MCQ',
      question: 'Who painted the Mona Lisa?',
      options: [
        'Vincent van Gogh',
        'Pablo Picasso',
        'Leonardo da Vinci',
        'Michelangelo',
      ],
      correctAnswer: 'Leonardo da Vinci',
      explanation:
        'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.',
    },
    {
      id: 'a2',
      type: 'MCQ',
      question: 'In which period was the Renaissance?',
      options: [
        '14th-15th century',
        '15th-16th century',
        '16th-17th century',
        '17th-18th century',
      ],
      correctAnswer: '15th-16th century',
      explanation: 'The Renaissance period was from the 15th to 16th century.',
    },
    {
      id: 'a3',
      type: 'FRQ',
      question: 'Describe the main characteristics of Baroque art.',
      explanation:
        'Baroque art is characterized by dramatic lighting, intense emotions, and grandeur.',
    },
    {
      id: 'a4',
      type: 'FRQ',
      question: 'Explain the significance of the Sistine Chapel ceiling.',
      explanation:
        'The Sistine Chapel ceiling painted by Michelangelo depicts scenes from Genesis and is a masterpiece of Renaissance art.',
    },
  ],
  '4': [
    // Physics Olympiad Prep questions
    {
      id: 'p1',
      type: 'MCQ',
      question: 'What is the unit of force?',
      options: ['Joule', 'Newton', 'Watt', 'Pascal'],
      correctAnswer: 'Newton',
      explanation: 'Force is measured in Newtons (N).',
    },
    {
      id: 'p2',
      type: 'MCQ',
      question: 'F = ma, what does "a" represent?',
      options: ['Acceleration', 'Area', 'Amount', 'Angle'],
      correctAnswer: 'Acceleration',
      explanation: 'In F = ma, a represents acceleration.',
    },
    {
      id: 'p3',
      type: 'FRQ',
      question: "Explain Newton's first law of motion.",
      explanation:
        'An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.',
    },
    {
      id: 'p4',
      type: 'FRQ',
      question: 'Describe the relationship between velocity and acceleration.',
      explanation:
        'Acceleration is the rate of change of velocity with respect to time.',
    },
  ],
  '5': [
    // Biology Basics questions
    {
      id: 'b1',
      type: 'MCQ',
      question: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic reticulum'],
      correctAnswer: 'Mitochondria',
      explanation:
        'Mitochondria are known as the powerhouse of the cell because they produce energy.',
    },
    {
      id: 'b2',
      type: 'MCQ',
      question: 'How many chromosomes do humans have?',
      options: ['23', '46', '48', '92'],
      correctAnswer: '46',
      explanation: 'Humans have 46 chromosomes, 23 pairs.',
    },
    {
      id: 'b3',
      type: 'FRQ',
      question: 'Explain the process of mitosis.',
      explanation:
        'Mitosis is cell division that results in two identical daughter cells.',
    },
    {
      id: 'b4',
      type: 'FRQ',
      question: 'Describe the structure of DNA.',
      explanation: 'DNA is a double helix structure composed of nucleotides.',
    },
  ],
  '6': [
    // Chemistry Exam questions
    {
      id: 'c1',
      type: 'MCQ',
      question: 'What is the chemical symbol for gold?',
      options: ['Go', 'Gd', 'Au', 'Ag'],
      correctAnswer: 'Au',
      explanation: "Gold's chemical symbol is Au from the Latin word aurum.",
    },
    {
      id: 'c2',
      type: 'MCQ',
      question: 'What type of bond is formed when electrons are shared?',
      options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'],
      correctAnswer: 'Covalent',
      explanation:
        'Covalent bonds are formed when electrons are shared between atoms.',
    },
    {
      id: 'c3',
      type: 'FRQ',
      question: 'Explain the difference between acids and bases.',
      explanation: 'Acids donate protons (H+) while bases accept protons.',
    },
    {
      id: 'c4',
      type: 'FRQ',
      question: 'Describe the periodic table organization.',
      explanation:
        'The periodic table is organized by atomic number and groups elements with similar properties.',
    },
  ],
  '7': [
    // Music Theory questions
    {
      id: 'mu1',
      type: 'MCQ',
      question: 'How many notes are in a musical scale?',
      options: ['5', '7', '8', '12'],
      correctAnswer: '7',
      explanation: 'A diatonic scale has 7 notes.',
    },
    {
      id: 'mu2',
      type: 'MCQ',
      question: 'What does "forte" mean in music?',
      options: ['Soft', 'Loud', 'Fast', 'Slow'],
      correctAnswer: 'Loud',
      explanation: 'Forte means loud in musical notation.',
    },
    {
      id: 'mu3',
      type: 'FRQ',
      question: 'Explain the concept of rhythm in music.',
      explanation:
        'Rhythm is the pattern of sounds and silences in music over time.',
    },
    {
      id: 'mu4',
      type: 'FRQ',
      question: 'Describe the difference between major and minor scales.',
      explanation:
        'Major scales sound happy and bright, while minor scales sound sad and dark.',
    },
  ],
  '8': [
    // General Knowledge questions
    {
      id: 'g1',
      type: 'MCQ',
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital and largest city of France.',
    },
    {
      id: 'g2',
      type: 'MCQ',
      question: 'Who painted the ceiling of the Sistine Chapel?',
      options: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello'],
      correctAnswer: 'Michelangelo',
      explanation: 'Michelangelo painted the ceiling of the Sistine Chapel.',
    },
    {
      id: 'g3',
      type: 'MCQ',
      question: 'What is the largest planet in our solar system?',
      options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 'Jupiter',
      explanation: 'Jupiter is the largest planet in our solar system.',
    },
    {
      id: 'g4',
      type: 'FRQ',
      question: 'Explain the importance of recycling.',
      explanation:
        'Recycling helps conserve resources, reduce pollution, and protect the environment.',
    },
    {
      id: 'g5',
      type: 'FRQ',
      question: 'Describe the benefits of regular exercise.',
      explanation:
        'Regular exercise improves physical health, mental well-being, and overall quality of life.',
    },
  ],
};

export class ExamService {
  // Get all subjects
  static async getSubjects(): Promise<Subject[]> {
    try {
      // In real implementation: return await axios.get('/subjects');
      return SUBJECTS;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  // Get all exams with optional filtering
  static async getExams(
    filters?: ExamFilters,
    sort?: ExamSortOption,
  ): Promise<Exam[]> {
    try {
      // In real implementation: return await axios.get('/exams', { params: { filters, sort } });

      let filteredExams = [...MOCK_EXAMS];

      // Apply filters
      if (filters) {
        if (filters.subject && filters.subject !== 'All') {
          filteredExams = filteredExams.filter(
            exam => exam.subject.name === filters.subject,
          );
        }

        if (filters.level) {
          filteredExams = filteredExams.filter(
            exam => exam.level === filters.level,
          );
        }

        if (filters.difficulty) {
          filteredExams = filteredExams.filter(
            exam => exam.difficulty === filters.difficulty,
          );
        }

        if (filters.duration) {
          if (filters.duration.min) {
            filteredExams = filteredExams.filter(
              exam => exam.duration >= filters.duration!.min!,
            );
          }
          if (filters.duration.max) {
            filteredExams = filteredExams.filter(
              exam => exam.duration <= filters.duration!.max!,
            );
          }
        }

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredExams = filteredExams.filter(
            exam =>
              exam.title.toLowerCase().includes(query) ||
              exam.description?.toLowerCase().includes(query) ||
              exam.subject.name.toLowerCase().includes(query),
          );
        }
      }

      // Apply sorting
      if (sort) {
        filteredExams.sort((a, b) => {
          let aValue: any, bValue: any;

          switch (sort.field) {
            case 'title':
              aValue = a.title;
              bValue = b.title;
              break;
            case 'level':
              aValue = a.level;
              bValue = b.level;
              break;
            case 'duration':
              aValue = a.duration;
              bValue = b.duration;
              break;
            case 'attempts':
              aValue = a.attempts || 0;
              bValue = b.attempts || 0;
              break;
            case 'difficulty':
              const difficultyOrder = {Easy: 1, Medium: 2, Hard: 3};
              aValue = difficultyOrder[a.difficulty];
              bValue = difficultyOrder[b.difficulty];
              break;
            default:
              return 0;
          }

          if (sort.direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
      }

      return filteredExams;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  }

  // Get specific exam by ID
  static async getExamById(examId: string): Promise<Exam | null> {
    try {
      // In real implementation: return await axios.get(`/exams/${examId}`);
      return MOCK_EXAMS.find(exam => exam.id === examId) || null;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  }

  // Get questions for an exam
  static async getExamQuestions(examId: string): Promise<Question[]> {
    try {
      // In real implementation: return await axios.get(`/exams/${examId}/questions`);
      return MOCK_QUESTIONS[examId] || [];
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      throw error;
    }
  }

  // Submit exam attempt
  static async submitExamAttempt(
    attempt: Omit<ExamAttempt, 'id'>,
  ): Promise<ExamAttempt> {
    try {
      // In real implementation: return await axios.post('/exam-attempts', attempt);
      const newAttempt: ExamAttempt = {
        ...attempt,
        id: Date.now().toString(),
      };
      return newAttempt;
    } catch (error) {
      console.error('Error submitting exam attempt:', error);
      throw error;
    }
  }

  // Get user's exam statistics
  static async getExamStats(userId: string): Promise<any> {
    try {
      // In real implementation: return await axios.get(`/users/${userId}/exam-stats`);
      return {
        totalAttempts: 15,
        averageScore: 78,
        bestScore: 95,
        totalTimeSpent: 1200, // in minutes
        subjectProgress: {
          English: 85,
          Math: 72,
          History: 90,
          Art: 65,
          Biology: 78,
          Chemistry: 70,
          Physics: 60,
          Music: 55,
        },
      };
    } catch (error) {
      console.error('Error fetching exam stats:', error);
      throw error;
    }
  }

  // Search exams
  static async searchExams(query: string): Promise<Exam[]> {
    try {
      return this.getExams({searchQuery: query});
    } catch (error) {
      console.error('Error searching exams:', error);
      throw error;
    }
  }

  // Get user's exam attempts/results
  static async getUserExamAttempts(userId: string): Promise<ExamAttempt[]> {
    try {
      // In real implementation: return await axios.get(`/users/${userId}/exam-attempts`);

      // Mock data for development - in real app, this would come from the backend
      const mockAttempts: ExamAttempt[] = [
        {
          id: '1',
          examId: '1',
          userId: userId,
          startTime: new Date('2024-01-15T10:00:00'),
          endTime: new Date('2024-01-15T11:00:00'),
          score: 85,
          totalQuestions: 40,
          correctAnswers: 34,
          timeSpent: 45,
          completed: true,
          answers: [],
        },
        {
          id: '2',
          examId: '2',
          userId: userId,
          startTime: new Date('2024-01-14T14:30:00'),
          endTime: new Date('2024-01-14T16:00:00'),
          score: 72,
          totalQuestions: 40,
          correctAnswers: 29,
          timeSpent: 75,
          completed: true,
          answers: [],
        },
        {
          id: '3',
          examId: '3',
          userId: userId,
          startTime: new Date('2024-01-13T09:15:00'),
          endTime: new Date('2024-01-13T10:00:00'),
          score: 90,
          totalQuestions: 60,
          correctAnswers: 54,
          timeSpent: 35,
          completed: true,
          answers: [],
        },
        {
          id: '4',
          examId: '5',
          userId: userId,
          startTime: new Date('2024-01-12T16:20:00'),
          endTime: new Date('2024-01-12T17:10:00'),
          score: 78,
          totalQuestions: 70,
          correctAnswers: 55,
          timeSpent: 40,
          completed: true,
          answers: [],
        },
        {
          id: '5',
          examId: '8',
          userId: userId,
          startTime: new Date('2024-01-11T11:45:00'),
          endTime: new Date('2024-01-11T12:45:00'),
          score: 65,
          totalQuestions: 100,
          correctAnswers: 65,
          timeSpent: 50,
          completed: true,
          answers: [],
        },
      ];

      return mockAttempts;
    } catch (error) {
      console.error('Error fetching user exam attempts:', error);
      throw error;
    }
  }

  // Get exam attempt by ID with full details
  static async getExamAttemptById(
    attemptId: string,
  ): Promise<ExamAttempt | null> {
    try {
      // In real implementation: return await axios.get(`/exam-attempts/${attemptId}`);

      // For now, return null as we don't have detailed attempt data in mock
      return null;
    } catch (error) {
      console.error('Error fetching exam attempt:', error);
      throw error;
    }
  }
}
