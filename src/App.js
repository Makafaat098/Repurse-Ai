import { useState } from "react";

const FORMATS = [
  { id: "twitter", label: "Twitter/X Thread", icon: "𝕏", color: "#1a1a2e" },
  { id: "linkedin", label: "LinkedIn Post", icon: "in", color: "#0077b5" },
  { id: "instagram", label: "Instagram Caption", icon: "📸", color: "#e1306c" },
  { id: "email", label: "Email Newsletter", icon: "✉️", color: "#f4a261" },
  { id: "blog", label: "Blog Intro", icon: "✍️", color: "#2a9d8f" },
  { id: "youtube", label: "YouTube Description", icon: "▶️", color: "#e63946" },
  { id: "whatsapp", label: "WhatsApp Status", icon: "💬", color: "#25d366" },
  { id: "headline", label: "Ad Headline", icon: "📣", color: "#8338ec" },
  { id: "sms", label: "SMS / Push Notif", icon: "📱", color: "#ff6b6b" },
  { id: "summary", label: "TL;DR Summary", icon: "⚡", color: "#ffd166" },
];

const PROMPT_MAP = {
  twitter: `Rewrite this as a compelling Twitter/X thread. Start with a hook tweet, then 4-6 numbered tweets, end with a CTA. Use line breaks. No hashtag spam.`,
  linkedin: `Rewrite this as a professional LinkedIn post. Start with a bold hook line, use short paragraphs, add 3-5 relevant hashtags at the end. Conversational but insightful tone.`,
  instagram: `Rewrite this as an Instagram caption. Fun, engaging, with emojis. End with a question to drive comments. Add 10 relevant hashtags at the bottom.`,
  email: `Rewrite this as an email newsletter section. Include: Subject line, preview text, body paragraphs, and a CTA button text. Warm and personal tone.`,
  blog: `Write an engaging blog post introduction (150-200 words) based on this content. Hook the reader, state the problem, promise the solution.`,
  youtube: `Write a YouTube video description based on this content. Include: 2-3 paragraph summary, timestamps placeholder, and relevant keywords naturally placed.`,
  whatsapp: `Rewrite this as a short, punchy WhatsApp status or broadcast message. Max 3-4 lines. Conversational. Can use emojis.`,
  headline: `Write 5 different ad headlines based on this content. Each under 10 words. Focus on benefit, urgency, or curiosity. Number them.`,
  sms: `Rewrite this as a short SMS or push notification. Max 160 characters. Clear CTA. No fluff.`,
  summary: `Write a TL;DR summary of this content in 3-5 bullet points. Each bullet = one key insight. Start each with "•".`,
};

