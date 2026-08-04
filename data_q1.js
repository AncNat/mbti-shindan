// ============================================================
// data_q1.js — 1周目 自己認識の質問（10問）
//
// ★ 質問文を直したいとき ★
//   text: "〜" の「〜」の部分だけを書き換えてください。
//   選択肢の文章は label: "〜" の部分です。
//   score の数字と、それ以外の記号（{ } , " など）は変えないでください。
//
// 仕組みのメモ（触らなくてOK）:
//   SPEC.md 2.2 / 2.3 準拠。5段階Likert固定。
//   各軸2問のうち1問目は第1文字側（E/S/T/J/A）の聞き方、
//   2問目は第2文字側（I/N/F/P/T）の聞き方で score を反転している。
// ============================================================

const QUESTIONS_ROUND1 = [
  {
    id: "r1_ei_1",
    axis: "EI",
    round: 1,
    tag: null,
    text: "人と集まってワイワイ過ごしたあとは、疲れるどころかむしろ元気が出ている方だ。",
    options: [
      { label: "とてもあてはまる", score: 1.0 },
      { label: "ややあてはまる", score: 0.75 },
      { label: "どちらともいえない", score: 0.5 },
      { label: "あまりあてはまらない", score: 0.25 },
      { label: "まったくあてはまらない", score: 0.0 }
    ]
  },
  {
    id: "r1_sn_1",
    axis: "SN",
    round: 1,
    tag: null,
    text: "説明を聞くときは、たとえ話やイメージよりも、具体的な手順や実例のほうが頭に入る方だ。",
    options: [
      { label: "とてもあてはまる", score: 1.0 },
      { label: "ややあてはまる", score: 0.75 },
      { label: "どちらともいえない", score: 0.5 },
      { label: "あまりあてはまらない", score: 0.25 },
      { label: "まったくあてはまらない", score: 0.0 }
    ]
  },
  {
    id: "r1_tf_1",
    axis: "TF",
    round: 1,
    tag: null,
    text: "悩みを相談されたとき、気持ちに寄り添うより先に「どうすれば解決するか」を考えてしまう方だ。",
    options: [
      { label: "とてもあてはまる", score: 1.0 },
      { label: "ややあてはまる", score: 0.75 },
      { label: "どちらともいえない", score: 0.5 },
      { label: "あまりあてはまらない", score: 0.25 },
      { label: "まったくあてはまらない", score: 0.0 }
    ]
  },
  {
    id: "r1_jp_1",
    axis: "JP",
    round: 1,
    tag: null,
    text: "旅行や外出は、行き先や時間をあらかじめ決めてから動く方だ。",
    options: [
      { label: "とてもあてはまる", score: 1.0 },
      { label: "ややあてはまる", score: 0.75 },
      { label: "どちらともいえない", score: 0.5 },
      { label: "あまりあてはまらない", score: 0.25 },
      { label: "まったくあてはまらない", score: 0.0 }
    ]
  },
  {
    id: "r1_at_1",
    axis: "AT",
    round: 1,
    tag: null,
    text: "失敗したりミスをしたりしても、あまり引きずらずに気持ちを切り替えられる方だ。",
    options: [
      { label: "とてもあてはまる", score: 1.0 },
      { label: "ややあてはまる", score: 0.75 },
      { label: "どちらともいえない", score: 0.5 },
      { label: "あまりあてはまらない", score: 0.25 },
      { label: "まったくあてはまらない", score: 0.0 }
    ]
  },
  {
    id: "r1_ei_2",
    axis: "EI",
    round: 1,
    tag: null,
    // I側の聞き方 → score反転
    text: "休みの日は、誰とも会わずに一人で自由に過ごしたいと思うことが多い。",
    options: [
      { label: "とてもあてはまる", score: 0.0 },
      { label: "ややあてはまる", score: 0.25 },
      { label: "どちらともいえない", score: 0.5 },
      { label: "あまりあてはまらない", score: 0.75 },
      { label: "まったくあてはまらない", score: 1.0 }
    ]
  },
  {
    id: "r1_sn_2",
    axis: "SN",
    round: 1,
    tag: null,
    // N側の聞き方 → score反転
    text: "目の前の作業をしている最中でも、「もしこうだったら」という空想や別のアイデアがふと浮かぶことが多い。",
    options: [
      { label: "とてもあてはまる", score: 0.0 },
      { label: "ややあてはまる", score: 0.25 },
      { label: "どちらともいえない", score: 0.5 },
      { label: "あまりあてはまらない", score: 0.75 },
      { label: "まったくあてはまらない", score: 1.0 }
    ]
  },
  {
    id: "r1_tf_2",
    axis: "TF",
    round: 1,
    tag: null,
    // F側の聞き方 → score反転
    text: "何かを言うとき、正しいかどうかよりも、相手が傷つかないかを優先して言葉を選ぶことが多い。",
    options: [
      { label: "とてもあてはまる", score: 0.0 },
      { label: "ややあてはまる", score: 0.25 },
      { label: "どちらともいえない", score: 0.5 },
      { label: "あまりあてはまらない", score: 0.75 },
      { label: "まったくあてはまらない", score: 1.0 }
    ]
  },
  {
    id: "r1_jp_2",
    axis: "JP",
    round: 1,
    tag: null,
    // P側の聞き方 → score反転
    text: "締め切りのある用事や課題は、ギリギリになってから一気に片付けることが多い。",
    options: [
      { label: "とてもあてはまる", score: 0.0 },
      { label: "ややあてはまる", score: 0.25 },
      { label: "どちらともいえない", score: 0.5 },
      { label: "あまりあてはまらない", score: 0.75 },
      { label: "まったくあてはまらない", score: 1.0 }
    ]
  },
  {
    id: "r1_at_2",
    axis: "AT",
    round: 1,
    tag: null,
    // T(Turbulent)側の聞き方 → score反転
    text: "自分の発言や行動が人からどう思われたか気になって、あとで何度も思い返してしまうことが多い。",
    options: [
      { label: "とてもあてはまる", score: 0.0 },
      { label: "ややあてはまる", score: 0.25 },
      { label: "どちらともいえない", score: 0.5 },
      { label: "あまりあてはまらない", score: 0.75 },
      { label: "まったくあてはまらない", score: 1.0 }
    ]
  }
];
