const S = {
  section: { marginBottom: '2rem' } as React.CSSProperties,
  sectionHeader: (bg: string, color: string, border: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    fontSize: '1rem', fontWeight: 700, color,
    background: bg, border: `1px solid ${border}`,
    padding: '10px 14px', borderRadius: '6px', marginBottom: '10px',
  }),
  pill: (bg: string, color: string): React.CSSProperties => ({
    fontSize: '0.65rem', fontWeight: 700, color, background: bg,
    padding: '2px 8px', borderRadius: '10px', letterSpacing: '0.02em',
  }),
  subTitle: { fontWeight: 600, fontSize: '0.8rem', color: '#475569', margin: '12px 0 6px', display: 'flex', alignItems: 'center', gap: '6px' } as React.CSSProperties,
  subBar: (color: string): React.CSSProperties => ({ width: '3px', height: '14px', background: color, borderRadius: '2px' }),
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.8rem' },
  th: { textAlign: 'left' as const, padding: '7px 10px', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.04em', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' },
  td: { padding: '7px 10px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' as const, lineHeight: 1.55 } as React.CSSProperties,
  tdCode: { padding: '7px 10px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' as const, fontWeight: 700, whiteSpace: 'nowrap' as const, width: '60px' } as React.CSSProperties,
  tdCrit: { padding: '7px 10px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' as const, fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' as const, color: '#0f172a' } as React.CSSProperties,
  alt: { background: '#f8fafc' } as React.CSSProperties,
  note: { fontSize: '0.72rem', color: '#64748b', lineHeight: 1.6, padding: '8px 12px', background: '#f8fafc', borderRadius: '4px', borderLeft: '3px solid #cbd5e1', marginTop: '8px' } as React.CSSProperties,
  tag: (bg: string, color: string): React.CSSProperties => ({
    display: 'inline-block', fontSize: '0.6rem', fontWeight: 700, color, background: bg,
    padding: '1px 6px', borderRadius: '3px', marginRight: '4px', verticalAlign: 'middle',
  }),
};

