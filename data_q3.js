// ============================================================
// data_q3.js — 3周目 他者視点の質問（10問）
//
// ★ 質問文を直したいとき ★
//   text: "〜" の「〜」の部分だけを書き換えてください。
//   「周りからどう言われるか」を聞く形を保ってください。
//   score の数字と、記号（{ } , " など）は変えないでください。
//
// 仕組みのメモ（触らなくてOK）:
//   SPEC.md 2.5 準拠。各軸2問（うち1問は反転質問）。配列は軸ごとにまとめる。
//   score は第1文字側（E/S/T/J/A）に寄るほど 1.0。反転質問は逆順に割り付け。
// ============================================================

const QUESTIONS_ROUND3 = [
  // ---- EI ----
  {
    id: "r3_ei_1",
    axis: "EI",
    round: 3,
    tag: null,
    text: "初対面の人から「社交的だね」「誰とでもすぐ打ち解けるね」と言われることがある",
    options: [
      { label: "よく言われる", score: 1.0 },
      { label: "ときどき言われる", score: 0.75 },
      { label: "言われたことはある", score: 0.5 },
      { label: "ほとんど言われない", score: 0.25 },
      { label: "言われたことがない", score: 0.0 }
    ]
  },
  {
    // 反転質問（I側の聞き方）
    id: "r3_ei_2",
    axis: "EI",
    round: 3,
    tag: null,
    text: "周りの人から「物静かだね」「一人の時間が好きそうだね」と言われることがある",
    options: [
      { label: "よく言われる", score: 0.0 },
      { label: "ときどき言われる", score: 0.25 },
      { label: "言われたことはある", score: 0.5 },
      { label: "ほとんど言われない", score: 0.75 },
      { label: "言われたことがない", score: 1.0 }
    ]
  },

  // ---- SN ----
  {
    id: "r3_sn_1",
    axis: "SN",
    round: 3,
    tag: null,
    text: "周りの人から「現実的だね」「地に足がついているね」と言われることがある",
    options: [
      { label: "よく言われる", score: 1.0 },
      { label: "ときどき言われる", score: 0.75 },
      { label: "言われたことはある", score: 0.5 },
      { label: "ほとんど言われない", score: 0.25 },
      { label: "言われたことがない", score: 0.0 }
    ]
  },
  {
    // 反転質問（N側の聞き方）
    id: "r3_sn_2",
    axis: "SN",
    round: 3,
    tag: null,
    text: "友達から「発想が独特だね」「そんなこと考えたことなかった」と言われることがある",
    options: [
      { label: "よく言われる", score: 0.0 },
      { label: "ときどき言われる", score: 0.25 },
      { label: "言われたことはある", score: 0.5 },
      { label: "ほとんど言われない", score: 0.75 },
      { label: "言われたことがない", score: 1.0 }
    ]
  },

  // ---- TF ----
  {
    id: "r3_tf_1",
    axis: "TF",
    round: 3,
    tag: null,
    text: "周りの人から「冷静だね」「ちょっと理屈っぽいね」と言われることがある",
    options: [
      { label: "よく言われる", score: 1.0 },
      { label: "ときどき言われる", score: 0.75 },
      { label: "言われたことはある", score: 0.5 },
      { label: "ほとんど言われない", score: 0.25 },
      { label: "言われたことがない", score: 0.0 }
    ]
  },
  {
    // 反転質問（F側の聞き方）
    id: "r3_tf_2",
    axis: "TF",
    round: 3,
    tag: null,
    text: "友達から「気持ちをわかってくれるね」「相談しやすい」と言われることがある",
    options: [
      { label: "よく言われる", score: 0.0 },
      { label: "ときどき言われる", score: 0.25 },
      { label: "言われたことはある", score: 0.5 },
      { label: "ほとんど言われない", score: 0.75 },
      { label: "言われたことがない", score: 1.0 }
    ]
  },

  // ---- JP ----
  {
    id: "r3_jp_1",
    axis: "JP",
    round: 3,
    tag: null,
    text: "友達から「計画的だね」「きっちりしてるね」と言われることがある",
    options: [
      { label: "よく言われる", score: 1.0 },
      { label: "ときどき言われる", score: 0.75 },
      { label: "言われたことはある", score: 0.5 },
      { label: "ほとんど言われない", score: 0.25 },
      { label: "言われたことがない", score: 0.0 }
    ]
  },
  {
    // 反転質問（P側の聞き方）
    id: "r3_jp_2",
    axis: "JP",
    round: 3,
    tag: null,
    text: "周りの人から「行き当たりばったりだね」「自由だね」と言われることがある",
    options: [
      { label: "よく言われる", score: 0.0 },
      { label: "ときどき言われる", score: 0.25 },
      { label: "言われたことはある", score: 0.5 },
      { label: "ほとんど言われない", score: 0.75 },
      { label: "言われたことがない", score: 1.0 }
    ]
  },

  // ---- AT ----
  {
    id: "r3_at_1",
    axis: "AT",
    round: 3,
    tag: null,
    text: "周りの人から「堂々としてるね」「物おじしないね」と言われることがある",
    options: [
      { label: "よく言われる", score: 1.0 },
      { label: "ときどき言われる", score: 0.75 },
      { label: "言われたことはある", score: 0.5 },
      { label: "ほとんど言われない", score: 0.25 },
      { label: "言われたことがない", score: 0.0 }
    ]
  },
  {
    // 反転質問（T=Turbulent側の聞き方）
    id: "r3_at_2",
    axis: "AT",
    round: 3,
    tag: null,
    text: "友達から「心配性だね」「そんなに気にしなくていいのに」と言われることがある",
    options: [
      { label: "よく言われる", score: 0.0 },
      { label: "ときどき言われる", score: 0.25 },
      { label: "言われたことはある", score: 0.5 },
      { label: "ほとんど言われない", score: 0.75 },
      { label: "言われたことがない", score: 1.0 }
    ]
  }
];
