// ══════════════════════════════════════════
//  BASIC STRATEGY CHARTS
// ══════════════════════════════════════════
// Actions: H=Hit, S=Stand, D=Double(hit if can't), Ds=Double(stand if can't),
//          P=Split, Ph=Split(hit if can't), Rh=Surrender(hit if can't)
// Dealer upcard index: 0=2, 1=3, 2=4, 3=5, 4=6, 5=7, 6=8, 7=9, 8=10, 9=A

const DEALER_CARDS = ['2','3','4','5','6','7','8','9','10','A'];

const HARD_STRATEGY = {
  5:  ['H','H','H','H','H','H','H','H','H','H'],
  6:  ['H','H','H','H','H','H','H','H','H','H'],
  7:  ['H','H','H','H','H','H','H','H','H','H'],
  8:  ['H','H','H','H','H','H','H','H','H','H'],
  9:  ['H','D','D','D','D','H','H','H','H','H'],
  10: ['D','D','D','D','D','D','D','D','H','H'],
  11: ['D','D','D','D','D','D','D','D','D','D'],
  12: ['H','H','S','S','S','H','H','H','H','H'],
  13: ['S','S','S','S','S','H','H','H','H','H'],
  14: ['S','S','S','S','S','H','H','H','H','H'],
  15: ['S','S','S','S','S','H','H','H','Rh','Rh'],
  16: ['S','S','S','S','S','H','H','Rh','Rh','Rh'],
  17: ['S','S','S','S','S','S','S','S','S','S'],
  18: ['S','S','S','S','S','S','S','S','S','S'],
  19: ['S','S','S','S','S','S','S','S','S','S'],
  20: ['S','S','S','S','S','S','S','S','S','S'],
  21: ['S','S','S','S','S','S','S','S','S','S'],
};

const SOFT_STRATEGY = {
  13: ['H','H','H','D','D','H','H','H','H','H'],
  14: ['H','H','H','D','D','H','H','H','H','H'],
  15: ['H','H','D','D','D','H','H','H','H','H'],
  16: ['H','H','D','D','D','H','H','H','H','H'],
  17: ['H','D','D','D','D','H','H','H','H','H'],
  18: ['Ds','Ds','Ds','Ds','Ds','S','S','H','H','H'],
  19: ['S','S','S','S','Ds','S','S','S','S','S'],
  20: ['S','S','S','S','S','S','S','S','S','S'],
  21: ['S','S','S','S','S','S','S','S','S','S'],
};

const PAIR_STRATEGY = {
  'A': ['P','P','P','P','P','P','P','P','P','P'],
  '2': ['Ph','Ph','P','P','P','P','H','H','H','H'],
  '3': ['Ph','Ph','P','P','P','P','H','H','H','H'],
  '4': ['H','H','H','Ph','Ph','H','H','H','H','H'],
  '5': ['D','D','D','D','D','D','D','D','H','H'],
  '6': ['Ph','P','P','P','P','H','H','H','H','H'],
  '7': ['P','P','P','P','P','P','H','H','H','H'],
  '8': ['P','P','P','P','P','P','P','P','P','P'],
  '9': ['P','P','P','P','P','S','P','P','S','S'],
  '10': ['S','S','S','S','S','S','S','S','S','S'],
};

const ACTION_INFO = {
  H:  { label: 'Hit',       desc: 'Take another card' },
  S:  { label: 'Stand',     desc: 'Keep your hand' },
  D:  { label: 'Double',    desc: 'Double bet, take one card (hit if not allowed)' },
  Ds: { label: 'Double/Stand', desc: 'Double bet (stand if not allowed)' },
  P:  { label: 'Split',     desc: 'Split into two hands' },
  Ph: { label: 'Split/Hit', desc: 'Split if double-after-split allowed (else hit)' },
  Rh: { label: 'Surrender/Hit', desc: 'Surrender half bet (hit if not allowed)' },
};

