const fs = require('fs');
const path = require('path');

const lessonsPath = path.join(__dirname, '..', 'data', 'learn', 'lessons.json');
const data = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));

const readingExercises = {
  beginner: [
    {
      readingPassage: "My name is Sara. I am 12 years old. I live in Tashkent with my family. I have one brother and one sister. My brother is 15 years old. My sister is 8 years old. We go to school every day. I like English and Math.",
      question: "How old is Sara?",
      options: ["8 years old", "12 years old", "15 years old", "10 years old"],
      correctAnswer: "12 years old",
      explanation: "Matnda 'I am 12 years old' deyilgan."
    },
    {
      readingPassage: "My name is Sara. I am 12 years old. I live in Tashkent with my family. I have one brother and one sister. My brother is 15 years old. My sister is 8 years old. We go to school every day. I like English and Math.",
      question: "How many brothers does Sara have?",
      options: ["Two", "One", "Three", "None"],
      correctAnswer: "One",
      explanation: "'I have one brother' — Saraning bitta akasi bor."
    },
    {
      readingPassage: "Tom is a student. He wakes up at 7 o'clock every morning. He eats breakfast at home. Then he walks to school. School starts at 8:30. Tom likes science class the most. After school, he plays football with his friends.",
      question: "What time does Tom wake up?",
      options: ["6 o'clock", "7 o'clock", "8 o'clock", "8:30"],
      correctAnswer: "7 o'clock",
      explanation: "'He wakes up at 7 o'clock every morning' — Tom har kuni ertalab 7 da turadi."
    },
    {
      readingPassage: "Tom is a student. He wakes up at 7 o'clock every morning. He eats breakfast at home. Then he walks to school. School starts at 8:30. Tom likes science class the most. After school, he plays football with his friends.",
      question: "What is Tom's favorite subject?",
      options: ["Math", "English", "Science", "History"],
      correctAnswer: "Science",
      explanation: "'Tom likes science class the most' — Tom eng ko'p science (fan) darsini yoqtiradi."
    },
    {
      readingPassage: "This is my room. It is small but nice. There is a bed near the window. There is a desk with a lamp on it. I have a bookshelf with many books. My favorite color is blue, so my room is blue. I like my room very much.",
      question: "What color is the room?",
      options: ["Red", "Green", "Blue", "Yellow"],
      correctAnswer: "Blue",
      explanation: "'My favorite color is blue, so my room is blue' — Xona ko'k rangda."
    },
    {
      readingPassage: "This is my room. It is small but nice. There is a bed near the window. There is a desk with a lamp on it. I have a bookshelf with many books. My favorite color is blue, so my room is blue. I like my room very much.",
      question: "Where is the bed?",
      options: ["Near the door", "Near the window", "Near the desk", "In the center"],
      correctAnswer: "Near the window",
      explanation: "'There is a bed near the window' — Karavot deraza yonida."
    },
    {
      readingPassage: "Anna has a cat. The cat's name is Mimi. Mimi is white and small. She likes to drink milk and play with a ball. Anna takes care of Mimi every day. She gives Mimi food and water. Mimi sleeps on Anna's bed at night.",
      question: "What does Mimi like to drink?",
      options: ["Water", "Juice", "Milk", "Tea"],
      correctAnswer: "Milk",
      explanation: "'She likes to drink milk' — Mimi sut ichishni yoqtiradi."
    },
    {
      readingPassage: "Anna has a cat. The cat's name is Mimi. Mimi is white and small. She likes to drink milk and play with a ball. Anna takes care of Mimi every day. She gives Mimi food and water. Mimi sleeps on Anna's bed at night.",
      question: "Where does Mimi sleep?",
      options: ["On the floor", "On Anna's bed", "On the sofa", "In a box"],
      correctAnswer: "On Anna's bed",
      explanation: "'Mimi sleeps on Anna's bed at night' — Mimi kechasi Anna karavotida uxlaydi."
    },
  ],
  elementary: [
    {
      readingPassage: "Last summer, my family went to the seaside for a holiday. We stayed in a small hotel near the beach. Every morning, we swam in the sea and played volleyball on the sand. In the afternoon, we visited the local market and bought fresh fruit. My favorite part was watching the sunset over the ocean. We stayed for one week and had a wonderful time.",
      question: "Where did the family stay?",
      options: ["In a big house", "In a small hotel", "With relatives", "In a tent"],
      correctAnswer: "In a small hotel",
      explanation: "'We stayed in a small hotel near the beach' — Oila plyaj yaqinidagi kichik mehmonxonada qolgan."
    },
    {
      readingPassage: "Last summer, my family went to the seaside for a holiday. We stayed in a small hotel near the beach. Every morning, we swam in the sea and played volleyball on the sand. In the afternoon, we visited the local market and bought fresh fruit. My favorite part was watching the sunset over the ocean. We stayed for one week and had a wonderful time.",
      question: "How long did they stay at the seaside?",
      options: ["Three days", "Five days", "One week", "Two weeks"],
      correctAnswer: "One week",
      explanation: "'We stayed for one week' — Ular bir hafta bo'lishgan."
    },
    {
      readingPassage: "Maria is learning to cook. Last weekend, she made pasta for the first time. She followed a recipe from the internet. First, she boiled the water. Then, she added the pasta and cooked it for 10 minutes. After that, she made a tomato sauce with onions and garlic. Her family said the pasta was delicious. Maria was very happy and proud.",
      question: "How long did Maria cook the pasta?",
      options: ["5 minutes", "8 minutes", "10 minutes", "15 minutes"],
      correctAnswer: "10 minutes",
      explanation: "'She cooked it for 10 minutes' — Maria pastani 10 daqiqa pishirdi."
    },
    {
      readingPassage: "Maria is learning to cook. Last weekend, she made pasta for the first time. She followed a recipe from the internet. First, she boiled the water. Then, she added the pasta and cooked it for 10 minutes. After that, she made a tomato sauce with onions and garlic. Her family said the pasta was delicious. Maria was very happy and proud.",
      question: "What did Maria's family think about the pasta?",
      options: ["It was terrible", "It was okay", "It was delicious", "It was too salty"],
      correctAnswer: "It was delicious",
      explanation: "'Her family said the pasta was delicious' — Oilasi pasta mazali bo'ldi degan."
    },
    {
      readingPassage: "The Great Wall of China is one of the most famous landmarks in the world. It was built over 2,000 years ago to protect China from invaders. The wall is about 21,000 kilometers long. Today, millions of tourists visit the Great Wall every year. It is so large that some people say you can see it from space, but this is actually not true.",
      question: "Why was the Great Wall built?",
      options: ["For decoration", "To protect China from invaders", "For tourism", "For farming"],
      correctAnswer: "To protect China from invaders",
      explanation: "'It was built to protect China from invaders' — Devor Xitoyni bosqinchilardan himoya qilish uchun qurilgan."
    },
    {
      readingPassage: "The Great Wall of China is one of the most famous landmarks in the world. It was built over 2,000 years ago to protect China from invaders. The wall is about 21,000 kilometers long. Today, millions of tourists visit the Great Wall every year. It is so large that some people say you can see it from space, but this is actually not true.",
      question: "Can you see the Great Wall from space?",
      options: ["Yes, definitely", "No, it is not true", "Only sometimes", "Only at night"],
      correctAnswer: "No, it is not true",
      explanation: "'This is actually not true' — Bu aslida haqiqat emas."
    },
    {
      readingPassage: "David wants to become a doctor when he grows up. He studies biology and chemistry at school. He also volunteers at a local hospital on weekends. David helps the nurses by bringing medicine to patients. He enjoys talking to elderly patients because they tell interesting stories. David believes that helping others is the most important thing in life.",
      question: "What does David do at the hospital?",
      options: ["He operates on patients", "He brings medicine to patients", "He cleans the rooms", "He cooks food"],
      correctAnswer: "He brings medicine to patients",
      explanation: "'David helps the nurses by bringing medicine to patients' — David hamshiralarga dori yetkazib beradi."
    },
    {
      readingPassage: "David wants to become a doctor when he grows up. He studies biology and chemistry at school. He also volunteers at a local hospital on weekends. David helps the nurses by bringing medicine to patients. He enjoys talking to elderly patients because they tell interesting stories. David believes that helping others is the most important thing in life.",
      question: "Why does David enjoy talking to elderly patients?",
      options: ["They give him money", "They tell interesting stories", "They help him study", "They are his relatives"],
      correctAnswer: "They tell interesting stories",
      explanation: "'They tell interesting stories' — Keksa bemorlar qiziqarli hikoyalar aytishadi."
    },
  ],
  intermediate: [
    {
      readingPassage: "The impact of social media on mental health has become a subject of intense academic scrutiny in recent years. Research conducted by the University of Pennsylvania found that limiting social media use to 30 minutes per day led to significant reductions in loneliness and depression among participants. However, other studies suggest that the relationship is more nuanced — passive scrolling tends to decrease well-being, whereas active engagement, such as messaging friends, can actually enhance feelings of social connectedness.",
      question: "According to the University of Pennsylvania study, what happened when social media use was limited?",
      options: ["Depression increased", "No change was observed", "Loneliness and depression decreased", "Anxiety increased"],
      correctAnswer: "Loneliness and depression decreased",
      explanation: "'Limiting social media use led to significant reductions in loneliness and depression' — Ijtimoiy tarmoq ishlatishni cheklash yolg'izlik va depressiyani kamaytirgan."
    },
    {
      readingPassage: "The impact of social media on mental health has become a subject of intense academic scrutiny in recent years. Research conducted by the University of Pennsylvania found that limiting social media use to 30 minutes per day led to significant reductions in loneliness and depression among participants. However, other studies suggest that the relationship is more nuanced — passive scrolling tends to decrease well-being, whereas active engagement, such as messaging friends, can actually enhance feelings of social connectedness.",
      question: "What type of social media use can enhance social connectedness?",
      options: ["Passive scrolling", "Watching videos", "Active engagement like messaging", "Reading news articles"],
      correctAnswer: "Active engagement like messaging",
      explanation: "'Active engagement, such as messaging friends, can enhance feelings of social connectedness' — Faol ishtirok, masalan do'stlarga xabar yozish, ijtimoiy bog'liqlik hissini kuchaytiradi."
    },
    {
      readingPassage: "Climate change is fundamentally altering migration patterns across the globe. As rising sea levels threaten coastal communities, millions of people face the prospect of displacement. The World Bank estimates that by 2050, up to 216 million people could be forced to move within their own countries due to climate-related factors. These 'climate migrants' often face legal challenges, as current international frameworks do not recognise them as refugees. Experts argue that new legal categories and support systems must be developed to address this growing humanitarian crisis.",
      question: "How many people could become climate migrants by 2050 according to the World Bank?",
      options: ["50 million", "100 million", "216 million", "500 million"],
      correctAnswer: "216 million",
      explanation: "'Up to 216 million people could be forced to move' — 216 million kishigacha ko'chishga majbur bo'lishi mumkin."
    },
    {
      readingPassage: "Climate change is fundamentally altering migration patterns across the globe. As rising sea levels threaten coastal communities, millions of people face the prospect of displacement. The World Bank estimates that by 2050, up to 216 million people could be forced to move within their own countries due to climate-related factors. These 'climate migrants' often face legal challenges, as current international frameworks do not recognise them as refugees. Experts argue that new legal categories and support systems must be developed to address this growing humanitarian crisis.",
      question: "Why do climate migrants face legal challenges?",
      options: ["They lack documents", "International law doesn't recognise them as refugees", "They cross borders illegally", "Countries refuse to help them"],
      correctAnswer: "International law doesn't recognise them as refugees",
      explanation: "'Current international frameworks do not recognise them as refugees' — Hozirgi xalqaro qonunlar ularni qochoq sifatida tan olmaydi."
    },
    {
      readingPassage: "The concept of a circular economy has gained significant traction as an alternative to the traditional linear 'take, make, dispose' model of production. In a circular economy, products are designed for longevity, repair, and recycling, minimising waste and maximising resource efficiency. Companies like Patagonia have pioneered this approach by offering repair services and using recycled materials. Critics, however, point out that transitioning to a circular model requires substantial initial investment and may not be feasible for all industries in the short term.",
      question: "What is the main difference between a circular economy and a linear economy?",
      options: ["Circular economy uses more resources", "Products are designed for longevity and recycling", "Linear economy is more sustainable", "Circular economy produces more waste"],
      correctAnswer: "Products are designed for longevity and recycling",
      explanation: "'Products are designed for longevity, repair, and recycling' — Mahsulotlar uzoq muddat foydalanish va qayta ishlash uchun yaratiladi."
    },
    {
      readingPassage: "The concept of a circular economy has gained significant traction as an alternative to the traditional linear 'take, make, dispose' model of production. In a circular economy, products are designed for longevity, repair, and recycling, minimising waste and maximising resource efficiency. Companies like Patagonia have pioneered this approach by offering repair services and using recycled materials. Critics, however, point out that transitioning to a circular model requires substantial initial investment and may not be feasible for all industries in the short term.",
      question: "What criticism is made of the circular economy model?",
      options: ["It creates more pollution", "It requires substantial initial investment", "It eliminates all jobs", "It only works for food industry"],
      correctAnswer: "It requires substantial initial investment",
      explanation: "'Transitioning requires substantial initial investment' — O'tish uchun katta boshlang'ich sarmoya kerak."
    },
    {
      readingPassage: "Sleep deprivation has emerged as a significant public health concern in modern societies. Research published in the journal Nature demonstrates that chronic sleep loss impairs cognitive function, weakens the immune system, and increases the risk of cardiovascular disease. Despite these well-documented consequences, approximately one-third of adults in developed countries regularly fail to achieve the recommended seven to nine hours of sleep per night. Experts attribute this trend to increased screen time, work-related stress, and irregular schedules.",
      question: "What percentage of adults in developed countries don't get enough sleep?",
      options: ["One-quarter", "One-third", "One-half", "Two-thirds"],
      correctAnswer: "One-third",
      explanation: "'Approximately one-third of adults' — Taxminan uchdan bir qismi kattalar yetarli uxlamaydi."
    },
    {
      readingPassage: "Sleep deprivation has emerged as a significant public health concern in modern societies. Research published in the journal Nature demonstrates that chronic sleep loss impairs cognitive function, weakens the immune system, and increases the risk of cardiovascular disease. Despite these well-documented consequences, approximately one-third of adults in developed countries regularly fail to achieve the recommended seven to nine hours of sleep per night. Experts attribute this trend to increased screen time, work-related stress, and irregular schedules.",
      question: "Which of the following is NOT mentioned as a cause of sleep deprivation?",
      options: ["Increased screen time", "Work-related stress", "Poor diet", "Irregular schedules"],
      correctAnswer: "Poor diet",
      explanation: "Matnda 'poor diet' (noto'g'ri ovqatlanish) sabab sifatida tilga olinmagan."
    },
  ],
  upper: [
    {
      readingPassage: "The proliferation of algorithmic decision-making in judicial systems has ignited a contentious debate regarding fairness, transparency, and accountability. Proponents contend that AI-powered risk assessment tools can reduce human bias in sentencing decisions by providing objective, data-driven recommendations. However, a landmark study by ProPublica revealed that the widely used COMPAS algorithm exhibited significant racial bias, incorrectly flagging Black defendants as high-risk at nearly twice the rate of white defendants. This finding underscores a fundamental paradox: algorithms trained on historically biased data inevitably perpetuate and potentially amplify existing societal inequities.",
      question: "What did the ProPublica study reveal about the COMPAS algorithm?",
      options: ["It was perfectly fair", "It showed significant racial bias", "It reduced crime rates", "It was too expensive"],
      correctAnswer: "It showed significant racial bias",
      explanation: "'COMPAS algorithm exhibited significant racial bias' — COMPAS algoritmi sezilarli irqiy tarafkashlik ko'rsatgan."
    },
    {
      readingPassage: "The proliferation of algorithmic decision-making in judicial systems has ignited a contentious debate regarding fairness, transparency, and accountability. Proponents contend that AI-powered risk assessment tools can reduce human bias in sentencing decisions by providing objective, data-driven recommendations. However, a landmark study by ProPublica revealed that the widely used COMPAS algorithm exhibited significant racial bias, incorrectly flagging Black defendants as high-risk at nearly twice the rate of white defendants. This finding underscores a fundamental paradox: algorithms trained on historically biased data inevitably perpetuate and potentially amplify existing societal inequities.",
      question: "What is the fundamental paradox described in the passage?",
      options: ["AI is too slow for courts", "Algorithms trained on biased data perpetuate inequities", "Judges prefer AI over human judgment", "Technology is too expensive for courts"],
      correctAnswer: "Algorithms trained on biased data perpetuate inequities",
      explanation: "'Algorithms trained on historically biased data inevitably perpetuate existing societal inequities' — Tarixiy tarafkash ma'lumotlarda o'qitilgan algoritmlar mavjud tengsizliklarni davom ettiradi."
    },
    {
      readingPassage: "Neuroplasticity — the brain's remarkable capacity to reorganise itself by forming new neural connections — has revolutionised our understanding of cognitive development and rehabilitation. Contrary to the previously held belief that the adult brain is essentially fixed, contemporary neuroscience has demonstrated that targeted cognitive exercises, mindfulness meditation, and even musical training can induce measurable structural changes in the prefrontal cortex and hippocampus. These findings have profound implications for the treatment of neurological conditions such as stroke, traumatic brain injury, and age-related cognitive decline, offering hope that the brain can, to a significant extent, heal and adapt throughout the lifespan.",
      question: "What previous belief about the adult brain has been overturned?",
      options: ["That it grows continuously", "That it is essentially fixed", "That it needs constant stimulation", "That it cannot process music"],
      correctAnswer: "That it is essentially fixed",
      explanation: "'Contrary to the previously held belief that the adult brain is essentially fixed' — Katta yoshdagilar miyasi o'zgarmas degan eski e'tiqod rad etildi."
    },
    {
      readingPassage: "Neuroplasticity — the brain's remarkable capacity to reorganise itself by forming new neural connections — has revolutionised our understanding of cognitive development and rehabilitation. Contrary to the previously held belief that the adult brain is essentially fixed, contemporary neuroscience has demonstrated that targeted cognitive exercises, mindfulness meditation, and even musical training can induce measurable structural changes in the prefrontal cortex and hippocampus. These findings have profound implications for the treatment of neurological conditions such as stroke, traumatic brain injury, and age-related cognitive decline, offering hope that the brain can, to a significant extent, heal and adapt throughout the lifespan.",
      question: "Which activities are mentioned as capable of changing brain structure?",
      options: ["Running and swimming", "Cognitive exercises, meditation, and music", "Reading and writing only", "Social interaction only"],
      correctAnswer: "Cognitive exercises, meditation, and music",
      explanation: "'Targeted cognitive exercises, mindfulness meditation, and musical training' — Maqsadli kognitiv mashqlar, meditatsiya va musiqa o'rganish miyani o'zgartira oladi."
    },
    {
      readingPassage: "The concept of degrowth challenges the prevailing economic orthodoxy that equates prosperity with perpetual GDP expansion. Advocates of degrowth propose a planned reduction of economic output in wealthy nations, redirecting resources towards social welfare, ecological restoration, and equitable distribution. They argue that infinite growth on a finite planet is fundamentally unsustainable and that conventional metrics like GDP fail to capture genuine indicators of human well-being such as community cohesion, environmental quality, and leisure time. Critics, however, warn that degrowth could precipitate widespread unemployment, reduce innovation incentives, and disproportionately impact developing economies that depend on global trade networks.",
      question: "What do degrowth advocates propose for wealthy nations?",
      options: ["Increasing GDP growth", "A planned reduction of economic output", "Eliminating all trade", "Moving to rural areas"],
      correctAnswer: "A planned reduction of economic output",
      explanation: "'A planned reduction of economic output in wealthy nations' — Boy mamlakatlarda iqtisodiy ishlab chiqarishni rejalashtirilgan kamaytirish."
    },
    {
      readingPassage: "The concept of degrowth challenges the prevailing economic orthodoxy that equates prosperity with perpetual GDP expansion. Advocates of degrowth propose a planned reduction of economic output in wealthy nations, redirecting resources towards social welfare, ecological restoration, and equitable distribution. They argue that infinite growth on a finite planet is fundamentally unsustainable and that conventional metrics like GDP fail to capture genuine indicators of human well-being such as community cohesion, environmental quality, and leisure time. Critics, however, warn that degrowth could precipitate widespread unemployment, reduce innovation incentives, and disproportionately impact developing economies that depend on global trade networks.",
      question: "According to degrowth advocates, what does GDP fail to measure?",
      options: ["Total economic output", "Corporate profits", "Genuine indicators of well-being like community and environment", "Government spending"],
      correctAnswer: "Genuine indicators of well-being like community and environment",
      explanation: "'GDP fail to capture genuine indicators of human well-being such as community cohesion, environmental quality' — GDP jamiyat birligini va atrof-muhit sifatini o'lchay olmaydi."
    },
  ],
  advanced: [
    {
      readingPassage: "The epistemological implications of quantum mechanics continue to confound classical intuitions about the nature of reality. The Copenhagen interpretation, championed by Bohr and Heisenberg, posits that quantum systems exist in superposition until observation collapses the wave function into a definite state — a view that privileges measurement as constitutive of reality rather than merely revelatory. The many-worlds interpretation, by contrast, eliminates wave function collapse entirely, positing that all possible outcomes of quantum measurements are realised in an ever-branching multiverse. More recently, QBism (Quantum Bayesianism) has proposed a radically subjectivist framework in which quantum probabilities reflect an agent's personal degrees of belief rather than objective features of physical reality. Each interpretation carries profound metaphysical commitments that extend far beyond the laboratory, challenging our most fundamental assumptions about determinism, locality, and the relationship between observer and observed.",
      question: "According to QBism, what do quantum probabilities represent?",
      options: ["Objective physical properties", "Mathematical abstractions", "An agent's personal degrees of belief", "Universal constants"],
      correctAnswer: "An agent's personal degrees of belief",
      explanation: "'QBism proposes quantum probabilities reflect an agent's personal degrees of belief' — QBism bo'yicha kvant ehtimolliklari shaxsiy ishonch darajasini aks ettiradi."
    },
    {
      readingPassage: "The epistemological implications of quantum mechanics continue to confound classical intuitions about the nature of reality. The Copenhagen interpretation, championed by Bohr and Heisenberg, posits that quantum systems exist in superposition until observation collapses the wave function into a definite state — a view that privileges measurement as constitutive of reality rather than merely revelatory. The many-worlds interpretation, by contrast, eliminates wave function collapse entirely, positing that all possible outcomes of quantum measurements are realised in an ever-branching multiverse. More recently, QBism (Quantum Bayesianism) has proposed a radically subjectivist framework in which quantum probabilities reflect an agent's personal degrees of belief rather than objective features of physical reality. Each interpretation carries profound metaphysical commitments that extend far beyond the laboratory, challenging our most fundamental assumptions about determinism, locality, and the relationship between observer and observed.",
      question: "How does the many-worlds interpretation differ from the Copenhagen interpretation?",
      options: ["It denies quantum mechanics entirely", "It eliminates wave function collapse and posits all outcomes are realised", "It supports only one possible outcome", "It ignores the role of observation"],
      correctAnswer: "It eliminates wave function collapse and posits all outcomes are realised",
      explanation: "'Many-worlds eliminates wave function collapse entirely, positing all possible outcomes are realised' — Ko'p olamlar talqini to'lqin funksiyasi qulashini butunlay yo'q qiladi."
    },
    {
      readingPassage: "The emergence of large language models (LLMs) has precipitated a fundamental reassessment of the relationship between syntax and semantics in computational linguistics. Critics such as Bender and Koller argue that LLMs are essentially 'stochastic parrots' — sophisticated pattern-matching systems that manipulate linguistic form without genuine comprehension of meaning. Their influential paper contends that no system trained exclusively on textual data can acquire authentic understanding, as meaning is inherently grounded in embodied experience and social interaction. Proponents counter that the distinction between 'genuine' and 'simulated' understanding may be philosophically incoherent, invoking functionalist arguments that if a system's linguistic behaviour is indistinguishable from that of a competent speaker, attributing understanding becomes a matter of pragmatic convention rather than ontological fact.",
      question: "What is the 'stochastic parrot' argument?",
      options: ["LLMs can truly understand language", "LLMs manipulate form without genuine comprehension", "LLMs are better than humans at language", "LLMs learn from embodied experience"],
      correctAnswer: "LLMs manipulate form without genuine comprehension",
      explanation: "'Stochastic parrots — sophisticated pattern-matching systems that manipulate linguistic form without genuine comprehension' — LLM'lar haqiqiy tushunishsiz til shakllarini manipulyatsiya qiladi."
    },
    {
      readingPassage: "The emergence of large language models (LLMs) has precipitated a fundamental reassessment of the relationship between syntax and semantics in computational linguistics. Critics such as Bender and Koller argue that LLMs are essentially 'stochastic parrots' — sophisticated pattern-matching systems that manipulate linguistic form without genuine comprehension of meaning. Their influential paper contends that no system trained exclusively on textual data can acquire authentic understanding, as meaning is inherently grounded in embodied experience and social interaction. Proponents counter that the distinction between 'genuine' and 'simulated' understanding may be philosophically incoherent, invoking functionalist arguments that if a system's linguistic behaviour is indistinguishable from that of a competent speaker, attributing understanding becomes a matter of pragmatic convention rather than ontological fact.",
      question: "What counter-argument do proponents of LLMs make?",
      options: ["LLMs are identical to human brains", "The distinction between genuine and simulated understanding may be incoherent", "LLMs don't need language training", "Textual data is sufficient for full understanding"],
      correctAnswer: "The distinction between genuine and simulated understanding may be incoherent",
      explanation: "'The distinction between genuine and simulated understanding may be philosophically incoherent' — Haqiqiy va simulyatsiya qilingan tushunish o'rtasidagi farq falsafiy jihatdan asossiz bo'lishi mumkin."
    },
    {
      readingPassage: "The philosophical implications of CRISPR-Cas9 germline editing extend beyond conventional bioethical frameworks into questions of intergenerational justice and human identity. When modifications are made to the germline — the heritable genetic material passed to future generations — the edited individuals cannot provide informed consent for alterations that will permanently shape their biological constitution and that of their descendants. This raises what philosopher Hans Jonas termed the 'imperative of responsibility': an ethical obligation to future persons whose very existence and characteristics are contingent upon present decisions. Moreover, the capacity to select for specific traits introduces what Habermas has described as a 'liberal eugenics' that, unlike its coercive historical predecessors, operates through market mechanisms and parental choice, yet nonetheless threatens the normative foundations of moral equality by creating asymmetric relationships between designing parents and designed children.",
      question: "What ethical concept does Hans Jonas's 'imperative of responsibility' address?",
      options: ["The right to genetic modification", "An obligation to future persons affected by present decisions", "The freedom of scientific research", "Market regulation of biotechnology"],
      correctAnswer: "An obligation to future persons affected by present decisions",
      explanation: "'An ethical obligation to future persons whose existence is contingent upon present decisions' — Hozirgi qarorlarga bog'liq bo'lgan kelajak insonlarga nisbatan axloqiy javobgarlik."
    },
    {
      readingPassage: "The philosophical implications of CRISPR-Cas9 germline editing extend beyond conventional bioethical frameworks into questions of intergenerational justice and human identity. When modifications are made to the germline — the heritable genetic material passed to future generations — the edited individuals cannot provide informed consent for alterations that will permanently shape their biological constitution and that of their descendants. This raises what philosopher Hans Jonas termed the 'imperative of responsibility': an ethical obligation to future persons whose very existence and characteristics are contingent upon present decisions. Moreover, the capacity to select for specific traits introduces what Habermas has described as a 'liberal eugenics' that, unlike its coercive historical predecessors, operates through market mechanisms and parental choice, yet nonetheless threatens the normative foundations of moral equality by creating asymmetric relationships between designing parents and designed children.",
      question: "How does Habermas's concept of 'liberal eugenics' differ from historical eugenics?",
      options: ["It is completely harmless", "It operates through market mechanisms instead of coercion", "It is government-controlled", "It focuses only on disease prevention"],
      correctAnswer: "It operates through market mechanisms instead of coercion",
      explanation: "'Unlike its coercive historical predecessors, operates through market mechanisms and parental choice' — Majburiy tarixiy amaliyotlardan farqli o'laroq, bozor mexanizmlari va ota-ona tanlovi orqali ishlaydi."
    },
  ]
};

const levels = ['beginner', 'elementary', 'intermediate', 'upper', 'advanced'];
const levelPrefixes = { beginner: 'beg', elementary: 'elem', intermediate: 'inter', upper: 'upper', advanced: 'adv' };

let addedCount = 0;

levels.forEach((level) => {
  const prefix = levelPrefixes[level];
  const exercises = readingExercises[level];
  if (!exercises) return;

  const levelLessons = data.lessons.filter(l => l.level === level);

  exercises.forEach((ex, idx) => {
    const targetLesson = levelLessons[idx % levelLessons.length];
    if (!targetLesson) return;

    const exerciseObj = {
      id: `ex-reading-${prefix}-${idx + 1}`,
      type: 'reading',
      question: ex.question,
      readingPassage: ex.readingPassage,
      options: ex.options,
      correctAnswer: ex.correctAnswer,
      explanation: ex.explanation
    };

    targetLesson.exercises.push(exerciseObj);
    addedCount++;
  });
});

fs.writeFileSync(lessonsPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully added ${addedCount} reading exercises across all levels!`);