export default function App() {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [copied, setCopied] = useState(null);
  const [generating, setGenerating] = useState(false);

  const toggleFormat = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelected(FORMATS.map((f) => f.id));
  const clearAll = () => setSelected([]);

  const generateOne = async (formatId) => {
    if (!input.trim()) return;
    setLoading((prev) => ({ ...prev, [formatId]: true }));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: PROMPT_MAP[formatId],
          content: input,
        }),
      });
      const data = await res.json();
      const text = data.text || data.error || "Error generating content.";
      setResults((prev) => ({ ...prev, [formatId]: text }));
    } catch {
      setResults((prev) => ({ ...prev, [formatId]: "Error. Please try again." }));
    }
    setLoading((prev) => ({ ...prev, [formatId]: false }));
  };

  const generateAll = async () => {
    if (!input.trim() || selected.length === 0) return;
    setGenerating(true);
    setResults({});
    setActiveTab(selected[0]);
    await Promise.all(selected.map((id) => generateOne(id)));
    setGenerating(false);
  };

  const copyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const doneFormats = selected.filter((id) => results[id] && !loading[id]);
  const loadingFormats = selected.filter((id) => loading[id]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#f0ede8",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      <div style={{
        borderBottom: "1px solid #1e1e2e",
        padding: "28px 40px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(180deg, #0f0f1a 0%, #0a0a0f 100%)",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ background: "linear-gradient(135deg, #f4a261, #e63946)", borderRadius: "10px", padding: "6px 10px", fontSize: "20px" }}>♻️</span>
            <span style={{ fontSize: "22px", fontWeight: "bold", background: "linear-gradient(135deg, #f4a261 30%, #e63946 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RepurseAI</span>
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px", fontFamily: "monospace" }}>1 post → 10 formats · Powered by Claude AI</div>
        </div>
        <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", color: "#888", fontFamily: "monospace" }}>MVP v1.0</div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: "36px" }}>
          <label style={{ display: "block", fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "12px", fontFamily: "monospace" }}>
            Apna Original Content Paste Karein
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Yahan apna blog post, article, ya koi bhi content paste karein... AI isko 10 alag formats mein convert kar dega ✨"
            style={{ width: "100%", minHeight: "160px", background: "#0f0f1a", border: "1px solid #2a2a3e", borderRadius: "12px", color: "#f0ede8", fontSize: "15px", padding: "20px", resize: "vertical", outline: "none", fontFamily: "Georgia, serif", lineHeight: "1.7", boxSizing: "border-box" }}
          />
          <div style={{ textAlign: "right", fontSize: "12px", color: "#444", marginTop: "6px", fontFamily: "monospace" }}>{input.length} characters</div>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", fontFamily: "monospace" }}>
              Formats Select Karein ({selected.length}/{FORMATS.length})
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={selectAll} style={{ background: "transparent", border: "1px solid #2a2a3e", color: "#888", padding: "5px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontFamily: "monospace" }}>Select All</button>
              <button onClick={clearAll} style={{ background: "transparent", border: "1px solid #2a2a3e", color: "#888", padding: "5px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontFamily: "monospace" }}>Clear</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
            {FORMATS.map((f) => {
              const isSel = selected.includes(f.id);
              const isDone = !!results[f.id];
              const isLoad = !!loading[f.id];
              return (
                <button key={f.id} onClick={() => toggleFormat(f.id)} style={{ background: isSel ? `${f.color}22` : "#0f0f1a", border: `1px solid ${isSel ? f.color : "#2a2a3e"}`, borderRadius: "10px", padding: "12px 14px", cursor: "pointer", textAlign: "left", color: isSel ? "#f0ede8" : "#666", transition: "all 0.2s", position: "relative" }}>
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>{f.icon}</div>
                  <div style={{ fontSize: "12px", fontFamily: "monospace", lineHeight: "1.3" }}>{f.label}</div>
                  {isDone && <div style={{ position: "absolute", top: "6px", right: "8px", fontSize: "10px", color: "#2a9d8f" }}>✓</div>}
                  {isLoad && <div style={{ position: "absolute", top: "6px", right: "8px", fontSize: "10px", color: f.color }}>⟳</div>}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={generateAll} disabled={!input.trim() || selected.length === 0 || generating} style={{ width: "100%", padding: "18px", background: generating ? "#1a1a2e" : "linear-gradient(135deg, #f4a261, #e63946)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "16px", fontWeight: "bold", cursor: generating || !input.trim() || selected.length === 0 ? "not-allowed" : "pointer", letterSpacing: "1px", fontFamily: "monospace", opacity: !input.trim() || selected.length === 0 ? 0.4 : 1, marginBottom: "40px" }}>
          {generating ? `⟳ Generating ${loadingFormats.length} formats...` : `✨ Generate ${selected.length} Format${selected.length !== 1 ? "s" : ""}`}
        </button>

        {doneFormats.length > 0 && (
          <div>
            <div style={{ fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", fontFamily: "monospace", marginBottom: "16px" }}>
              Generated Content ({doneFormats.length} ready)
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              {doneFormats.map((id) => {
                const f = FORMATS.find((x) => x.id === id);
                return (
                  <button key={id} onClick={() => setActiveTab(id)} style={{ background: activeTab === id ? `${f.color}33` : "transparent", border: `1px solid ${activeTab === id ? f.color : "#2a2a3e"}`, color: activeTab === id ? "#f0ede8" : "#666", padding: "7px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontFamily: "monospace" }}>
                    {f.icon} {f.label}
                  </button>
                );
              })}
            </div>
            {activeTab && results[activeTab] && (
              <div style={{ background: "#0f0f1a", border: `1px solid ${FORMATS.find((f) => f.id === activeTab)?.color || "#2a2a3e"}`, borderRadius: "12px", padding: "28px", position: "relative" }}>
                <button onClick={() => copyText(activeTab, results[activeTab])} style={{ position: "absolute", top: "16px", right: "16px", background: copied === activeTab ? "#2a9d8f22" : "#1a1a2e", border: `1px solid ${copied === activeTab ? "#2a9d8f" : "#2a2a3e"}`, color: copied === activeTab ? "#2a9d8f" : "#888", padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontFamily: "monospace" }}>
                  {copied === activeTab ? "✓ Copied!" : "Copy"}
                </button>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "14px", lineHeight: "1.8", color: "#d4d0c8", fontFamily: "Georgia, serif", paddingRight: "80px" }}>
                  {results[activeTab]}
                </pre>
              </div>
            )}
          </div>
        )}

        {Object.keys(results).length === 0 && !generating && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#333" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>♻️</div>
            <div style={{ fontFamily: "monospace", fontSize: "14px" }}>Content paste karein, formats choose karein, generate dabao</div>
          </div>
        )}
      </div>
    </div>
  );
  }
