import React from 'react';
import { Plus, User, Star } from 'lucide-react';
import { getInitials } from '../../utils/formatters';

export const QuickSendContacts = ({ contacts = [], onSelectContact, onAddContact }) => {
  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quick Pay Contacts</h4>
        </div>
        <button
          onClick={onAddContact}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-none">
        {/* Add new avatar button */}
        <button
          onClick={onAddContact}
          className="flex flex-col items-center space-y-1.5 shrink-0 group focus:outline-none"
        >
          <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-brand-500 group-hover:text-brand-500 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Add</span>
        </button>

        {contacts.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 italic">No favorite contacts yet. Add friends for 1-click transfers!</div>
        ) : (
          contacts.map((c) => {
            const user = c.contactUser;
            if (!user) return null;
            return (
              <button
                key={c._id}
                onClick={() => onSelectContact(user)}
                className="flex flex-col items-center space-y-1.5 shrink-0 group focus:outline-none"
              >
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-brand-500 group-hover:scale-105 transition-all shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
                      {getInitials(user.name)}
                    </div>
                  )}
                  {c.isFavorite && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[8px] text-amber-950 font-black">
                      ★
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-[70px] text-center">
                  {c.nickname || user.name.split(' ')[0]}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
