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
      synthesisTitle: 'Πώς σκέφτονται και προβλέπουν τα Large Language Models',
      executiveSummary:
        'Ένα συνθετικό οδοιπορικό σε 4 κεφάλαια από κορυφαίους δημιουργούς (3Blue1Brown & Andrej Karpathy): από τη βασική πρόβλεψη της επόμενης λέξης, στη συμπίεση γνώσης κατά το pre-training, μέχρι τον μηχανισμό Attention και το fine-tuning που μετατρέπει ένα μοντέλο σε βοηθό.',
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
            'Η πιο καθαρή οπτική εξήγηση του πώς ένα LLM παράγει κείμενο: υπολογίζει πιθανότητες για κάθε επόμενη λέξη.',
          detailedSummary:
            'Ο Grant Sanderson από το κανάλι 3Blue1Brown αποδομεί τη φαινομενική μαγεία των Large Language Models στον πυρήνα της: δεδομένης μιας αρχικής ακολουθίας κειμένου, το μοντέλο εκτιμά την πιθανότητα κάθε πιθανής επόμενης λέξης (token). Διαλέγοντας μία από τις πιο πιθανές λέξεις και επαναλαμβάνοντας αυτή τη διαδικασία ξανά και ξανά, χτίζει ολόκληρες συνεκτικές παραγράφους. Η μικρή δόση τυχαιότητας (temperature) επιτρέπει στο σύστημα να μην επαναλαμβάνει μηχανικά την ίδια φράση, αλλά να παράγει φυσικό και δημιουργικό λόγο.',
          transcriptExcerpt:
            '«Ένα Large Language Model είναι ένα εξελιγμένο μαθηματικό μοντέλο που προβλέπει ποια λέξη είναι πιο πιθανό να ακολουθήσει...»',
          keyTakeaways: [
            'Η παραγωγή κειμένου γίνεται επαναληπτικά token-by-token (λέξη-λέξη).',
            'Η κατανομή πιθανοτήτων και το temperature δίνουν φυσικότητα και ποικιλία.',
          ],
          bridgeQuestion: 'Πώς καταφέρνει ένα πρόγραμμα να γράφει σαν άνθρωπος;',
          bridgeText:
            'Ο Grant από το κανάλι 3Blue1Brown μας εξηγεί πώς όλα ξεκινούν από ένα απλό παιχνίδι πιθανοτήτων.',
          introSlides: [
            {
              kind: 'title',
              eyebrow: 'AIVIDEON ΝΤΟΚΙΜΑΝΤΕΡ',
              headline: 'Μέσα στο μυαλό ενός LLM',
              body: 'Τι συμβαίνει στ’ αλήθεια κάθε φορά που μια τεχνητή νοημοσύνη γράφει μια πρόταση;',
            },
            {
              kind: 'narrative',
              eyebrow: 'ΜΕΡΟΣ 01 · 3BLUE1BROWN',
              headline: 'Πώς καταφέρνει ένα πρόγραμμα να γράφει σαν άνθρωπος;',
              body: 'Ο Grant από το κανάλι 3Blue1Brown μας δείχνει πώς όλα ξεκινούν από ένα φαινομενικά απλό παιχνίδι: την πρόβλεψη της επόμενης λέξης.',
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
            'Ο Andrej Karpathy αποκαλύπτει τι είναι στην πραγματικότητα ένα εκπαιδευμένο μοντέλο στον δίσκο.',
          detailedSummary:
            'Ο Andrej Karpathy εξηγεί με απόλυτη τεχνική σαφήνεια ότι ένα εκπαιδευμένο LLM αποτελείται στην ουσία από μόλις δύο αρχεία: ένα μεγάλο αρχείο με τις παραμέτρους (weights) του νευρωνικού δικτύου — π.χ. ~140 GB για ένα μοντέλο 70 δισεκατομμυρίων παραμέτρων — και ένα μικρό αρχείο κώδικα (περίπου 500 γραμμές C ή Python) που εκτελεί τους πολλαπλασιασμούς. Δεν απαιτείται σύνδεση στο διαδίκτυο για να τρέξει (inference), καθώς όλη η γνώση έχει ήδη συμπιεστεί μέσα σε αυτά τα weights κατά την εξαιρετικά απαιτητική φάση του pre-training.',
          transcriptExcerpt:
            '«Χρειάζεσαι μόνο δύο αρχεία για να τρέξεις ένα LLM: το αρχείο με τις παραμέτρους και τον κώδικα C/Python που εκτελεί το νευρωνικό δίκτυο...»',
          keyTakeaways: [
            'Ένα μοντέλο είναι πρακτικά δύο αρχεία: τα weights και ο κώδικας εκτέλεσης.',
            'Η εκπαίδευση (pre-training) συμπιέζει terabytes κειμένου σε gigabytes παραμέτρων.',
            'Το inference είναι ελαφρύ, ενώ το training απαιτεί τεράστια υπολογιστική ισχύ.',
          ],
          bridgeQuestion: 'Ο Andrej Karpathy εξηγεί πού αποθηκεύεται όλη αυτή η γνώση',
          bridgeText:
            'Ένα μοντέλο που προβλέπει λέξεις χρειάζεται μνήμη. Ο Andrej Karpathy αποκαλύπτει τα μόλις δύο αρχεία που κρύβονται στον δίσκο.',
          introSlides: [
            {
              kind: 'question',
              eyebrow: 'ΜΕΡΟΣ 02',
              headline: 'Πού αποθηκεύεται όμως όλη η γνώση του διαδικτύου;',
              body: 'Είδαμε πώς διαλέγει την επόμενη λέξη. Για να απαντά σωστά όμως, πρέπει να έχει απορροφήσει δισεκατομμύρια σελίδες.',
            },
            {
              kind: 'narrative',
              eyebrow: 'ANDREJ KARPATHY',
              headline: 'Ο Andrej Karpathy εξηγεί τι είναι στ’ αλήθεια ένα LLM',
              body: 'Μέσα από ένα απτό παράδειγμα, μας δείχνει τα δύο αρχεία που αρκούν για να ζωντανέψει ολόκληρο το δίκτυο.',
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
            'Πώς η ίδια λέξη αποκτά διαφορετικό νόημα ανάλογα με τις γύρω λέξεις χάρη στον μηχανισμό Attention.',
          detailedSummary:
            'Επιστρέφοντας στο 3Blue1Brown, βλέπουμε οπτικά γιατί η αρχιτεκτονική Transformer έφερε επανάσταση. Κάθε λέξη μπαίνει αρχικά στο μοντέλο ως ένα στατικό διάνυσμα (embedding), χωρίς να ξέρει τι υπάρχει γύρω της. Ο μηχανισμός Attention επιτρέπει σε όλες τις λέξεις μιας πρότασης να «κοιτάζουν» η μία την άλλη και να ανταλλάσσουν πληροφορία, μετατοπίζοντας το διάνυσμα κάθε λέξης ώστε να αποτυπώνει το ακριβές νόημά της μέσα στα συγκεκριμένα συμφραζόμενα.',
          transcriptExcerpt:
            '«Ο μηχανισμός Attention επιτρέπει στα διανύσματα (embeddings) να ανταλλάσσουν πληροφορία και να ενημερώνουν το νόημά τους βάσει συμφραζομένων...»',
          keyTakeaways: [
            'Κάθε λέξη ξεκινά ως στατικό vector και εμπλουτίζεται δυναμικά από το context.',
            'Τα πολλαπλά Attention heads παρακολουθούν διαφορετικές σημασιολογικές σχέσεις ταυτόχρονα.',
          ],
          bridgeQuestion: 'Το κανάλι 3Blue1Brown οπτικοποιεί τη μαγεία του Attention',
          bridgeText:
            'Μια λέξη αλλάζει νόημα ανάλογα με την πρόταση. Το 3Blue1Brown μας δείχνει πώς οι λέξεις συνομιλούν μεταξύ τους.',
          introSlides: [
            {
              kind: 'question',
              eyebrow: 'ΜΕΡΟΣ 03',
              headline: 'Πώς καταλαβαίνει το νόημα πίσω από τις λέξεις;',
              body: 'Η ίδια λέξη μπορεί να σημαίνει εντελώς διαφορετικά πράγματα ανάλογα με την πρόταση.',
            },
            {
              kind: 'narrative',
              eyebrow: '3BLUE1BROWN',
              headline: 'Το κανάλι 3Blue1Brown οπτικοποιεί τον μηχανισμό Attention',
              body: 'Δείτε πώς τα διανύσματα των λέξεων ανταλλάσσουν συμφραζόμενα μέσα σε έναν Transformer.',
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
            'Το κρίσιμο στάδιο του fine-tuning που μετατρέπει ένα μοντέλο πρόβλεψης σε χρήσιμο βοηθό.',
          detailedSummary:
            'Στο τελευταίο στάδιο, ο Andrej Karpathy περιγράφει τη διαφορά ανάμεσα σε ένα «base model» και έναν πραγματικό AI Assistant. Μετά το pre-training, το μοντέλο ξέρει πάρα πολλά αλλά απλώς συνεχίζει έγγραφα του διαδικτύου. Με το fine-tuning, εκπαιδεύεται πάνω σε προσεκτικά επιμελημένους διαλόγους ερώτησης-απάντησης (και ενισχύεται με ανθρώπινη αξιολόγηση / RLHF), διατηρώντας όλη την αποθηκευμένη γνώση του αλλά υιοθετώντας πλέον το ύφος, την ακρίβεια και τη χρησιμότητα ενός ψηφιακού βοηθού.',
          transcriptExcerpt:
            '«Το fine-tuning αλλάζει τη μορφή των δεδομένων σε ερωτήσεις-απαντήσεις βοηθού, διατηρώντας όλη τη γνώση του pre-training...»',
          keyTakeaways: [
            'Η παγκόσμια γνώση προέρχεται από το pre-training.',
            'Η συμπεριφορά "βοηθού" προέρχεται από το fine-tuning και το RLHF.',
          ],
          bridgeQuestion: 'Ο Andrej Karpathy αναλύει τη μεταμόρφωση σε AI Assistant',
          bridgeText:
            'Έχουμε γνώση και συμφραζόμενα. Πώς όμως το μοντέλο μαθαίνει να απαντά στις ερωτήσεις μας;',
          introSlides: [
            {
              kind: 'narrative',
              eyebrow: 'ΜΕΡΟΣ 04 · ANDREJ KARPATHY',
              headline: 'Ο Andrej Karpathy αναλύει το τελευταίο βήμα: το Fine-tuning',
              body: 'Ένα ακατέργαστο μοντέλο απλώς συνεχίζει κείμενα. Δείτε πώς το fine-tuning το μεταμορφώνει στον βοηθό με τον οποίο συνομιλούμε.',
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
    synthesisTitle: 'How Large Language Models Think & Predict',
    executiveSummary:
      'A 4-chapter visual documentary synthesized from top creators (3Blue1Brown & Andrej Karpathy): covering next-token prediction, pre-training as internet compression, the Attention mechanism, and assistant fine-tuning.',
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
          'The clearest visual intuition of how an LLM generates text: computing probabilities for what comes next.',
        detailedSummary:
          'Grant Sanderson from 3Blue1Brown distills the seeming magic of Large Language Models down to its mathematical foundation: given a snippet of text, the network predicts a probability distribution over every possible next word (token). By sampling one of the likely candidates and feeding it back in repeatedly, coherent paragraphs emerge. A controlled touch of randomness (temperature) keeps responses natural rather than robotic.',
        transcriptExcerpt:
          '"A Large Language Model is a sophisticated mathematical function that predicts what word is most likely to come next..."',
        keyTakeaways: [
          'Text generation happens iteratively token-by-token.',
          'Sampling temperature balances creativity against determinism.',
        ],
        bridgeQuestion: 'How does software learn to write like a human?',
        bridgeText:
          'Grant from 3Blue1Brown breaks down how everything begins with predicting the very next word.',
        introSlides: [
          {
            kind: 'title',
            eyebrow: 'AIVIDEON DOCUMENTARY',
            headline: 'Inside the Mind of an LLM',
            body: 'What is really happening behind the screen every time an AI writes a sentence?',
          },
          {
            kind: 'narrative',
            eyebrow: 'PART 01 · 3BLUE1BROWN',
            headline: 'How does software learn to write like a human?',
            body: 'Grant from 3Blue1Brown shows how it all starts with a deceptively simple probability game: predicting the next word.',
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
          'Andrej Karpathy breaks down what a trained LLM actually is on disk: just two files.',
        detailedSummary:
          'Andrej Karpathy demystifies what a trained LLM actually looks like on a computer: just two files. The first is a large binary file holding the neural network parameters (weights) — around 140 GB for a 70-billion-parameter model — and the second is roughly 500 lines of C or Python code that runs the math. No internet connection is needed during inference because internet-scale knowledge has already been lossily compressed into those weights during pre-training.',
        transcriptExcerpt:
          '"You only need two files to run an LLM: the parameters file and a short C/Python file implementing the neural net architecture..."',
        keyTakeaways: [
          'A standalone LLM is literally two files: weights and a short run script.',
          'Pre-training compresses terabytes of text into gigabytes of parameters.',
          'Inference is lightweight compared to the massive compute of training.',
        ],
        bridgeQuestion: 'Andrej Karpathy reveals where all that knowledge lives',
        bridgeText:
          'Predicting words well requires memory — Andrej Karpathy shows the two files sitting on disk.',
        introSlides: [
          {
            kind: 'question',
            eyebrow: 'PART 02',
            headline: 'Where does all that world knowledge actually live?',
            body: 'Choosing the right next word requires absorbing billions of pages of human writing.',
          },
          {
            kind: 'narrative',
            eyebrow: 'ANDREJ KARPATHY',
            headline: 'Andrej Karpathy explains what an LLM really is on disk',
            body: 'With concrete numbers, he walks through the two self-contained files that power the entire network.',
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
          'How words dynamically update their meaning based on surrounding context via Attention.',
        detailedSummary:
          'Returning to 3Blue1Brown, we see visually why the Transformer architecture changed AI forever. Every token initially enters the network as a static vector (embedding) unaware of its neighbors. The Attention mechanism lets words pass information to one another across the sequence, nudging each embedding toward its exact contextual meaning within the sentence.',
        transcriptExcerpt:
          '"The attention mechanism allows token embeddings to pass information to each other and update their meaning in context..."',
        keyTakeaways: [
          'Words start as static embeddings and become context-rich vectors.',
          'Multiple attention heads track different linguistic relationships in parallel.',
        ],
        bridgeQuestion: '3Blue1Brown visualizes how Attention unlocks context',
        bridgeText:
          'A single word changes meaning depending on its neighbors — 3Blue1Brown shows how Attention solves it.',
        introSlides: [
          {
            kind: 'question',
            eyebrow: 'PART 03',
            headline: 'How does a model grasp meaning across a whole sentence?',
            body: 'The same word can mean entirely different things depending on the words around it.',
          },
          {
            kind: 'narrative',
            eyebrow: '3BLUE1BROWN',
            headline: '3Blue1Brown visualizes the Attention mechanism',
            body: 'Watch how token vectors exchange information so every word resolves its true meaning in context.',
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
          'The fine-tuning stage that transforms a raw text-completer into an instruction-following assistant.',
        detailedSummary:
          'In the closing chapter, Andrej Karpathy explains the crucial step between a raw base model and a conversational assistant. After pre-training, the model possesses vast knowledge but simply tries to continue internet documents. Fine-tuning trains it on curated human Q&A conversations (followed by human preference feedback / RLHF), preserving its broad pre-trained knowledge while shaping its behavior into a helpful, accurate assistant.',
        transcriptExcerpt:
          '"Fine-tuning shifts the distribution toward helpful assistant Q&A while preserving the world knowledge learned during pre-training..."',
        keyTakeaways: [
          'World knowledge comes from pre-training.',
          'Helpful assistant behavior comes from supervised fine-tuning & RLHF.',
        ],
        bridgeQuestion: 'Andrej Karpathy explains the transformation into an assistant',
        bridgeText:
          'A base model merely completes documents — one final training phase changes how it speaks to us.',
        introSlides: [
          {
            kind: 'narrative',
            eyebrow: 'PART 04 · ANDREJ KARPATHY',
            headline: 'Andrej Karpathy explains the final step: Fine-tuning',
            body: 'We have compressed knowledge and context — here is how a raw text predictor becomes a helpful AI assistant.',
          },
        ],
        enabled: true,
      },
    ],
  };
}
