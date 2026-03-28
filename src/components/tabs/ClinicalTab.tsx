
import { useStore } from '../../store/useStore';
import { Select, Checkbox, ClinicalToggle, InlineMetric, TwoWayCheck } from '../ui/Forms';

export default function ClinicalTab() {
  const patient = useStore(state => state.patient);
  const activeSessionId = patient.activeSessionId;
  const activeSession = patient.sessions.find(s => s.id === activeSessionId) || patient.sessions[0];

  // Completion counters
  const extraOralFields = ['face','symetrieVisage','gummySmile','profil','angleNasolabial','angleLabiomental','troisQuarts','competenceLabiale'];
  const extraOralDone = extraOralFields.filter(f => !!(activeSession as any)[f]).length;
  
  const intraOralFields = ['overjet','classeCanineD','classeCanineG','classeMolaireD','classeMolaireG','overbite','cdsD','cdsG','lm'];
  const intraOralDone = intraOralFields.filter(f => !!(activeSession as any)[f]).length;

  return (
    <div className="module-content">
      <div className="module-header"><h2>3. Analyse Clinique</h2></div>

      {/* ═══ EXTRA-ORAL ═══ */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="card-header">
          <h3>Extra-Oral</h3>
          <span className={`completion-badge ${extraOralDone === extraOralFields.length ? 'complete' : ''}`}>{extraOralDone}/{extraOralFields.length}</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
          
          {/* COLONNE GAUCHE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="classes-grid">
              <Select label="Face" name="face" options={["Normodivergent", "Hyperdivergent", "Hypodivergent"]} ti={100} />
              <Select label="Symétrie Visage" name="symetrieVisage" options={["Symétrique", "Asymétrique"]} ti={101} />
              <Select label="Gummy Smile" name="gummySmile" options={["Non", "Oui (Léger)", "Oui (Sévère)"]} ti={102} />
            </div>
            {activeSession.symetrieVisage === "Asymétrique" && (
              <div style={{ marginTop: '0.2rem', paddingLeft: '1rem' }}>
                 <input type="text" name="asymetrieDetails" value={activeSession.asymetrieDetails || ''} onChange={(e) => useStore.getState().updateSessionField(activeSessionId, 'asymetrieDetails', e.target.value)} placeholder="Détails de l'asymétrie..." style={{width: '100%', padding: '0.3rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem'}} />
              </div>
            )}
            
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proportions Transversales</h4>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                 <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}><span style={{fontWeight:600}}>Quint:</span> Équilibre</div>
                 <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}><span style={{fontWeight:600}}>Bicantonal:</span> Harmonieux</div>
               </div>
            </div>
          </div>

          <div style={{ width: '1px', backgroundColor: 'var(--border-color)', height: '100%', minHeight: '150px' }}></div>

          {/* COLONNE DROITE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="classes-grid">
              <Select label="Profil" name="profil" options={["Convexe", "Droit", "Concave", "Biprochéilie"]} ti={120} />
              <Select label="Angle N.-Labial" name="angleNasolabial" options={["Aigu (<90°)", "Normal (90-110°)", "Ouvert (>110°)"]} ti={121} />
              <Select label="Angle L.-Mental" name="angleLabiomental" options={["Marqué", "Normal", "Effacé"]} ti={122} />
              <Select label="Trois-quarts" name="troisQuarts" options={["Harmonieux", "Déficient", "Prominent"]} ti={123} />
            </div>

            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <div style={{ flex: 1 }}>
                <Select label="Compétence L." name="competenceLabiale" options={["Compétentes", "Incompétentes", "Ourlets inversés"]} ti={125} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0, fontWeight: 600, fontSize:'0.85rem' }}>Expo. Incisives</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    name="expoIncisives"
                    value={activeSession.expoIncisives || ''}
                    onChange={(e) => useStore.getState().updateSessionField(activeSessionId, 'expoIncisives', e.target.value)}
                    tabIndex={126}
                    min="0" max="100"
                    className={`inline-metric-input ${!activeSession.expoIncisives ? 'field-empty' : ''}`}
                    style={{ width: '60px', padding: '0.3rem', fontSize: '0.9rem', textAlign: 'center', borderRadius: '4px', color: '#0f172a', background: '#ffffff', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}
                  />
                  <span style={{ marginLeft: '4px', color: '#94a3b8', fontSize: '0.9rem' }}>%</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ INTRA-ORAL ═══ */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="card-header">
          <h3>Intra-Oral</h3>
          <span className={`completion-badge ${intraOralDone === intraOralFields.length ? 'complete' : ''}`}>{intraOralDone}/{intraOralFields.length}</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
          
          {/* COLONNE GAUCHE : SAGITTAL */}
          <div>
            <h4 className="section-title">Sagittal</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
              <InlineMetric label="Overjet" name="overjet" ti={200} />
              <ClinicalToggle label="X-bite Ant." stateField="hasXBiteAnt" detailField="xbiteAntDent" ti={201} />
            </div>
            
            <div className="classes-grid" style={{ marginTop: '0.5rem' }}>
              <Select label="Cl. Can. D." name="classeCanineD" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={204} />
              <Select label="Cl. Can. G." name="classeCanineG" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={205} />
              <Select label="Cl. Mol. D." name="classeMolaireD" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={206} />
              <Select label="Cl. Mol. G." name="classeMolaireG" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={207} />
            </div>
          </div>

          <div style={{ width: '1px', backgroundColor: 'var(--border-color)', height: '100%', minHeight: '100px' }}></div>

          {/* COLONNE DROITE : VERTICAL + TRANSVERSAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h4 className="section-title">Vertical</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                 <InlineMetric label="Overbite" name="overbite" ti={220} />
                 <InlineMetric label="CdS D." name="cdsD" ti={221} />
                 <InlineMetric label="CdS G." name="cdsG" ti={222} />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <Checkbox label="Traumatisant" name="hasTraumatisant" ti={223} />
                <Checkbox label="Occlusal Cant" name="hasOcclusalCant" ti={224} />
              </div>
            </div>

            <div>
              <h4 className="section-title">Transversal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <TwoWayCheck label="Ligne Médiane (LM)" name="lm" options={["Centré", "Dévié"]} detailOption="Dévié" detailName="lmDetails" ti={240} />
                <ClinicalToggle label="X/S Bite post." stateField="hasXSBitePost" detailField="xsbitePostDent" ti={243} />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ═══ PARO - CARIE ═══ */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="card-header">
          <h3>Parodontie - Caries</h3>
          <span className={`completion-badge ${activeSession.hygieneClin && activeSession.phenotype ? 'complete' : ''}`}>{(activeSession.hygieneClin ? 1 : 0) + (activeSession.phenotype ? 1 : 0)}/2</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* COLONNE GAUCHE */}
          <div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Select label="Hygiène" name="hygieneClin" options={["Bonne", "Moyenne", "Mauvaise"]} ti={300} />
              <Select label="Phénotype" name="phenotype" options={["Normal", "Épais", "Fin"]} ti={301} />
            </div>
          </div>

          <div style={{ width: '1px', backgroundColor: 'var(--border-color)', height: '100%', minHeight: '60px' }}></div>

          {/* COLONNE DROITE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <ClinicalToggle label="Frein Court" stateField="hasFreins" detailField="freinsDent" ti={302} />
            <ClinicalToggle label="Carie" stateField="hasCaries" detailField="cariesDent" ti={304} />
            <ClinicalToggle label="Parodontite" stateField="hasParodontite" detailField="parodontiteDetails" ti={306} />
          </div>
        </div>
      </div>

      {/* ═══ HABITUDES ═══ */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="card-header">
          <h3>Habitudes</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
          <ClinicalToggle label="Déglutition atypique" stateField="hasDeglutitionAtypique" detailField="deglutitionAtypiqueDetails" ti={310} />
          <ClinicalToggle label="Interpo. Labiale" stateField="hasInterpoLabial" detailField="interpoLabialDetails" ti={312} />
          <ClinicalToggle label="Rinçage de dents" stateField="hasRincageDents" detailField="rincageDentsDetails" ti={314} />
          <ClinicalToggle label="Désordres ATM" stateField="hasAtm" detailField="atmDetails" ti={316} />
        </div>
      </div>

    </div>
  );
}
