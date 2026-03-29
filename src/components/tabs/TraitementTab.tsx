
import { useStore } from '../../store/useStore';
import { handleEnterKey } from '../ui/Forms';

const STEPS = [
  { key: 'planTraitement1' as const, num: 1 },
  { key: 'planTraitement2' as const, num: 2 },
  { key: 'planTraitement3' as const, num: 3 },
  { key: 'planTraitement4' as const, num: 4 },
  { key: 'planTraitement5' as const, num: 5 },
];

export default function TraitementTab() {
  const patient = useStore(state => state.patient);
  const s = patient.sessions.find(s => s.id === patient.activeSessionId) || patient.sessions[0];
  const updateSessionField = useStore(state => state.updateSessionField);

  if (!s) return null;

  const filledCount = STEPS.filter(st => !!(s as any)[st.key]).length;

  return (
    <div className="module-content tab-trait">
      <div className="module-header mh-trait"><h2>6. Plan de Traitement</h2></div>

      <div className="card">
        <div className="card-header">
          <h3>Étapes du Traitement</h3>
          <span className={`completion-badge ${filledCount > 0 ? 'complete' : ''}`}>{filledCount} étape{filledCount > 1 ? 's' : ''}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {STEPS.map((step, i) => {
            const val = (s as any)[step.key] || '';
            return (
              <div key={step.key} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 'var(--sp-2)', alignItems: 'start' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--fs-value)', fontWeight: 700,
                  background: val ? 'var(--c-primary)' : 'var(--c-bg)',
                  color: val ? '#fff' : 'var(--c-text-muted)',
                  border: val ? 'none' : '1px solid var(--c-border)',
                  flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <textarea
                  name={step.key}
                  value={val}
                  onChange={e => updateSessionField(patient.activeSessionId, step.key, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const next = document.querySelector(`textarea[name="planTraitement${step.num + 1}"]`) as HTMLTextAreaElement; next?.focus(); } }}
                  tabIndex={600 + i}
                  placeholder={`Étape ${step.num}...`}
                  className={!val ? 'field-empty' : ''}
                  rows={2}
                  style={{
                    width: '100%', padding: 'var(--sp-2)',
                    fontSize: 'var(--fs-value)', fontFamily: 'inherit',
                    border: '1px solid #cbd5e1', borderRadius: 'var(--radius)',
                    resize: 'vertical', minHeight: '40px',
                    background: val ? '#fff' : 'var(--c-bg)',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Remarques</h3></div>
        <textarea
          name="planTraitement6"
          value={s.planTraitement6 || ''}
          onChange={e => updateSessionField(patient.activeSessionId, 'planTraitement6', e.target.value)}
          tabIndex={605}
          placeholder="Remarques générales sur le plan de traitement..."
          rows={3}
          style={{
            width: '100%', padding: 'var(--sp-2)',
            fontSize: 'var(--fs-value)', fontFamily: 'inherit',
            border: '1px solid #cbd5e1', borderRadius: 'var(--radius)',
            resize: 'vertical', minHeight: '60px',
          }}
        />
      </div>
    </div>
  );
}
