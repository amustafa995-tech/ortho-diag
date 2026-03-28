import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { initialSession } from '../../store/useStore';

export default function SessionSelector() {
  const patient = useStore(state => state.patient);
  const activeSessionId = patient.activeSessionId;
  const sessions = patient.sessions;
  const setActiveSession = useStore(state => state.setActiveSession);
  const addSession = useStore(state => state.addSession);
  const deleteSession = useStore(state => state.deleteSession);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddSession = () => {
    const newId = `T${sessions.length}`;
    addSession({
      ...initialSession,
      id: newId,
      date: newDate,
      nomSession: `Évaluation ${newId}`,
    });
    setNewDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <select 
        value={activeSessionId} 
        onChange={(e) => setActiveSession(e.target.value)}
        style={{ padding: '0.4rem 2rem 0.4rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.9rem', backgroundColor: '#fff', color: '#0f172a', fontWeight: 600, cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
      >
        {sessions.map(s => (
          <option key={s.id} value={s.id}>[{s.id}] {new Date(s.date).toLocaleDateString('fr-CH')}</option>
        ))}
      </select>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="btn btn-outline"
        style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
      >
        Gérer...
      </button>

      {isModalOpen && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(15,23,42,0.4)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card" style={{width:'400px', backgroundColor:'#fff', padding:'1.5rem', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <h3 style={{margin:0, fontSize:'1.1rem', color:'#0f172a'}}>Gestion des Sessions</h3>
              <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#64748b'}}>×</button>
            </div>
            
            <div style={{marginBottom:'1rem', paddingBottom:'1rem', borderBottom:'1px solid var(--border-color)'}}>
              <label style={{display:'block', fontSize:'0.85rem', fontWeight:600, color:'#475569', marginBottom:'0.5rem'}}>Nouvelle Session (Date)</label>
              <div style={{display:'flex', gap:'0.5rem'}}>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{flex:1, padding:'0.5rem', border:'1px solid #cbd5e1', borderRadius:'4px'}} />
                <button onClick={handleAddSession} className="btn btn-primary" style={{padding:'0.5rem 1rem'}}>Ajouter</button>
              </div>
            </div>

            <div>
              <label style={{display:'block', fontSize:'0.85rem', fontWeight:600, color:'#475569', marginBottom:'0.5rem'}}>Sessions existantes</label>
              <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                {sessions.map(s => (
                  <li key={s.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem', backgroundColor:'#f8fafc', borderRadius:'4px', border:'1px solid #e2e8f0'}}>
                    <div style={{fontSize:'0.9rem'}}>
                      <span style={{fontWeight:600, color:'#0f172a'}}>[{s.id}]</span> {new Date(s.date).toLocaleDateString('fr-CH')}
                    </div>
                    {sessions.length > 1 && (
                      <button 
                         onClick={() => { if(window.confirm('Supprimer cette session ?')) deleteSession(s.id); }} 
                         style={{background:'rgba(239,68,68,0.1)', color:'#dc2626', border:'none', borderRadius:'3px', padding:'0.2rem 0.5rem', fontSize:'0.75rem', cursor:'pointer', fontWeight:600}}
                      >
                         Supprimer
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={{marginTop:'1.5rem', textAlign:'right'}}>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-outline">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
