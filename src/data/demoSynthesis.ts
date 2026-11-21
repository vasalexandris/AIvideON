import type { Language, SynthesisResult } from '../types';
import { buildYouTubeThumbnail, buildYouTubeUrl } from '../services/youtubeService';

export function getDemoSynthesis(language: Language): SynthesisResult {
  const sourceVideos = [
    {
      videoId: 'LPZh9BOjkQs',
      url: buildYouTubeUrl('LPZh9BOjkQs'),
      title: 'Large Language Models explained briefly',
      channelTitle: '3Blue1Brown',
      thumbnailUrl: buildYouTubeThumbnail('LPZh9BOjkQs'),
      durationSeconds: 478,
    },
    {
      videoId: 'zjkBMFhNj_g',
      url: buildYouTubeUrl('zjkBMFhNj_g'),
      title: 'Intro to Large Language Models',
      channelTitle: 'Andrej Karpathy',
      thumbnailUrl: buildYouTubeThumbnail('zjkBMFhNj_g'),
      durationSeconds: 3589,
    },
    {
      videoId: 'wjZofJX0v4M',
      url: buildYouTubeUrl('wjZofJX0v4M'),
      title: 'Attention in transformers, visually explained',
      channelTitle: '3Blue1Brown',
      thumbnailUrl: buildYouTubeThumbnail('wjZofJX0v4M'),
      durationSeconds: 1569,
    },
  ];

  if (language === 'el') {
    return {
      id: 'demo-el',
      query: 'Πώς λειτουργούν στην πράξη τα LLMs, το Pre-training και το Attention;',
      language: 'el',
      createdAt: new Date().toISOString(),
      isDemo: true,
      synthesisTitle: 'Σύνθεση: Πώς σκέφτονται και προβλέπουν τα LLMs (από 3 κορυφαία βίντεο)',
      executiveSummary:
        'Αυτή η σύνθεση ενώνει 4 στοχευμένα αποσπάσματα από 3 διαφορετικά εκπαιδευτικά βίντεο σε ένα ενιαίο μίνι-ντοκιμαντέρ: από τη βασική πρόβλεψη της επόμενης λέξης, στη συμπίεση γνώσης κατά το pre-training, μέχρι τον μηχανισμό Attention και το fine-tuning.',
      keyInsights: [
        'Ένα LLM προβλέπει την επόμενη λέξη (token) βάσει πιθανοτήτων, αλλά σε μεγάλη κλίμακα αναδύονται σύνθετες ικανότητες.',
        'Το Pre-training είναι στην ουσία μια συμπίεση μεγάλου μέρους του διαδικτύου σε ένα αρχείο παραμέτρων (weights).',
        'Ο μηχανισμός Attention επιτρέπει στις λέξεις να «επικοινωνούν» μεταξύ τους ώστε το μοντέλο να καταλαβαίνει το context.',
        'Το Fine-tuning (RLHF / Assistant training) μετατρέπει ένα μοντέλο πρόβλεψης κειμένου σε χρήσιμο βοηθό.',
      ],
      sourceVideos,
      outroSlide: {
        kind: 'outro',
        eyebrow: 'ΕΠΙΛΟΓΟΣ',
        headline: 'Η νοημοσύνη μέσα από πιθανότητες και συμφραζόμενα',
        body: 'Από την απλή πρόβλεψη της επόμενης λέξης και τη συμπίεση του διαδικτύου, μέχρι το Attention και το fine-tuning — έτσι γεννιέται ένας σύγχρονος ψηφιακός συνομιλητής.',
      },
      clips: [
        {
          id: 'demo-clip-1',
          videoId: 'LPZh9BOjkQs',
          videoUrl: buildYouTubeUrl('LPZh9BOjkQs'),
          videoTitle: 'Large Language Models explained briefly',
          channelTitle: '3Blue1Brown',
          thumbnailUrl: buildYouTubeThumbnail('LPZh9BOjkQs'),
          startSeconds: 12,
          endSeconds: 48,
          clipTitle: '1. Η κεντρική ιδέα: Πρόβλεψη επόμενης λέξης',
          aiExplanation:
            'Η πιο καθαρή οπτική εξήγηση του πώς ένα LLM παράγει κείμενο: παίρνει μια ακολουθία λέξεων και υπολογίζει την πιθανότητα για κάθε πιθανή επόμενη λέξη.',
          transcriptExcerpt:
            '«Ένα Large Language Model είναι ένα εξελιγμένο μαθηματικό μοντέλο που προβλέπει ποια λέξη είναι πιο πιθανό να ακολουθήσει...»',
          keyTakeaways: [
            'Η παραγωγή κειμένου γίνεται token-by-token (λέξη-λέξη).',
            'Η τυχαιότητα (temperature) δίνει ποικιλία στις απαντήσεις.',
          ],
          bridgeQuestion: 'Πώς καταφέρνει ένα πρόγραμμα να γράφει σαν άνθρωπος;',
          bridgeText:
            'Όλα ξεκινούν από ένα φαινομενικά απλό παιχνίδι πιθανοτήτων: την πρόβλεψη της αμέσως επόμενης λέξης.',
          introSlides: [
            {
              kind: 'title',
              eyebrow: 'AIVIDEON ΝΤΟΚΙΜΑΝΤΕΡ',
              headline: 'Μέσα στο μυαλό ενός LLM',
              body: 'Τι συμβαίνει στ’ αλήθεια κάθε φορά που μια τεχνητή νοημοσύνη γράφει μια πρόταση;',
            },
            {
              kind: 'question',
              eyebrow: 'ΜΕΡΟΣ 01',
              headline: 'Πώς καταφέρνει ένα πρόγραμμα να γράφει σαν άνθρωπος;',
              body: 'Στην ερώτηση αυτή, η απάντηση ξεκινά από ένα φαινομενικά απλό παιχνίδι πιθανοτήτων: την πρόβλεψη της αμέσως επόμενης λέξης.',
            },
          ],
          enabled: true,
        },
        {
          id: 'demo-clip-2',
          videoId: 'zjkBMFhNj_g',
          videoUrl: buildYouTubeUrl('zjkBMFhNj_g'),
          videoTitle: 'Intro to Large Language Models',
          channelTitle: 'Andrej Karpathy',
          thumbnailUrl: buildYouTubeThumbnail('zjkBMFhNj_g'),
          startSeconds: 105,
          endSeconds: 152,
          clipTitle: '2. Pre-training: Συμπίεση της γνώσης του Internet',
          aiExplanation:
            'Ο Andrej Karpathy εξηγεί με πρακτικά νούμερα τι είναι στην πραγματικότητα ένα εκπαιδευμένο μοντέλο: δύο αρχεία — οι παράμετροι (weights) και λίγες γραμμές κώδικα για να τρέξουν.',
          transcriptExcerpt:
            '«Χρειάζεσαι μόνο δύο αρχεία για να τρέξεις ένα LLM: το αρχείο με τις παραμέτρους και τον κώδικα C/Python που εκτελεί το νευρωνικό δίκτυο...»',
          keyTakeaways: [
            'Η εκπαίδευση συμπιέζει terabytes κειμένου σε gigabytes weights.',
            'Το inference (εκτέλεση) είναι ελαφρύ, ενώ το training είναι πανάκριβο.',
          ],
          bridgeQuestion: 'Πού αποθηκεύεται όμως όλη αυτή η γνώση;',
          bridgeText:
            'Αν ένα μοντέλο απλώς προβλέπει λέξεις, τι υπάρχει στην πραγματικότητα μέσα στον σκληρό δίσκο που το κάνει να «θυμάται» ολόκληρο το διαδίκτυο;',
          introSlides: [
            {
              kind: 'narrative',
              eyebrow: 'ΜΕΡΟΣ 02',
              headline: 'Πίσω από την πρόβλεψη κρύβεται μια τεράστια συμπίεση',
              body: 'Είδαμε πώς διαλέγει την επόμενη λέξη. Για να το κάνει όμως σωστά, πρέπει να έχει απορροφήσει δισεκατομμύρια κείμενα.',
            },
            {
              kind: 'question',
              headline: 'Πού αποθηκεύεται τελικά όλη αυτή η γνώση;',
            },
          ],
          enabled: true,
        },
        {
          id: 'demo-clip-3',
          videoId: 'wjZofJX0v4M',
          videoUrl: buildYouTubeUrl('wjZofJX0v4M'),
          videoTitle: 'Attention in transformers, visually explained',
          channelTitle: '3Blue1Brown',
          thumbnailUrl: buildYouTubeThumbnail('wjZofJX0v4M'),
          startSeconds: 185,
          endSeconds: 225,
          clipTitle: '3. Γιατί το Attention αλλάζει τα πάντα',
          aiExplanation:
            'Η καρδιά της αρχιτεκτονικής Transformer: πώς η ίδια λέξη αποκτά διαφορετικό νόημα ανάλογα με τις γύρω λέξεις.',
          transcriptExcerpt:
            '«Ο μηχανισμός Attention επιτρέπει στα διανύσματα (embeddings) να ανταλλάσσουν πληροφορία και να ενημερώνουν το νόημά τους βάσει συμφραζομένων...»',
          keyTakeaways: [
            'Κάθε λέξη ξεκινά ως στατικό vector και εμπλουτίζεται από το context.',
            'Τα πολλαπλά Attention heads παρακολουθούν διαφορετικές σχέσεις ταυτόχρονα.',
          ],
          bridgeQuestion: 'Πώς καταλαβαίνει το νόημα πίσω από τις λέξεις;',
          bridgeText:
            'Η ίδια λέξη μπορεί να σημαίνει εντελώς διαφορετικά πράγματα ανάλογα με την πρόταση. Το μυστικό κρύβεται στον μηχανισμό Attention.',
          introSlides: [
            {
              kind: 'question',
              eyebrow: 'ΜΕΡΟΣ 03',
              headline: 'Πώς καταλαβαίνει το νόημα πίσω από τις λέξεις;',
              body: 'Πέρα από τα αποθηκευμένα δεδομένα, οι λέξεις πρέπει να «συνομιλούν» μεταξύ τους μέσα στην πρόταση. Αυτό ακριβώς πετυχαίνει το Attention.',
            },
          ],
          enabled: true,
        },
        {
          id: 'demo-clip-4',
          videoId: 'zjkBMFhNj_g',
          videoUrl: buildYouTubeUrl('zjkBMFhNj_g'),
          videoTitle: 'Intro to Large Language Models',
          channelTitle: 'Andrej Karpathy',
          thumbnailUrl: buildYouTubeThumbnail('zjkBMFhNj_g'),
          startSeconds: 615,
          endSeconds: 655,
          clipTitle: '4. Από Base Model σε AI Assistant (Fine-tuning)',
          aiExplanation:
            'Το κρίσιμο βήμα που κάνει το μοντέλο να απαντά σε ερωτήσεις αντί απλά να συνεχίζει κείμενο.',
          transcriptExcerpt:
            '«Το fine-tuning αλλάζει τη μορφή των δεδομένων σε ερωτήσεις-απαντήσεις βοηθού, διατηρώντας όλη τη γνώση του pre-training...»',
          keyTakeaways: [
            'Η γνώση προέρχεται από το pre-training.',
            'Η συμπεριφορά "βοηθού" προέρχεται από το fine-tuning & RLHF.',
          ],
          bridgeQuestion: 'Πώς ένα μοντέλο κειμένου γίνεται έξυπνος βοηθός;',
          bridgeText:
            'Ένα ακατέργαστο μοντέλο απλώς συνεχίζει έγγραφα. Ένα τελευταίο στάδιο εκπαίδευσης αλλάζει εντελώς τη συμπεριφορά του.',
          introSlides: [
            {
              kind: 'narrative',
              eyebrow: 'ΜΕΡΟΣ 04',
              headline: 'Το τελευταίο κομμάτι του παζλ',
              body: 'Έχουμε γνώση, έχουμε συμφραζόμενα — πώς όμως ένα σύστημα που απλώς συμπληρώνει κείμενο μεταμορφώνεται στον βοηθό με τον οποίο συνομιλούμε;',
            },
          ],
          enabled: true,
        },
      ],
    };
  }

  return {
    id: 'demo-en',
    query: 'How do LLMs actually work: Next-token prediction, Pre-training, and Attention?',
    language: 'en',
    createdAt: new Date().toISOString(),
    isDemo: true,
    synthesisTitle: 'Synthesis: How LLMs Think & Predict (from 3 Top Creators)',
    executiveSummary:
      'This synthesis stitches 4 targeted segments from over 90 minutes of source lectures into a focused mini-documentary: covering next-token prediction, pre-training as internet compression, the Attention mechanism, and assistant fine-tuning.',
    keyInsights: [
      'LLMs predict the next token probabilistically, yet emergent reasoning appears at scale.',
      'Pre-training compresses terabytes of internet text into a compact parameter file (weights).',
      'Attention lets token vectors exchange context so words resolve their true meaning.',
      'Fine-tuning turns a raw document completer into a helpful conversational assistant.',
    ],
    sourceVideos,
    outroSlide: {
      kind: 'outro',
      eyebrow: 'EPILOGUE',
      headline: 'Intelligence shaped by probability and context',
      body: 'From next-word prediction and internet-scale compression to Attention and fine-tuning — this is how modern AI finds its voice.',
    },
    clips: [
      {
        id: 'demo-clip-1',
        videoId: 'LPZh9BOjkQs',
        videoUrl: buildYouTubeUrl('LPZh9BOjkQs'),
        videoTitle: 'Large Language Models explained briefly',
        channelTitle: '3Blue1Brown',
        thumbnailUrl: buildYouTubeThumbnail('LPZh9BOjkQs'),
        startSeconds: 12,
        endSeconds: 48,
        clipTitle: '1. Core Intuition: Next-Word Prediction',
        aiExplanation:
          'The clearest visual intuition of how an LLM generates text: taking a sequence of words and computing probabilities for what comes next.',
        transcriptExcerpt:
          '"A Large Language Model is a sophisticated mathematical function that predicts what word is most likely to come next..."',
        keyTakeaways: [
          'Text generation happens token-by-token in a loop.',
          'Sampling temperature controls creativity vs determinism.',
        ],
        bridgeQuestion: 'How does software learn to write like a human?',
        bridgeText:
          'It all begins with a deceptively simple probability game: predicting the very next word in a sequence.',
        introSlides: [
          {
            kind: 'title',
            eyebrow: 'AIVIDEON DOCUMENTARY',
            headline: 'Inside the Mind of an LLM',
            body: 'What is really happening behind the screen every time an AI writes a sentence?',
          },
          {
            kind: 'question',
            eyebrow: 'PART 01',
            headline: 'How does software learn to write like a human?',
            body: 'The answer begins with a deceptively simple probability game: predicting the very next word.',
          },
        ],
        enabled: true,
      },
      {
        id: 'demo-clip-2',
        videoId: 'zjkBMFhNj_g',
        videoUrl: buildYouTubeUrl('zjkBMFhNj_g'),
        videoTitle: 'Intro to Large Language Models',
        channelTitle: 'Andrej Karpathy',
        thumbnailUrl: buildYouTubeThumbnail('zjkBMFhNj_g'),
        startSeconds: 105,
        endSeconds: 152,
        clipTitle: '2. Pre-training: Compressing the Internet',
        aiExplanation:
          'Andrej Karpathy breaks down what a trained LLM actually is on disk: just two files — the neural network parameters and a minimal run script.',
        transcriptExcerpt:
          '"You only need two files to run an LLM: the parameters file and a short C/Python file implementing the neural net architecture..."',
        keyTakeaways: [
          'Training compresses terabytes of text into gigabytes of weights.',
          'Inference is lightweight compared to the massive compute of training.',
        ],
        bridgeQuestion: 'Where does all that world knowledge actually live?',
        bridgeText:
          'If a model only predicts words, what actually sits on disk allowing it to remember the internet?',
        introSlides: [
          {
            kind: 'narrative',
            eyebrow: 'PART 02',
            headline: 'Behind every prediction lies massive compression',
            body: 'Choosing the right next word requires absorbing billions of pages of human writing.',
          },
          {
            kind: 'question',
            headline: 'Where does all that knowledge actually live?',
          },
        ],
        enabled: true,
      },
      {
        id: 'demo-clip-3',
        videoId: 'wjZofJX0v4M',
        videoUrl: buildYouTubeUrl('wjZofJX0v4M'),
        videoTitle: 'Attention in transformers, visually explained',
        channelTitle: '3Blue1Brown',
        thumbnailUrl: buildYouTubeThumbnail('wjZofJX0v4M'),
        startSeconds: 185,
        endSeconds: 225,
        clipTitle: '3. How Attention Resolves Context',
        aiExplanation:
          'How words dynamically update their meaning based on surrounding context.',
        transcriptExcerpt:
          '"The attention mechanism allows token embeddings to pass information to each other and update their meaning in context..."',
        keyTakeaways: [
          'Words start as static embeddings and become context-rich vectors.',
          'Multiple attention heads track different linguistic relationships in parallel.',
        ],
        bridgeQuestion: 'How does a model grasp meaning across a sentence?',
        bridgeText:
          'The same word can mean entirely different things depending on its neighbors. Enter the Attention mechanism.',
        introSlides: [
          {
            kind: 'question',
            eyebrow: 'PART 03',
            headline: 'How does a model grasp meaning across a whole sentence?',
            body: 'Beyond stored memory, words must exchange context with one another. That is the breakthrough of Attention.',
          },
        ],
        enabled: true,
      },
      {
        id: 'demo-clip-4',
        videoId: 'zjkBMFhNj_g',
        videoUrl: buildYouTubeUrl('zjkBMFhNj_g'),
        videoTitle: 'Intro to Large Language Models',
        channelTitle: 'Andrej Karpathy',
        thumbnailUrl: buildYouTubeThumbnail('zjkBMFhNj_g'),
        startSeconds: 615,
        endSeconds: 655,
        clipTitle: '4. From Base Model to AI Assistant',
        aiExplanation:
          'The crucial fine-tuning stage that transforms a text-completer into an instruction-following assistant.',
        transcriptExcerpt:
          '"Fine-tuning shifts the distribution toward helpful assistant Q&A while preserving the world knowledge learned during pre-training..."',
        keyTakeaways: [
          'Knowledge comes from pre-training.',
          'Assistant behavior comes from supervised fine-tuning & RLHF.',
        ],
        bridgeQuestion: 'From raw text predictor to helpful AI assistant?',
        bridgeText:
          'A base model merely completes documents. One final training phase transforms how it speaks to us.',
        introSlides: [
          {
            kind: 'narrative',
            eyebrow: 'PART 04',
            headline: 'The final transformation',
            body: 'We have compressed knowledge and context — yet how does a raw document completer become a helpful conversational partner?',
          },
        ],
        enabled: true,
      },
    ],
  };
}
