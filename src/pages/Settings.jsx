import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { buildForkliftTemplate, buildTruckTemplate } from '../data/defaultTemplates.js';
import {
  getTemplatesForUser,
  normalizeTemplateCategories,
  saveTemplate,
  seedDefaultTemplates,
  updateTemplateDoc,
} from '../services/templates.js';
import { AppShell } from '../components/AppShell.jsx';
import { Header } from '../components/Header.jsx';
import styles from './Settings.module.css';

function reorder(list, from, to) {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy.map((x, i) => ({ ...x, order: i }));
}

function cloneTemplate(t) {
  return JSON.parse(JSON.stringify(t));
}

export function SettingsPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [activeType, setActiveType] = useState('truck');
  const [draft, setDraft] = useState(null);
  const [draftDirty, setDraftDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const list = await getTemplatesForUser(user.uid);
      setTemplates(list);
    } catch (e) {
      setError(e.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const current = templates.find((t) => t.vehicleType === activeType) || null;

  useEffect(() => {
    if (current) {
      setDraft(cloneTemplate(current));
      setDraftDirty(false);
    } else {
      setDraft(null);
    }
  }, [current, activeType]);

  async function handleSeed() {
    if (!user) return;
    setSeeding(true);
    setMessage('');
    setError('');
    try {
      await seedDefaultTemplates(user.uid);
      await load();
      setMessage('Default templates ready.');
    } catch (e) {
      setError(e.message || 'Seed failed');
    } finally {
      setSeeding(false);
    }
  }

  async function persistDraft() {
    if (!user || !draft) return;
    setSaving(true);
    setError('');
    try {
      await saveTemplate(user.uid, draft.id, {
        name: draft.name,
        vehicleType: draft.vehicleType,
        categories: draft.categories,
      });
      await load();
      setDraftDirty(false);
      setMessage('Template saved.');
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function updateCategory(catIndex, patch) {
    if (!draft) return;
    const cats = [...(draft.categories || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    cats[catIndex] = { ...cats[catIndex], ...patch };
    setDraft({ ...draft, categories: cats });
    setDraftDirty(true);
    setMessage('');
  }

  function updateItem(catIndex, itemIndex, patch) {
    if (!draft) return;
    const cats = [...(draft.categories || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const items = [...(cats[catIndex].items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    items[itemIndex] = { ...items[itemIndex], ...patch };
    cats[catIndex] = { ...cats[catIndex], items };
    setDraft({ ...draft, categories: cats });
    setDraftDirty(true);
    setMessage('');
  }

  function moveCategory(catIndex, dir) {
    if (!draft) return;
    const cats = [...(draft.categories || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const to = catIndex + dir;
    if (to < 0 || to >= cats.length) return;
    setDraft({ ...draft, categories: reorder(cats, catIndex, to) });
    setDraftDirty(true);
    setMessage('');
  }

  function moveItem(catIndex, itemIndex, dir) {
    if (!draft) return;
    const cats = [...(draft.categories || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const items = [...(cats[catIndex].items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const to = itemIndex + dir;
    if (to < 0 || to >= items.length) return;
    cats[catIndex] = { ...cats[catIndex], items: reorder(items, itemIndex, to) };
    setDraft({ ...draft, categories: cats });
    setDraftDirty(true);
    setMessage('');
  }

  function addCategory() {
    if (!draft) return;
    const cats = [...(draft.categories || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    cats.push({
      id: `cat_${crypto.randomUUID()}`,
      name: 'New category',
      order: cats.length,
      items: [
        {
          id: `item_${crypto.randomUUID()}`,
          label: 'New item',
          order: 0,
          active: true,
        },
      ],
    });
    setDraft({ ...draft, categories: cats });
    setDraftDirty(true);
    setMessage('');
  }

  function deleteCategory(catIndex) {
    if (!draft) return;
    const cats = [...(draft.categories || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    cats.splice(catIndex, 1);
    setDraft({ ...draft, categories: cats.map((c, i) => ({ ...c, order: i })) });
    setDraftDirty(true);
    setMessage('');
  }

  function addItem(catIndex) {
    if (!draft) return;
    const cats = [...(draft.categories || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const items = [...(cats[catIndex].items || [])];
    items.push({
      id: `item_${crypto.randomUUID()}`,
      label: 'New item',
      order: items.length,
      active: true,
    });
    cats[catIndex] = { ...cats[catIndex], items };
    setDraft({ ...draft, categories: cats });
    setDraftDirty(true);
    setMessage('');
  }

  function deleteItem(catIndex, itemIndex) {
    if (!draft) return;
    const cats = [...(draft.categories || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const items = [...(cats[catIndex].items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    items.splice(itemIndex, 1);
    cats[catIndex] = { ...cats[catIndex], items: items.map((it, i) => ({ ...it, order: i })) };
    setDraft({ ...draft, categories: cats });
    setDraftDirty(true);
    setMessage('');
  }

  async function resetTemplateFromSeed() {
    if (!user || !current) return;
    setSaving(true);
    setError('');
    try {
      const built = activeType === 'truck' ? buildTruckTemplate() : buildForkliftTemplate();
      built.categories = normalizeTemplateCategories(built.categories);
      await updateTemplateDoc(current.id, {
        name: built.name,
        vehicleType: built.vehicleType,
        categories: built.categories,
      });
      await load();
      setMessage('Template reset to defaults.');
    } catch (e) {
      setError(e.message || 'Reset failed');
    } finally {
      setSaving(false);
    }
  }

  const catsSorted = draft
    ? [...(draft.categories || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  return (
    <AppShell>
      <Header
        title="Settings"
        left={
          <Link to="/" className={styles.back}>
            ← Home
          </Link>
        }
      />
      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.h2}>Checklist templates</h2>
          <p className={styles.lead}>
            Edits apply to new checklists. Saved inspection history keeps the wording from when it was
            recorded.
          </p>

          <div className={styles.tabs}>
            <button
              type="button"
              className={activeType === 'truck' ? styles.tabOn : styles.tab}
              onClick={() => setActiveType('truck')}
            >
              Truck
            </button>
            <button
              type="button"
              className={activeType === 'forklift' ? styles.tabOn : styles.tab}
              onClick={() => setActiveType('forklift')}
            >
              Forklift
            </button>
          </div>

          {loading ? <p className={styles.muted}>Loading…</p> : null}
          {message ? <p className={styles.ok}>{message}</p> : null}
          {error ? <p className={styles.err}>{error}</p> : null}

          {!loading && !current ? (
            <p className={styles.muted}>
              No template for this type yet. Seed defaults below.
            </p>
          ) : null}

          {draft ? (
            <div className={styles.editor}>
              <div className={styles.row}>
                <button
                  type="button"
                  className={styles.btn}
                  disabled={saving}
                  onClick={resetTemplateFromSeed}
                >
                  Reset this template to seed text
                </button>
              </div>

              {catsSorted.map((cat, ci) => (
                <div key={cat.id} className={styles.cat}>
                  <div className={styles.catHead}>
                    <input
                      className={styles.catInput}
                      value={cat.name}
                      onChange={(e) => updateCategory(ci, { name: e.target.value })}
                      aria-label="Category name"
                    />
                    <div className={styles.catActions}>
                      <button type="button" className={styles.mini} onClick={() => moveCategory(ci, -1)}>
                        ↑
                      </button>
                      <button type="button" className={styles.mini} onClick={() => moveCategory(ci, 1)}>
                        ↓
                      </button>
                      <button type="button" className={styles.miniDanger} onClick={() => deleteCategory(ci)}>
                        Remove
                      </button>
                    </div>
                  </div>

                  {[...(cat.items || [])]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((it, ii) => (
                      <div key={it.id} className={styles.itemRow}>
                        <input
                          className={styles.itemInput}
                          value={it.label}
                          onChange={(e) => updateItem(ci, ii, { label: e.target.value })}
                          aria-label="Item label"
                        />
                        <div className={styles.itemActions}>
                          <button type="button" className={styles.mini} onClick={() => moveItem(ci, ii, -1)}>
                            ↑
                          </button>
                          <button type="button" className={styles.mini} onClick={() => moveItem(ci, ii, 1)}>
                            ↓
                          </button>
                          <button type="button" className={styles.miniDanger} onClick={() => deleteItem(ci, ii)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                  <button type="button" className={styles.addItem} onClick={() => addItem(ci)}>
                    + Add item
                  </button>
                </div>
              ))}

              <button type="button" className={styles.addCat} onClick={addCategory}>
                + Add category
              </button>

              <button
                type="button"
                className={styles.save}
                disabled={!draftDirty || saving}
                onClick={persistDraft}
              >
                {saving ? 'Saving…' : 'Save template'}
              </button>
            </div>
          ) : null}
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Admin</h2>
          <p className={styles.muted}>
            CSV/PDF exports use filters on the History screen. Default date range there is the last 30 days.
          </p>
          <button type="button" className={styles.primary} disabled={seeding} onClick={handleSeed}>
            {seeding ? 'Working…' : 'Seed default checklist templates'}
          </button>
        </section>
      </main>
    </AppShell>
  );
}
