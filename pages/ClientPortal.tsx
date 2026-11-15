import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Download, FileText, LockKeyhole, LogOut, MapPin, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { portalRequest, type PortalProject, type PortalUpdate } from '../lib/portalApi';

const copy = {
  ID: {
    eyebrow: 'LINIER STUDIO / PORTAL KLIEN',
    title: 'Perjalanan proyek Anda.',
    subtitle: 'Masuk untuk melihat perkembangan terbaru langsung dari tim studio.',
    projectId: 'ID Proyek',
    loginIdentifier: 'ID proyek atau email',
    chooseProject: 'Pilih proyek',
    password: 'Password',
    signIn: 'Masuk ke portal',
    signingIn: 'Memeriksa akses...',
    admin: 'Akses tim studio',
    latest: 'Progress proyek',
    updated: 'Pembaruan harian',
    noUpdates: 'Belum ada pembaruan.',
    noUpdatesHint: 'Update terbaru dari tim proyek akan muncul di halaman ini.',
    logout: 'Keluar',
    status: 'Status',
    location: 'Lokasi',
    back: 'Kembali ke Linier Studio',
    secure: 'Informasi proyek hanya dapat dilihat dengan akses yang diberikan studio.',
    loading: 'Memuat portal...',
    complete: 'Selesai',
    inProgress: 'Sedang berjalan',
    files: 'File progress',
    viewFile: 'Buka file',
    photo: 'Foto progress',
    forgotPassword: 'Lupa password?',
    resetTitle: 'Minta reset password',
    resetIdentifier: 'ID proyek untuk reset password proyek, atau email untuk reset password akun',
    whatsapp: 'Nomor WhatsApp',
    whatsappHint: 'Gunakan kode negara, contoh: +62 812 3456 7890',
    sendReset: 'Kirim permintaan',
    backToSignIn: 'Kembali ke login',
    resetSent: 'Jika ID proyek atau email terdaftar, tim studio akan memverifikasi permintaan dan menghubungi Anda lewat WhatsApp.',
    changePassword: 'Ganti password',
    currentPassword: 'Password saat ini',
    newPassword: 'Password baru',
    confirmPassword: 'Konfirmasi password baru',
    passwordMinLength: 'Minimal 8 karakter.',
    savePassword: 'Simpan password',
    savingPassword: 'Menyimpan...',
    passwordChanged: 'Password berhasil diubah. Silakan masuk kembali menggunakan password baru.',
    passwordMismatch: 'Konfirmasi password tidak sama.',
    cancel: 'Batal',
    duration: 'Durasi pembangunan',
    durationNotSet: 'Tanggal mulai belum diatur oleh tim studio.',
    notStarted: 'Belum dimulai',
    downloadPhoto: 'Unduh foto',
    strapline: 'Catatan proyek, disusun dengan perhatian.',
    journal: 'Catatan proyek',
  },
  EN: {
    eyebrow: 'LINIER STUDIO / CLIENT PORTAL',
    title: 'Your project journey.',
    subtitle: 'Sign in to see the latest progress directly from the studio team.',
    projectId: 'Project ID',
    loginIdentifier: 'Project ID or email',
    chooseProject: 'Choose a project',
    password: 'Password',
    signIn: 'Sign in to portal',
    signingIn: 'Checking access...',
    admin: 'Studio team access',
    latest: 'Project progress',
    updated: 'Daily updates',
    noUpdates: 'No updates yet.',
    noUpdatesHint: 'The latest notes from your project team will appear here.',
    logout: 'Sign out',
    status: 'Status',
    location: 'Location',
    back: 'Back to Linier Studio',
    secure: 'Project information is only available with access provided by the studio.',
    loading: 'Loading portal...',
    complete: 'Complete',
    inProgress: 'In progress',
    files: 'Progress files',
    viewFile: 'Open file',
    photo: 'Progress photo',
    forgotPassword: 'Forgot password?',
    resetTitle: 'Request a password reset',
    resetIdentifier: 'Project ID for project password, or email for account password',
    whatsapp: 'WhatsApp number',
    whatsappHint: 'Include your country code, e.g. +1 555 123 4567',
    sendReset: 'Send request',
    backToSignIn: 'Back to sign in',
    resetSent: 'If the project ID or email is registered, the studio will verify the request and contact you via WhatsApp.',
    changePassword: 'Change password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    passwordMinLength: 'Use at least 8 characters.',
    savePassword: 'Save password',
    savingPassword: 'Saving...',
    passwordChanged: 'Password changed. Please sign in again with your new password.',
    passwordMismatch: 'The password confirmation does not match.',
    cancel: 'Cancel',
    duration: 'Construction duration',
    durationNotSet: 'The studio has not set a start date yet.',
    notStarted: 'Not started yet',
    downloadPhoto: 'Download photo',
    strapline: 'Project updates, shared with care.',
    journal: 'Project journal',
  },
  CN: {
    eyebrow: 'LINIER STUDIO / 客户门户',
    title: '您的项目进程。',
    subtitle: '登录后即可查看工作室团队分享的最新进度。',
    projectId: '项目编号',
    loginIdentifier: '项目编号或邮箱',
    chooseProject: '选择项目',
    password: '密码',
    signIn: '登录门户',
    signingIn: '正在验证...',
    admin: '工作室团队入口',
    latest: '项目进度',
    updated: '每日更新',
    noUpdates: '暂无更新。',
    noUpdatesHint: '项目团队的最新记录将在此显示。',
    logout: '退出',
    status: '状态',
    location: '地点',
    back: '返回 Linier Studio',
    secure: '项目信息仅对工作室授权用户开放。',
    loading: '正在加载门户...',
    complete: '已完成',
    inProgress: '进行中',
    files: '进度文件',
    viewFile: '打开文件',
    photo: '进度照片',
    forgotPassword: '忘记密码？',
    resetTitle: '申请重置密码',
    resetIdentifier: '重置项目密码请输入项目编号，重置邮箱账号请输入邮箱',
    whatsapp: 'WhatsApp 号码',
    whatsappHint: '请加国家代码，例如：+86 138 0000 0000',
    sendReset: '发送申请',
    backToSignIn: '返回登录',
    resetSent: '如果项目编号或邮箱已注册，工作室将核实请求并通过 WhatsApp 联系您。',
    changePassword: '更改密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmPassword: '确认新密码',
    passwordMinLength: '至少使用 8 个字符。',
    savePassword: '保存密码',
    savingPassword: '正在保存...',
    passwordChanged: '密码已更改，请使用新密码重新登录。',
    passwordMismatch: '两次输入的密码不一致。',
    cancel: '取消',
    duration: '施工时长',
    durationNotSet: '工作室尚未设置开始日期。',
    notStarted: '尚未开始',
    downloadPhoto: '下载照片',
    strapline: '用心记录项目进展。',
    journal: '项目记录',
  },
} as const;

