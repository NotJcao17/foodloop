"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", user_type: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();

    // 1. Crear usuario en Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, user_type: form.user_type } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Crear perfil via API Route (usa service role, bypasea RLS)
    if (data.user) {
      await fetch("/api/auth/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.user.id,
          name: form.name,
          user_type: form.user_type,
        }),
      });
    }

    router.push("/feed");
    router.refresh();
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
      <h2 className="text-xl font-bold text-text mb-5">Crear cuenta</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Nombre</label>
          <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="Tu nombre" required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Correo electrónico</label>
          <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
            placeholder="tu@correo.com" required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Contraseña</label>
          <input type="password" value={form.password} onChange={e => set("password", e.target.value)}
            placeholder="Mínimo 6 caracteres" required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">Tipo de cuenta</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "student", label: "🎓 Estudiante" },
              { value: "cafeteria", label: "🍽️ Cafetería" },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set("user_type", opt.value)}
                className={`py-2.5 rounded-xl border text-sm font-medium transition ${
                  form.user_type === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-danger text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition disabled:opacity-60"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <p className="text-center text-sm text-muted mt-4">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
