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
    whatsapp: 'Nomor WhatsApp',
    whatsappHint: 'Gunakan kode negara, contoh: +62 812 3456 7890',
    sendReset: 'Kirim permintaan',
    backToSignIn: 'Kembali ke login',
    resetSent: 'Jika ID proyek terdaftar, tim studio akan memverifikasi permintaan dan menghubungi Anda lewat WhatsApp.',
    changePassword: 'Ganti password',
    currentPassword: 'Password saat ini',
    newPassword: 'Password baru',
    confirmPassword: 'Konfirmasi password baru',
    passwordMinLength: 'Minimal 8 karakter.',
    savePassword: 'Simpan password',
    savingPassword: 'Menyimpan...',
    passwordChanged: 'Password berhasil diubah.',
    passwordMismatch: 'Konfirmasi password tidak sama.',
    cancel: 'Batal',
    duration: 'Durasi pembangunan',
    durationNotSet: 'Tanggal mulai belum diatur oleh tim studio.',
    notStarted: 'Belum dimulai',
    downloadPhoto: 'Unduh foto',
  },
  EN: {
    eyebrow: 'LINIER STUDIO / CLIENT PORTAL',
    title: 'Your project journey.',
    subtitle: 'Sign in to see the latest progress directly from the studio team.',
    projectId: 'Project ID',
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
    whatsapp: 'WhatsApp number',
    whatsappHint: 'Include your country code, e.g. +1 555 123 4567',
    sendReset: 'Send request',
    backToSignIn: 'Back to sign in',
    resetSent: 'If the project ID is registered, the studio will verify the request and contact you via WhatsApp.',
    changePassword: 'Change password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    passwordMinLength: 'Use at least 8 characters.',
    savePassword: 'Save password',
    savingPassword: 'Saving...',
    passwordChanged: 'Password changed successfully.',
    passwordMismatch: 'The password confirmation does not match.',
    cancel: 'Cancel',
    duration: 'Construction duration',
    durationNotSet: 'The studio has not set a start date yet.',
    notStarted: 'Not started yet',
    downloadPhoto: 'Download photo',
  },
  CN: {
    eyebrow: 'LINIER STUDIO / 客户门户',
    title: '您的项目进程。',
    subtitle: '登录后即可查看工作室团队分享的最新进度。',
    projectId: '项目编号',
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
    whatsapp: 'WhatsApp 号码',
    whatsappHint: '请加国家代码，例如：+86 138 0000 0000',
    sendReset: '发送申请',
    backToSignIn: '返回登录',
    resetSent: '如果项目编号已注册，工作室将核实请求并通过 WhatsApp 联系您。',
    changePassword: '更改密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmPassword: '确认新密码',
    passwordMinLength: '至少使用 8 个字符。',
    savePassword: '保存密码',
    savingPassword: '正在保存...',
    passwordChanged: '密码已成功更改。',
    passwordMismatch: '两次输入的密码不一致。',
    cancel: '取消',
    duration: '施工时长',
    durationNotSet: '工作室尚未设置开始日期。',
    notStarted: '尚未开始',
    downloadPhoto: '下载照片',
  },
} as const;

