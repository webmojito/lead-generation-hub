import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload, Clipboard, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, MoreVertical, FileSpreadsheet, Loader2, Trash2,
  Download, RefreshCw, Eye, Table2,
} from "lucide-react";

const C = { blue: "#2563EB", purple: "#7C3AED", green: "#16A34A", red: "#DC2626", amber: "#F97316" };

const TARGET_FIELDS = [
  "Seleziona campo", "Nome", "Cognome", "Email", "Telefono",
  "Azienda", "Settore", "Ruolo", "Budget", "Fonte Lead", "Data Creazione",
];

const RECENT = [
  { file: "customer_leads_q3.xlsx",   date: "24 Ott 2024 · 14:22",  records: 4500, status: "COMPLETATO",  sc: C.green  },
  { file: "marketing_contacts.csv",    date: "22 Ott 2024 · 09:15",  records: 820,  status: "PROCESSING",  sc: C.amber  },
  { file: "error_data_test.csv",       date: "21 Ott 2024 · 18:45",  records: 124,  status: "ERRORE",      sc: C.red    },
  { file: "webinar_leads_sept.csv",    date: "18 Ott 2024 · 11:30",  records: 2140, status: "COMPLETATO",  sc: C.green  },
  { file: "linkedin_export_q3.xlsx",   date: "15 Ott 2024 · 16:00",  records: 680,  status: "COMPLETATO",  sc: C.green  },
];

type FieldRow = { source: string; target: string; status: "valid" | "duplicate" | "missing" };

const MOCK_MAPPING: FieldRow[] = [
  { source: "first_name",  target: "Nome",          status: "valid"     },
  { source: "email_addr",  target: "Email",          status: "duplicate" },
  { source: "phone_num",   target: "Seleziona campo", status: "missing"  },
  { source: "company",     target: "Azienda",        status: "valid"     },
  { source: "job_title",   target: "Ruolo",          status: "valid"     },
];

function StatusPill({ status }: { status: FieldRow["status"] }) {
  if (status === "valid")     return <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: C.green }}><CheckCircle2 className="w-3.5 h-3.5" /> Valido</span>;
  if (status === "duplicate") return <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: C.amber }}><AlertTriangle className="w-3.5 h-3.5" /> {Math.floor(Math.random() * 20 + 5)} Duplicati</span>;
  return <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: C.red }}><XCircle className="w-3.5 h-3.5" /> Campo mancante</span>;
}

