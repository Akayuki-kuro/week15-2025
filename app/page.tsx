"use client";

import React, { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
};

const STORAGE_KEY = "simple_crud_items_v1";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // load dari localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: Item[] = JSON.parse(raw);
        setItems(parsed);
      } catch {
        setItems([]);
      }
    }
  }, []);

  // simpan ke localStorage saat items berubah
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setEditingId(null);
  }

  function handleCreateOrUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const t = title.trim();
    if (!t) return alert("Judul wajib diisi");

    if (editingId) {
      setItems((prev) =>
        prev.map((it) => (it.id === editingId ? { ...it, title: t, description, createdAt: it.createdAt } : it))
      );
      resetForm();
      return;
    }

    const newItem: Item = {
      id: uid(),
      title: t,
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
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

  function handleClearAll() {
    if (!confirm("Hapus semua item?")) return;
    setItems([]);
  }

  const filtered = items.filter(
    (it) =>
      it.title.toLowerCase().includes(query.toLowerCase()) ||
      (it.description || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="page-root">
      <div className="container">
        <h1 className="title">CRUD Simple — Halaman Utama</h1>

        <form className="card form" onSubmit={handleCreateOrUpdate}>
          <div className="row">
            <label className="label">Judul</label>
            <input
              className="input"
              placeholder="Masukkan judul..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="row">
            <label className="label">Deskripsi (opsional)</label>
            <textarea
              className="textarea"
              placeholder="Deskripsi singkat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="actions">
            <button className="btn primary" type="submit">
              {editingId ? "Update" : "Buat"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  resetForm();
                }}
              >
                Batal
              </button>
            ) : (
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  setTitle("");
                  setDescription("");
                }}
              >
                Reset
              </button>
            )}
          </div>
        </form>

        <div className="toolbar">
          <input
            className="search"
            placeholder="Cari judul atau deskripsi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="toolbar-right">
            <span className="count">Items: {items.length}</span>
            <button className="btn small" onClick={handleClearAll} disabled={items.length === 0}>
              Clear All
            </button>
          </div>
        </div>

        <section className="list">
          {filtered.length === 0 ? (
            <div className="empty">Tidak ada item{query ? " yang cocok dengan pencarian." : "."}</div>
          ) : (
            filtered.map((it) => (
              <article className="card item" key={it.id}>
                <div className="item-main">
                  <div>
                    <div className="item-title">{it.title}</div>
                    <div className="item-desc">{it.description || <i>(tidak ada deskripsi)</i>}</div>
                  </div>
                  <div className="item-meta">
                    <div className="date">{new Date(it.createdAt).toLocaleString()}</div>
                    <div className="buttons">
                      <button className="btn small" onClick={() => startEdit(it.id)}>
                        Edit
                      </button>
                      <button className="btn small danger" onClick={() => handleDelete(it.id)}>
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      {/* styling */}
      <style jsx>{`
        :root {
          --bg: #f6f8fb;
          --card: #ffffff;
          --muted: #6b7280;
          --accent: #ffffffff;
          --danger: #ef4444;
          --glass: rgba(15, 98, 254, 0.06);
        }
        .page-root {
          min-height: 100vh;
          background: linear-gradient(180deg, #f3f6ff 0%, var(--bg) 100%);
          padding: 32px 16px;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
            Arial;
          color: #ff0000ff;
        }
        .container {
          max-width: 880px;
          margin: 0 auto;
        }
        .title {
          margin: 0 0 18px;
          font-size: 28px;
          font-weight: 700;
        }
        .card {
          background: var(--card);
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(11, 15, 26, 0.06);
          padding: 16px;
        }
        .form {
          margin-bottom: 18px;
        }
        .row {
          margin-bottom: 12px;
        }
        .label {
          display: block;
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 6px;
        }
        .input,
        .textarea,
        .search {
          width: 100%;
          border: 1px solid #e6e9ef;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          background: transparent;
        }
        .input:focus,
        .textarea:focus,
        .search:focus {
          box-shadow: 0 0 0 4px var(--glass);
          border-color: var(--accent);
        }
        .textarea {
          min-height: 88px;
          resize: vertical;
        }
        .actions {
          display: flex;
          gap: 10px;
          margin-top: 6px;
        }
        .btn {
          border: 0;
          background: #f3f4f6;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn.primary {
          background: linear-gradient(90deg, var(--accent), #ffffffff);
          color: white;
        }
        .btn.danger {
          background: linear-gradient(90deg, #ffdddd, #ffd6d6);
          color: var(--danger);
        }
        .btn.small {
          padding: 6px 8px;
          font-size: 13px;
          border-radius: 6px;
        }
        .toolbar {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }
        .toolbar-right {
          margin-left: auto;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .count {
          font-size: 13px;
          color: var(--muted);
        }
        .list {
          display: grid;
          gap: 12px;
        }
        .item {
          padding: 12px;
        }
        .item-main {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }
        .item-title {
          font-weight: 700;
          font-size: 16px;
        }
        .item-desc {
          margin-top: 6px;
          color: var(--muted);
          font-size: 14px;
        }
        .item-meta {
          text-align: right;
          min-width: 160px;
        }
        .date {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 8px;
        }
        .empty {
          padding: 28px;
          text-align: center;
          color: var(--muted);
          background: linear-gradient(180deg, rgba(11, 15, 26, 0.02), rgba(251, 248, 248, 0.01));
          border-radius: 10px;
        }

        /* responsive */
        @media (max-width: 640px) {
          .item-main {
            flex-direction: column;
            align-items: stretch;
          }
          .item-meta {
            text-align: left;
            margin-top: 10px;
          }
        }
      `}</style>
    </main>
  );
}
