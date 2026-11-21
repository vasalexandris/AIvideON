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
        'Αυτή η σύνθεση ενώνει 4 στοχευμένα αποσπάσματα από 3 διαφορετικά εκπαιδευτικά βίντεο (συνολικής διάρκειας άνω της 1.5 ώρας) σε ένα ενιαίο μάθημα ~2.5 λεπτών: από τη βασική πρόβλεψη της επόμενης λέξης, στη συμπίεση γνώσης κατά το pre-training, μέχρι τον μηχανισμό Attention και το fine-tuning.',
      keyInsights: [
        'Ένα LLM προβλέπει την επόμενη λέξη (token) βάσει πιθανοτήτων, αλλά σε μεγάλη κλίμακα αναδύονται σύνθετες ικανότητες.',
        'Το Pre-training είναι στην ουσία μια συμπίεση μεγάλου μέρους του διαδικτύου σε ένα αρχείο παραμέτρων (weights).',
        'Ο μηχανισμός Attention επιτρέπει στις λέξεις να «επικοινωνούν» μεταξύ τους ώστε το μοντέλο να καταλαβαίνει το context.',
        'Το Fine-tuning (RLHF / Assistant training) μετατρέπει ένα μοντέλο πρόβλεψης κειμένου σε χρήσιμο βοηθό.',
      ],
      sourceVideos,
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
            'Ξεκινάμε με την πιο καθαρή οπτική εξήγηση του πώς ένα LLM παράγει κείμενο: παίρνει μια ακολουθία λέξεων και υπολογίζει την πιθανότητα για κάθε πιθανή επόμενη λέξη.',
          transcriptExcerpt:
            '«Ένα Large Language Model είναι ένα εξελιγμένο μαθηματικό μοντέλο που προβλέπει ποια λέξη είναι πιο πιθανό να ακολουθήσει...»',
          keyTakeaways: [
            'Η παραγωγή κειμένου γίνεται token-by-token (λέξη-λέξη).',
            'Η τυχαιότητα (temperature) δίνει ποικιλία στις απαντήσεις.',
          ],
          bridgeQuestion: 'Πώς καταφέρνει ένα πρόγραμμα να γράφει σαν άνθρωπος;',
          bridgeText:
            'Όλα ξεκινούν από ένα φαινομενικά απλό παιχνίδι πιθανοτήτων: την πρόβλεψη της αμέσως επόμενης λέξης.',
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
          bridgeQuestion: 'Και πού αποθηκεύεται όλη αυτή η γνώση;',
          bridgeText:
            'Τώρα που είδαμε πώς προβλέπει λέξεις, ο Andrej Karpathy μάς αποκαλύπτει τι υπάρχει στ’ αλήθεια στον σκληρό δίσκο ενός LLM.',
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
            'Εδώ περνάμε στην καρδιά της αρχιτεκτονικής Transformer: πώς η ίδια λέξη (π.χ. "bank" ή "apple") αποκτά διαφορετικό νόημα ανάλογα με τις γύρω λέξεις.',
          transcriptExcerpt:
            '«Ο μηχανισμός Attention επιτρέπει στα διανύσματα (embeddings) να ανταλλάσσουν πληροφορία και να ενημερώνουν το νόημά τους βάσει συμφραζομένων...»',
          keyTakeaways: [
            'Κάθε λέξη ξεκινά ως στατικό vector και εμπλουτίζεται από το context.',
            'Τα πολλαπλά Attention heads παρακολουθούν διαφορετικές σχέσεις ταυτόχρονα.',
          ],
          bridgeQuestion: 'Πώς όμως καταλαβαίνει το νόημα πίσω από τις λέξεις;',
          bridgeText:
            'Μια λέξη αλλάζει σημασία ανάλογα με την πρόταση. Περνάμε στο 3Blue1Brown για να δούμε οπτικά τον μηχανισμό Attention.',
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
            'Κλείνουμε τη σύνθεση με το κρίσιμο βήμα που κάνει το μοντέλο να απαντά σε ερωτήσεις αντί απλά να συνεχίζει κείμενο.',
          transcriptExcerpt:
            '«Το fine-tuning αλλάζει τη μορφή των δεδομένων σε ερωτήσεις-απαντήσεις βοηθού, διατηρώντας όλη τη γνώση του pre-training...»',
          keyTakeaways: [
            'Η γνώση προέρχεται από το pre-training.',
            'Η συμπεριφορά "βοηθού" προέρχεται από το fine-tuning & RLHF.',
          ],
          bridgeQuestion: 'Από ένα «μαθηματικό μοντέλο» σε έναν έξυπνο βοηθό;',
          bridgeText:
            'Στο τελευταίο κεφάλαιο επιστρέφουμε στον Karpathy για να δούμε πώς το raw μοντέλο μεταμορφώνεται στον βοηθό με τον οποίο συνομιλούμε.',
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
      'This synthesis stitches 4 targeted segments from over 90 minutes of source lectures into a focused ~2.5-minute composite lesson: covering next-token prediction, pre-training as internet compression, the Attention mechanism, and assistant fine-tuning.',
    keyInsights: [
      'LLMs predict the next token probabilistically, yet emergent reasoning appears at scale.',
      'Pre-training compresses terabytes of internet text into a compact parameter file (weights).',
      'Attention lets token vectors exchange context so words resolve their true meaning.',
      'Fine-tuning turns a raw document completer into a helpful conversational assistant.',
    ],
    sourceVideos,
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
          'We open with the clearest visual intuition of how an LLM generates text: taking a sequence of words and computing probabilities for what comes next.',
        transcriptExcerpt:
          '"A Large Language Model is a sophisticated mathematical function that predicts what word is most likely to come next..."',
        keyTakeaways: [
          'Text generation happens token-by-token in a loop.',
          'Sampling temperature controls creativity vs determinism.',
        ],
        bridgeQuestion: 'How does software learn to write like a human?',
        bridgeText:
          'It all begins with a deceptively simple probability game: predicting the very next word in a sequence.',
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
          'Now that we know it predicts tokens, Andrej Karpathy reveals what a trained model really looks like on disk.',
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
          'Now we jump into the Transformer heart: how words dynamically update their meaning based on surrounding context.',
        transcriptExcerpt:
          '"The attention mechanism allows token embeddings to pass information to each other and update their meaning in context..."',
        keyTakeaways: [
          'Words start as static embeddings and become context-rich vectors.',
          'Multiple attention heads track different linguistic relationships in parallel.',
        ],
        bridgeQuestion: 'How does a model grasp meaning across a whole sentence?',
        bridgeText:
          'A word changes meaning depending on its neighbors. Next, 3Blue1Brown visualizes the Attention mechanism at work.',
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
          'We conclude with the crucial fine-tuning stage that transforms a text-completer into an instruction-following assistant.',
        transcriptExcerpt:
          '"Fine-tuning shifts the distribution toward helpful assistant Q&A while preserving the world knowledge learned during pre-training..."',
        keyTakeaways: [
          'Knowledge comes from pre-training.',
          'Assistant behavior comes from supervised fine-tuning & RLHF.',
        ],
        bridgeQuestion: 'From raw text predictor to helpful AI assistant?',
        bridgeText:
          'In our final chapter, we return to Karpathy to see how fine-tuning turns raw compressed knowledge into a conversational partner.',
        enabled: true,
      },
    ],
  };
}
