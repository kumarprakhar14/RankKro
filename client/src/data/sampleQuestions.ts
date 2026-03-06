export interface Question {
  id: string
  section: string
  text: string
  options: string[]
  correctOption: number // 0-indexed
  explanation: string
  marks: number
  negativeMarks: number
  subject: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export const sampleQuestions: Question[] = [
  // General Awareness (10 questions)
  {
    id: 'q1',
    section: 'General Awareness',
    text: 'The Preamble to the Indian Constitution was amended by which Constitutional Amendment Act?',
    options: [
      '24th Amendment Act',
      '42nd Amendment Act',
      '44th Amendment Act',
      '52nd Amendment Act',
    ],
    correctOption: 1,
    explanation:
      'The 42nd Constitutional Amendment Act (1976) amended the Preamble of the Indian Constitution by inserting the words "Socialist", "Secular", and "Integrity".',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Polity',
    difficulty: 'Medium',
  },
  {
    id: 'q2',
    section: 'General Awareness',
    text: 'Which article of the Indian Constitution deals with the Right to Equality?',
    options: [
      'Article 14-18',
      'Article 19-22',
      'Article 23-24',
      'Article 25-28',
    ],
    correctOption: 0,
    explanation:
      'Articles 14 to 18 of the Indian Constitution deal with the Right to Equality. Article 14 ensures equality before law, Article 15 prohibits discrimination, Article 16 ensures equality in public employment, Article 17 abolishes untouchability, and Article 18 abolishes titles.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Polity',
    difficulty: 'Easy',
  },
  {
    id: 'q3',
    section: 'General Awareness',
    text: "Who is known as the 'Iron Man of India'?",
    options: [
      'Jawaharlal Nehru',
      'Bhagat Singh',
      'Sardar Vallabhbhai Patel',
      'Subhas Chandra Bose',
    ],
    correctOption: 2,
    explanation:
      "Sardar Vallabhbhai Patel is known as the 'Iron Man of India' for his role in integrating over 560 princely states into the Indian Union after independence.",
    marks: 2,
    negativeMarks: 0.5,
    subject: 'History',
    difficulty: 'Easy',
  },
  {
    id: 'q4',
    section: 'General Awareness',
    text: 'The headquarters of the International Monetary Fund (IMF) is located in:',
    options: [
      'New York, USA',
      'Geneva, Switzerland',
      'Washington D.C., USA',
      'Vienna, Austria',
    ],
    correctOption: 2,
    explanation:
      'The International Monetary Fund (IMF) is headquartered in Washington D.C., USA. It was established in 1944 at the Bretton Woods Conference.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Economics',
    difficulty: 'Easy',
  },
  {
    id: 'q5',
    section: 'General Awareness',
    text: 'Which planet is known as the "Red Planet"?',
    options: ['Venus', 'Jupiter', 'Saturn', 'Mars'],
    correctOption: 3,
    explanation:
      'Mars is known as the "Red Planet" because its surface is covered with iron oxide (rust), giving it a reddish appearance.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Science',
    difficulty: 'Easy',
  },

  // Quantitative Aptitude (10 questions)
  {
    id: 'q6',
    section: 'Quantitative Aptitude',
    text: 'A train 150 m long passes a pole in 15 seconds. What is the speed of the train in km/h?',
    options: ['36 km/h', '40 km/h', '45 km/h', '54 km/h'],
    correctOption: 0,
    explanation:
      'Speed = Distance/Time = 150/15 = 10 m/s. Converting to km/h: 10 × (18/5) = 36 km/h.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Speed & Distance',
    difficulty: 'Easy',
  },
  {
    id: 'q7',
    section: 'Quantitative Aptitude',
    text: 'If the simple interest on ₹2000 for 3 years at the rate of R% per annum is ₹360, find R.',
    options: ['4%', '5%', '6%', '8%'],
    correctOption: 2,
    explanation:
      'SI = P × R × T / 100 → 360 = 2000 × R × 3 / 100 → 360 = 60R → R = 6%.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Simple Interest',
    difficulty: 'Easy',
  },
  {
    id: 'q8',
    section: 'Quantitative Aptitude',
    text: 'The ratio of two numbers is 3:5 and their LCM is 300. What is their HCF?',
    options: ['15', '20', '25', '30'],
    correctOption: 1,
    explanation:
      'Let numbers be 3k and 5k. LCM of 3k and 5k = 15k = 300 → k = 20. So HCF = k = 20.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'HCF & LCM',
    difficulty: 'Medium',
  },
  {
    id: 'q9',
    section: 'Quantitative Aptitude',
    text: 'A shopkeeper marks his goods 25% above cost price and allows a discount of 10%. His profit percentage is:',
    options: ['10.5%', '12.5%', '13%', '15%'],
    correctOption: 1,
    explanation:
      'Let CP = 100. MP = 125. SP = 125 × 90/100 = 112.5. Profit% = (112.5 - 100)/100 × 100 = 12.5%.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Profit & Loss',
    difficulty: 'Medium',
  },
  {
    id: 'q10',
    section: 'Quantitative Aptitude',
    text: 'The average of 5 consecutive even numbers is 16. What is the largest of these numbers?',
    options: ['18', '20', '22', '24'],
    correctOption: 1,
    explanation:
      'For 5 consecutive even numbers, the middle (3rd) number equals the average = 16. So numbers are 12, 14, 16, 18, 20. Largest = 20.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Average',
    difficulty: 'Easy',
  },

  // Reasoning (10 questions)
  {
    id: 'q11',
    section: 'Reasoning',
    text: 'If HEALTH is coded as GDBKSG, then NORTH is coded as:',
    options: ['MNQSG', 'MOQSH', 'MNQSH', 'MOQTG'],
    correctOption: 0,
    explanation:
      "Each letter is shifted by -1 in the alphabet. H→G, E→D, A→Z... Wait, let's verify: H(8)→G(7), E(5)→D(4), A(1)→Z... actually each letter is reduced by 1 in position. N→M, O→N, R→Q, T→S, H→G = MNQSG.",
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Coding-Decoding',
    difficulty: 'Medium',
  },
  {
    id: 'q12',
    section: 'Reasoning',
    text: 'Which number comes next in the series: 2, 6, 12, 20, 30, ?',
    options: ['36', '40', '42', '44'],
    correctOption: 2,
    explanation:
      'The differences are 4, 6, 8, 10, 12... (increasing by 2). So next number = 30 + 12 = 42. Alternatively, formula: n(n+1) → 6(7) = 42.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Number Series',
    difficulty: 'Easy',
  },
  {
    id: 'q13',
    section: 'Reasoning',
    text: 'A is the mother of B. B is the sister of C. D is the son of C. What is the relationship of A to D?',
    options: ['Mother', 'Aunt', 'Grandmother', 'Sister'],
    correctOption: 2,
    explanation:
      'A is mother of B, B is sister of C (so A is also mother of C), D is son of C. Therefore A is grandmother of D.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Blood Relations',
    difficulty: 'Easy',
  },
  {
    id: 'q14',
    section: 'Reasoning',
    text: 'In a row of students, Ravi is 8th from the left and 12th from the right. How many students are there in the row?',
    options: ['18', '19', '20', '21'],
    correctOption: 1,
    explanation:
      'Total students = Position from left + Position from right - 1 = 8 + 12 - 1 = 19.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Ranking',
    difficulty: 'Easy',
  },
  {
    id: 'q15',
    section: 'Reasoning',
    text: 'Which figure completes the pattern? If O is to ○ as △ is to:',
    options: ['▲', '▽', '◇', '□'],
    correctOption: 0,
    explanation:
      'O (filled) corresponds to ○ (outline). Similarly △ (outline) corresponds to ▲ (filled).',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Analogy',
    difficulty: 'Easy',
  },

  // English (10 questions)
  {
    id: 'q16',
    section: 'English',
    text: 'Choose the correctly spelt word:',
    options: ['Accomodation', 'Accommodation', 'Accommadation', 'Accomodatian'],
    correctOption: 1,
    explanation:
      "\"Accommodation\" is the correctly spelt word. It has double 'c' and double 'm'.",
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Spelling',
    difficulty: 'Easy',
  },
  {
    id: 'q17',
    section: 'English',
    text: 'Select the synonym of the word "ELOQUENT":',
    options: ['Silent', 'Articulate', 'Dull', 'Confused'],
    correctOption: 1,
    explanation:
      '"Eloquent" means fluent or persuasive in speaking or writing. "Articulate" is its synonym as it means expressing oneself clearly and effectively.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Vocabulary',
    difficulty: 'Medium',
  },
  {
    id: 'q18',
    section: 'English',
    text: 'Choose the word opposite in meaning to "BENEVOLENT":',
    options: ['Kind', 'Generous', 'Malevolent', 'Charitable'],
    correctOption: 2,
    explanation:
      '"Benevolent" means well-meaning and kindly. Its antonym is "Malevolent" which means having or showing a wish to do evil to others.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Vocabulary',
    difficulty: 'Medium',
  },
  {
    id: 'q19',
    section: 'English',
    text: 'Fill in the blank: "She ______ to the market before the rain started."',
    options: ['go', 'goes', 'had gone', 'has gone'],
    correctOption: 2,
    explanation:
      'Since the action (going to market) happened before another past action (rain started), we use Past Perfect Tense: "had gone".',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Grammar',
    difficulty: 'Medium',
  },
  {
    id: 'q20',
    section: 'English',
    text: 'Identify the correct indirect speech: He said, "I am working hard."',
    options: [
      'He said that he is working hard.',
      'He said that he was working hard.',
      'He told that he was working hard.',
      'He said that he worked hard.',
    ],
    correctOption: 1,
    explanation:
      'In indirect speech, "am working" (present continuous) changes to "was working" (past continuous). The reporting verb changes the tense back.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'Grammar',
    difficulty: 'Medium',
  },
]

export const testSections = [
  { name: 'General Awareness', questionIds: ['q1', 'q2', 'q3', 'q4', 'q5'] },
  {
    name: 'Quantitative Aptitude',
    questionIds: ['q6', 'q7', 'q8', 'q9', 'q10'],
  },
  { name: 'Reasoning', questionIds: ['q11', 'q12', 'q13', 'q14', 'q15'] },
  { name: 'English', questionIds: ['q16', 'q17', 'q18', 'q19', 'q20'] },
]
