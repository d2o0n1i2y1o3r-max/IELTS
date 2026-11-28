const fs = require('fs');
const path = require('path');

const lessonsPath = path.join(__dirname, '..', 'data', 'learn', 'lessons.json');
const data = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));

// Writing exercises for each level
const writingExercises = {
  beginner: [
    {
      question: "O'zingiz haqingizda 2-3 ta gap yozing. (Ismingiz, yoshingiz, qaerda yashaysiz)",
      writingPrompt: "Present Simple va 'to be' fe'lidan foydalaning. Masalan: My name is... I am... I live in...",
      correctAnswer: "My name is [name]. I am [age] years old. I live in [city].",
      explanation: "O'zingiz haqingizda yozishda 'I am', 'My name is', 'I live in' iboralarini ishlating.",
      keyPhrases: ["my name", "i am", "i live"],
      minWords: 8
    },
    {
      question: "Oilangiz haqida 2-3 gap yozing.",
      writingPrompt: "Oila a'zolaringizni tasvirlang: I have... My mother/father is... She/He works as...",
      correctAnswer: "I have a big family. My father is a teacher. My mother is a doctor.",
      explanation: "'I have', 'My father/mother is' konstruksiyalaridan foydalaning.",
      keyPhrases: ["i have", "my", "is"],
      minWords: 8
    },
    {
      question: "Kundalik tartibingizni yozing (ertalab nima qilasiz).",
      writingPrompt: "Present Simple tense ishlating: I wake up at... I eat... I go to...",
      correctAnswer: "I wake up at 7 o'clock. I eat breakfast. Then I go to school.",
      explanation: "Kundalik ishlarni Present Simple bilan yozing.",
      keyPhrases: ["i wake", "i go", "i eat"],
      minWords: 8
    },
    {
      question: "Eng yaxshi ko'rgan taomnigiz haqida yozing.",
      writingPrompt: "My favorite food is... I like it because... I eat it...",
      correctAnswer: "My favorite food is plov. I like it because it is delicious. I eat it every day.",
      explanation: "'My favorite... is...' va 'I like it because...' strukturalarini ishlating.",
      keyPhrases: ["my favorite", "i like", "because"],
      minWords: 8
    },
    {
      question: "Maktabingiz yoki ishingiz haqida qisqacha yozing.",
      writingPrompt: "I study/work at... I like... My favorite subject is...",
      correctAnswer: "I study at school number 5. I like English. My favorite subject is math.",
      explanation: "'I study at', 'My favorite subject is' iboralarini ishlating.",
      keyPhrases: ["i study", "i like", "my favorite"],
      minWords: 8
    },
    {
      question: "Hafta oxiri (weekend) nima qilishni yoqtirasiz?",
      writingPrompt: "On weekends, I usually... I like to... Sometimes I...",
      correctAnswer: "On weekends, I usually stay at home. I like to watch TV. Sometimes I play football.",
      explanation: "'On weekends', 'I usually', 'I like to' iboralarini ishlating.",
      keyPhrases: ["weekend", "i usually", "i like"],
      minWords: 8
    },
    {
      question: "Eng yaqin do'stingiz haqida yozing.",
      writingPrompt: "My best friend is... He/She is... We like to...",
      correctAnswer: "My best friend is Ali. He is very kind. We like to play together.",
      explanation: "'My best friend is', 'He/She is' va 'We like to' ishlating.",
      keyPhrases: ["my best friend", "is", "we"],
      minWords: 8
    },
    {
      question: "Yashash joyingizni (uyingizni) tasvirlang.",
      writingPrompt: "I live in... It is... There is/are... I like my...",
      correctAnswer: "I live in a small house. It is near the school. There are three rooms. I like my room.",
      explanation: "'I live in', 'There is/are', 'I like my' strukturalarini ishlating.",
      keyPhrases: ["i live", "there", "my"],
      minWords: 8
    },
  ],
  elementary: [
    {
      question: "Sevimli mashg'ulotingiz (hobby) haqida 3-4 gap yozing.",
      writingPrompt: "In my free time, I enjoy... I started... because... It makes me feel...",
      correctAnswer: "In my free time, I enjoy reading books. I started reading when I was 10 because my teacher recommended it. It makes me feel relaxed and happy.",
      explanation: "Past Simple va Present Simple'ni birga ishlating. 'I enjoy', 'I started', 'It makes me feel' iboralarini qo'llang.",
      keyPhrases: ["in my free time", "i enjoy", "because", "feel"],
      minWords: 15
    },
    {
      question: "O'tgan hafta oxirida nima qilganingizni yozing.",
      writingPrompt: "Past Simple tense ishlating: Last weekend, I... First, I... Then I... Finally...",
      correctAnswer: "Last weekend, I visited my grandparents. First, I helped them in the garden. Then I ate delicious food. Finally, I played with my cousins.",
      explanation: "Past Simple (visited, helped, ate, played) va sequence words (first, then, finally) ishlating.",
      keyPhrases: ["last weekend", "first", "then", "finally"],
      minWords: 15
    },
    {
      question: "Shahringiz yoki qishlog'ingizni tasvirlang.",
      writingPrompt: "I live in... It is located... There are many... The best thing about my city is...",
      correctAnswer: "I live in Tashkent. It is located in the center of Uzbekistan. There are many beautiful parks and buildings. The best thing about my city is the friendly people.",
      explanation: "Joy tasvirlashda 'It is located', 'There are many', 'The best thing about' ishlating.",
      keyPhrases: ["i live in", "there are", "the best thing"],
      minWords: 15
    },
    {
      question: "Kelgusi yozda nima qilishni rejalashtiryapsiz?",
      writingPrompt: "Future plans: I am going to... I want to... I hope to... I plan to...",
      correctAnswer: "Next summer, I am going to travel to the mountains. I want to learn swimming. I hope to visit my friends in Samarkand. I plan to read many books.",
      explanation: "'I am going to', 'I want to', 'I hope to', 'I plan to' kelajak reja iboralarini ishlating.",
      keyPhrases: ["i am going to", "i want to", "i hope", "i plan"],
      minWords: 15
    },
    {
      question: "Eng yoqtirgan filmingiz haqida yozing.",
      writingPrompt: "My favorite movie is... It is about... I like it because... The main character...",
      correctAnswer: "My favorite movie is The Lion King. It is about a young lion who becomes king. I like it because it teaches important lessons about family. The main character Simba is very brave.",
      explanation: "'It is about', 'I like it because', 'The main character' iboralarini ishlating.",
      keyPhrases: ["my favorite movie", "it is about", "i like it because"],
      minWords: 15
    },
    {
      question: "Sog'lom turmush tarzi haqida fikringizni yozing.",
      writingPrompt: "I think healthy lifestyle is important because... We should... For example, we can...",
      correctAnswer: "I think a healthy lifestyle is important because it helps us feel good. We should eat fruits and vegetables every day. For example, we can walk or exercise in the morning.",
      explanation: "'I think', 'We should', 'For example' akademik iboralarini ishlating.",
      keyPhrases: ["i think", "important", "we should", "for example"],
      minWords: 15
    },
    {
      question: "O'qituvchingiz yoki boshqa muhim shaxs haqida yozing.",
      writingPrompt: "Describe someone important: He/She is... I admire him/her because... He/She always...",
      correctAnswer: "My English teacher is Mrs. Johnson. She is very kind and patient. I admire her because she always explains things clearly. She always encourages us to work hard.",
      explanation: "'I admire because', 'He/She always' birikmalarini ishlating.",
      keyPhrases: ["is", "i admire", "because", "always"],
      minWords: 15
    },
    {
      question: "Kompyuter va telefon foydalanish haqida fikringizni yozing.",
      writingPrompt: "I use my phone/computer for... It is useful because... However, too much screen time can...",
      correctAnswer: "I use my phone for studying English and chatting with friends. It is useful because I can learn new words every day. However, too much screen time can be bad for our eyes.",
      explanation: "'I use... for', 'It is useful because', 'However' bog'lovchi so'zlarini ishlating.",
      keyPhrases: ["i use", "useful because", "however"],
      minWords: 15
    },
  ],
  intermediate: [
    {
      question: "Texnologiyaning ta'lim sohasidagi ta'siri haqida 4-5 gap yozing.",
      writingPrompt: "Essay topshirig'i: 'Technology has significantly changed education.' Fikringizni isbotlang va misollar keltiring.",
      correctAnswer: "Technology has significantly changed education in recent years. Online learning platforms allow students to study from anywhere in the world. Moreover, interactive tools make lessons more engaging and effective. However, excessive screen time can have negative effects on students' health. In conclusion, while technology offers many benefits, it should be used wisely.",
      explanation: "Linking words ishlating: Moreover, However, In conclusion. Balanced argument yozing.",
      keyPhrases: ["technology", "education", "moreover", "however", "conclusion"],
      minWords: 25
    },
    {
      question: "Shahar hayoti va qishloq hayotini solishtiring.",
      writingPrompt: "Compare and contrast: On the one hand... On the other hand... While... In contrast...",
      correctAnswer: "City life and rural life have both advantages and disadvantages. On the one hand, cities offer better job opportunities and entertainment facilities. On the other hand, rural areas provide a peaceful environment and fresh air. While cities can be noisy and crowded, villages offer a close-knit community. In contrast to urban pollution, the countryside maintains cleaner surroundings.",
      explanation: "Comparison/contrast words: 'On the one hand/other hand', 'While', 'In contrast' ishlating.",
      keyPhrases: ["on the one hand", "on the other hand", "while", "in contrast"],
      minWords: 25
    },
    {
      question: "Atrof-muhitni muhofaza qilish bo'yicha fikringizni yozing.",
      writingPrompt: "Discuss: Why is environmental protection important? What can individuals do?",
      correctAnswer: "Environmental protection is crucial for the survival of future generations. Firstly, deforestation and pollution threaten biodiversity and clean water supplies. Secondly, climate change is causing more extreme weather events globally. Individuals can contribute by reducing plastic usage, recycling waste, and using public transportation. Furthermore, governments should implement stricter environmental policies.",
      explanation: "Sequencing words: Firstly, Secondly, Furthermore ishlating.",
      keyPhrases: ["environmental", "firstly", "secondly", "furthermore", "individuals"],
      minWords: 25
    },
    {
      question: "Globallashuv haqida essay yozing - afzalliklari va kamchiliklari.",
      writingPrompt: "Discuss both views: Some people believe globalization benefits everyone. Others argue it increases inequality. Discuss both views.",
      correctAnswer: "Globalization has brought significant changes to societies worldwide. Proponents argue that it promotes cultural exchange and economic growth through international trade. Conversely, critics contend that globalization widens the gap between rich and poor nations. Additionally, local cultures may be threatened by dominant global trends. Overall, a balanced approach is needed to maximize benefits while minimizing drawbacks.",
      explanation: "Academic words: Proponents, Conversely, Additionally, Overall ishlating.",
      keyPhrases: ["globalization", "proponents", "conversely", "additionally", "overall"],
      minWords: 25
    },
    {
      question: "Universitetda ta'lim olishning ahamiyati haqida yozing.",
      writingPrompt: "Some people think university education is essential. Others believe practical experience is more valuable. Discuss.",
      correctAnswer: "University education remains a cornerstone of professional development in many fields. It provides students with theoretical knowledge and critical thinking skills that are essential for academic careers. Nevertheless, practical experience through internships and apprenticeships offers invaluable hands-on learning. Consequently, an ideal approach combines both academic study and practical training. In my opinion, the best outcome is achieved through a balanced integration of both.",
      explanation: "Advanced linking: Nevertheless, Consequently, In my opinion ishlating.",
      keyPhrases: ["university", "nevertheless", "consequently", "in my opinion", "practical"],
      minWords: 25
    },
    {
      question: "Ijtimoiy tarmoqlarning yoshlarga ta'siri haqida yozing.",
      writingPrompt: "Social media has both positive and negative effects on young people. Discuss and give your opinion.",
      correctAnswer: "Social media platforms have become an integral part of young people's daily lives. On the positive side, they facilitate communication, enable access to educational resources, and help build communities around shared interests. However, excessive use of social media can lead to cyberbullying, decreased attention spans, and unrealistic body image expectations. It is therefore essential that parents and educators teach responsible digital citizenship.",
      explanation: "'On the positive side', 'However', 'It is therefore essential' akademik iboralarini ishlating.",
      keyPhrases: ["social media", "positive", "however", "essential", "young people"],
      minWords: 25
    },
    {
      question: "Sport va sog'liq o'rtasidagi bog'liqlikni tushuntiring.",
      writingPrompt: "Regular physical activity is important for maintaining good health. To what extent do you agree?",
      correctAnswer: "Regular physical activity plays a vital role in maintaining both physical and mental health. Research has consistently demonstrated that exercise reduces the risk of chronic diseases such as heart disease and diabetes. Furthermore, physical activity releases endorphins, which improve mood and reduce stress levels. Although some argue that rest is equally important, a balanced combination of exercise and recovery yields the best health outcomes.",
      explanation: "Research reference: 'Research has demonstrated', Concession: 'Although some argue' ishlating.",
      keyPhrases: ["physical activity", "health", "research", "furthermore", "although"],
      minWords: 25
    },
    {
      question: "Masofaviy ta'lim (online learning) haqida fikringizni yozing.",
      writingPrompt: "Online learning has become increasingly popular. Discuss the advantages and disadvantages.",
      correctAnswer: "Online learning has experienced unprecedented growth, particularly following the global pandemic. Its primary advantages include flexibility, accessibility, and cost-effectiveness compared to traditional education. Students can learn at their own pace and access materials from prestigious institutions worldwide. Nevertheless, the lack of face-to-face interaction and potential distractions at home pose significant challenges. In conclusion, online learning is most effective when combined with some form of in-person instruction.",
      explanation: "Comparative structures va 'In conclusion' ishlating.",
      keyPhrases: ["online learning", "advantages", "nevertheless", "in conclusion", "effective"],
      minWords: 25
    },
  ],
  upper: [
    {
      question: "Sun'iy intellektning kelajak ish bozoriga ta'sirini muhokama qiling.",
      writingPrompt: "Artificial intelligence is transforming the job market. Some jobs will disappear, while new ones will emerge. Discuss both sides and give your opinion.",
      correctAnswer: "The advent of artificial intelligence has sparked considerable debate regarding its impact on the labour market. While automation may render certain routine occupations obsolete, it simultaneously creates demand for specialists in emerging fields such as machine learning and data science. Moreover, AI-augmented workplaces could enhance productivity and allow employees to focus on creative, higher-order tasks. Notwithstanding these potential benefits, significant investment in workforce retraining programmes is imperative to ensure equitable access to new employment opportunities. Ultimately, societies must proactively adapt their educational frameworks to prepare citizens for an AI-driven economy.",
      explanation: "Band 7+ vocabulary: 'render obsolete', 'notwithstanding', 'imperative', 'proactively' ishlating.",
      keyPhrases: ["artificial intelligence", "while", "moreover", "notwithstanding", "ultimately"],
      minWords: 40
    },
    {
      question: "Madaniy xilma-xillik jamiyat uchun foydami yoki zararlimi?",
      writingPrompt: "Cultural diversity enriches society. To what extent do you agree or disagree?",
      correctAnswer: "Cultural diversity serves as a catalyst for innovation and social progress, enriching communities through the exchange of ideas, traditions, and perspectives. Exposure to diverse cultures fosters empathy, broadens cognitive horizons, and promotes creative problem-solving in both academic and professional settings. Nevertheless, cultural differences can occasionally give rise to misunderstandings and social tensions if not managed through inclusive policies and intercultural dialogue. It is therefore incumbent upon governments and educational institutions to promote cultural awareness whilst celebrating the unique contributions of each community. On balance, the benefits of cultural diversity significantly outweigh its challenges.",
      explanation: "Academic register: 'serves as a catalyst', 'incumbent upon', 'On balance' ishlating.",
      keyPhrases: ["cultural diversity", "catalyst", "nevertheless", "incumbent", "on balance"],
      minWords: 40
    },
    {
      question: "Iqlim o'zgarishi va uning oqibatlarini batafsil muhokama qiling.",
      writingPrompt: "Climate change is the greatest challenge facing humanity. Discuss the causes, effects, and possible solutions.",
      correctAnswer: "Climate change represents arguably the most pressing existential threat confronting contemporary civilisation. The primary drivers include the burning of fossil fuels, industrial emissions, and large-scale deforestation, all of which contribute to the accumulation of greenhouse gases in the atmosphere. The consequences are far-reaching, encompassing rising sea levels, more frequent extreme weather events, and the displacement of vulnerable populations. To mitigate these effects, a multi-pronged approach is essential, incorporating renewable energy transition, international cooperation through binding agreements, and individual behavioural change. Without decisive and coordinated global action, the ramifications for future generations will be catastrophic.",
      explanation: "Complex structures: 'arguably the most pressing', 'multi-pronged approach', 'ramifications' ishlating.",
      keyPhrases: ["climate change", "existential", "consequences", "mitigate", "without"],
      minWords: 40
    },
    {
      question: "Gender tengligini ta'minlashning yo'llarini muhokama qiling.",
      writingPrompt: "Despite progress, gender inequality persists in many parts of the world. What are the main causes and what measures should be taken?",
      correctAnswer: "Despite considerable advances in gender equality over recent decades, significant disparities persist in many regions, particularly regarding access to education, economic participation, and political representation. Deep-rooted cultural norms and institutional biases continue to perpetuate discriminatory practices against women and marginalised genders. To address these systemic inequities, comprehensive legislative reforms must be complemented by grassroots initiatives that challenge stereotypes and promote inclusive values. Furthermore, organisations should implement transparent pay equity audits and leadership development programmes specifically designed to empower underrepresented groups. Achieving genuine gender parity requires sustained commitment from all sectors of society.",
      explanation: "Nominalisation: 'participation', 'representation', 'commitment'. Passive voice academic style.",
      keyPhrases: ["gender", "despite", "furthermore", "comprehensive", "achieving"],
      minWords: 40
    },
    {
      question: "Raqamli xavfsizlik (cybersecurity) va shaxsiy ma'lumotlar himoyasi haqida yozing.",
      writingPrompt: "In the digital age, protecting personal data has become a critical concern. Discuss the challenges and propose solutions.",
      correctAnswer: "The exponential growth of digital technologies has precipitated unprecedented challenges in safeguarding personal data and ensuring cybersecurity. Data breaches, identity theft, and sophisticated phishing attacks have become increasingly prevalent, undermining public trust in digital platforms. Governments have responded by enacting comprehensive data protection legislation, such as the GDPR, which mandates stringent standards for data handling and processing. Nevertheless, individual users must also cultivate digital literacy and adopt robust security practices, including multi-factor authentication and regular password updates. A collaborative approach between technology companies, regulators, and citizens is indispensable for creating a secure digital ecosystem.",
      explanation: "Specialised vocabulary: 'precipitated', 'mandates', 'indispensable' ishlating.",
      keyPhrases: ["digital", "personal data", "nevertheless", "collaborative", "indispensable"],
      minWords: 40
    },
    {
      question: "Ta'limdagi innovatsiyalar va an'anaviy usullar o'rtasidagi muvozanatni muhokama qiling.",
      writingPrompt: "Educational innovation should not come at the expense of traditional teaching methods. Discuss.",
      correctAnswer: "The tension between educational innovation and traditional pedagogical approaches has intensified as technology reshapes learning environments worldwide. Progressive methods, including gamification, flipped classrooms, and personalised AI tutoring, offer compelling advantages in terms of student engagement and differentiated instruction. Conversely, time-tested approaches such as Socratic questioning, lecture-based learning, and structured examinations provide essential frameworks for knowledge acquisition and assessment. Rather than viewing these paradigms as mutually exclusive, educators should strive to synthesise innovative and conventional methodologies into a cohesive pedagogical framework. This integrated approach would harness the strengths of both traditions whilst addressing the diverse needs of contemporary learners.",
      explanation: "Sophisticated vocabulary: 'pedagogical', 'paradigms', 'synthesise', 'cohesive' ishlating.",
      keyPhrases: ["innovation", "traditional", "conversely", "rather than", "integrated approach"],
      minWords: 40
    },
  ],
  advanced: [
    {
      question: "Epistomologik pluralizm va bilim konstruksiyasi haqida akademik essay yozing.",
      writingPrompt: "Knowledge is not merely discovered but constructed through social and cultural processes. Critically evaluate this claim with reference to epistemological frameworks.",
      correctAnswer: "The proposition that knowledge is socially constructed rather than objectively discovered constitutes a fundamental tenet of constructivist epistemology, challenging the positivist assumption of value-free inquiry. Drawing upon the seminal works of Kuhn and Foucault, one may argue that paradigmatic frameworks and power structures inevitably shape the production and validation of knowledge claims. This perspective is particularly illuminating when examining how indigenous and marginalised knowledge systems have been systematically delegitimised within Western academic discourse. Nevertheless, a wholesale rejection of empirical methodology would undermine the very foundations of scientific progress that have yielded transformative advances in medicine, technology, and environmental stewardship. A more nuanced epistemological stance—one that embraces methodological pluralism whilst maintaining rigorous standards of evidence—offers the most intellectually honest approach to navigating this complex terrain.",
      explanation: "C2 academic prose: 'constitutes a fundamental tenet', 'epistemological stance', 'methodological pluralism'.",
      keyPhrases: ["knowledge", "epistemological", "nevertheless", "pluralism", "nuanced"],
      minWords: 50
    },
    {
      question: "Posthumanizm va texnologik singularlik tushunchasini tanqidiy baholang.",
      writingPrompt: "Some theorists predict that technological singularity will fundamentally alter what it means to be human. Critically discuss this claim.",
      correctAnswer: "The concept of technological singularity—the hypothetical point at which artificial superintelligence surpasses human cognitive capacities—has engendered profound philosophical and ethical deliberations regarding the trajectory of human civilisation. Proponents, drawing upon exponential growth models articulated by Kurzweil, posit that the convergence of nanotechnology, biotechnology, and artificial intelligence will inaugurate a posthuman era characterised by radical cognitive enhancement and biological transcendence. Conversely, sceptics caution that such prognostications oversimplify the irreducible complexity of consciousness and the emergent properties of biological neural networks. Moreover, the ethical ramifications of human augmentation—encompassing questions of identity, equity, and autonomy—demand rigorous interdisciplinary scrutiny. Ultimately, navigating the singularity hypothesis necessitates a dialectical engagement between techno-optimism and humanistic prudence, ensuring that technological advancement serves to amplify rather than diminish our collective humanity.",
      explanation: "Band 9 vocabulary: 'engendered', 'posit', 'inaugurate', 'dialectical engagement' ishlating.",
      keyPhrases: ["singularity", "proponents", "conversely", "moreover", "ultimately"],
      minWords: 50
    },
    {
      question: "Lingvistik determinizm (Sapir-Whorf gipotezasi) va uning zamonaviy ahamiyatini muhokama qiling.",
      writingPrompt: "The language we speak shapes the way we think. Critically evaluate this claim with reference to the Sapir-Whorf hypothesis.",
      correctAnswer: "The Sapir-Whorf hypothesis, positing that linguistic structures fundamentally constrain and shape cognitive processes, remains one of the most provocative and contentious propositions in contemporary linguistics and cognitive science. The strong version of linguistic determinism—asserting that language determines thought—has been largely discredited by cross-linguistic research demonstrating universal cognitive capacities. However, the weaker formulation of linguistic relativity, which suggests that language influences habitual thought patterns and perceptual categorisation, has garnered substantial empirical support through studies examining colour perception, spatial reasoning, and temporal conceptualisation across diverse linguistic communities. The implications for a globalised world are considerable: as languages become extinct at an accelerating rate, we risk losing irreplaceable windows into alternative modes of conceptualising reality. Preserving linguistic diversity, therefore, constitutes not merely a cultural imperative but an epistemic one, safeguarding the full spectrum of human cognitive potential.",
      explanation: "Expert-level discourse: 'provocative and contentious', 'garnered empirical support', 'epistemic imperative'.",
      keyPhrases: ["sapir-whorf", "linguistic", "however", "implications", "therefore"],
      minWords: 50
    },
    {
      question: "Axloqiy relativizm va universal inson huquqlari o'rtasidagi ziddiyatni tahlil qiling.",
      writingPrompt: "Can universal human rights be reconciled with moral relativism? Discuss with philosophical reasoning.",
      correctAnswer: "The philosophical tension between moral relativism and the universalist pretensions of international human rights frameworks represents one of the most intractable dilemmas in contemporary ethical discourse. Cultural relativists, drawing upon anthropological evidence of normative diversity across societies, contend that imposing a singular moral framework constitutes a form of neo-colonial hegemony that privileges Western liberal values over indigenous ethical traditions. Conversely, universalists maintain that certain inalienable rights—the prohibition of torture, the right to life, freedom from slavery—transcend cultural boundaries and derive their authority from our shared humanity rather than any particular cultural context. A potential resolution lies in what scholars term 'cross-cultural dialogue': an ongoing, reciprocal process of normative negotiation that acknowledges cultural specificity whilst identifying overlapping consensus on fundamental principles of human dignity. This approach eschews both the paralysing implications of radical relativism and the cultural imperialism inherent in unreflective universalism.",
      explanation: "Philosophical discourse: 'intractable dilemmas', 'neo-colonial hegemony', 'eschews' ishlating.",
      keyPhrases: ["moral relativism", "universal", "conversely", "resolution", "dialogue"],
      minWords: 50
    },
    {
      question: "Postmodernizm va haqiqat tushunchasining transformatsiyasini baholang.",
      writingPrompt: "In a post-truth era, is objective truth still attainable? Discuss with reference to postmodern philosophy.",
      correctAnswer: "The postmodern critique of metanarratives, as articulated by Lyotard and Derrida, has fundamentally destabilised conventional understandings of objective truth and epistemological certainty. By deconstructing the binary oppositions upon which Western metaphysics has been predicated—truth/falsehood, presence/absence, speech/writing—poststructuralist thinkers have revealed the inherently contingent and discursively constructed nature of knowledge claims. This intellectual movement has acquired renewed urgency in the contemporary 'post-truth' era, characterised by the proliferation of misinformation, algorithmic echo chambers, and the strategic weaponisation of epistemic uncertainty by political actors. Nevertheless, dismissing the possibility of truth altogether leads to a corrosive nihilism that undermines the very possibility of meaningful discourse and democratic deliberation. A more sophisticated position recognises that whilst absolute, perspective-independent truth may be philosophically untenable, provisional truths grounded in rigorous evidence and intersubjective verification remain indispensable for the functioning of just and rational societies.",
      explanation: "Band 9 mastery: 'metanarratives', 'discursively constructed', 'untenable', 'intersubjective verification'.",
      keyPhrases: ["postmodern", "truth", "nevertheless", "whilst", "indispensable"],
      minWords: 50
    },
    {
      question: "Bioetika va genetik muhandislik (CRISPR) ning ijtimoiy ta'sirini batafsil muhokama qiling.",
      writingPrompt: "Gene editing technology (CRISPR) raises profound ethical questions. Discuss the potential benefits, risks, and ethical considerations.",
      correctAnswer: "The revolutionary CRISPR-Cas9 gene editing technology has precipitated a paradigmatic shift in biomedical research, simultaneously offering unprecedented therapeutic possibilities and raising profound bioethical concerns that demand careful philosophical scrutiny. The technology's potential to eradicate hereditary diseases, develop targeted cancer therapies, and enhance agricultural resilience represents a transformative advance with far-reaching humanitarian implications. However, the spectre of germline editing—heritable genetic modifications that would propagate through subsequent generations—raises deeply troubling questions regarding informed consent, genetic determinism, and the commodification of human biological potential. Furthermore, the prospect of 'designer babies' selected for enhanced cognitive or physical attributes threatens to exacerbate existing socioeconomic inequalities, creating a genetically stratified society that fundamentally violates principles of distributive justice. Navigating these ethical complexities demands robust governance frameworks that balance scientific innovation with precautionary principles, ensuring that gene editing technologies serve the common good rather than the interests of a privileged few.",
      explanation: "Interdisciplinary: 'paradigmatic shift', 'germline editing', 'distributive justice', 'precautionary principles'.",
      keyPhrases: ["crispr", "ethical", "however", "furthermore", "navigating"],
      minWords: 50
    },
  ]
};

