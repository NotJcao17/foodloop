"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function NewPostPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", expiration_date: "", pickup_location: "",
    offer_type: "free", price_amount: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) { setForm(f => ({ ...f, [key]: value })); }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("La imagen no puede superar 5MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WEBP"); return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("La foto es obligatoria"); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Upload image
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, file, { contentType: file.type });

    if (uploadError) { setError("Error al subir imagen: " + uploadError.message); setLoading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("post-images").getPublicUrl(path);

    // Create post
    const { error: postError } = await supabase.from("posts").insert({
      user_id: user.id,
      title: form.title,
      description: form.description || null,
      image_url: publicUrl,
      expiration_date: form.expiration_date,
      pickup_location: form.pickup_location,
      offer_type: form.offer_type as "free" | "symbolic",
      price_amount: form.offer_type === "symbolic" && form.price_amount ? parseFloat(form.price_amount) : null,
    });

    if (postError) { setError("Error al publicar: " + postError.message); setLoading(false); return; }
    router.push("/feed");
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition bg-white";
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <div>
      <h1 className="text-xl font-bold text-text mb-4">Nueva publicación</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Photo upload */}
        <div
          onClick={() => fileRef.current?.click()}
          className="relative w-full h-48 rounded-2xl border-2 border-dashed border-border bg-white flex items-center justify-center cursor-pointer hover:border-primary/50 transition overflow-hidden"
        >
          {preview ? (
            <>
              <Image src={preview} alt="" fill className="object-cover rounded-2xl" />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setPreview(null); setFile(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-center text-muted">
              <Camera className="w-8 h-8 mx-auto mb-2 text-primary/60" />
              <p className="text-sm font-medium">Agregar foto <span className="text-danger">*</span></p>
              <p className="text-xs mt-0.5">JPG, PNG o WEBP · máx. 5MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Título <span className="text-danger">*</span></label>
          <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
            placeholder="Ej: Arroz cocido, Pan artesanal..." required maxLength={120} className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Descripción</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="Detalles adicionales, cantidad, estado..." rows={3}
            className={inputCls + " resize-none"} />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Fecha de caducidad <span className="text-danger">*</span></label>
          <input type="date" value={form.expiration_date} onChange={e => set("expiration_date", e.target.value)}
            min={tomorrow} required className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Punto de entrega <span className="text-danger">*</span></label>
          <input type="text" value={form.pickup_location} onChange={e => set("pickup_location", e.target.value)}
            placeholder="Ej: Edificio A, piso 2, departamento 201" required className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Tipo de oferta</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ value: "free", label: "🆓 Gratuito" }, { value: "symbolic", label: "💰 Precio simbólico" }].map(opt => (
              <button key={opt.value} type="button" onClick={() => set("offer_type", opt.value)}
                className={`py-2.5 rounded-xl border text-sm font-medium transition ${
                  form.offer_type === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-primary/50"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
          {form.offer_type === "symbolic" && (
            <input type="number" value={form.price_amount} onChange={e => set("price_amount", e.target.value)}
              placeholder="Precio en pesos (ej: 20)" min="1" step="0.01"
              className={inputCls + " mt-2"} />
          )}
        </div>

        {error && <p className="text-sm text-danger text-center">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition disabled:opacity-60">
          {loading ? "Publicando..." : "🌿 Publicar alimento"}
        </button>
      </form>
    </div>
  );
}
