"use client";
import { useState } from "react";
import { Sparkles, ChefHat, Refrigerator, Loader2 } from "lucide-react";

type Tab = "recipe" | "storage";

interface Recipe { name: string; time: string; servings: string; ingredients: string[]; steps: string[] }
interface StorageTips { method: string; temperature: string; container: string; duration: string; tips: string[] }

export default function AiPage() {
  const [tab, setTab] = useState<Tab>("recipe");
  const [recipeInput, setRecipeInput] = useState("");
  const [storageInput, setStorageInput] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [tips, setTips] = useState<StorageTips | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getRecipe() {
    if (!recipeInput.trim()) return;
    setLoading(true); setError(""); setRecipe(null);
    try {
      const res = await fetch("/api/ai/recipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: recipeInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecipe(data);
    } catch (e: any) { setError(e.message ?? "Error al generar receta"); }
    setLoading(false);
  }

  async function getTips() {
    if (!storageInput.trim()) return;
    setLoading(true); setError(""); setTips(null);
    try {
      const res = await fetch("/api/ai/storage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food: storageInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTips(data);
    } catch (e: any) { setError(e.message ?? "Error al obtener consejos"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-text">Asistente IA</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-white border border-border rounded-2xl p-1">
        {([
          { key: "recipe", icon: ChefHat, label: "Recetas" },
          { key: "storage", icon: Refrigerator, label: "Conservación" },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition ${
              tab === t.key ? "bg-primary text-white shadow-sm" : "text-muted hover:text-text"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Recipe tab */}
      {tab === "recipe" && (
        <div>
          <p className="text-sm text-muted mb-3">Dime qué tienes en tu refri y te sugiero una receta 🍳</p>
          <textarea
            value={recipeInput}
            onChange={e => setRecipeInput(e.target.value)}
            placeholder="Ej: arroz, zanahoria, pollo, cebolla..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none mb-3"
          />
          <button onClick={getRecipe} disabled={loading || !recipeInput.trim()}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando receta...</> : "✨ Generar receta"}
          </button>

          {error && <p className="text-danger text-sm text-center mt-3">{error}</p>}

          {recipe && (
            <div className="mt-4 bg-white border border-border rounded-2xl p-4 shadow-sm">
              <h2 className="font-bold text-text text-lg mb-1">{recipe.name}</h2>
              <div className="flex gap-3 text-xs text-muted mb-3">
                <span>⏱ {recipe.time}</span>
                <span>🍽 {recipe.servings}</span>
              </div>
              <div className="mb-3">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Ingredientes</p>
                <ul className="flex flex-col gap-1">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="text-sm text-text flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span> {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Preparación</p>
                <ol className="flex flex-col gap-2">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="text-sm text-text flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step.replace(/^Paso \d+:\s*/i, "")}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Storage tab */}
      {tab === "storage" && (
        <div>
          <p className="text-sm text-muted mb-3">¿Cómo guardar un alimento para que dure más? 🧊</p>
          <input
            type="text"
            value={storageInput}
            onChange={e => setStorageInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && getTips()}
            placeholder="Ej: aguacate a medias, plátanos maduros..."
            className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition mb-3"
          />
          <button onClick={getTips} disabled={loading || !storageInput.trim()}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Consultando...</> : "🔍 Obtener consejos"}
          </button>

          {error && <p className="text-danger text-sm text-center mt-3">{error}</p>}

          {tips && (
            <div className="mt-4 bg-white border border-border rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { icon: "🥶", label: "Método", value: tips.method },
                  { icon: "🌡️", label: "Temperatura", value: tips.temperature },
                  { icon: "📦", label: "Recipiente", value: tips.container },
                  { icon: "⏰", label: "Duración", value: tips.duration },
                ].map(item => (
                  <div key={item.label} className="bg-background rounded-xl p-2.5">
                    <p className="text-xs text-muted mb-0.5">{item.icon} {item.label}</p>
                    <p className="text-sm font-semibold text-text">{item.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Consejos adicionales</p>
                <ul className="flex flex-col gap-1.5">
                  {tips.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-text flex items-start gap-1.5">
                      <span className="text-secondary mt-0.5">✓</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
