import React, { useState, useEffect } from 'react';
import { X, Shield, Check, Clock } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { USER_TAGS, getTagInfo, getTagCooldownEnd, TAG_COOLDOWN_DAYS } from '../utils/tagUtils';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  isDarkMode: boolean;
  onProfileUpdated: () => void; // trigger AuthContext.refreshProfile() after a successful save
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isDarkMode,
  onProfileUpdated,
}) => {
  const [selectedTag, setSelectedTag] = useState(currentUser.user_tag ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Keep the local selection in sync if the modal is reopened after an update
  useEffect(() => {
    setSelectedTag(currentUser.user_tag ?? null);
  }, [currentUser.user_tag, isOpen]);

  if (!isOpen) return null;

  const cooldownEnd = getTagCooldownEnd(currentUser.tag_updated_at);
  const isInCooldown = cooldownEnd !== null;
  const hasChangedSelection = selectedTag !== (currentUser.user_tag ?? null);

  const handleSave = async () => {
    if (!hasChangedSelection || isInCooldown || !selectedTag) return;

    setIsSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ user_tag: selectedTag, tag_updated_at: new Date().toISOString() })
      .eq('id', currentUser.id);

    setIsSaving(false);

    if (updateError) {
      console.error('Failed to update tag:', updateError.message);
      setError('Failed to save — please try again.');
      return;
    }

    onProfileUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`relative w-full max-w-md rounded-xl border p-6 ${
          isDarkMode ? 'bg-[#0b0b0c] border-white/10 text-zinc-200' : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded transition cursor-pointer ${
            isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header: avatar + name + username */}
        <div className="flex items-center gap-3 mb-6">
          {currentUser.avatar_url ? (
            <img src={currentUser.avatar_url} alt={currentUser.display_name} className="h-14 w-14 rounded-full object-cover ring-2 ring-indigo-500/40" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold text-white">
              {currentUser.display_name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <div className="text-lg font-semibold leading-tight">{currentUser.display_name}</div>
            <div className={`text-xs font-mono ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`}>
              @{currentUser.display_name?.toLowerCase().replace(/\s+/g, '_')}
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className={`rounded-md border p-3 mb-6 text-sm space-y-2 ${isDarkMode ? 'border-white/10 bg-[#141416]' : 'border-stone-200 bg-stone-50'}`}>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-zinc-500' : 'text-stone-500'}>Email</span>
            <span className="font-mono">{currentUser.email || 'Not shared (anonymous session)'}</span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-zinc-500' : 'text-stone-500'}>Member since</span>
            <span className="font-mono">{new Date(currentUser.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* User Tag selector */}
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-semibold flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Your Tag
          </label>
          {currentUser.user_tag && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getTagInfo(currentUser.user_tag)?.[isDarkMode ? 'badgeClassDark' : 'badgeClassLight']}`}>
              Current: {getTagInfo(currentUser.user_tag)?.label}
            </span>
          )}
        </div>
        <p className={`text-xs mb-3 ${isDarkMode ? 'text-zinc-500' : 'text-stone-500'}`}>
          Describes how you show up on SOLV / GRID. Changeable once every {TAG_COOLDOWN_DAYS} days.
        </p>

        <div className="space-y-2 mb-4">
          {USER_TAGS.map((tag) => {
            const isSelected = selectedTag === tag.value;
            return (
              <button
                key={tag.value}
                onClick={() => !isInCooldown && setSelectedTag(tag.value)}
                disabled={isInCooldown}
                className={`w-full text-left rounded-md border p-3 transition ${
                  isInCooldown ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isSelected
                    ? isDarkMode
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-indigo-400 bg-indigo-50'
                    : isDarkMode
                      ? 'border-white/10 hover:border-white/20'
                      : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{tag.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-indigo-500" />}
                </div>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>{tag.description}</p>
              </button>
            );
          })}
        </div>

        {isInCooldown && cooldownEnd && (
          <div className={`flex items-center gap-1.5 text-xs mb-4 px-3 py-2 rounded-md ${isDarkMode ? 'bg-amber-950/40 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              You can change your tag again on{' '}
              {cooldownEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at{' '}
              {cooldownEnd.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.
            </span>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={!hasChangedSelection || isInCooldown || isSaving}
          className="w-full rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 font-mono text-sm font-bold uppercase text-white shadow-md shadow-indigo-600/20 transition cursor-pointer active:scale-95"
        >
          {isSaving ? 'Saving...' : 'Save Tag'}
        </button>
      </div>
    </div>
  );
};