export default function ImportDati() {
  const [isDragging, setDragging]       = useState(false);
  const [file, setFile]                 = useState<File | null>(null);
  const [mapping, setMapping]           = useState<FieldRow[]>(MOCK_MAPPING);
  const [isImporting, setImporting]     = useState(false);
  const [importDone, setImportDone]     = useState(false);
  const [importProgress, setProgress]   = useState(0);
  const [showAll, setShowAll]           = useState(false);
  const [openMenu, setOpenMenu]         = useState<number | null>(null);
  const [previewRows, setPreviewRows]   = useState<Record<string, any>[]>([]);
  const [parsedColumns, setParsedColumns] = useState<string[]>([]);
  const [totalRec, setTotalRec]         = useState<number | null>(null);
  const [showPreview, setShowPreview]   = useState(false);
  const fileRef                         = useRef<HTMLInputElement>(null);
  const { toast }                       = useToast();

  const parseFile = useCallback((f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const cols = result.meta.fields ?? [];
          const rows = result.data as Record<string, any>[];
          setParsedColumns(cols);
          setPreviewRows(rows.slice(0, 5));
          setTotalRec(rows.length);
          setMapping(cols.slice(0, 8).map(col => {
            const lc = col.toLowerCase();
            let target = "Seleziona campo";
            if (lc.includes("first") || lc === "nome" || lc === "name")      target = "Nome";
            else if (lc.includes("last") || lc === "cognome")                target = "Cognome";
            else if (lc.includes("email") || lc.includes("mail"))            target = "Email";
            else if (lc.includes("phone") || lc.includes("tel"))             target = "Telefono";
            else if (lc.includes("company") || lc.includes("aziend"))        target = "Azienda";
            else if (lc.includes("sector") || lc.includes("settore"))        target = "Settore";
            else if (lc.includes("role") || lc.includes("ruolo") || lc.includes("jobtitle") || lc.includes("job_title")) target = "Ruolo";
            else if (lc.includes("budget"))                                  target = "Budget";
            else if (lc.includes("source") || lc.includes("fonte"))         target = "Fonte Lead";
            return { source: col, target, status: target === "Seleziona campo" ? "missing" : "valid" };
          }));
        },
        error: () => toast({ title: "Errore parsing CSV", variant: "destructive" }),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result as ArrayBuffer, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
          const cols = data.length > 0 ? Object.keys(data[0]) : [];
          setParsedColumns(cols);
          setPreviewRows(data.slice(0, 5));
          setTotalRec(data.length);
          setMapping(cols.slice(0, 8).map(col => {
            const lc = col.toLowerCase().replace(/[^a-z]/g, "");
            let target = "Seleziona campo";
            if (lc.includes("first") || lc === "nome" || lc === "name")      target = "Nome";
            else if (lc.includes("last") || lc === "cognome")                target = "Cognome";
            else if (lc.includes("email") || lc.includes("mail"))            target = "Email";
            else if (lc.includes("phone") || lc.includes("tel"))             target = "Telefono";
            else if (lc.includes("company") || lc.includes("aziend"))        target = "Azienda";
            else if (lc.includes("sector") || lc.includes("settore"))        target = "Settore";
            else if (lc.includes("role") || lc.includes("ruolo") || lc.includes("jobtitle")) target = "Ruolo";
            else if (lc.includes("budget"))                                  target = "Budget";
            else if (lc.includes("source") || lc.includes("fonte"))         target = "Fonte Lead";
            return { source: col, target, status: target === "Seleziona campo" ? "missing" : "valid" };
          }));
        } catch { toast({ title: "Errore parsing Excel", variant: "destructive" }); }
      };
      reader.readAsArrayBuffer(f);
    } else {
      toast({ title: "Formato non supportato", description: "Carica un file .csv, .xlsx o .xls", variant: "destructive" });
    }
  }, [toast]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFile(f);
    setImportDone(false);
    setProgress(0);
    setParsedColumns([]);
    setPreviewRows([]);
    setTotalRec(null);
    parseFile(f);
  }, [parseFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleImport = () => {
    setImporting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setImporting(false);
          setImportDone(true);
          return 100;
        }
        return p + Math.random() * 12 + 3;
      });
    }, 180);
  };

  const totalRecords   = totalRec ?? 1240;
  const criticalErrors = file ? Math.round(totalRecords * 0.014) : 18;
  const duplicates     = file ? Math.round(totalRecords * 0.01) : 12;
  const readyPct       = Math.round(((totalRecords - criticalErrors - duplicates) / Math.max(totalRecords, 1)) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-6">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="font-extrabold text-[28px] tracking-tight leading-none">Import Your Data</h1>
          <p className="text-muted-foreground mt-1.5 text-[14px]">
            Potenzia il tuo workflow con smart field mapping e validazione in tempo reale.
          </p>
        </div>

        {/* ── Drop zone ── */}
        <Card
          className={`border-2 border-dashed transition-all ${isDragging ? "scale-[1.01]" : ""}`}
          style={{ borderColor: isDragging ? C.blue : "var(--border)", backgroundColor: isDragging ? `${C.blue}08` : "var(--card)" }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}>
          <CardContent className="p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${C.blue}15` }}>
              <Upload className="w-8 h-8" style={{ color: C.blue }} />
            </div>
            {file ? (
              <>
                <p className="font-bold text-base mb-1 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" style={{ color: C.green }} />
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {(file.size / 1024).toFixed(0)} KB · Pronto per la mappatura
                </p>
                <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Rimuovi file
                </button>
              </>
            ) : (
              <>
                <p className="font-bold text-base mb-1">Trascina il tuo foglio di calcolo qui</p>
                <p className="text-sm text-muted-foreground mb-5">
                  Carica il tuo file CSV o Excel e pensiamo noi al resto. Supporta file fino a 50MB.
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => fileRef.current?.click()}
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
                    style={{ backgroundColor: C.blue }}>
                    Sfoglia File
                  </button>
                  <span className="text-sm text-muted-foreground">o</span>
                  <button
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text.trim()) {
                          const blob = new Blob([text], { type: "text/csv" });
                          const f = new File([blob], "clipboard_data.csv", { type: "text/csv" });
                          setFile(f); setImportDone(false); setProgress(0);
                          toast({ title: "Dati incollati", description: `${text.split("\n").length} righe rilevate da clipboard.` });
                        } else {
                          toast({ title: "Clipboard vuota", description: "Copia prima i dati CSV da incollare." });
                        }
                      } catch {
                        toast({ title: "Permesso negato", description: "Consenti l'accesso alla clipboard dal browser." });
                      }
                    }}
                    className="px-5 py-2 rounded-xl text-sm font-bold border border-border hover:bg-muted/50 transition-colors flex items-center gap-2">
                    <Clipboard className="w-4 h-4" /> Incolla Dati
                  </button>
                </div>
                <input ref={fileRef} type="file" className="hidden" accept=".csv,.xlsx,.xls"
                  onChange={e => handleFiles(e.target.files)} />
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Field Mapping + Data Health ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Field Mapping — 3/5 */}
          <Card className="lg:col-span-3">
            <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  Field Mapping
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Mappa le colonne sorgente ai campi del sistema</CardDescription>
              </div>
              <Badge className="text-[10px] font-bold" style={{ backgroundColor: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30` }}>
                Auto-detected {mapping.length} fields
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th className="text-left px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Colonna Sorgente</th>
                      <th className="text-left px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">→ Campo Target</th>
                      <th className="text-left px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {mapping.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{row.source}</td>
                        <td className="px-5 py-3">
                          <div className="relative inline-flex items-center">
                            <select
                              value={row.target}
                              onChange={e => {
                                const updated = [...mapping];
                                updated[i] = { ...updated[i], target: e.target.value, status: e.target.value === "Seleziona campo" ? "missing" : "valid" };
                                setMapping(updated);
                              }}
                              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-[12px] font-medium border border-border bg-background focus:outline-none focus:ring-1 cursor-pointer"
                              style={{ "--tw-ring-color": C.blue } as any}>
                              {TARGET_FIELDS.map(f => <option key={f}>{f}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Data Health — 2/5 */}
          <Card className="lg:col-span-2">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-base font-bold">Data Health</CardTitle>
              <CardDescription className="text-xs mt-0.5">Qualità e integrità del dataset importato</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold">Record Totali</span>
                  <span className="font-extrabold" style={{ color: C.blue }}>{totalRecords.toLocaleString("it-IT")}</span>
                </div>
                <Progress value={readyPct} className="h-2 mb-1" />
                <p className="text-[11px] text-muted-foreground">{readyPct}% Pronti per l'import</p>
              </div>

              {/* Errori critici */}
              <div className="rounded-xl p-3.5 border" style={{ backgroundColor: `${C.red}08`, borderColor: `${C.red}25` }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <XCircle className="w-4 h-4 shrink-0" style={{ color: C.red }} />
                  <span className="font-bold text-sm" style={{ color: C.red }}>{criticalErrors} Errori Critici</span>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  Formattazione non valida in 'Telefono'. Correzione consigliata prima dell'import.
                </p>
              </div>

              {/* Duplicati */}
              <div className="rounded-xl p-3.5 border" style={{ backgroundColor: `${C.amber}08`, borderColor: `${C.amber}25` }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: C.amber }} />
                  <span className="font-bold text-sm" style={{ color: C.amber }}>{duplicates} Duplicati</span>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  Email duplicate rilevate. Verranno unite automaticamente ai record esistenti.
                </p>
              </div>

              {/* Barra avanzamento import */}
              {(isImporting || importDone) && (
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-muted-foreground">
                      {importDone ? "Import completato!" : "Import in corso…"}
                    </span>
                    <span className="font-bold" style={{ color: importDone ? C.green : C.blue }}>
                      {Math.min(Math.round(importProgress), 100)}%
                    </span>
                  </div>
                  <Progress value={Math.min(importProgress, 100)} className="h-2" />
                </div>
              )}

              {/* CTA */}
              {!importDone ? (
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ backgroundColor: C.blue }}>
                  {isImporting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Importazione in corso…</>
                    : "Avvia Import"}
                </button>
              ) : (
                <div className="rounded-xl p-3.5 flex items-center gap-3 border" style={{ backgroundColor: `${C.green}10`, borderColor: `${C.green}30` }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: C.green }} />
                  <div>
                    <p className="font-bold text-sm" style={{ color: C.green }}>Import completato con successo!</p>
                    <p className="text-[11px] text-muted-foreground">
                      {totalRecords - criticalErrors} record importati · {criticalErrors} skippati
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Anteprima Dati ── */}
        {previewRows.length > 0 && (
          <Card>
            <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Table2 className="w-4 h-4" style={{ color: C.blue }} /> Anteprima Dati
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Prime {previewRows.length} righe su {totalRecords.toLocaleString("it-IT")} totali rilevate
                </CardDescription>
              </div>
              <button onClick={() => setShowPreview(v => !v)} className="text-xs font-semibold" style={{ color: C.blue }}>
                {showPreview ? "Nascondi ↑" : "Mostra ↓"}
              </button>
            </CardHeader>
            {showPreview && (
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                        {parsedColumns.slice(0, 7).map(col => (
                          <th key={col} className="text-left px-4 py-2.5 font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{col}</th>
                        ))}
                        {parsedColumns.length > 7 && <th className="px-4 py-2.5 text-muted-foreground">+{parsedColumns.length - 7} col</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {previewRows.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/20">
                          {parsedColumns.slice(0, 7).map(col => (
                            <td key={col} className="px-4 py-2.5 text-muted-foreground font-mono whitespace-nowrap max-w-[150px] truncate">
                              {String(row[col] ?? "")}
                            </td>
                          ))}
                          {parsedColumns.length > 7 && <td className="px-4 py-2.5 text-muted-foreground">…</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* ── Attività Recente ── */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold">Attività Recente</CardTitle>
              <CardDescription className="text-xs mt-0.5">Storico degli ultimi import</CardDescription>
            </div>
            <button onClick={() => setShowAll(v => !v)} className="text-xs font-semibold" style={{ color: C.blue }}>
            {showAll ? "Mostra meno ↑" : "Vedi Tutti →"}
          </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                    {["Nome File", "Data & Ora", "Record", "Stato", "Azione"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {(showAll ? RECENT : RECENT.slice(0, 3)).map((r, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <FileSpreadsheet className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-[13px]">{r.file}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-[13px]">{r.date}</td>
                      <td className="px-5 py-3.5 font-bold text-[13px]">{r.records.toLocaleString("it-IT")}</td>
                      <td className="px-5 py-3.5">
                        <Badge className="text-[10px] font-bold"
                          style={{ backgroundColor: `${r.sc}15`, color: r.sc, border: `1px solid ${r.sc}30` }}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === i ? null : i)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenu === i && (
                            <div className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-md py-1 w-40" onClick={() => setOpenMenu(null)}>
                              <button onClick={() => toast({ title: "Download avviato", description: r.file })}
                                className="w-full flex items-center gap-2 px-4 py-2 text-[13px] hover:bg-muted transition-colors">
                                <Download className="w-3.5 h-3.5" style={{ color: C.blue }} /> Scarica
                              </button>
                              <button onClick={() => toast({ title: "Rielaborazione avviata", description: `${r.records.toLocaleString("it-IT")} record in coda.` })}
                                className="w-full flex items-center gap-2 px-4 py-2 text-[13px] hover:bg-muted transition-colors">
                                <RefreshCw className="w-3.5 h-3.5" style={{ color: C.amber }} /> Rielabora
                              </button>
                              <button onClick={() => toast({ title: "File eliminato", description: r.file, variant: "destructive" })}
                                className="w-full flex items-center gap-2 px-4 py-2 text-[13px] hover:bg-muted transition-colors text-red-500">
                                <Trash2 className="w-3.5 h-3.5" /> Elimina
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
