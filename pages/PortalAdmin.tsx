import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, ChartNoAxesColumn, Check, CheckCircle2, ClipboardList, Copy, FileText, FolderOpen, ImagePlus, KeyRound, Layers, LayoutDashboard, LogOut, Mail, MapPin, MessageCircle, Moon, Phone, Plus, RefreshCw, Send, Sun, Trash2, Upload, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { portalRequest, type PasswordResetRequest, type PortalAttachment, type PortalProject, type PortalUpdate } from '../lib/portalApi';
import { Language } from '../types';

const copy = {
  ID: {
    eyebrow: 'LINIER STUDIO / ADMIN',
    title: 'Kelola progress proyek.',
    subtitle: 'Masuk untuk membuat akses klien dan membagikan update harian.',
    email: 'Email admin/staf',
    password: 'Password admin/staf',
    forgotPassword: 'Lupa password admin?',
    forgotPasswordHint: 'Untuk admin, ubah PORTAL_ADMIN_PASSWORD; untuk staf, ubah PORTAL_STAFF_PASSWORD di Environment Variables Vercel, lalu redeploy.',
    contact: 'Kontak',
    services: 'Jenis layanan',
    signIn: 'Masuk',
    signOut: 'Keluar',
    projects: 'Daftar proyek',
    createProject: 'Buat akses proyek',
    projectCode: 'ID Proyek',
    projectName: 'Nama proyek',
    clientName: 'Nama klien',
    clientEmail: 'Email klien',
    noClientEmail: 'Email login belum diatur',
    location: 'Lokasi',
    clientPassword: 'Password ID proyek (min. 12 karakter)',
    clientLoginPassword: 'Password akun email klien',
    accountPasswordHint: 'Akun email baru perlu password minimal 12 karakter. Semua proyek dengan email yang sama memakai password email ini; password ID proyek tetap terpisah.',
    clientEmailEditHint: 'Password akun email tidak berubah. Email yang sudah terhubung ke akun dengan password berbeda tidak dapat dipakai.',
    saveClientAccount: 'Simpan akun klien',
    savedClientAccount: 'Akun email klien berhasil disimpan.',
    create: 'Buat proyek',
    newUpdate: 'Update progress',
    chooseProject: 'Pilih proyek',
    titleField: 'Judul update',
    description: 'Catatan progress',
    progress: 'Progress (%)',
    date: 'Tanggal update',
    publish: 'Terbitkan update',
    savedProject: 'Proyek berhasil dibuat. Simpan password ID proyek dan password akun email secara aman; keduanya tidak dapat ditampilkan kembali.',
    savedUpdate: 'Update berhasil diterbitkan.',
    savedEdit: 'Update berhasil diperbarui.',
    refreshFailed: 'Update tersimpan, tetapi daftar gagal dimuat ulang. Muat ulang halaman.',
    fileCleanupWarning: 'Update tersimpan, tetapi file yang dihapus dari daftar gagal dibersihkan dari penyimpanan.',
    deleteUpdate: 'Hapus update',
    deletingUpdate: 'Menghapus...',
    confirmDeleteUpdate: 'Hapus update progress ini beserta semua foto dan file lampirannya? Tindakan ini tidak dapat dibatalkan.',
    deletedUpdate: 'Update progress dan lampirannya berhasil dihapus.',
    deleteFailed: 'Update progress tidak dapat dihapus.',
    deleteRefreshFailed: 'Update sudah dihapus, tetapi daftar proyek gagal dimuat ulang. Muat ulang halaman.',
    deleteFileCleanupWarning: 'Update terhapus, tetapi sebagian file lampiran gagal dibersihkan dari penyimpanan.',
    deleteProject: 'Hapus proyek',
    deletingProject: 'Menghapus proyek...',
    confirmDeleteProject: 'Hapus proyek ini beserta semua riwayat progress, foto, file lampiran, dan akses login klien? Tindakan ini tidak dapat dibatalkan.',
    deletedProject: 'Proyek beserta riwayat progress dan aksesnya berhasil dihapus.',
    deleteProjectFailed: 'Proyek tidak dapat dihapus.',
    deleteProjectRefreshFailed: 'Proyek terhapus, tetapi daftar proyek gagal dimuat ulang. Muat ulang halaman.',
    deleteProjectFileCleanupWarning: 'Proyek terhapus, tetapi sebagian file lampiran gagal dibersihkan dari penyimpanan.',
    editUpdate: 'Edit update',
    editingUpdate: 'Sedang mengedit',
    cancelEdit: 'Batalkan edit',
    saveChanges: 'Simpan perubahan',
    previousUpdates: 'Riwayat update',
    noPreviousUpdates: 'Belum ada update untuk proyek ini.',
    existingAttachments: 'File pada update ini',
    removeAttachment: 'Hapus file',
    attachmentsCount: 'file',
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
    projectPasswordReset: 'Password ID proyek',
    emailPasswordReset: 'Password akun email',
    copyPassword: 'Salin password',
    passwordCopied: 'Password disalin.',
    copyFailed: 'Tidak dapat menyalin. Pilih password secara manual.',
    sendWhatsapp: 'Buka chat WhatsApp',
    verifyClient: 'Pastikan identitas klien sebelum mengirim password ini.',
    duration: 'Durasi pembangunan',
    attachmentLabel: 'Lampiran progress',
    photo: 'Foto progress',
    progressFiles: 'File progress',
    photoHint: 'JPG, PNG, WEBP · Maksimal 5 lampiran gabungan per update.',
    documentHint: 'PDF, DOC, DOCX, XLSX, TXT, CSV · Maksimal 5 lampiran gabungan per update.',
    choosePhotos: 'Pilih foto',
    chooseProgressFiles: 'Pilih file progress',
    invalidPhoto: 'Pilih foto berformat JPG, PNG, atau WEBP.',
    invalidProgressFile: 'Pilih file PDF, DOC, DOCX, XLSX, TXT, atau CSV.',
    fileCountLimit: 'Maksimal 5 lampiran untuk satu update.',
    fileSizeLimit: 'Ukuran setiap file maksimal 20 MB.',
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
    studioStaff: 'Staf studio',
    navigation: 'Navigasi',
    viewAllProjects: 'Lihat semua proyek',
  },
  EN: {
    eyebrow: 'LINIER STUDIO / ADMIN',
    title: 'Manage project progress.',
    subtitle: 'Sign in to create client access and share daily updates.',
    email: 'Admin/staff email',
    password: 'Admin/staff password',
    forgotPassword: 'Forgot admin password?',
    forgotPasswordHint: 'For admins, update PORTAL_ADMIN_PASSWORD; for staff, update PORTAL_STAFF_PASSWORD in Vercel Environment Variables, then redeploy.',
    contact: 'Contact',
    services: 'Our services',
    signIn: 'Sign in',
    signOut: 'Sign out',
    projects: 'Projects',
    createProject: 'Create project access',
    projectCode: 'Project ID',
    projectName: 'Project name',
    clientName: 'Client name',
    clientEmail: 'Client email',
    noClientEmail: 'Email login not set',
    location: 'Location',
    clientPassword: 'Project ID password (min. 12 characters)',
    clientLoginPassword: 'Client email account password',
    accountPasswordHint: 'New email accounts need a password of at least 12 characters. All projects with the same email use this email password; Project ID passwords remain separate.',
    clientEmailEditHint: 'The email account password stays unchanged. An email linked to an account with a different password cannot be used.',
    saveClientAccount: 'Save client account',
    savedClientAccount: 'Client email login saved.',
    create: 'Create project',
    newUpdate: 'Progress update',
    chooseProject: 'Choose a project',
    titleField: 'Update title',
    description: 'Progress notes',
    progress: 'Progress (%)',
    date: 'Update date',
    publish: 'Publish update',
    savedProject: 'Project created. Store the Project ID password and email account password securely; they cannot be shown again.',
    savedUpdate: 'Update published.',
    savedEdit: 'Update saved.',
    refreshFailed: 'The update was saved, but the list could not be refreshed. Reload the page.',
    fileCleanupWarning: 'The update was saved, but a removed file could not be deleted from storage.',
    deleteUpdate: 'Delete update',
    deletingUpdate: 'Deleting...',
    confirmDeleteUpdate: 'Delete this progress update and all its attached photos and files? This cannot be undone.',
    deletedUpdate: 'Progress update and its attachments deleted.',
    deleteFailed: 'The progress update could not be deleted.',
    deleteRefreshFailed: 'The update was deleted, but project data could not be refreshed. Reload the page.',
    deleteFileCleanupWarning: 'The update was deleted, but some attachments could not be removed from storage.',
    deleteProject: 'Delete project',
    deletingProject: 'Deleting project...',
    confirmDeleteProject: 'Delete this project and all progress history, photos, attachments, and client login access? This cannot be undone.',
    deletedProject: 'Project, progress history, and access deleted.',
    deleteProjectFailed: 'The project could not be deleted.',
    deleteProjectRefreshFailed: 'The project was deleted, but the project list could not be refreshed. Reload the page.',
    deleteProjectFileCleanupWarning: 'The project was deleted, but some attachments could not be removed from storage.',
    editUpdate: 'Edit update',
    editingUpdate: 'Editing',
    cancelEdit: 'Cancel edit',
    saveChanges: 'Save changes',
    previousUpdates: 'Update history',
    noPreviousUpdates: 'There are no updates for this project yet.',
    existingAttachments: 'Files on this update',
    removeAttachment: 'Remove file',
    attachmentsCount: 'files',
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
    projectPasswordReset: 'Project ID password',
    emailPasswordReset: 'Email account password',
    copyPassword: 'Copy password',
    passwordCopied: 'Password copied.',
    copyFailed: 'Could not copy. Select the password manually.',
    sendWhatsapp: 'Open WhatsApp chat',
    verifyClient: 'Verify the client before sharing this password.',
    duration: 'Construction duration',
    attachmentLabel: 'Progress attachments',
    photo: 'Progress photos',
    progressFiles: 'Progress files',
    photoHint: 'JPG, PNG, WEBP · Up to 5 combined attachments per update.',
    documentHint: 'PDF, DOC, DOCX, XLSX, TXT, CSV · Up to 5 combined attachments per update.',
    choosePhotos: 'Choose photos',
    chooseProgressFiles: 'Choose progress files',
    invalidPhoto: 'Choose JPG, PNG, or WEBP photos.',
    invalidProgressFile: 'Choose PDF, DOC, DOCX, XLSX, TXT, or CSV files.',
    fileCountLimit: 'Choose no more than 5 attachments per update.',
    fileSizeLimit: 'Each file must be 20 MB or smaller.',
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
    studioStaff: 'Studio staff',
    navigation: 'Navigation',
    viewAllProjects: 'View all projects',
  },
  CN: {
    eyebrow: 'LINIER STUDIO / 管理',
    title: '管理项目进度。',
    subtitle: '登录以创建客户访问权限并发布每日更新。',
    email: '管理员/员工邮箱',
    password: '管理员/员工密码',
    forgotPassword: '忘记管理员密码？',
    forgotPasswordHint: '管理员请更新 PORTAL_ADMIN_PASSWORD；员工请更新 PORTAL_STAFF_PASSWORD，然后重新部署。',
    contact: '联系我们',
    services: '服务类型',
    signIn: '登录',
    signOut: '退出',
    projects: '项目列表',
    createProject: '创建项目访问权限',
    projectCode: '项目编号',
    projectName: '项目名称',
    clientName: '客户名称',
    clientEmail: '客户邮箱',
    noClientEmail: '尚未设置登录邮箱',
    location: '地点',
    clientPassword: '项目编号密码（至少 12 个字符）',
    clientLoginPassword: '客户邮箱账号密码',
    accountPasswordHint: '新邮箱账号密码至少 12 个字符。同一邮箱的所有项目共用此邮箱密码；项目编号密码保持独立。',
    clientEmailEditHint: '邮箱账号密码保持不变。目标邮箱若已关联不同密码的账号，则无法使用。',
    saveClientAccount: '保存客户账号',
    savedClientAccount: '客户邮箱登录已保存。',
    create: '创建项目',
    newUpdate: '进度更新',
    chooseProject: '选择项目',
    titleField: '更新标题',
    description: '进度记录',
    progress: '进度（%）',
    date: '更新日期',
    publish: '发布更新',
    savedProject: '项目已创建。请妥善保存项目编号密码和邮箱账号密码；密码无法再次显示。',
    savedUpdate: '更新已发布。',
    savedEdit: '更新已保存。',
    refreshFailed: '更新已保存，但列表无法刷新。请重新加载页面。',
    fileCleanupWarning: '更新已保存，但已移除的文件无法从存储中清理。',
    deleteUpdate: '删除更新',
    deletingUpdate: '正在删除...',
    confirmDeleteUpdate: '删除此进度更新及其所有照片和文件附件？此操作无法撤销。',
    deletedUpdate: '进度更新及其附件已删除。',
    deleteFailed: '无法删除此进度更新。',
    deleteRefreshFailed: '更新已删除，但项目数据无法刷新。请重新加载页面。',
    deleteFileCleanupWarning: '更新已删除，但部分附件无法从存储中清理。',
    deleteProject: '删除项目',
    deletingProject: '正在删除项目...',
    confirmDeleteProject: '删除此项目及其所有进度记录、照片、附件和客户登录权限？此操作无法撤销。',
    deletedProject: '项目、进度记录和访问权限已删除。',
    deleteProjectFailed: '无法删除此项目。',
    deleteProjectRefreshFailed: '项目已删除，但项目列表无法刷新。请重新加载页面。',
    deleteProjectFileCleanupWarning: '项目已删除，但部分附件无法从存储中清理。',
    editUpdate: '编辑更新',
    editingUpdate: '正在编辑',
    cancelEdit: '取消编辑',
    saveChanges: '保存更改',
    previousUpdates: '更新记录',
    noPreviousUpdates: '此项目暂无更新。',
    existingAttachments: '此更新中的文件',
    removeAttachment: '删除文件',
    attachmentsCount: '个文件',
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
    projectPasswordReset: '项目编号密码',
    emailPasswordReset: '邮箱账号密码',
    copyPassword: '复制密码',
    passwordCopied: '密码已复制。',
    copyFailed: '无法复制，请手动选择密码。',
    sendWhatsapp: '打开 WhatsApp 聊天',
    verifyClient: '发送密码前请先核实客户身份。',
    duration: '施工时长',
    attachmentLabel: '进度附件',
    photo: '进度照片',
    progressFiles: '进度文件',
    photoHint: 'JPG、PNG、WEBP · 每次更新最多 5 个附件。',
    documentHint: 'PDF、DOC、DOCX、XLSX、TXT、CSV · 每次更新最多 5 个附件。',
    choosePhotos: '选择照片',
    chooseProgressFiles: '选择进度文件',
    invalidPhoto: '请选择 JPG、PNG 或 WEBP 格式的照片。',
    invalidProgressFile: '请选择 PDF、DOC、DOCX、XLSX、TXT 或 CSV 文件。',
    fileCountLimit: '每次更新最多可上传 5 个附件。',
    fileSizeLimit: '每个文件最大 20 MB。',
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
    studioStaff: '工作室员工',
    navigation: '导航',
    viewAllProjects: '查看所有项目',
  },
} as const;

