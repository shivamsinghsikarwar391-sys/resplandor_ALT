import React, { useState, useEffect, useCallback } from 'react';
import { 
  adminLogin, 
  adminRequestPasswordReset,
  adminResetPassword,
  adminRecoverAccount,
  adminUpdateCredentials,
  fetchAdminAppointments, 
  approveAppointment, 
  rejectAppointment, 
  rescheduleAppointment, 
  updateAppointmentStatus,
  fetchAdminSettings,
  updateAdminSettings
} from '../../services/api';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  AlertCircle, 
  Filter, 
  Search, 
  RefreshCw, 
  LogOut, 
  Lock, 
  Shield, 
  Settings, 
  Sparkles, 
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Key,
  Copy,
  ShieldCheck,
  HelpCircle,
  CheckCheck,
  Send,
  Plus,
  Trash2,
  CalendarDays,
  Check,
  X
} from 'lucide-react';
import InstagramIcon from '../icons/InstagramIcon';

export default function AdminDashboard({ onExit }) {
  const [token, setToken] = useState(() => localStorage.getItem('resplandor_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('resplandor_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Auth view: 'login' | 'recovery'
  const [authView, setAuthView] = useState('login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Recovery UI state
  // recoveryTab: 'password' (Forgot Password) | 'account' (Forgot Email / Username)
  const [recoveryTab, setRecoveryTab] = useState('password');
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Request Code / Input key, 2: Enter code & set password, 3: Success
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryMasterKey, setRecoveryMasterKey] = useState('');
  const [useMasterKeyMode, setUseMasterKeyMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [recoveryNotice, setRecoveryNotice] = useState('');
  const [recoveryData, setRecoveryData] = useState(null); // { maskedEmail, username, emailConfigured, demoCode }

  // Account identity recovery state (Forgot Email / Username)
  const [accountRecoveryKey, setAccountRecoveryKey] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountData, setAccountData] = useState(null); // { id, username, email, maskedEmail, name }
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [updatingAccount, setUpdatingAccount] = useState(false);
  const [accountSuccessMsg, setAccountSuccessMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [showRecoveryKeyInSettings, setShowRecoveryKeyInSettings] = useState(false);

  // Active Tab: 'appointments' | 'settings' | 'audit'
  const [activeTab, setActiveTab] = useState('appointments');

  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState({ pending: 0, confirmedToday: 0, upcoming: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Modal actions
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'approve' | 'reject' | 'reschedule' | 'details'
  const [rejectionReason, setRejectionReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', notes: '' });
  const [modalActionError, setModalActionError] = useState('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState('');

  // Settings state
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [newBlackoutDate, setNewBlackoutDate] = useState('');

  // 1. Load appointments
  const loadAppointments = useCallback(async (authToken = token) => {
    if (!authToken) return;
    setLoading(true);
    setFetchError('');
    const res = await fetchAdminAppointments(authToken, {
      status: statusFilter,
      date: dateFilter,
      search: searchFilter
    });
    setLoading(false);
    if (res.ok && res.appointments) {
      setAppointments(res.appointments);
      if (res.metrics) setMetrics(res.metrics);
    } else if (res.status === 401) {
      handleLogout();
    } else {
      setFetchError(res.error || 'Failed to load appointments.');
    }
  }, [token, statusFilter, dateFilter, searchFilter]);

  // 2. Load settings
  const loadSettings = useCallback(async (authToken = token) => {
    if (!authToken) return;
    const res = await fetchAdminSettings(authToken);
    if (res.success && res.settings) {
      setSettings(res.settings);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadAppointments();
      loadSettings();
    }
  }, [token, loadAppointments, loadSettings]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    const res = await adminLogin(username, password);
    setLoggingIn(false);

    if (res.ok && res.token) {
      setToken(res.token);
      setAdminUser(res.admin);
      localStorage.setItem('resplandor_admin_token', res.token);
      localStorage.setItem('resplandor_admin_user', JSON.stringify(res.admin));
    } else {
      setLoginError(res.error || 'Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setAdminUser(null);
    localStorage.removeItem('resplandor_admin_token');
    localStorage.removeItem('resplandor_admin_user');
  };

  // Recovery Handler: Request 6-digit Code
  const handleRequestResetCode = async (e) => {
    if (e) e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');
    if (!recoveryIdentifier.trim()) {
      setRecoveryError('Please enter your administrator username or email.');
      return;
    }

    setRecoveryLoading(true);
    const res = await adminRequestPasswordReset(recoveryIdentifier.trim());
    setRecoveryLoading(false);

    if (res.ok && res.success) {
      setRecoveryData(res);
      setRecoveryStep(2);
      if (res.demoCode) {
        setRecoveryNotice(`Code generated: ${res.demoCode}`);
      }
    } else {
      setRecoveryError(res.error || 'Failed to request reset verification code.');
    }
  };

  // Recovery Handler: Reset Password
  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    if (newPassword.length < 8) {
      setRecoveryError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setRecoveryError('Passwords do not match. Please verify both fields.');
      return;
    }

    if (!useMasterKeyMode && !recoveryCode.trim()) {
      setRecoveryError('Please enter the 6-digit verification code.');
      return;
    }

    if (useMasterKeyMode && !recoveryMasterKey.trim()) {
      setRecoveryError('Please enter your Salon Master Recovery Key.');
      return;
    }

    setRecoveryLoading(true);
    const res = await adminResetPassword({
      identifier: recoveryIdentifier.trim() || undefined,
      resetCode: useMasterKeyMode ? undefined : recoveryCode.trim(),
      recoveryKey: useMasterKeyMode ? recoveryMasterKey.trim() : undefined,
      newPassword
    });
    setRecoveryLoading(false);

    if (res.ok && res.success) {
      setRecoveryStep(3);
      setRecoverySuccess(res.message || 'Password successfully updated.');
      if (res.username) {
        setUsername(res.username);
      }
    } else {
      setRecoveryError(res.error || 'Failed to reset password.');
    }
  };

  // Recovery Handler: Verify Master Key to recover Username & Email
  const handleRecoverAccountSubmit = async (e) => {
    if (e) e.preventDefault();
    setAccountError('');
    setAccountSuccessMsg('');

    if (!accountRecoveryKey.trim()) {
      setAccountError('Please enter the Salon Master Recovery Key.');
      return;
    }

    setAccountLoading(true);
    const res = await adminRecoverAccount(accountRecoveryKey.trim());
    setAccountLoading(false);

    if (res.ok && res.success && res.admin) {
      setAccountData(res.admin);
      setEditEmail(res.admin.email);
      setEditUsername(res.admin.username);
    } else {
      setAccountError(res.error || 'Invalid recovery key or recovery failed.');
    }
  };

  // Recovery Handler: Update Credentials via Verified Master Key
  const handleUpdateCredentialsSubmit = async (e) => {
    if (e) e.preventDefault();
    setAccountError('');
    setAccountSuccessMsg('');

    if (!editEmail.trim()) {
      setAccountError('Email address cannot be empty.');
      return;
    }

    if (editPassword && editPassword.length < 8) {
      setAccountError('New password must be at least 8 characters long.');
      return;
    }

    setUpdatingAccount(true);
    const res = await adminUpdateCredentials({
      recoveryKey: accountRecoveryKey.trim(),
      newUsername: editUsername.trim() || undefined,
      newEmail: editEmail.trim(),
      newPassword: editPassword || undefined
    });
    setUpdatingAccount(false);

    if (res.ok && res.success) {
      setAccountSuccessMsg(res.message || 'Credentials updated successfully!');
      if (res.admin?.username) {
        setUsername(res.admin.username);
      }
      setAccountData((prev) => ({
        ...prev,
        username: res.admin?.username || prev.username,
        email: res.admin?.email || prev.email
      }));
      setEditPassword('');
    } else {
      setAccountError(res.error || 'Failed to update credentials.');
    }
  };

  // Copy helper
  const handleCopy = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const handleBackToLogin = () => {
    setAuthView('login');
    setRecoveryStep(1);
    setRecoveryError('');
    setRecoverySuccess('');
    setAccountError('');
    setAccountSuccessMsg('');
    setRecoveryCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Action: Approve
  const handleApprove = async (id) => {
    setModalActionError('');
    const res = await approveAppointment(token, id);
    if (res.ok) {
      setActionSuccessNotice('Appointment approved and confirmed successfully!');
      setTimeout(() => setActionSuccessNotice(''), 4000);
      closeModal();
      loadAppointments();
    } else {
      setModalActionError(res.error || 'Failed to approve appointment.');
    }
  };

  // Action: Reject
  const handleReject = async (id) => {
    setModalActionError('');
    const res = await rejectAppointment(token, id, rejectionReason);
    if (res.ok) {
      setActionSuccessNotice('Appointment request rejected.');
      setTimeout(() => setActionSuccessNotice(''), 4000);
      closeModal();
      loadAppointments();
    } else {
      setModalActionError(res.error || 'Failed to reject appointment.');
    }
  };

  // Action: Reschedule
  const handleReschedule = async (id) => {
    setModalActionError('');
    if (!rescheduleData.date || !rescheduleData.time) {
      setModalActionError('Please select both a new appointment date and time.');
      return;
    }

    const res = await rescheduleAppointment(
      token, 
      id, 
      rescheduleData.date, 
      rescheduleData.time, 
      rescheduleData.notes
    );

    if (res.ok) {
      setActionSuccessNotice(`Appointment successfully rescheduled to ${rescheduleData.date} at ${rescheduleData.time}!`);
      setTimeout(() => setActionSuccessNotice(''), 4000);
      closeModal();
      loadAppointments();
    } else {
      setModalActionError(res.error || 'Failed to reschedule appointment.');
    }
  };

  // Action: Quick Status (Completed / Cancelled)
  const handleQuickStatus = async (id, status) => {
    const res = await updateAppointmentStatus(token, id, status);
    if (res.ok) {
      setActionSuccessNotice(`Appointment marked as ${status}.`);
      setTimeout(() => setActionSuccessNotice(''), 4000);
      loadAppointments();
    } else {
      alert(res.error || 'Failed to update status.');
    }
  };

  const openModal = (appointment, modalType) => {
    setSelectedAppointment(appointment);
    setActionModal(modalType);
    setModalActionError('');
    if (modalType === 'reschedule') {
      setRescheduleData({
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        notes: appointment.admin_notes || ''
      });
    } else if (modalType === 'reject') {
      setRejectionReason('Schedule fully booked for this time window.');
    }
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setActionModal(null);
    setModalActionError('');
    setRejectionReason('');
  };

  // Handle Working Hours update
  const handleToggleDayClosed = (day) => {
    if (!settings?.workingHours) return;
    const current = settings.workingHours[day];
    setSettings((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...current, closed: !current.closed }
      }
    }));
  };

  const handleHourChange = (day, field, value) => {
    if (!settings?.workingHours) return;
    const current = settings.workingHours[day];
    setSettings((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...current, [field]: value }
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const res = await updateAdminSettings(token, {
      workingHours: settings.workingHours,
      blackoutDates: settings.blackoutDates,
      slotDuration: settings.slotDuration,
      timeSlotsPreset: settings.timeSlotsPreset
    });
    setSavingSettings(false);
    if (res.success) {
      setActionSuccessNotice('Salon settings saved successfully!');
      setTimeout(() => setActionSuccessNotice(''), 4000);
    } else {
      alert(res.error || 'Failed to save settings.');
    }
  };

  const handleAddBlackoutDate = () => {
    if (!newBlackoutDate) return;
    if (settings.blackoutDates.includes(newBlackoutDate)) return;
    setSettings((prev) => ({
      ...prev,
      blackoutDates: [...prev.blackoutDates, newBlackoutDate]
    }));
    setNewBlackoutDate('');
  };

  const handleRemoveBlackoutDate = (dateToRemove) => {
    setSettings((prev) => ({
      ...prev,
      blackoutDates: prev.blackoutDates.filter((d) => d !== dateToRemove)
    }));
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">Confirmed</span>;
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">Pending Review</span>;
      case 'Rescheduled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">Rescheduled</span>;
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-300">Completed</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">Cancelled</span>;
      case 'Rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cream-200 text-burgundy-950">{status}</span>;
    }
  };

  // ---------------------------------------------------------------------------
  // 1. AUTHENTICATION & RECOVERY SCREENS (If not authenticated)
  // ---------------------------------------------------------------------------
  if (!token) {
    // -------------------------------------------------------------------------
    // A. RECOVERY VIEW (Forgot Password / Forgot Email / Master Key)
    // -------------------------------------------------------------------------
    if (authView === 'recovery') {
      return (
        <div className="min-h-screen bg-cream-50 flex flex-col justify-center items-center px-4 py-12">
          <div className="max-w-lg w-full bg-cream-100/95 rounded-3xl p-6 sm:p-8 border border-blush-200 shadow-xl relative">
            
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxury text-burgundy-900/70 hover:text-burgundy-950 font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <button
                type="button"
                onClick={onExit}
                className="text-xs uppercase tracking-luxury text-burgundy-900/60 hover:text-burgundy-950 transition-colors"
              >
                Public Website
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-burgundy-950 text-cream-50 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Key className="w-6 h-6 text-rosegold-400" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-burgundy-950">
                Admin Account Recovery
              </h2>
              <p className="text-xs uppercase tracking-luxury text-burgundy-900/60 mt-1">
                Resplandor ATL • Snellville, GA
              </p>
            </div>

            {/* Segmented Navigation Tabs */}
            <div className="grid grid-cols-2 p-1 bg-cream-200/80 rounded-2xl border border-blush-200/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setRecoveryTab('password');
                  setRecoveryError('');
                }}
                className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  recoveryTab === 'password'
                    ? 'bg-burgundy-950 text-cream-50 shadow-sm'
                    : 'text-burgundy-900/70 hover:text-burgundy-950'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Reset Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryTab('account');
                  setAccountError('');
                }}
                className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  recoveryTab === 'account'
                    ? 'bg-burgundy-950 text-cream-50 shadow-sm'
                    : 'text-burgundy-900/70 hover:text-burgundy-950'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Forgot Email / Username</span>
              </button>
            </div>

            {/* TAB 1: RESET PASSWORD */}
            {recoveryTab === 'password' && (
              <div className="space-y-5">
                {/* Step 1: Request Code or Choose Master Key */}
                {recoveryStep === 1 && (
                  <form onSubmit={handleRequestResetCode} className="space-y-4">
                    <p className="text-xs text-burgundy-900/75 leading-relaxed">
                      Enter your registered administrator username or email address. We will generate a secure 6-digit verification code to reset your password.
                    </p>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                        Admin Username or Email
                      </label>
                      <input
                        type="text"
                        required
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        placeholder="admin or owner@resplandor-atl.com"
                        className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-blush-300 text-sm text-burgundy-950 placeholder:text-burgundy-900/40 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                      />
                    </div>

                    {recoveryError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{recoveryError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="w-full py-3.5 rounded-full bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs uppercase tracking-luxury font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {recoveryLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-rosegold-300" />
                          <span>Send 6-Digit Reset Code</span>
                        </>
                      )}
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-blush-300"></div>
                      <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-burgundy-900/50 font-bold">OR</span>
                      <div className="flex-grow border-t border-blush-300"></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUseMasterKeyMode(true);
                        setRecoveryStep(2);
                        setRecoveryError('');
                      }}
                      className="w-full py-3 rounded-xl border border-blush-300 hover:bg-cream-200/50 text-burgundy-950 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-rosegold-500" />
                      <span>Reset with Salon Master Recovery Key</span>
                    </button>
                  </form>
                )}

                {/* Step 2: Verification Code & Set New Password */}
                {recoveryStep === 2 && (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    
                    {/* Notice Banner */}
                    {!useMasterKeyMode && recoveryData && (
                      <div className="p-3.5 rounded-2xl bg-cream-200/80 border border-blush-300 text-xs text-burgundy-950 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-burgundy-950">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Verification Code Dispatched</span>
                        </div>
                        <p className="text-[11px] text-burgundy-900/80">
                          Target address: <strong>{recoveryData.maskedEmail}</strong> (valid for 15 minutes).
                        </p>
                        
                        {recoveryData.demoCode && (
                          <div className="mt-2 pt-2 border-t border-blush-300/80 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-burgundy-900/70">
                              Demo Presentation Code: <strong className="font-mono text-burgundy-950">{recoveryData.demoCode}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => setRecoveryCode(recoveryData.demoCode)}
                              className="px-2 py-0.5 rounded bg-burgundy-950 text-cream-50 text-[10px] font-semibold uppercase hover:bg-burgundy-800"
                            >
                              Auto-Fill Code
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {useMasterKeyMode && (
                      <div className="p-3.5 rounded-2xl bg-cream-200/80 border border-blush-300 text-xs text-burgundy-950 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-burgundy-950">
                          <ShieldCheck className="w-4 h-4 text-rosegold-500 shrink-0" />
                          <span>Emergency Master Recovery Mode</span>
                        </div>
                        <p className="text-[11px] text-burgundy-900/80">
                          Enter your salon master key to authorize an instant password reset without an email code.
                        </p>
                      </div>
                    )}

                    {/* Master Key or Verification Code Field */}
                    {useMasterKeyMode ? (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900">
                            Salon Master Recovery Key
                          </label>
                          <button
                            type="button"
                            onClick={() => setRecoveryMasterKey('RESPLANDOR-ATL-OWNER-KEY-2026')}
                            className="text-[10px] text-rosegold-600 hover:text-rosegold-700 underline"
                          >
                            Paste Demo Key
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={recoveryMasterKey}
                          onChange={(e) => setRecoveryMasterKey(e.target.value)}
                          placeholder="RESPLANDOR-ATL-OWNER-KEY-2026"
                          className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-blush-300 text-sm font-mono text-burgundy-950 placeholder:text-burgundy-900/40 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                          6-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={recoveryCode}
                          onChange={(e) => setRecoveryCode(e.target.value.trim())}
                          placeholder="e.g. 849201"
                          className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-blush-300 text-base font-mono tracking-widest text-center text-burgundy-950 placeholder:text-burgundy-900/40 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                        />
                      </div>
                    )}

                    {/* New Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900">
                          New Password
                        </label>
                        <span className="text-[10px] text-burgundy-900/50">Minimum 8 characters</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-4 py-3 pr-10 rounded-xl bg-cream-50 border border-blush-300 text-sm text-burgundy-950 placeholder:text-burgundy-900/40 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-burgundy-900/50 hover:text-burgundy-950 p-1"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-blush-300 text-sm text-burgundy-950 placeholder:text-burgundy-900/40 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                      />
                    </div>

                    {recoveryError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{recoveryError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="w-full py-3.5 rounded-full bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs uppercase tracking-luxury font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {recoveryLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-rosegold-300" />
                          <span>Update Administrator Password</span>
                        </>
                      )}
                    </button>

                    {/* Mode toggles */}
                    <div className="pt-2 flex items-center justify-between text-xs text-burgundy-900/70">
                      {useMasterKeyMode ? (
                        <button
                          type="button"
                          onClick={() => {
                            setUseMasterKeyMode(false);
                            setRecoveryStep(1);
                          }}
                          className="hover:text-burgundy-950 underline"
                        >
                          ← Switch to Email Verification Code
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setUseMasterKeyMode(true);
                              setRecoveryError('');
                            }}
                            className="hover:text-burgundy-950 underline text-[11px]"
                          >
                            Use Salon Master Key instead
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecoveryStep(1)}
                            className="hover:text-burgundy-950 underline text-[11px]"
                          >
                            Request New Code
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                )}

                {/* Step 3: Success Screen */}
                {recoveryStep === 3 && (
                  <div className="text-center py-4 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-burgundy-950">
                        Password Reset Successfully!
                      </h3>
                      <p className="text-xs text-burgundy-900/80 mt-1 max-w-sm mx-auto">
                        Your administrator credentials have been updated in the database. You can now sign into your dashboard.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="w-full py-3.5 rounded-full bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs uppercase tracking-luxury font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-rosegold-300" />
                      <span>Sign In to Dashboard</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FORGOT EMAIL / USERNAME */}
            {recoveryTab === 'account' && (
              <div className="space-y-5">
                <p className="text-xs text-burgundy-900/75 leading-relaxed">
                  If you forgot what email address or username is registered with Resplandor ATL, enter the Salon Master Recovery Key below to look up your details.
                </p>

                {/* Key Verification Sub-form */}
                {!accountData ? (
                  <form onSubmit={handleRecoverAccountSubmit} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900">
                          Salon Master Recovery Key
                        </label>
                        <button
                          type="button"
                          onClick={() => setAccountRecoveryKey('RESPLANDOR-ATL-OWNER-KEY-2026')}
                          className="text-[10px] text-rosegold-600 hover:text-rosegold-700 underline"
                        >
                          Paste Demo Key
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={accountRecoveryKey}
                        onChange={(e) => setAccountRecoveryKey(e.target.value)}
                        placeholder="RESPLANDOR-ATL-OWNER-KEY-2026"
                        className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-blush-300 text-sm font-mono text-burgundy-950 placeholder:text-burgundy-900/40 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                      />
                      <p className="text-[10px] text-burgundy-900/60 mt-1">
                        Configured in your server environment file (<code>ADMIN_RECOVERY_KEY</code>).
                      </p>
                    </div>

                    {accountError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{accountError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={accountLoading}
                      className="w-full py-3.5 rounded-full bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs uppercase tracking-luxury font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {accountLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-rosegold-300" />
                          <span>Verify Key & Reveal Account Info</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Verified Account Details & Update Form */
                  <div className="space-y-5">
                    {/* Disclosed Credentials Card */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Identity Confirmed with Master Recovery Key</span>
                      </div>
                      <div className="space-y-1 font-mono text-[11px] pt-1 text-burgundy-950">
                        <p>Registered Username: <strong className="text-burgundy-950 font-bold">{accountData.username}</strong></p>
                        <p>Registered Email: <strong className="text-burgundy-950 font-bold">{accountData.email}</strong></p>
                        <p>Administrator Name: <span>{accountData.name}</span></p>
                      </div>
                    </div>

                    {/* Option to Update Email or Password */}
                    <form onSubmit={handleUpdateCredentialsSubmit} className="space-y-3 pt-1">
                      <span className="font-semibold block text-xs uppercase tracking-wider text-burgundy-950">
                        Update Account Details (Optional)
                      </span>

                      <div>
                        <label className="block text-[11px] font-medium text-burgundy-900/80 mb-1">
                          Update Registered Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-blush-300 text-xs text-burgundy-950 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-burgundy-900/80 mb-1">
                          Update Username
                        </label>
                        <input
                          type="text"
                          required
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-blush-300 text-xs text-burgundy-950 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-burgundy-900/80 mb-1">
                          Set New Password (Leave blank to keep unchanged)
                        </label>
                        <input
                          type="password"
                          minLength={8}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Optional new password (8+ chars)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-blush-300 text-xs text-burgundy-950 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                        />
                      </div>

                      {accountError && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                          {accountError}
                        </div>
                      )}

                      {accountSuccessMsg && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{accountSuccessMsg}</span>
                        </div>
                      )}

                      <div className="pt-2 flex gap-2">
                        <button
                          type="submit"
                          disabled={updatingAccount}
                          className="flex-1 py-3 rounded-xl bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-60"
                        >
                          {updatingAccount ? "Saving..." : "Save Credentials"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUsername(editUsername || accountData.username);
                            handleBackToLogin();
                          }}
                          className="flex-1 py-3 rounded-xl border border-blush-300 hover:bg-cream-200/50 text-burgundy-950 text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          Proceed to Login
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // B. STANDARD LOGIN VIEW
    // -------------------------------------------------------------------------
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-cream-100/90 rounded-3xl p-8 border border-blush-200 shadow-xl relative">
          
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxury text-burgundy-900/70 hover:text-burgundy-950 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-burgundy-950 text-cream-50 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Lock className="w-6 h-6 text-rosegold-400" />
            </div>
            <h2 className="font-serif text-3xl font-semibold text-burgundy-950">
              Salon Admin Portal
            </h2>
            <p className="text-xs uppercase tracking-luxury text-burgundy-900/60 mt-1">
              Resplandor ATL • Snellville, GA
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or owner@resplandor-atl.com"
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-blush-300 text-sm text-burgundy-950 placeholder:text-burgundy-900/40 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-cream-50 border border-blush-300 text-sm text-burgundy-950 placeholder:text-burgundy-900/40 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-burgundy-900/50 hover:text-burgundy-950 p-1"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3.5 rounded-full bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs uppercase tracking-luxury font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loggingIn ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4 text-rosegold-300" />
                  <span>Log In to Dashboard</span>
                </>
              )}
            </button>
            </form>

        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-cream-50 text-burgundy-950 font-sans pb-16">
      
      {/* Top Header Bar */}
      <header className="bg-cream-100/90 border-b border-blush-200/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onExit}
              className="p-2 rounded-xl bg-cream-50 hover:bg-blush-200/60 text-burgundy-950 transition-colors border border-blush-200 flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Public Salon Website"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">View Website</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-burgundy-950">
                  RESPLANDOR ATL
                </span>
                <span className="text-[10px] font-sans font-bold tracking-widest px-1.5 py-0.5 rounded bg-burgundy-950 text-cream-50 uppercase">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-burgundy-900/60 font-medium">
                Salon Appointment Management • Snellville, GA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <span className="text-xs font-semibold text-burgundy-950 block">{adminUser?.name || 'Salon Manager'}</span>
              <span className="text-[10px] text-burgundy-900/60 block">{adminUser?.email || 'owner@resplandor-atl.com'}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Success Alert Banner */}
        {actionSuccessNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccessNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccessNotice('')}
              className="p-1 rounded text-emerald-800 hover:bg-emerald-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-900/70 block">
                Pending Approval
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-bold text-amber-950">
                {metrics.pending}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock3 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-900/70 block">
                Confirmed Today
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950">
                {metrics.confirmedToday}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-900/70 block">
                Upcoming Scheduled
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-bold text-blue-950">
                {metrics.upcoming}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cream-100 border border-blush-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-burgundy-900/70 block">
                Total Requests
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-bold text-burgundy-950">
                {metrics.total}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blush-100 flex items-center justify-center text-burgundy-900">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-blush-200 mb-8 space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 px-3 text-xs uppercase tracking-luxury font-semibold transition-all relative ${
              activeTab === 'appointments'
                ? 'text-burgundy-950 border-b-2 border-burgundy-950'
                : 'text-burgundy-900/60 hover:text-burgundy-950'
            }`}
          >
            Appointments & Requests ({appointments.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 text-xs uppercase tracking-luxury font-semibold transition-all relative ${
              activeTab === 'settings'
                ? 'text-burgundy-950 border-b-2 border-burgundy-950'
                : 'text-burgundy-900/60 hover:text-burgundy-950'
            }`}
          >
            Working Hours & Schedule Rules
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 text-xs uppercase tracking-luxury font-semibold transition-all relative ${
              activeTab === 'audit'
                ? 'text-burgundy-950 border-b-2 border-burgundy-950'
                : 'text-burgundy-900/60 hover:text-burgundy-950'
            }`}
          >
            Privacy & Security
          </button>
        </div>

        {/* TAB 1: APPOINTMENTS LIST */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            
            {/* Filter and Search Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-cream-100/80 border border-blush-200 flex flex-col md:flex-row gap-4 items-center justify-between">
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Status Dropdown */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-burgundy-900/70 uppercase tracking-wider text-[11px]">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-cream-50 border border-blush-300 text-xs font-medium text-burgundy-950 focus:outline-none focus:ring-1 focus:ring-rosegold-400"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-burgundy-900/70 uppercase tracking-wider text-[11px]">Date:</span>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-cream-50 border border-blush-300 text-xs font-medium text-burgundy-950 focus:outline-none focus:ring-1 focus:ring-rosegold-400"
                  />
                  {dateFilter && (
                    <button
                      type="button"
                      onClick={() => setDateFilter('')}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar & Refresh */}
              <div className="flex items-center gap-2 w-full md:w-80">
                <div className="relative flex-grow">
                  <Search className="w-3.5 h-3.5 text-burgundy-900/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search name, phone, ref..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-cream-50 border border-blush-300 text-xs text-burgundy-950 placeholder:text-burgundy-900/40 focus:outline-none focus:ring-1 focus:ring-rosegold-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => loadAppointments()}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-cream-50 hover:bg-blush-100 text-burgundy-950 border border-blush-300 transition-colors shrink-0"
                  title="Refresh Appointments"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

            </div>

            {/* Error notice */}
            {fetchError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {fetchError}
              </div>
            )}

            {/* Appointments Table / Cards */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-cream-100 animate-pulse border border-blush-200" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl bg-cream-100/60 border border-blush-200">
                <Calendar className="w-12 h-12 text-rosegold-400 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-semibold text-burgundy-950">
                  No appointments found
                </h3>
                <p className="text-xs text-burgundy-900/60 mt-1 max-w-sm mx-auto">
                  Try adjusting your status or date filters, or wait for new client requests from the booking form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-5 sm:p-6 rounded-2xl bg-cream-50 border border-blush-200/90 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    
                    {/* Left details */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-burgundy-950 px-2 py-0.5 rounded bg-cream-200/80 border border-blush-300">
                          {apt.reference}
                        </span>
                        {renderStatusBadge(apt.status)}
                        <span className="text-[11px] text-burgundy-900/50">
                          Received {new Date(apt.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-2">
                        <h4 className="font-serif text-xl font-bold text-burgundy-950">
                          {apt.customer_name}
                        </h4>
                        <span className="text-sm font-medium text-rosegold-600">
                          • {apt.service_name}
                        </span>
                      </div>

                      {/* Contact & Schedule Chips */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-burgundy-900/80">
                        <a
                          href={`tel:${apt.customer_phone}`}
                          className="flex items-center gap-1 hover:text-burgundy-950 font-medium"
                        >
                          <Phone className="w-3.5 h-3.5 text-rosegold-500" />
                          <span>{apt.customer_phone}</span>
                        </a>

                        {apt.customer_email && (
                          <a
                            href={`mailto:${apt.customer_email}`}
                            className="flex items-center gap-1 hover:text-burgundy-950"
                          >
                            <Mail className="w-3.5 h-3.5 text-rosegold-500" />
                            <span>{apt.customer_email}</span>
                          </a>
                        )}

                        <span className="flex items-center gap-1 font-semibold text-burgundy-950">
                          <Calendar className="w-3.5 h-3.5 text-rosegold-500" />
                          <span>{apt.appointment_date}</span>
                        </span>

                        <span className="flex items-center gap-1 font-semibold text-burgundy-950">
                          <Clock className="w-3.5 h-3.5 text-rosegold-500" />
                          <span>{apt.appointment_time}</span>
                        </span>
                      </div>

                      {/* Nail Preferences & Notes */}
                      {(apt.nail_length || apt.nail_shape || apt.notes) && (
                        <div className="pt-2 text-xs text-burgundy-900/70 border-t border-blush-100 flex flex-wrap gap-x-4 gap-y-1">
                          {apt.nail_shape && <span>Shape: <strong>{apt.nail_shape}</strong></span>}
                          {apt.nail_length && <span>Length: <strong>{apt.nail_length}</strong></span>}
                          {apt.notes && <span className="italic line-clamp-1">"{apt.notes}"</span>}
                        </div>
                      )}

                      {/* Notification Delivery Tag */}
                      <div className="text-[10px] text-burgundy-900/50 pt-1">
                        Notification: <span className="font-medium text-burgundy-900/80">{apt.notification_status}</span> 
                        {apt.notification_details ? ` (${apt.notification_details})` : ''}
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-blush-200 shrink-0">
                      
                      {apt.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(apt.id)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {(apt.status === 'Pending' || apt.status === 'Confirmed') && (
                        <button
                          type="button"
                          onClick={() => openModal(apt, 'reschedule')}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5 transition-colors"
                        >
                          <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                          <span>Reschedule</span>
                        </button>
                      )}

                      {apt.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => openModal(apt, 'reject')}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 flex items-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Reject</span>
                        </button>
                      )}

                      {apt.status === 'Confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(apt.id, 'Completed')}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Mark Completed</span>
                        </button>
                      )}

                      {(apt.status === 'Confirmed' || apt.status === 'Rescheduled') && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(apt.id, 'Cancelled')}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                        >
                          <span>Cancel</span>
                        </button>
                      )}

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: WORKING HOURS & SALON SCHEDULE RULES */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-8 max-w-4xl">
            
            {/* Weekly Operating Hours */}
            <div className="p-6 rounded-3xl bg-cream-100/80 border border-blush-200 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-burgundy-950">
                    Weekly Operating Hours
                  </h3>
                  <p className="text-xs text-burgundy-900/70 mt-0.5">
                    Configure salon opening and closing times for each day. Days marked closed will not allow client bookings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="px-5 py-2.5 rounded-full bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs uppercase tracking-luxury font-semibold transition-all shadow-sm"
                >
                  {savingSettings ? 'Saving...' : 'Save Schedule Changes'}
                </button>
              </div>

              <div className="space-y-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const schedule = settings.workingHours?.[day] || { open: '10:00 AM', close: '07:00 PM', closed: false };
                  return (
                    <div
                      key={day}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                        schedule.closed ? 'bg-cream-200/50 border-blush-200/60 opacity-70' : 'bg-cream-50 border-blush-200'
                      }`}
                    >
                      <div className="w-28 capitalize font-semibold text-xs text-burgundy-950">
                        {day}
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-burgundy-900 font-medium">
                          <input
                            type="checkbox"
                            checked={schedule.closed}
                            onChange={() => handleToggleDayClosed(day)}
                            className="rounded border-blush-300 text-burgundy-950 focus:ring-rosegold-400"
                          />
                          <span>Closed</span>
                        </label>

                        {!schedule.closed && (
                          <div className="flex items-center gap-2 text-xs">
                            <input
                              type="text"
                              value={schedule.open}
                              onChange={(e) => handleHourChange(day, 'open', e.target.value)}
                              className="w-24 px-2 py-1 rounded-lg border border-blush-300 bg-cream-50 text-center text-burgundy-950 font-mono text-xs"
                            />
                            <span>to</span>
                            <input
                              type="text"
                              value={schedule.close}
                              onChange={(e) => handleHourChange(day, 'close', e.target.value)}
                              className="w-24 px-2 py-1 rounded-lg border border-blush-300 bg-cream-50 text-center text-burgundy-950 font-mono text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blackout / Unavailable Dates */}
            <div className="p-6 rounded-3xl bg-cream-100/80 border border-blush-200 space-y-4">
              <h3 className="font-serif text-2xl font-semibold text-burgundy-950">
                Studio Blackout & Vacation Dates
              </h3>
              <p className="text-xs text-burgundy-900/70">
                Dates listed here are completely blocked off from client bookings (e.g. holidays, salon maintenance).
              </p>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="date"
                  value={newBlackoutDate}
                  onChange={(e) => setNewBlackoutDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-cream-50 border border-blush-300 text-xs text-burgundy-950"
                />
                <button
                  type="button"
                  onClick={handleAddBlackoutDate}
                  className="px-4 py-2 rounded-xl bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Block Date</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {settings.blackoutDates?.length === 0 ? (
                  <p className="text-xs text-burgundy-900/60 italic">No blackout dates currently scheduled.</p>
                ) : (
                  settings.blackoutDates?.map((bDate) => (
                    <div
                      key={bDate}
                      className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-medium flex items-center gap-2"
                    >
                      <span>{bDate}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlackoutDate(bDate)}
                        className="p-0.5 rounded-full hover:bg-rose-200 text-rose-800"
                        title="Remove blackout date"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notification Provider Status */}
            <div className="p-6 rounded-3xl bg-cream-100/80 border border-blush-200 space-y-3">
              <h3 className="font-serif text-2xl font-semibold text-burgundy-950">
                Notification Delivery Status
              </h3>
              <p className="text-xs text-burgundy-900/75 leading-relaxed">
                We strictly adhere to honest notification reporting. Real email and SMS dispatches are only claimed when an active provider API key is loaded into the server environment.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-cream-50 border border-blush-200 text-xs space-y-1">
                  <span className="font-semibold block text-burgundy-950">Email Delivery (Resend / SMTP)</span>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className={`w-2 h-2 rounded-full ${settings.notifications?.providers?.resend ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <span className="font-medium">
                      {settings.notifications?.providers?.resend ? 'Configured (Active)' : 'Unconfigured (Simulated on Server)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-burgundy-900/60 pt-1">
                    To activate: set <code>RESEND_API_KEY=re_...</code> in your server <code>.env</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-cream-50 border border-blush-200 text-xs space-y-1">
                  <span className="font-semibold block text-burgundy-950">SMS Text Delivery (Twilio)</span>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className={`w-2 h-2 rounded-full ${settings.notifications?.providers?.twilio ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <span className="font-medium">
                      {settings.notifications?.providers?.twilio ? 'Configured (Active)' : 'Unconfigured (Simulated on Server)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-burgundy-900/60 pt-1">
                    To activate: set <code>TWILIO_ACCOUNT_SID</code> and <code>TWILIO_AUTH_TOKEN</code> in <code>.env</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Salon Master Recovery Key & Admin Account Card */}
            <div className="p-6 rounded-3xl bg-cream-100/80 border border-blush-200 space-y-4">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-burgundy-950 flex items-center gap-2">
                  <Key className="w-5 h-5 text-rosegold-500" />
                  <span>Salon Master Recovery Key & Security</span>
                </h3>
                <p className="text-xs text-burgundy-900/75 mt-0.5">
                  Emergency master verification key used to recover forgotten admin usernames, emails, or reset credentials.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-blush-200 space-y-3">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-burgundy-900 mb-1">
                    Master Recovery Key
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type={showRecoveryKeyInSettings ? "text" : "password"}
                      readOnly
                      value={settings.recoveryKey || 'RESPLANDOR-ATL-OWNER-KEY-2026'}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-cream-100 border border-blush-300 font-mono text-xs text-burgundy-950 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRecoveryKeyInSettings(!showRecoveryKeyInSettings)}
                      className="p-2.5 rounded-xl border border-blush-200 hover:bg-cream-100 text-burgundy-950 text-xs flex items-center gap-1"
                      title={showRecoveryKeyInSettings ? "Hide key" : "Show key"}
                    >
                      {showRecoveryKeyInSettings ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.recoveryKey || 'RESPLANDOR-ATL-OWNER-KEY-2026')}
                      className="px-3.5 py-2.5 rounded-xl bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-burgundy-900/70 space-y-1 pt-1 border-t border-blush-200/60">
                  <p>
                    • <strong>Forgotten Password:</strong> You can reset your password anytime on the login screen using this master key, or via 6-digit email verification code.
                  </p>
                  <p>
                    • <strong>Forgotten Username/Email:</strong> Entering this key on the login screen reveals the registered administrator email and username and allows updating them immediately.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PRIVACY & SECURITY AUDIT */}
        {activeTab === 'audit' && (
          <div className="max-w-4xl space-y-6">
            <div className="p-6 rounded-3xl bg-cream-100/80 border border-blush-200 space-y-4">
              <h3 className="font-serif text-2xl font-semibold text-burgundy-950">
                Customer Data Privacy Commitment
              </h3>
              <p className="text-sm text-burgundy-900/80 leading-relaxed">
                Customer contact details (full name, phone number, and email address) submitted through the Resplandor ATL website are stored in our secure, encrypted SQLite database backend.
              </p>
              <ul className="text-xs text-burgundy-900/80 space-y-2 list-disc list-inside">
                <li>Access to customer records is restricted to authenticated studio administrators via JWT tokens.</li>
                <li>Customer information is never stored solely in browser localStorage.</li>
                <li>Passwords are hashed with one-way salted bcrypt algorithms.</li>
                <li>Customer records are used exclusively for scheduling appointments, sharing nail designs, and studio arrival notices.</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-cream-100/80 border border-blush-200 space-y-3">
              <h3 className="font-serif text-xl font-semibold text-burgundy-950">
                Active System Administrators
              </h3>
              <div className="p-4 rounded-xl bg-cream-50 border border-blush-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-burgundy-950 block">{adminUser?.name || 'Salon Manager'}</span>
                  <span className="text-burgundy-900/70">{adminUser?.email || 'owner@resplandor-atl.com'}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-semibold uppercase tracking-wide">
                  Super Admin
                </span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: RESCHEDULE APPOINTMENT */}
      {actionModal === 'reschedule' && selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-md w-full bg-cream-50 rounded-3xl p-6 border border-blush-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-blush-200">
              <h4 className="font-serif text-xl font-semibold text-burgundy-950">
                Reschedule Appointment
              </h4>
              <button type="button" onClick={closeModal} className="p-1 rounded text-burgundy-950 hover:bg-cream-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-burgundy-900/80 space-y-1">
              <p>Client: <strong className="text-burgundy-950">{selectedAppointment.customer_name}</strong></p>
              <p>Current: <strong>{selectedAppointment.appointment_date} at {selectedAppointment.appointment_time}</strong></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-cream-100 border border-blush-300 text-xs text-burgundy-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1">
                  New Time Slot
                </label>
                <select
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData((prev) => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-cream-100 border border-blush-300 text-xs text-burgundy-950"
                >
                  <option value="">-- Choose Time Slot --</option>
                  {['10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'].map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1">
                  Admin Note for Client (Optional)
                </label>
                <textarea
                  rows={2}
                  value={rescheduleData.notes}
                  onChange={(e) => setRescheduleData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Moved slot 30 mins to allow full drying time."
                  className="w-full px-3 py-2 rounded-xl bg-cream-100 border border-blush-300 text-xs text-burgundy-950"
                />
              </div>
            </div>

            {modalActionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalActionError}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-full border border-blush-300 text-xs font-semibold text-burgundy-950 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReschedule(selectedAppointment.id)}
                className="flex-1 py-2.5 rounded-full bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs font-semibold"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT APPOINTMENT */}
      {actionModal === 'reject' && selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-md w-full bg-cream-50 rounded-3xl p-6 border border-blush-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blush-200">
              <h4 className="font-serif text-xl font-semibold text-burgundy-950">
                Reject Appointment Request
              </h4>
              <button type="button" onClick={closeModal} className="p-1 rounded text-burgundy-950 hover:bg-cream-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-burgundy-900/80">
              Are you sure you want to decline the request for <strong>{selectedAppointment.customer_name}</strong> ({selectedAppointment.appointment_date} at {selectedAppointment.appointment_time})?
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a clear, polite explanation for the client..."
                className="w-full px-3 py-2 rounded-xl bg-cream-100 border border-blush-300 text-xs text-burgundy-950"
              />
            </div>

            {modalActionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {modalActionError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-full border border-blush-300 text-xs font-semibold text-burgundy-950 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReject(selectedAppointment.id)}
                className="flex-1 py-2.5 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
