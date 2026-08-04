"use strict";

/* =========================================================
 * MBTI補正診断 v1 — フロー制御・スコアリング・描画
 * SPEC.md 3章（スコアリング）・4章（画面フロー）準拠
 * ========================================================= */

// ---- 設定 ----
// ★ 納得度の記録先。README の手順でデプロイしたGASのURLをこの "" の中に貼ってください。
//    空のままでも診断そのものは動きます（記録されないだけ）。
const GAS_URL = "https://script.google.com/macros/s/AKfycbyH_hcPx7IKcYb-mRNF8ZNJy8mj1wkFYUJ9GpdywJ2QybFqMgQk2Fmm7CqhqsgmL4JWHw/exec";

// ---- 軸定義 ----
const AXES = ["EI", "SN", "TF", "JP", "AT"];

const AXIS_INFO = {
  EI: { first: "E", second: "I", firstLabel: "外向", secondLabel: "内向" },
  SN: { first: "S", second: "N", firstLabel: "感覚", secondLabel: "直観" },
  TF: { first: "T", second: "F", firstLabel: "思考", secondLabel: "感情" },
  JP: { first: "J", second: "P", firstLabel: "判断", secondLabel: "知覚" },
  AT: { first: "A", second: "T", firstLabel: "自己主張", secondLabel: "慎重" },
};

const ROUND_LABELS = {
  1: "1周目・自己認識",
  2: "2周目・行動事実",
  3: "3周目・他者視点",
};

// ---- 状態 ----
const state = {
  name: "",
  inputMBTI: null,   // { EI, SN, TF, JP, AT } AT は null 可。未入力（スキップ）なら null
  answers: {},       // 質問id -> { axis, round, tag, score, weight, optIndex }
  round: 1,
  queue: [],         // 現在の周の質問配列
  qIndex: 0,
};

// 手持ちMBTI入力画面の下書き
const mbtiDraft = { EI: null, SN: null, TF: null, JP: null, AT: null, none: false };

// 「友達と比べる」の下書き（最終結果画面。どこにも保存しない）
const friendDraft = { EI: null, SN: null, TF: null, JP: null, AT: null };

const app = document.getElementById("app");

