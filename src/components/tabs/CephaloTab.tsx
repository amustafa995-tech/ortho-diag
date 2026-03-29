
import { useStore } from '../../store/useStore';
import { CephInput, OpgToggle } from '../ui/Forms';

const CVM_OPTIONS = ["CS1","CS2","CS3","CS4","CS5","CS6"];

export default function CephaloTab() {
  const patient = useStore(state => state.patient);
  const s = patient.sessions.find(s => s.id === patient.activeSessionId) || patient.sessions[0];
  const updateSessionField = useStore(state => state.updateSessionField);

  if (!s) return null;

  return (
    <div className="module-content tab-radio">
      <div className="module-header mh-radio" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
         <h2 style={{ margin: 0 }}>5. Analyse Radio</h2>
      </div>

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem', maxWidth: '500px' }}>
        <div className="card-header"><h3 style={{fontSize:'1.1rem', marginBottom:'1.5rem'}}>1. Analyse Céphalométrique</h3></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: '0.75rem' }}>
          <label style={{ fontSize: 'var(--fs-label)', fontWeight: 500, color: 'var(--c-text-secondary)', whiteSpace: 'nowrap', margin: 0 }}>Maturation (CVM)</label>
          <select
            name="stadeMaturation"
            tabIndex={500}
            value={s.stadeMaturation || ''}
            onChange={e => updateSessionField(patient.activeSessionId, 'stadeMaturation', e.target.value)}
            className={!s.stadeMaturation ? 'field-empty' : ''}
            style={{ height: '30px', padding: '0 var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)', fontFamily: 'inherit', background: '#fff' }}
          >
            <option value="">-</option>
            {CVM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>

          {/* Sagittal Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>Sagittal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
               <CephInput label="SNA" name="sna" normStr="82 ± 2" ideal={82} dev={2} />
               <CephInput label="SNB" name="snb" normStr="80 ± 2" ideal={80} dev={2} />
               <CephInput label="ANB" name="anb" normStr="2 ± 2" ideal={2} dev={2} />
               <CephInput label="Wits (mm)" name="wits" normStr="0 ± 0" ideal={0} dev={0} />
            </div>
          </div>

          {/* Vertical Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '0.5rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>Vertical</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
               <CephInput label="SN-SpaSpp" name="snSpaspp" normStr="7 ± 3" ideal={7} dev={3} />
               <CephInput label="SpaSpp-MeGo" name="spasppMego" normStr="25 ± 6" ideal={25} dev={6} />
               <CephInput label="SN-MeGo" name="snMego" normStr="32 ± 2.5" ideal={32} dev={2.5} />
            </div>
          </div>

          {/* Dentaire Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '0.5rem', paddingTop: '0.4rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>Dentaire</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
               <CephInput label="1/-SN" name="incisifSn" normStr="103 ± 6" ideal={103} dev={6} />
               <CephInput label="1/-SpaSpp" name="incisifSpaspp" normStr="110 ± 6" ideal={110} dev={6} />
               <CephInput label="/1-MeGo" name="incisifMego" normStr="93 ± 4" ideal={93} dev={4} />
               <CephInput label="1/-/1" name="incisifIncisif" normStr="132 ± 6" ideal={132} dev={6} />
            </div>
          </div>

        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        {(() => {
          const opgReviewed = !s.opgPresenceRas || !s.opgPositionRas || !s.opgProportionRas || !s.opgPathologieRas
            || !!s.opgPresence || !!s.opgPosition || !!s.opgProportion || !!s.opgPathologie || !!s.opgRemarque;
          return (
            <div className="card-header">
              <h3>2. Analyse OPG</h3>
              {!opgReviewed && <span className="completion-badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>À évaluer</span>}
            </div>
          );
        })()}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
           <OpgToggle label="Présence" rasField="opgPresenceRas" detailField="opgPresence" />
           <OpgToggle label="Position" rasField="opgPositionRas" detailField="opgPosition" />
           <OpgToggle label="Proportion" rasField="opgProportionRas" detailField="opgProportion" />
           <OpgToggle label="Pathologie" rasField="opgPathologieRas" detailField="opgPathologie" />
        </div>
      </div>
    </div>
  );
}
