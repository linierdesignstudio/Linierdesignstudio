import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, ChartNoAxesColumn, Check, CheckCircle2, ClipboardList, Copy, FileText, FolderOpen, ImagePlus, KeyRound, Layers, LayoutDashboard, LogOut, MessageCircle, Moon, Plus, RefreshCw, Send, Sun, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { portalRequest, type PasswordResetRequest, type PortalAttachment, type PortalProject } from '../lib/portalApi';
import { Language } from '../types';

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
    startDate: 'Mulai pembangunan',
    saveDate: 'Simpan tanggal',
    savedDate: 'Tanggal mulai proyek berhasil disimpan.',
    resetRequests: 'Permintaan lupa password',
    refreshRequests: 'Perbarui daftar',
    noResetRequests: 'Belum ada permintaan reset password.',
    processReset: 'Buat password baru',
    temporaryPassword: 'Password baru',
    copyPassword: 'Salin password',
    passwordCopied: 'Password disalin.',
    copyFailed: 'Tidak dapat menyalin. Pilih password secara manual.',
    sendWhatsapp: 'Buka chat WhatsApp',
    verifyClient: 'Pastikan identitas klien sebelum mengirim password ini.',
    duration: 'Durasi pembangunan',
    attachmentLabel: 'Foto & file progress',
    attachmentHint: 'Maks. 5 file · 20 MB per file · JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX, TXT, CSV',
    removeFiles: 'Hapus pilihan',
    dashboard: 'Dashboard',
    projectProgress: 'Progress proyek',
    clientAccess: 'Akses proyek',
    passwordRequestsNav: 'Reset password',
    overview: 'Ringkasan proyek',
    projectStatus: 'Status proyek',
    completedProjects: 'Proyek selesai',
    inProgress: 'Berjalan',
    completed: 'Selesai',
    timeline: 'Timeline proyek',
    photoPreview: 'Preview foto progress',
    noPhotoPreview: 'Foto yang dipilih untuk update akan tampil di sini.',
    noDate: 'Tanggal mulai belum diatur',
    adminDashboard: 'Dashboard admin',
    studioAdmin: 'Admin studio',
    navigation: 'Navigasi',
    viewAllProjects: 'Lihat semua proyek',
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
    startDate: 'Construction start date',
    saveDate: 'Save date',
    savedDate: 'Project start date saved.',
    resetRequests: 'Password reset requests',
    refreshRequests: 'Refresh list',
    noResetRequests: 'No password reset requests.',
    processReset: 'Create new password',
    temporaryPassword: 'New password',
    copyPassword: 'Copy password',
    passwordCopied: 'Password copied.',
    copyFailed: 'Could not copy. Select the password manually.',
    sendWhatsapp: 'Open WhatsApp chat',
    verifyClient: 'Verify the client before sharing this password.',
    duration: 'Construction duration',
    attachmentLabel: 'Progress photos & files',
    attachmentHint: 'Up to 5 files · 20 MB each · JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX, TXT, CSV',
    removeFiles: 'Clear selection',
    dashboard: 'Dashboard',
    projectProgress: 'Project progress',
    clientAccess: 'Project access',
    passwordRequestsNav: 'Password resets',
    overview: 'Project overview',
    projectStatus: 'Project status',
    completedProjects: 'Completed projects',
    inProgress: 'In progress',
    completed: 'Completed',
    timeline: 'Project timeline',
    photoPreview: 'Progress photo preview',
    noPhotoPreview: 'Photos selected for the update will appear here.',
    noDate: 'Start date not set',
    adminDashboard: 'Admin dashboard',
    studioAdmin: 'Studio admin',
    navigation: 'Navigation',
    viewAllProjects: 'View all projects',
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
    startDate: '施工开始日期',
    saveDate: '保存日期',
    savedDate: '项目开始日期已保存。',
    resetRequests: '密码重置请求',
    refreshRequests: '刷新列表',
    noResetRequests: '暂无密码重置请求。',
    processReset: '生成新密码',
    temporaryPassword: '新密码',
    copyPassword: '复制密码',
    passwordCopied: '密码已复制。',
    copyFailed: '无法复制，请手动选择密码。',
    sendWhatsapp: '打开 WhatsApp 聊天',
    verifyClient: '发送密码前请先核实客户身份。',
    duration: '施工时长',
    attachmentLabel: '进度照片和文件',
    attachmentHint: '最多 5 个文件 · 每个 20 MB · JPG、PNG、WEBP、PDF、DOC、DOCX、XLSX、TXT、CSV',
    removeFiles: '清除所选文件',
    dashboard: '仪表板',
    projectProgress: '项目进度',
    clientAccess: '项目访问',
    passwordRequestsNav: '密码重置',
    overview: '项目概览',
    projectStatus: '项目状态',
    completedProjects: '已完成项目',
    inProgress: '进行中',
    completed: '已完成',
    timeline: '项目时间线',
    photoPreview: '进度照片预览',
    noPhotoPreview: '所选更新照片将在此显示。',
    noDate: '未设置开始日期',
    adminDashboard: '管理员仪表板',
    studioAdmin: '工作室管理员',
    navigation: '导航',
    viewAllProjects: '查看所有项目',
  },
} as const;