const ACCEPTED_IMAGES = '.jpg,.jpeg,.png,.webp';
const ACCEPTED_DOCUMENTS = '.pdf,.doc,.docx,.xlsx,.txt,.csv';
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];
const heroImage = new URL('../1.jpeg', import.meta.url).href;
const logoImage = new URL('../LInier-logo-transparent.png', import.meta.url).href;
type AdminRole = 'admin' | 'staff';

interface IssuedPassword {
  password: string;
  resetRequest: {
    request_id: string;
    project_code: string;
    project_name: string;
    client_name: string;
    client_email: string | null;
    credential_type: 'project' | 'account';
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

async function loadAdminUpdates(projectId: string): Promise<PortalUpdate[]> {
  const result = await portalRequest<{ updates: PortalUpdate[] }>(
    `/api/portal/admin/updates?projectId=${encodeURIComponent(projectId)}`
  );
  return result.updates;
}

const PortalAdmin: React.FC = () => {
  const { language, setLanguage, t: siteT } = useLanguage();
  const t = copy[language];
  const [authenticated, setAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordResetRequest[]>([]);
  const [issuedPassword, setIssuedPassword] = useState<IssuedPassword | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [adminUpdates, setAdminUpdates] = useState<PortalUpdate[]>([]);
  const [editingUpdateId, setEditingUpdateId] = useState('');
  const [editingAttachments, setEditingAttachments] = useState<PortalAttachment[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<Array<{ name: string; url: string }>>([]);
  const [activeSection, setActiveSection] = useState('admin-dashboard');
  const [isDark, setIsDark] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const documentInputRef = React.useRef<HTMLInputElement>(null);

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
    portalRequest<{ role: AdminRole }>('/api/portal/admin/session')
      .then(async ({ role }) => {
        const result = await loadAdminData();
        if (active) {
          setProjects(result.projects);
          setPasswordRequests(result.requests);
          setSelectedProjectId(result.projects[0]?.id ?? '');
          setAdminRole(role);
          setActiveSection('admin-dashboard');
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

  useEffect(() => {
    let active = true;
    if (!authenticated || !selectedProjectId) {
      setAdminUpdates([]);
      return () => { active = false; };
    }

    loadAdminUpdates(selectedProjectId)
      .then((updates) => {
        if (active) setAdminUpdates(updates);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Riwayat update tidak dapat dimuat.');
        }
      });
    return () => { active = false; };
  }, [authenticated, selectedProjectId]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { role } = await portalRequest<{ role: AdminRole }>('/api/portal/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const result = await loadAdminData();
      setProjects(result.projects);
      setPasswordRequests(result.requests);
      setSelectedProjectId(result.projects[0]?.id ?? '');
      setAdminRole(role);
      setAuthenticated(true);
      setAdminEmail('');
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
      setAdminRole(null);
      setActiveSection('admin-dashboard');
      setProjects([]);
      setPasswordRequests([]);
      setSelectedProjectId('');
      setAdminUpdates([]);
      setEditingUpdateId('');
      setEditingAttachments([]);
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
          clientEmail: form.get('clientEmail'),
          location: form.get('location'),
          startDate: form.get('startDate'),
          projectPassword: form.get('clientPassword'),
          clientLoginPassword: form.get('clientLoginPassword'),
        }),
      });
      setProjects((current) => [result.project, ...current]);
      setSelectedProjectId(result.project.id);
      setEditingUpdateId('');
      setEditingAttachments([]);
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

  const saveClientAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await portalRequest<{ project: PortalProject }>('/api/portal/admin/projects', {
        method: 'PATCH',
        body: JSON.stringify({
          projectId: form.get('projectId'),
          clientEmail: form.get('clientEmail'),
        }),
      });
      setProjects((current) => current.map((project) => project.id === result.project.id ? result.project : project));
      setNotice(t.savedClientAccount);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Akun email klien tidak dapat disimpan.');
    } finally {
      setBusy(false);
    }
  };

  const processPasswordReset = async (request: PasswordResetRequest) => {
    const resetType = request.credential_type === 'account' ? t.emailPasswordReset : t.projectPasswordReset;
    const resetIdentifier = request.credential_type === 'account' ? request.client_email ?? request.project_code : request.project_code;
    const confirmed = window.confirm(
      `${t.verifyClient}\n\n${request.client_name} — ${resetType}: ${resetIdentifier}\n${request.whatsapp_number}`
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

  const submitProgressUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const updateToEdit = editingUpdateId
      ? adminUpdates.find((update) => update.id === editingUpdateId)
      : undefined;
    if (editingUpdateId && !updateToEdit) {
      setError('Update yang dipilih tidak lagi tersedia. Muat ulang riwayat update.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');
    const form = new FormData(formElement);
    const uploadedPaths: string[] = [];
    const removedPaths = (updateToEdit?.attachments ?? [])
      .filter((attachment) => !editingAttachments.some((item) => item.path === attachment.path))
      .map((attachment) => attachment.path);
    let updateSaved = false;
    try {
      const attachments: PortalAttachment[] = updateToEdit
        ? editingAttachments.map(({ path, name, contentType, size }) => ({ path, name, contentType, size }))
        : [];
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
        method: updateToEdit ? 'PATCH' : 'POST',
        body: JSON.stringify({
          ...(updateToEdit ? { updateId: updateToEdit.id } : {}),
          projectId: selectedProjectId,
          title: form.get('title'),
          description: form.get('description'),
          progressPercent: Number(form.get('progressPercent')),
          updateDate: form.get('updateDate'),
          attachments,
        }),
      });
      updateSaved = true;
      if (removedPaths.length > 0) {
        try {
          await portalRequest('/api/portal/admin/uploads', {
            method: 'DELETE',
            body: JSON.stringify({ paths: removedPaths }),
          });
        } catch {
          setError(t.fileCleanupWarning);
        }
      }

      const [projectResult, updates] = await Promise.all([
        portalRequest<{ projects: PortalProject[] }>('/api/portal/admin/projects'),
        loadAdminUpdates(selectedProjectId),
      ]);
      setProjects(projectResult.projects);
      setAdminUpdates(updates);
      setNotice(updateToEdit ? t.savedEdit : t.savedUpdate);
      formElement.reset();
      setSelectedFiles([]);
      setEditingUpdateId('');
      setEditingAttachments([]);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (documentInputRef.current) documentInputRef.current.value = '';
      const dateInput = formElement.elements.namedItem('updateDate');
      if (dateInput instanceof HTMLInputElement) dateInput.value = today();
    } catch (cause) {
      let message = cause instanceof Error ? cause.message : 'Update tidak dapat diterbitkan.';
      if (updateSaved) {
        message = t.refreshFailed;
      } else if (uploadedPaths.length > 0) {
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

  const handleProgressFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    category: 'photo' | 'document'
  ) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    const acceptedTypes = category === 'photo' ? IMAGE_TYPES : DOCUMENT_TYPES;
    if (files.some((file) => !acceptedTypes.includes(file.type))) {
      setError(category === 'photo' ? t.invalidPhoto : t.invalidProgressFile);
      return;
    }
    if (files.some((file) => file.size > 20 * 1024 * 1024)) {
      setError(t.fileSizeLimit);
      return;
    }

    const combinedFiles = [...selectedFiles, ...files];
    if (editingAttachments.length + combinedFiles.length > 5) {
      setError(t.fileCountLimit);
      return;
    }

    setError('');
    setSelectedFiles(combinedFiles);
  };

  const deleteProgressUpdate = async (update: PortalUpdate) => {
    if (!window.confirm(t.confirmDeleteUpdate)) return;

    setBusy(true);
    setError('');
    setNotice('');
    let deletionCompleted = false;
    try {
      const result = await portalRequest<{ deleted: boolean; cleanupFailed: boolean }>('/api/portal/admin/updates', {
        method: 'DELETE',
        body: JSON.stringify({ updateId: update.id }),
      });
      if (!result.deleted) throw new Error(t.deleteFailed);
      deletionCompleted = true;
      setNotice(t.deletedUpdate);

      if (editingUpdateId === update.id) {
        setEditingUpdateId('');
        setEditingAttachments([]);
        setSelectedFiles([]);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (documentInputRef.current) documentInputRef.current.value = '';
      }

      const [projectResult, updates] = await Promise.all([
        portalRequest<{ projects: PortalProject[] }>('/api/portal/admin/projects'),
        loadAdminUpdates(selectedProjectId),
      ]);
      setProjects(projectResult.projects);
      setAdminUpdates(updates);
      if (result.cleanupFailed) setError(t.deleteFileCleanupWarning);
    } catch (cause) {
      setError(deletionCompleted
        ? t.deleteRefreshFailed
        : cause instanceof Error ? cause.message : t.deleteFailed);
    } finally {
      setBusy(false);
    }
  };

  const deleteProject = async (project: PortalProject) => {
    const confirmed = window.confirm(
      `${t.confirmDeleteProject}\n\n${project.project_name} (${project.project_code})`
    );
    if (!confirmed) return;

    setBusy(true);
    setError('');
    setNotice('');
    let deletionCompleted = false;
    let cleanupFailed = false;
    try {
      const result = await portalRequest<{ deleted: boolean; cleanupFailed: boolean }>('/api/portal/admin/projects', {
        method: 'DELETE',
        body: JSON.stringify({ projectId: project.id }),
      });
      if (!result.deleted) throw new Error(t.deleteProjectFailed);
      deletionCompleted = true;
      cleanupFailed = result.cleanupFailed;

      if (selectedProjectId === project.id) {
        setAdminUpdates([]);
        setEditingUpdateId('');
        setEditingAttachments([]);
        setSelectedFiles([]);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (documentInputRef.current) documentInputRef.current.value = '';
      }

      const { projects: refreshedProjects } = await portalRequest<{ projects: PortalProject[] }>('/api/portal/admin/projects');
      setProjects(refreshedProjects);
      const nextProject = refreshedProjects.find((item) => item.id === selectedProjectId) ?? refreshedProjects[0];
      setSelectedProjectId(nextProject?.id ?? '');
      setNotice(t.deletedProject);
      if (cleanupFailed) setError(t.deleteProjectFileCleanupWarning);
    } catch (cause) {
      setError(deletionCompleted
        ? `${t.deleteProjectRefreshFailed}${cleanupFailed ? ` ${t.deleteProjectFileCleanupWarning}` : ''}`
        : cause instanceof Error ? cause.message : t.deleteProjectFailed);
    } finally {
      setBusy(false);
    }
  };

  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const selectedUpdate = adminUpdates.find((update) => update.id === editingUpdateId);
  const existingPhotos = editingAttachments.filter((attachment) => attachment.contentType.startsWith('image/'));
  const existingDocuments = editingAttachments.filter((attachment) => !attachment.contentType.startsWith('image/'));
  const selectedPhotos = selectedFiles.filter((file) => file.type.startsWith('image/'));
  const selectedDocuments = selectedFiles.filter((file) => !file.type.startsWith('image/'));
  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.progress_percent, 0) / projects.length)
    : 0;
  const completedProjectCount = projects.filter((project) => project.progress_percent === 100).length;
  const openAdminPage = (sectionId: string) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  ].filter((item) => adminRole !== 'staff' || item.id !== 'admin-access');
  const activePageTitle = activeSection === 'admin-dashboard'
    ? t.adminDashboard
    : navigation.find((item) => item.id === activeSection)?.label ?? t.adminDashboard;

