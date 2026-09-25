import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Shield, Trash2, Edit2, Sparkles, ArrowLeft, X } from 'lucide-react';
import { useProfile, AVATAR_COLOR_PRESETS, UserProfile } from '../context/ProfileContext';

export const ProfileSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { profiles, activeProfile, selectProfile, addProfile, updateProfile, deleteProfile } = useProfile();

  const [isManaging, setIsManaging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);

  // New profile form state
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(AVATAR_COLOR_PRESETS[0].gradient);
  const [newIsKids, setNewIsKids] = useState(false);

  const handleSelect = (profileId: string) => {
    if (isManaging) {
      const p = profiles.find((item) => item.id === profileId);
      if (p) {
        setEditingProfile(p);
        setNewName(p.name);
        setNewColor(p.avatarColor);
        setNewIsKids(p.isKidsMode);
        setShowAddModal(true);
      }
    } else {
      selectProfile(profileId);
      navigate('/');
    }
  };

  const handleOpenAdd = () => {
    setEditingProfile(null);
    setNewName('');
    setNewColor(AVATAR_COLOR_PRESETS[0].gradient);
    setNewIsKids(false);
    setShowAddModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (editingProfile) {
      updateProfile(editingProfile.id, {
        name: newName.trim(),
        avatarColor: newColor,
        isKidsMode: newIsKids,
      });
    } else {
      addProfile({
        name: newName.trim(),
        avatarColor: newColor,
        isKidsMode: newIsKids,
      });
    }

    setShowAddModal(false);
    setEditingProfile(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) return;
    deleteProfile(id);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-16 sm:py-24 relative select-none">
      {/* Top Bar Back to Streaming button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Browse</span>
        </button>
      </div>

      <div className="max-w-4xl w-full text-center">
        {/* Title */}
        <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
          {isManaging ? 'Manage Profiles' : "Who's watching?"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-10 sm:mb-14">
          {isManaging
            ? 'Select a profile to customize colors, parental controls, or manage access.'
            : 'Select your viewing profile to load your personalized recommendations and watchlist.'}
        </p>

        {/* Profiles Grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-12">
          {profiles.map((p) => {
            const isActive = p.id === activeProfile.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className="group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                {/* Avatar Box */}
                <div className="relative">
                  <div
                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr ${p.avatarColor} p-1 shadow-xl transition-all duration-300 group-hover:ring-4 group-hover:ring-white/40 ${
                      isActive && !isManaging ? 'ring-2 ring-red-500 shadow-red-950/50' : ''
                    }`}
                  >
                    <div className="w-full h-full rounded-xl bg-zinc-900/90 flex flex-col items-center justify-center overflow-hidden relative">
                      <span className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                        {p.name.charAt(0).toUpperCase()}
                      </span>

                      {/* Kids Mode Badge */}
                      {p.isKidsMode && (
                        <div className="absolute bottom-1 px-1.5 py-0.5 rounded bg-amber-500/90 text-zinc-950 text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm">
                          <Shield className="h-2.5 w-2.5 fill-current" />
                          <span>KIDS</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit overlay while in management mode */}
                  {isManaging && (
                    <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-[2px] flex items-center justify-center border-2 border-dashed border-white/60 animate-fadeIn">
                      <Edit2 className="h-6 w-6 text-white drop-shadow" />
                    </div>
                  )}

                  {/* Active Profile Checkmark badge */}
                  {isActive && !isManaging && (
                    <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-600 border-2 border-zinc-950 flex items-center justify-center shadow-lg">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}

                  {/* Delete button if managing and more than 1 profile */}
                  {isManaging && profiles.length > 1 && (
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      title="Delete profile"
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-zinc-800 hover:bg-red-600 border-2 border-zinc-950 flex items-center justify-center text-zinc-300 hover:text-white transition-colors shadow-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Profile Name */}
                <span className="mt-3 text-sm sm:text-base font-medium text-zinc-400 group-hover:text-white transition-colors truncate max-w-[120px]">
                  {p.name}
                </span>
              </div>
            );
          })}

          {/* Add Profile Card */}
          <div
            onClick={handleOpenAdd}
            className="group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-zinc-400 bg-zinc-900/40 hover:bg-zinc-850 flex items-center justify-center transition-colors">
              <Plus className="h-8 w-8 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
            <span className="mt-3 text-sm sm:text-base font-medium text-zinc-500 group-hover:text-zinc-200 transition-colors">
              Add Profile
            </span>
          </div>
        </div>

        {/* Manage Profiles / Done Toggle Button */}
        <div>
          <button
            onClick={() => setIsManaging(!isManaging)}
            className={`px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-200 border ${
              isManaging
                ? 'bg-white text-zinc-950 border-white shadow-lg'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700/80'
            }`}
          >
            {isManaging ? 'Done' : 'Manage Profiles'}
          </button>
        </div>
      </div>

      {/* Add / Edit Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-display text-xl font-bold text-white mb-1">
              {editingProfile ? 'Edit Profile' : 'Add New Profile'}
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Create a personalized space with custom themes and optional parental controls.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Profile Name Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Profile Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Movie Buff, Sarah, Gaming"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-750 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Avatar Color Gradient Picker */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Avatar Theme Color
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {AVATAR_COLOR_PRESETS.map((preset) => {
                    const isSelected = newColor === preset.gradient;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setNewColor(preset.gradient)}
                        className={`flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border transition-all ${
                          isSelected ? 'border-red-500 ring-2 ring-red-500/30' : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`h-6 w-6 rounded-lg bg-gradient-to-tr ${preset.gradient} shrink-0`} />
                        <span className="text-[11px] text-zinc-300 truncate">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kids Mode Toggle */}
              <div className="pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Kids Profile</p>
                      <p className="text-[11px] text-zinc-400">
                        Restricts mature ratings (TV-MA, R) and filters out horror & violence.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsKids}
                      onChange={(e) => {
                        setNewIsKids(e.target.checked);
                        if (e.target.checked) {
                          setNewColor(AVATAR_COLOR_PRESETS.find((p) => p.id === 'kids')?.gradient || newColor);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-lg shadow-red-950/50"
                >
                  {editingProfile ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
