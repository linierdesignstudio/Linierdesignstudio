import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Check, ClipboardList, KeyRound, LogOut, Plus, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { portalRequest, type PortalProject } from '../lib/portalApi';

const copy = {
  ID: {
    eyebrow: 'LINIER STUDIO / ADMIN',
    title: 'Kelola progress proyek.',
    subtitle: 'Masuk untuk membuat akses klien dan membagikan update harian.',
    password: 'Password admin',
    signIn: 'Masuk',
    signOut: 'Keluar',
    projects: 'Daftar proyek',
    createProject: 'Buat akses proyek',
    projectCode: 'ID Proyek',
    projectName: 'Nama proyek',
    clientName: 'Nama klien',
    location: 'Lokasi',
    clientPassword: 'Password klien (min. 12 karakter)',
    create: 'Buat proyek',
    newUpdate: 'Update progress',
    chooseProject: 'Pilih proyek',
    titleField: 'Judul update',
    description: 'Catatan progress',
    progress: 'Progress (%)',
    date: 'Tanggal update',
    publish: 'Terbitkan update',
    savedProject: 'Proyek berhasil dibuat. Catat password klien yang Anda masukkan; password tidak dapat ditampilkan kembali.',
    savedUpdate: 'Update berhasil diterbitkan.',
    emptyProjects: 'Belum ada proyek. Buat akses proyek terlebih dahulu.',
    back: 'Portal klien',
  },
  EN: {
    eyebrow: 'LINIER STUDIO / ADMIN',
    title: 'Manage project progress.',
    subtitle: 'Sign in to create client access and share daily updates.',
    password: 'Admin password',
    signIn: 'Sign in',
    signOut: 'Sign out',
    projects: 'Projects',
    createProject: 'Create project access',
    projectCode: 'Project ID',
    projectName: 'Project name',
    clientName: 'Client name',
    location: 'Location',
    clientPassword: 'Client password (min. 12 characters)',
    create: 'Create project',
    newUpdate: 'Progress update',
    chooseProject: 'Choose a project',
    titleField: 'Update title',
    description: 'Progress notes',
    progress: 'Progress (%)',
    date: 'Update date',
    publish: 'Publish update',
    savedProject: 'Project created. Keep a record of the client password you entered; it cannot be shown again.',
    savedUpdate: 'Update published.',
    emptyProjects: 'No projects yet. Create project access first.',
    back: 'Client portal',
  },
  CN: {
    eyebrow: 'LINIER STUDIO / 管理',
    title: '管理项目进度。',
    subtitle: '登录以创建客户访问权限并发布每日更新。',
    password: '管理员密码',
    signIn: '登录',
    signOut: '退出',
    projects: '项目列表',
    createProject: '创建项目访问权限',
    projectCode: '项目编号',
    projectName: '项目名称',
    clientName: '客户名称',
    location: '地点',
    clientPassword: '客户密码（至少 12 个字符）',
    create: '创建项目',
    newUpdate: '进度更新',
    chooseProject: '选择项目',
    titleField: '更新标题',
    description: '进度记录',
    progress: '进度（%）',
    date: '更新日期',
    publish: '发布更新',
    savedProject: '项目已创建。请记录您输入的客户密码；密码无法再次显示。',
    savedUpdate: '更新已发布。',
    emptyProjects: '暂无项目。请先创建项目访问权限。',
    back: '客户门户',
  },
} as const;

