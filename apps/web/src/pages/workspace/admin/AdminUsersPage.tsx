import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Mail,
  Building,
  Compass
} from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  institution: string;
  designation: string;
  domain: string;
  role: 'admin' | 'researcher';
  expeditions: string[];
  status: 'active' | 'invited';
}

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'res_sharma',
    name: 'Dr. Rajesh Sharma',
    email: 'rsharma@ncpor.res.in',
    institution: 'National Centre for Polar and Ocean Research (NCPOR)',
    designation: 'Scientist-G & Expedition Leader',
    domain: 'Glaciology',
    role: 'researcher',
    expeditions: ['45th Indian Scientific Expedition to Antarctica'],
    status: 'active'
  },
  {
    id: 'res_bose',
    name: 'Dr. Sunita Bose',
    email: 'admin@ncpor.res.in',
    institution: 'Ministry of Earth Sciences (MoES) / NCPOR',
    designation: 'Lead Knowledge Architect & Administrator',
    domain: 'Cryosphere & Governance',
    role: 'admin',
    expeditions: ['45th Indian Antarctic Expedition', 'Arctic Himadri Campaign'],
    status: 'active'
  },
  {
    id: 'res_menon',
    name: 'Dr. Ananya Menon',
    email: 'amenon@ncpor.res.in',
    institution: 'National Centre for Polar and Ocean Research (NCPOR)',
    designation: 'Senior Scientist',
    domain: 'Physical Oceanography',
    role: 'researcher',
    expeditions: ['45th Indian Antarctic Expedition', 'Southern Ocean Cruise'],
    status: 'active'
  },
  {
    id: 'res_patel',
    name: 'Dr. Vikram Patel',
    email: 'vpatel@iig.res.in',
    institution: 'Indian Institute of Geomagnetism (IIG)',
    designation: 'Principal Scientist',
    domain: 'Atmospheric Physics',
    role: 'researcher',
    expeditions: ['45th Indian Antarctic Expedition', 'Kongsfjorden Campaign'],
    status: 'active'
  }
];

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');

  const filteredUsers = INITIAL_USERS.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = domainFilter === 'ALL' || u.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Institutional Governance
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Access Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Authorized Scientific Personnel & Roles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage MoES / NCPOR researcher accounts, expedition credentials, and peer verification sign-off authority.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all">
          <UserPlus className="w-4 h-4" />
          <span>Provision Researcher Access</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-subtle">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, domain, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Domain:</span>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="ALL">All Domains</option>
            <option value="Glaciology">Glaciology</option>
            <option value="Physical Oceanography">Physical Oceanography</option>
            <option value="Atmospheric Physics">Atmospheric Physics</option>
            <option value="Cryosphere & Governance">Cryosphere & Governance</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-subtle overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono uppercase text-slate-500 tracking-wider">
              <th className="py-3 px-4">Researcher & Credentials</th>
              <th className="py-3 px-4">Domain & Station</th>
              <th className="py-3 px-4">Role & Authority</th>
              <th className="py-3 px-4">Assigned Expeditions</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(3) || user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-medium text-slate-800 block">{user.domain}</span>
                  <span className="text-[11px] text-slate-400">{user.designation}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                      user.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-polar-50 text-polar-700 border border-polar-200'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {user.role === 'admin' ? 'Knowledge Admin' : 'Scientific Contributor'}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    {user.expeditions.map((exp, i) => (
                      <span
                        key={i}
                        className="inline-block text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded mr-1"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
