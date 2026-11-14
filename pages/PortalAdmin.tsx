import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Check, ClipboardList, FileText, ImagePlus, KeyRound, Layers, LogOut, Plus, Send, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { portalRequest, type PortalAttachment, type PortalProject } from '../lib/portalApi';

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
    workspace: 'Ruang kerja studio',
    projectCount: 'Total proyek',
    activeProjects: 'Proyek berjalan',
    attachmentLabel: 'Foto & file progress',
    attachmentHint: 'Maks. 5 file · 20 MB per file · JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX, TXT, CSV',
    removeFiles: 'Hapus pilihan',
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
    workspace: 'Studio workspace',
    projectCount: 'Total projects',
    activeProjects: 'Active projects',
    attachmentLabel: 'Progress photos & files',
    attachmentHint: 'Up to 5 files · 20 MB each · JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX, TXT, CSV',
    removeFiles: 'Clear selection',
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
    workspace: '工作室工作区',
    projectCount: '项目总数',
    activeProjects: '进行中的项目',
    attachmentLabel: '进度照片和文件',
    attachmentHint: '最多 5 个文件 · 每个 20 MB · JPG、PNG、WEBP、PDF、DOC、DOCX、XLSX、TXT、CSV',
    removeFiles: '清除所选文件',
  },
} as const;

