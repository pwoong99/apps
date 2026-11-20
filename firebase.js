// 공통 설정 — 모음 페이지(index.html)와 관리자 화면(admin.html)이 함께 씁니다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4CIUitbAtrNVc9rwnojFrTPlljwzp1l4",
  authDomain: "webapp-hub-64b0d.firebaseapp.com",
  projectId: "webapp-hub-64b0d",
  storageBucket: "webapp-hub-64b0d.firebasestorage.app",
  messagingSenderId: "114748294567",
  appId: "1:114748294567:web:306ff643b1c06c282fe282"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 관리자 계정 (firestore.rules에도 같은 주소가 들어 있어요)
export const ADMIN_EMAIL = "pwoong99@ai.jne.kr";

// 처음 실행할 때 쓰는 기본값 — 관리자 화면에서 바꿀 수 있어요.
export const DEFAULT_CONFIG = {
  siteTitle: "푸르이든의 웹앱 모음",
  siteDesc: "수업과 학급 운영에 쓰는 웹앱을 한곳에 모았어요.",
  categories: ["수업·평가", "학급 운영·생활지도", "학교 행사", "놀이·게임", "업무 도구"]
};

export const UNCATEGORIZED = "미분류";

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

export function safeUrl(url) {
  return /^https?:\/\//i.test(url || "") ? url : "#";
}

// 한국 시간 기준 날짜 (예: 2026-11-05)
export function dateKey(offsetDays = 0) {
  const d = new Date(Date.now() + 9 * 3600e3 - offsetDays * 86400e3);
  return d.toISOString().slice(0, 10);
}

export function catOf(app) {
  return app.category || UNCATEGORIZED;
}

// 설정에 있는 분류 순서대로, 그 뒤에 설정에 없는 분류, 마지막에 미분류
export function orderedCats(categories, apps) {
  const list = [...categories];
  apps.forEach((a) => {
    const c = catOf(a);
    if (c !== UNCATEGORIZED && !list.includes(c)) list.push(c);
  });
  list.push(UNCATEGORIZED);
  return list;
}

// ---------- 버전·업데이트 날짜 (versions.json) ----------
// 다른 채팅에서 앱을 배포할 때 Claude가 versions.json을 고쳐 올립니다.
export async function loadVersions() {
  try {
    const res = await fetch("versions.json", { cache: "no-cache" });
    if (!res.ok) return [];
    const data = await res.json();
    return Object.entries(data.apps || {}).map(([key, v]) => ({ key, ...v }));
  } catch (e) {
    return [];
  }
}

const normUrl = (u) => String(u || "").trim().replace(/\/+$/, "").toLowerCase();

export function fmtVersion(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  return /^v/i.test(s) ? "v" + s.slice(1) : "v" + s;
}

// 앱 목록에 버전 정보를 붙입니다.
// - versions.json에서 url(또는 oldUrls)이 같은 항목을 찾습니다.
// - 관리자 화면에서 직접 적은 값(version·updated)과 비교해 날짜가 더 최근인 쪽을 씁니다.
// - versions.json의 url이 다르면 링크도 그 주소로 바꿉니다(앱 주소가 옮겨진 경우).
export function applyVersions(apps, entries) {
  return apps.map((a) => {
    const e = entries.find((x) =>
      [x.url, ...(x.oldUrls || [])].some((u) => u && normUrl(u) === normUrl(a.url)));
    let version = a.version || "";
    let updated = a.updated || "";
    let url = a.url;
    if (e) {
      if (e.url) url = e.url;
      const fileWins = !version || !updated || (e.updated || "") >= updated;
      if (fileWins) {
        version = e.version || version;
        updated = e.updated || updated;
      }
    }
    return {
      ...a,
      rawUrl: a.url, rawVersion: a.version || "", rawUpdated: a.updated || "",
      url, version: fmtVersion(version), updated,
      versionKey: e ? e.key : ""
    };
  });
}

// 2026-11-20 → 11월 20일
export function fmtDate(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
  return m ? `${Number(m[2])}월 ${Number(m[3])}일` : "";
}

// 최근 7일 안에 업데이트된 앱
export function isRecent(d) {
  return !!d && d >= dateKey(7) && d <= dateKey(0);
}

export function versionLine(a) {
  const parts = [a.version, a.updated && `${fmtDate(a.updated)} 업데이트`].filter(Boolean);
  return parts.join(" · ");
}

export function sortApps(list) {
  return [...list].sort((a, b) =>
    (a.order ?? 0) - (b.order ?? 0) || String(a.title).localeCompare(String(b.title), "ko"));
}