const ACCEPTED_FILES = '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xlsx,.txt,.csv';
const heroImage = new URL('../1.jpeg', import.meta.url).href;
const logoImage = new URL('../LInier-logo-transparent.png', import.meta.url).href;

interface IssuedPassword {
  password: string;
  resetRequest: {
    request_id: string;
    project_code: string;
    project_name: string;
    client_name: string;
    whatsapp_number: string;
  };
}

async function loadAdminData(): Promise<{ projects: PortalProject[]; requests: PasswordResetRequest[] }> {
  const [projectResult, requestResult] = await Promise.all([
    portalRequest<{ projects: PortalProject[] }>('/api/portal/admin/projects'),
    portalRequest<{ requests: PasswordResetRequest[] }>('/api/portal/admin/password-reset-requests'),
  ]);
  return { projects: projectResult.projects, requests: requestResult.requests };
}

const PortalAdmin: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const t = copy[language];
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordResetRequest[]>([]);
  const [issuedPassword, setIssuedPassword] = useState<IssuedPassword | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<Array<{ name: string; url: string }>>([]);
  const [activeSection, setActiveSection] = useState('admin-dashboard');
  const [isDark, setIsDark] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    const previews = selectedFiles
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setPreviewFiles(previews);
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  useEffect(() => {
    let active = true;
    portalRequest('/api/portal/admin/session')
      .then(async () => {
        const result = await loadAdminData();
        if (active) {
          setProjects(result.projects);
          setPasswordRequests(result.requests);
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
      const result = await loadAdminData();
      setProjects(result.projects);
      setPasswordRequests(result.requests);
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
      setPasswordRequests([]);
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
          startDate: form.get('startDate'),
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

  const saveProjectStartDate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await portalRequest<{ project: PortalProject }>('/api/portal/admin/projects', {
        method: 'PATCH',
        body: JSON.stringify({
          projectId: form.get('projectId'),
          startDate: form.get('startDate'),
        }),
      });
      setProjects((current) => current.map((project) => project.id === result.project.id ? result.project : project));
      setNotice(t.savedDate);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tanggal mulai proyek tidak dapat disimpan.');
    } finally {
      setBusy(false);
    }
  };

  const processPasswordReset = async (request: PasswordResetRequest) => {
    const confirmed = window.confirm(
      `${t.verifyClient}\n\n${request.client_name} — ${request.project_code}\n${request.whatsapp_number}`
    );
    if (!confirmed) return;
    setBusy(true);
    setError('');
    setNotice('');
    setIssuedPassword(null);
    try {
      const result = await portalRequest<IssuedPassword>('/api/portal/admin/password-reset-requests', {
        method: 'POST',
        body: JSON.stringify({ requestId: request.id }),
      });
      setPasswordRequests((current) => current.filter((item) => item.id !== request.id));
      setIssuedPassword(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Password sementara tidak dapat dibuat.');
    } finally {
      setBusy(false);
    }
  };

  const refreshPasswordRequests = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await portalRequest<{ requests: PasswordResetRequest[] }>('/api/portal/admin/password-reset-requests');
      setPasswordRequests(result.requests);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Permintaan reset tidak dapat dimuat.');
    } finally {
      setBusy(false);
    }
  };

  const copyIssuedPassword = async () => {
    if (!issuedPassword) return;
    try {
      await navigator.clipboard.writeText(issuedPassword.password);
      setError('');
      setNotice(t.passwordCopied);
    } catch {
      setError(t.copyFailed);
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
  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.progress_percent, 0) / projects.length)
    : 0;
  const completedProjectCount = projects.filter((project) => project.progress_percent === 100).length;
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    setIsDark(nextIsDark);
  };
  const navigation = [
    { id: 'admin-dashboard', label: t.dashboard, icon: <LayoutDashboard size={17} /> },
    { id: 'admin-progress', label: t.projectProgress, icon: <ChartNoAxesColumn size={17} /> },
    { id: 'admin-access', label: t.clientAccess, icon: <FolderOpen size={17} /> },
    { id: 'admin-resets', label: t.passwordRequestsNav, icon: <KeyRound size={17} /> },
  ];

  return (
    <div className={authenticated ? 'min-h-screen bg-[#f3f4f6] text-neutral-900 dark:bg-neutral-950 dark:text-white' : 'min-h-screen bg-[#f4f1ea] px-5 pt-20 pb-24 text-neutral-900 dark:bg-neutral-950 dark:text-white md:pt-24'}>
      {authenticated && !checking && (
        <aside className="z-40 bg-[#171819] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-56 lg:flex-col">
          <div className="border-b border-white/10 px-5 py-5 sm:px-7 lg:px-6 lg:py-7">
            <div className="flex items-center gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden">
                <img src={logoImage} alt="Linier Studio" className="absolute left-1/2 top-1/2 h-40 w-40 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain" />
              </span>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/65">Nusakarya Perkasa</p>
              </div>
            </div>
          </div>
          <p className="hidden px-6 pb-3 pt-7 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35 lg:block">{t.navigation}</p>
          <nav aria-label={t.navigation} className="flex gap-2 overflow-x-auto px-4 py-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-3 lg:py-0">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`flex shrink-0 items-center gap-3 border-l-2 px-3 py-3 text-left text-xs transition-colors lg:w-full ${activeSection === item.id ? 'border-bronze-400 bg-white/10 text-white' : 'border-transparent text-white/55 hover:bg-white/5 hover:text-white'}`}
              >
                {item.icon}<span>{item.label}</span>
                {item.id === 'admin-resets' && passwordRequests.length > 0 && <span className="ml-auto rounded-full bg-bronze-500 px-2 py-0.5 font-mono text-[9px] text-white">{passwordRequests.length}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto hidden border-t border-white/10 p-4 lg:block">
            <Link to="/portal" className="mb-2 flex items-center gap-3 px-3 py-3 text-xs text-white/55 transition-colors hover:text-white"><ArrowDownLeft size={16} />{t.back}</Link>
            <button type="button" onClick={signOut} className="flex w-full items-center gap-3 px-3 py-3 text-xs text-white/55 transition-colors hover:text-white"><LogOut size={16} />{t.signOut}</button>
          </div>
        </aside>
      )}
      <div className={authenticated && !checking ? 'lg:pl-56' : ''}>
        {authenticated && !checking && (
          <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-neutral-200 bg-white/95 px-4 text-neutral-900 backdrop-blur dark:border-white/10 dark:bg-neutral-900/95 dark:text-white sm:px-7 lg:px-10">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">{t.eyebrow}</p>
              <h1 className="mt-1 font-display text-sm font-semibold uppercase leading-tight tracking-wide sm:text-lg">{t.adminDashboard}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-2 border-r border-neutral-200 pr-3 dark:border-white/15 sm:flex">
                {([Language.ID, Language.EN, Language.CN] as const).map((option) => (
                  <button key={option} type="button" onClick={() => setLanguage(option)} className={`font-mono text-[9px] uppercase tracking-wider transition-colors ${language === option ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'}`}>{option}</button>
                ))}
              </div>
              <button type="button" onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} className="flex h-10 w-10 items-center justify-center border border-neutral-200 text-neutral-600 transition-colors hover:border-bronze-500 hover:text-bronze-600 dark:border-white/15 dark:text-neutral-300">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button type="button" onClick={() => scrollToSection('admin-resets')} aria-label={t.passwordRequestsNav} title={t.passwordRequestsNav} className="relative flex h-10 w-10 items-center justify-center border border-neutral-200 text-neutral-600 transition-colors hover:border-bronze-500 hover:text-bronze-600 dark:border-white/15 dark:text-neutral-300">
                <Bell size={17} />
                {passwordRequests.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[8px] text-white">{passwordRequests.length}</span>}
              </button>
              <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-neutral-900 font-mono text-[10px] text-white sm:flex dark:bg-white dark:text-neutral-900">LS</span>
              <span className="hidden text-xs font-medium sm:block">{t.studioAdmin}</span>
              <Link to="/portal" aria-label={t.back} className="inline-flex items-center gap-1 border-l border-neutral-200 pl-3 text-[10px] font-mono uppercase tracking-wider text-neutral-500 transition-colors hover:text-neutral-900 dark:border-white/15 dark:text-neutral-300 sm:pl-4"><span className="hidden sm:inline">{t.back}</span><ArrowUpRight size={13} /></Link>
              <button type="button" onClick={signOut} aria-label={t.signOut} title={t.signOut} className="flex h-10 w-10 items-center justify-center border border-neutral-200 text-neutral-600 transition-colors hover:border-red-400 hover:text-red-600 dark:border-white/15 dark:text-neutral-300 lg:hidden"><LogOut size={16} /></button>
            </div>
          </header>
        )}
        <div className={`mx-auto w-full ${authenticated ? 'max-w-[1600px] px-4 py-6 sm:px-7 lg:px-10' : 'max-w-7xl px-0 sm:px-3 lg:px-0'}`}>
        <header id="admin-dashboard" className="relative mb-8 scroll-mt-24 overflow-hidden bg-neutral-900 p-7 text-white sm:p-10 lg:p-12">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-40" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/80 to-neutral-900/25" />
          <div className="pointer-events-none absolute -right-12 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-20 h-60 w-60 rounded-full border border-bronze-500/30" />
          <div className="relative flex items-center justify-between gap-4">
            {!authenticated && (
              <Link to="/portal" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white">
                <ArrowDownLeft size={14} /> {t.back}
              </Link>
            )}
          </div>
          <div className="relative mt-12 max-w-3xl sm:mt-16">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-bronze-300">{authenticated && selectedProject ? `${t.overview} / ${selectedProject.project_code}` : t.eyebrow}</p>
            <h1 className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-6xl">{authenticated && selectedProject ? selectedProject.project_name : t.title}</h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
              {authenticated && selectedProject
                ? [selectedProject.client_name, selectedProject.location].filter(Boolean).join(' / ')
                : t.subtitle}
            </p>
          </div>
          <div className="relative mt-10 flex items-center gap-3 border-t border-white/10 pt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze-400" /> {t.workspace}
            {authenticated && selectedProject && <span className="ml-auto border border-white/15 px-3 py-1 text-white/75">{selectedProject.progress_percent === 100 ? t.completed : t.inProgress} · {selectedProject.progress_percent}%</span>}
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
            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={<Layers size={17} />} label={t.projectCount} value={projects.length.toString().padStart(2, '0')} />
              <Metric icon={<Send size={17} />} label={t.activeProjects} value={projects.filter((project) => project.progress_percent < 100).length.toString().padStart(2, '0')} />
              <Metric icon={<CheckCircle2 size={17} />} label={t.completedProjects} value={completedProjectCount.toString().padStart(2, '0')} />
              <Metric icon={<ClipboardList size={17} />} label={t.progress} value={`${averageProgress}%`} />
            </div>
            <div className="mb-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <CalendarDays size={17} className="text-bronze-500" />
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{t.overview}</p>
                      <h2 className="mt-1 font-display text-lg font-semibold">{t.timeline}</h2>
                    </div>
                  </div>
                  <button type="button" onClick={() => scrollToSection('admin-access')} className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 transition-colors hover:text-bronze-600">{t.viewAllProjects}<ArrowUpRight size={12} className="ml-1 inline" /></button>
                </div>
                {projects.length === 0 ? (
                  <p className="py-5 text-sm text-neutral-500">{t.emptyProjects}</p>
                ) : (
                  <ol className="space-y-2">
                    {projects.map((project) => (
                      <li key={project.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles([]);
                            setSelectedProjectId(project.id);
                          }}
                          className={`w-full border-l-2 px-4 py-3 text-left transition-colors ${selectedProjectId === project.id ? 'border-bronze-500 bg-bronze-500/[0.06]' : 'border-neutral-200 hover:border-bronze-300 hover:bg-neutral-50 dark:border-white/15 dark:hover:bg-white/[0.03]'}`}
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{project.project_name}</span>
                              <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-neutral-400">{project.project_code} · {project.start_date ? formatAdminDate(project.start_date, language) : t.noDate}</span>
                            </span>
                            <span className="shrink-0 text-right">
                              <span className={`block text-[9px] font-medium ${project.progress_percent === 100 ? 'text-emerald-600' : 'text-bronze-600'}`}>{project.progress_percent === 100 ? t.completed : t.inProgress}</span>
                              <span className="mt-1 block font-mono text-xs">{project.progress_percent}%</span>
                            </span>
                          </span>
                          <span className="mt-3 block h-1 bg-neutral-100 dark:bg-white/10">
                            <span className="block h-full bg-bronze-500" style={{ width: `${project.progress_percent}%` }} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
              <section className="border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <ImagePlus size={17} className="text-bronze-500" />
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{selectedProject?.project_name ?? t.chooseProject}</p>
                      <h2 className="mt-1 font-display text-lg font-semibold">{t.photoPreview}</h2>
                    </div>
                  </div>
                  {selectedFiles.length > 0 && <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">{selectedFiles.length} / 5</span>}
                </div>
                {previewFiles.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {previewFiles.map((file) => (
                      <div key={file.url} className="group relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-white/5">
                        <img src={file.url} alt={file.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-6 text-[9px] text-white">{file.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-40 flex-col items-center justify-center border border-dashed border-neutral-300 px-6 text-center dark:border-white/15">
                    <ImagePlus size={22} className="mb-3 text-neutral-400" />
                    <p className="max-w-xs text-xs leading-5 text-neutral-500">{t.noPhotoPreview}</p>
                  </div>
                )}
              </section>
            </div>
            <section id="admin-resets" className="mb-5 scroll-mt-24 border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
                <KeyRound size={17} className="text-bronze-500" />
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">SECURITY / ACCESS</p>
                  <h2 className="mt-1 font-mono text-xs uppercase tracking-widest">{t.resetRequests}</h2>
                </div>
                <span className="ml-auto font-mono text-xs text-neutral-500">{passwordRequests.length.toString().padStart(2, '0')}</span>
                <button type="button" disabled={busy} onClick={refreshPasswordRequests} aria-label={t.refreshRequests} title={t.refreshRequests} className="flex h-8 w-8 items-center justify-center border border-neutral-200 text-neutral-500 transition-colors hover:border-bronze-500 hover:text-bronze-500 disabled:opacity-50 dark:border-white/15">
                  <RefreshCw size={14} />
                </button>
              </div>
              {passwordRequests.length === 0 ? (
                <p className="text-sm text-neutral-500">{t.noResetRequests}</p>
              ) : (
                <ul className="divide-y divide-neutral-100 dark:divide-white/10">
                  {passwordRequests.map((request) => (
                    <li key={request.id} className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-medium">{request.client_name}<span className="mx-2 text-neutral-300">/</span><span className="font-mono text-xs text-bronze-600 dark:text-bronze-400">{request.project_code}</span></p>
                        <p className="mt-1 text-xs text-neutral-500">{request.project_name} <span className="mx-1">·</span>{request.whatsapp_number}</p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400">{formatAdminDate(request.created_at, language)}</p>
                      </div>
                      <button type="button" disabled={busy} onClick={() => processPasswordReset(request)} className="inline-flex items-center justify-center gap-2 bg-neutral-900 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:opacity-50 dark:bg-white dark:text-neutral-950">
                        <KeyRound size={14} /> {t.processReset}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {issuedPassword && (
              <section role="status" className="mb-5 border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{t.temporaryPassword} / {issuedPassword.resetRequest.project_code}</p>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{issuedPassword.resetRequest.client_name} — {t.verifyClient}</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <code className="block min-w-0 flex-1 select-all break-all border border-emerald-500/20 bg-white px-4 py-3 font-mono text-lg dark:bg-neutral-950">{issuedPassword.password}</code>
                  <button type="button" onClick={copyIssuedPassword} className="inline-flex items-center justify-center gap-2 border border-emerald-700 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-emerald-800 transition-colors hover:bg-emerald-700 hover:text-white dark:text-emerald-300">
                    <Copy size={14} /> {t.copyPassword}
                  </button>
                </div>
                <a
                  href={`https://wa.me/${issuedPassword.resetRequest.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-emerald-700 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-emerald-600"
                >
                  <MessageCircle size={15} /> {t.sendWhatsapp} <ArrowUpRight size={14} />
                </a>
                <button type="button" onClick={() => setIssuedPassword(null)} className="ml-4 font-mono text-[9px] uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                  {language === 'ID' ? 'Tutup' : language === 'CN' ? '关闭' : 'Dismiss'}
                </button>
              </section>
            )}
            <div className="grid scroll-mt-24 items-start gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <section id="admin-access" className="scroll-mt-24 border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
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
                <Field name="startDate" label={t.startDate} type="date" defaultValue={today()} required />
                <Field name="clientPassword" label={t.clientPassword} type="password" required minLength={12} maxLength={256} autoComplete="new-password" />
                <button disabled={busy} className="mt-2 flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:opacity-60 dark:bg-white dark:text-neutral-950">
                  {t.create} <ArrowUpRight size={17} />
                </button>
              </form>
            </section>

            <section id="admin-progress" className="scroll-mt-24 space-y-5">
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
                      <li key={`${project.id}-${project.start_date ?? ''}`} className="py-4 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="min-w-0"><strong className="font-mono text-[10px] text-bronze-600 dark:text-bronze-400">{project.project_code}</strong><span className="mx-2 text-neutral-300">/</span><span className="font-medium">{project.project_name}</span><span className="mt-1 block text-xs text-neutral-500">{project.client_name}</span></span>
                          <span className="w-24 shrink-0">
                            <span className="mb-1 block text-right font-mono text-[10px] text-neutral-500">{project.progress_percent}%</span>
                            <span className="block h-1 bg-neutral-100 dark:bg-white/10"><span className="block h-full bg-bronze-500" style={{ width: `${project.progress_percent}%` }} /></span>
                          </span>
                        </div>
                        <form onSubmit={saveProjectStartDate} className="mt-4 flex flex-wrap items-end gap-3 border-t border-neutral-100 pt-4 dark:border-white/10">
                          <input type="hidden" name="projectId" value={project.id} />
                          <label className="min-w-[180px] flex-1">
                            <span className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-neutral-500"><CalendarDays size={12} />{t.startDate}</span>
                            <input name="startDate" type="date" defaultValue={project.start_date ?? ''} required className="w-full border-b border-neutral-200 bg-transparent py-2 text-xs outline-none focus:border-bronze-500 dark:border-white/15 dark:[color-scheme:dark]" />
                          </label>
                          <button disabled={busy} className="border border-neutral-200 px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors hover:border-bronze-500 disabled:opacity-50 dark:border-white/15">{t.saveDate}</button>
                        </form>
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
        <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</p>
      </div>
      <span className="flex h-10 w-10 items-center justify-center bg-neutral-50 text-neutral-600 dark:bg-white/5 dark:text-neutral-300">{icon}</span>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <p role="alert" className="mb-6 border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-300">{message}</p>;
}

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAdminDate(value: string, language: string): string {
  const locale = language === 'ID' ? 'id-ID' : language === 'CN' ? 'zh-CN' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function today(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default PortalAdmin;
