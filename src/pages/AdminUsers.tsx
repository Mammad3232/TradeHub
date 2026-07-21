import React, { useState } from 'react';
import { Users, Search, Shield, Store, UserCircle, Lock, Unlock } from 'lucide-react';

interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: 'Customer' | 'Vendor' | 'Admin';
  status: 'Active' | 'Suspended';
  joined: string;
}

const initialUsers: SystemUser[] = [
  { id: 1, name: 'Aida Mammadova',  email: 'aida@example.com',    role: 'Customer', status: 'Active',    joined: '2026-01-12' },
  { id: 2, name: 'Murad Hasanov',   email: 'murad@example.com',   role: 'Vendor',   status: 'Active',    joined: '2026-02-05' },
  { id: 3, name: 'Sara Aliyeva',    email: 'sara@example.com',    role: 'Customer', status: 'Suspended', joined: '2026-03-18' },
  { id: 4, name: 'Elvin Jafarov',   email: 'elvin@example.com',   role: 'Vendor',   status: 'Active',    joined: '2026-06-30' },
  { id: 5, name: 'Nigar Quliyeva',  email: 'nigar@example.com',   role: 'Admin',    status: 'Active',    joined: '2025-11-01' },
];

const roleIcon = {
  Admin: Shield,
  Vendor: Store,
  Customer: UserCircle,
};

const roleColors = {
  Admin: 'bg-red-500/10 text-red-400 border-red-500/20',
  Vendor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Customer: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [query, setQuery] = useState('');

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === id) {
          const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
          return { ...user, status: newStatus };
        }
        return user;
      })
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-8 text-left">
      {/* Header section */}
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/25">
          <Users className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Users</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor, suspend, or reactivate user accounts.</p>
        </div>
      </div>

      {/* Search Filter input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by name, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
        />
        <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
      </div>

      {/* Users table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/40 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-350">
              {filteredUsers.map((user) => {
                const RoleIcon = roleIcon[user.role];
                return (
                  <tr key={user.id} className="hover:bg-slate-950/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{user.name}</td>
                    <td className="px-6 py-4 text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleColors[user.role]}`}>
                        <RoleIcon className="h-3.5 w-3.5" />
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{user.joined}</td>
                    <td className="px-6 py-4">
                      {user.status === 'Active' ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-red-500/10 text-red-400 border-red-500/20 animate-pulse">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'Admin' ? (
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={`inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border ${
                            user.status === 'Active'
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/10'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/10'
                          }`}
                        >
                          {user.status === 'Active' ? (
                            <>
                              <Lock className="h-3.5 w-3.5" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3.5 w-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold italic select-none">
                          Protected
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
