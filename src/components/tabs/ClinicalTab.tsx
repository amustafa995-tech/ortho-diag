
import { useStore } from '../../store/useStore';
import { Select, Checkbox, ClinicalToggle, InlineMetric, TwoWayCheck, useFieldMapping } from '../ui/Forms';
import { handleEnterKey } from '../ui/Forms';

// Ligne paro alignée : checkbox (largeur fixe) + input pleine largeur sur la même ligne
function ParoRow({ label, stateField, detailField, ti }: { label: string; stateField: string; detailField: string; ti?: number }) {
  const { val: isChecked, onChange: onCheck } = useFieldMapping(stateField);
  const { val: detailVal, onChange: onDetail } = useFieldMapping(detailField);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: '3px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: 'var(--fs-value)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        <input type="checkbox" name={stateField} checked={!!isChecked} onChange={onCheck} tabIndex={ti} style={{ width: 'auto', margin: 0, transform: 'scale(1.1)' }} />
        {label}
      </label>
      <input type="text" name={detailField} value={detailVal || ''} onChange={onDetail} onKeyDown={handleEnterKey}
        tabIndex={ti ? ti + 1 : undefined}
        placeholder={isChecked ? 'Précisez...' : ''}
        disabled={!isChecked}
        className={isChecked ? 'detail-fade' : ''}
        style={{ padding: '2px var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)', opacity: isChecked ? 1 : 0.3, background: isChecked ? '#fff' : 'var(--c-bg)' }}
      />
    </div>
  );
}

