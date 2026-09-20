import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function UploadZone({ hint, preview, onFile, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (file && file.type.startsWith("image/")) onFile(file);
    },
    [onFile]
  );

  return (
    <div>
      <motion.div
        whileHover={disabled ? undefined : { scale: 1.005 }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`card relative cursor-pointer overflow-hidden transition-colors ${
          dragging ? "border-grain-500/60 bg-grain-500/[0.06]" : "hover:border-white/15"
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Загруженное фото"
              className="h-64 w-full object-cover sm:h-80"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 to-transparent p-4">
              <span className="text-sm text-slate-300">Нажмите, чтобы выбрать другое фото</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center sm:py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-7 w-7 text-grain-400"
                aria-hidden="true"
              >
                <path
                  d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 15v2.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V15"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-medium text-white">Сделайте фото или загрузите файл</p>
              <p className="mt-1 text-sm text-slate-400">{hint}</p>
            </div>
          </div>
        )}
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