// ---- ユーティリティ ----

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function setScreen(html) {
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

function starStr(n) {
  return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
}

// データファイルが未ロードでも画面が完全に死なないための取得ヘルパ
// トップレベル const は window のプロパティにならないため、裸参照を typeof で守る
function dataOr(name, fallback) {
  switch (name) {
    case "QUESTIONS_ROUND1":
      return typeof QUESTIONS_ROUND1 !== "undefined" ? QUESTIONS_ROUND1 : fallback;
    case "QUESTIONS_ROUND2":
      return typeof QUESTIONS_ROUND2 !== "undefined" ? QUESTIONS_ROUND2 : fallback;
    case "QUESTIONS_ROUND3":
      return typeof QUESTIONS_ROUND3 !== "undefined" ? QUESTIONS_ROUND3 : fallback;
    case "TYPE_DESCRIPTIONS":
      return typeof TYPE_DESCRIPTIONS !== "undefined" ? TYPE_DESCRIPTIONS : fallback;
    case "AT_COMMENTS":
      return typeof AT_COMMENTS !== "undefined" ? AT_COMMENTS : fallback;
    case "BOUNDARY_COMMENTS":
      return typeof BOUNDARY_COMMENTS !== "undefined" ? BOUNDARY_COMMENTS : fallback;
    case "CENTER_COMMENTS":
      return typeof CENTER_COMMENTS !== "undefined" ? CENTER_COMMENTS : fallback;
    case "FRIEND_MATCH_COMMENTS":
      return typeof FRIEND_MATCH_COMMENTS !== "undefined" ? FRIEND_MATCH_COMMENTS : fallback;
    default:
      return fallback;
  }
}

// ---- スコアリング（SPEC 3章） ----

// weight = 周回の重み × 場面の重み（仕様書 5-3）
// 1周目0.8（自己像のバイアスが乗りやすい）／2周目1.2（行動事実は信頼度が高い）／3周目1.0
// 2周目の場面: ひとり1.0（素の自分に最も近い）・友達0.7・職場0.4（演技が混じるノイズ）
function questionWeight(q) {
  if (q.round === 1) return 0.8;
  if (q.round === 3) return 1.0;
  var scene = q.tag === "ひとり" ? 1.0 : (q.tag === "友達" ? 0.7 : 0.4);
  return 1.2 * scene;
}

function axisStats(axis) {
  var sum = 0, wsum = 0, n = 0, hasRound3 = false;
  for (var id in state.answers) {
    var a = state.answers[id];
    if (a.axis !== axis) continue;
    sum += a.score * a.weight;
    wsum += a.weight;
    n++;
    if (a.round === 3) hasRound3 = true;
  }
  var percent = wsum > 0 ? Math.round((sum / wsum) * 100) : 50;
  return { percent: percent, n: n, hasRound3: hasRound3 };
}

// 確信度: n>=10→5 / n>=8→4 / n>=4→3 / n>=2→2 / n>=1→1
function starCount(n) {
  if (n >= 10) return 5;
  if (n >= 8) return 4;
  if (n >= 4) return 3;
  if (n >= 2) return 2;
  if (n >= 1) return 1;
  return 0;
}

// percent=50 ちょうどのタイブレーク: 入力MBTIのその軸の文字。不明なら第1文字
function judgeChar(axis, percent) {
  var info = AXIS_INFO[axis];
  if (percent > 50) return info.first;
  if (percent < 50) return info.second;
  if (state.inputMBTI && state.inputMBTI[axis]) return state.inputMBTI[axis];
  return info.first;
}

function computeResult() {
  var axes = {};
  for (var i = 0; i < AXES.length; i++) {
    var axis = AXES[i];
    var s = axisStats(axis);
    var ch = judgeChar(axis, s.percent);
    // 中央判定: 3周目まで回答済み かつ 45〜55
    var isCenter = s.hasRound3 && s.percent >= 45 && s.percent <= 55;
    // 境界: 中央判定でない軸で 45〜55
    var isBoundary = !isCenter && s.percent >= 45 && s.percent <= 55;
    // 手持ち入力との食い違い（入力なし・AT不明の軸は判定しない）
    var inputChar = state.inputMBTI ? state.inputMBTI[axis] : null;
    axes[axis] = {
      percent: s.percent,
      n: s.n,
      star: starCount(s.n),
      char: ch,
      isCenter: isCenter,
      isBoundary: isBoundary,
      inputChar: inputChar,
      differs: !!(inputChar && inputChar !== ch),
    };
  }
  var type4 = axes.EI.char + axes.SN.char + axes.TF.char + axes.JP.char;
  return {
    axes: axes,
    type4: type4,
    atChar: axes.AT.char,
    full: type4 + "-" + axes.AT.char,
    displayFull: displayTypeString(axes),
  };
}

// 表示用タイプ名: 中央判定の軸は「E/I」のように併記する（仕様書 5-8）
function displayTypeString(axes) {
  var hasCenter = AXES.some(function (a) { return axes[a].isCenter; });
  var parts = ["EI", "SN", "TF", "JP"].map(function (a) {
    return axisDisplayChar(a, axes[a]);
  });
  var main = hasCenter ? parts.join(" ") : parts.join("");
  var at = axisDisplayChar("AT", axes.AT);
  return main + "-" + at;
}

function axisDisplayChar(axis, r) {
  if (!r.isCenter) return r.char;
  var info = AXIS_INFO[axis];
  var other = r.char === info.first ? info.second : info.first;
  return r.char + "/" + other;
}

// 手持ちの入力 と いまの測定 を並べ、食い違う文字をハイライトする比較ブロック
function typeCompareHtml(result) {
  var im = state.inputMBTI;
  if (!im) return "";
  function letters(getChar, diffCheck) {
    var parts = ["EI", "SN", "TF", "JP"].map(function (a) {
      var c = getChar(a);
      if (!c) return "";
      return '<span class="tc-letter' + (diffCheck(a) ? " diff" : "") + '">' + c + "</span>";
    }).join("");
    var atC = getChar("AT");
    if (atC) parts += '<span class="tc-sep">-</span><span class="tc-letter' + (diffCheck("AT") ? " diff" : "") + '">' + atC + "</span>";
    return parts;
  }
  var inputHtml = letters(
    function (a) { return im[a]; },
    function (a) { return result.axes[a].differs; }
  );
  var nowHtml = letters(
    function (a) { return a === "AT" ? result.atChar : result.axes[a].char; },
    function (a) { return result.axes[a].differs; }
  );
  var diffAxes = AXES.filter(function (a) { return result.axes[a].differs; });
  var diffNote = diffAxes.length
    ? '<p class="tc-note">色つきの文字が、手持ちの結果と食い違っている軸です。</p>'
    : '<p class="tc-note">いまのところ、手持ちの結果と同じです。</p>';
  return (
    '<div class="type-compare">' +
      '<div class="tc-col"><span class="tc-label">手持ちの入力</span><span class="tc-type">' + inputHtml + "</span></div>" +
      '<div class="tc-arrow">&rarr;</div>' +
      '<div class="tc-col"><span class="tc-label">いまの測定</span><span class="tc-type">' + nowHtml + "</span></div>" +
    "</div>" + diffNote
  );
}

function comparisonLine(result) {
  var im = state.inputMBTI;
  if (!im) return "手持ちの診断結果は未入力でした。";
  var input4 = im.EI + im.SN + im.TF + im.JP;
  var inputStr = input4 + (im.AT ? "-" + im.AT : "");
  var same = im.AT ? (inputStr === result.full) : (input4 === result.type4);
  if (same) return "手持ちの " + inputStr + " と同じ結果になりました。";
  return "手持ちの " + inputStr + " から " + result.full + " に補正されました。";
}

// ---- 軸バー描画（共通部品） ----

function axisBarHtml(axis, r) {
  var info = AXIS_INFO[axis];
  var p = r.percent;               // 第1文字側の割合
  var dotLeft = 100 - p;           // 第1文字側が左。100%なら左端
  var leadFirst = r.char === info.first;
  return (
    '<div class="axis-block">' +
      '<div class="axis-head">' +
        '<span class="axis-side' + (leadFirst ? " lead" : "") + '">' +
          info.first + "・" + info.firstLabel + " " + p + "%</span>" +
        '<span class="axis-side' + (!leadFirst ? " lead" : "") + '">' +
          (100 - p) + "% " + info.secondLabel + "・" + info.second + "</span>" +
      "</div>" +
      '<div class="axis-track"><div class="axis-dot" style="left:' + dotLeft + '%"></div></div>' +
      '<div class="axis-foot">' +
        '<span class="stars">' + starStr(r.star) + "</span>" +
        (r.isCenter ? '<span class="badge-center">この軸は中央</span>' : "") +
      "</div>" +
    "</div>"
  );
}

// ---- [1] オンボーディング ----

function renderOnboarding() {
  setScreen(
    '<div class="card">' +
      '<p class="brand">MBTI補正診断</p>' +
      '<h1 class="title">MBTI補正診断</h1>' +
      '<p class="concept">あなたが納得するまで、潜れるところまで潜る診断。</p>' +
      '<p class="time-note">最短2分・納得いかなければ最大6分</p>' +
      '<label class="field-label" for="name-input">名前</label>' +
      '<input id="name-input" class="text-input" type="text" placeholder="あだ名でOK" autocomplete="off">' +
      '<div class="btn-row"><button id="start-btn" class="btn btn-primary" disabled>はじめる</button></div>' +
    "</div>"
  );
  var input = document.getElementById("name-input");
  var btn = document.getElementById("start-btn");
  input.value = state.name;
  function sync() {
    btn.disabled = input.value.trim() === "";
  }
  input.addEventListener("input", sync);
  sync();
  btn.addEventListener("click", function () {
    state.name = input.value.trim();
    if (state.name === "") return;
    renderMbtiInput();
  });
}

// ---- [2] 手持ちMBTI入力 ----

function renderMbtiInput() {
  function sel(axis, v) {
    return mbtiDraft[axis] === v ? " selected" : "";
  }
  var rows4 = ["EI", "SN", "TF", "JP"].map(function (axis) {
    var info = AXIS_INFO[axis];
    return (
      '<div class="mbti-row">' +
        '<button type="button" class="mbti-opt' + sel(axis, info.first) + '" data-axis="' + axis + '" data-v="' + info.first + '">' +
          info.first + "<span>" + info.firstLabel + "</span></button>" +
        '<button type="button" class="mbti-opt' + sel(axis, info.second) + '" data-axis="' + axis + '" data-v="' + info.second + '">' +
          info.second + "<span>" + info.secondLabel + "</span></button>" +
      "</div>"
    );
  }).join("");
  var atRow =
    '<div class="mbti-row">' +
      '<button type="button" class="mbti-opt' + sel("AT", "A") + '" data-axis="AT" data-v="A">A<span>自己主張</span></button>' +
      '<button type="button" class="mbti-opt' + sel("AT", "T") + '" data-axis="AT" data-v="T">T<span>慎重</span></button>' +
      '<button type="button" class="mbti-opt' + sel("AT", "UNKNOWN") + '" data-axis="AT" data-v="UNKNOWN">？<span>わからない</span></button>' +
    "</div>";

  setScreen(
    '<div class="card">' +
      '<p class="brand">MBTI補正診断</p>' +
      '<h2 class="h2">手持ちのMBTI結果を入力</h2>' +
      '<p class="lead-sm">いま持っている診断結果を選んでください。スコアには混ぜず、比較表示と引き分け判定にだけ使います。</p>' +
      '<div id="mbti-rows" class="mbti-rows' + (mbtiDraft.none ? " disabled" : "") + '">' + rows4 + atRow + "</div>" +
      '<label class="check-row"><input type="checkbox" id="no-mbti"' + (mbtiDraft.none ? " checked" : "") + ">診断結果を持っていない／覚えていない</label>" +
      '<div class="btn-row"><button id="mbti-go" class="btn btn-primary" disabled>診断をはじめる</button></div>' +
    "</div>"
  );

  var goBtn = document.getElementById("mbti-go");
  function ready() {
    if (mbtiDraft.none) return true;
    return !!(mbtiDraft.EI && mbtiDraft.SN && mbtiDraft.TF && mbtiDraft.JP && mbtiDraft.AT);
  }
  function syncBtn() {
    goBtn.disabled = !ready();
  }

  var opts = app.querySelectorAll(".mbti-opt");
  for (var i = 0; i < opts.length; i++) {
    opts[i].addEventListener("click", function () {
      var axis = this.getAttribute("data-axis");
      var v = this.getAttribute("data-v");
      mbtiDraft[axis] = (mbtiDraft[axis] === v) ? null : v;
      renderMbtiInput();
    });
  }
  document.getElementById("no-mbti").addEventListener("change", function () {
    mbtiDraft.none = this.checked;
    renderMbtiInput();
  });

  syncBtn();
  goBtn.addEventListener("click", function () {
    if (!ready()) return;
    state.inputMBTI = mbtiDraft.none ? null : {
      EI: mbtiDraft.EI,
      SN: mbtiDraft.SN,
      TF: mbtiDraft.TF,
      JP: mbtiDraft.JP,
      AT: mbtiDraft.AT === "UNKNOWN" ? null : mbtiDraft.AT,
    };
    startRound(1, AXES);
  });
}

// ---- [3][5] 質問出題 ----

function startRound(round, axes) {
  state.round = round;
  if (round === 1) {
    state.queue = dataOr("QUESTIONS_ROUND1", []).slice();
  } else if (round === 2) {
    state.queue = dataOr("QUESTIONS_ROUND2", []).filter(function (q) {
      return axes.indexOf(q.axis) >= 0;
    });
  } else {
    state.queue = dataOr("QUESTIONS_ROUND3", []).filter(function (q) {
      return axes.indexOf(q.axis) >= 0;
    });
  }
  state.qIndex = 0;
  if (state.queue.length === 0) {
    // データ未整備時の保険: 出題できなければ結果へ
    endRound();
    return;
  }
  renderQuestion();
}

function renderQuestion() {
  var q = state.queue[state.qIndex];
  var total = state.queue.length;
  var prev = state.answers[q.id];
  var optsHtml = q.options.map(function (o, i) {
    var selected = prev && prev.optIndex === i ? " selected" : "";
    return '<button type="button" class="opt' + selected + '" data-i="' + i + '">' + escapeHtml(o.label) + "</button>";
  }).join("");

  setScreen(
    '<div class="card">' +
      '<div class="q-top">' +
        '<button id="back-btn" class="back-btn"' + (state.qIndex === 0 ? " disabled" : "") + ">&larr; 戻る</button>" +
        '<span class="round-label">' + ROUND_LABELS[state.round] + "</span>" +
        '<span class="q-progress">' + (state.qIndex + 1) + "/" + total + "</span>" +
      "</div>" +
      '<div class="progress-track"><div class="progress-fill" style="width:' + Math.round(((state.qIndex + 1) / total) * 100) + '%"></div></div>' +
      (q.tag ? '<span class="tag-chip">場面: ' + escapeHtml(q.tag) + "</span>" : "") +
      '<p class="q-text">' + escapeHtml(q.text) + "</p>" +
      '<div class="opts">' + optsHtml + "</div>" +
    "</div>"
  );

  document.getElementById("back-btn").addEventListener("click", function () {
    if (state.qIndex > 0) {
      state.qIndex--;
      renderQuestion();
    }
  });

  var optBtns = app.querySelectorAll(".opt");
  for (var i = 0; i < optBtns.length; i++) {
    optBtns[i].addEventListener("click", function () {
      var idx = Number(this.getAttribute("data-i"));
      var o = q.options[idx];
      state.answers[q.id] = {
        axis: q.axis,
        round: q.round,
        tag: q.tag,
        score: o.score,
        // 選択肢に weight があれば掛ける（「覚えていない」等は0.5で軽く扱う）
        weight: questionWeight(q) * (o.weight != null ? o.weight : 1),
        optIndex: idx,
      };
      if (state.qIndex < state.queue.length - 1) {
        state.qIndex++;
        renderQuestion();
      } else {
        endRound();
      }
    });
  }
}

function endRound() {
  if (state.round === 1) {
    renderInterim(1);
  } else if (state.round === 2) {
    renderInterim(2);
  } else {
    renderFinal();
  }
}

// ---- [4][6] 中間結果 ----

function renderInterim(stage) {
  var result = computeResult();
  var bars = AXES.map(function (a) {
    return axisBarHtml(a, result.axes[a]);
  }).join("");

  setScreen(
    '<div class="card">' +
      '<p class="brand">MBTI補正診断</p>' +
      '<h2 class="h2">いまの結果</h2>' +
      '<p class="interim-type">現時点のタイプ: <strong>' + result.displayFull + "</strong></p>" +
      typeCompareHtml(result) +
      '<div class="axis-list">' + bars + "</div>" +
      '<p class="note">深く潜るほど ★（確信度）が増えていきます。</p>' +
      '<div class="btn-row">' +
        '<button id="ok-btn" class="btn btn-primary">当たってる！</button>' +
        '<button id="ng-btn" class="btn btn-ghost">もっと潜って解像度を上げる</button>' +
      "</div>" +
    "</div>"
  );

  document.getElementById("ok-btn").addEventListener("click", function () {
    renderFinal();
  });
  document.getElementById("ng-btn").addEventListener("click", function () {
    renderAxisSelect(stage === 1 ? 2 : 3);
  });
}

// ---- 軸選択（最大2つ・最低1つ） ----

function renderAxisSelect(nextRound) {
  var result = computeResult();
  var picked = [];
  var subText = nextRound === 2
    ? "次は「実際に何をしたか」という別の角度から聞き直します。"
    : "次は「周りからどう見えているか」という別の角度から聞き直します。";

  var choices = AXES.map(function (axis) {
    var info = AXIS_INFO[axis];
    var r = result.axes[axis];
    // 深掘り候補のヒント（仕様書 5-6: 境界線上・手持ち入力との食い違い）
    var hints = "";
    if (r.differs) hints += '<span class="badge-diff">入力と食い違い</span>';
    if (r.percent >= 45 && r.percent <= 55) hints += '<span class="badge-border">境界線上</span>';
    return (
      '<button type="button" class="axis-choice" data-axis="' + axis + '">' +
        '<span class="axis-choice-name">' + info.first + " / " + info.second +
          "（" + info.firstLabel + " ↔ " + info.secondLabel + "）</span>" +
        '<span class="axis-choice-sub">' + info.first + " " + r.percent + "%" + hints + "</span>" +
      "</button>"
    );
  }).join("");

  setScreen(
    '<div class="card">' +
      '<h2 class="h2">どの軸を深掘りする？</h2>' +
      '<p class="lead-sm">解像度を上げたい軸を選んでください（最大2つ・最低1つ）。' + subText + "</p>" +
      '<div class="axis-choices">' + choices + "</div>" +
      '<div class="btn-row"><button id="axis-go" class="btn btn-primary" disabled>この軸を深掘りする</button></div>' +
    "</div>"
  );

  var btns = app.querySelectorAll(".axis-choice");
  var goBtn = document.getElementById("axis-go");

  function refresh() {
    for (var i = 0; i < btns.length; i++) {
      var axis = btns[i].getAttribute("data-axis");
      var isSel = picked.indexOf(axis) >= 0;
      btns[i].classList.toggle("selected", isSel);
      btns[i].classList.toggle("dim", picked.length >= 2 && !isSel);
    }
    goBtn.disabled = picked.length === 0;
  }

  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
      var axis = this.getAttribute("data-axis");
      var idx = picked.indexOf(axis);
      if (idx >= 0) {
        picked.splice(idx, 1);
      } else if (picked.length < 2) {
        picked.push(axis);
      }
      refresh();
    });
  }
  refresh();

  goBtn.addEventListener("click", function () {
    if (picked.length === 0) return;
    startRound(nextRound, picked.slice());
  });
}

