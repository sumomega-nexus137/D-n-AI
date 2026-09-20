import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo.jsx";
import { IconTelegram, IconUser, IconUpload } from "./icons.jsx";
import { TELEGRAM_URL } from "../lib/config.js";

const LINKS = [
  { id: "modules", label: "Возможности" },
  { id: "how", label: "Как работает" },
  { id: "stats", label: "Точность" },
];

export default function Navbar({ view, onHome, onView, user, onSignIn }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setOpen(false);
    if (view !== "home") {
      onHome();
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2.5" : "py-4"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        <div
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 ${
            scrolled
              ? "border border-white/[0.07] bg-base-900/70 backdrop-blur-xl shadow-card"
              : "border border-transparent"
          }`}
        >
          <Logo onClick={onHome} />

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="rounded-lg px-3.5 py-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => onView("consultant")}
              className="rounded-lg px-3.5 py-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              Консультант
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-slate-300 transition-all hover:border-white/20 hover:text-white sm:flex"
              aria-label="Открыть в Telegram"
            >
              <IconTelegram className="h-4 w-4" />
            </a>

            {user ? (
              <button
                onClick={() => onView("account")}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] py-1 pl-1 pr-3 text-sm text-slate-200 transition-all hover:border-white/20"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-500/20 text-xs font-semibold text-gold-300">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[90px] truncate sm:inline">{user.name}</span>
              </button>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-2 text-sm text-slate-200 transition-all hover:border-white/20 hover:text-white"
              >
                <IconUser className="h-4 w-4" />
                <span className="hidden sm:inline">Войти</span>
              </button>
            )}

            <button
              onClick={() => onView("analyze")}
              className="btn-primary !px-3.5 !py-2 text-[13px]"
            >
              <IconUpload className="h-4 w-4" />
              <span className="hidden sm:inline">Проверить фото</span>
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 md:hidden"
              aria-label="Меню"
            >
              <span className="flex flex-col gap-1">
                <span className="h-0.5 w-4 bg-current" />
                <span className="h-0.5 w-4 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 max-w-6xl px-4 md:hidden sm:px-6"
          >
            <div className="glass flex flex-col gap-1 p-2">
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  onView("consultant");
                }}
                className="rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5"
              >
                Консультант
              </button>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5"
              >
                Открыть в Telegram
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
