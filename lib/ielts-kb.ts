// lib/ielts-kb.ts
// Intelligent IELTS Knowledge Base & Offline Fallback AI Coach

export interface MascotAnswer {
  reply: string;
  mood: 'calm' | 'agitated';
}

export function answerIELTSQuestion(query: string): MascotAnswer {
  const text = (query || '').toLowerCase().trim();

  // 1. Exam frequency / attempts ("yiliga necha marta", "qachon topshiriladi", "chegarasi bormi")
  if (
    text.includes('necha marta') ||
    text.includes('qancha marta') ||
    text.includes('yiliga') ||
    text.includes('qachon topshir') ||
    text.includes('topshiriladi') ||
    text.includes('qayta topshir') ||
    text.includes('limit') ||
    text.includes('chegarasi')
  ) {
    return {
      reply: `IELTS imtihonini **yiliga istalgancha (cheksiz marta)** topshirishingiz mumkin! Hech qanday cheklov yoki taqiq yo'q.

O'zbekistonda (British Council va IDP rasmiy markazlarida):
1. 💻 **Computer-delivered IELTS (kompyuterda):**
   - Haftada deyarli har kuni (kuniga 2-3 martagacha) o'tkaziladi.
   - Natijasi juda tez — **1 kundan 5 kungacha** chiqadi.
2. 📝 **Paper-based IELTS (qog'ozda):**
   - Oyiga odatda 4 marta (payshanba va shanba kunlari) bo'lib o'tadi.
   - Natijasi **13 kunda** e'lon qilinadi.

💡 **Muhim maslahat:** Agar olgan balingiz sizni qoniqtirmasa, darhol keyingi bo'sh sanaga ro'yxatdan o'tishingiz mumkin. Sertifikat topshirilgan sanadan boshlab **2 yil** davomida butun dunyoda yaroqli hisoblanadi.`,
      mood: 'calm',
    };
  }

  // 2. Exam price / fees ("narxi", "qancha turadi", "to'lovi")
  if (
    text.includes('narx') ||
    text.includes('qancha turadi') ||
    text.includes('tolov') ||
    text.includes("to'lov") ||
    text.includes('pul') ||
    text.includes('dollar')
  ) {
    return {
      reply: `O'zbekistonda IELTS imtihonining rasmiy to'lovi hozirda taxminan **2 200 000 so'm – 2 400 000 so'm** atrofida (Markaziy bank kursi va ro'yxatdan o'tish markaziga qarab kichik farq qilishi mumkin).

To'lovni **British Council Uzbekistan** yoki **IDP IELTS Uzbekistan** rasmiy saytlari orqali Click, Payme yoki bank kartasi orqali amalga oshirishingiz mumkin.`,
      mood: 'calm',
    };
  }

  // 3. Speaking advice ("speaking", "part 1", "part 2", "gapirish")
  if (
    text.includes('speaking') ||
    text.includes('gapirish') ||
    text.includes('part 1') ||
    text.includes('part 2') ||
    text.includes('part 3') ||
    text.includes('cue card')
  ) {
    return {
      reply: `IELTS Speaking imtihoni 3 qismdan (11-14 daqiqa) iborat bo'lib, quyidagicha baholanadi:

1. **Part 1 (4-5 daqiqa):** Kundalik tanish mavzular (o'qish, ish, qiziqishlar). Javobingiz 2-3 ta to'liq gapdan iborat bo'lsin.
2. **Part 2 (3-4 daqiqa):** Cue card mavzusi. Sizga tayyorlanish uchun **1 daqiqa** vaqt beriladi va **2 daqiqa** to'xtamay gapirishingiz kerak. Storytelling (voqeiy hikoya) usulidan foydalaning.
3. **Part 3 (4-5 daqiqa):** Chuqur, tahliliy savollar. Fikringizni sabablar va hayotiy misollar bilan asoslang.

⭐ **4 ta asosiy mezon:**
- **Fluency & Coherence:** Ravonlik va bog'lovchilar (*Furthermore, In contrast, Naturally*).
- **Lexical Resource:** Qiziqarli so'zlar va iboralar.
- **Grammatical Range & Accuracy:** Murakkab zamonlar va nisbatlar.
- **Pronunciation:** Aniq talaffuz va intonatsiya.`,
      mood: 'calm',
    };
  }

  // 4. Writing advice ("writing", "task 1", "task 2", "insho", "essay")
  if (
    text.includes('writing') ||
    text.includes('yozish') ||
    text.includes('task 1') ||
    text.includes('task 2') ||
    text.includes('insho') ||
    text.includes('essay')
  ) {
    return {
      reply: `IELTS Writing moduli 60 daqiqa davom etadi va 2 ta vazifadan iborat:

📊 **Task 1 (20 daqiqa, kamida 150 ta so'z):**
- Grafika, jadval yoki diagrammani tasvirlash.
- Eng muhim qoida: Har doim **Overview** (umumiy tendensiya) yozing. O'z fikringizni qo'shmang, faqat faktlarni solishtiring.

✍️ **Task 2 (40 daqiqa, kamida 250 ta so'z):**
- Berilgan muammo yoki mavzu bo'yicha akademik insho yozish.
- Standart 4 paragrafli struktura:
  1. *Introduction* (mavzuni parafraz qilish va thesis statement).
  2. *Body 1* (birinchi asosiy fikr + misol).
  3. *Body 2* (ikkinchi asosiy fikr + misol).
  4. *Conclusion* (yakuniy xulosa).

Writing bo'limida 250 tadan kam so'z yozsangiz balingiz pasayadi, shuning uchun so'z soni va paragraflarga qat'iy rioya qiling!`,
      mood: 'calm',
    };
  }

  // 5. Reading advice ("reading", "o'qish", "true false", "skimming")
  if (
    text.includes('reading') ||
    text.includes("o'qish") ||
    text.includes('oqish') ||
    text.includes('true false') ||
    text.includes('skimming') ||
    text.includes('scanning')
  ) {
    return {
      reply: `IELTS Reading modulida muvaffaqiyat qozonish uchun asosiy strategiyalar:

1. **Vaqt taqsimoti:** Jami 60 daqiqa, 3 ta matn (Passage) va 40 ta savol. Matnlar murakkablashib boradi, shuning uchun: Passage 1 ga 17 daq, Passage 2 ga 20 daq, Passage 3 ga 23 daq ajrating.
2. **Skimming & Scanning:** Butun matnni boshidan oxirigacha tarjima qilib o'tirmang! Avval savolni o'qing, kalit so'zlarni (keywords) belgilang va matndan qidiring.
3. **True / False / Not Given farqi:**
   - **True:** Matnda ayni shu fikr bor.
   - **False:** Matnda aynan teskarisi aytilgan.
   - **Not Given:** Matnda bu haqida ma'lumot umuman yo'q.`,
      mood: 'calm',
    };
  }

  // 6. Listening advice ("listening", "tinglash", "audio")
  if (
    text.includes('listening') ||
    text.includes('tinglash') ||
    text.includes('audio') ||
    text.includes('eshitish')
  ) {
    return {
      reply: `IELTS Listening bo'yicha eng muhim tavsiyalar (30 daqiqa + 10 daqiqa ko'chirish):

1. **Oldindan o'qib olish:** Har bir bo'lim boshlanishidan oldin berilgan 30-45 soniya ichida savollarni tez o'qib, qanday so'z (ism, raqam, joy, fe'l) kerakligini taxmin qiling.
2. **Imlo (Spelling) xatolari:** IELTSda so'zni bitta harfigacha to'g'ri yozish shart, aks holda javob xato hisoblanadi.
3. **Chalg'ituvchilarga (Distractors) aldanmang:** Audio boshida bir ma'lumot aytilib, keyin *"Oh sorry, actually it's..."* deb o'zgartirilishi juda keng tarqalgan.
4. **So'z chegarasi:** *"NO MORE THAN TWO WORDS"* deyilgan bo'lsa, hech qachon 3 ta so'z yozmang.`,
      mood: 'calm',
    };
  }

  // 7. CEFR vs IELTS ballari ("cefr", "ball", "b2", "c1", "band")
  if (
    text.includes('cefr') ||
    text.includes('b2') ||
    text.includes('c1') ||
    text.includes('b1') ||
    text.includes('band') ||
    text.includes('ball')
  ) {
    return {
      reply: `IELTS ballarining CEFR xalqaro darajalariga mosligi:

- **Band 4.0 – 5.0:** B1 (Intermediate)
- **Band 5.5 – 6.5:** B2 (Upper-Intermediate) — aksariyat xorijiy va mahalliy universitetlar talab qiladigan daraja.
- **Band 7.0 – 8.0:** C1 (Advanced) — magistratura, grantlar va nufuzli dasturlar uchun a'lo natija.
- **Band 8.5 – 9.0:** C2 (Proficiency / Expert).

O'zbekiston OTMlariga kirishda odatda kamida **B2 (5.5+)** sertifikati chet tili fanidan maksimal ball beradi.`,
      mood: 'calm',
    };
  }

  // 8. Greetings & general hello
  if (
    text === 'salom' ||
    text === 'hello' ||
    text === 'hi' ||
    text.includes('assalom') ||
    text.includes('qalesiz') ||
    text.includes('qalaysiz')
  ) {
    return {
      reply: `Assalomu alaykum! Salom! Men sizning IELTS bo'yicha shaxsiy AI yordamchingizman. 🎯

Quyidagi mavzularda sizga yordam bera olaman:
- 🗣️ **Speaking:** Part 1, 2, 3 uchun strategiyalar va tayyorgarlik.
- ✍️ **Writing:** Task 1 va Task 2 insho tuzilishi, shablonlar.
- 📖 **Reading & Listening:** Sir va usullari, savol turlari.
- 📅 **Imtihon qoidalari:** Sanalar, to'lovlar, CEFR va ballar.

Istalgan savolingizni bering, batafsil tushuntirib beraman!`,
      mood: 'calm',
    };
  }

  // 9. Encouraging AI response for other queries
  return {
    reply: `Savolingiz uchun rahmat! IELTS tayyorgarligi bo'yicha har bir savol imtihon natijangizga ijobiy ta'sir ko'rsatadi.

"${query}" mavzusi bo'yicha asosiy maslahatim:
1. IELTSda har doim o'z javobingizni aniq dalillar va misollar bilan boyiting.
2. Akademik so'z boyligi (lexical resource) va grammatikani xilma-xil qilishga e'tibor bering.
3. Kuniga kamida 30-45 daqiqa muntazam mashq qiling.

Ushbu mavzu yuzasidan aniqroq qanday ma'lumot yoki mashq kerakligini yozing, birgalikda ko'rib chiqamiz!`,
    mood: 'calm',
  };
}