// ---- 友達と比べる（最終結果画面の1ブロック） ----
// 友達のタイプ4〜5文字を選ぶと、軸ごとの一致/不一致だけをその場で表示する。
// 公開範囲ルール（共有してよいのはタイプ名まで）に合わせ、解説等の中身は出さない。保存もしない。

function friendCardHtml() {
  function sel(axis, v) {
    return friendDraft[axis] === v ? " selected" : "";
  }
  var rows = ["EI", "SN", "TF", "JP"].map(function (axis) {
    var info = AXIS_INFO[axis];
    return (
      '<div class="mbti-row">' +
        '<button type="button" class="mbti-opt friend-opt' + sel(axis, info.first) + '" data-axis="' + axis + '" data-v="' + info.first + '">' +
          info.first + "<span>" + info.firstLabel + "</span></button>" +
        '<button type="button" class="mbti-opt friend-opt' + sel(axis, info.second) + '" data-axis="' + axis + '" data-v="' + info.second + '">' +
          info.second + "<span>" + info.secondLabel + "</span></button>" +
      "</div>"
    );
  }).join("");
  var atRow =
    '<div class="mbti-row">' +
      '<button type="button" class="mbti-opt friend-opt' + sel("AT", "A") + '" data-axis="AT" data-v="A">A<span>自己主張</span></button>' +
      '<button type="button" class="mbti-opt friend-opt' + sel("AT", "T") + '" data-axis="AT" data-v="T">T<span>慎重</span></button>' +
      '<button type="button" class="mbti-opt friend-opt' + sel("AT", "UNKNOWN") + '" data-axis="AT" data-v="UNKNOWN">？<span>わからない</span></button>' +
    "</div>";
  return (
    '<div class="card" id="friend-card">' +
      '<h3 class="h3">友達と比べる</h3>' +
      '<p class="lead-sm">友達の診断結果を選ぶと、どの軸がおそろいでどこが違うかを見られます。この画面に出るだけで、どこにも保存されません。</p>' +
      '<div class="mbti-rows">' + rows + atRow + "</div>" +
      '<div id="friend-result"></div>' +
    "</div>"
  );
}