export default function PriseEnChargeTab() {
  return (
    <div className="module-content" style={{ maxWidth: '1050px' }}>
      <div className="module-header" style={{ borderLeft: '4px solid #0ea5e9' }}>
        <h2 style={{ color: '#0ea5e9' }}>Référentiel Prise en Charge</h2>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>
        Conditions exhaustives couvertes par chaque assurance selon la législation suisse en vigueur (OPAS, OIC, HG/SPC).
      </p>

      {/* ═══════════ AI ═══════════ */}
      <div style={S.section}>
        <div style={S.sectionHeader('#f0fdf4', '#166534', '#bbf7d0')}>
          <span>AI — Assurance Invalidité</span>
          <span style={S.pill('#dcfce7', '#166534')}>OIC / Infirmités congénitales</span>
        </div>

        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Code</th>
              <th style={S.th}>Condition</th>
              <th style={S.th}>Critères d'éligibilité</th>
              <th style={{ ...S.th, width: '140px' }}>Seuils céphalométriques</th>
            </tr>
          </thead>
          <tbody>
            {aiRows.map((r, i) => (
              <tr key={r.code} style={i % 2 ? S.alt : undefined}>
                <td style={S.tdCode}>{r.code}</td>
                <td style={{ ...S.td, fontWeight: 600 }}>{r.name}</td>
                <td style={S.td}>{r.criteria}</td>
                <td style={S.tdCrit}>{r.thresholds || <span style={{ color: '#94a3b8', fontWeight: 400, fontFamily: 'inherit' }}>—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={S.note}>
          <b>Règles AI :</b> Téléradiographie obligatoire pour IC 208 / 209 / 210 — les dents 11, 21 et antagonistes doivent être présentes.
          Aligners NON couverts (sauf IC 205 ch. 205.8). Caries NON couvertes. Extraction des 8 uniquement si lien causal avec le traitement ortho.
        </div>
      </div>

      {/* ═══════════ LaMal ═══════════ */}
      <div style={S.section}>
        <div style={S.sectionHeader('#faf5ff', '#6b21a8', '#e9d5ff')}>
          <span>LaMal — Assurance maladie obligatoire</span>
          <span style={S.pill('#f3e8ff', '#6b21a8')}>OPAS</span>
        </div>

        {/* Art 17 */}
        <div style={S.subTitle}><div style={S.subBar('#6b21a8')} /> Art. 17 — Maladies graves et non évitables du système de la mastication</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: '55px' }}>Art.</th>
              <th style={{ ...S.th, width: '170px' }}>Catégorie</th>
              <th style={S.th}>Conditions couvertes</th>
            </tr>
          </thead>
          <tbody>
            {lamalArt17.map((r, i) => (
              <tr key={r.art} style={i % 2 ? S.alt : undefined}>
                <td style={S.tdCode}>{r.art}</td>
                <td style={{ ...S.td, fontWeight: 600 }}>{r.cat}</td>
                <td style={S.td} dangerouslySetInnerHTML={{ __html: r.details }} />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Art 18 */}
        <div style={S.subTitle}><div style={S.subBar('#6b21a8')} /> Art. 18 — Autres maladies avec traitement consécutif</div>
        <table style={S.table}>
          <tbody>
            {lamalArt18.map((r, i) => (
              <tr key={r.art} style={i % 2 ? S.alt : undefined}>
                <td style={{ ...S.tdCode, width: '55px' }}>{r.art}</td>
                <td style={{ ...S.td, fontWeight: 600, width: '170px' }}>{r.cat}</td>
                <td style={S.td}>{r.details}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Art 19 */}
        <div style={S.subTitle}><div style={S.subBar('#6b21a8')} /> Art. 19 — Soins dentaires nécessaires</div>
        <table style={S.table}>
          <tbody>
            {lamalArt19.map((r, i) => (
              <tr key={r.art} style={i % 2 ? S.alt : undefined}>
                <td style={{ ...S.tdCode, width: '55px' }}>{r.art}</td>
                <td style={S.td}>{r.details}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Art 19a */}
        <div style={S.subTitle}><div style={S.subBar('#6b21a8')} /> Art. 19a OPAS — Infirmités congénitales (&gt; 20 ans ou non AI)</div>
        <div style={{ ...S.note, borderLeftColor: '#d8b4fe' }}>
          Mêmes codes IC que l'AI (201–218) mais pour patients <b>&gt; 20 ans</b> ou non couverts par l'AI. Prise en charge si infirmité congénitale confirmée.
        </div>
      </div>

      {/* ═══════════ HG / SPC ═══════════ */}
      <div style={S.section}>
        <div style={S.sectionHeader('#eff6ff', '#1e40af', '#bfdbfe')}>
          <span>HG / SPC — Hospice Général / Prestations Complémentaires</span>
          <span style={S.pill('#dbeafe', '#1e40af')}>Social</span>
        </div>

        {/* Critères occlusaux */}
        <div style={S.subTitle}><div style={S.subBar('#1e40af')} /> Critères occlusaux</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Critère</th>
              <th style={S.th}>Seuil / Description</th>
              <th style={{ ...S.th, width: '80px', textAlign: 'center' }}>Détection</th>
            </tr>
          </thead>
          <tbody>
            {hgOcclusal.map((r, i) => (
              <tr key={r.critere} style={i % 2 ? S.alt : undefined}>
                <td style={{ ...S.td, fontWeight: 600 }}>{r.critere}</td>
                <td style={S.td}>{r.seuil}</td>
                <td style={{ ...S.td, textAlign: 'center' }}>
                  <span style={S.tag(r.auto ? '#dbeafe' : '#fef3c7', r.auto ? '#1e40af' : '#92400e')}>
                    {r.auto ? 'AUTO' : 'RADIO'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Situations intrabuccales */}
        <div style={S.subTitle}><div style={S.subBar('#1e40af')} /> Situations intrabuccales</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: '170px' }}>Situation</th>
              <th style={S.th}>Détails</th>
            </tr>
          </thead>
          <tbody>
            {hgIntra.map((r, i) => (
              <tr key={r.situation} style={i % 2 ? S.alt : undefined}>
                <td style={{ ...S.td, fontWeight: 600 }}>{r.situation}</td>
                <td style={S.td}>{r.details}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Autres */}
        <div style={S.subTitle}><div style={S.subBar('#1e40af')} /> Autres critères</div>
        <table style={S.table}>
          <tbody>
            {hgAutres.map((r, i) => (
              <tr key={r.critere} style={i % 2 ? S.alt : undefined}>
                <td style={{ ...S.td, fontWeight: 600, width: '170px' }}>{r.critere}</td>
                <td style={S.td}>{r.details}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ ...S.note, borderLeftColor: '#93c5fd' }}>
          <b>Prérequis HG/SPC :</b> Patient &lt; 18 ans au moment de la demande. Non couvert par AI ni LaMal. Ne pas commencer le traitement avant acceptation.
          <br /><b>Tarif :</b> 0.85 CHF/point, labo 1.00, pas d'abattement.
        </div>
      </div>

      {/* ═══════════ Tarification ═══════════ */}
      <div style={S.section}>
        <div style={S.sectionHeader('#fefce8', '#854d0e', '#fde68a')}>
          <span>Récapitulatif Tarification</span>
        </div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Assurance</th>
              <th style={S.th}>Tarif devis</th>
              <th style={S.th}>Tarif prestations</th>
              <th style={S.th}>Labo</th>
              <th style={S.th}>Abattement</th>
              <th style={S.th}>Remarque</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ ...S.td, fontWeight: 600 }}>HG + SPC</td><td style={S.td}>0.85</td><td style={S.td}>0.85</td><td style={S.td}>1.00</td><td style={S.td}>Aucun</td><td style={S.td}>—</td></tr>
            <tr style={S.alt}><td style={{ ...S.td, fontWeight: 600 }}>AI</td><td style={S.td}>—</td><td style={S.td}>1.00</td><td style={S.td}>1.00</td><td style={S.td}>Aucun</td><td style={S.td}>Fichier XML obligatoire</td></tr>
            <tr><td style={{ ...S.td, fontWeight: 600 }}>LaMal</td><td style={S.td}>3.10</td><td style={S.td}>5.55</td><td style={S.td}>—</td><td style={S.td}>Aucun</td><td style={S.td}>Envoi par courrier à l'assureur</td></tr>
            <tr style={S.alt}><td style={{ ...S.td, fontWeight: 600 }}>Fond. Wilsdorf</td><td style={S.td}>1.00</td><td style={S.td}>1.00</td><td style={S.td}>1.00</td><td style={S.td}>25%</td><td style={S.td}>—</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Data ──

const aiRows = [
  { code: '201', name: 'Fente labiale, maxillaire, palatine', criteria: 'Diagnostic clinique', thresholds: '' },
  { code: '202', name: 'Fentes faciales médianes, obliques, transversales', criteria: 'Diagnostic clinique', thresholds: '' },
  { code: '205', name: 'Dysplasies dentaires congénitales', criteria: '≥ 12 dents de la 2e dentition sévèrement atteintes. Odontodysplasie : ≥ 2 dents/quadrant. Inclut amelogenesis/dentinogenesis imperfecta. ≠ MIH', thresholds: '' },
  { code: '206', name: 'Anodontie congénitale', criteria: '≥ 2 dents permanentes adjacentes absentes OU ≥ 4 dents permanentes/mâchoire (hors dents de sagesse)', thresholds: '' },
  { code: '207', name: 'Hyperodontie congénitale', criteria: 'Dents surnuméraires permanentes causant déviation intra-maxillaire nécessitant appareil. Odontomes ≠ surnuméraires', thresholds: '' },
  { code: '208', name: 'Micromandibulie congénitale', criteria: 'ANB ≥ seuil, OU ANB ≥ combo + SN-MeGo ≥ combo, OU articulé en ciseaux ≥ 3 paires. 1re année de vie : troubles déglutition/respiration', thresholds: 'ANB ≥ 9°\nANB ≥ 7° + SN-MeGo ≥ 37°\nOJ screening ≥ 9 mm' },
  { code: '209a', name: 'Mordex apertus (béance)', criteria: 'Béance entre TOUS les incisives permanentes', thresholds: 'SN-MeGo ≥ 40°\nSN-MeGo ≥ 37° + ANB ≥ 7°' },
  { code: '209b', name: 'Mordex clausus (supraclusion)', criteria: 'Trauma gingival palatin par les antagonistes', thresholds: 'SN-MeGo ≤ 12°\nSN-MeGo ≤ 15° + ANB ≥ 7°' },
  { code: '210', name: 'Prognathie inférieure', criteria: '≥ 2 paires crossbite/bout-à-bout antérieur. Si contact bloquant → 2e téléradio en RC, ANB = moyenne des 2 mesures', thresholds: 'ANB ≤ -1°\nANB ≤ +1° + SN-MeGo ≥ 37° ou ≤ 15°' },
  { code: '214', name: 'Macroglossie / microglossie', criteria: 'Troubles respiration/déglutition (nourrisson), OU troubles phonation (confirmé ORL), OU troubles occlusion liés à la taille de la langue', thresholds: '' },
  { code: '218', name: 'Rétention / ankylose congénitale', criteria: 'Plusieurs molaires OU ≥ 2 prémolaires/molaires adjacentes retenues/ankylosées (hors 8). Pas de céphalométrie requise', thresholds: '' },
];

const lamalArt17 = [
  { art: '17a', cat: 'Maladies dentaires', details: 'Granulome dentaire interne idiopathique. Dislocations / dents surnuméraires qualifiées de maladie <i>(kyste, infection, résorption des voisines)</i>. Dents incluses avec pathologie associée' },
  { art: '17b', cat: 'Parodontopathies', details: 'Parodontite prépubertaire. Parodontite juvénile progressive. Effets secondaires irréversibles de médicaments' },
  { art: '17c', cat: 'Os maxillaire / tissus mous', details: 'Tumeurs bénignes maxillaires. Tumeurs malignes face / maxillaires / cou. Ostéopathies maxillaires. Kystes (sans rapport dentaire). Ostéomyélite' },
  { art: '17d', cat: 'ATM / appareil locomoteur', details: 'Arthrose ATM. Ankylose ATM. Luxation condyle / disque articulaire' },
  { art: '17e', cat: 'Sinus maxillaire', details: 'Dent / fragment dans le sinus. Fistule bucco-sinusale' },
  { art: '17f', cat: 'Dysgnathies', details: '<b>1.</b> Syndrome apnée du sommeil <i>(SAOS confirmé par polysomnographie, dysgnathie causale)</i><br/><b>2.</b> Troubles graves de la déglutition <i>(transport oral/pharyngien impossible/douloureux — ankyloglossie, défauts vélaires, troubles neurologiques)</i><br/><b>3.</b> Asymétries graves crânio-faciales <i>(craniosténose, dysostose, hémiélongation / hémihypertrophie mandibulaire, hémiatrophie faciale)</i>' },
];

const lamalArt18 = [
  { art: '18a', cat: 'Hématologie', details: 'Neutropénie, anémie aplasique, leucémie, syndromes myélodysplasiques, diathèses hémorragiques' },
  { art: '18b', cat: 'Métabolisme', details: 'Acromégalie, hyperparathyroïdisme, hypophosphatasie (rachitisme vit. D résistant)' },
  { art: '18c', cat: 'Autres', details: 'Polyarthrite chronique, Bechterew, arthropathies psoriasiques, Papillon-Lefèvre, sclérodermie, SIDA, maladies psychiques graves avec atteinte masticatoire' },
  { art: '18d', cat: 'Glandes salivaires', details: 'Maladies des glandes salivaires' },
];

const lamalArt19 = [
  { art: '19a', details: 'Foyers infectieux lors de remplacement de valves cardiaques / prothèses de revascularisation / shunt crânien' },
  { art: '19b', details: 'Foyers infectieux avant traitement immunosuppresseur de longue durée' },
  { art: '19c', details: 'Foyers infectieux lors de radiothérapie / chimiothérapie de pathologie maligne' },
  { art: '19d', details: 'Foyers infectieux lors d\'endocardite' },
  { art: '19e', details: 'En cas de syndrome apnée du sommeil' },
];

const hgOcclusal = [
  { critere: 'Overjet excessif', seuil: '≥ 8 mm', auto: true },
  { critere: 'OJ négatif (crossbite antérieur)', seuil: '< 0 mm, ≥ 2 paires de dents', auto: true },
  { critere: 'Béance antérieure', seuil: '> 6 dents', auto: true },
  { critere: 'Béance latéro-postérieure', seuil: '> 2 paires de dents (hors dents de sagesse)', auto: false },
  { critere: 'Supraclusion traumatisante', seuil: 'Contact palatin traumatique', auto: true },
  { critere: 'Occlusion croisée postérieure', seuil: 'Crossbite latéral', auto: true },
  { critere: 'Encombrement (DDM)', seuil: '≥ 8 mm par arcade', auto: true },
];

const hgIntra = [
  { situation: 'Rhizalyse / Résorption', details: 'Résorption apicale due à encombrement (surtout 13, 12, 22, 23). Résorption sous-minante de la 5 de lait par molaire permanente. Résorption canines de lait par latérales permanentes' },
  { situation: 'Agénésie', details: 'Agénésie partielle d\'une dent importante (canine ou incisive)' },
  { situation: 'Ankylose', details: 'Ankylose précoce des molaires de lait' },
  { situation: 'Rétention / Retard', details: 'Dents retenues par manque de place, version des adjacentes, égression des antagonistes avec déséquilibre occlusion. Exception : dents incluses → LaMal' },
  { situation: 'Encombrement', details: '≥ 8 mm au niveau d\'une arcade' },
];

const hgAutres = [
  { critere: 'Langue', details: 'Problème lié à la langue (macroglossie, interposition linguale, etc.)' },
  { critere: 'Hauteur faciale', details: 'Hauteur faciale anormale (excès vertical ou déficit)' },
  { critere: 'SADAM', details: 'Syndrome algo-dysfonctionnel de l\'appareil manducateur' },
  { critere: 'Âge', details: '< 18 ans au moment de la demande' },
  { critere: 'Prérequis', details: 'Non couvert par AI ni LaMal. Ne pas commencer le traitement avant acceptation' },
];
