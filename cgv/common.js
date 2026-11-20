// 신대 시네마 스낵바 — 공통 설정
// Firebase는 웹앱 모음(webapp-hub-64b0d) 프로젝트를 함께 쓰고, 이 앱의 컬렉션은 cgvOrder_ 로 시작합니다.
import { db } from "../firebase.js";
export { db };
export {
  collection, doc, addDoc, getDocs, deleteDoc, setDoc, onSnapshot,
  query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const APP_VERSION = "v1.0";
export const LIMIT_PER_PERSON = 10000; // 한 사람당 한도
export const MAX_PEOPLE = 3;           // 함께 주문할 수 있는 최대 인원
export const COL_ORDERS = "cgvOrder_orders";
export const COL_META = "cgvOrder_meta";

// 관리자 2명: 이름과 비밀번호(SHA-256 값)
// 비밀번호를 바꿀 때는 Claude에게 말하면 이 값을 바꿔 올려 줍니다.
export const ADMINS = [
  { name: "관리자1", hash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4" }, // 1234
  { name: "관리자2", hash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4" }  // 1234
];

export const CATEGORIES = ["세트", "팝콘", "음료", "커피·티", "주류", "스낵"];

// 메뉴판 (CGV 메뉴 기준). img 파일을 같은 이름으로 바꾸면 사진이 바뀝니다.
export const MENU = [
  { id: "single-set", cat: "세트", name: "싱글세트", desc: "팝콘(L) 1 + 탄산(M) 1", price: 9000 },
  { id: "small-set", cat: "세트", name: "스몰세트", desc: "팝콘(M) 1 + 탄산(M) 1", price: 8000 },
  { id: "popcorn-l", cat: "팝콘", name: "팝콘(L)", desc: "넉넉하게 큰 사이즈", price: 6500 },
  { id: "popcorn-m", cat: "팝콘", name: "팝콘(M)", desc: "딱 알맞은 보통 사이즈", price: 5500 },
  { id: "ade", cat: "음료", name: "에이드", desc: "상큼하게 에이드 한 잔!", price: 6000, options: ["오렌지", "자몽"] },
  { id: "pink-lemon", cat: "음료", name: "핑크레몬에이드", desc: "탄산 없이 가볍게 한 잔!", price: 6000 },
  { id: "soda-l", cat: "음료", name: "셀프 탄산(L)", desc: "원하는 맛으로 시원하게!", price: 4000 },
  { id: "soda-m", cat: "음료", name: "셀프 탄산(M)", desc: "원하는 맛으로 시원하게!", price: 3500 },
  { id: "pet", cat: "음료", name: "PET음료", desc: "병 음료", price: 3000 },
  { id: "coffee", cat: "커피·티", name: "커피", desc: "달콤쌉싸름한 풍미 가득 커피", price: 4500 },
  { id: "decaf", cat: "커피·티", name: "디카페인 콜드브루", desc: "디카페인으로 가볍게 한 잔!", price: 5500 },
  { id: "peach-shot", cat: "커피·티", name: "복숭아샷추", desc: "아샷추는 맛있추!", price: 5500 },
  { id: "icetea", cat: "커피·티", name: "아이스티", desc: "달달한 복숭아맛 아이스티", price: 5000 },
  { id: "beer", cat: "주류", name: "맥주", desc: "영화와 맥주 한 잔으로 완벽한 하루!", price: 5000, options: ["켈리", "테라"] },
  { id: "highball", cat: "주류", name: "짐빔하이볼 350ml", desc: "제대로 즐길 짐빔 됐어?", price: 6000 },
  { id: "nacho", cat: "스낵", name: "칠리치즈나쵸", desc: "나쵸 1 + 칠리소스 1 + 치즈소스 1", price: 6000 },
  { id: "squid", cat: "스낵", name: "버터오징어", desc: "고소한 버터구이 오징어", price: 6000 },
  { id: "meoktae", cat: "스낵", name: "바삭 구운 먹태(팩)", desc: "바삭하게 구운 먹태", price: 6000 }
];

export const menuById = (id) => MENU.find((m) => m.id === id);

export const won = (n) => Number(n || 0).toLocaleString("ko-KR") + "원";

// 이름은 띄어쓰기를 모두 빼고 저장·비교합니다. (김 철수 = 김철수)
export const normName = (s) => String(s || "").replace(/\s+/g, "").trim();

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

export const itemLabel = (it) => it.option ? `${it.name} (${it.option})` : it.name;

export const orderCode = (id) => String(id || "").slice(-4).toUpperCase();

export function fmtTime(ts) {
  const d = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
  if (!d) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}

// 안프로 사진이 아직 없을 때 보여 줄 대체 그림
export function anproFallback(img) {
  img.onerror = null;
  img.replaceWith(Object.assign(document.createElement("div"), {
    className: "anpro-fallback", innerHTML: "<span>안프로</span>"
  }));
}