function renderFriendCompare(result) {
  var el = document.getElementById("friend-result");
  if (!el) return;
  if (!(friendDraft.EI && friendDraft.SN && friendDraft.TF && friendDraft.JP && friendDraft.AT)) {
    el.innerHTML = '<p class="note">友達のタイプを全部選ぶと比較が出ます（A/Tがわからなければ「？」でOK）。</p>';
    return;
  }
  var axes = ["EI", "SN", "TF", "JP"];
  if (friendDraft.AT !== "UNKNOWN") axes.push("AT");
  var matches = 0;
  var rows = axes.map(function (axis) {
    var info = AXIS_INFO[axis];
    var r = result.axes[axis];
    // 中央判定の軸はどちら側とも「おそろい」扱い（両利きのため）
    var same = r.isCenter ? true : r.char === friendDraft[axis];
    if (same) matches++;
    var badge = r.isCenter
      ? '<span class="fr-badge same">どっちもいける</span>'
      : (same ? '<span class="fr-badge same">おそろい</span>' : '<span class="fr-badge diff">ちがう</span>');
    return (
      '<div class="fr-row">' +
        '<span class="fr-axis">' + info.first + "/" + info.second + "</span>" +
        '<span class="fr-vals">あなた ' + axisDisplayChar(axis, r) + " ・ 友達 " + friendDraft[axis] + "</span>" +
        badge +
      "</div>"
    );
  }).join("");
  var ratio = matches / axes.length;
  var fmc = dataOr("FRIEND_MATCH_COMMENTS", {});
  var comment = ratio === 1 ? fmc.all : (ratio >= 0.75 ? fmc.most : (ratio >= 0.4 ? fmc.half : fmc.few));
  el.innerHTML =
    '<p class="fr-count">' + axes.length + "軸中 " + matches + "軸おそろい</p>" +
    rows +
    (comment ? '<p class="body-text fr-comment">' + escapeHtml(comment) + "</p>" : "") +
    (friendDraft.AT === "UNKNOWN" ? '<p class="note">A/Tは「？」のため4軸で比較しています。</p>' : "");
}

