import { useRef, useState } from "react";
import { IconUpload } from "./icons.jsx";

export default function UploadZone({ hint, preview, onFile, disabled, accent = "gold" }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const pick = (files) => {
    const f = files?.[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  };

  const ring = accent === "gold" ? "ring-gold-500/40" : "ring-moss-500/40";
  const glow = accent === "gold" ? "text-gold-300" : "text-moss-300";

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (!disabled) pick(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed transition-all duration-300 ${
        drag ? `border-transparent ring-2 ${ring}` : "border-white/12 hover:border-white/25"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      {preview ? (
        <>
          <img src={preview} alt="Загруженное фото" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-base-950/90 via-base-950/20 to-base-950/40" />
          <div className="relative mt-auto w-full p-5 text-center text-sm text-slate-300">
            Нажмите, чтобы выбрать другое фото
          </div>
        </>
      ) : (
        <div className="relative flex flex-col items-center px-6 text-center">
          <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10 transition-transform group-hover:scale-105 ${glow}`}>
            <IconUpload className="h-7 w-7" />
          </span>
          <p className="mt-5 text-base font-semibold text-white">Сделайте фото или загрузите файл</p>
          <p className="mt-1.5 max-w-xs text-sm text-slate-400">{hint}</p>
          <p className="mt-4 text-xs text-slate-600">JPEG, PNG, HEIC · до 12 МБ · перетащите сюда</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => pick(e.target.files)}
      />
    </div>
  );
}
