import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getVehicle } from '../services/vehicles.js';
import { resolveChecklistTemplateForVehicle } from '../utils/vehicleTemplate.js';
import {
  getCheckForVehicleDate,
  getChecksForVehicleWeek,
  saveCheck,
} from '../services/checks.js';
import { AppShell } from '../components/AppShell.jsx';
import { Header } from '../components/Header.jsx';
import { WeekNavigator } from '../components/WeekNavigator.jsx';
import { DayStatusRow } from '../components/DayStatusRow.jsx';
import { ChecklistCategory } from '../components/ChecklistCategory.jsx';
import { ChecklistItemRow } from '../components/ChecklistItemRow.jsx';
import { IssueModal } from '../components/IssueModal.jsx';
import { cycleItemState } from '../utils/checklistStatus.js';
import {
  addDays,
  getWeekDayKeys,
  getWeekRangeLabel,
  isTodayDateKey,
  startOfWeekMonday,
  toDateKey,
  weekOffsetForDateKey,
} from '../utils/dates.js';
import { aggregateWeekDayStatus } from '../utils/weekStatus.js';
import { buildResultsFromTemplate } from '../utils/templateResults.js';
import styles from './Checklist.module.css';

export function ChecklistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [template, setTemplate] = useState(null);
  const [results, setResults] = useState([]);
  const [checkId, setCheckId] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [weekChecks, setWeekChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [issueItemId, setIssueItemId] = useState(null);

  const dateFromUrl = searchParams.get('date');
  useEffect(() => {
    if (dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)) {
      setSelectedDateKey(dateFromUrl);
      setWeekOffset(weekOffsetForDateKey(dateFromUrl));
    }
  }, [dateFromUrl]);

  const weekStart = useMemo(() => {
    const base = startOfWeekMonday(new Date());
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekDayKeys = useMemo(() => getWeekDayKeys(weekStart), [weekStart]);
  const weekLabel = useMemo(() => getWeekRangeLabel(weekStart), [weekStart]);
  const weekStartKey = useMemo(() => toDateKey(weekStart), [weekStart]);
  const weekEndKey = useMemo(() => toDateKey(addDays(weekStart, 6)), [weekStart]);

  const loadCheckForDate = useCallback(
    async (v, tpl, dateKey) => {
      if (!user || !v) return;
      const existing = await getCheckForVehicleDate(user.uid, v.id, dateKey);
      const merged = buildResultsFromTemplate(tpl, existing?.results || []);
      setResults(merged);
      setCheckId(existing?.id || null);
    },
    [user]
  );

  useEffect(() => {
    let cancelled = false;
    async function loadVehicleAndTemplate() {
      if (!user || !id) return;
      setLoading(true);
      setError('');
      try {
        const v = await getVehicle(id);
        if (cancelled) return;
        if (!v || v.createdBy !== user.uid) {
          setError('Vehicle not found');
          setVehicle(null);
          setTemplate(null);
          return;
        }
        setVehicle(v);
        const tpl = await resolveChecklistTemplateForVehicle(user.uid, v);
        if (!tpl?.categories?.length) {
          setError('No checklist template available for this vehicle.');
          setTemplate(null);
          return;
        }
        setTemplate(tpl);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadVehicleAndTemplate();
    return () => {
      cancelled = true;
    };
  }, [user, id]);

  useEffect(() => {
    let cancelled = false;
    async function loadDay() {
      if (!user || !vehicle || !template) return;
      setError('');
      try {
        await loadCheckForDate(vehicle, template, selectedDateKey);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load day');
      }
    }
    if (vehicle && template) loadDay();
    return () => {
      cancelled = true;
    };
  }, [user, vehicle, template, selectedDateKey, loadCheckForDate]);

  useEffect(() => {
    let cancelled = false;
    async function loadWeek() {
      if (!user || !vehicle) return;
      const list = await getChecksForVehicleWeek(user.uid, vehicle.id, weekStartKey, weekEndKey);
      if (!cancelled) setWeekChecks(list);
    }
    loadWeek();
    return () => {
      cancelled = true;
    };
  }, [user, vehicle, weekStartKey, weekEndKey, selectedDateKey, checkId]);

  const statusByDay = useMemo(
    () => aggregateWeekDayStatus(weekChecks, weekDayKeys),
    [weekChecks, weekDayKeys]
  );

  useEffect(() => {
    if (weekDayKeys.includes(selectedDateKey)) return;
    const fallback =
      weekDayKeys.find((key) => isTodayDateKey(key)) ?? weekDayKeys[0];
    if (!fallback) return;
    setSelectedDateKey(fallback);
    setSearchParams({ date: fallback });
  }, [weekDayKeys, selectedDateKey, setSearchParams]);

  function onSelectDay(key) {
    setSelectedDateKey(key);
    setSearchParams({ date: key });
  }

  function onPrevWeek() {
    setWeekOffset((w) => w - 1);
  }

  function onNextWeek() {
    setWeekOffset((w) => w + 1);
  }

  const issueRow = results.find((r) => r.itemId === issueItemId);

  useEffect(() => {
    if (!issueItemId) return;
    const row = results.find((r) => r.itemId === issueItemId);
    if (!row || row.state !== 'issue') setIssueItemId(null);
  }, [results, issueItemId]);

  function handleItemTap(itemId) {
    const idx = results.findIndex((r) => r.itemId === itemId);
    if (idx < 0) return;
    const next = cycleItemState(results[idx].state);
    const copy = [...results];
    copy[idx] = { ...copy[idx], state: next };
    setResults(copy);
    if (next === 'issue') {
      setIssueItemId(itemId);
    }
  }

  function handleIssueSave({ note }) {
    if (!issueItemId) return;
    setResults((prev) =>
      prev.map((r) =>
        r.itemId === issueItemId
          ? { ...r, note: note || '', photoUrl: '' }
          : r
      )
    );
    setIssueItemId(null);
  }

  function closeIssueModal() {
    setIssueItemId(null);
  }

  async function handleSaveCheck() {
    if (!user || !vehicle || !template) return;
    setSaving(true);
    setError('');
    try {
      const savedId = await saveCheck(user.uid, vehicle, selectedDateKey, results, checkId);
      setCheckId(savedId);
      navigate('/');
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <Header title="Checklist" left={<Link to={`/vehicles/${id}`}>← Back</Link>} />
        <p className={styles.pad}>Loading…</p>
      </AppShell>
    );
  }

  if (error && !vehicle) {
    return (
      <AppShell>
        <Header title="Checklist" left={<Link to="/">← Home</Link>} />
        <p className={styles.pad}>{error}</p>
      </AppShell>
    );
  }

  if (!template) {
    return (
      <AppShell>
        <Header title="Checklist" left={<Link to={`/vehicles/${id}`}>← Back</Link>} />
        <p className={styles.pad}>{error || 'No checklist template available.'}</p>
      </AppShell>
    );
  }

  const categories = [...(template.categories || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <AppShell>
      <Header
        title={vehicle?.name || 'Checklist'}
        subtitle={vehicle?.type === 'forklift' ? 'Forklift' : 'Truck'}
        left={
          <Link to={`/vehicles/${id}`} className={styles.back}>
            ← Back
          </Link>
        }
      />

      <div className={styles.top}>
        <WeekNavigator label={weekLabel} onPrev={onPrevWeek} onNext={onNextWeek} />
        <DayStatusRow
          weekDayKeys={weekDayKeys}
          statusByDay={statusByDay}
          selectedDateKey={selectedDateKey}
          onSelectDay={onSelectDay}
        />
      </div>

      {error ? <p className={styles.errorBanner}>{error}</p> : null}

      <main className={styles.main}>
        {categories.map((cat) => {
          const items = [...(cat.items || [])]
            .filter((i) => i.active !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const rows = items
            .map((it) => results.find((r) => r.itemId === it.id))
            .filter(Boolean);
          if (!rows.length) return null;
          return (
            <ChecklistCategory key={cat.id} title={cat.name}>
              {rows.map((r) => (
                <ChecklistItemRow
                  key={r.itemId}
                  label={r.itemLabel}
                  state={r.state}
                  hasAttachment={Boolean(r.note)}
                  onTap={() => handleItemTap(r.itemId)}
                />
              ))}
            </ChecklistCategory>
          );
        })}
      </main>

      <div className={styles.sticky}>
        <button type="button" className={styles.saveBtn} disabled={saving} onClick={handleSaveCheck}>
          {saving ? 'Saving…' : 'Save checklist'}
        </button>
      </div>

      <IssueModal
        key={issueItemId || 'closed'}
        open={Boolean(issueItemId)}
        itemLabel={issueRow?.itemLabel || ''}
        initialNote={issueRow?.note}
        onClose={closeIssueModal}
        onSave={handleIssueSave}
      />
    </AppShell>
  );
}
