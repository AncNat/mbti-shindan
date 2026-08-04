// ============================================================
// MBTI補正診断システム v1
// data_q2.js — 2周目 行動事実の質問（30問）
//
// ★ 質問文を直したいとき ★
//   text: "〜" の「〜」の部分だけを書き換えてください。
//   選択肢の文章は label: "〜" の部分です。
//   質問は必ず「先週」「直近1ヶ月」など期間を区切った聞き方にしてください。
//   score や weight の数字と、記号（{ } , " など）は変えないでください。
//
// 仕組みのメモ（触らなくてOK）:
//   5軸 × 3場面タグ（職場・友達・ひとり）× 2問
//   score は第1文字側（E/S/T/J/A）に寄るほど 1.0
//   weight: 0.5 が付いた選択肢（「〜がなかった」等）は集計時に軽く扱われる
// ============================================================

const QUESTIONS_ROUND2 = [

  // ---------------- EI（外向 ↔ 内向） ----------------

  {
    id: "r2_ei_shokuba_1",
    axis: "EI",
    round: 2,
    tag: "職場",
    text: "直近1ヶ月、仕事や学校の休憩時間・昼休みを、誰かとしゃべって過ごした日はどれくらいありましたか？",
    options: [
      { label: "ほぼ毎日", score: 1.0 },
      { label: "週に2〜3日", score: 0.7 },
      { label: "週に1日くらい", score: 0.35 },
      { label: "ほぼ一人で過ごした", score: 0.0 }
    ]
  },
  {
    id: "r2_ei_shokuba_2",
    axis: "EI",
    round: 2,
    tag: "職場",
    text: "先週、会議や授業などの集まりの場で、自分から発言・質問した回数は？",
    options: [
      { label: "5回以上", score: 1.0 },
      { label: "2〜4回", score: 0.7 },
      { label: "1回", score: 0.4 },
      { label: "0回", score: 0.0 }
    ]
  },
  {
    id: "r2_ei_tomodachi_1",
    axis: "EI",
    round: 2,
    tag: "友達",
    text: "直近1ヶ月、自分から誘って友人・知人と会ったり通話したりした回数は？",
    options: [
      { label: "3回以上", score: 1.0 },
      { label: "2回", score: 0.7 },
      { label: "1回", score: 0.4 },
      { label: "0回", score: 0.0 }
    ]
  },
  {
    id: "r2_ei_tomodachi_2",
    axis: "EI",
    round: 2,
    tag: "友達",
    text: "直近1ヶ月、3人以上の集まり（飲み会・遊び・オンライン含む）に参加した回数は？",
    options: [
      { label: "3回以上", score: 1.0 },
      { label: "2回", score: 0.65 },
      { label: "1回", score: 0.35 },
      { label: "0回", score: 0.0 }
    ]
  },
  {
    id: "r2_ei_hitori_1",
    axis: "EI",
    round: 2,
    tag: "ひとり",
    text: "先週、予定のない自由な時間ができたとき、実際にはどう過ごしましたか？（一番多かったものを選んでください）",
    options: [
      { label: "誰かに連絡して会いに行った", score: 1.0 },
      { label: "通話やチャットで誰かと話した", score: 0.7 },
      { label: "一人で外出した", score: 0.35 },
      { label: "家で一人の趣味に没頭した", score: 0.0 }
    ]
  },
  {
    id: "r2_ei_hitori_2",
    axis: "EI",
    round: 2,
    tag: "ひとり",
    text: "直近1ヶ月、丸一日ほとんど誰とも会話せずに過ごした日は何日ありましたか？（家族との会話も含めて数えてください）",
    options: [
      { label: "0日", score: 1.0 },
      { label: "1〜2日", score: 0.65 },
      { label: "3〜5日", score: 0.35 },
      { label: "6日以上", score: 0.0 }
    ]
  },

  // ---------------- SN（感覚 ↔ 直観） ----------------

  {
    id: "r2_sn_shokuba_1",
    axis: "SN",
    round: 2,
    tag: "職場",
    text: "直近1ヶ月、仕事や学校で「今のやり方を変える新しいアイデア」を思いついて、実際に試したり提案したりした回数は？",
    options: [
      { label: "一度もない", score: 1.0 },
      { label: "1回", score: 0.6 },
      { label: "2〜3回", score: 0.3 },
      { label: "4回以上", score: 0.0 }
    ]
  },
  {
    id: "r2_sn_shokuba_2",
    axis: "SN",
    round: 2,
    tag: "職場",
    text: "直近1ヶ月、仕事や学校の作業を始めるとき、手順書・マニュアル・過去のやり方を確認してから取りかかった割合は？",
    options: [
      { label: "ほぼ毎回確認した", score: 1.0 },
      { label: "半分以上は確認した", score: 0.65 },
      { label: "たまに確認した", score: 0.35 },
      { label: "ほぼ確認せず自己流で進めた", score: 0.0 }
    ]
  },
  {
    id: "r2_sn_tomodachi_1",
    axis: "SN",
    round: 2,
    tag: "友達",
    text: "直近1ヶ月、友人・知人との会話で多かったのはどちらの話題でしたか？",
    options: [
      { label: "実際にあった出来事の話（食べ物・買い物・最近の近況など）がほとんど", score: 1.0 },
      { label: "どちらかといえば出来事の話", score: 0.7 },
      { label: "どちらかといえば空想やアイデアの話", score: 0.3 },
      { label: "「もしも」の話・将来の妄想・アイデアの話がほとんど", score: 0.0 }
    ]
  },
  {
    id: "r2_sn_tomodachi_2",
    axis: "SN",
    round: 2,
    tag: "友達",
    text: "直近1ヶ月、友達と「もし宝くじが当たったら」のような現実離れした空想話で盛り上がった回数は？",
    options: [
      { label: "0回", score: 1.0 },
      { label: "1回", score: 0.6 },
      { label: "2〜3回", score: 0.3 },
      { label: "4回以上", score: 0.0 }
    ]
  },
  {
    id: "r2_sn_hitori_1",
    axis: "SN",
    round: 2,
    tag: "ひとり",
    text: "先週、家事・移動・入浴などの最中に考え事にふけって、手が止まったり乗り過ごしそうになったりした回数は？",
    options: [
      { label: "0回", score: 1.0 },
      { label: "1回", score: 0.6 },
      { label: "2〜3回", score: 0.3 },
      { label: "4回以上", score: 0.0 }
    ]
  },
  {
    id: "r2_sn_hitori_2",
    axis: "SN",
    round: 2,
    tag: "ひとり",
    text: "直近1ヶ月、ふと浮かんだアイデアや空想をメモ・ノート・スマホに書き留めた回数は？",
    options: [
      { label: "0回", score: 1.0 },
      { label: "1〜2回", score: 0.6 },
      { label: "3〜5回", score: 0.3 },
      { label: "6回以上", score: 0.0 }
    ]
  },

  // ---------------- TF（思考 ↔ 感情） ----------------

  {
    id: "r2_tf_shokuba_1",
    axis: "TF",
    round: 2,
    tag: "職場",
    text: "先週、仕事や学校の話し合いで、相手の案の問題点や矛盾をその場で指摘した回数は？",
    options: [
      { label: "3回以上", score: 1.0 },
      { label: "1〜2回", score: 0.7 },
      { label: "指摘したいことはあったが、言わなかった", score: 0.15 },
      { label: "特に指摘したいことがなかった", score: 0.5, weight: 0.5 }
    ]
  },
  {
    id: "r2_tf_shokuba_2",
    axis: "TF",
    round: 2,
    tag: "職場",
    text: "直近1ヶ月、頑張っている同僚や仲間に、ねぎらいや褒めの言葉を自分からかけた回数は？",
    options: [
      { label: "0回", score: 1.0 },
      { label: "1〜2回", score: 0.65 },
      { label: "3〜5回", score: 0.3 },
      { label: "6回以上", score: 0.0 }
    ]
  },
  {
    id: "r2_tf_tomodachi_1",
    axis: "TF",
    round: 2,
    tag: "友達",
    text: "直近1ヶ月で友達から悩みを打ち明けられたとき、最初にした反応はどれに近いですか？（直近の1回を思い出してください）",
    options: [
      { label: "解決策やアドバイスを伝えた", score: 1.0 },
      { label: "原因や状況を整理する質問をした", score: 0.75 },
      { label: "「それはつらいね」とまず共感した", score: 0.25 },
      { label: "ひたすら聞き役に徹した", score: 0.0 },
      { label: "悩みを打ち明けられる場面がなかった", score: 0.5, weight: 0.5 }
    ]
  },
  {
    id: "r2_tf_tomodachi_2",
    axis: "TF",
    round: 2,
    tag: "友達",
    text: "先週、友達の話の中の間違い（勘違い・事実誤認）に気づいたとき、実際にどうしましたか？",
    options: [
      { label: "その場ですぐ訂正した", score: 1.0 },
      { label: "話の切れ目でやんわり指摘した", score: 0.65 },
      { label: "話の流れを優先してスルーした", score: 0.2 },
      { label: "間違いに気づく場面がなかった", score: 0.5, weight: 0.5 }
    ]
  },
  {
    id: "r2_tf_hitori_1",
    axis: "TF",
    round: 2,
    tag: "ひとり",
    text: "直近1ヶ月、映画・ドラマ・本・動画などを見て泣いた（うるっと来た）回数は？",
    options: [
      { label: "0回", score: 1.0 },
      { label: "1回", score: 0.6 },
      { label: "2〜3回", score: 0.3 },
      { label: "4回以上", score: 0.0 }
    ]
  },
  {
    id: "r2_tf_hitori_2",
    axis: "TF",
    round: 2,
    tag: "ひとり",
    text: "直近1ヶ月で数千円以上の買い物をしたとき、直近の1回はどうやって決めましたか？",
    options: [
      { label: "スペックや価格をしっかり比較して決めた", score: 1.0 },
      { label: "一応調べたが、最後は気分で決めた", score: 0.5 },
      { label: "見た瞬間の「好き」で決めた", score: 0.0 },
      { label: "当てはまる買い物がなかった", score: 0.5, weight: 0.5 }
    ]
  },

  // ---------------- JP（判断 ↔ 知覚） ----------------

  {
    id: "r2_jp_shokuba_1",
    axis: "JP",
    round: 2,
    tag: "職場",
    text: "先週、仕事や学校で一番大きかったタスク（課題・資料づくりなど）は、締め切りに対していつ終わりましたか？",
    options: [
      { label: "期限よりかなり前に終えた", score: 1.0 },
      { label: "少し余裕を持って終えた", score: 0.7 },
      { label: "期限ギリギリに終えた", score: 0.25 },
      { label: "期限を過ぎた・まだ終わっていない", score: 0.0 }
    ]
  },
  {
    id: "r2_jp_shokuba_2",
    axis: "JP",
    round: 2,
    tag: "職場",
    text: "先週、仕事や学校の1日の始まりに、その日やることのリストや予定を書き出した日は何日ありましたか？",
    options: [
      { label: "ほぼ毎日（4日以上）", score: 1.0 },
      { label: "2〜3日", score: 0.65 },
      { label: "1日", score: 0.35 },
      { label: "0日", score: 0.0 }
    ]
  },
  {
    id: "r2_jp_tomodachi_1",
    axis: "JP",
    round: 2,
    tag: "友達",
    text: "直近1ヶ月、友人・知人との約束は主にどう決まりましたか？",
    options: [
      { label: "日時も場所も事前にきっちり決めた", score: 1.0 },
      { label: "日にちだけ決めて、詳細は直前に決めた", score: 0.5 },
      { label: "「今から会える？」の当日ノリが多かった", score: 0.0 },
      { label: "約束自体がなかった", score: 0.5, weight: 0.5 }
    ]
  },
  {
    id: "r2_jp_tomodachi_2",
    axis: "JP",
    round: 2,
    tag: "友達",
    text: "直近1ヶ月、友人・知人との待ち合わせに遅刻した回数は？",
    options: [
      { label: "0回（毎回早めに着いた）", score: 1.0 },
      { label: "0回（ただしギリギリ到着もあった）", score: 0.7 },
      { label: "1回", score: 0.35 },
      { label: "2回以上", score: 0.0 },
      { label: "待ち合わせ自体がなかった", score: 0.5, weight: 0.5 }
    ]
  },
  {
    id: "r2_jp_hitori_1",
    axis: "JP",
    round: 2,
    tag: "ひとり",
    text: "先週の休日（または自由に使えた日）、実際にはどう過ごし始めましたか？",
    options: [
      { label: "前日までに決めていた予定どおりに動いた", score: 1.0 },
      { label: "ざっくり決めていた流れに沿って動いた", score: 0.65 },
      { label: "起きてから気分で決めた", score: 0.2 },
      { label: "何も決めず、成り行きで1日が終わった", score: 0.0 }
    ]
  },
  {
    id: "r2_jp_hitori_2",
    axis: "JP",
    round: 2,
    tag: "ひとり",
    text: "直近1ヶ月、事前に買う予定のなかったものを衝動買いした回数は？",
    options: [
      { label: "0回", score: 1.0 },
      { label: "1回", score: 0.7 },
      { label: "2〜3回", score: 0.35 },
      { label: "4回以上", score: 0.0 }
    ]
  },

  // ---------------- AT（自己主張的 ↔ 慎重） ----------------

  {
    id: "r2_at_shokuba_1",
    axis: "AT",
    round: 2,
    tag: "職場",
    text: "先週、仕事や学校で提出・送信したもの（メール・課題・資料など）を、送った後に読み返して不安になった回数は？",
    options: [
      { label: "0回", score: 1.0 },
      { label: "1回", score: 0.65 },
      { label: "2〜3回", score: 0.3 },
      { label: "4回以上", score: 0.0 }
    ]
  },
  {
    id: "r2_at_shokuba_2",
    axis: "AT",
    round: 2,
    tag: "職場",
    text: "直近1ヶ月で仕事や学校でミスをしたとき、そのあと実際どうなりましたか？（直近の1回を思い出してください）",
    options: [
      { label: "すぐ切り替えて次の作業に移った", score: 1.0 },
      { label: "その日のうちには忘れた", score: 0.7 },
      { label: "数日引きずった", score: 0.25 },
      { label: "今も思い出すとへこむ", score: 0.0 },
      { label: "思い当たるミスがない", score: 0.6, weight: 0.5 }
    ]
  },
  {
    id: "r2_at_tomodachi_1",
    axis: "AT",
    round: 2,
    tag: "友達",
    text: "先週、友達に送ったメッセージの返信が半日以上来なかったとき、実際にどうしましたか？",
    options: [
      { label: "特に気にせず放置した", score: 1.0 },
      { label: "少し気になったが、何もしなかった", score: 0.6 },
      { label: "既読がついたか何度か確認した", score: 0.25 },
      { label: "自分の送った文面を読み返して不安になった", score: 0.0 },
      { label: "そういう場面がなかった", score: 0.5, weight: 0.5 }
    ]
  },
  {
    id: "r2_at_tomodachi_2",
    axis: "AT",
    round: 2,
    tag: "友達",
    text: "直近1ヶ月、遊びや集まりのあとに「あの発言まずかったかな」と一人反省会をした回数は？",
    options: [
      { label: "0回", score: 1.0 },
      { label: "1回", score: 0.6 },
      { label: "2〜3回", score: 0.3 },
      { label: "ほぼ毎回した", score: 0.0 }
    ]
  },
  {
    id: "r2_at_hitori_1",
    axis: "AT",
    round: 2,
    tag: "ひとり",
    text: "先週、寝る前に翌日や将来の心配事が頭に浮かんで、寝つきが悪くなった日は何日ありましたか？",
    options: [
      { label: "0日", score: 1.0 },
      { label: "1〜2日", score: 0.6 },
      { label: "3〜4日", score: 0.3 },
      { label: "5日以上", score: 0.0 }
    ]
  },
  {
    id: "r2_at_hitori_2",
    axis: "AT",
    round: 2,
    tag: "ひとり",
    text: "直近1ヶ月、家族や身近な人に「これで大丈夫かな？」「どう思う？」と確認や相談をした回数は？",
    options: [
      { label: "0回", score: 1.0 },
      { label: "1〜2回", score: 0.6 },
      { label: "3〜5回", score: 0.3 },
      { label: "6回以上", score: 0.0 }
    ]
  }

];