// ---- [7][8] 最終結果・納得度 ----

function renderFinal() {
  var result = computeResult();
  var types = dataOr("TYPE_DESCRIPTIONS", {});
  var atComments = dataOr("AT_COMMENTS", {});
  var boundaryComments = dataOr("BOUNDARY_COMMENTS", {});
  var centerComments = dataOr("CENTER_COMMENTS", {});
  var t = types[result.type4] || { nickname: "", text: "" };

  var bars = AXES.map(function (a) {
    return axisBarHtml(a, result.axes[a]);
  }).join("");

  // A/T差分（AT軸が中央判定なら出さない → 中央コメント側で出す）
  var atHtml = "";
  if (!result.axes.AT.isCenter) {
    var atText = atComments[result.atChar] || "";
    if (atText) {
      atHtml =
        '<div class="comment-block">' +
          '<p class="comment-axis">-' + result.atChar + " のあなたは</p>" +
          '<p class="body-text">' + escapeHtml(atText) + "</p>" +
        "</div>";
    }
  }

  // 補正コメント（境界の軸のみ）
  var boundaryBlocks = AXES.filter(function (a) {
    return result.axes[a].isBoundary;
  }).map(function (axis) {
    var info = AXIS_INFO[axis];
    var r = result.axes[axis];
    var sidePercent = r.char === info.first ? r.percent : 100 - r.percent;
    var prefix = "あなたは" + r.char + "側が" + sidePercent + "%とほぼ境界線上です。";
    var body = (boundaryComments[axis] || {})[r.char] || "";
    return (
      '<div class="comment-block">' +
        '<p class="comment-axis">' + info.first + "/" + info.second + "軸</p>" +
        '<p class="body-text">' + escapeHtml(prefix + body) + "</p>" +
      "</div>"
    );
  }).join("");

  // 中央判定コメント（該当軸のみ）
  var centerBlocks = AXES.filter(function (a) {
    return result.axes[a].isCenter;
  }).map(function (axis) {
    var info = AXIS_INFO[axis];
    var body = centerComments[axis] || "";
    return (
      '<div class="comment-block">' +
        '<p class="comment-axis">' + info.first + "/" + info.second + "軸: あなたは中央です</p>" +
        '<p class="body-text">' + escapeHtml(body) + "</p>" +
      "</div>"
    );
  }).join("");

  setScreen(
    '<div class="card">' +
      '<p class="brand">MBTI補正診断</p>' +
      '<h2 class="final-heading">' + escapeHtml(state.name) + "さんの補正診断結果</h2>" +
      '<div class="type-hero">' +
        '<div class="type-code">' + result.displayFull + "</div>" +
        '<div class="type-nickname">' + escapeHtml(t.nickname) + "</div>" +
        (t.catch ? '<div class="type-catch">' + escapeHtml(t.catch) + "</div>" : "") +
      "</div>" +
      '<p class="compare-line">' + escapeHtml(comparisonLine(result)) + "</p>" +
      '<div class="axis-list">' + bars + "</div>" +
    "</div>" +

    '<div class="card">' +
      '<h3 class="h3">' + result.type4 + " はこんな人</h3>" +
      '<p class="body-text">' + escapeHtml(t.text) + "</p>" +
      atHtml +
    "</div>" +

    (boundaryBlocks
      ? '<div class="card"><h3 class="h3">境界線上の補正コメント</h3>' + boundaryBlocks + "</div>"
      : "") +

    (centerBlocks
      ? '<div class="card"><h3 class="h3">決着しなかった軸</h3>' + centerBlocks + "</div>"
      : "") +

    friendCardHtml() +

    '<div class="card" id="rate-card">' +
      '<h3 class="h3">これ、当たってますか？</h3>' +
      '<div class="rate-row">' +
        [1, 2, 3, 4, 5].map(function (n) {
          return '<button type="button" class="rate-btn" data-score="' + n + '">' + n + "</button>";
        }).join("") +
      "</div>" +
      '<div class="rate-hint"><span>当たってない</span><span>当たってる</span></div>' +
    "</div>" +

    '<p class="disclaimer">この診断は遊びです。当たっていなくても、それはあなたのせいではありません。</p>'
  );

  var rateBtns = app.querySelectorAll(".rate-btn");
  for (var i = 0; i < rateBtns.length; i++) {
    rateBtns[i].addEventListener("click", function () {
      submitScore(Number(this.getAttribute("data-score")));
    });
  }

  // 友達と比べる: 画面全体は再描画せず、friend-card 内だけを更新する
  var frBtns = app.querySelectorAll(".friend-opt");
  for (var k = 0; k < frBtns.length; k++) {
    frBtns[k].addEventListener("click", function () {
      var axis = this.getAttribute("data-axis");
      var v = this.getAttribute("data-v");
      friendDraft[axis] = (friendDraft[axis] === v) ? null : v;
      var siblings = app.querySelectorAll('.friend-opt[data-axis="' + axis + '"]');
      for (var j = 0; j < siblings.length; j++) {
        siblings[j].classList.toggle("selected", siblings[j].getAttribute("data-v") === friendDraft[axis]);
      }
      renderFriendCompare(result);
    });
  }
  renderFriendCompare(result);
}

function submitScore(score) {
  if (GAS_URL) {
    try {
      fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ name: state.name, score: score }),
      }).catch(function (err) {
        // 送信に失敗しても完了表示は出す（仕様書 7: エラーはコンソールにのみ出力）
        console.log("納得度の送信に失敗しました:", err);
      });
    } catch (e) {
      console.log("納得度の送信に失敗しました:", e);
    }
  }
  var card = document.getElementById("rate-card");
  card.innerHTML = '<p class="thanks">ありがとう！スクショして友達に見せよう</p>';
}

// ---- 起動 ----
renderOnboarding();
