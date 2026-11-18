import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../portal.css';

export default function Header() {
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    fetch('/api/check-login').then(r => r.json()).then(data => {
      if (active) setAccount(data.user || null);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  async function logout() {
    const response = await fetch('/api/logout');
    if (!response.ok) return;
    setAccount(null);
    sessionStorage.removeItem('companyUser');
    sessionStorage.removeItem('user');
    navigate('/');
  }
  return <header className="portal-nav"><Link className="wordmark" to="/">JobSphere</Link>
    <nav aria-label="Main"><Link to="/jobs">Browse jobs</Link>
      <Link to={account?.company_id ? '/company-dashboard' : '/companylogin'}>{account?.company_id ? 'Dashboard' : 'For employers'}</Link>
      {account ? <button onClick={logout}>Sign out</button> : <Link to="/login">Sign in</Link>}
    </nav></header>;
}
