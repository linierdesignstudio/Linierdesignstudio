import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock3, Download, FileText, LockKeyhole, LogOut, MapPin, ShieldCheck } from 'lucide-react';
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
    files: 'Lampiran progress',
    viewFile: 'Buka file',
    photo: 'Foto progress',
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
    files: 'Progress attachments',
    viewFile: 'Open file',
    photo: 'Progress photo',
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
    files: '进度附件',
    viewFile: '打开文件',
    photo: '进度照片',
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

  const signOut = async () => {
    try {
      await portalRequest('/api/portal/logout', { method: 'POST' });
      setProject(null);
      setUpdates([]);
      setError('');
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
                <button onClick={signOut} className="inline-flex items-center gap-2 self-start border border-white/20 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-white/75 transition-colors hover:border-bronze-400 hover:text-white md:self-auto">
                  <LogOut size={14} /> {t.logout}
                </button>
              </div>
              <div className="relative mt-10 flex items-center gap-2 border-t border-white/10 pt-5 text-[10px] font-mono uppercase tracking-[0.18em] text-white/50">
                <ShieldCheck size={14} className="text-bronze-300" /> {t.secure}
              </div>
            </div>

            {error && <ErrorBanner message={error} />}

            <div className="grid gap-5 py-5 md:grid-cols-[1.4fr_0.8fr]">
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
              <div className="flex flex-col justify-between border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                <div>
                  <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">{t.location}</p>
                  <div className="flex items-start gap-3 text-lg">
                    <MapPin size={18} className="mt-1 shrink-0 text-bronze-500" />
                    <span>{project.location || '-'}</span>
                  </div>
                </div>
                <p className="mt-8 border-t border-neutral-100 pt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-400">{project.project_code}</p>
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
                          <div className="mt-6 border-t border-neutral-100 pt-5 dark:border-white/10">
                            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500">{t.files}</p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {update.attachments.map((attachment) => attachment.contentType.startsWith('image/') ? (
                                <a key={attachment.path} href={attachment.url} target="_blank" rel="noreferrer" className="group relative block aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-white/5">
                                  <img src={attachment.url} alt={`${t.photo}: ${attachment.name}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-xs text-white">{attachment.name}</span>
                                </a>
                              ) : (
                                <a key={attachment.path} href={attachment.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center justify-between gap-3 border border-neutral-200 px-4 py-3 transition-colors hover:border-bronze-500 dark:border-white/10">
                                  <span className="flex min-w-0 items-center gap-3">
                                    <FileText size={17} className="shrink-0 text-bronze-500" />
                                    <span className="truncate text-xs">{attachment.name}</span>
                                  </span>
                                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500"><Download size={13} /> {t.viewFile}</span>
                                </a>
                              ))}
                            </div>
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

            <form onSubmit={signIn} className="flex flex-col justify-center border border-neutral-200 bg-white p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-8 flex h-12 w-12 items-center justify-center border border-bronze-500/40 text-bronze-500">
                <LockKeyhole size={20} />
              </div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-bronze-600 dark:text-bronze-400">CLIENT ACCESS</p>
              <h2 className="mb-8 font-display text-2xl font-semibold uppercase">{t.signIn}</h2>
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
              {error && <ErrorBanner message={error} />}
              <button disabled={submitting} className="mt-5 flex w-full items-center justify-between bg-neutral-900 px-5 py-4 text-left font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-950">
                {submitting ? t.signingIn : t.signIn} <ArrowUpRight size={17} />
              </button>
              <p className="mt-6 flex items-start gap-2 text-xs leading-6 text-neutral-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-bronze-500" />{t.secure}</p>
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

function formatDate(value: string, language: string): string {
  const locale = language === 'ID' ? 'id-ID' : language === 'CN' ? 'zh-CN' : 'en-US';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export default ClientPortal;