const PortalAdmin: React.FC = () => {
  const { language } = useLanguage();
  const t = copy[language];
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    portalRequest('/api/portal/admin/session')
      .then(async () => {
        const result = await portalRequest<{ projects: PortalProject[] }>('/api/portal/admin/projects');
        if (active) {
          setProjects(result.projects);
          setSelectedProjectId(result.projects[0]?.id ?? '');
          setAuthenticated(true);
        }
      })
      .catch((cause: unknown) => {
        if (active && cause instanceof Error && !cause.message.includes('Sesi telah berakhir') && !cause.message.includes('Sesi tidak valid')) {
          setError(cause.message);
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => { active = false; };
  }, []);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await portalRequest('/api/portal/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password: adminPassword }),
      });
      const result = await portalRequest<{ projects: PortalProject[] }>('/api/portal/admin/projects');
      setProjects(result.projects);
      setSelectedProjectId(result.projects[0]?.id ?? '');
      setAuthenticated(true);
      setAdminPassword('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tidak dapat masuk ke admin.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    try {
      await portalRequest('/api/portal/logout', { method: 'POST' });
      setAuthenticated(false);
      setProjects([]);
      setSelectedProjectId('');
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tidak dapat keluar dari admin.');
    }
  };

  const createProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setError('');
    setNotice('');
    const form = new FormData(formElement);
    try {
      const result = await portalRequest<{ project: PortalProject }>('/api/portal/admin/projects', {
        method: 'POST',
        body: JSON.stringify({
          projectCode: form.get('projectCode'),
          projectName: form.get('projectName'),
          clientName: form.get('clientName'),
          location: form.get('location'),
          password: form.get('clientPassword'),
        }),
      });
      setProjects((current) => [result.project, ...current]);
      setSelectedProjectId(result.project.id);
      setNotice(t.savedProject);
      formElement.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Proyek tidak dapat dibuat.');
    } finally {
      setBusy(false);
    }
  };

  const publishUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setError('');
    setNotice('');
    const form = new FormData(formElement);
    try {
      await portalRequest('/api/portal/admin/updates', {
        method: 'POST',
        body: JSON.stringify({
          projectId: selectedProjectId,
          title: form.get('title'),
          description: form.get('description'),
          progressPercent: Number(form.get('progressPercent')),
          updateDate: form.get('updateDate'),
        }),
      });
      const result = await portalRequest<{ projects: PortalProject[] }>('/api/portal/admin/projects');
      setProjects(result.projects);
      setNotice(t.savedUpdate);
      formElement.reset();
      const dateInput = formElement.elements.namedItem('updateDate');
      if (dateInput instanceof HTMLInputElement) dateInput.value = today();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Update tidak dapat diterbitkan.');
    } finally {
      setBusy(false);
    }
  };

  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-white pt-36 pb-24 text-neutral-900 dark:bg-neutral-950 dark:text-white md:pt-44">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="mb-12 flex items-start justify-between gap-6">
          <div>
            <Link to="/portal" className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-bronze-500">
              <ArrowDownLeft size={15} /> {t.back}
            </Link>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-bronze-500">{t.eyebrow}</p>
            <h1 className="max-w-3xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">{t.title}</h1>
            <p className="mt-5 max-w-xl text-neutral-500">{t.subtitle}</p>
          </div>
          {authenticated && (
            <button onClick={signOut} className="mt-10 inline-flex shrink-0 items-center gap-2 border border-neutral-300 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors hover:border-bronze-500 dark:border-white/15">
              <LogOut size={15} /><span className="hidden sm:inline">{t.signOut}</span>
            </button>
          )}
        </div>

        {error && <ErrorBanner message={error} />}
        {notice && <p role="status" className="mb-6 flex items-start gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"><Check size={17} className="mt-0.5 shrink-0" />{notice}</p>}

        {checking ? (
          <p className="py-16 text-center font-mono text-xs uppercase tracking-widest text-neutral-500">...</p>
        ) : !authenticated ? (
          <form onSubmit={signIn} className="max-w-xl border border-neutral-200 p-6 sm:p-10 dark:border-white/10">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full border border-bronze-500/40 text-bronze-500"><KeyRound size={20} /></div>
            <label className="mb-8 block">
              <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-neutral-500">{t.password}</span>
              <input type="password" autoComplete="current-password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} required maxLength={256} className="w-full border-b border-neutral-300 bg-transparent py-3 text-lg outline-none focus:border-bronze-500 dark:border-white/20" />
            </label>
            <button disabled={busy} className="flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:opacity-60 dark:bg-white dark:text-neutral-950">
              {busy ? '...' : t.signIn} <ArrowUpRight size={17} />
            </button>
          </form>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="border border-neutral-200 p-6 sm:p-8 dark:border-white/10">
              <div className="mb-8 flex items-center gap-3">
                <Plus size={19} className="text-bronze-500" />
                <h2 className="font-display text-xl font-bold uppercase">{t.createProject}</h2>
              </div>
              <form onSubmit={createProject} className="space-y-5">
                <Field name="projectCode" label={t.projectCode} required maxLength={32} placeholder="LIN-2026-001" autoCapitalize="characters" />
                <Field name="projectName" label={t.projectName} required maxLength={120} />
                <Field name="clientName" label={t.clientName} required maxLength={120} />
                <Field name="location" label={t.location} maxLength={120} />
                <Field name="clientPassword" label={t.clientPassword} type="password" required minLength={12} maxLength={256} autoComplete="new-password" />
                <button disabled={busy} className="flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:opacity-60 dark:bg-white dark:text-neutral-950">
                  {t.create} <ArrowUpRight size={17} />
                </button>
              </form>
            </section>

            <section className="space-y-8">
              <div className="border border-neutral-200 p-6 sm:p-8 dark:border-white/10">
                <div className="mb-7 flex items-center gap-3">
                  <Send size={18} className="text-bronze-500" />
                  <h2 className="font-display text-xl font-bold uppercase">{t.newUpdate}</h2>
                </div>
                {projects.length === 0 ? (
                  <p className="text-sm leading-6 text-neutral-500">{t.emptyProjects}</p>
                ) : (
                  <form key={selectedProjectId} onSubmit={publishUpdate} className="space-y-5">
                    <label className="block">
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-neutral-500">{t.projects}</span>
                      <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} required className="w-full border-b border-neutral-300 bg-transparent py-3 text-sm outline-none focus:border-bronze-500 dark:border-white/20 dark:[color-scheme:dark]">
                        <option value="">{t.chooseProject}</option>
                        {projects.map((project) => <option key={project.id} value={project.id}>{project.project_code} — {project.project_name}</option>)}
                      </select>
                    </label>
                    <Field name="title" label={t.titleField} required maxLength={120} />
                    <label className="block">
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-neutral-500">{t.description}</span>
                      <textarea name="description" required minLength={2} maxLength={5000} rows={4} className="w-full resize-y border-b border-neutral-300 bg-transparent py-3 text-sm leading-6 outline-none focus:border-bronze-500 dark:border-white/20" />
                    </label>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field name="progressPercent" label={t.progress} type="number" min={0} max={100} defaultValue={selectedProject?.progress_percent ?? 0} required />
                      <Field name="updateDate" label={t.date} type="date" defaultValue={today()} required />
                    </div>
                    <button disabled={busy || projects.length === 0} className="flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:opacity-60 dark:bg-white dark:text-neutral-950">
                      {t.publish} <ArrowUpRight size={17} />
                    </button>
                  </form>
                )}
              </div>

              <div className="border border-neutral-200 p-6 dark:border-white/10">
                <div className="mb-5 flex items-center gap-3">
                  <ClipboardList size={17} className="text-bronze-500" />
                  <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">{t.projects}</h2>
                </div>
                {projects.length === 0 ? <p className="text-sm text-neutral-500">{t.emptyProjects}</p> : (
                  <ul className="divide-y divide-neutral-200 dark:divide-white/10">
                    {projects.map((project) => (
                      <li key={project.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                        <span><strong className="font-mono text-xs">{project.project_code}</strong><span className="mx-2 text-neutral-400">/</span>{project.project_name}</span>
                        <span className="shrink-0 font-mono text-xs text-neutral-500">{project.progress_percent}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-neutral-500">{label}</span>
      <input {...props} className="w-full border-b border-neutral-300 bg-transparent py-3 text-sm outline-none transition-colors focus:border-bronze-500 dark:border-white/20" />
    </label>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <p role="alert" className="mb-6 border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-300">{message}</p>;
}

function today(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default PortalAdmin;
