"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Loader2Icon, MapPinIcon } from "lucide-react";
import { toast } from "sonner";
import { GallerySection } from "../_components/gallery-section";
import { GradientPlaceholder } from "@/components/gradient-placeholder";
import { FloralCorner } from "@/components/decorations/floral-corner";
import { FloralDivider } from "@/components/decorations/floral-divider";
import { PetalSvg } from "@/components/decorations/petal-svg";
import { submitRsvp } from "@/lib/actions/rsvp";
import type { TemplateProps } from "./types";
import type { Tables } from "@/types/database";

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtHeroDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day} · ${m} · ${y}`;
}

function fmtFullDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtEventDate(d: string) {
  const [y, m] = d.split("-");
  return `${m} · ${y}`;
}

// ─── Scoped CSS ────────────────────────────────────────────────────────────

function RV2Styles() {
  return (
    <style>{`
      .rv2 {
        --rv2-cream: #FBF5EC;
        --rv2-blush: #F7E7E4;
        --rv2-ink: #2B2723;
        --rv2-ink-soft: #6B5F54;
        --rv2-rose: #C68C86;
        --rv2-rose-deep: #A96E68;
        --rv2-sage: #9CAF88;
        --rv2-sage-deep: #7C9068;
        --rv2-stroke: rgba(43,39,35,0.12);
        background: var(--rv2-cream);
        color: var(--rv2-ink);
        font-family: var(--font-lora-variable), 'Lora', Georgia, serif;
        overflow-x: hidden;
      }

      /* Section */
      .rv2-section { padding: 96px 0; position: relative; }
      @media (min-width:900px) { .rv2-section { padding: 140px 0; } }
      .rv2-section-alt { background: linear-gradient(180deg,#FFF7F4 0%,#FCEDE7 100%); }
      .rv2-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
      @media (min-width:900px) { .rv2-container { padding: 0 48px; } }
      .rv2-wash {
        position: absolute; inset: 0; pointer-events: none;
        background:
          radial-gradient(600px 420px at 10% 30%, rgba(212,165,165,0.18), transparent 60%),
          radial-gradient(500px 360px at 90% 70%, rgba(156,175,136,0.16), transparent 60%),
          radial-gradient(500px 360px at 70% 10%, rgba(238,217,186,0.22), transparent 60%);
      }

      /* Typography */
      .rv2-eyebrow {
        display: flex; align-items: center; justify-content: center;
        gap: 16px; color: var(--rv2-rose-deep);
        font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase;
      }
      .rv2-eyebrow::before, .rv2-eyebrow::after {
        content: ""; height: 1px; width: 40px; background: var(--rv2-rose);
      }
      .rv2-h1 {
        font-family: var(--font-serif-variable), 'Cormorant Garamond', Georgia, serif;
        font-weight: 500; font-size: clamp(36px,6vw,64px);
        line-height: 1.05; letter-spacing: -0.01em; margin: 16px 0 0;
      }
      .rv2-h1 em { font-style: italic; color: var(--rv2-rose-deep); }
      .rv2-lead {
        max-width: 640px; margin: 24px auto 0;
        font-size: 18px; line-height: 1.85; color: var(--rv2-ink-soft);
      }

      /* Hero */
      .rv2-hero { position: relative; height: 100svh; min-height: 640px; overflow: hidden; background: #1a1411; }
      .rv2-hero-bg {
        position: absolute; inset: -6%;
        background-size: cover; background-position: center;
        animation: rv2-kenburns 22s ease-in-out infinite alternate;
        filter: saturate(0.9) contrast(1.02);
      }
      @keyframes rv2-kenburns {
        from { transform: scale(1.0) translate(0,0); }
        to   { transform: scale(1.12) translate(-1%,-1.5%); }
      }
      .rv2-hero-overlay {
        position: absolute; inset: 0;
        background:
          radial-gradient(120% 80% at 50% 30%, rgba(0,0,0,0.15), rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.78) 100%),
          linear-gradient(to top, rgba(20,14,12,0.75), rgba(20,14,12,0.1) 55%, rgba(20,14,12,0.35));
      }
      .rv2-hero-names {
        font-family: var(--font-serif-variable), 'Cormorant Garamond', Georgia, serif;
        font-weight: 500; font-style: italic;
        font-size: clamp(56px,11vw,128px);
        line-height: 1; letter-spacing: 0.01em; margin: 0;
        display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; color: #fff;
      }
      .rv2-hero-amp {
        font-family: var(--font-allura-variable), 'Allura', cursive;
        font-size: 84px; color: #EED9BA; line-height: 0.6; display: inline-block; padding: 0 8px;
      }
      .rv2-hero-date {
        display: flex; align-items: center; gap: 18px;
        font-family: var(--font-serif-variable), Georgia, serif;
        letter-spacing: 0.32em; text-transform: uppercase;
        font-size: 13px; color: rgba(255,255,255,0.9);
      }
      .rv2-dot { width: 4px; height: 4px; background: #EED9BA; border-radius: 50%; display: inline-block; }
      .rv2-corner {
        position: absolute; pointer-events: none;
        width: 220px; height: 220px; color: rgba(255,255,255,0.75);
      }
      .rv2-corner.tl { top: -20px; left: -20px; }
      .rv2-corner.br { bottom: -20px; right: -20px; transform: rotate(180deg); }
      @media (min-width:900px) { .rv2-corner { width: 320px; height: 320px; } }
      .rv2-scroll-btn {
        position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
        color: rgba(255,255,255,0.8); font-size: 10px; letter-spacing: 0.4em;
        text-transform: uppercase; display: flex; flex-direction: column;
        align-items: center; gap: 10px; text-decoration: none;
      }
      .rv2-scroll-btn svg { animation: rv2-bob 2.4s ease-in-out infinite; }
      @keyframes rv2-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }

      /* Story */
      .rv2-story-wrap { display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; }
      @media (min-width:900px) { .rv2-story-wrap { grid-template-columns: 1.1fr 0.9fr; gap: 80px; } }
      .rv2-story-text p { font-size: 18px; line-height: 1.95; color: var(--rv2-ink-soft); margin: 0 0 18px; }
      .rv2-story-text p:first-child::first-letter {
        font-family: var(--font-serif-variable), Georgia, serif;
        font-size: 64px; float: left; line-height: 0.9;
        padding: 6px 10px 0 0; color: var(--rv2-rose-deep); font-weight: 500;
      }
      .rv2-sig {
        margin-top: 28px;
        font-family: var(--font-allura-variable), 'Allura', cursive;
        font-size: 40px; color: var(--rv2-rose-deep); line-height: 1;
      }
      .rv2-framed { position: relative; aspect-ratio: 4/5; max-width: 460px; margin: 0 auto; }
      .rv2-framed-photo {
        position: absolute; inset: 0;
        border-radius: 50% / 50%; overflow: hidden;
        box-shadow: 0 30px 60px -30px rgba(169,110,104,0.5), 0 10px 30px -15px rgba(0,0,0,0.15);
      }
      .rv2-framed-ring  { position:absolute; inset:-14px; border:1px solid var(--rv2-rose); border-radius:50%; opacity:0.55; pointer-events:none; }
      .rv2-framed-ring2 { position:absolute; inset:-26px; border:1px dashed var(--rv2-sage); border-radius:50%; opacity:0.45; pointer-events:none; animation:rv2-spin 70s linear infinite; }
      @keyframes rv2-spin { to { transform: rotate(360deg); } }
      .rv2-flourish { position:absolute; width:92px; height:92px; color:var(--rv2-rose); }
      .rv2-flourish.tl { top:-14px; left:-14px; }
      .rv2-flourish.br { bottom:-14px; right:-14px; transform:rotate(180deg); }

      /* Timeline */
      .rv2-timeline { position:relative; margin-top:64px; }
      .rv2-timeline::before {
        content:""; position:absolute; left:18px; top:0; bottom:0; width:2px;
        background:repeating-linear-gradient(180deg,var(--rv2-sage) 0 6px,transparent 6px 14px);
        opacity:0.7;
      }
      @media (min-width:900px) { .rv2-timeline::before { left:50%; transform:translateX(-50%); } }
      .rv2-t-item { position:relative; padding-left:56px; margin-bottom:64px; }
      @media (min-width:900px) {
        .rv2-t-item { width:50%; padding-left:0; padding-right:64px; margin-bottom:88px; }
        .rv2-t-item.rv2-right { margin-left:50%; padding-right:0; padding-left:64px; }
        .rv2-t-item.rv2-left { text-align:right; }
      }
      .rv2-t-node {
        position:absolute; left:8px; top:8px;
        width:22px; height:22px; border-radius:50%;
        background:var(--rv2-cream); border:2px solid var(--rv2-sage-deep);
        display:flex; align-items:center; justify-content:center; z-index:1;
      }
      .rv2-t-node::after { content:""; width:8px; height:8px; border-radius:50%; background:var(--rv2-rose-deep); }
      @media (min-width:900px) {
        .rv2-t-item.rv2-left  .rv2-t-node { left:auto; right:-11px; top:32px; }
        .rv2-t-item.rv2-right .rv2-t-node { left:-11px; top:32px; }
      }
      .rv2-t-photo {
        width:160px; height:160px; border-radius:50%; overflow:hidden; margin-bottom:20px;
        box-shadow:0 20px 40px -25px rgba(169,110,104,0.6); border:6px solid #fff; position:relative;
      }
      @media (min-width:900px) { .rv2-t-item.rv2-left .rv2-t-photo { margin-left:auto; margin-right:0; } }
      .rv2-t-date  { font-family:var(--font-serif-variable),Georgia,serif; font-size:14px; letter-spacing:0.3em; text-transform:uppercase; color:var(--rv2-sage-deep); }
      .rv2-t-title { font-family:var(--font-allura-variable),'Allura',cursive; font-size:44px; color:var(--rv2-rose-deep); line-height:1; margin:6px 0 10px; }
      .rv2-t-desc  { font-size:17px; line-height:1.7; color:var(--rv2-ink-soft); max-width:360px; }
      @media (min-width:900px) { .rv2-t-item.rv2-left .rv2-t-desc { margin-left:auto; } }

      /* Countdown */
      .rv2-countdown { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; max-width:720px; margin:56px auto 0; }
      @media (min-width:700px) { .rv2-countdown { gap:20px; } }
      .rv2-cd-card { background:#fff; border:1px solid var(--rv2-stroke); border-radius:18px; padding:24px 10px 20px; text-align:center; }
      .rv2-cd-num  { font-family:var(--font-serif-variable),Georgia,serif; font-size:clamp(36px,6vw,56px); line-height:1; color:var(--rv2-ink); font-weight:500; font-variant-numeric:tabular-nums; }
      .rv2-cd-label{ margin-top:8px; font-size:10px; letter-spacing:0.35em; text-transform:uppercase; color:var(--rv2-ink-soft); }

      /* Detail cards */
      .rv2-details-grid { display:grid; grid-template-columns:1fr; gap:20px; margin-top:56px; }
      @media (min-width:900px) { .rv2-details-grid { grid-template-columns:repeat(3,1fr); } }
      .rv2-detail-card {
        position:relative; background:rgba(255,255,255,0.75); backdrop-filter:blur(4px);
        border:1px solid var(--rv2-stroke); border-radius:20px; padding:36px 28px;
        text-align:center; overflow:hidden; transition:transform .35s ease,box-shadow .35s ease;
      }
      .rv2-detail-card:hover { transform:translateY(-3px); box-shadow:0 20px 40px -25px rgba(169,110,104,0.4); }
      .rv2-detail-icon { width:48px; height:48px; border:1px solid var(--rv2-rose); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; color:var(--rv2-rose-deep); margin-bottom:18px; }
      .rv2-detail-label { font-size:11px; letter-spacing:0.4em; text-transform:uppercase; color:var(--rv2-ink-soft); }
      .rv2-detail-value { font-family:var(--font-serif-variable),Georgia,serif; font-size:24px; line-height:1.3; margin-top:8px; color:var(--rv2-ink); }
      .rv2-detail-sub   { margin-top:8px; font-size:14px; color:var(--rv2-ink-soft); line-height:1.5; }
      .rv2-card-corner  { position:absolute; width:60px; height:60px; color:var(--rv2-rose); opacity:0.35; pointer-events:none; }
      .rv2-card-corner.tl { top:8px; left:8px; }
      .rv2-card-corner.br { bottom:8px; right:8px; transform:rotate(180deg); }

      /* Party */
      .rv2-party-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; margin-top:56px; }
      @media (min-width:900px) { .rv2-party-grid { grid-template-columns:repeat(4,1fr); gap:28px; } }
      .rv2-p-card { text-align:center; background:rgba(255,255,255,0.55); border:1px solid var(--rv2-stroke); border-radius:20px; padding:28px 18px; transition:transform .3s ease; }
      .rv2-p-card:hover { transform:translateY(-3px); }
      .rv2-p-avatar { width:110px; height:110px; border-radius:50%; overflow:hidden; margin:0 auto 14px; border:4px solid #fff; box-shadow:0 10px 30px -15px rgba(169,110,104,0.5); }
      .rv2-p-name { font-family:var(--font-serif-variable),Georgia,serif; font-size:22px; color:var(--rv2-ink); }
      .rv2-p-role { font-size:11px; letter-spacing:0.3em; text-transform:uppercase; color:var(--rv2-rose-deep); margin-top:4px; }

      /* RSVP */
      .rv2-rsvp-wrap { max-width:620px; margin:56px auto 0; background:#fff; border:1px solid var(--rv2-stroke); border-radius:28px; padding:40px 28px; box-shadow:0 40px 80px -50px rgba(169,110,104,0.45); }
      @media (min-width:700px) { .rv2-rsvp-wrap { padding:56px; } }
      .rv2-field { margin-bottom:18px; }
      .rv2-field label { display:block; font-size:11px; letter-spacing:0.3em; text-transform:uppercase; color:var(--rv2-ink-soft); margin-bottom:10px; }
      .rv2-field input, .rv2-field select, .rv2-field textarea {
        width:100%; padding:14px 16px; border:1px solid var(--rv2-stroke); background:var(--rv2-cream);
        border-radius:14px; font-family:var(--font-lora-variable),'Lora',serif;
        font-size:16px; color:var(--rv2-ink); outline:none; transition:all .25s ease;
      }
      .rv2-field input:focus, .rv2-field select:focus, .rv2-field textarea:focus {
        border-color:var(--rv2-rose); background:#fff; box-shadow:0 0 0 4px rgba(198,140,134,0.15);
      }
      .rv2-two { display:grid; grid-template-columns:1fr; gap:16px; }
      @media (min-width:700px) { .rv2-two { grid-template-columns:1fr 1fr; } }
      .rv2-choice { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      .rv2-choice label {
        border:1px solid var(--rv2-stroke); background:var(--rv2-cream); padding:16px; border-radius:14px;
        display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer;
        text-transform:none; letter-spacing:0; font-size:15px;
        font-family:var(--font-serif-variable),Georgia,serif; transition:all .2s ease;
      }
      .rv2-choice input { display:none; }
      .rv2-choice label:has(input:checked) { background:var(--rv2-rose-deep); border-color:var(--rv2-rose-deep); color:#fff; }
      .rv2-submit-btn {
        width:100%; display:inline-flex; align-items:center; justify-content:center; gap:10px;
        padding:18px 24px; border-radius:999px; background:var(--rv2-rose-deep); color:#fff;
        font-family:var(--font-serif-variable),Georgia,serif; font-size:15px;
        letter-spacing:0.25em; text-transform:uppercase; border:none; cursor:pointer; margin-top:8px;
        transition:transform .25s ease, box-shadow .25s ease, background .25s ease;
      }
      .rv2-submit-btn:hover { transform:translateY(-2px); box-shadow:0 16px 30px -16px rgba(169,110,104,0.7); background:#8E5751; }
      .rv2-submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; box-shadow:none; }

      /* Button ghost */
      .rv2-btn-ghost {
        display:inline-flex; align-items:center; gap:10px; padding:12px 22px; border-radius:999px;
        color:var(--rv2-rose-deep); border:1px solid var(--rv2-rose); background:transparent;
        font-family:var(--font-serif-variable),Georgia,serif; font-size:14px; letter-spacing:0.25em;
        text-transform:uppercase; cursor:pointer; transition:all .25s ease; text-decoration:none; margin-top:20px;
      }
      .rv2-btn-ghost:hover { background:var(--rv2-rose-deep); color:#fff; border-color:var(--rv2-rose-deep); }

      /* Footer */
      .rv2-footer { padding:64px 0 80px; text-align:center; background:var(--rv2-cream); }
      .rv2-foot-amp   { font-family:var(--font-allura-variable),'Allura',cursive; font-size:64px; color:var(--rv2-rose-deep); line-height:0.8; }
      .rv2-foot-thanks{ font-family:var(--font-serif-variable),Georgia,serif; font-style:italic; font-size:22px; color:var(--rv2-ink-soft); margin-top:10px; }
      .rv2-foot-stamp { margin-top:28px; font-size:10px; letter-spacing:0.4em; text-transform:uppercase; color:var(--rv2-ink-soft); opacity:0.8; }

      /* Petals */
      @keyframes rv2-fall {
        0%   { transform: translate(0,-40px) rotate(0deg); }
        100% { transform: translate(40px,110vh) rotate(720deg); }
      }
    `}</style>
  );
}

// ─── Frame Flourish (inline SVG for story framed photo) ───────────────────

function FrameFlourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path d="M 8 50 C 20 40, 40 30, 50 8" stroke="#9CAF88" strokeWidth="1" />
      <ellipse
        cx="18"
        cy="42"
        rx="6"
        ry="2.5"
        fill="#9CAF88"
        transform="rotate(-45 18 42)"
      />
      <ellipse
        cx="30"
        cy="30"
        rx="7"
        ry="3"
        fill="#9CAF88"
        transform="rotate(-45 30 30)"
      />
      <ellipse
        cx="42"
        cy="18"
        rx="6"
        ry="2.5"
        fill="#9CAF88"
        transform="rotate(-45 42 18)"
      />
      <circle cx="50" cy="8" r="5" fill="#EFC9C4" />
      <circle cx="50" cy="8" r="2.5" fill="#B8827D" />
    </svg>
  );
}

// ─── Floating Petals ───────────────────────────────────────────────────────

interface PetalData {
  left: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
  opacity: number;
}

function FloatingPetals() {
  const [petals, setPetals] = useState<PetalData[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: 14 }, () => ({
        left: Math.random() * 100,
        duration: 10 + Math.random() * 12,
        delay: -Math.random() * 14,
        size: 10 + Math.random() * 14,
        color: Math.random() > 0.5 ? "#EFC9C4" : "#D4A5A5",
        opacity: 0.35 + Math.random() * 0.35,
      })),
    );
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5,
        overflow: "hidden",
      }}
    >
      {petals.map((p, i) => (
        <PetalSvg
          key={i}
          style={{
            position: "absolute",
            top: -40,
            left: `${p.left}vw`,
            width: p.size,
            height: p.size,
            color: p.color,
            opacity: p.opacity,
            animation: `rv2-fall ${p.duration}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Reveal wrapper ────────────────────────────────────────────────────────

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};
const revealTransition = { duration: 1.1, ease: [0.2, 0.7, 0.2, 1] as const };

// ─── Hero ──────────────────────────────────────────────────────────────────

function HeroSection({ inv }: { inv: Tables<"invitations"> }) {
  const groom = inv.groom_name || "Chú Rể";
  const bride = inv.bride_name || "Cô Dâu";
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 500], [0, 80]);
  const textY = useTransform(scrollY, [0, 500], [0, 40]);

  return (
    <header className="rv2-hero">
      <motion.div className="rv2-hero-bg" style={{ y: imgY }}>
        {inv.cover_photo_url ? (
          <Image
            src={inv.cover_photo_url}
            alt={`${groom} & ${bride}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <GradientPlaceholder className="h-full w-full" />
        )}
      </motion.div>

      <div className="rv2-hero-overlay" />

      <FloralCorner className="rv2-corner tl" />
      <FloralCorner className="rv2-corner br" />

      <motion.div
        style={{
          y: textY,
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        <motion.div
          style={{
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.5em",
            fontSize: 11,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.2 }}
        >
          — Save the Date —
        </motion.div>

        <h1 className="rv2-hero-names">
          <motion.span
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1.2 }}
          >
            {groom}
          </motion.span>
          <motion.span
            className="rv2-hero-amp"
            initial={{ opacity: 0, y: 18, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.9, duration: 1.6 }}
          >
            &amp;
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 1.2 }}
          >
            {bride}
          </motion.span>
        </h1>

        {inv.wedding_date && (
          <motion.div
            className="rv2-hero-date"
            style={{ marginTop: 36 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1.2 }}
          >
            <span>{fmtHeroDate(inv.wedding_date)}</span>
            {inv.venue_name && (
              <>
                <span className="rv2-dot" />
                <span>{inv.venue_name}</span>
              </>
            )}
          </motion.div>
        )}

        <motion.div
          style={{
            marginTop: 14,
            fontFamily: "var(--font-serif-variable), Georgia, serif",
            fontStyle: "italic",
            fontSize: 20,
            color: "rgba(255,255,255,0.85)",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 1.2 }}
        >
          — Together forever —
        </motion.div>
      </motion.div>

      <motion.a
        href="#quote"
        className="rv2-scroll-btn"
        aria-label="Scroll xuống"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1.2 }}
      >
        <span>Scroll</span>
        <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
          <path
            d="M7 1 V 19 M 1 13 L 7 20 L 13 13"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.a>
    </header>
  );
}

// ─── Quote ─────────────────────────────────────────────────────────────────

function QuoteSection() {
  return (
    <section
      id="quote"
      className="rv2-section"
      style={{ background: "var(--rv2-cream)" }}
    >
      <div className="rv2-container" style={{ textAlign: "center" }}>
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <FloralDivider />
        </motion.div>
        <motion.div
          style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ ...revealTransition, delay: 0.15 }}
        >
          <span
            style={{
              fontFamily: "var(--font-serif-variable), Georgia, serif",
              fontStyle: "italic",
              fontSize: 84,
              lineHeight: 0.2,
              color: "var(--rv2-rose)",
              display: "block",
              height: 24,
            }}
          >
            &ldquo;
          </span>
          <p
            style={{
              fontFamily: "var(--font-serif-variable), Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(24px,3.2vw,34px)",
              lineHeight: 1.45,
              color: "var(--rv2-ink)",
              margin: "24px 0 0",
            }}
          >
            Gặp được em, là điều tuyệt vời nhất cuộc đời anh.
            <br />
            Và từ hôm nay, mỗi ngày đều là mùa xuân.
          </p>
          <span
            style={{
              display: "block",
              marginTop: 28,
              fontSize: 12,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--rv2-ink-soft)",
            }}
          >
            — Lời hẹn ước —
          </span>
        </motion.div>
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ ...revealTransition, delay: 0.3 }}
        >
          <FloralDivider />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Story ─────────────────────────────────────────────────────────────────

function StorySection({ inv }: { inv: Tables<"invitations"> }) {
  const groom = inv.groom_name || "Chú Rể";
  const bride = inv.bride_name || "Cô Dâu";
  const story = inv.story;

  return (
    <section id="story" className="rv2-section rv2-section-alt">
      <div className="rv2-wash" />
      <div className="rv2-container">
        <motion.div
          style={{ textAlign: "center" }}
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <div className="rv2-eyebrow">Our Story</div>
          <h2 className="rv2-h1">
            Chuyện Tình <em>Của Chúng Mình</em>
          </h2>
        </motion.div>

        <div className="rv2-story-wrap" style={{ marginTop: 72 }}>
          <motion.div
            className="rv2-story-text"
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            transition={revealTransition}
          >
            {story ? (
              story
                .split("\n")
                .filter(Boolean)
                .map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <>
                <p>
                  Chúng mình gặp nhau trong một khoảnh khắc thật tình cờ — hai
                  ánh mắt vô tình chạm nhau, và tim bỗng đập nhanh hơn một nhịp.
                </p>
                <p>
                  Sau những năm tháng bên nhau, cùng đi qua những ngày nắng rực
                  rỡ và những cơn mưa bất chợt, chúng mình đã học được cách yêu,
                  cách lắng nghe và cách cùng nhau xây nên một mái nhà nhỏ.
                </p>
                <p>
                  Hôm nay, chúng mình bước vào hôn nhân — viết tiếp câu chuyện
                  đẹp nhất của đời mình — bằng tất cả tình yêu, sự chân thành và
                  niềm tin sâu sắc vào tương lai.
                </p>
              </>
            )}
            <div className="rv2-sig">
              — {groom} &amp; {bride}
            </div>
          </motion.div>

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ ...revealTransition, delay: 0.2 }}
          >
            <div className="rv2-framed">
              <div className="rv2-framed-ring2" />
              <div className="rv2-framed-ring" />
              <FrameFlourish className="rv2-flourish tl" />
              <FrameFlourish className="rv2-flourish br" />
              <div className="rv2-framed-photo">
                {inv.cover_photo_url ? (
                  <Image
                    src={inv.cover_photo_url}
                    alt={`${groom} & ${bride}`}
                    fill
                    className="object-cover"
                    sizes="460px"
                  />
                ) : (
                  <GradientPlaceholder className="h-full w-full" />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Timeline ──────────────────────────────────────────────────────────────

function TimelineSection({
  timeline,
}: {
  timeline: Tables<"love_timeline">[];
}) {
  return (
    <section
      id="timeline"
      className="rv2-section"
      style={{ background: "var(--rv2-cream)" }}
    >
      <div className="rv2-container">
        <motion.div
          style={{ textAlign: "center" }}
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <div className="rv2-eyebrow">Our Journey</div>
          <h2 className="rv2-h1">
            Hành Trình <em>Yêu</em>
          </h2>
          <p className="rv2-lead">
            Những khoảnh khắc làm nên câu chuyện — những ngày tháng chúng mình
            sẽ nhớ mãi không quên.
          </p>
        </motion.div>

        <div className="rv2-timeline">
          {timeline.map((item, idx) => {
            const side = idx % 2 === 0 ? "rv2-left" : "rv2-right";
            return (
              <motion.div
                key={item.id}
                className={`rv2-t-item ${side}`}
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                transition={{ ...revealTransition, delay: idx * 0.1 }}
              >
                <div className="rv2-t-node" />
                {item.photo_url && (
                  <div className="rv2-t-photo">
                    <Image
                      src={item.photo_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                )}
                {item.event_date && (
                  <div className="rv2-t-date">
                    {fmtEventDate(item.event_date)}
                  </div>
                )}
                <h3 className="rv2-t-title">{item.title}</h3>
                {item.description && (
                  <p className="rv2-t-desc">{item.description}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Countdown (client-only) ───────────────────────────────────────────────

function RV2Countdown({ targetDate }: { targetDate: string }) {
  const [mounted, setMounted] = useState(false);
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    setMounted(true);
    function tick() {
      const diff = Math.max(
        0,
        new Date(targetDate + "T00:00:00").getTime() - Date.now(),
      );
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!mounted) return null;

  const units = [
    { v: t.d, label: "Ngày", pad: 3 },
    { v: t.h, label: "Giờ", pad: 2 },
    { v: t.m, label: "Phút", pad: 2 },
    { v: t.s, label: "Giây", pad: 2 },
  ];

  return (
    <div className="rv2-countdown">
      {units.map(({ v, label, pad }) => (
        <div key={label} className="rv2-cd-card">
          <div className="rv2-cd-num">{String(v).padStart(pad, "0")}</div>
          <div className="rv2-cd-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Details ───────────────────────────────────────────────────────────────

function DetailsSection({ inv }: { inv: Tables<"invitations"> }) {
  const mapUrl =
    inv.venue_map_url ||
    (inv.venue_address
      ? `https://maps.google.com/?q=${encodeURIComponent(inv.venue_address)}`
      : null);

  const dressColors = [
    { bg: "#D4A5A5", label: "Hồng phấn" },
    { bg: "#9CAF88", label: "Sage" },
    { bg: "#F2E0C9", label: "Kem" },
    { bg: "#EFE3D1", label: "Nude" },
  ];

  return (
    <section id="details" className="rv2-section rv2-section-alt">
      <div className="rv2-wash" />
      <div className="rv2-container">
        <motion.div
          style={{ textAlign: "center" }}
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <div className="rv2-eyebrow">The Big Day</div>
          <h2 className="rv2-h1">
            Chi Tiết <em>Đám Cưới</em>
          </h2>
          <p className="rv2-lead">
            Chúng mình mong được đón tiếp và chung vui cùng bạn trong ngày trọng
            đại này.
          </p>
        </motion.div>

        {inv.wedding_date && (
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            transition={{ ...revealTransition, delay: 0.2 }}
          >
            <RV2Countdown targetDate={inv.wedding_date} />
          </motion.div>
        )}

        <div className="rv2-details-grid">
          {/* Date */}
          {inv.wedding_date && (
            <motion.div
              className="rv2-detail-card"
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              transition={{ ...revealTransition, delay: 0 }}
            >
              <FloralCorner className="rv2-card-corner tl" />
              <FloralCorner className="rv2-card-corner br" />
              <div className="rv2-detail-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 9h18M8 3v4M16 3v4" />
                </svg>
              </div>
              <div className="rv2-detail-label">Date &amp; Time</div>
              <div className="rv2-detail-value">
                {fmtFullDate(inv.wedding_date)}
              </div>
              <div className="rv2-detail-sub">
                {inv.wedding_time
                  ? `Lễ cưới · ${inv.wedding_time}`
                  : "Xem thông tin chi tiết trên thiệp"}
              </div>
            </motion.div>
          )}

          {/* Venue */}
          {(inv.venue_name || inv.venue_address) && (
            <motion.div
              className="rv2-detail-card"
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              transition={{ ...revealTransition, delay: 0.1 }}
            >
              <FloralCorner className="rv2-card-corner tl" />
              <FloralCorner className="rv2-card-corner br" />
              <div className="rv2-detail-icon">
                <MapPinIcon width={22} height={22} strokeWidth={1.5} />
              </div>
              <div className="rv2-detail-label">Venue</div>
              {inv.venue_name && (
                <div className="rv2-detail-value">{inv.venue_name}</div>
              )}
              {inv.venue_address && (
                <div className="rv2-detail-sub">{inv.venue_address}</div>
              )}
              {mapUrl && (
                <a
                  className="rv2-btn-ghost"
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Chỉ Đường
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </a>
              )}
            </motion.div>
          )}

          {/* Dress code */}
          <motion.div
            className="rv2-detail-card"
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ ...revealTransition, delay: 0.2 }}
          >
            <FloralCorner className="rv2-card-corner tl" />
            <FloralCorner className="rv2-card-corner br" />
            <div className="rv2-detail-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 20V8l8-5 8 5v12M9 20v-6h6v6" />
              </svg>
            </div>
            <div className="rv2-detail-label">Dress Code</div>
            <div className="rv2-detail-value">
              {inv.dress_code || "Garden Formal"}
            </div>
            <div className="rv2-detail-sub">
              Tông hồng phấn · xanh sage · kem
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginTop: 18,
              }}
            >
              {dressColors.map(({ bg, label }) => (
                <span
                  key={label}
                  title={label}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: bg,
                    border: "1px solid rgba(0,0,0,.08)",
                    display: "inline-block",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Wedding Party ─────────────────────────────────────────────────────────

function PartySection({ party }: { party: Tables<"wedding_party">[] }) {
  return (
    <section id="party" className="rv2-section rv2-section-alt">
      <div className="rv2-wash" />
      <div className="rv2-container">
        <motion.div
          style={{ textAlign: "center" }}
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <div className="rv2-eyebrow">With Us</div>
          <h2 className="rv2-h1">
            Wedding <em>Party</em>
          </h2>
          <p className="rv2-lead">
            Những người thân yêu cùng chúng mình bước vào ngày đặc biệt này.
          </p>
        </motion.div>

        <div className="rv2-party-grid">
          {party.map((p, idx) => (
            <motion.div
              key={p.id}
              className="rv2-p-card"
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              transition={{ ...revealTransition, delay: idx * 0.07 }}
            >
              <div className="rv2-p-avatar">
                {p.photo_url ? (
                  <Image
                    src={p.photo_url}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="110px"
                  />
                ) : (
                  <GradientPlaceholder className="h-full w-full" />
                )}
              </div>
              <div className="rv2-p-name">{p.name}</div>
              {p.role && <div className="rv2-p-role">{p.role}</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── RSVP ──────────────────────────────────────────────────────────────────

function RsvpSectionV2({ invitationId }: { invitationId: string }) {
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("2");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }
    setLoading(true);
    const result = await submitRsvp({
      invitationId,
      name: name.trim(),
      phone: phone.trim() || undefined,
      attending: attending === "yes",
      adultsCount: attending === "yes" ? Number(guests) : 0,
      childrenCount: 0,
      message: message.trim() || undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error("Không thể gửi xác nhận", { description: result.error });
      return;
    }
    setSubmitted(true);
    toast.success("Cảm ơn bạn đã xác nhận!");
  }

  return (
    <section
      id="rsvp"
      className="rv2-section"
      style={{ background: "var(--rv2-cream)" }}
    >
      <div className="rv2-container">
        <motion.div
          style={{ textAlign: "center" }}
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <div className="rv2-eyebrow">Kindly Reply</div>
          <h2 className="rv2-h1">
            Xác Nhận <em>Tham Dự</em>
          </h2>
          <p className="rv2-lead">
            Vui lòng phản hồi sớm để chúng mình có thể chuẩn bị chu đáo nhất cho
            bạn.
          </p>
        </motion.div>

        <motion.form
          className="rv2-rsvp-wrap"
          onSubmit={handleSubmit}
          noValidate
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ ...revealTransition, delay: 0.2 }}
        >
          {/* Decorative header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <svg
              width="120"
              height="48"
              viewBox="0 0 120 48"
              aria-hidden="true"
              fill="none"
            >
              <path
                d="M10 30 Q 30 10 60 24 Q 90 38 110 18"
                stroke="#9CAF88"
                strokeWidth="1"
              />
              <circle cx="60" cy="24" r="6" fill="#EFC9C4" />
              <circle cx="60" cy="24" r="3" fill="#B8827D" />
              <ellipse
                cx="30"
                cy="22"
                rx="6"
                ry="2.2"
                fill="#9CAF88"
                opacity=".7"
                transform="rotate(-20 30 22)"
              />
              <ellipse
                cx="90"
                cy="26"
                rx="6"
                ry="2.2"
                fill="#9CAF88"
                opacity=".7"
                transform="rotate(20 90 26)"
              />
            </svg>
            <h3
              style={{
                fontFamily:
                  "var(--font-serif-variable), 'Cormorant Garamond', Georgia, serif",
                fontWeight: 500,
                fontSize: 28,
                margin: "8px 0 0",
                color: "var(--rv2-ink)",
              }}
            >
              Kính mời bạn
            </h3>
            <div
              style={{
                fontSize: 13,
                color: "var(--rv2-ink-soft)",
                marginTop: 4,
              }}
            >
              Chung vui cùng chúng mình trong ngày trọng đại
            </div>
          </div>

          {submitted ? (
            <div style={{ textAlign: "center", padding: "32px 20px" }}>
              <div
                style={{
                  fontFamily: "var(--font-allura-variable), 'Allura', cursive",
                  fontSize: 48,
                  color: "var(--rv2-rose-deep)",
                  lineHeight: 0.8,
                }}
              >
                Cảm ơn bạn
              </div>
              <p style={{ marginTop: 16, color: "var(--rv2-ink-soft)" }}>
                Lời xác nhận của bạn đã được ghi nhận. Chúng mình rất trân trọng
                🌸
              </p>
            </div>
          ) : (
            <>
              {/* Attending choice */}
              <div className="rv2-field">
                <label>Bạn có thể tham dự không?</label>
                <div className="rv2-choice">
                  <label>
                    <input
                      type="radio"
                      name="attend"
                      value="yes"
                      checked={attending === "yes"}
                      onChange={() => setAttending("yes")}
                    />
                    🌿 Có, chắc chắn rồi!
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="attend"
                      value="no"
                      checked={attending === "no"}
                      onChange={() => setAttending("no")}
                    />
                    💌 Rất tiếc, không thể
                  </label>
                </div>
              </div>

              <div className="rv2-two">
                <div className="rv2-field">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="rv2-field">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {attending === "yes" && (
                <div className="rv2-field">
                  <label>Số người tham dự</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    <option value="1">1 người</option>
                    <option value="2">2 người</option>
                    <option value="3">3 người</option>
                    <option value="4">4+ người</option>
                  </select>
                </div>
              )}

              <div className="rv2-field">
                <label>Lời chúc gửi đến cô dâu chú rể</label>
                <textarea
                  rows={3}
                  placeholder="Chúc hai bạn trăm năm hạnh phúc..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="rv2-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin" /> Đang gửi...
                  </>
                ) : (
                  <>
                    Gửi Lời Xác Nhận{" "}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </>
          )}
        </motion.form>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────

function FooterSection({ inv }: { inv: Tables<"invitations"> }) {
  const groom = inv.groom_name || "Chú Rể";
  const bride = inv.bride_name || "Cô Dâu";
  const location = inv.venue_address?.split(",").pop()?.trim() || "";

  return (
    <footer className="rv2-footer">
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        transition={revealTransition}
      >
        <div className="rv2-foot-amp">
          {groom} &amp; {bride}
        </div>
        <div className="rv2-foot-thanks">
          Trân trọng cảm ơn vì đã là một phần trong câu chuyện của chúng mình.
        </div>
        <div className="rv2-foot-stamp">
          {inv.wedding_date ? fmtHeroDate(inv.wedding_date) : ""}
          {location ? ` · ${location}` : ""}
        </div>
      </motion.div>
    </footer>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────

export function RomanticV2Template({
  inv,
  timeline,
  party,
  galleryImages,
}: TemplateProps) {
  return (
    <div className="rv2">
      <RV2Styles />
      <FloatingPetals />

      <HeroSection inv={inv} />
      <QuoteSection />
      <StorySection inv={inv} />

      {timeline.length > 0 && <TimelineSection timeline={timeline} />}

      <DetailsSection inv={inv} />

      {galleryImages.length > 0 && (
        <section
          className="rv2-section"
          style={{ background: "var(--rv2-cream)" }}
          id="gallery"
        >
          <div className="rv2-container">
            <motion.div
              style={{ textAlign: "center" }}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={revealTransition}
            >
              <div className="rv2-eyebrow">Memories</div>
              <h2 className="rv2-h1">
                Khoảnh <em>Khắc</em>
              </h2>
              <p className="rv2-lead">
                Những khoảnh khắc bình dị hóa thành kỷ niệm — ghi lại trên con
                đường đi cùng nhau.
              </p>
            </motion.div>
          </div>
          <GallerySection images={galleryImages} />
        </section>
      )}

      {party.length > 0 && <PartySection party={party} />}

      <RsvpSectionV2 invitationId={inv.id} />
      <FooterSection inv={inv} />
    </div>
  );
}