// Add writing exercises to existing lessons
const levels = ['beginner', 'elementary', 'intermediate', 'upper', 'advanced'];
const levelPrefixes = { beginner: 'beg', elementary: 'elem', intermediate: 'inter', upper: 'upper', advanced: 'adv' };

let addedCount = 0;

levels.forEach((level) => {
  const prefix = levelPrefixes[level];
  const exercises = writingExercises[level];
  if (!exercises) return;

  // Find lessons for this level
  const levelLessons = data.lessons.filter(l => l.level === level);
  
  // Distribute writing exercises across lessons
  exercises.forEach((ex, idx) => {
    // Pick a lesson to add to (cycle through available lessons)
    const targetLesson = levelLessons[idx % levelLessons.length];
    if (!targetLesson) return;

    const exerciseObj = {
      id: `ex-writing-${prefix}-${idx + 1}`,
      type: 'writing',
      question: ex.question,
      writingPrompt: ex.writingPrompt,
      correctAnswer: ex.correctAnswer,
      explanation: ex.explanation,
      keyPhrases: ex.keyPhrases,
      minWords: ex.minWords
    };

    targetLesson.exercises.push(exerciseObj);
    addedCount++;
  });
});

fs.writeFileSync(lessonsPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully added ${addedCount} writing exercises across all levels!`);
console.log('Levels processed:', levels.join(', '));
