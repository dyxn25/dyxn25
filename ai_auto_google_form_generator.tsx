import React, { useState, useRef } from 'react';
import { 
  FileText, 
  MessageSquare, 
  Upload, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  FileSpreadsheet,
  File as FileIcon,
  Info,
  Download,
  Image as ImageIcon,
  Link2
} from 'lucide-react';

// --- API Configuration ---
// Note: In this environment, an empty string API key is automatically populated by the platform.
const API_KEY = ""; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

export default function App() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'
  const [file, setFile] = useState(null);
  const [textPrompt, setTextPrompt] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [questions, setQuestions] = useState([]);
  const [appsScriptCode, setAppsScriptCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Logo states
  const [logoSrc, setLogoSrc] = useState('dy logo_2.jpg');
  const [logoError, setLogoError] = useState(false);
  const logoInputRef = useRef(null);

  const fileInputRef = useRef(null);

  // --- Handlers ---

  React.useEffect(() => {
    if (questions.length > 0) {
      setAppsScriptCode(generateAppsScript(questions));
    }
  }, [questions]);

  const handleImageBase64Change = (index, newBase64) => {
    const newQs = [...questions];
    newQs[index].imageBase64 = newBase64;
    setQuestions(newQs);
  };

  const downloadXLSTemplate = () => {
    const content = `<html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <tr>
            <th>Pertanyaan</th><th>Opsi A</th><th>Opsi B</th><th>Opsi C</th><th>Opsi D</th><th>Opsi E</th><th>Kunci Jawaban</th><th>Poin</th><th>Gambar (Paste di sini)</th>
          </tr>
          <tr>
            <td>Tag HTML yang digunakan untuk membuat tautan (link) adalah...</td>
            <td>&lt;a&gt;</td><td>&lt;link&gt;</td><td>&lt;href&gt;</td><td>&lt;url&gt;</td><td>&lt;p&gt;</td><td>&lt;a&gt;</td><td>10</td><td></td>
          </tr>
          <tr>
            <td>Topologi jaringan dimana semua komputer dihubungkan pada satu kabel utama disebut topologi...</td>
            <td>Star</td><td>Bus</td><td>Ring</td><td>Mesh</td><td>Tree</td><td>Bus</td><td>10</td><td>[Paste Gambar Topologi Bus di sini]</td>
          </tr>
        </table>
      </body>
    </html>`;
    
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_soal_informatika.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadDOCTemplate = () => {
    const content = `PANDUAN FORMAT SOAL (Hapus bagian ini sebelum upload)
Pastikan format mengikuti aturan berikut:
1. Pertanyaan diawali dengan kata "Pertanyaan:"
2. Pilihan jawaban diawali huruf kapital dan titik (A., B., C., D., E.)
3. Kunci jawaban ditulis "Kunci: [Huruf]"
4. Poin ditulis "Poin: [Angka]"
5. Gambar dapat langsung di-paste di bawah pertanyaan.

--- TEMPLATE SOAL ---

Pertanyaan: Tag HTML yang digunakan untuk membuat tautan (link) adalah...
A. <a>
B. <link>
C. <href>
D. <url>
E. <p>
Kunci: A
Poin: 10

Pertanyaan: Topologi jaringan dimana semua komputer dihubungkan pada satu kabel utama disebut topologi...
[Paste Gambar Topologi Bus Di Sini]
A. Star
B. Bus
C. Ring
D. Mesh
E. Tree
Kunci: B
Poin: 10`;
    
    const blob = new Blob([content], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_soal_informatika.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setLogoSrc(url);
      setLogoError(false); // Reset error state on new upload
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = ['.pdf', '.docx', '.xlsx', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      
      // Basic validation (can be more robust depending on exact mime types)
      const isValid = validTypes.some(type => droppedFile.name.toLowerCase().endsWith(type.replace('application/', '')) || droppedFile.type === type);
      
      if (isValid || !droppedFile.type) { // Fallback if type is empty but extension is okay
         setFile(droppedFile);
      } else {
         alert("Mohon unggah file PDF, DOCX, atau XLSX.");
      }
    }
  };

  const generateAppsScript = (generatedQuestions) => {
    let script = `/**\n * Script otomatis dibuat oleh AI Auto Google Form Generator\n * Cara Penggunaan:\n * 1. Buka https://script.google.com/ dan buat project baru.\n * 2. Hapus semua kode yang ada, lalu tempel kode ini.\n * 3. Klik tombol Run (Jalankan) - ikon segitiga di atas.\n * 4. Berikan izin akses jika diminta.\n * 5. Cek Log Eksekusi untuk mendapatkan URL Edit Form Anda.\n */\n\n`;
    script += `function buatFormQuizAI() {\n`;
    script += `  // Membuat form baru\n`;
    script += `  var formTitle = 'Quiz Baru dari AI - ' + new Date().toLocaleDateString('id-ID');\n`;
    script += `  var form = FormApp.create(formTitle);\n`;
    script += `  form.setIsQuiz(true);\n`;
    script += `  form.setDescription('Formulir ini dibuat secara otomatis.');\n\n`;

    generatedQuestions.forEach((q, index) => {
      script += `  // Soal ${index + 1}\n`;
      if (q.imageBase64 && q.imageBase64.trim() !== "") {
        script += `  try {\n`;
        script += `    var base64Data${index} = '${q.imageBase64.trim()}';\n`;
        script += `    var blob${index} = Utilities.newBlob(Utilities.base64Decode(base64Data${index}), 'image/png', 'image_soal_${index+1}.png');\n`;
        script += `    form.addImageItem().setImage(blob${index}).setTitle('Perhatikan gambar untuk soal di bawah:');\n`;
        script += `  } catch(e) {\n`;
        script += `    Logger.log('Gagal memuat gambar untuk soal ${index + 1}. Pastikan string Base64 valid. Error: ' + e.message);\n`;
        script += `  }\n`;
      }
      script += `  var item${index} = form.addMultipleChoiceItem();\n`;
      script += `  item${index}.setTitle(${JSON.stringify(q.question)});\n`;
      script += `  item${index}.setRequired(true);\n`;
      script += `  item${index}.setChoices([\n`;
      
      q.options.forEach(opt => {
        const isCorrect = opt === q.answer;
        script += `    item${index}.createChoice(${JSON.stringify(opt)}, ${isCorrect ? 'true' : 'false'}),\n`;
      });
      
      script += `  ]);\n\n`;
    });

    script += `  Logger.log('====================================');\n`;
    script += `  Logger.log('BERHASIL! Form Anda telah dibuat.');\n`;
    script += `  Logger.log('Klik URL ini untuk mengedit form:');\n`;
    script += `  Logger.log(form.getEditUrl());\n`;
    script += `  Logger.log('====================================');\n`;
    script += `}\n`;
    return script;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(appsScriptCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin teks: ', err);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setAppsScriptCode('');

    // --- Mock Data Simulasi jika API_KEY kosong ---
    if (!API_KEY) {
      setTimeout(() => {
        setQuestions([
          {
            question: "Tag HTML yang digunakan untuk membuat tautan (link) adalah...",
            options: ["<a>", "<link>", "<href>", "<url>", "<p>"],
            answer: "<a>",
            imageBase64: ""
          },
          {
            question: "Topologi jaringan dimana semua komputer dihubungkan pada satu kabel utama disebut topologi...",
            options: ["Star", "Bus", "Ring", "Mesh", "Tree"],
            answer: "Bus",
            imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
          }
        ]);
        setIsLoading(false);
      }, 1500);
      return;
    }
    // ----------------------------------------------

    let prompt = '';

    if (activeTab === 'upload') {
      if (!file) {
        setError('Mohon pilih dokumen terlebih dahulu.');
        setIsLoading(false);
        return;
      }
      // Mocking extraction by using the filename
      prompt = `Buatkan 5 soal pilihan ganda berdasarkan topik yang mungkin terkait dengan nama dokumen ini: "${file.name}". Jika nama dokumen tidak jelas, buatkan soal pengetahuan umum acak.`;
    } else {
      if (!textPrompt.trim()) {
        setError('Mohon masukkan instruksi untuk AI.');
        setIsLoading(false);
        return;
      }
      prompt = textPrompt;
    }

    const systemInstruction = "Anda adalah asisten pembuat soal ahli. Buatkan soal pilihan ganda berdasarkan instruksi pengguna. Anda HARUS mengembalikan HANYA struktur JSON murni sesuai skema yang diminta, tanpa teks tambahan (markdown) di sekitarnya. Pastikan pilihan ganda berjumlah 4-5 opsi. Ekstrak gambar (jika ada) lalu ubah menjadi string format Base64.";

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING", description: "Teks pertanyaan" },
              options: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "Daftar 4-5 pilihan jawaban"
              },
              answer: { type: "STRING", description: "Kunci jawaban yang benar, teksnya harus sama persis dengan salah satu di dalam options" },
              imageBase64: { type: "STRING", description: "String Base64 gambar jika ada di dalam file dokumen. Kosongkan jika tidak ada gambar." }
            },
            required: ["question", "options", "answer"]
          }
        }
      }
    };

    try {
      // Implement basic retry logic with backoff as requested for API calls
      const maxRetries = 3;
      let attempt = 0;
      let response;
      let success = false;

      while (attempt < maxRetries && !success) {
        try {
          response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          success = true;
        } catch (e) {
          attempt++;
          if (attempt >= maxRetries) throw e;
          // Exponential backoff: 1s, 2s, 4s...
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) {
        const jsonText = result.candidates[0].content.parts[0].text;
        
        try {
          const parsedQuestions = JSON.parse(jsonText);
          
          // Basic validation to ensure schema wasn't hallucinated
          if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
            throw new Error("AI tidak mengembalikan daftar soal yang valid.");
          }

          setQuestions(parsedQuestions);

        } catch (parseError) {
          console.error("Parse error:", jsonText);
          setError("Gagal membaca format JSON dari AI. Silakan coba lagi.");
        }
      } else {
        setError("AI tidak merespon dengan benar. Silakan coba lagi.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menghubungi API. Cek koneksi Anda atau coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileIcon className="w-8 h-8 text-white/40" />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-white/60" />;
    if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet className="w-8 h-8 text-white/60" />;
    if (ext === 'docx' || ext === 'doc') return <FileText className="w-8 h-8 text-white/60" />;
    return <FileIcon className="w-8 h-8 text-white/40" />;
  };

  return (
    <div className="min-h-screen bg-[#1a1b1e] text-slate-300 font-sans p-4 sm:p-8 relative overflow-hidden flex flex-col items-center">
      {/* Cinematic Top Light Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-white/5 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="w-full max-w-4xl mx-auto space-y-12 relative z-10 my-auto py-12">
        
        {/* Header */}
        <header className="text-center space-y-6 flex flex-col items-center">
          <div 
            className="relative cursor-pointer group flex flex-col items-center" 
            onClick={() => logoInputRef.current?.click()}
            title="Klik untuk mengubah logo"
          >
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={logoInputRef}
              onChange={handleLogoChange}
            />
            {!logoError && logoSrc ? (
              <img 
                src={logoSrc} 
                alt="Logo" 
                className="w-12 h-12 object-contain opacity-80 transition-all group-hover:opacity-100 group-hover:scale-105 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center text-center p-1 transition-all group-hover:bg-white/10">
                <span className="text-[8px] text-white/50 uppercase tracking-wider">Logo</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-light text-white/90 tracking-[0.2em] uppercase">
              Form Generator
            </h1>
            <p className="text-white/40 max-w-md mx-auto text-[10px] sm:text-xs tracking-widest uppercase">
              The smart tool that crafts questions
            </p>
          </div>
        </header>

        {/* Input Section */}
        <div className="bg-[#232428]/80 backdrop-blur-md rounded-sm border border-white/5 overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-3 py-5 px-4 text-[11px] font-medium tracking-widest uppercase transition-all duration-300
                ${activeTab === 'upload' 
                  ? 'text-white bg-white/5 border-b border-white/20' 
                  : 'text-white/40 hover:text-white/70 hover:bg-black/20'}`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Document
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center gap-3 py-5 px-4 text-[11px] font-medium tracking-widest uppercase transition-all duration-300
                ${activeTab === 'text' 
                  ? 'text-white bg-white/5 border-b border-white/20' 
                  : 'text-white/40 hover:text-white/70 hover:bg-black/20'}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Instruct AI
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8 sm:p-12">
            {activeTab === 'upload' ? (
              <div className="space-y-12">
                <div 
                  className={`border border-dashed p-10 text-center transition-all duration-300 cursor-pointer
                    ${file ? 'border-white/20 bg-white/5' : 'border-white/10 hover:border-white/30 bg-black/20'}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !file && fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.xlsx" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center gap-4">
                      {getFileIcon(file.name)}
                      <div className="space-y-1">
                        <p className="font-light text-white/90 text-sm tracking-wide">{file.name}</p>
                        <p className="text-[10px] text-white/40 tracking-wider">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 mt-2 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <Upload className="w-6 h-6 text-white/30" />
                      <div className="space-y-2">
                        <p className="font-light text-white/70 text-sm tracking-wide">Drop file here or click to browse</p>
                        <p className="text-[10px] text-white/30 tracking-widest uppercase">Supports .pdf, .docx, .xlsx</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Styled Reference-like Footer Guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                  {/* Excel */}
                  <div className="space-y-3 group">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-light text-white/20">01.</span>
                      <h4 className="text-[10px] font-semibold tracking-widest text-white/60 uppercase">Excel Format</h4>
                    </div>
                    <p className="text-[10px] text-white/30 leading-relaxed font-light">
                      Col 1: Question. Col 2-6: Options. Col 7: Key. Col 8: Points. Col 9: Image Base64 (Optional).
                    </p>
                    <button onClick={downloadXLSTemplate} className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-1.5 mt-2">
                      <Download className="w-3 h-3" /> Get XLS Template
                    </button>
                  </div>

                  {/* Word */}
                  <div className="space-y-3 group">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-light text-white/20">02.</span>
                      <h4 className="text-[10px] font-semibold tracking-widest text-white/60 uppercase">Word Format</h4>
                    </div>
                    <p className="text-[10px] text-white/30 leading-relaxed font-light">
                      Format "Pertanyaan: [Teks]". Options A-E. "Kunci: [Huruf]". "Poin: [Angka]". Paste image below question.
                    </p>
                    <button onClick={downloadDOCTemplate} className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-1.5 mt-2">
                      <Download className="w-3 h-3" /> Get DOC Template
                    </button>
                  </div>

                  {/* Image Info */}
                  <div className="space-y-3 group">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-light text-white/20">03.</span>
                      <h4 className="text-[10px] font-semibold tracking-widest text-white/60 uppercase">Images</h4>
                    </div>
                    <p className="text-[10px] text-white/30 leading-relaxed font-light">
                      Simply paste images directly into your Excel cells or Word document. AI handles the extraction automatically.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-6">
                <label htmlFor="prompt" className="block text-[10px] font-semibold tracking-widest text-white/50 uppercase">
                  Generation Instructions
                </label>
                <textarea
                  id="prompt"
                  rows={5}
                  className="w-full px-5 py-4 bg-black/20 border border-white/10 text-white/90 text-sm font-light placeholder-white/20 focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all resize-none outline-none"
                  placeholder="E.g., Generate 10 multiple choice questions about web development..."
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-sm flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs font-light">{error}</p>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-10 flex justify-center border-t border-white/5 pt-10">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="group relative px-8 py-3 bg-transparent text-white text-xs tracking-widest uppercase transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/30 transition-all duration-500" />
                
                <div className="relative flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                      <span className="font-light">Processing</span>
                    </>
                  ) : (
                    <>
                      <span className="font-light">{activeTab === 'upload' ? 'Extract & Generate' : 'Generate'}</span>
                      <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {questions.length > 0 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pt-8 border-t border-white/5">
            
            {/* Preview Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-light text-white/80 tracking-widest uppercase">
                  Preview
                </h2>
                <span className="text-[10px] tracking-widest text-white/40 uppercase">{questions.length} Items</span>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-[#232428]/50 p-8 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex gap-4 mb-6">
                      <span className="text-white/20 font-light text-lg leading-none">
                        {(idx + 1).toString().padStart(2, '0')}.
                      </span>
                      <p className="font-light text-white/90 text-sm leading-relaxed">{q.question}</p>
                    </div>

                    {/* Image Base64 Editor */}
                    <div className="mb-6 pl-8 flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={q.imageBase64 || ''}
                          onChange={(e) => handleImageBase64Change(idx, e.target.value)}
                          placeholder="Image Base64 (Optional)"
                          className="w-full pb-1 text-xs bg-transparent border-b border-white/10 text-white/60 placeholder-white/20 focus:border-white/40 outline-none font-mono"
                        />
                      </div>
                      {q.imageBase64 && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-black/40 border border-white/10 overflow-hidden" title="Preview Gambar">
                           <img 
                              src={`data:image/png;base64,${q.imageBase64}`} 
                              alt="Preview" 
                              className="w-full h-full object-cover opacity-80"
                              onError={(e) => e.target.style.display = 'none'}
                           />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = opt === q.answer;
                        return (
                          <div 
                            key={optIdx} 
                            className={`px-4 py-3 text-xs font-light flex items-center justify-between transition-colors
                              ${isCorrect 
                                ? 'bg-white/10 border border-white/20 text-white' 
                                : 'bg-black/20 border border-transparent text-white/50'}`}
                          >
                            <span className="flex gap-3">
                              <span className="opacity-40">{String.fromCharCode(65 + optIdx)}.</span>
                              {opt}
                            </span>
                            {isCorrect && <span className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_5px_rgba(255,255,255,0.8)]" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export / Apps Script Section */}
            <div className="bg-black/40 border border-white/10 overflow-hidden relative">
              <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
                <h3 className="text-xs font-light text-white/80 tracking-widest uppercase">Script Output</h3>
                <button
                  onClick={copyToClipboard}
                  className={`text-[10px] tracking-widest uppercase transition-colors flex items-center gap-2
                    ${isCopied ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
                >
                  {isCopied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              
              <div className="p-8">
                <pre className="text-[11px] font-mono font-light text-white/60 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent leading-relaxed">
                  <code>{appsScriptCode}</code>
                </pre>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}