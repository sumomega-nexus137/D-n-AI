import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "../lib/store.js";
import { IconUser } from "./icons.jsx";

export default function AuthModal({ open, onClose, onSignedIn }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const user = signIn(name, email);
    onSignedIn(user);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-base-950/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="glass relative w-full max-w-sm overflow-hidden p-7"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" />
            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/25">
                <IconUser className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-2xl font-bold text-white">Вход в кабинет</h2>
              <p className="mt-1.5 text-sm text-slate-400">
                Чтобы сохранять историю анализов. Данные хранятся только на этом устройстве.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Имя"
                  autoFocus
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-gold-400/40 focus:outline-none"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email (необязательно)"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-gold-400/40 focus:outline-none"
                />
                <button type="submit" className="btn-primary w-full">
                  Войти
                </button>
              </form>
              <button onClick={onClose} className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-300">
                Позже
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
