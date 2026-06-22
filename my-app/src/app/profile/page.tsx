'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserProfile {
  _id: string;
  name?: string;
  email: string;
  image?: string;
  provider: string;
  role: string;
  createdAt?: string;
}

type ToastType = 'success' | 'error';

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
        type === 'success'
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">✕</button>
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel, loading }: { onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  const [confirmText, setConfirmText] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 text-center">Delete account</h3>
        <p className="text-sm text-zinc-500 text-center mt-2">
          This permanently removes your account, cart, and cancels open orders. This cannot be undone.
        </p>
        <div className="mt-5">
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">
            Type <span className="font-mono text-zinc-900">delete my account</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="delete my account"
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== 'delete my account' || loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name ?? '');
        }
      });
  }, [status]);

  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      let imageUrl = profile.image;

      // Upload avatar first if a new one was selected
      if (avatarFile) {
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append('file', avatarFile);
        const uploadRes = await fetch('/api/upload/avatar', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        setUploadingAvatar(false);

        if (!uploadRes.ok) {
          showToast(uploadData.error ?? 'Avatar upload failed', 'error');
          setSaving(false);
          return;
        }
        imageUrl = uploadData.url;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), image: imageUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error ?? 'Failed to save changes', 'error');
        return;
      }

      setProfile(data.user);
      setAvatarFile(null);
      // Update NextAuth session so the header/nav reflects the new name+avatar
      await updateSession({ name: data.user.name, image: data.user.image });
      showToast('Profile updated', 'success');
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error ?? 'Failed to delete account', 'error');
        setDeletingAccount(false);
        return;
      }
      await signOut({ callbackUrl: '/' });
    } catch {
      showToast('Something went wrong', 'error');
      setDeletingAccount(false);
    }
  };

  const avatarSrc = avatarPreview ?? profile?.image ?? null;
  const initials = (profile?.name ?? profile?.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isGoogleUser = profile?.provider === 'google';
  const hasChanges =
    name.trim() !== (profile?.name ?? '') || avatarFile !== null;

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  if (status === 'loading' || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Account settings</h1>
          {memberSince && (
            <p className="text-sm text-zinc-400 mt-1">Member since {memberSince}</p>
          )}
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Profile</p>

          {/* Avatar */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Change profile picture"
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt="Profile picture"
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={!!avatarPreview} // blob URL — skip Next.js optimisation
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold text-xl">
                  {initials}
                </span>
              )}
              {/* Hover overlay */}
              <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div>
              <p className="text-sm font-medium text-zinc-700">Profile picture</p>
              <p className="text-xs text-zinc-400 mt-0.5">JPEG, PNG, WebP or GIF · max 5 MB</p>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                  className="text-xs text-indigo-600 hover:underline mt-1"
                >
                  Remove new image
                </button>
              )}
            </div>
          </div>

          {/* Display name */}
          <div className="space-y-1.5">
            <label htmlFor="display-name" className="block text-sm font-medium text-zinc-700">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder-zinc-300"
            />
          </div>

          {/* Email — read-only */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Email address
            </label>
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-sm text-zinc-600 flex-1">{profile.email}</span>
              {isGoogleUser && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-white border border-zinc-200 rounded-full px-2.5 py-0.5">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">Email cannot be changed here.</p>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="w-full py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {uploadingAvatar ? 'Uploading image…' : saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-400">Danger zone</p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-800">Delete account</p>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Permanently remove your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          loading={deletingAccount}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}