// ══════════════════════════════════════════
//  CARD CONSTANTS
// ══════════════════════════════════════════
const SUITS = ['hearts','diamonds','clubs','spades'];
const SUIT_SYMBOLS = { hearts:'\u2665', diamonds:'\u2666', clubs:'\u2663', spades:'\u2660' };
const SUIT_COLORS = { hearts:'#ef4444', diamonds:'#ef4444', clubs:'#1e293b', spades:'#1e293b' };
const CARD_VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

// ══════════════════════════════════════════
//  QUIZ QUESTIONS BANK (categorized)
// ══════════════════════════════════════════
const QUIZ_QUESTIONS = [
  // ── Hard totals ──
  { cat:'hard', q:"You have 16, dealer shows 10. What do you do?", hand:"Hard 16", dealer:"10", playerCards:['9','7'], dealerUp:'10', correct:"Rh", hint:"The worst hand vs the worst upcard. Surrender if allowed, otherwise hit." },
  { cat:'hard', q:"You have 11, dealer shows 6. What do you do?", hand:"Hard 11", dealer:"6", playerCards:['8','3'], dealerUp:'6', correct:"D", hint:"11 is the best doubling hand. Double against anything." },
  { cat:'hard', q:"You have 12, dealer shows 4. What do you do?", hand:"Hard 12", dealer:"4", playerCards:['10','2'], dealerUp:'4', correct:"S", hint:"Dealer 4–6 is weak. Stand on 12 and let them bust." },
  { cat:'hard', q:"You have 12, dealer shows 2. What do you do?", hand:"Hard 12", dealer:"2", playerCards:['10','2'], dealerUp:'2', correct:"H", hint:"12 vs 2 or 3 — hit! Only stand on 12 vs 4–6." },
  { cat:'hard', q:"You have 12, dealer shows 3. What do you do?", hand:"Hard 12", dealer:"3", playerCards:['7','5'], dealerUp:'3', correct:"H", hint:"12 vs 3 — still hit. Dealer 3 isn't weak enough." },
  { cat:'hard', q:"You have 13, dealer shows 7. What do you do?", hand:"Hard 13", dealer:"7", playerCards:['10','3'], dealerUp:'7', correct:"H", hint:"Dealer 7+ is strong. Hit your stiff hand." },
  { cat:'hard', q:"You have 15, dealer shows Ace. What do you do?", hand:"Hard 15", dealer:"A", playerCards:['10','5'], dealerUp:'A', correct:"Rh", hint:"Surrender 15 vs 10 and Ace." },
  { cat:'hard', q:"You have 10, dealer shows 9. What do you do?", hand:"Hard 10", dealer:"9", playerCards:['6','4'], dealerUp:'9', correct:"D", hint:"Double 10 vs 2–9." },
  { cat:'hard', q:"You have 10, dealer shows Ace. What do you do?", hand:"Hard 10", dealer:"A", playerCards:['7','3'], dealerUp:'A', correct:"H", hint:"Don't double 10 vs 10 or Ace — just hit." },
  { cat:'hard', q:"You have 9, dealer shows 3. What do you do?", hand:"Hard 9", dealer:"3", playerCards:['5','4'], dealerUp:'3', correct:"D", hint:"Double 9 vs 3–6." },
  { cat:'hard', q:"You have 9, dealer shows 2. What do you do?", hand:"Hard 9", dealer:"2", playerCards:['6','3'], dealerUp:'2', correct:"H", hint:"9 vs 2 — just hit. Only double 9 vs 3–6." },
  { cat:'hard', q:"You have 17, dealer shows 10. What do you do?", hand:"Hard 17", dealer:"10", playerCards:['10','7'], dealerUp:'10', correct:"S", hint:"Always stand on hard 17+. Never hit." },
  { cat:'hard', q:"You have 16, dealer shows 9. What do you do?", hand:"Hard 16", dealer:"9", playerCards:['10','6'], dealerUp:'9', correct:"Rh", hint:"Surrender 16 vs 9, 10, A." },
  { cat:'hard', q:"You have 11, dealer shows Ace. What do you do?", hand:"Hard 11", dealer:"A", playerCards:['8','3'], dealerUp:'A', correct:"D", hint:"Double 11 vs everything — even the Ace." },
  { cat:'hard', q:"You have 14, dealer shows 6. What do you do?", hand:"Hard 14", dealer:"6", playerCards:['8','6'], dealerUp:'6', correct:"S", hint:"Stand 13–16 vs dealer 2–6. Let the weak dealer bust." },
  { cat:'hard', q:"You have 8, dealer shows 6. What do you do?", hand:"Hard 8", dealer:"6", playerCards:['5','3'], dealerUp:'6', correct:"H", hint:"Always hit 8 or less. No doubling." },
  { cat:'hard', q:"You have 15, dealer shows 10. What do you do?", hand:"Hard 15", dealer:"10", playerCards:['9','6'], dealerUp:'10', correct:"Rh", hint:"Surrender 15 vs 10 (and Ace). Hit if surrender isn't available." },

  // ── Soft totals ──
  { cat:'soft', q:"You have A-7 (soft 18), dealer shows 9. What do you do?", hand:"Soft 18", dealer:"9", playerCards:['A','7'], dealerUp:'9', correct:"H", hint:"Soft 18 vs 9, 10, A — hit! 18 isn't strong enough against these." },
  { cat:'soft', q:"You have A-7 (soft 18), dealer shows 6. What do you do?", hand:"Soft 18", dealer:"6", playerCards:['A','7'], dealerUp:'6', correct:"Ds", hint:"Double soft 18 vs 2–6. Stand if can't double." },
  { cat:'soft', q:"You have A-7 (soft 18), dealer shows 2. What do you do?", hand:"Soft 18", dealer:"2", playerCards:['A','7'], dealerUp:'2', correct:"Ds", hint:"Double soft 18 vs 2. Stand if can't double." },
  { cat:'soft', q:"You have A-7 (soft 18), dealer shows 7. What do you do?", hand:"Soft 18", dealer:"7", playerCards:['A','7'], dealerUp:'7', correct:"S", hint:"Soft 18 vs 7–8 — stand. Your 18 ties or beats them." },
  { cat:'soft', q:"You have A-6 (soft 17), dealer shows 5. What do you do?", hand:"Soft 17", dealer:"5", playerCards:['A','6'], dealerUp:'5', correct:"D", hint:"Double soft 17 vs 3–6." },
  { cat:'soft', q:"You have A-6 (soft 17), dealer shows 2. What do you do?", hand:"Soft 17", dealer:"2", playerCards:['A','6'], dealerUp:'2', correct:"H", hint:"Soft 17 vs 2 — hit only. Double vs 3–6." },
  { cat:'soft', q:"You have A-6 (soft 17), dealer shows 7. What do you do?", hand:"Soft 17", dealer:"7", playerCards:['A','6'], dealerUp:'7', correct:"H", hint:"Never stand on soft 17. Always hit or double." },
  { cat:'soft', q:"You have A-5 (soft 16), dealer shows 4. What do you do?", hand:"Soft 16", dealer:"4", playerCards:['A','5'], dealerUp:'4', correct:"D", hint:"Double soft 15–16 vs 4–6." },
  { cat:'soft', q:"You have A-2 (soft 13), dealer shows 5. What do you do?", hand:"Soft 13", dealer:"5", playerCards:['A','2'], dealerUp:'5', correct:"D", hint:"Double soft 13–14 vs 5–6." },
  { cat:'soft', q:"You have A-8 (soft 19), dealer shows 6. What do you do?", hand:"Soft 19", dealer:"6", playerCards:['A','8'], dealerUp:'6', correct:"Ds", hint:"Double soft 19 vs 6 if allowed, otherwise stand." },
  { cat:'soft', q:"You have A-3 (soft 14), dealer shows 4. What do you do?", hand:"Soft 14", dealer:"4", playerCards:['A','3'], dealerUp:'4', correct:"H", hint:"Soft 13–14 only double vs 5–6. Hit vs 4." },
  { cat:'soft', q:"You have A-4 (soft 15), dealer shows 3. What do you do?", hand:"Soft 15", dealer:"3", playerCards:['A','4'], dealerUp:'3', correct:"H", hint:"Soft 15 only doubles vs 4–6. Hit vs 3." },

  // ── Pairs ──
  { cat:'pairs', q:"You have 8-8, dealer shows 10. What do you do?", hand:"Pair 8s", dealer:"10", playerCards:['8','8'], dealerUp:'10', correct:"P", hint:"Always split 8s. 16 is terrible — two 8s give you a fresh start." },
  { cat:'pairs', q:"You have A-A, dealer shows 8. What do you do?", hand:"Pair As", dealer:"8", playerCards:['A','A'], dealerUp:'8', correct:"P", hint:"Always split Aces. Two chances at 21." },
  { cat:'pairs', q:"You have 10-10, dealer shows 5. What do you do?", hand:"Pair 10s", dealer:"5", playerCards:['K','10'], dealerUp:'5', correct:"S", hint:"Never split 10s. 20 is too good to break up." },
  { cat:'pairs', q:"You have 5-5, dealer shows 8. What do you do?", hand:"Pair 5s", dealer:"8", playerCards:['5','5'], dealerUp:'8', correct:"D", hint:"Never split 5s. You have 10 — double it!" },
  { cat:'pairs', q:"You have 9-9, dealer shows 7. What do you do?", hand:"Pair 9s", dealer:"7", playerCards:['9','9'], dealerUp:'7', correct:"S", hint:"Stand 9-9 vs 7. Your 18 beats dealer's likely 17." },
  { cat:'pairs', q:"You have 9-9, dealer shows 6. What do you do?", hand:"Pair 9s", dealer:"6", playerCards:['9','9'], dealerUp:'6', correct:"P", hint:"Split 9-9 vs 2–6 and 8–9. Stand vs 7, 10, A." },
  { cat:'pairs', q:"You have 6-6, dealer shows 3. What do you do?", hand:"Pair 6s", dealer:"3", playerCards:['6','6'], dealerUp:'3', correct:"P", hint:"Split 6-6 vs 3–6." },
  { cat:'pairs', q:"You have 4-4, dealer shows 5. What do you do?", hand:"Pair 4s", dealer:"5", playerCards:['4','4'], dealerUp:'5', correct:"Ph", hint:"Split 4-4 vs 5–6 only if double-after-split allowed." },
  { cat:'pairs', q:"You have 7-7, dealer shows 8. What do you do?", hand:"Pair 7s", dealer:"8", playerCards:['7','7'], dealerUp:'8', correct:"H", hint:"Hit 7-7 vs 8+. Only split 7-7 vs 2–7." },
  { cat:'pairs', q:"You have A-A, dealer shows Ace. What do you do?", hand:"Pair As", dealer:"A", playerCards:['A','A'], dealerUp:'A', correct:"P", hint:"Always split Aces. Even against an Ace." },
  { cat:'pairs', q:"You have 8-8, dealer shows Ace. What do you do?", hand:"Pair 8s", dealer:"A", playerCards:['8','8'], dealerUp:'A', correct:"P", hint:"Always split 8s. 16 is the worst — splitting is always better." },
  { cat:'pairs', q:"You have 10-10, dealer shows 6. What do you do?", hand:"Pair 10s", dealer:"6", playerCards:['J','Q'], dealerUp:'6', correct:"S", hint:"Never split 10s. Even against a weak 6, keep your 20." },
  { cat:'pairs', q:"You have 9-9, dealer shows 10. What do you do?", hand:"Pair 9s", dealer:"10", playerCards:['9','9'], dealerUp:'10', correct:"S", hint:"Stand 9-9 vs 7, 10, A. Your 18 is good enough to hold." },
];