  return (
    <div className={authenticated ? 'min-h-screen bg-[#f1efe9] text-neutral-900 dark:bg-neutral-950 dark:text-white' : 'min-h-screen bg-[#f1efe9] px-5 pt-20 pb-24 text-neutral-900 dark:bg-neutral-950 dark:text-white md:pt-24'}>
      {authenticated && !checking && (
        <aside className="z-40 bg-[#272925] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 lg:flex-col">
          <div className="border-b border-white/10 px-5 py-5 sm:px-7 lg:px-6 lg:py-7">
            <div className="flex items-center gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden">
                <img src={logoImage} alt="Linier Studio" className="absolute left-1/2 top-1/2 h-40 w-40 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain" />
              </span>
              <div>
                <p className="text-sm font-medium tracking-wide">Linier Studio</p>
                <p className="mt-1 text-[10px] text-white/50">{t.workspace}</p>
              </div>
            </div>
          </div>
          <p className="hidden px-6 pb-3 pt-7 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35 lg:block">{t.navigation}</p>
          <nav aria-label={t.navigation} className="flex gap-2 overflow-x-auto px-4 py-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-3 lg:py-0">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openAdminPage(item.id)}
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
      <div className={authenticated && !checking ? 'lg:pl-60' : ''}>
        {authenticated && !checking && (
          <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-[#ded9cf] bg-[#f7f5ef]/95 px-4 text-neutral-900 backdrop-blur dark:border-white/10 dark:bg-neutral-900/95 dark:text-white sm:px-7 lg:px-10">
            <div className="min-w-0">
              <p className="text-[11px] text-neutral-500">{t.eyebrow}</p>
              <h1 className="mt-1 font-display text-base font-medium leading-tight tracking-tight sm:text-xl">{activePageTitle}</h1>
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
              <button type="button" onClick={() => openAdminPage('admin-resets')} aria-label={t.passwordRequestsNav} title={t.passwordRequestsNav} className="relative flex h-10 w-10 items-center justify-center border border-neutral-200 text-neutral-600 transition-colors hover:border-bronze-500 hover:text-bronze-600 dark:border-white/15 dark:text-neutral-300">
                <Bell size={17} />
                {passwordRequests.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[8px] text-white">{passwordRequests.length}</span>}
              </button>
              <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-neutral-900 font-mono text-[10px] text-white sm:flex dark:bg-white dark:text-neutral-900">LS</span>
              <span className="hidden text-xs font-medium sm:block">{adminRole === 'staff' ? t.studioStaff : t.studioAdmin}</span>
              <Link to="/portal" aria-label={t.back} className="inline-flex items-center gap-1 border-l border-neutral-200 pl-3 text-[10px] font-mono uppercase tracking-wider text-neutral-500 transition-colors hover:text-neutral-900 dark:border-white/15 dark:text-neutral-300 sm:pl-4"><span className="hidden sm:inline">{t.back}</span><ArrowUpRight size={13} /></Link>
              <button type="button" onClick={signOut} aria-label={t.signOut} title={t.signOut} className="flex h-10 w-10 items-center justify-center border border-neutral-200 text-neutral-600 transition-colors hover:border-red-400 hover:text-red-600 dark:border-white/15 dark:text-neutral-300 lg:hidden"><LogOut size={16} /></button>
            </div>
          </header>
        )}
        <div className={`mx-auto w-full ${authenticated ? 'max-w-[1600px] px-4 py-6 sm:px-7 lg:px-10' : 'max-w-7xl px-0 sm:px-3 lg:px-0'}`}>
        {(!authenticated || activeSection === 'admin-dashboard') && <header id="admin-dashboard" className="relative mb-8 scroll-mt-24 overflow-hidden bg-neutral-900 p-7 text-white sm:p-10 lg:p-12">
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
            <p className="mb-4 text-xs text-white/70">{authenticated && selectedProject ? `${t.overview} / ${selectedProject.project_code}` : t.eyebrow}</p>
            <h1 className="font-display text-4xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-6xl">{authenticated && selectedProject ? selectedProject.project_name : t.title}</h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
              {authenticated && selectedProject
                ? [selectedProject.client_name, selectedProject.location].filter(Boolean).join(' / ')
                : t.subtitle}
            </p>
          </div>
          <div className="relative mt-10 flex items-center gap-3 border-t border-white/15 pt-5 text-xs text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze-400" /> {t.workspace}
            {authenticated && selectedProject && <span className="ml-auto border border-white/15 px-3 py-1 text-white/75">{selectedProject.progress_percent === 100 ? t.completed : t.inProgress} · {selectedProject.progress_percent}%</span>}
          </div>
        </header>}

        {error && <ErrorBanner message={error} />}
        {notice && <p role="status" className="mb-6 flex items-start gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"><Check size={17} className="mt-0.5 shrink-0" />{notice}</p>}

        {checking ? (
          <p className="py-16 text-center font-mono text-xs uppercase tracking-widest text-neutral-500">...</p>
        ) : !authenticated ? (
          <form onSubmit={signIn} className="mx-auto max-w-xl border border-[#d9d4c9] bg-[#fbfaf6] p-6 sm:p-10 dark:border-white/10 dark:bg-neutral-900">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center border border-[#d9d4c9] text-neutral-600 dark:border-white/15 dark:text-neutral-300"><KeyRound size={18} strokeWidth={1.5} /></span>
              <span>
                <span className="block text-xs text-neutral-500">Linier Studio</span>
                <span className="mt-1 block font-display text-xl font-medium">{t.signIn}</span>
              </span>
            </div>
            <label className="mb-6 block">
              <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.email}</span>
              <input name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} required maxLength={254} className="w-full border border-[#d9d4c9] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-neutral-700 focus:ring-2 focus:ring-neutral-900/5 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-white/50" />
            </label>
            <label className="mb-2 block">
              <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.password}</span>
              <input name="password" type="password" autoComplete="current-password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} required maxLength={256} className="w-full border border-[#d9d4c9] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-neutral-700 focus:ring-2 focus:ring-neutral-900/5 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-white/50" />
            </label>
            <button disabled={busy} className="mt-6 flex w-full items-center justify-between bg-[#272925] px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-[#45483e] disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
              {busy ? '...' : t.signIn} <ArrowUpRight size={17} />
            </button>
            <details className="mt-6 border-t border-[#e4e0d7] pt-4 text-xs dark:border-white/10">
              <summary className="w-fit cursor-pointer text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white">{t.forgotPassword}</summary>
              <p className="mt-3 leading-6 text-neutral-500">{t.forgotPasswordHint}</p>
            </details>
          </form>
        ) : (
          <>
            {activeSection === 'admin-dashboard' && (
              <>
            <div className="mb-7 grid grid-cols-2 gap-px border-y border-[#d9d4c9] bg-[#d9d4c9] sm:grid-cols-4 dark:border-white/10 dark:bg-white/10">
              <Metric icon={<Layers size={17} />} label={t.projectCount} value={projects.length.toString().padStart(2, '0')} />
              <Metric icon={<Send size={17} />} label={t.activeProjects} value={projects.filter((project) => project.progress_percent < 100).length.toString().padStart(2, '0')} />
              <Metric icon={<CheckCircle2 size={17} />} label={t.completedProjects} value={completedProjectCount.toString().padStart(2, '0')} />
              <Metric icon={<ClipboardList size={17} />} label={t.progress} value={`${averageProgress}%`} />
            </div>
            <div className="mb-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="border border-[#ded9cf] bg-[#fbfaf6] p-5 sm:p-6 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <CalendarDays size={17} className="text-bronze-500" />
                    <div>
                      <p className="text-xs text-neutral-500">{t.overview}</p>
                      <h2 className="mt-1 font-display text-xl font-medium">{t.timeline}</h2>
                    </div>
                  </div>
                  <button type="button" onClick={() => openAdminPage('admin-progress')} className="text-xs text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white">{t.viewAllProjects}<ArrowUpRight size={12} className="ml-1 inline" /></button>
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
                            setEditingUpdateId('');
                            setEditingAttachments([]);
                            setAdminUpdates([]);
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
              <section className="border border-[#ded9cf] bg-[#fbfaf6] p-5 sm:p-6 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <ImagePlus size={17} className="text-bronze-500" />
                    <div>
                      <p className="text-xs text-neutral-500">{selectedProject?.project_name ?? t.chooseProject}</p>
                      <h2 className="mt-1 font-display text-xl font-medium">{t.photoPreview}</h2>
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
              </>
            )}
            {activeSection === 'admin-resets' && (
              <>
            <section id="admin-resets" className="mb-5 scroll-mt-24 border border-[#ded9cf] bg-[#fbfaf6] p-6 sm:p-8 dark:border-white/10 dark:bg-neutral-900">
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
                        <p className="mt-1 text-[10px] text-neutral-400">{request.credential_type === 'account' ? t.emailPasswordReset : t.projectPasswordReset}</p>
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
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{t.temporaryPassword} / {issuedPassword.resetRequest.credential_type === 'account' ? t.emailPasswordReset : t.projectPasswordReset} · {issuedPassword.resetRequest.credential_type === 'account' ? issuedPassword.resetRequest.client_email : issuedPassword.resetRequest.project_code}</p>
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
              </>
            )}
            <div className="space-y-5">
            {adminRole === 'admin' && activeSection === 'admin-access' && <section id="admin-access" className="mx-auto w-full max-w-3xl scroll-mt-24 border border-[#ded9cf] bg-[#fbfaf6] p-6 sm:p-8 dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-8 flex items-start gap-3 border-b border-neutral-100 pb-5 dark:border-white/10">
                <Plus size={19} className="text-bronze-500" />
                <div>
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">01 / ACCESS</p>
                  <h2 className="font-display text-xl font-medium tracking-tight">{t.createProject}</h2>
                </div>
              </div>
              <form onSubmit={createProject} className="space-y-5">
                <Field name="projectCode" label={t.projectCode} required maxLength={32} placeholder="LIN-2026-001" autoCapitalize="characters" />
                <Field name="projectName" label={t.projectName} required maxLength={120} />
                <Field name="clientName" label={t.clientName} required maxLength={120} />
                <Field name="clientEmail" label={t.clientEmail} type="email" required maxLength={254} autoCapitalize="none" />
                <Field name="location" label={t.location} maxLength={120} />
                <Field name="startDate" label={t.startDate} type="date" defaultValue={today()} required />
                <Field name="clientPassword" label={t.clientPassword} type="password" required minLength={12} maxLength={256} autoComplete="new-password" />
                <Field name="clientLoginPassword" label={t.clientLoginPassword} type="password" required minLength={8} maxLength={256} autoComplete="new-password" />
                <p className="-mt-3 text-xs leading-5 text-neutral-500">{t.accountPasswordHint}</p>
                <button disabled={busy} className="mt-2 flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:opacity-60 dark:bg-white dark:text-neutral-950">
                  {t.create} <ArrowUpRight size={17} />
                </button>
              </form>
            </section>}

            {activeSection === 'admin-progress' && <section id="admin-progress" className="mx-auto w-full max-w-3xl scroll-mt-24 space-y-5">
              <div className="border border-[#ded9cf] bg-[#fbfaf6] p-6 sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-7 flex items-start gap-3 border-b border-neutral-100 pb-5 dark:border-white/10">
                  <Send size={18} className="text-bronze-500" />
                  <div>
                    <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">02 / JOURNAL</p>
                    <h2 className="font-display text-xl font-medium tracking-tight">{t.newUpdate}</h2>
                  </div>
                </div>
                {projects.length === 0 ? (
                  <p className="text-sm leading-6 text-neutral-500">{t.emptyProjects}</p>
                ) : (
                  <form id="progress-update-form" key={`${selectedProjectId}-${editingUpdateId || 'new'}`} onSubmit={submitProgressUpdate} className="space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.projects}</span>
                      <select value={selectedProjectId} onChange={(event) => { setSelectedFiles([]); setEditingUpdateId(''); setEditingAttachments([]); setAdminUpdates([]); if (imageInputRef.current) imageInputRef.current.value = ''; if (documentInputRef.current) documentInputRef.current.value = ''; setSelectedProjectId(event.target.value); }} required className="w-full border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-neutral-700 dark:border-white/15 dark:bg-neutral-950 dark:[color-scheme:dark]">
                        <option value="">{t.chooseProject}</option>
                        {projects.map((project) => <option key={project.id} value={project.id}>{project.project_code} — {project.project_name}</option>)}
                      </select>
                    </label>
                    {selectedUpdate && (
                      <div className="flex flex-wrap items-center justify-between gap-3 border border-bronze-500/30 bg-bronze-500/5 px-4 py-3 text-xs">
                        <span>{t.editingUpdate}: <strong>{selectedUpdate.title}</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUpdateId('');
                            setEditingAttachments([]);
                            setSelectedFiles([]);
                            if (imageInputRef.current) imageInputRef.current.value = '';
                            if (documentInputRef.current) documentInputRef.current.value = '';
                          }}
                          className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                        >
                          {t.cancelEdit}
                        </button>
                      </div>
                    )}
                    <Field name="title" label={t.titleField} required maxLength={120} defaultValue={selectedUpdate?.title ?? ''} />
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.description}</span>
                      <textarea name="description" defaultValue={selectedUpdate?.description ?? ''} required minLength={2} maxLength={5000} rows={4} className="w-full resize-y border border-[#d9d4c9] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-neutral-700 dark:border-white/15 dark:bg-neutral-950" />
                    </label>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field name="progressPercent" label={t.progress} type="number" min={0} max={100} defaultValue={selectedUpdate?.progress_percent ?? selectedProject?.progress_percent ?? 0} required />
                      <Field name="updateDate" label={t.date} type="date" defaultValue={selectedUpdate?.update_date ?? today()} required />
                    </div>
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <ImagePlus size={16} className="text-bronze-500" />
                        <span className="font-mono text-[10px] uppercase tracking-widest">{t.attachmentLabel}</span>
                      </div>
                      <div className="space-y-4">
                        <section className="border border-dashed border-neutral-300 bg-neutral-50/80 p-4 dark:border-white/15 dark:bg-white/[0.03]">
                          <div className="mb-3 flex items-center gap-2">
                            <ImagePlus size={16} className="text-bronze-500" />
                            <h3 className="font-mono text-[10px] uppercase tracking-widest">{t.photo}</h3>
                          </div>
                          {editingUpdateId && existingPhotos.length > 0 && (
                            <div className="mb-4 space-y-2">
                              <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">{t.existingAttachments}</p>
                              {existingPhotos.map((attachment) => (
                                <div key={attachment.path} className="flex items-center gap-3 border border-neutral-200 bg-white p-2 dark:border-white/10 dark:bg-neutral-900">
                                  {attachment.url && <img src={attachment.url} alt={attachment.name} className="h-14 w-20 shrink-0 object-cover" />}
                                  <a href={attachment.downloadUrl ?? attachment.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-xs hover:text-bronze-600">{attachment.name}</a>
                                  <button type="button" onClick={() => setEditingAttachments((current) => current.filter((item) => item.path !== attachment.path))} aria-label={`${t.removeAttachment}: ${attachment.name}`} title={t.removeAttachment} className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 hover:text-red-500">
                                    <X size={15} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-neutral-200 bg-white px-4 py-5 text-center transition-colors hover:border-bronze-500 dark:border-white/10 dark:bg-neutral-900">
                            <Upload size={19} className="text-bronze-500" />
                            <span className="text-xs font-medium">{t.choosePhotos}</span>
                            <span className="max-w-sm text-[10px] leading-5 text-neutral-500">{t.photoHint}</span>
                            <input type="file" ref={imageInputRef} multiple accept={ACCEPTED_IMAGES} className="sr-only" onChange={(event) => handleProgressFileSelection(event, 'photo')} />
                          </label>
                          {selectedPhotos.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {selectedPhotos.map((file, index) => (
                                <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                                  <span className="flex min-w-0 items-center gap-2"><ImagePlus size={14} className="shrink-0 text-bronze-500" /><span className="truncate">{file.name}</span></span>
                                  <span className="shrink-0 font-mono text-[10px] text-neutral-400">{formatBytes(file.size)}</span>
                                </div>
                              ))}
                              <button type="button" onClick={() => { setSelectedFiles((current) => current.filter((file) => !file.type.startsWith('image/'))); if (imageInputRef.current) imageInputRef.current.value = ''; }} className="pt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-red-500">{t.removeFiles}</button>
                            </div>
                          )}
                        </section>

                        <section className="border border-dashed border-neutral-300 bg-neutral-50/80 p-4 dark:border-white/15 dark:bg-white/[0.03]">
                          <div className="mb-3 flex items-center gap-2">
                            <FileText size={16} className="text-bronze-500" />
                            <h3 className="font-mono text-[10px] uppercase tracking-widest">{t.progressFiles}</h3>
                          </div>
                          {editingUpdateId && existingDocuments.length > 0 && (
                            <div className="mb-4 space-y-2">
                              <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">{t.existingAttachments}</p>
                              {existingDocuments.map((attachment) => (
                                <div key={attachment.path} className="flex items-center gap-3 border border-neutral-200 bg-white p-2 dark:border-white/10 dark:bg-neutral-900">
                                  <FileText size={18} className="mx-1 shrink-0 text-bronze-500" />
                                  <a href={attachment.downloadUrl ?? attachment.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-xs hover:text-bronze-600">{attachment.name}</a>
                                  <button type="button" onClick={() => setEditingAttachments((current) => current.filter((item) => item.path !== attachment.path))} aria-label={`${t.removeAttachment}: ${attachment.name}`} title={t.removeAttachment} className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 hover:text-red-500">
                                    <X size={15} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-neutral-200 bg-white px-4 py-5 text-center transition-colors hover:border-bronze-500 dark:border-white/10 dark:bg-neutral-900">
                            <Upload size={19} className="text-bronze-500" />
                            <span className="text-xs font-medium">{t.chooseProgressFiles}</span>
                            <span className="max-w-sm text-[10px] leading-5 text-neutral-500">{t.documentHint}</span>
                            <input type="file" ref={documentInputRef} multiple accept={ACCEPTED_DOCUMENTS} className="sr-only" onChange={(event) => handleProgressFileSelection(event, 'document')} />
                          </label>
                          {selectedDocuments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {selectedDocuments.map((file, index) => (
                                <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                                  <span className="flex min-w-0 items-center gap-2"><FileText size={14} className="shrink-0 text-bronze-500" /><span className="truncate">{file.name}</span></span>
                                  <span className="shrink-0 font-mono text-[10px] text-neutral-400">{formatBytes(file.size)}</span>
                                </div>
                              ))}
                              <button type="button" onClick={() => { setSelectedFiles((current) => current.filter((file) => file.type.startsWith('image/'))); if (documentInputRef.current) documentInputRef.current.value = ''; }} className="pt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-red-500">{t.removeFiles}</button>
                            </div>
                          )}
                        </section>
                      </div>
                    </div>
                    <button disabled={busy || projects.length === 0} className="flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-500 disabled:opacity-60 dark:bg-white dark:text-neutral-950">
                      {busy ? (language === 'ID' ? 'Mengunggah...' : language === 'CN' ? '正在上传...' : 'Uploading...') : editingUpdateId ? t.saveChanges : t.publish} <ArrowUpRight size={17} />
                    </button>
                  </form>
                )}
              </div>

              <div className="border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
                  <ClipboardList size={17} className="text-bronze-500" />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">EDIT / JOURNAL</p>
                    <h2 className="mt-1 font-mono text-xs uppercase tracking-widest">{t.previousUpdates}</h2>
                  </div>
                </div>
                {adminUpdates.length === 0 ? (
                  <p className="text-sm text-neutral-500">{t.noPreviousUpdates}</p>
                ) : (
                  <ul className="divide-y divide-neutral-200 dark:divide-white/10">
                    {adminUpdates.map((update) => (
                      <li key={update.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{update.title}</p>
                          <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                            {formatAdminDate(update.update_date, language)} · {update.progress_percent}% · {update.attachments.length} {t.attachmentsCount}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            aria-pressed={editingUpdateId === update.id}
                            onClick={() => {
                              setEditingUpdateId(update.id);
                              setEditingAttachments(update.attachments);
                              setSelectedFiles([]);
                              setError('');
                              setNotice('');
                              if (imageInputRef.current) imageInputRef.current.value = '';
                              if (documentInputRef.current) documentInputRef.current.value = '';
                              document.getElementById('progress-update-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="border border-neutral-200 px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors hover:border-bronze-500 hover:text-bronze-600 disabled:opacity-50 dark:border-white/15"
                          >
                            {editingUpdateId === update.id ? t.editingUpdate : t.editUpdate}
                          </button>
                          {adminRole === 'admin' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => deleteProgressUpdate(update)}
                              className="inline-flex items-center gap-2 border border-red-200 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-500/10"
                            >
                              <Trash2 size={13} />
                              {busy ? t.deletingUpdate : t.deleteUpdate}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
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
                          <span className="min-w-0"><strong className="font-mono text-[10px] text-bronze-600 dark:text-bronze-400">{project.project_code}</strong><span className="mx-2 text-neutral-300">/</span><span className="font-medium">{project.project_name}</span><span className="mt-1 block text-xs text-neutral-500">{project.client_name}</span><span className="mt-1 block text-[10px] text-neutral-400">{project.client_email ?? t.noClientEmail}</span></span>
                          <span className="w-24 shrink-0">
                            <span className="mb-1 block text-right font-mono text-[10px] text-neutral-500">{project.progress_percent}%</span>
                            <span className="block h-1 bg-neutral-100 dark:bg-white/10"><span className="block h-full bg-bronze-500" style={{ width: `${project.progress_percent}%` }} /></span>
                          </span>
                        </div>
                        {adminRole === 'admin' && (
                          <>
                        <form onSubmit={saveProjectStartDate} className="mt-4 flex flex-wrap items-end gap-3 border-t border-neutral-100 pt-4 dark:border-white/10">
                          <input type="hidden" name="projectId" value={project.id} />
                          <label className="min-w-[180px] flex-1">
                            <span className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-neutral-500"><CalendarDays size={12} />{t.startDate}</span>
                            <input name="startDate" type="date" defaultValue={project.start_date ?? ''} required className="w-full border-b border-neutral-200 bg-transparent py-2 text-xs outline-none focus:border-bronze-500 dark:border-white/15 dark:[color-scheme:dark]" />
                          </label>
                          <button disabled={busy} className="border border-neutral-200 px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors hover:border-bronze-500 disabled:opacity-50 dark:border-white/15">{t.saveDate}</button>
                        </form>
                        <form onSubmit={saveClientAccount} className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 dark:border-white/10 sm:grid-cols-[1fr_auto] sm:items-end">
                          <input type="hidden" name="projectId" value={project.id} />
                          <Field name="clientEmail" label={t.clientEmail} type="email" defaultValue={project.client_email ?? ''} required maxLength={254} autoCapitalize="none" />
                          <button disabled={busy} className="border border-neutral-200 px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors hover:border-bronze-500 disabled:opacity-50 dark:border-white/15">{t.saveClientAccount}</button>
                        </form>
                        <p className="mt-2 text-[10px] leading-5 text-neutral-500">{t.clientEmailEditHint}</p>
                        <div className="mt-4 flex justify-end border-t border-neutral-100 pt-4 dark:border-white/10">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => deleteProject(project)}
                            className="inline-flex items-center gap-2 border border-red-200 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            <Trash2 size={13} />
                            {busy ? t.deletingProject : t.deleteProject}
                          </button>
                        </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>}
          </div>
          </>
        )}
        {!authenticated && !checking && (
          <section className="mx-auto mt-10 max-w-5xl border-t border-neutral-300 pt-8 dark:border-white/10 sm:mt-14 sm:pt-10">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <h2 className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{t.contact}</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-bronze-600 dark:text-bronze-400" />
                    <div className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                      <p>{siteT.common.address_line1}</p>
                      <p>{siteT.common.address_line2}</p>
                      <p>{siteT.common.address_country}</p>
                    </div>
                  </div>
                  <a href="https://wa.me/6281775030638" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-neutral-600 transition-colors hover:text-bronze-600 dark:text-neutral-300 dark:hover:text-bronze-400">
                    <Phone size={16} className="shrink-0 text-bronze-600 dark:text-bronze-400" />
                    +62 817 7503 0638
                  </a>
                  <a href="mailto:hello@linierstudio.com" className="flex items-center gap-3 text-sm text-neutral-600 transition-colors hover:text-bronze-600 dark:text-neutral-300 dark:hover:text-bronze-400">
                    <Mail size={16} className="shrink-0 text-bronze-600 dark:text-bronze-400" />
                    hello@linierstudio.com
                  </a>
                </div>
              </div>
              <div>
                <h2 className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{t.services}</h2>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {siteT.services.list.map((service) => (
                    <li key={service.id} className="border border-neutral-200 px-3 py-2.5 text-xs leading-5 text-neutral-600 dark:border-white/10 dark:text-neutral-300">
                      {service.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-neutral-300 pt-4 font-mono text-[9px] uppercase tracking-widest text-neutral-500 dark:border-white/10 sm:mt-10">
              © {new Date().getFullYear()} PT. LINIER NUSAKARYA PERSADA. {siteT.footer.rights}
            </div>
          </section>
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
      <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
      <input {...props} className="w-full border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-neutral-700 focus:ring-2 focus:ring-neutral-900/5 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-white/50" />
    </label>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-h-28 flex-col justify-between bg-[#f7f5ef] px-4 py-4 sm:px-5 sm:py-5 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2 text-neutral-500">
        <p className="text-xs">{label}</p>
        <span className="text-[#8c795e]">{icon}</span>
      </div>
      <p className="mt-4 font-display text-3xl font-medium tracking-tight tabular-nums sm:text-4xl">{value}</p>
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
