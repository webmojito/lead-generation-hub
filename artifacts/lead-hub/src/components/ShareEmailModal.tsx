import { useState } from "react";
import { X, Mail, Download, FileSpreadsheet, FileText, Printer, CheckCircle2, Copy, AlertCircle } from "lucide-react";

const GRAD = "linear-gradient(135deg, #7C3AED 0%, #2563EB 55%, #F97316 100%)";

export type ExportFormat = "xlsx" | "pdf" | "docx";

interface ShareEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  filename: string;
  formats: { type: ExportFormat; label: string; onExport: () => void }[];
}

const FORMAT_ICON: Record<ExportFormat, React.ReactNode> = {
  xlsx:  <FileSpreadsheet className="w-4 h-4" style={{ color: "#16A34A" }} />,
  pdf:   <Printer          className="w-4 h-4" style={{ color: "#DC2626" }} />,
  docx:  <FileText         className="w-4 h-4" style={{ color: "#2563EB" }} />,
};

const FORMAT_EXT: Record<ExportFormat, string> = {
  xlsx: ".xlsx",
  pdf:  ".pdf",
  docx: ".doc",
};

export function ShareEmailModal({ isOpen, onClose, title, filename, formats }: ShareEmailModalProps) {
  const [email,     setEmail]     = useState("");
  const [subject,   setSubject]   = useState(`${title} — Lead Hub`);
  const [body,      setBody]      = useState(
    `Ciao,\n\nti condivido il documento "${title}" esportato da Lead Hub.\n\nIn allegato trovi il file scaricato.\n\nA presto`
  );
  const [downloaded, setDownloaded] = useState<ExportFormat | null>(null);
  const [copied,     setCopied]     = useState(false);
  const [emailError, setEmailError] = useState(false);

  if (!isOpen) return null;

  const handleDownload = (fmt: typeof formats[0]) => {
    fmt.onExport();
    setDownloaded(fmt.type);
  };

  const handleOpenEmail = () => {
    if (!email.trim() || !email.includes("@")) { setEmailError(true); return; }
    setEmailError(false);
    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank");
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(`${subject}\n\n${body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-[500px] mx-4 mb-4 sm:mb-0 rounded-2xl border overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0D0A1E 0%, #0A0814 100%)", borderColor: "rgba(37,99,235,0.3)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(37,99,235,0.15)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>
              <Mail className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="font-bold text-[15px] text-white">Condividi via Email</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{title}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Step 1 – scarica file */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ background: "rgba(37,99,235,0.25)", color: "#60A5FA" }}>1</span>
              <p className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                Scarica il file da allegare
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {formats.map(fmt => (
                <button key={fmt.type} onClick={() => handleDownload(fmt)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold border transition-all"
                  style={downloaded === fmt.type
                    ? { background: "rgba(22,163,74,0.12)", borderColor: "rgba(22,163,74,0.35)", color: "#4ADE80" }
                    : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
                  {downloaded === fmt.type
                    ? <CheckCircle2 className="w-4 h-4" style={{ color: "#4ADE80" }} />
                    : FORMAT_ICON[fmt.type]}
                  {fmt.label}
                  {downloaded === fmt.type && <span className="text-[10px] font-normal opacity-70">Scaricato</span>}
                </button>
              ))}
            </div>
            {downloaded && (
              <p className="text-[11px] mt-2 flex items-center gap-1.5" style={{ color: "#4ADE80" }}>
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                File scaricato — allegalo manualmente alla tua email
              </p>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />

          {/* Step 2 – componi email */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ background: "rgba(37,99,235,0.25)", color: "#60A5FA" }}>2</span>
              <p className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                Componi il messaggio
              </p>
            </div>

            <div className="space-y-3">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Indirizzo email destinatario
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(false); }}
                  placeholder="es. cliente@azienda.it"
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: emailError ? "1.5px solid rgba(220,38,38,0.6)" : "1.5px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.85)",
                  }}
                />
                {emailError && (
                  <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "#F87171" }}>
                    <AlertCircle className="w-3 h-3" /> Inserisci un indirizzo email valido
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Oggetto
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Messaggio
                  </label>
                  <button onClick={handleCopyBody}
                    className="flex items-center gap-1 text-[11px] font-semibold transition-colors hover:opacity-75"
                    style={{ color: copied ? "#4ADE80" : "rgba(255,255,255,0.35)" }}>
                    {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copiato!" : "Copia testo"}
                  </button>
                </div>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}
                />
              </div>
            </div>
          </div>

          {/* Info nota */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#FBBF24" }} />
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              Il file deve essere allegato manualmente dopo il download. Cliccando "Apri email" si aprirà il tuo client di posta predefinito con l'oggetto e il messaggio precompilati.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: "rgba(37,99,235,0.15)" }}>
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
            Annulla
          </button>
          <button onClick={handleOpenEmail}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-85"
            style={{ background: GRAD }}>
            <Mail className="w-4 h-4" />
            Apri email
          </button>
        </div>
      </div>
    </div>
  );
}
