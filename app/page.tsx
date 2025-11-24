// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
};

const STORAGE_KEY = "vk_simple_crud_v1";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      setItems([]);
    }
  }, []);

  // persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setEditingId(null);
  }

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const t = title.trim();
    if (!t) return alert("Judul wajib diisi");
    if (editingId) {
      setItems((prev) => prev.map((it) => (it.id === editingId ? { ...it, title: t, description } : it)));
      resetForm();
      return;
    }
    const newItem: Item = { id: uid(), title: t, description: description.trim() || undefined, createdAt: new Date().toISOString() };
    setItems((prev) => [newItem, ...prev]);
    resetForm();
  }

  function startEdit(id: string) {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    setEditingId(id);
    setTitle(it.title);
    setDescription(it.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus item ini?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function clearAll() {
    if (!confirm("Hapus semua item?")) return;
    setItems([]);
  }

  const filtered = items.filter(
    (it) => it.title.toLowerCase().includes(query.toLowerCase()) || (it.description || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="page-root">
      <div className="container" style={{ maxWidth: 880, margin: "0 auto" }}>
        <h1 style={{ margin: 0, marginBottom: 16 }}>Halaman Utama — CRUD Simple</h1>

        <form className="card" onSubmit={handleSubmit} style={{ marginBottom: 18 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Judul</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul..."
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e6e9ef", fontSize: 15 }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Deskripsi (opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat..."
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e6e9ef", minHeight: 80 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn primary">{editingId ? "Update" : "Buat"}</button>
            {editingId ? (
              <button type="button" className="btn" onClick={resetForm}>Batal</button>
            ) : (
              <button type="button" className="btn danger" onClick={() => { setTitle(""); setDescription(""); }}>Reset</button>
            )}
          </div>
        </form>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul atau deskripsi..."
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #e6e9ef" }}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ color: "#6b7280" }}>Items: {items.length}</div>
            <button className="btn" onClick={clearAll} disabled={items.length === 0}>Clear All</button>
          </div>
        </div>

        <section style={{ display: "grid", gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 18, textAlign: "center", color: "#6b7280" }}>Belum ada item{query ? " yang cocok." : "."}</div>
          ) : (
            filtered.map((it) => (
              <article key={it.id} className="card" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{it.title}</div>
                  <div style={{ marginTop: 6, color: "#6b7280" }}>{it.description || <i>(tidak ada deskripsi)</i>}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#9ca3af" }}>{new Date(it.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" onClick={() => startEdit(it.id)}>Edit</button>
                    <button className="btn danger" onClick={() => handleDelete(it.id)}>Hapus</button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