const ACCEPTED_FILES = '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xlsx,.txt,.csv';

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      setSelectedFiles([]);
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
      setSelectedFiles([]);
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
    const uploadedPaths: string[] = [];
    let updatePublished = false;
    try {
      const attachments: PortalAttachment[] = [];
      if (selectedFiles.length > 0) {
        const { uploads } = await portalRequest<{
          uploads: Array<PortalAttachment & { uploadUrl: string }>;
        }>('/api/portal/admin/uploads', {
          method: 'POST',
          body: JSON.stringify({
            projectId: selectedProjectId,
            files: selectedFiles.map((file) => ({
              name: file.name,
              contentType: file.type,
              size: file.size,
            })),
          }),
        });

        for (const [index, upload] of uploads.entries()) {
          const file = selectedFiles[index];
          uploadedPaths.push(upload.path);
          const response = await fetch(upload.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type, 'x-upsert': 'false' },
            body: file,
          });
          if (!response.ok) {
            throw new Error('File gagal diunggah ke penyimpanan. Periksa konfigurasi bucket dan coba kembali.');
          }
          attachments.push({
            path: upload.path,
            name: upload.name,
            contentType: upload.contentType,
            size: upload.size,
          });
        }
      }

      await portalRequest('/api/portal/admin/updates', {
        method: 'POST',
        body: JSON.stringify({
          projectId: selectedProjectId,
          title: form.get('title'),
          description: form.get('description'),
          progressPercent: Number(form.get('progressPercent')),
          updateDate: form.get('updateDate'),
          attachments,
        }),
      });
      updatePublished = true;
      const result = await portalRequest<{ projects: PortalProject[] }>('/api/portal/admin/projects');
      setProjects(result.projects);
      setNotice(t.savedUpdate);
      formElement.reset();
      setSelectedFiles([]);
      const dateInput = formElement.elements.namedItem('updateDate');
      if (dateInput instanceof HTMLInputElement) dateInput.value = today();
    } catch (cause) {
      let message = cause instanceof Error ? cause.message : 'Update tidak dapat diterbitkan.';
      if (!updatePublished && uploadedPaths.length > 0) {
        try {
          await portalRequest('/api/portal/admin/uploads', {
            method: 'DELETE',
            body: JSON.stringify({ paths: uploadedPaths }),
          });
        } catch {
          message += ' File yang sempat terunggah belum dapat dibersihkan; hubungi administrator.';
        }
      }
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-[#f4f1ea] pt-32 pb-24 text-neutral-900 dark:bg-neutral-950 dark:text-white md:pt-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <header className="relative mb-8 overflow-hidden bg-neutral-900 p-7 text-white sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-12 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-20 h-60 w-60 rounded-full border border-bronze-500/30" />
          <div className="relative flex items-center justify-between gap-4">
            <Link to="/portal" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white">
              <ArrowDownLeft size={14} /> {t.back}
            </Link>
            {authenticated && (
              <button onClick={signOut} className="inline-flex shrink-0 items-center gap-2 border border-white/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors hover:border-bronze-500 hover:text-bronze-300">
                <LogOut size={14} /><span className="hidden sm:inline">{t.signOut}</span>
              </button>
            )}
          </div>
          <div className="relative mt-12 max-w-3xl sm:mt-16">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-bronze-300">{t.eyebrow}</p>
            <h1 className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-6xl">{t.title}</h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/60 sm:text-base">{t.subtitle}</p>
          </div>
          <div className="relative mt-10 flex items-center gap-3 border-t border-white/10 pt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze-400" /> {t.workspace}
          </div>
        </header>

        {error && <ErrorBanner message={error} />}
        {notice && <p role="status" className="mb-6 flex items-start gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"><Check size={17} className="mt-0.5 shrink-0" />{notice}</p>}

        {checking ? (
          <p className="py-16 text-center font-mono text-xs uppercase tracking-widest text-neutral-500">...</p>
        ) : !authenticated ? (
          <form onSubmit={signIn} className="mx-auto max-w-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-neutral-900">
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
          <>
            <div className="mb-8 grid gap-3 sm:grid-cols-3">
              <Metric icon={<Layers size={17} />} label={t.projectCount} value={projects.length.toString().padStart(2, '0')} />
              <Metric icon={<Send size={17} />} label={t.activeProjects} value={projects.filter((project) => project.progress_percent < 100).length.toString().padStart(2, '0')} />
              <Metric icon={<ClipboardList size={17} />} label={t.progress} value={`${projects.length ? Math.round(projects.reduce((sum, project) => sum + project.progress_percent, 0) / projects.length) : 0}%`} />
            </div>
            <div className="grid items-start gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <section className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-8 flex items-start gap-3 border-b border-neutral-100 pb-5 dark:border-white/10">
                <Plus size={19} className="text-bronze-500" />
                <div>
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">01 / ACCESS</p>
                  <h2 className="font-display text-xl font-bold uppercase">{t.createProject}</h2>
                </div>
              </div>
              <form onSubmit={createProject} className="space-y-5">
                <Field name="projectCode" label={t.projectCode} required maxLength={32} placeholder="LIN-2026-001" autoCapitalize="characters" />
                <Field name="projectName" label={t.projectName} required maxLength={120} />
                <Field name="clientName" label={t.clientName} required maxLength={120} />
                <Field name="location" label={t.location} maxLength={120} />
                <Field name="clientPassword" label={t.clientPassword} type="password" required minLength={12} maxLength={256} autoComplete="new-password" />
                <button disabled={busy} className="mt-2 flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:opacity-60 dark:bg-white dark:text-neutral-950">
                  {t.create} <ArrowUpRight size={17} />
                </button>
              </form>
            </section>

            <section className="space-y-5">
              <div className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-7 flex items-start gap-3 border-b border-neutral-100 pb-5 dark:border-white/10">
                  <Send size={18} className="text-bronze-500" />
                  <div>
                    <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">02 / JOURNAL</p>
                    <h2 className="font-display text-xl font-bold uppercase">{t.newUpdate}</h2>
                  </div>
                </div>
                {projects.length === 0 ? (
                  <p className="text-sm leading-6 text-neutral-500">{t.emptyProjects}</p>
                ) : (
                  <form key={selectedProjectId} onSubmit={publishUpdate} className="space-y-5">
                    <label className="block">
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-neutral-500">{t.projects}</span>
                      <select value={selectedProjectId} onChange={(event) => { setSelectedFiles([]); setSelectedProjectId(event.target.value); }} required className="w-full border-b border-neutral-300 bg-transparent py-3 text-sm outline-none focus:border-bronze-500 dark:border-white/20 dark:[color-scheme:dark]">
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
                    <div className="border border-dashed border-neutral-300 bg-neutral-50/80 p-4 dark:border-white/15 dark:bg-white/[0.03]">
                      <div className="mb-3 flex items-center gap-2">
                        <ImagePlus size={16} className="text-bronze-500" />
                        <span className="font-mono text-[10px] uppercase tracking-widest">{t.attachmentLabel}</span>
                      </div>
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-neutral-200 bg-white px-4 py-5 text-center transition-colors hover:border-bronze-500 dark:border-white/10 dark:bg-neutral-900">
                        <Upload size={19} className="text-bronze-500" />
                        <span className="text-xs font-medium">{language === 'ID' ? 'Pilih foto atau dokumen' : language === 'CN' ? '选择照片或文档' : 'Choose photos or documents'}</span>
                        <span className="max-w-sm text-[10px] leading-5 text-neutral-500">{t.attachmentHint}</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          multiple
                          accept={ACCEPTED_FILES}
                          className="sr-only"
                          onChange={(event) => {
                            const files = Array.from(event.currentTarget.files ?? []);
                            if (files.length > 5) {
                              setError(language === 'ID' ? 'Maksimal 5 file untuk satu update.' : language === 'CN' ? '每次更新最多上传 5 个文件。' : 'Choose no more than 5 files per update.');
                              event.currentTarget.value = '';
                              return;
                            }
                            const oversized = files.some((file) => file.size > 20 * 1024 * 1024);
                            if (oversized) {
                              setError(language === 'ID' ? 'Ukuran setiap file maksimal 20 MB.' : language === 'CN' ? '每个文件最大 20 MB。' : 'Each file must be 20 MB or smaller.');
                              event.currentTarget.value = '';
                              return;
                            }
                            setError('');
                            setSelectedFiles(files);
                          }}
                        />
                      </label>
                      {selectedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {selectedFiles.map((file) => (
                            <div key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-3 text-xs">
                              <span className="flex min-w-0 items-center gap-2"><FileText size={14} className="shrink-0 text-bronze-500" /><span className="truncate">{file.name}</span></span>
                              <span className="shrink-0 font-mono text-[10px] text-neutral-400">{formatBytes(file.size)}</span>
                            </div>
                          ))}
                          <button type="button" onClick={() => { setSelectedFiles([]); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="pt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-red-500">{t.removeFiles}</button>
                        </div>
                      )}
                    </div>
                    <button disabled={busy || projects.length === 0} className="flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:opacity-60 dark:bg-white dark:text-neutral-950">
                      {busy ? (language === 'ID' ? 'Mengunggah...' : language === 'CN' ? '正在上传...' : 'Uploading...') : t.publish} <ArrowUpRight size={17} />
                    </button>
                  </form>
                )}
              </div>

              <div className="border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
                  <ClipboardList size={17} className="text-bronze-500" />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">03 / OVERVIEW</p>
                    <h2 className="mt-1 font-mono text-xs uppercase tracking-widest">{t.projects}</h2>
                  </div>
                </div>
                {projects.length === 0 ? <p className="text-sm text-neutral-500">{t.emptyProjects}</p> : (
                  <ul className="divide-y divide-neutral-200 dark:divide-white/10">
                    {projects.map((project) => (
                      <li key={project.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                        <span className="min-w-0"><strong className="font-mono text-[10px] text-bronze-600 dark:text-bronze-400">{project.project_code}</strong><span className="mx-2 text-neutral-300">/</span><span className="font-medium">{project.project_name}</span><span className="mt-1 block text-xs text-neutral-500">{project.client_name}</span></span>
                        <span className="w-24 shrink-0">
                          <span className="mb-1 block text-right font-mono text-[10px] text-neutral-500">{project.progress_percent}%</span>
                          <span className="block h-1 bg-neutral-100 dark:bg-white/10"><span className="block h-full bg-bronze-500" style={{ width: `${project.progress_percent}%` }} /></span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
          </>
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

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border border-neutral-200 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
      </div>
      <span className="flex h-9 w-9 items-center justify-center border border-bronze-500/30 text-bronze-500">{icon}</span>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <p role="alert" className="mb-6 border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-300">{message}</p>;
}

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function today(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default PortalAdmin;