const clientPortalImage = new URL('../1.jpeg', import.meta.url).href;

const ClientPortal: React.FC = () => {
  const { language } = useLanguage();
  const t = copy[language];
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [project, setProject] = useState<PortalProject | null>(null);
  const [updates, setUpdates] = useState<PortalUpdate[]>([]);
  const [projectCode, setProjectCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [resetNotice, setResetNotice] = useState('');
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeNotice, setPasswordChangeNotice] = useState('');

  useEffect(() => {
    let active = true;
    portalRequest<{ projects: PortalProject[] }>('/api/portal/client/session')
      .then(({ projects: clientProjects }) => {
        if (!active) return;
        setProjects(clientProjects);
        setProject(clientProjects[0] ?? null);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof Error && !cause.message.includes('Sesi telah berakhir') && !cause.message.includes('Sesi tidak valid')) {
          setError(cause.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (!project) {
      setUpdates([]);
      return () => { active = false; };
    }

    portalRequest<{ updates: PortalUpdate[] }>(`/api/portal/client/updates?projectId=${encodeURIComponent(project.id)}`)
      .then(({ updates: currentUpdates }) => {
        if (active) setUpdates(currentUpdates);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Riwayat update tidak dapat dimuat.');
      });
    return () => { active = false; };
  }, [project?.id]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await portalRequest<{ projects: PortalProject[] }>('/api/portal/client/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: projectCode, password }),
      });
      setProjects(result.projects);
      setProject(result.projects[0] ?? null);
      setPassword('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tidak dapat masuk ke portal.');
    } finally {
      setSubmitting(false);
    }
  };

  const requestPasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setResetNotice('');
    try {
      await portalRequest<{ accepted: boolean }>('/api/portal/client/password-reset-requests', {
        method: 'POST',
        body: JSON.stringify({ identifier: projectCode, whatsappNumber }),
      });
      setResetNotice(t.resetSent);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Permintaan reset tidak dapat dikirim.');
    } finally {
      setSubmitting(false);
    }
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeNotice('');
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError(t.passwordMismatch);
      return;
    }

    setPasswordChanging(true);
    try {
      await portalRequest<{ changed: boolean }>('/api/portal/client/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPassword('');
      setProject(null);
      setProjects([]);
      setUpdates([]);
      setError('');
      setResetMode(false);
      closePasswordChange();
      setResetNotice(t.passwordChanged);
    } catch (cause) {
      setPasswordChangeError(cause instanceof Error ? cause.message : 'Password tidak dapat diubah.');
    } finally {
      setPasswordChanging(false);
    }
  };

  const closePasswordChange = () => {
    setPasswordChangeOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordChangeError('');
    setPasswordChangeNotice('');
  };

  const signOut = async () => {
    try {
      await portalRequest('/api/portal/logout', { method: 'POST' });
      setProject(null);
      setProjects([]);
      setUpdates([]);
      setError('');
      closePasswordChange();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tidak dapat keluar dari portal.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] pb-20 pt-24 text-neutral-900 dark:bg-[#0b0c0b] dark:text-white md:pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Link to="/" className="mb-7 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-4 py-2.5 text-xs font-medium text-neutral-600 shadow-sm transition-colors hover:border-neutral-400 hover:text-neutral-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300 dark:hover:border-white/25 dark:hover:text-white">
          <ArrowDownLeft size={15} /> {t.back}
        </Link>

        {loading ? (
          <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900">
            <span className="mb-5 h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-[#8c795e] dark:border-white/10 dark:border-t-bronze-400" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{t.loading}</p>
          </div>
        ) : project ? (
          <section>
            <div className="relative mb-6 overflow-hidden rounded-3xl bg-[#23241f] p-6 text-white shadow-[0_24px_70px_rgba(27,25,20,0.16)] sm:p-9 lg:p-12">
              <img src={clientPortalImage} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.13]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-[#8c795e]/20" />
              <div className="pointer-events-none absolute -right-24 -top-40 h-96 w-96 rounded-full border border-white/[0.08]" />
              <div className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full border border-white/[0.08]" />
              <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
                <div className="min-w-0">
                  <p className="mb-5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60 sm:text-[11px]">
                    <span>{t.eyebrow}</span><span className="text-white/30">/</span><span>{project.project_code}</span>
                  </p>
                  <h1 className="max-w-3xl break-words font-display text-4xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">{project.project_name}</h1>
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
                    <span>{project.client_name}</span>
                    <span className="hidden text-white/30 sm:inline">·</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{project.location || t.location}</span>
                  </div>
                  {projects.length > 1 && (
                    <label className="mt-7 block max-w-md">
                      <span className="mb-2 block text-xs font-medium text-white/70">{t.chooseProject}</span>
                      <select
                        value={project.id}
                        onChange={(event) => {
                          const nextProject = projects.find((item) => item.id === event.target.value);
                          if (nextProject) {
                            setUpdates([]);
                            setProject(nextProject);
                          }
                        }}
                        className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/60 focus:ring-2 focus:ring-white/10"
                      >
                        {projects.map((item) => <option key={item.id} value={item.id}>{item.project_code} — {item.project_name}</option>)}
                      </select>
                    </label>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5 self-start md:shrink-0 md:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (passwordChangeOpen) {
                        closePasswordChange();
                      } else {
                        setPasswordChangeOpen(true);
                        setPasswordChangeError('');
                        setPasswordChangeNotice('');
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white/85 transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <LockKeyhole size={14} /> {t.changePassword}
                  </button>
                  <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white/85 transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white">
                    <LogOut size={14} /> {t.logout}
                  </button>
                </div>
              </div>
              <div className="relative mt-8 flex items-start gap-2.5 border-t border-white/15 pt-5 text-xs leading-5 text-white/60 sm:mt-10 sm:items-center">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-white/75 sm:mt-0" /> {t.secure}
              </div>
            </div>

            {error && <ErrorBanner message={error} />}

            {passwordChangeOpen && (
              <form onSubmit={changePassword} className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-6">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-bronze-600 dark:text-bronze-400">{t.changePassword}</p>
                  <p className="text-sm text-neutral-500">{t.passwordMinLength}</p>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  <PasswordField label={t.currentPassword} value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
                  <PasswordField label={t.newPassword} value={newPassword} onChange={setNewPassword} autoComplete="new-password" minLength={8} />
                  <PasswordField label={t.confirmPassword} value={confirmNewPassword} onChange={setConfirmNewPassword} autoComplete="new-password" minLength={8} />
                </div>
                {passwordChangeError && <div className="mt-5"><ErrorBanner message={passwordChangeError} /></div>}
                {passwordChangeNotice && <p role="status" className="mt-5 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-xs leading-5 text-emerald-700 dark:text-emerald-300">{passwordChangeNotice}</p>}
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button type="button" onClick={closePasswordChange} className="rounded-full border border-neutral-300 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-600 transition-colors hover:border-neutral-500 dark:border-white/20 dark:text-neutral-300">
                    {t.cancel}
                  </button>
                  <button disabled={passwordChanging} className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-bronze-600 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                    {passwordChanging ? t.savingPassword : t.savePassword} <ArrowUpRight size={15} />
                  </button>
                </div>
              </form>
            )}

            <div className="grid gap-4 md:grid-cols-[1.3fr_0.9fr]">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-3 text-xs font-medium text-neutral-500">{t.latest}</p>
                    <span className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">{project.progress_percent}<span className="ml-0.5 text-2xl text-[#8c795e] dark:text-bronze-400">%</span></span>
                  </div>
                  <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#f4f1eb] px-3 py-1.5 text-[11px] font-medium text-[#746349] dark:bg-white/[0.07] dark:text-neutral-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8c795e] dark:bg-bronze-400" />
                    {project.progress_percent === 100 ? t.complete : t.inProgress}
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-[#ece9e2] dark:bg-white/10"
                  role="progressbar"
                  aria-label={t.latest}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={project.progress_percent}
                >
                  <div className="h-full rounded-full bg-gradient-to-r from-[#756248] to-[#b39b74] transition-[width] duration-700 dark:from-bronze-500 dark:to-bronze-300" style={{ width: `${project.progress_percent}%` }} />
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
                  {project.progress_percent === 100 ? <CheckCircle2 size={15} className="text-[#8c795e] dark:text-bronze-400" /> : <Clock3 size={15} className="text-[#8c795e] dark:text-bronze-400" />}
                  <span>{t.status}: {project.progress_percent === 100 ? t.complete : t.inProgress}</span>
                </div>
              </div>
              <div className="flex min-h-[190px] flex-col justify-between rounded-2xl border border-neutral-200 bg-[#eeece6] p-6 text-neutral-900 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900 dark:text-white">
                <div>
                  <p className="mb-5 text-xs font-medium text-neutral-500 dark:text-neutral-400">{t.duration}</p>
                  <div className="flex items-start gap-3 text-lg font-medium leading-snug tracking-tight">
                    <CalendarDays size={18} className="mt-1 shrink-0 text-[#8c795e] dark:text-bronze-400" />
                    <span>{project.start_date ? formatDuration(project.start_date, language) : t.durationNotSet}</span>
                  </div>
                </div>
                {project.start_date && <p className="mt-8 border-t border-neutral-400/30 pt-4 text-xs text-neutral-500 dark:border-white/10 dark:text-neutral-400">{formatDate(project.start_date, language)}</p>}
              </div>
            </div>

            <div className="mt-12">
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-neutral-300 pb-5 dark:border-white/10">
                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">{t.journal}</p>
                  <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">{t.updated}</h2>
                </div>
                <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 font-mono text-[10px] tabular-nums text-neutral-500 dark:border-white/10 dark:bg-white/[0.03]">{updates.length.toString().padStart(2, '0')}</span>
              </div>
              {updates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.02]">
                  <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f0ede6] text-[#8c795e] dark:bg-white/[0.07] dark:text-bronze-400"><FileText size={18} /></span>
                  <p className="font-display text-xl font-medium">{t.noUpdates}</p>
                  <p className="mt-2 text-sm text-neutral-500">{t.noUpdatesHint}</p>
                </div>
              ) : (
                <ol className="space-y-4">
                  {updates.map((update) => (
                    <li key={update.id} className="grid gap-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-[160px_1fr] sm:gap-8 sm:p-7 dark:border-white/10 dark:bg-neutral-900">
                      <div className="flex items-center justify-between gap-3 sm:block">
                        <time className="text-xs leading-5 text-neutral-500">
                          {formatDate(update.update_date, language)}
                        </time>
                        <span className="rounded-full bg-[#f4f1eb] px-3 py-1.5 text-[11px] font-medium tabular-nums text-[#746349] dark:bg-white/[0.07] dark:text-neutral-300">{update.progress_percent}%</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-medium tracking-tight sm:text-2xl">{update.title}</h3>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-600 dark:text-neutral-400">{update.description}</p>
                        {update.attachments.length > 0 && (
                          <div className="mt-6 space-y-6 border-t border-neutral-100 pt-5 dark:border-white/10">
                            {update.attachments.some((attachment) => attachment.contentType.startsWith('image/')) && (
                              <section>
                                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500">{t.photo}</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {update.attachments.filter((attachment) => attachment.contentType.startsWith('image/')).map((attachment) => (
                                    <div key={attachment.path} className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-neutral-100 dark:bg-white/5">
                                      <a href={attachment.url} target="_blank" rel="noreferrer" className="block h-full w-full">
                                        <img src={attachment.url} alt={`${t.photo}: ${attachment.name}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-xs text-white">{attachment.name}</span>
                                      </a>
                                      <a
                                        href={attachment.downloadUrl ?? attachment.url}
                                        aria-label={`${t.downloadPhoto}: ${attachment.name}`}
                                        title={t.downloadPhoto}
                                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-bronze-600"
                                      >
                                        <Download size={16} />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            )}
                            {update.attachments.some((attachment) => !attachment.contentType.startsWith('image/')) && (
                              <section>
                                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500">{t.files}</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {update.attachments.filter((attachment) => !attachment.contentType.startsWith('image/')).map((attachment) => (
                                    <a key={attachment.path} href={attachment.downloadUrl ?? attachment.url} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 transition-colors hover:border-bronze-500 dark:border-white/10 dark:bg-white/[0.02]">
                                      <span className="flex min-w-0 items-center gap-3">
                                        <FileText size={17} className="shrink-0 text-bronze-500" />
                                        <span className="truncate text-xs">{attachment.name}</span>
                                      </span>
                                      <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500"><Download size={13} /> {t.viewFile}</span>
                                    </a>
                                  ))}
                                </div>
                              </section>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        ) : (
          <div className="grid overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_24px_80px_rgba(27,25,20,0.10)] lg:grid-cols-[1.08fr_0.92fr] dark:border-white/10 dark:bg-neutral-900 dark:shadow-black/25">
            <section className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-[#252722] p-7 text-white sm:min-h-[520px] sm:p-10 lg:p-14">
              <img src={clientPortalImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/90 via-neutral-900/55 to-neutral-950/75" />
              <div className="pointer-events-none absolute -right-20 top-1/4 h-72 w-72 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-10 top-1/3 h-52 w-52 rounded-full border border-white/10" />
              <div className="relative">
                <p className="mb-16 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/75">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b39b74]" /> LINIER STUDIO <span className="text-white/35">/</span> CLIENT JOURNAL
                </p>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">{t.eyebrow}</p>
                <h1 className="max-w-xl font-display text-5xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl">{t.title}</h1>
                <p className="mt-6 max-w-md text-sm leading-7 text-white/75 sm:text-base">{t.subtitle}</p>
              </div>
              <div className="relative flex items-center justify-between gap-4 border-t border-white/25 pt-5">
                <span className="text-xs leading-5 text-white/65">{t.strapline}</span>
                <Link to="/portal/admin" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-[11px] font-medium text-white/85 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white">
                  {t.admin} <ArrowUpRight size={14} />
                </Link>
              </div>
            </section>

            <form onSubmit={resetMode ? requestPasswordReset : signIn} className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
              <div className="mb-10 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9d4c9] bg-[#f7f5f0] text-neutral-700 dark:border-white/15 dark:bg-white/[0.04] dark:text-white">
                  <LockKeyhole size={16} strokeWidth={1.5} />
                </span>
                <span className="text-sm font-semibold tracking-wide">Linier <span className="font-normal text-neutral-400">/ Studio</span></span>
              </div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">{resetMode ? t.resetTitle : t.eyebrow}</p>
              <h2 className="mb-8 font-display text-3xl font-medium tracking-tight sm:text-4xl">{resetMode ? t.resetTitle : t.signIn}</h2>
              <label className="mb-6 block">
                <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{resetMode ? t.resetIdentifier : t.loginIdentifier}</span>
                <input
                  autoComplete="username"
                  autoCapitalize="none"
                  value={projectCode}
                  onChange={(event) => setProjectCode(event.target.value)}
                  required
                  maxLength={254}
                  className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#8c795e] focus:ring-4 focus:ring-[#8c795e]/10 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-bronze-400 dark:focus:ring-bronze-400/10"
                />
              </label>
              {resetMode ? (
                <label className="mb-6 block">
                  <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.whatsapp}</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+6281234567890"
                    value={whatsappNumber}
                    onChange={(event) => setWhatsappNumber(event.target.value)}
                    required
                    maxLength={24}
                    className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#8c795e] focus:ring-4 focus:ring-[#8c795e]/10 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-bronze-400 dark:focus:ring-bronze-400/10"
                  />
                  <span className="mt-2 block text-xs text-neutral-500">{t.whatsappHint}</span>
                </label>
              ) : (
                <label className="mb-2 block">
                  <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.password}</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    maxLength={256}
                    className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#8c795e] focus:ring-4 focus:ring-[#8c795e]/10 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-bronze-400 dark:focus:ring-bronze-400/10"
                  />
                </label>
              )}
              {error && <div className="mt-5"><ErrorBanner message={error} /></div>}
              {resetNotice && <p role="status" className="mt-5 border-l-2 border-emerald-700 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">{resetNotice}</p>}
              <button disabled={submitting} className="mt-7 flex w-full items-center justify-between rounded-xl bg-[#272925] px-5 py-4 text-left text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#45483e] disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                {submitting ? t.signingIn : resetMode ? t.sendReset : t.signIn} <ArrowUpRight size={17} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetMode((current) => !current);
                  setProjectCode('');
                  setError('');
                  setResetNotice('');
                }}
                className="mt-6 w-fit rounded-sm text-sm text-neutral-500 underline decoration-[#c9c4b8] underline-offset-4 transition-colors hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8c795e] dark:hover:text-white"
              >
                {resetMode ? t.backToSignIn : t.forgotPassword}
              </button>
              {!resetMode && <p className="mt-8 border-t border-[#e4e0d7] pt-5 text-xs leading-6 text-neutral-500 dark:border-white/10"><ShieldCheck size={15} className="mr-2 inline text-neutral-400" />{t.secure}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

function ErrorBanner({ message }: { message: string }) {
  return <p role="alert" className="mb-4 rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm leading-6 text-red-700 dark:text-red-300">{message}</p>;
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
      <input
        type="password"
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        minLength={minLength}
        maxLength={256}
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#8c795e] focus:ring-4 focus:ring-[#8c795e]/10 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-bronze-400 dark:focus:ring-bronze-400/10"
      />
    </label>
  );
}

function formatDate(value: string, language: string): string {
  const locale = language === 'ID' ? 'id-ID' : language === 'CN' ? 'zh-CN' : 'en-US';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function formatDuration(startDate: string, language: keyof typeof copy): string {
  const [year, month, day] = startDate.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day));
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (start.getTime() > today) return copy[language].notStarted;

  let months = (now.getUTCFullYear() - year) * 12 + now.getUTCMonth() - (month - 1);
  let anchor = dateAfterMonths(year, month - 1, day, months);
  if (anchor > today) {
    months -= 1;
    anchor = dateAfterMonths(year, month - 1, day, months);
  }
  const weeks = Math.floor((today - anchor) / (7 * 24 * 60 * 60 * 1000));

  if (language === 'ID') return `${months} bulan ${weeks} minggu`;
  if (language === 'CN') return `${months} 个月 ${weeks} 周`;
  return `${months} months ${weeks} weeks`;
}

function dateAfterMonths(year: number, month: number, day: number, months: number): number {
  const target = new Date(Date.UTC(year, month + months, 1));
  const finalDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, finalDay));
}

export default ClientPortal;