const ClientPortal: React.FC = () => {
  const { language } = useLanguage();
  const t = copy[language];
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
    portalRequest<{ project: PortalProject }>('/api/portal/client/session')
      .then(async ({ project: currentProject }) => {
        if (!active) return;
        setProject(currentProject);
        const result = await portalRequest<{ updates: PortalUpdate[] }>('/api/portal/client/updates');
        if (active) {
          setUpdates(result.updates);
        }
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

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await portalRequest<{ project: PortalProject }>('/api/portal/client/login', {
        method: 'POST',
        body: JSON.stringify({ projectCode, password }),
      });
      setProject(result.project);
      const updateResult = await portalRequest<{ updates: PortalUpdate[] }>('/api/portal/client/updates');
      setUpdates(updateResult.updates);
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
        body: JSON.stringify({ projectCode, whatsappNumber }),
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
      setPasswordChangeNotice(t.passwordChanged);
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
      setUpdates([]);
      setError('');
      closePasswordChange();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tidak dapat keluar dari portal.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] pt-32 pb-24 text-neutral-900 dark:bg-neutral-950 dark:text-white md:pt-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:text-bronze-500">
          <ArrowDownLeft size={15} /> {t.back}
        </Link>

        {loading ? (
          <p className="py-24 text-center font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">{t.loading}</p>
        ) : project ? (
          <section>
            <div className="relative mb-5 overflow-hidden bg-neutral-900 p-7 text-white sm:p-10 lg:p-12">
              <div className="pointer-events-none absolute -right-12 -top-32 h-80 w-80 rounded-full border border-white/10" />
              <div className="relative flex flex-col justify-between gap-10 md:flex-row md:items-end">
                <div>
                  <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-bronze-300">{t.eyebrow} / {project.project_code}</p>
                  <h1 className="max-w-3xl font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-6xl">{project.project_name}</h1>
                  <p className="mt-5 text-sm text-white/60">{project.client_name}<span className="mx-3 text-white/25">/</span>{project.location || t.location}</p>
                </div>
                <div className="flex flex-wrap gap-3 self-start md:self-auto">
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
                    className="inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-white/75 transition-colors hover:border-bronze-400 hover:text-white"
                  >
                    <LockKeyhole size={14} /> {t.changePassword}
                  </button>
                  <button onClick={signOut} className="inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-white/75 transition-colors hover:border-bronze-400 hover:text-white">
                    <LogOut size={14} /> {t.logout}
                  </button>
                </div>
              </div>
              <div className="relative mt-10 flex items-center gap-2 border-t border-white/10 pt-5 text-[10px] font-mono uppercase tracking-[0.18em] text-white/50">
                <ShieldCheck size={14} className="text-bronze-300" /> {t.secure}
              </div>
            </div>

            {error && <ErrorBanner message={error} />}

            {passwordChangeOpen && (
              <form onSubmit={changePassword} className="mb-5 border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
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
                  <button type="button" onClick={closePasswordChange} className="border border-neutral-300 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-600 transition-colors hover:border-neutral-500 dark:border-white/20 dark:text-neutral-300">
                    {t.cancel}
                  </button>
                  <button disabled={passwordChanging} className="inline-flex items-center gap-2 bg-neutral-900 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-950">
                    {passwordChanging ? t.savingPassword : t.savePassword} <ArrowUpRight size={15} />
                  </button>
                </div>
              </form>
            )}

            <div className="grid gap-5 py-5 md:grid-cols-[1.25fr_0.8fr_0.8fr]">
              <div className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">{t.latest}</p>
                    <span className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">{project.progress_percent}<span className="text-2xl text-bronze-500">%</span></span>
                  </div>
                  <span className="mb-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">{project.progress_percent === 100 ? t.complete : t.inProgress}</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-white/10">
                  <div className="h-full bg-bronze-500 transition-[width] duration-700" style={{ width: `${project.progress_percent}%` }} />
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
                  {project.progress_percent === 100 ? <CheckCircle2 size={15} className="text-bronze-500" /> : <Clock3 size={15} className="text-bronze-500" />}
                  <span>{t.status}: {project.progress_percent === 100 ? t.complete : t.inProgress}</span>
                </div>
              </div>
              <div className="order-3 flex flex-col justify-between border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 md:order-2 dark:border-white/10 dark:bg-neutral-900">
                <div>
                  <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">{t.location}</p>
                  <div className="flex items-start gap-3 text-lg">
                    <MapPin size={18} className="mt-1 shrink-0 text-bronze-500" />
                    <span>{project.location || '-'}</span>
                  </div>
                </div>
                <p className="mt-8 border-t border-neutral-100 pt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-400">{project.project_code}</p>
              </div>
              <div className="order-2 flex min-h-[190px] flex-col justify-between border border-white/10 bg-[#171819] p-6 text-white shadow-sm sm:min-h-0 sm:border-neutral-200 sm:bg-white sm:p-8 sm:text-neutral-900 md:order-3 dark:border-white/10 dark:bg-neutral-900 dark:text-white">
                <div>
                  <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 sm:text-neutral-500 dark:text-neutral-400">{t.duration}</p>
                  <div className="flex items-start gap-3 text-lg text-white sm:text-neutral-900 dark:text-white">
                    <CalendarDays size={18} className="mt-1 shrink-0 text-lime-400 sm:text-bronze-500 dark:text-lime-400" />
                    <span>{project.start_date ? formatDuration(project.start_date, language) : t.durationNotSet}</span>
                  </div>
                </div>
                {project.start_date && <p className="mt-8 border-t border-white/15 pt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-white/50 sm:border-neutral-100 sm:text-neutral-400 dark:border-white/10 dark:text-neutral-400">{formatDate(project.start_date, language)}</p>}
              </div>
            </div>

            <div className="mt-12">
              <div className="mb-6 flex items-end justify-between border-b border-neutral-300 pb-5 dark:border-white/10">
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400">PROJECT JOURNAL</p>
                  <h2 className="font-display text-2xl font-semibold uppercase tracking-tight sm:text-3xl">{t.updated}</h2>
                </div>
                <span className="font-mono text-xs text-neutral-500">{updates.length.toString().padStart(2, '0')}</span>
              </div>
              {updates.length === 0 ? (
                <div className="border border-dashed border-neutral-300 px-6 py-14 text-center dark:border-white/15">
                  <p className="font-display text-xl font-semibold">{t.noUpdates}</p>
                  <p className="mt-2 text-sm text-neutral-500">{t.noUpdatesHint}</p>
                </div>
              ) : (
                <ol className="grid gap-4">
                  {updates.map((update) => (
                    <li key={update.id} className="grid gap-5 border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-[150px_1fr] sm:p-7 dark:border-white/10 dark:bg-neutral-900">
                      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-4 sm:block sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5 dark:border-white/10">
                        <time className="font-mono text-[10px] uppercase leading-5 tracking-wider text-neutral-500">
                          {formatDate(update.update_date, language)}
                        </time>
                        <span className="font-mono text-xs text-bronze-600 dark:text-bronze-400">{update.progress_percent}%</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-semibold">{update.title}</h3>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-600 dark:text-neutral-400">{update.description}</p>
                        {update.attachments.length > 0 && (
                          <div className="mt-6 space-y-5 border-t border-neutral-100 pt-5 dark:border-white/10">
                            {update.attachments.some((attachment) => attachment.contentType.startsWith('image/')) && (
                              <section>
                                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500">{t.photo}</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {update.attachments.filter((attachment) => attachment.contentType.startsWith('image/')).map((attachment) => (
                                    <div key={attachment.path} className="group relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-white/5">
                                      <a href={attachment.url} target="_blank" rel="noreferrer" className="block h-full w-full">
                                        <img src={attachment.url} alt={`${t.photo}: ${attachment.name}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-xs text-white">{attachment.name}</span>
                                      </a>
                                      <a
                                        href={attachment.downloadUrl ?? attachment.url}
                                        aria-label={`${t.downloadPhoto}: ${attachment.name}`}
                                        title={t.downloadPhoto}
                                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-black/65 text-white transition-colors hover:bg-bronze-600"
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
                                    <a key={attachment.path} href={attachment.downloadUrl ?? attachment.url} className="flex min-w-0 items-center justify-between gap-3 border border-neutral-200 px-4 py-3 transition-colors hover:border-bronze-500 dark:border-white/10">
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
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <div className="flex min-h-[440px] flex-col justify-between bg-neutral-900 p-7 text-white sm:p-10 lg:p-12">
              <div>
                <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-bronze-300">{t.eyebrow}</p>
                <h1 className="max-w-2xl font-display text-5xl font-semibold uppercase leading-[0.9] tracking-tight sm:text-7xl">{t.title}</h1>
                <p className="mt-7 max-w-lg text-base leading-7 text-white/60">{t.subtitle}</p>
              </div>
              <Link to="/portal/admin" className="mt-10 inline-flex w-fit items-center gap-2 border-b border-white/25 pb-2 font-mono text-[10px] uppercase tracking-widest text-white/70 transition-colors hover:border-bronze-400 hover:text-white">
                {t.admin} <ArrowUpRight size={14} />
              </Link>
            </div>

            <form onSubmit={resetMode ? requestPasswordReset : signIn} className="flex flex-col justify-center border border-neutral-200 bg-white p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-8 flex h-12 w-12 items-center justify-center border border-bronze-500/40 text-bronze-500">
                <LockKeyhole size={20} />
              </div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400">CLIENT ACCESS</p>
              <h2 className="mb-8 font-display text-2xl font-semibold uppercase">{resetMode ? t.resetTitle : t.signIn}</h2>
              <label className="mb-7 block">
                <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-neutral-500">{t.projectId}</span>
                <input
                  autoComplete="username"
                  autoCapitalize="characters"
                  value={projectCode}
                  onChange={(event) => setProjectCode(event.target.value)}
                  required
                  maxLength={32}
                  className="w-full border-b border-neutral-300 bg-transparent py-3 text-lg outline-none transition-colors focus:border-bronze-500 dark:border-white/20"
                />
              </label>
              {resetMode ? (
                <label className="mb-8 block">
                  <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-neutral-500">{t.whatsapp}</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+6281234567890"
                    value={whatsappNumber}
                    onChange={(event) => setWhatsappNumber(event.target.value)}
                    required
                    maxLength={24}
                    className="w-full border-b border-neutral-300 bg-transparent py-3 text-lg outline-none transition-colors focus:border-bronze-500 dark:border-white/20"
                  />
                  <span className="mt-2 block text-[10px] text-neutral-500">{t.whatsappHint}</span>
                </label>
              ) : (
                <label className="mb-8 block">
                  <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-neutral-500">{t.password}</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    maxLength={256}
                    className="w-full border-b border-neutral-300 bg-transparent py-3 text-lg outline-none transition-colors focus:border-bronze-500 dark:border-white/20"
                  />
                </label>
              )}
              {error && <ErrorBanner message={error} />}
              {resetNotice && <p role="status" className="mb-4 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-xs leading-5 text-emerald-700 dark:text-emerald-300">{resetNotice}</p>}
              <button disabled={submitting} className="mt-5 flex w-full items-center justify-between bg-neutral-900 px-5 py-4 text-left font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-950">
                {submitting ? t.signingIn : resetMode ? t.sendReset : t.signIn} <ArrowUpRight size={17} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetMode((current) => !current);
                  setError('');
                  setResetNotice('');
                }}
                className="mt-5 w-fit font-mono text-[10px] uppercase tracking-widest text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-bronze-500"
              >
                {resetMode ? t.backToSignIn : t.forgotPassword}
              </button>
              {!resetMode && <p className="mt-6 flex items-start gap-2 text-xs leading-6 text-neutral-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-bronze-500" />{t.secure}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

function ErrorBanner({ message }: { message: string }) {
  return <p role="alert" className="mb-4 border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-300">{message}</p>;
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
      <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-neutral-500">{label}</span>
      <input
        type="password"
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        minLength={minLength}
        maxLength={256}
        className="w-full border-b border-neutral-300 bg-transparent py-3 text-lg outline-none transition-colors focus:border-bronze-500 dark:border-white/20"
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
