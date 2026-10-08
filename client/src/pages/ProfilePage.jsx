import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, KeyRound, Fingerprint, Star, Trash2, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/contactService';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled || false);
  const [biometric, setBiometric] = useState(user?.biometricEnabled || false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setAvatar(user.avatar);
      setTwoFactor(user.twoFactorEnabled);
      setBiometric(user.biometricEnabled);
    }
  }, [user]);

  const loadContacts = async () => {
    try {
      const res = await contactService.getContacts();
      if (res.success) setContacts(res.contacts);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile({
        name,
        phone,
        avatar,
        twoFactorEnabled: twoFactor,
        biometricEnabled: biometric,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const res = await contactService.toggleFavorite(id);
      if (res.success) {
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isFavorite: res.isFavorite } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await contactService.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      toast.success('Contact removed.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Account & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal details, credentials, 2FA authentication, and trusted contacts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="glass-card p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center text-center">
          <div className="relative mb-3">
            {avatar ? (
              <img
                src={avatar}
                alt={user?.name}
                className="w-20 h-20 rounded-3xl object-cover ring-4 ring-brand-500/20 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-brand-600 text-white font-bold text-2xl flex items-center justify-center">
                {user?.name?.[0]}
              </div>
            )}
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{user?.name}</h3>
          <p className="text-xs font-mono text-brand-600 dark:text-brand-400 font-semibold mt-0.5">{user?.upiId}</p>

          <div className="w-full mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-left space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Email Address</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Phone Number</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Role Privilege</span>
              <span className="font-bold uppercase text-brand-600 dark:text-brand-400">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="md:col-span-2 glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80">
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Security Toggles */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enhanced Security</h4>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Two-Factor Authentication (OTP)</p>
                    <p className="text-[11px] text-slate-400">Requires 6-digit verification code upon sign-in</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Biometric Login (Simulation)</p>
                    <p className="text-[11px] text-slate-400">Enable TouchID / FaceID passkey simulation</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={biometric}
                  onChange={(e) => setBiometric(e.target.checked)}
                  className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Change Password */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Update Password</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>

      {/* Saved Trusted Contacts Manager */}
      <div className="glass-card p-6 border border-slate-200/80 dark:border-slate-800/80">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Manage Saved Contacts ({contacts.length})
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {contacts.map((c) => (
            <div
              key={c._id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {c.contactUser?.avatar ? (
                  <img src={c.contactUser.avatar} alt={c.contactUser.name} className="w-8 h-8 rounded-xl object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                    {c.contactUser?.name?.[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.nickname || c.contactUser?.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{c.contactUser?.upiId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleToggleFavorite(c._id)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Star className={`w-3.5 h-3.5 ${c.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                </button>
                <button
                  onClick={() => handleDeleteContact(c._id)}
                  className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
