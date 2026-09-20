import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Modules from "./components/Modules.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Stats from "./components/Stats.jsx";
import Footer from "./components/Footer.jsx";
import Analyze from "./components/Analyze.jsx";
import Consultant from "./components/Consultant.jsx";
import Account from "./components/Account.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { getUser } from "./lib/store.js";

// Фоновая «атмосфера» для всех экранов, кроме hero (у него своя 3D-сцена) —
// мягкие цветные пятна и виньетка, чтобы фон не был плоским чёрным.
function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -left-40 top-[-10%] h-[520px] w-[520px] rounded-full bg-gold-500/[0.07] blur-[130px] animate-aurora" />
      <div className="absolute right-[-15%] top-[30%] h-[460px] w-[460px] rounded-full bg-moss-500/[0.06] blur-[130px] animate-aurora" style={{ animationDelay: "-6s" }} />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,transparent_55%,rgba(5,5,6,0.6)_100%)]" />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [analyzeMode, setAnalyzeMode] = useState("grain");
  const [consultContext, setConsultContext] = useState(null);
  const [user, setUser] = useState(() => getUser());
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (view !== "home") window.scrollTo({ top: 0, behavior: "auto" });
  }, [view, analyzeMode, consultContext]);

  const goAnalyze = (mode = "grain") => {
    setAnalyzeMode(mode);
    setView("analyze");
  };
  const goConsult = (context = null) => {
    setConsultContext(context);
    setView("consultant");
  };
  const goHome = () => setView("home");

  return (
    <div className="relative min-h-screen">
      {view !== "home" && <Ambient />}

      <Navbar
        view={view}
        onHome={goHome}
        onView={setView}
        user={user}
        onSignIn={() => setAuthOpen(true)}
      />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Hero
                onAnalyze={goAnalyze}
                onScrollModules={() =>
                  document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })
                }
              />
              <Modules onAnalyze={goAnalyze} />
              <HowItWorks />
              <Stats onConsultant={() => goConsult(null)} />
              <Footer onHome={goHome} onView={setView} />
            </motion.div>
          )}

          {view === "analyze" && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Analyze initialMode={analyzeMode} onConsult={goConsult} />
            </motion.div>
          )}

          {view === "consultant" && (
            <motion.div
              key="consultant"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Consultant context={consultContext} />
            </motion.div>
          )}

          {view === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Account
                user={user}
                onSignIn={() => setAuthOpen(true)}
                onSignOut={() => setUser(null)}
                onAnalyze={goAnalyze}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSignedIn={setUser} />
    </div>
  );
}
