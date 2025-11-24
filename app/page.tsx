"use client";

import React, { useEffect, useState } from "react";

type Note = {
  id: number;
  title: string;
  content?: string | null;
  createdAt: string;
};

export default function Page() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function fetchNotes() {
    setLoading(true);
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function createNote(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!title.trim()) return alert("Title required");
    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim() || null }),
    });
    if (!res.ok) {
      alert("Create failed");
      setSaving(false);
      return;
    }
    setTitle("");
    setContent("");
    await fetchNotes();
    setSaving(false);
  }

  async function startEdit(note: Note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function updateNote(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    const res = await fetch(`/api/notes/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim() || null }),
    });
    if (!res.ok) {
      alert("Update failed");
      setSaving(false);
      return;
    }
    setEditingId(null);
    setTitle("");
    setContent("");
    await fetchNotes();
    setSaving(false);
  }

  async function deleteNote(id: number) {
    if (!confirm("Hapus note ini?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Hapus gagal");
    await fetchNotes();
  }

  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Halaman Utama — Notes (CRUD sederhana)</h1>

      <form onSubmit={editingId ? updateNote : createNote} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}>
          <input
            placeholder="Judul"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <textarea
            placeholder="Isi (opsional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: "100%", padding: 8, height: 100, fontSize: 14 }}
          />
        </div>
        <div>
          <button type="submit" disabled={saving} style={{ padding: "8px 12px", marginRight: 8 }}>
            {editingId ? (saving ? "Menyimpan..." : "Update") : saving ? "Menyimpan..." : "Buat"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setContent("");
              }}
              style={{ padding: "8px 12px" }}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <section>
        <h2>Daftar Notes</h2>
        {loading ? (
          <p>Loading...</p>
        ) : notes.length === 0 ? (
          <p>Belum ada note.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {notes.map((n) => (
              <li
                key={n.id}
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  borderRadius: 6,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <strong>{n.title}</strong>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>
                      {n.content || <em>(no content)</em>}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ marginLeft: 16 }}>
                    <button onClick={() => startEdit(n)} style={{ marginRight: 8 }}>
                      Edit
                    </button>
                    <button onClick={() => deleteNote(n.id)}>Hapus</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
