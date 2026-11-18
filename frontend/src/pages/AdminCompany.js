import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Header from '../components/Header';
import './AdminCompany.css';

const stages = ['Applied', 'Screened', 'Interview', 'Offer', 'Hired', 'Rejected'];
export default function AdminCompany() {
  const [company, setCompany] = useState(null);
  const [jobs,setJobs] = useState([]);
  const [applications,setApplications] = useState([]);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    async function load() {
      const session = await fetch('/api/check-login').then(r => r.json());
      if (!active) return;
      if (!session.user?.company_id) { navigate('/companylogin', {replace:true}); return; }
      const results = await Promise.all(['my-jobs','my-applications'].map(async name => {
        const response = await fetch('/api/company/' + name);
        if (!response.ok) throw new Error('Could not load your hiring dashboard.');
        return response.json();
      }));
      if (active) { setJobs(results[0].jobs); setApplications(results[1].applications); setCompany(session.user); }
    }
    load().catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  },[navigate]);
  async function changeStatus(id,status) {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/company/applications/' + id, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
      if (!response.ok) throw new Error('Could not save the application status.');
      setApplications(items => items.map(item => item.application_id === id ? {...item,status} : item));
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <><Header/><main className="hiring">
    {error && <p role="alert">{error}</p>}
    {!company ? !error && <p>Loading dashboard…</p> : <>
      <div className="hiring-heading"><div><p>{company.name}</p><h1>Hiring dashboard</h1></div><Link className="hero-action" to="/Jobsregister">Post a job</Link></div>
      <div className="hiring-totals">{[['Jobs posted',jobs.length],['Applications',applications.length],['Candidates hired',applications.filter(a=>a.status==='Hired').length]].map(([label,count]) => <div key={label}><strong>{count}</strong>{label}</div>)}</div>
      <section><h2>Your job postings</h2>{jobs.length ? <ul>{jobs.map(job => <li key={job.job_id}><strong>{job.title}</strong><span>{job.location} · {job.job_type}</span><span>{applications.filter(a=>a.job_id===job.job_id).length} applications</span></li>)}</ul> : <p>Post your first job to start receiving applications.</p>}</section>
      <section><h2>Applications</h2>{applications.length ? <ul>{applications.map(app => <li key={app.application_id}><div><strong>{app.full_name}</strong><a href={'mailto:'+app.email}>{app.email}</a></div><span>{app.job_title} · {new Date(app.application_date).toLocaleDateString()}</span><label>Status <select aria-label={'Status for '+app.full_name} value={app.status} disabled={busy} onChange={e=>changeStatus(app.application_id,e.target.value)}>{stages.map(stage=><option key={stage}>{stage}</option>)}</select></label></li>)}</ul> : <p>Applications will appear here when a candidate applies.</p>}</section>
    </>}
  </main></>;
}
