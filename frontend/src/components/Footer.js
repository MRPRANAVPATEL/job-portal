import React from 'react';
import {Link} from 'react-router-dom';
export default function Footer() {
  return <footer className="portal-foot"><strong>JobSphere</strong><Link to="/register">Job seeker registration</Link><Link to="/companyregister">Employer registration</Link></footer>;
}