export default function ClinicalTab() {
  const patient = useStore(state => state.patient);
  const activeSessionId = patient.activeSessionId;
  const activeSession = patient.sessions.find(s => s.id === activeSessionId) || patient.sessions[0];

  const extraOralFields = ['face','symetrieVisage','profil','angleNasolabial','angleLabiomental','troisQuarts','gummySmile','symetrieSourire','competenceLabiale','expoIncisives'];
  const extraOralDone = extraOralFields.filter(f => !!(activeSession as any)[f]).length;

  const intraOralFields = ['overjet','classeCanineD','classeCanineG','classeMolaireD','classeMolaireG','overbite','cdsD','cdsG','lm'];
  const intraOralDone = intraOralFields.filter(f => !!(activeSession as any)[f]).length;

  return (
    <div className="module-content tab-clin">
      <div className="module-header mh-clin"><h2>3. Analyse Clinique</h2></div>

      {/* ═══ EXTRA-ORAL ═══ */}
      <div className="card">
        <div className="card-header">
          <h3>Extra-Oral</h3>
          <span className={`completion-badge ${extraOralDone === extraOralFields.length ? 'complete' : ''}`}>{extraOralDone}/{extraOralFields.length}</span>
        </div>

        <div className="grid-2">
          {/* Colonne gauche : Face + Profil */}
          <div className="flex-col gap-2">
            <div className="section-card">
              <h4 className="section-title">Face</h4>
              <div className="classes-grid">
                <Select label="Face" name="face" options={["Normodivergent", "Hyperdivergent", "Hypodivergent"]} ti={100} />
                <Select label="Symétrie Visage" name="symetrieVisage" options={["Symétrique", "Asymétrique"]} ti={101} />
              </div>
              {activeSession.symetrieVisage === "Asymétrique" && (
                <div style={{ paddingLeft: 'var(--sp-2)', marginTop: 'var(--sp-1)' }}>
                  <input type="text" name="asymetrieDetails" value={activeSession.asymetrieDetails || ''} onChange={(e) => useStore.getState().updateSessionField(activeSessionId, 'asymetrieDetails', e.target.value)} placeholder="Détails de l'asymétrie..." tabIndex={102} className="detail-fade" style={{ width: '100%' }} />
                </div>
              )}
            </div>
            <div className="section-card">
              <h4 className="section-title">Profil</h4>
              <Select label="Profil" name="profil" options={["Convexe", "Droit", "Concave", "Biprotrusive"]} ti={110} />
              <Select label="Angle Nasolabial" name="angleNasolabial" options={["Normal", "Ouvert", "Fermé"]} normValue="85-120°" ti={111} />
              <Select label="Angle Labiomental" name="angleLabiomental" options={["Normal", "Ouvert", "Fermé"]} normValue="110-130°" ti={112} />
            </div>
          </div>

          {/* Colonne droite : 3/4 + Sourire */}
          <div className="flex-col gap-2">
            <div className="section-card">
              <h4 className="section-title">3/4</h4>
              <Select label="Trois-quarts" name="troisQuarts" options={["Harmonieux", "Plan"]} ti={120} />
            </div>
            <div className="section-card">
              <h4 className="section-title">Analyse du Sourire</h4>
              <div className="classes-grid">
                <Select label="Sym. Sourire" name="symetrieSourire" options={["Symétrique", "Asymétrique"]} ti={131} />
                <Select label="Compét. Labiale" name="competenceLabiale" options={["Compétentes", "Incompétentes", "Ourlets inversés"]} ti={132} />
              </div>
              <div className="flex-row" style={{ marginTop: 'var(--sp-1)', gap: 'var(--sp-3)' }}>
                <Select label="Gummy Smile" name="gummySmile" options={["Non", "Oui (Léger)", "Oui (Sévère)"]} ti={130} />
                <div className="flex-row">
                  <label style={{ margin: 0, fontWeight: 600, fontSize: 'var(--fs-value)' }}>Expo. Inc.</label>
                  <input type="text" inputMode="numeric" name="expoIncisives" value={activeSession.expoIncisives || ''} onChange={(e) => useStore.getState().updateSessionField(activeSessionId, 'expoIncisives', e.target.value)} tabIndex={133} className={`inline-metric-input ${!activeSession.expoIncisives ? 'field-empty' : ''}`} style={{ width: '50px' }} />
                  <span className="text-muted">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ INTRA-ORAL ═══ */}
      <div className="card">
        <div className="card-header">
          <h3>Intra-Oral</h3>
          <span className={`completion-badge ${intraOralDone === intraOralFields.length ? 'complete' : ''}`}>{intraOralDone}/{intraOralFields.length}</span>
        </div>

        <div className="intra-oral-grid">
          {/* SAGITTAL */}
          <div className="section-card">
            <h4 className="section-title">Sagittal</h4>
            <div className="flex-row" style={{ marginBottom: 'var(--sp-2)' }}>
              <InlineMetric label="Overjet" name="overjet" ti={200} />
              <ClinicalToggle label="X-bite Ant." stateField="hasXBiteAnt" detailField="xbiteAntDent" ti={201} />
              <Checkbox label="Béance 3-3 (209a)" name="hasBeanceIncisives" ti={203} />
            </div>
            <div className="classes-grid">
              <Select label="Cl. Can. D." name="classeCanineD" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={204} />
              <Select label="Cl. Can. G." name="classeCanineG" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={205} />
              <Select label="Cl. Mol. D." name="classeMolaireD" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={206} />
              <Select label="Cl. Mol. G." name="classeMolaireG" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={207} />
            </div>
          </div>

          <div className="v-divider" />

          {/* VERTICAL + TRANSVERSAL */}
          <div className="flex-col gap-2">
            <div className="section-card">
              <h4 className="section-title">Vertical</h4>
              <div className="flex-row flex-wrap" style={{ marginBottom: 'var(--sp-1)' }}>
                <InlineMetric label="Overbite" name="overbite" ti={220} />
                <InlineMetric label="CdS D." name="cdsD" ti={221} />
                <InlineMetric label="CdS G." name="cdsG" ti={222} />
              </div>
              <div className="flex-row gap-3">
                <Checkbox label="Traumatisant" name="hasTraumatisant" ti={223} />
                <Checkbox label="Occlusal Cant" name="hasOcclusalCant" ti={224} />
              </div>
            </div>

            <div className="section-card">
              <h4 className="section-title">Transversal</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--sp-1) var(--sp-2)', alignItems: 'center', marginTop: 'var(--sp-1)' }}>
                {/* LM row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <span style={{ fontSize: 'var(--fs-value)', fontWeight: 600, color: 'var(--c-text-secondary)', minWidth: '22px' }}>LM</span>
                  {(['Centré','Dévié'] as const).map((opt, idx) => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: 'var(--fs-value)', fontWeight: 500, margin: 0 }}>
                      <input type="checkbox" checked={activeSession.lm === opt} tabIndex={240 + idx} onChange={e => useStore.getState().updateSessionField(activeSessionId, 'lm', e.target.checked ? opt : '')} style={{ margin: 0 }} />
                      {opt}
                    </label>
                  ))}
                </div>
                {activeSession.lm === 'Dévié'
                  ? <input type="text" name="lmDetails" value={activeSession.lmDetails || ''} onChange={e => useStore.getState().updateSessionField(activeSessionId, 'lmDetails', e.target.value)} placeholder="Précisez..." className="detail-fade" style={{ padding: '2px var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />
                  : <span />
                }
                {/* X/S Bite row */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: 'var(--fs-value)', fontWeight: 500, margin: 0 }}>
                  <input type="checkbox" name="hasXSBitePost" checked={!!activeSession.hasXSBitePost} tabIndex={243} onChange={e => useStore.getState().updateSessionField(activeSessionId, 'hasXSBitePost', e.target.checked)} style={{ margin: 0 }} />
                  X/S Bite post.
                </label>
                {activeSession.hasXSBitePost
                  ? <input type="text" name="xsbitePostDent" value={activeSession.xsbitePostDent || ''} onChange={e => useStore.getState().updateSessionField(activeSessionId, 'xsbitePostDent', e.target.value)} placeholder="Précisez..." className="detail-fade" style={{ padding: '2px var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />
                  : <span />
                }
                {/* Insurance detection */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: 'var(--fs-value)', fontWeight: 500, margin: 0, whiteSpace: 'nowrap' }}>
                    <input type="checkbox" name="hasArticuleCiseaux" checked={!!activeSession.hasArticuleCiseaux} tabIndex={245} onChange={e => useStore.getState().updateSessionField(activeSessionId, 'hasArticuleCiseaux', e.target.checked)} style={{ margin: 0 }} />
                    Articulé ciseaux (208)
                  </label>
                  <span className="ins-desc">— Anomalie transversale unilatérale</span>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: 'var(--fs-value)', fontWeight: 500, margin: 0, whiteSpace: 'nowrap' }}>
                    <input type="checkbox" name="hasBeanceLateroPost" checked={!!activeSession.hasBeanceLateroPost} tabIndex={246} onChange={e => useStore.getState().updateSessionField(activeSessionId, 'hasBeanceLateroPost', e.target.checked)} style={{ margin: 0 }} />
                    Béance latéro-post. (HG)
                  </label>
                  <span className="ins-desc">— Sur ≥2 paires de dents (hors 8)</span>
                  {activeSession.hasBeanceLateroPost && (
                    <input type="text" name="beanceLateroPostDent" value={activeSession.beanceLateroPostDent || ''} onChange={e => useStore.getState().updateSessionField(activeSessionId, 'beanceLateroPostDent', e.target.value)} placeholder="Dents concernées..." className="detail-fade" style={{ width: '150px', padding: '2px var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PARO + HABITUDES side by side ═══ */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Parodontie - Caries</h3>
            <span className={`completion-badge ${activeSession.hygieneClin && activeSession.phenotype ? 'complete' : ''}`}>{(activeSession.hygieneClin ? 1 : 0) + (activeSession.phenotype ? 1 : 0)}/2</span>
          </div>
          <div className="flex-row" style={{ marginBottom: 'var(--sp-2)' }}>
            <Select label="Hygiène" name="hygieneClin" options={["Bonne", "Moyenne", "Mauvaise"]} ti={300} />
            <Select label="Phénotype" name="phenotype" options={["Normal", "Épais", "Fin"]} ti={301} />
          </div>
          <ParoRow label="Frein Court" stateField="hasFreins" detailField="freinsDent" ti={302} />
          <ParoRow label="Carie" stateField="hasCaries" detailField="cariesDent" ti={304} />
          <ParoRow label="Parodontite" stateField="hasParodontite" detailField="parodontiteDetails" ti={306} />
          {activeSession.hasParodontite && (
            <div style={{ paddingLeft: '100px', marginTop: '-1px' }}>
              <Checkbox label="Parodontite juvénile (LaMal 17b)" name="has17b" ti={308} />
            </div>
          )}
          <ParoRow label="Extractions" stateField="antecFamExtract" detailField="extractionDetails" ti={309} />
        </div>

        <div className="card">
          <div className="card-header"><h3>Habitudes & Fonctions</h3></div>
          <div className="flex-col gap-1">
            <Select label="Respiration" name="respiClin" options={["Nasale", "Buccale", "Mixte"]} ti={310} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px var(--sp-3)', marginTop: 'var(--sp-1)' }}>
              <Checkbox label="Déglu. atypique" name="hasDeglutitionAtypique" ti={312} />
              <Checkbox label="Interpo. Labiale" name="hasInterpoLabial" ti={313} />
              <Checkbox label="Grincement de dents" name="hasRincageDents" ti={314} />
              <Checkbox label="Succion pouce" name="hasSuccionPouceClin" ti={315} />
            </div>
            <ClinicalToggle label="Désordres ATM" stateField="hasAtm" detailField="atmDetails" ti={316} />
          </div>
        </div>
      </div>
    </div>
  );
}
