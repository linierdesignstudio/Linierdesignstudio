import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, CalendarDays, Check, CheckCircle2, ClipboardList, Clock3, Download, Eye, EyeOff, FileCheck2, FileText, LayoutDashboard, LockKeyhole, LogOut, MapPin, MessageCircle, Phone, Search, Send, ShieldCheck, Upload, X } from 'lucide-react';
import PortalActivityPanel from '../components/PortalActivityPanel';
import PortalFilePreview from '../components/PortalFilePreview';
import PortalLanguageSwitcher from '../components/PortalLanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { portalRequest, type BillingItem, type ClientFeedback, type PortalAttachment, type PortalNotification, type PortalProject, type PortalUpdate, type ProjectChangeOrder } from '../lib/portalApi';
import { canPreviewPortalDocument, getPortalDocumentKind, type PortalDocumentKind } from '../lib/portalDocuments';

const copy = {
  ID: {
    eyebrow: 'LINIER STUDIO / PORTAL KLIEN',
    title: 'Perjalanan proyek Anda.',
    subtitle: 'Masuk untuk melihat perkembangan terbaru langsung dari tim studio.',
    projectId: 'ID Proyek',
    loginIdentifier: 'ID proyek atau email',
    chooseProject: 'Pilih proyek',
    password: 'Password',
    showPassword: 'Tampilkan password',
    hidePassword: 'Sembunyikan password',
    signIn: 'Masuk ke portal',
    signingIn: 'Memeriksa akses...',
    admin: 'Akses tim studio',
    dashboard: 'Ringkasan proyek',
    dashboardHint: 'Lihat progres dan akses cepat ke informasi penting proyek Anda.',
    dashboardNav: 'Ringkasan',
    dashboardOpenBills: 'Tagihan belum lunas',
    dashboardPendingChanges: 'Perubahan menunggu',
    latest: 'Progress proyek',
    updated: 'Pembaruan harian',
    noUpdates: 'Belum ada pembaruan.',
    noUpdatesHint: 'Update terbaru dari tim proyek akan muncul di halaman ini.',
    logout: 'Keluar',
    status: 'Status',
    location: 'Lokasi',
    projectType: 'Jenis proyek',
    architecture: 'Arsitektur',
    interior: 'Interior',
    construction: 'Konstruksi',
    projectTypeNotSet: 'Belum diatur',
    clientPhone: 'No. telepon',
    back: 'Kembali ke Linier Studio',
    secure: 'Informasi proyek hanya dapat dilihat dengan akses yang diberikan studio.',
    loading: 'Memuat portal...',
    complete: 'Selesai',
    inProgress: 'Sedang berjalan',
    documents: 'Dokumen proyek',
    documentsEmpty: 'Belum ada dokumen untuk proyek ini.',
    documentsSearch: 'Cari nama file atau update',
    documentsType: 'Jenis file',
    documentsAllTypes: 'Semua jenis',
    documentsImage: 'Gambar',
    documentsPdf: 'PDF',
    documentsWord: 'Word',
    documentsSpreadsheet: 'Spreadsheet / CSV',
    documentsOther: 'Lainnya',
    documentsFrom: 'Dari tanggal',
    documentsTo: 'Sampai tanggal',
    documentsNoResults: 'Tidak ada file yang cocok dengan filter.',
    documentAttachedToUpdate: 'Dilampirkan pada update',
    viewFile: 'Buka file',
    previewFile: 'Pratinjau file',
    downloadFile: 'Unduh file',
    closePreview: 'Tutup pratinjau',
    photo: 'Foto progress',
    feedbackNav: 'Feedback',
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
    feedbackTitle: 'Feedback untuk tim studio',
    feedbackDescription: 'Sampaikan pertanyaan atau masukan terkait proyek. Admin dan staf studio akan membalas melalui portal ini.',
    feedbackMessage: 'Pesan',
    feedbackPlaceholder: 'Tulis feedback atau pertanyaan Anda...',
    feedbackSend: 'Kirim feedback',
    feedbackSending: 'Mengirim...',
    feedbackSent: 'Feedback berhasil dikirim.',
    feedbackEmpty: 'Belum ada feedback untuk proyek ini.',
    feedbackWaiting: 'Menunggu balasan tim studio',
    feedbackReply: 'Balasan tim studio',
    feedbackReplyByAdmin: 'Dibalas admin',
    feedbackReplyByStaff: 'Dibalas staf',
    feedbackReplyDate: 'Tanggal balasan',
    feedbackOpen: 'Buka chat feedback',
    feedbackClose: 'Tutup chat feedback',
    billingTitle: 'Tagihan & pembayaran',
    billingEmpty: 'Belum ada tagihan untuk proyek ini.',
    billingDueDate: 'Jatuh tempo',
    billingUnpaid: 'Belum dibayar',
    billingUploading: 'Mengunggah bukti',
    billingPending: 'Menunggu pemeriksaan',
    billingRejected: 'Bukti perlu diperbaiki',
    billingPaid: 'Lunas',
    billingOverdue: 'Terlambat',
    billingProof: 'Bukti pembayaran',
    billingProofReceived: 'Bukti pembayaran sudah diunggah.',
    billingProofLinkUnavailable: 'Bukti sudah diterima, tetapi tautan pratinjau belum tersedia. Muat ulang portal atau hubungi studio.',
    billingSubmittedAt: 'Dikirim',
    billingOverdueUploadHint: 'Meskipun lewat jatuh tempo, bukti pembayaran tetap dapat diunggah.',
    billingProofHint: 'Format JPG, PNG, WEBP, atau PDF; maksimal 5 MB.',
    billingUpload: 'Unggah bukti pembayaran',
    billingUploadingAction: 'Mengunggah...',
    billingSubmitted: 'Bukti pembayaran berhasil dikirim.',
    billingCleanupWarning: 'Bukti sebelumnya tidak dapat dihapus dari penyimpanan. Silakan hubungi studio.',
    billingReviewNote: 'Catatan dari studio',
    changeTitle: 'Perubahan pekerjaan',
    changeDescription: 'Catat kebutuhan perubahan ruang lingkup. Tim studio akan meninjau dan mengirimkan estimasi untuk persetujuan.',
    changeEmpty: 'Belum ada permintaan atau usulan perubahan.',
    changeRequestTitle: 'Judul perubahan',
    changeRequestDetails: 'Jelaskan perubahan yang dibutuhkan',
    changeSend: 'Kirim permintaan perubahan',
    changeSending: 'Mengirim...',
    changeRequested: 'Menunggu estimasi studio',
    changePending: 'Menunggu persetujuan Anda',
    changeApproved: 'Disetujui',
    changeRejected: 'Ditolak',
    changeCost: 'Dampak biaya',
    changeSchedule: 'Dampak jadwal',
    changeProposal: 'Usulan studio',
    changeClientRequest: 'Permintaan Anda',
    changeAdminNote: 'Catatan dari studio',
    changeResponse: 'Catatan untuk studio (opsional)',
    changeApprove: 'Setujui perubahan',
    changeReject: 'Tolak usulan',
    changeConfirmApprove: 'Setujui usulan perubahan dan dampak biaya/jadwalnya?',
    changeConfirmReject: 'Tolak usulan perubahan ini?',
    changeRequestSent: 'Permintaan perubahan berhasil dikirim.',
    changeDecisionSaved: 'Tanggapan Anda berhasil disimpan.',
    actionCenter: 'Perlu tindakan',
    actionCenterEmpty: 'Tidak ada tindakan yang menunggu.',
    activityCenter: 'Aktivitas terbaru',
    activityCenterEmpty: 'Belum ada notifikasi.',
    needsAttention: 'Perlu ditindaklanjuti',
    unread: 'belum dibaca',
    notificationRefresh: 'Perbarui aktivitas',
    notificationLoading: 'Memuat aktivitas...',
    notificationOpen: 'Buka aktivitas',
    notificationLoadFailed: 'Aktivitas portal tidak dapat dimuat.',
    viewAll: 'Tampilkan semuanya',
    activityBack: 'Kembali ke dashboard',
  },
  EN: {
    eyebrow: 'LINIER STUDIO / CLIENT PORTAL',
    title: 'Your project journey.',
    subtitle: 'Sign in to see the latest progress directly from the studio team.',
    projectId: 'Project ID',
    loginIdentifier: 'Project ID or email',
    chooseProject: 'Choose a project',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    signIn: 'Sign in to portal',
    signingIn: 'Checking access...',
    admin: 'Studio team access',
    dashboard: 'Project dashboard',
    dashboardHint: 'Check progress and quickly open important project information.',
    dashboardNav: 'Overview',
    dashboardOpenBills: 'Unpaid bills',
    dashboardPendingChanges: 'Pending changes',
    latest: 'Project progress',
    updated: 'Daily updates',
    noUpdates: 'No updates yet.',
    noUpdatesHint: 'The latest notes from your project team will appear here.',
    logout: 'Sign out',
    status: 'Status',
    location: 'Location',
    projectType: 'Project type',
    architecture: 'Architecture',
    interior: 'Interior',
    construction: 'Construction',
    projectTypeNotSet: 'Not set',
    clientPhone: 'Phone number',
    back: 'Back to Linier Studio',
    secure: 'Project information is only available with access provided by the studio.',
    loading: 'Loading portal...',
    complete: 'Complete',
    inProgress: 'In progress',
    documents: 'Project documents',
    documentsEmpty: 'There are no documents for this project yet.',
    documentsSearch: 'Search file or update name',
    documentsType: 'File type',
    documentsAllTypes: 'All types',
    documentsImage: 'Images',
    documentsPdf: 'PDF',
    documentsWord: 'Word',
    documentsSpreadsheet: 'Spreadsheet / CSV',
    documentsOther: 'Other',
    documentsFrom: 'From date',
    documentsTo: 'To date',
    documentsNoResults: 'No files match these filters.',
    documentAttachedToUpdate: 'Attached to update',
    viewFile: 'Open file',
    previewFile: 'Preview file',
    downloadFile: 'Download file',
    closePreview: 'Close preview',
    photo: 'Progress photo',
    feedbackNav: 'Feedback',
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
    feedbackTitle: 'Feedback for the studio team',
    feedbackDescription: 'Share a question or note about your project. The studio admin and staff will reply through this portal.',
    feedbackMessage: 'Message',
    feedbackPlaceholder: 'Write your feedback or question...',
    feedbackSend: 'Send feedback',
    feedbackSending: 'Sending...',
    feedbackSent: 'Feedback sent successfully.',
    feedbackEmpty: 'There is no feedback for this project yet.',
    feedbackWaiting: 'Waiting for the studio team',
    feedbackReply: 'Studio team reply',
    feedbackReplyByAdmin: 'Replied by admin',
    feedbackReplyByStaff: 'Replied by staff',
    feedbackReplyDate: 'Reply date',
    feedbackOpen: 'Open feedback chat',
    feedbackClose: 'Close feedback chat',
    billingTitle: 'Billing & payments',
    billingEmpty: 'There are no bills for this project yet.',
    billingDueDate: 'Due date',
    billingUnpaid: 'Unpaid',
    billingUploading: 'Uploading proof',
    billingPending: 'Awaiting review',
    billingRejected: 'Proof needs changes',
    billingPaid: 'Paid',
    billingOverdue: 'Overdue',
    billingProof: 'Payment proof',
    billingProofReceived: 'Payment proof uploaded.',
    billingProofLinkUnavailable: 'The proof was received, but its preview link is unavailable. Refresh the portal or contact the studio.',
    billingSubmittedAt: 'Submitted',
    billingOverdueUploadHint: 'You can still upload payment proof after the due date.',
    billingProofHint: 'JPG, PNG, WEBP, or PDF; up to 5 MB.',
    billingUpload: 'Upload payment proof',
    billingUploadingAction: 'Uploading...',
    billingSubmitted: 'Payment proof submitted.',
    billingCleanupWarning: 'The previous proof could not be removed from storage. Please contact the studio.',
    billingReviewNote: 'Studio note',
    changeTitle: 'Project changes',
    changeDescription: 'Describe a change to the project scope. The studio will review it and send an estimate for your approval.',
    changeEmpty: 'There are no change requests or proposals yet.',
    changeRequestTitle: 'Change title',
    changeRequestDetails: 'Describe the requested change',
    changeSend: 'Send change request',
    changeSending: 'Sending...',
    changeRequested: 'Awaiting studio estimate',
    changePending: 'Awaiting your approval',
    changeApproved: 'Approved',
    changeRejected: 'Rejected',
    changeCost: 'Cost impact',
    changeSchedule: 'Schedule impact',
    changeProposal: 'Studio proposal',
    changeClientRequest: 'Your request',
    changeAdminNote: 'Studio note',
    changeResponse: 'Note to studio (optional)',
    changeApprove: 'Approve change',
    changeReject: 'Reject proposal',
    changeConfirmApprove: 'Approve this change proposal and its cost/schedule impact?',
    changeConfirmReject: 'Reject this change proposal?',
    changeRequestSent: 'Change request sent.',
    changeDecisionSaved: 'Your response has been saved.',
    actionCenter: 'Needs your attention',
    actionCenterEmpty: 'There are no pending actions.',
    activityCenter: 'Recent activity',
    activityCenterEmpty: 'There are no notifications yet.',
    needsAttention: 'Action needed',
    unread: 'unread',
    notificationRefresh: 'Refresh activity',
    notificationLoading: 'Loading activity...',
    notificationOpen: 'Open activity',
    notificationLoadFailed: 'Portal activity could not be loaded.',
    viewAll: 'View all',
    activityBack: 'Back to dashboard',
  },
  CN: {
    eyebrow: 'LINIER STUDIO / 客户门户',
    title: '您的项目进程。',
    subtitle: '登录后即可查看工作室团队分享的最新进度。',
    projectId: '项目编号',
    loginIdentifier: '项目编号或邮箱',
    chooseProject: '选择项目',
    password: '密码',
    showPassword: '显示密码',
    hidePassword: '隐藏密码',
    signIn: '登录门户',
    signingIn: '正在验证...',
    admin: '工作室团队入口',
    dashboard: '项目概览',
    dashboardHint: '查看项目进度，并快速访问重要项目信息。',
    dashboardNav: '概览',
    dashboardOpenBills: '待付款账单',
    dashboardPendingChanges: '待处理变更',
    latest: '项目进度',
    updated: '每日更新',
    noUpdates: '暂无更新。',
    noUpdatesHint: '项目团队的最新记录将在此显示。',
    logout: '退出',
    status: '状态',
    location: '地点',
    projectType: '项目类型',
    architecture: '建筑设计',
    interior: '室内设计',
    construction: '施工',
    projectTypeNotSet: '未设置',
    clientPhone: '电话号码',
    back: '返回 Linier Studio',
    secure: '项目信息仅对工作室授权用户开放。',
    loading: '正在加载门户...',
    complete: '已完成',
    inProgress: '进行中',
    documents: '项目文件',
    documentsEmpty: '此项目暂无文件。',
    documentsSearch: '搜索文件名或更新标题',
    documentsType: '文件类型',
    documentsAllTypes: '所有类型',
    documentsImage: '图片',
    documentsPdf: 'PDF',
    documentsWord: 'Word 文档',
    documentsSpreadsheet: '表格 / CSV',
    documentsOther: '其他',
    documentsFrom: '开始日期',
    documentsTo: '结束日期',
    documentsNoResults: '没有符合筛选条件的文件。',
    documentAttachedToUpdate: '所属更新',
    viewFile: '打开文件',
    previewFile: '预览文件',
    downloadFile: '下载文件',
    closePreview: '关闭预览',
    photo: '进度照片',
    feedbackNav: '反馈',
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
    feedbackTitle: '向工作室团队反馈',
    feedbackDescription: '提交与项目相关的问题或建议。工作室管理员和员工会通过此门户回复。',
    feedbackMessage: '内容',
    feedbackPlaceholder: '请输入您的反馈或问题...',
    feedbackSend: '发送反馈',
    feedbackSending: '正在发送...',
    feedbackSent: '反馈已成功发送。',
    feedbackEmpty: '此项目暂无反馈。',
    feedbackWaiting: '等待工作室团队回复',
    feedbackReply: '工作室团队回复',
    feedbackReplyByAdmin: '管理员回复',
    feedbackReplyByStaff: '员工回复',
    feedbackReplyDate: '回复日期',
    feedbackOpen: '打开反馈聊天',
    feedbackClose: '关闭反馈聊天',
    billingTitle: '账单与付款',
    billingEmpty: '此项目暂无账单。',
    billingDueDate: '到期日',
    billingUnpaid: '未付款',
    billingUploading: '正在上传凭证',
    billingPending: '等待审核',
    billingRejected: '凭证需要修改',
    billingPaid: '已付款',
    billingOverdue: '已逾期',
    billingProof: '付款凭证',
    billingProofReceived: '付款凭证已上传。',
    billingProofLinkUnavailable: '已收到凭证，但预览链接暂不可用。请刷新门户或联系工作室。',
    billingSubmittedAt: '提交时间',
    billingOverdueUploadHint: '即使已过付款期限，仍可上传付款凭证。',
    billingProofHint: 'JPG、PNG、WEBP 或 PDF，最大 5 MB。',
    billingUpload: '上传付款凭证',
    billingUploadingAction: '正在上传...',
    billingSubmitted: '付款凭证已提交。',
    billingCleanupWarning: '无法从存储中删除之前的凭证，请联系工作室。',
    billingReviewNote: '工作室说明',
    changeTitle: '工程变更',
    changeDescription: '描述项目范围的变更需求。工作室审核后会发送估价供您确认。',
    changeEmpty: '暂无变更申请或提案。',
    changeRequestTitle: '变更标题',
    changeRequestDetails: '请描述所需的变更',
    changeSend: '发送变更申请',
    changeSending: '正在发送...',
    changeRequested: '等待工作室估价',
    changePending: '等待您批准',
    changeApproved: '已批准',
    changeRejected: '已拒绝',
    changeCost: '费用影响',
    changeSchedule: '工期影响',
    changeProposal: '工作室提案',
    changeClientRequest: '您的申请',
    changeAdminNote: '工作室说明',
    changeResponse: '给工作室的说明（可选）',
    changeApprove: '批准变更',
    changeReject: '拒绝提案',
    changeConfirmApprove: '批准此变更提案及其费用/工期影响？',
    changeConfirmReject: '拒绝此变更提案？',
    changeRequestSent: '变更申请已发送。',
    changeDecisionSaved: '您的回复已保存。',
    actionCenter: '待处理事项',
    actionCenterEmpty: '目前没有待处理事项。',
    activityCenter: '最新动态',
    activityCenterEmpty: '暂无通知。',
    needsAttention: '需要处理',
    unread: '未读',
    notificationRefresh: '刷新动态',
    notificationLoading: '正在加载动态...',
    notificationOpen: '打开动态',
    notificationLoadFailed: '无法加载门户动态。',
    viewAll: '查看全部',
    activityBack: '返回仪表板',
  },
} as const;

const clientPortalImage = new URL('../1.jpeg', import.meta.url).href;

const ClientPortal: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const t = copy[language];
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [project, setProject] = useState<PortalProject | null>(null);
  const [updates, setUpdates] = useState<PortalUpdate[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<ClientFeedback[]>([]);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [changeOrders, setChangeOrders] = useState<ProjectChangeOrder[]>([]);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [notificationsRefreshToken, setNotificationsRefreshToken] = useState(0);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [documentSearch, setDocumentSearch] = useState('');
  const [documentType, setDocumentType] = useState<PortalDocumentKind | 'all'>('all');
  const [documentDateFrom, setDocumentDateFrom] = useState('');
  const [documentDateTo, setDocumentDateTo] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<PortalAttachment | null>(null);
  const [projectCode, setProjectCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
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
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackChatOpen, setFeedbackChatOpen] = useState(false);
  const [billingBusyId, setBillingBusyId] = useState('');
  const [billingNotice, setBillingNotice] = useState('');
  const [changeSubmitting, setChangeSubmitting] = useState(false);
  const [changeNotice, setChangeNotice] = useState('');
  const feedbackMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!resetNotice) return;
    const timeout = window.setTimeout(() => setResetNotice(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [resetNotice]);

  useEffect(() => {
    if (!passwordChangeNotice) return;
    const timeout = window.setTimeout(() => setPasswordChangeNotice(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [passwordChangeNotice]);

  useEffect(() => {
    if (!feedbackNotice) return;
    const timeout = window.setTimeout(() => setFeedbackNotice(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedbackNotice]);

  useEffect(() => {
    if (!changeNotice) return;
    const timeout = window.setTimeout(() => setChangeNotice(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [changeNotice]);

  useEffect(() => {
    if (!billingNotice) return;
    const timeout = window.setTimeout(() => setBillingNotice(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [billingNotice]);

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

  useEffect(() => {
    let active = true;
    if (!project) {
      setBillingItems([]);
      setChangeOrders([]);
      return () => { active = false; };
    }

    setBillingItems([]);
    setChangeOrders([]);
    Promise.all([
      portalRequest<{ items: BillingItem[] }>(`/api/portal/client/billing?projectId=${encodeURIComponent(project.id)}`),
      portalRequest<{ orders: ProjectChangeOrder[] }>(`/api/portal/client/change-orders?projectId=${encodeURIComponent(project.id)}`),
    ])
      .then(([billing, changes]) => {
        if (!active) return;
        setBillingItems(billing.items);
        setChangeOrders(changes.orders);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Tagihan dan perubahan pekerjaan tidak dapat dimuat.');
      });
    return () => { active = false; };
  }, [project?.id]);

  useEffect(() => {
    let active = true;
    if (!project) {
      setFeedbackItems([]);
      return () => { active = false; };
    }

    setFeedbackItems([]);
    setFeedbackNotice('');
    setFeedbackError('');
    portalRequest<{ feedback: ClientFeedback[] }>(`/api/portal/client/updates?resource=feedback&projectId=${encodeURIComponent(project.id)}`)
      .then(({ feedback }) => {
        if (active) setFeedbackItems(feedback);
      })
      .catch((cause: unknown) => {
        if (active) setFeedbackError(cause instanceof Error ? cause.message : 'Feedback tidak dapat dimuat.');
      });
    return () => { active = false; };
  }, [project?.id]);

  useEffect(() => {
    let active = true;
    if (!project) {
      setNotifications([]);
      setNotificationsError('');
      setNotificationsLoading(false);
      return () => { active = false; };
    }

    const refresh = async () => {
      setNotificationsLoading(true);
      setNotificationsError('');
      try {
        const result = await portalRequest<{ notifications: PortalNotification[] }>(
          `/api/portal/notifications?projectId=${encodeURIComponent(project.id)}`
        );
        if (active) setNotifications(result.notifications);
      } catch (cause) {
        if (active) setNotificationsError(cause instanceof Error ? cause.message : t.notificationLoadFailed);
      } finally {
        if (active) setNotificationsLoading(false);
      }
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), 60_000);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [project?.id, notificationsRefreshToken, language]);

  useEffect(() => {
    if (feedbackChatOpen) {
      feedbackMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [feedbackChatOpen, feedbackItems]);

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
      setPasswordVisible(false);
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

  const submitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!project) return;
    setFeedbackSubmitting(true);
    setFeedbackError('');
    setFeedbackNotice('');
    const values = new FormData(form);
    try {
      const result = await portalRequest<{ feedback: ClientFeedback }>('/api/portal/client/updates?resource=feedback', {
        method: 'POST',
        body: JSON.stringify({
          projectId: project.id,
          message: values.get('message'),
        }),
      });
      setFeedbackItems((current) => [result.feedback, ...current]);
      setFeedbackNotice(t.feedbackSent);
      form.reset();
    } catch (cause) {
      setFeedbackError(cause instanceof Error ? cause.message : 'Feedback tidak dapat dikirim.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const uploadPaymentProof = async (event: React.ChangeEvent<HTMLInputElement>, item: BillingItem) => {
    const file = event.currentTarget.files?.[0];
    if (!file || !project) return;
    const input = event.currentTarget;
    setBillingBusyId(item.id);
    setError('');
    let uploadStarted = false;
    try {
      const billingEndpoint = `/api/portal/client/billing?projectId=${encodeURIComponent(project.id)}`;
      const { uploadUrl, item: uploadingItem, cleanupFailed } = await portalRequest<{ uploadUrl: string; item: BillingItem; cleanupFailed: boolean }>(billingEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          action: 'start-upload',
          itemId: item.id,
          file: { name: file.name, contentType: file.type, size: file.size },
        }),
      });
      uploadStarted = true;
      setBillingItems((current) => current.map((entry) => entry.id === item.id ? uploadingItem : entry));
      if (cleanupFailed) setError(t.billingCleanupWarning);
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!response.ok) throw new Error('Bukti pembayaran gagal diunggah ke penyimpanan.');
      const { item: submittedItem } = await portalRequest<{ item: BillingItem }>(billingEndpoint, {
        method: 'POST',
        body: JSON.stringify({ action: 'complete-upload', itemId: item.id }),
      });
      setBillingItems((current) => current.map((entry) => entry.id === item.id ? submittedItem : entry));
      setBillingNotice(t.billingSubmitted);
      input.value = '';
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Bukti pembayaran tidak dapat diunggah.';
      if (uploadStarted) {
        try {
          const { item: canceledItem } = await portalRequest<{ item: BillingItem }>(`/api/portal/client/billing?projectId=${encodeURIComponent(project.id)}`, {
            method: 'POST',
            body: JSON.stringify({ action: 'cancel-upload', itemId: item.id }),
          });
          setBillingItems((current) => current.map((entry) => entry.id === item.id ? canceledItem : entry));
        } catch (cancelCause) {
          const cancelMessage = cancelCause instanceof Error ? cancelCause.message : 'Unggahan tidak dapat dibatalkan.';
          setError(`${message} ${cancelMessage}`);
          return;
        }
      }
      setError(message);
    } finally {
      setBillingBusyId('');
    }
  };

  const submitChangeRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setChangeSubmitting(true);
    setError('');
    setChangeNotice('');
    try {
      const { order } = await portalRequest<{ order: ProjectChangeOrder }>(`/api/portal/client/change-orders?projectId=${encodeURIComponent(project.id)}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'request', title: values.get('title'), description: values.get('description'), projectId: project.id }),
      });
      setChangeOrders((current) => [order, ...current]);
      form.reset();
      setChangeNotice(t.changeRequestSent);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Permintaan perubahan tidak dapat dikirim.');
    } finally {
      setChangeSubmitting(false);
    }
  };

  const respondToChange = async (order: ProjectChangeOrder, decision: 'approved' | 'rejected', responseNote: string) => {
    if (!project) return;
    if (!window.confirm(decision === 'approved' ? t.changeConfirmApprove : t.changeConfirmReject)) return;
    setChangeSubmitting(true);
    setError('');
    setChangeNotice('');
    try {
      const { order: updatedOrder } = await portalRequest<{ order: ProjectChangeOrder }>(`/api/portal/client/change-orders?projectId=${encodeURIComponent(project?.id ?? '')}`, {
        method: 'PATCH',
        body: JSON.stringify({ orderId: order.id, decision, responseNote }),
      });
      setChangeOrders((current) => current.map((entry) => entry.id === order.id ? updatedOrder : entry));
      setChangeNotice(t.changeDecisionSaved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tanggapan perubahan tidak dapat disimpan.');
    } finally {
      setChangeSubmitting(false);
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
      setFeedbackChatOpen(false);
      setShowAllActivity(false);
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
      setFeedbackChatOpen(false);
      setError('');
      closePasswordChange();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tidak dapat keluar dari portal.');
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const openActivityPage = () => {
    setShowAllActivity(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openProjectSection = (sectionId: string) => {
    if (showAllActivity) {
      setShowAllActivity(false);
      window.setTimeout(() => scrollToSection(sectionId), 0);
      return;
    }
    scrollToSection(sectionId);
  };
  const getNotificationLabel = (eventType: PortalNotification['event_type']) => {
    switch (eventType) {
      case 'project_update':
      case 'project_update_edited':
        return t.updated;
      case 'feedback_received':
      case 'feedback_replied':
        return t.feedbackReply;
      case 'billing_created':
        return t.billingTitle;
      case 'payment_review':
        return t.billingPending;
      case 'payment_paid':
        return t.billingPaid;
      case 'payment_rejected':
        return t.billingRejected;
      case 'change_requested':
        return t.changeTitle;
      case 'change_proposed':
        return t.changePending;
      case 'change_decided':
        return t.changeTitle;
    }
  };
  const openNotification = async (notification: PortalNotification) => {
    if (!project) return;
    try {
      await portalRequest(`/api/portal/notifications?projectId=${encodeURIComponent(project.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ notificationId: notification.id }),
      });
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item
      ));
    } catch (cause) {
      setNotificationsError(cause instanceof Error ? cause.message : t.notificationLoadFailed);
      return;
    }

    if (notification.event_type === 'feedback_replied') {
      setShowAllActivity(false);
      setFeedbackChatOpen(true);
    } else if (['billing_created', 'payment_review', 'payment_paid', 'payment_rejected'].includes(notification.event_type)) {
      openProjectSection('project-billing');
    } else if (['change_requested', 'change_proposed', 'change_decided'].includes(notification.event_type)) {
      openProjectSection('project-changes');
    } else {
      openProjectSection('project-updates');
    }
  };
  const projectDocuments = updates.flatMap((update) =>
    update.attachments
      .map((attachment) => ({ ...attachment, updateTitle: update.title, updateDate: update.update_date }))
  );
  const filteredProjectDocuments = projectDocuments.filter((attachment) => {
    const query = documentSearch.trim().toLowerCase();
    const matchesQuery = !query
      || attachment.name.toLowerCase().includes(query)
      || attachment.updateTitle.toLowerCase().includes(query);
    const matchesType = documentType === 'all' || getPortalDocumentKind(attachment) === documentType;
    const matchesFrom = !documentDateFrom || attachment.updateDate >= documentDateFrom;
    const matchesTo = !documentDateTo || attachment.updateDate <= documentDateTo;
    return matchesQuery && matchesType && matchesFrom && matchesTo;
  });
  const mobileNavigation = [
    { id: 'client-dashboard', label: t.dashboardNav, icon: <LayoutDashboard size={17} />, onClick: () => scrollToSection('client-dashboard') },
    { id: 'project-updates', label: t.updated, icon: <Clock3 size={17} />, onClick: () => scrollToSection('project-updates') },
    { id: 'project-documents', label: t.documents, icon: <FileText size={17} />, onClick: () => scrollToSection('project-documents') },
    { id: 'project-billing', label: t.billingTitle, icon: <FileCheck2 size={17} />, onClick: () => scrollToSection('project-billing') },
    { id: 'project-changes', label: t.changeTitle, icon: <ClipboardList size={17} />, onClick: () => scrollToSection('project-changes') },
    { id: 'feedback', label: t.feedbackNav, icon: <MessageCircle size={17} />, onClick: () => setFeedbackChatOpen(true) },
  ];
  const dashboardCards = [
    { id: 'project-updates', label: t.updated, count: updates.length, icon: <Clock3 size={18} /> },
    { id: 'project-documents', label: t.documents, count: projectDocuments.length, icon: <FileText size={18} /> },
    { id: 'project-billing', label: t.dashboardOpenBills, count: billingItems.filter((item) => item.status !== 'paid').length, icon: <FileCheck2 size={18} /> },
    { id: 'project-changes', label: t.dashboardPendingChanges, count: changeOrders.filter((order) => order.status === 'requested' || order.status === 'pending_approval').length, icon: <ClipboardList size={18} /> },
  ];

  return (
    <div className={`portal-readable min-h-screen overflow-x-clip bg-[#f5f4f0] ${project ? 'pb-28 pt-16 sm:pb-20 sm:pt-24 md:pt-32' : 'pb-10 pt-8 sm:pt-10 md:pt-12'} text-neutral-900 dark:bg-[#0b0c0b] dark:text-white`}>
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-7">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-4 py-2.5 text-xs font-medium text-neutral-600 shadow-sm transition-colors hover:border-neutral-400 hover:text-neutral-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300 dark:hover:border-white/25 dark:hover:text-white">
            <ArrowDownLeft size={15} /> {t.back}
          </Link>
          <PortalLanguageSwitcher language={language} onChange={setLanguage} />
        </div>

        {loading ? (
          <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:min-h-[50vh] sm:rounded-3xl sm:p-10 dark:border-white/10 dark:bg-neutral-900">
            <span className="mb-5 h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-[#8c795e] dark:border-white/10 dark:border-t-bronze-400" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{t.loading}</p>
          </div>
        ) : project ? (
          showAllActivity ? (
          <section className="space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 dark:border-white/10 dark:bg-neutral-900">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">{project.project_code}</p>
                <h1 className="mt-1 font-display text-2xl font-medium tracking-tight">{t.activityCenter}</h1>
              </div>
              <button type="button" onClick={() => setShowAllActivity(false)} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-xs font-medium text-neutral-600 transition-colors hover:border-bronze-500 hover:text-bronze-700 dark:border-white/10 dark:text-neutral-300 dark:hover:text-bronze-300">
                <ArrowLeft size={14} /> {t.activityBack}
              </button>
            </header>
            <PortalActivityPanel
              notifications={notifications}
              showAll
              labels={{
                actions: t.actionCenter,
                activity: t.activityCenter,
                emptyActions: t.actionCenterEmpty,
                emptyActivity: t.activityCenterEmpty,
                needsAttention: t.needsAttention,
                unread: t.unread,
                refresh: t.notificationRefresh,
                loading: t.notificationLoading,
                open: t.notificationOpen,
                viewAll: t.viewAll,
              }}
              error={notificationsError}
              loading={notificationsLoading}
              onRefresh={() => setNotificationsRefreshToken((current) => current + 1)}
              onOpen={openNotification}
              getEventLabel={getNotificationLabel}
              formatDate={(value) => formatDateTime(value, language)}
            />
          </section>
          ) : (
          <section>
            <div className="relative mb-5 min-w-0 overflow-hidden rounded-2xl bg-[#23241f] p-4 text-white shadow-[0_30px_90px_rgba(27,25,20,0.22)] sm:mb-6 sm:rounded-[2rem] sm:p-9 lg:p-12">
              <img src={clientPortalImage} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-25" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#171814]/95 via-[#1d1e19]/80 to-[#25241f]/35" />
              <div className="pointer-events-none absolute -right-24 -top-40 h-96 w-96 rounded-full border border-white/[0.09]" />
              <div className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full border border-white/[0.09]" />
              <div className="relative grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div className="min-w-0">
                  <p className="mb-5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 sm:text-[11px]">
                    <span>{t.eyebrow}</span><span className="text-white/30">/</span><span>{project.project_code}</span>
                  </p>
                  <h1 className="max-w-3xl break-words font-display text-4xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">{project.project_name}</h1>
                  <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75 sm:text-base">
                    <span className="font-medium text-white">{project.client_name}</span>
                    <span className="hidden text-white/35 sm:inline">·</span>
                    <span className="inline-flex items-center gap-2"><MapPin size={16} />{project.location || t.location}</span>
                    <span className="hidden text-white/35 sm:inline">·</span>
                    <span>{t.projectType}: {project.project_type === 'Architecture' ? t.architecture : project.project_type === 'Interior' ? t.interior : project.project_type === 'Construction' ? t.construction : t.projectTypeNotSet}</span>
                    {project.client_phone && (
                      <>
                        <span className="hidden text-white/35 sm:inline">·</span>
                        <a href={`tel:${project.client_phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 hover:text-white">
                          <Phone size={15} />{t.clientPhone}: {project.client_phone}
                        </a>
                      </>
                    )}
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
                <div className="flex flex-wrap gap-2.5 md:justify-end">
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
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-4 py-2.5 text-xs font-medium text-white/90 transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <LockKeyhole size={14} /> {t.changePassword}
                  </button>
                  <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-4 py-2.5 text-xs font-medium text-white/90 transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white">
                    <LogOut size={14} /> {t.logout}
                  </button>
                </div>
              </div>
              <div className="relative mt-8 flex flex-col gap-6 border-t border-white/15 pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-7">
                <div className="flex items-start gap-2.5 text-sm leading-6 text-white/70 sm:items-center">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-white/75 sm:mt-0" /> {t.secure}
                </div>
                <div className="flex items-center gap-5 rounded-2xl border border-white/15 bg-black/20 px-4 py-3 backdrop-blur-sm sm:min-w-64 sm:gap-6 sm:px-5 sm:py-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="4" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#b39b74" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(project.progress_percent / 100) * 213.6} 213.6`} />
                    </svg>
                    <span className="font-display text-lg font-semibold tabular-nums">{project.progress_percent}<span className="text-xs text-white/65">%</span></span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/55">{t.latest}</p>
                    <p className="mt-1 text-sm font-medium text-white">{project.progress_percent === 100 ? t.complete : t.inProgress}</p>
                    <p className="mt-1 text-xs text-white/50">{project.project_code}</p>
                  </div>
                </div>
              </div>
            </div>

            <section id="client-dashboard" aria-labelledby="client-dashboard-title" className="mb-6 scroll-mt-24">
              <div className="mb-4">
                <h2 id="client-dashboard-title" className="font-display text-xl font-medium tracking-tight sm:text-2xl">{t.dashboard}</h2>
                <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400 sm:text-sm">{t.dashboardHint}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {dashboardCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => openProjectSection(card.id)}
                    className="group flex min-w-0 items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left shadow-sm transition hover:border-[#8c795e]/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8c795e] sm:gap-4 sm:p-4 dark:border-white/10 dark:bg-neutral-900 dark:hover:border-bronze-400/50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400">{card.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-medium text-neutral-500 dark:text-neutral-400 sm:text-xs">{card.label}</span>
                      <span className="mt-1 block font-display text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">{card.count.toString().padStart(2, '0')}</span>
                    </span>
                    <ArrowUpRight size={14} className="shrink-0 text-neutral-400 transition-colors group-hover:text-[#8c795e] dark:group-hover:text-bronze-400" />
                  </button>
                ))}
              </div>
            </section>

            {error && <ErrorBanner message={error} />}

            <PortalActivityPanel
              notifications={notifications}
              labels={{
                actions: t.actionCenter,
                activity: t.activityCenter,
                emptyActions: t.actionCenterEmpty,
                emptyActivity: t.activityCenterEmpty,
                needsAttention: t.needsAttention,
                unread: t.unread,
                refresh: t.notificationRefresh,
                loading: t.notificationLoading,
                open: t.notificationOpen,
                viewAll: t.viewAll,
              }}
              error={notificationsError}
              loading={notificationsLoading}
              onRefresh={() => setNotificationsRefreshToken((current) => current + 1)}
              onViewAll={openActivityPage}
              onOpen={openNotification}
              getEventLabel={getNotificationLabel}
              formatDate={(value) => formatDateTime(value, language)}
            />

            {passwordChangeOpen && (
              <form onSubmit={changePassword} className="mb-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-8 dark:border-white/10 dark:bg-neutral-900">
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

            <div className="grid gap-3 sm:gap-4 md:grid-cols-[1.3fr_0.9fr]">
              <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_18px_50px_rgba(27,25,20,0.05)] sm:rounded-3xl sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6 sm:gap-4">
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
              <div className="relative flex min-h-[160px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-[#eeece6] p-4 text-neutral-900 shadow-sm sm:min-h-[190px] sm:rounded-3xl sm:p-8 dark:border-white/10 dark:bg-neutral-900 dark:text-white">
                <span className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 rounded-full border border-[#8c795e]/15" />
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

            <section id="project-documents" className="scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7 dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><FileText size={18} /></span>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{project.project_code}</p>
                  <h2 className="mt-1 font-display text-xl font-medium tracking-tight">{t.documents}</h2>
                </div>
                <span className="ml-auto rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-xs tabular-nums text-neutral-500 dark:border-white/10 dark:bg-white/[0.03]">{filteredProjectDocuments.length.toString().padStart(2, '0')}</span>
              </div>
              {projectDocuments.length === 0 ? (
                <p className="py-2 text-sm text-neutral-500">{t.documentsEmpty}</p>
              ) : (
                <>
                  <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="relative sm:col-span-2 lg:col-span-1">
                      <span className="sr-only">{t.documentsSearch}</span>
                      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input value={documentSearch} onChange={(event) => setDocumentSearch(event.target.value)} placeholder={t.documentsSearch} className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#8c795e] dark:border-white/10 dark:bg-neutral-950" />
                    </label>
                    <label>
                      <span className="sr-only">{t.documentsType}</span>
                      <select value={documentType} onChange={(event) => setDocumentType(event.target.value as PortalDocumentKind | 'all')} className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-[#8c795e] dark:border-white/10 dark:bg-neutral-950 dark:[color-scheme:dark]">
                        <option value="all">{t.documentsAllTypes}</option>
                        <option value="image">{t.documentsImage}</option>
                        <option value="pdf">{t.documentsPdf}</option>
                        <option value="word">{t.documentsWord}</option>
                        <option value="spreadsheet">{t.documentsSpreadsheet}</option>
                        <option value="other">{t.documentsOther}</option>
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">{t.documentsFrom}</span>
                      <input aria-label={t.documentsFrom} type="date" value={documentDateFrom} onChange={(event) => setDocumentDateFrom(event.target.value)} className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-600 outline-none transition focus:border-[#8c795e] dark:border-white/10 dark:bg-neutral-950 dark:text-neutral-300 dark:[color-scheme:dark]" />
                    </label>
                    <label>
                      <span className="sr-only">{t.documentsTo}</span>
                      <input aria-label={t.documentsTo} type="date" value={documentDateTo} onChange={(event) => setDocumentDateTo(event.target.value)} className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-600 outline-none transition focus:border-[#8c795e] dark:border-white/10 dark:bg-neutral-950 dark:text-neutral-300 dark:[color-scheme:dark]" />
                    </label>
                  </div>
                  {filteredProjectDocuments.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500 dark:border-white/10">{t.documentsNoResults}</p>
                  ) : (
                    <ul className="grid gap-3 md:grid-cols-2">
                      {filteredProjectDocuments.map((attachment) => {
                        const href = attachment.downloadUrl ?? attachment.url;
                        const isImage = getPortalDocumentKind(attachment) === 'image';
                        const canPreview = canPreviewPortalDocument(attachment) && Boolean(attachment.url);
                        return (
                          <li key={attachment.path} className="flex min-w-0 items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 sm:p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                            {isImage && attachment.url ? (
                              <button type="button" onClick={() => setPreviewAttachment(attachment)} aria-label={`${t.previewFile}: ${attachment.name}`} className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze-500 sm:h-16 sm:w-20">
                                <img src={attachment.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                              </button>
                            ) : (
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-bronze-600 dark:bg-white/[0.06] dark:text-bronze-400"><FileText size={18} /></span>
                            )}
                            <div className="min-w-0 flex-1">
                              {canPreview ? (
                                <button type="button" onClick={() => setPreviewAttachment(attachment)} className="block max-w-full truncate text-left text-sm font-medium text-neutral-800 transition-colors hover:text-bronze-700 dark:text-neutral-100 dark:hover:text-bronze-300">{attachment.name}</button>
                              ) : href ? (
                                <a href={href} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium text-neutral-800 transition-colors hover:text-bronze-700 dark:text-neutral-100 dark:hover:text-bronze-300">{attachment.name}</a>
                              ) : (
                                <p className="truncate text-sm font-medium">{attachment.name}</p>
                              )}
                              <p className="mt-1 truncate text-xs text-neutral-500">{attachment.updateTitle} · {formatDate(attachment.updateDate, language)}</p>
                            </div>
                            {canPreview && <button type="button" onClick={() => setPreviewAttachment(attachment)} aria-label={`${t.previewFile}: ${attachment.name}`} title={t.previewFile} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-bronze-500 hover:text-bronze-600 dark:border-white/10 dark:text-neutral-300"><Eye size={16} /></button>}
                            {href && <a href={href} target="_blank" rel="noreferrer" aria-label={`${t.downloadFile}: ${attachment.name}`} title={t.downloadFile} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-bronze-500 hover:text-bronze-600 dark:border-white/10 dark:text-neutral-300"><Download size={15} /></a>}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
            </section>

            <section id="project-billing" className="scroll-mt-24 mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:mt-10 sm:rounded-3xl sm:p-7 dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><FileCheck2 size={18} /></span>
                <div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{project.project_code}</p><h2 className="mt-1 font-display text-xl font-medium tracking-tight">{t.billingTitle}</h2></div>
              </div>
              {billingNotice && <p role="status" className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300">{billingNotice}</p>}
              {billingItems.length === 0 ? <p className="py-2 text-sm text-neutral-500">{t.billingEmpty}</p> : (
                <ul className="grid gap-3 lg:grid-cols-2">
                  {billingItems.map((item) => (
                    <li key={item.id} className="min-w-0 rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 sm:p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><h3 className="break-words font-medium">{item.title}</h3><p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">{formatCurrency(item.amount, language)}</p><p className="mt-1 text-xs text-neutral-500">{t.billingDueDate}: {formatDate(item.due_date, language)}</p></div>
                        <span className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-medium ${item.status === 'paid' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : item.status === 'pending_review' || item.status === 'uploading' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : item.status === 'rejected' || (item.status === 'unpaid' && item.due_date < currentDate()) ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-neutral-200/70 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'}`}>
                          {item.status === 'paid' ? t.billingPaid : item.status === 'pending_review' ? t.billingPending : item.status === 'rejected' ? t.billingRejected : item.status === 'uploading' ? t.billingUploading : item.due_date < currentDate() ? t.billingOverdue : t.billingUnpaid}
                        </span>
                      </div>
                      {item.payment_proof_url && <a href={item.payment_proof_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-bronze-700 underline underline-offset-2 dark:text-bronze-300"><FileText size={14} /> {t.billingProof}: {item.payment_proof_name || t.viewFile}</a>}
                      {item.payment_proof_submitted_at && item.status !== 'uploading' && item.status !== 'unpaid' && (
                        <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 size={14} className="shrink-0" />
                          <span>{t.billingProofReceived} · {t.billingSubmittedAt}: {formatDateTime(item.payment_proof_submitted_at, language)}</span>
                        </p>
                      )}
                      {item.payment_proof_unavailable && <p role="status" className="mt-3 rounded-lg bg-amber-500/10 p-3 text-xs leading-5 text-amber-800 dark:text-amber-200">{t.billingProofLinkUnavailable}</p>}
                      {item.payment_review_note && <p className="mt-3 rounded-lg bg-red-500/5 p-3 text-xs leading-5 text-neutral-600 dark:text-neutral-300"><span className="font-medium">{t.billingReviewNote}: </span>{item.payment_review_note}</p>}
                      {(item.status === 'unpaid' || item.status === 'rejected') && (
                        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-4 text-center transition-colors hover:border-bronze-500 dark:border-white/15 dark:bg-neutral-950">
                          <span className="inline-flex items-center gap-2 text-xs font-medium"><Upload size={15} className="text-bronze-500" />{billingBusyId === item.id ? t.billingUploadingAction : t.billingUpload}</span>
                          {item.due_date < currentDate() && <span className="text-[10px] leading-5 text-amber-700 dark:text-amber-300">{t.billingOverdueUploadHint}</span>}
                          <span className="text-[10px] leading-5 text-neutral-500">{t.billingProofHint}</span>
                          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" disabled={Boolean(billingBusyId)} className="sr-only" onChange={(event) => void uploadPaymentProof(event, item)} />
                        </label>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section id="project-changes" className="scroll-mt-24 mt-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7 dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><ClipboardList size={18} /></span>
                <div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{project.project_code}</p><h2 className="mt-1 font-display text-xl font-medium tracking-tight">{t.changeTitle}</h2></div>
              </div>
              <p className="mb-5 text-sm leading-6 text-neutral-500">{t.changeDescription}</p>
              {changeNotice && <p role="status" className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300">{changeNotice}</p>}
              {changeOrders.length === 0 ? <p className="mb-5 text-sm text-neutral-500">{t.changeEmpty}</p> : (
                <ul className="mb-5 space-y-3">
                  {changeOrders.map((order) => (
                    <li key={order.id} className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 sm:p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0"><p className="text-[9px] uppercase tracking-wider text-neutral-400">{order.requested_by === 'client' ? t.changeClientRequest : t.changeProposal} · {formatDate(order.created_at, language)}</p><h3 className="mt-1 break-words font-medium">{order.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600 dark:text-neutral-300">{order.description}</p></div>
                        <span className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-medium ${order.status === 'approved' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : order.status === 'rejected' ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                          {order.status === 'requested' ? t.changeRequested : order.status === 'pending_approval' ? t.changePending : order.status === 'approved' ? t.changeApproved : t.changeRejected}
                        </span>
                      </div>
                      {order.status !== 'requested' && <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-300">{t.changeCost}: {formatCurrency(order.cost_impact, language)} · {t.changeSchedule}: {order.schedule_impact_days} {language === 'EN' ? 'days' : language === 'CN' ? '天' : 'hari'}</p>}
                      {order.admin_note && <p className="mt-3 rounded-lg bg-white/70 p-3 text-xs leading-5 text-neutral-600 dark:bg-white/[0.03] dark:text-neutral-300"><span className="font-medium">{t.changeAdminNote}: </span>{order.admin_note}</p>}
                      {order.client_response_note && <p className="mt-3 rounded-lg bg-[#f5f2ec] p-3 text-xs leading-5 text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-300">{order.client_response_note}</p>}
                      {order.status === 'pending_approval' && (
                        <form className="mt-4 border-t border-neutral-200 pt-4 dark:border-white/10">
                          <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeResponse}</span><textarea name="responseNote" maxLength={1000} rows={2} className="w-full resize-y rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                          <div className="mt-3 flex flex-wrap justify-end gap-2">
                            <button type="button" disabled={changeSubmitting} onClick={(event) => {
                              const form = event.currentTarget.closest('form');
                              const note = form ? String(new FormData(form).get('responseNote') ?? '') : '';
                              void respondToChange(order, 'rejected', note);
                            }} className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 px-4 py-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-500/5 disabled:opacity-50 dark:text-red-300"><X size={14} /> {t.changeReject}</button>
                            <button type="button" disabled={changeSubmitting} onClick={(event) => {
                              const form = event.currentTarget.closest('form');
                              const note = form ? String(new FormData(form).get('responseNote') ?? '') : '';
                              void respondToChange(order, 'approved', note);
                            }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"><Check size={14} /> {t.changeApprove}</button>
                          </div>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <form onSubmit={submitChangeRequest} className="grid gap-4 border-t border-neutral-100 pt-5 dark:border-white/10">
                <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeRequestTitle}</span><input name="title" required maxLength={120} className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeRequestDetails}</span><textarea name="description" required maxLength={5000} rows={3} className="w-full resize-y rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                <div className="flex justify-end"><button disabled={changeSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-bronze-600 disabled:cursor-wait disabled:opacity-50 dark:bg-white dark:text-neutral-950"><Send size={14} /> {changeSubmitting ? t.changeSending : t.changeSend}</button></div>
              </form>
            </section>

            <div id="project-updates" className="scroll-mt-24 mt-9 sm:mt-12">
              <div className="mb-5 flex items-end justify-between gap-3 border-b border-neutral-300 pb-4 dark:border-white/10 sm:mb-6 sm:gap-4 sm:pb-5">
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
                    <li key={update.id} className="grid min-w-0 gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-[160px_1fr] sm:gap-8 sm:p-7 dark:border-white/10 dark:bg-neutral-900">
                      <div className="flex items-center justify-between gap-3 sm:block">
                        <time className="text-xs leading-5 text-neutral-500">
                          {formatDate(update.update_date, language)}
                        </time>
                        <span className="rounded-full bg-[#f4f1eb] px-3 py-1.5 text-[11px] font-medium tabular-nums text-[#746349] dark:bg-white/[0.07] dark:text-neutral-300">{update.progress_percent}%</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-medium tracking-tight sm:text-2xl">{update.title}</h3>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-600 dark:text-neutral-400">{update.description}</p>
                        {update.attachments.some((attachment) => attachment.contentType.startsWith('image/')) && (
                          <div className="mt-6 space-y-6 border-t border-neutral-100 pt-5 dark:border-white/10">
                            {update.attachments.some((attachment) => attachment.contentType.startsWith('image/')) && (
                              <section>
                                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500">{t.photo}</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {update.attachments.filter((attachment) => attachment.contentType.startsWith('image/')).map((attachment) => (
                                    <div key={attachment.path} className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-neutral-100 dark:bg-white/5">
                                      <button type="button" onClick={() => setPreviewAttachment(attachment)} aria-label={`${t.previewFile}: ${attachment.name}`} className="block h-full w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-bronze-500">
                                        <img src={attachment.url} alt={`${t.photo}: ${attachment.name}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-xs text-white">{attachment.name}</span>
                                      </button>
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
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            {feedbackChatOpen && (
              <div id="client-feedback-chat" role="dialog" aria-modal="true" aria-labelledby="client-feedback-title" className="fixed inset-x-3 bottom-20 z-50 flex h-[min(600px,calc(100dvh-7rem))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_80px_rgba(27,25,20,0.22)] dark:border-white/10 dark:bg-neutral-900 dark:shadow-black/40 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:h-[min(600px,74vh)] sm:w-[420px]">
                <header className="flex items-center gap-3 bg-[#272925] px-4 py-4 text-white">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-bronze-300"><MessageCircle size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <h2 id="client-feedback-title" className="truncate text-sm font-semibold">{t.feedbackTitle}</h2>
                    <p className="mt-1 truncate text-[10px] text-white/60">{project.project_name}</p>
                  </div>
                  <button type="button" onClick={() => setFeedbackChatOpen(false)} aria-label={t.feedbackClose} title={t.feedbackClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                    <X size={18} />
                  </button>
                </header>
                <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f6f2] px-4 py-5 dark:bg-[#111210]" aria-live="polite">
                  {feedbackItems.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#ece8df] text-[#8c795e] dark:bg-white/[0.07] dark:text-bronze-400"><MessageCircle size={20} /></span>
                      <p className="text-sm font-medium">{t.feedbackTitle}</p>
                      <p className="mt-2 text-xs leading-5 text-neutral-500">{t.feedbackDescription}</p>
                    </div>
                  ) : (
                    [...feedbackItems].reverse().map((item) => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-neutral-900 px-4 py-3 text-white dark:bg-white dark:text-neutral-950">
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">{item.message}</p>
                            <time className="mt-2 block text-right font-mono text-[9px] text-white/50 dark:text-neutral-500">{formatDateTime(item.created_at, language)}</time>
                          </div>
                        </div>
                        {item.reply ? (
                          <div className="flex justify-start">
                            <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-neutral-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.06]">
                              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-700 dark:text-neutral-200">{item.reply}</p>
                              <p className="mt-2 text-right font-mono text-[9px] text-neutral-400">
                                {item.replied_by === 'staff' ? t.feedbackReplyByStaff : t.feedbackReplyByAdmin}
                                {item.replied_at ? ` · ${formatDateTime(item.replied_at, language)}` : ''}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="pr-1 text-right text-[10px] text-neutral-400">{t.feedbackWaiting}</p>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={feedbackMessagesEndRef} />
                </div>
                {feedbackError && <p role="alert" className="border-t border-red-500/20 bg-red-500/5 px-4 py-2 text-xs text-red-600 dark:text-red-300">{feedbackError}</p>}
                {feedbackNotice && <p role="status" className="border-t border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-300">{feedbackNotice}</p>}
                <form onSubmit={submitFeedback} className="flex items-end gap-2 border-t border-neutral-200 bg-white p-3 dark:border-white/10 dark:bg-neutral-900">
                  <label htmlFor="client-feedback-message" className="sr-only">{t.feedbackMessage}</label>
                  <textarea id="client-feedback-message" name="message" required minLength={1} maxLength={5000} rows={2} placeholder={t.feedbackPlaceholder} className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm leading-5 outline-none transition focus:border-[#8c795e] focus:ring-2 focus:ring-[#8c795e]/10 dark:border-white/10 dark:bg-neutral-950 dark:focus:border-bronze-400" />
                  <button type="submit" disabled={feedbackSubmitting} aria-label={feedbackSubmitting ? t.feedbackSending : t.feedbackSend} title={feedbackSubmitting ? t.feedbackSending : t.feedbackSend} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition-colors hover:bg-bronze-600 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                    <Send size={17} />
                  </button>
                </form>
              </div>
            )}
            <button type="button" onClick={() => setFeedbackChatOpen((open) => !open)} aria-label={feedbackChatOpen ? t.feedbackClose : t.feedbackOpen} aria-expanded={feedbackChatOpen} aria-controls={feedbackChatOpen ? 'client-feedback-chat' : undefined} title={feedbackChatOpen ? t.feedbackClose : t.feedbackOpen} className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#272925] text-white shadow-[0_12px_35px_rgba(27,25,20,0.28)] transition hover:-translate-y-0.5 hover:bg-bronze-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-500 dark:bg-white dark:text-neutral-950 dark:hover:bg-bronze-300 md:bottom-5">
              {feedbackChatOpen ? <X size={21} /> : <MessageCircle size={21} />}
              {!feedbackChatOpen && feedbackItems.some((item) => !item.reply) && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-bronze-500 dark:border-neutral-900" />}
            </button>
            <nav aria-label={t.journal} className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-neutral-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-8px_24px_rgba(27,25,20,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#111210]/95 md:hidden">
              {mobileNavigation.map((item) => (
                <button key={item.id} type="button" onClick={item.onClick} aria-label={item.label} className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-[8px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-white">
                  <span className="text-[#8c795e] dark:text-bronze-400">{item.icon}</span>
                  <span className="w-full truncate text-center">{item.label}</span>
                </button>
              ))}
            </nav>
            {previewAttachment && (
              <PortalFilePreview
                attachment={previewAttachment}
                labels={{ preview: t.previewFile, download: t.downloadFile, close: t.closePreview }}
                onClose={() => setPreviewAttachment(null)}
              />
            )}
          </section>
          )
        ) : (
          <div className="portal-login mx-auto grid min-w-0 max-w-[1180px] overflow-hidden rounded-[1.5rem] border border-[#deddd6] bg-[#080908] shadow-[0_24px_70px_rgba(27,25,20,0.14)] sm:rounded-[1.75rem] lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
            <section className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-[#252722] p-5 text-white sm:min-h-[430px] sm:p-9 lg:min-h-[560px] lg:p-12">
              <img src={clientPortalImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center opacity-55" />
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/35 via-neutral-950/20 to-neutral-950/85" />
              <div className="relative">
                <p className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b8c89f]" /> LINIER STUDIO <span className="text-white/35">/</span> CLIENT JOURNAL
                </p>
                <div className="mt-12 max-w-xl sm:mt-16">
                  <h1 className="font-display text-3xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">{t.title}</h1>
                  <p className="mt-4 max-w-md text-xs leading-6 text-white/75 sm:mt-5 sm:text-sm sm:leading-7">{t.subtitle}</p>
                </div>
              </div>
              <div className="relative mt-8 flex justify-end border-t border-white/20 pt-4 sm:pt-5">
                <Link to="/portal/admin" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-[11px] font-medium text-white/85 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white">
                  {t.admin} <ArrowUpRight size={14} />
                </Link>
              </div>
            </section>

            <form onSubmit={resetMode ? requestPasswordReset : signIn} className="flex flex-col justify-center bg-[#080908] px-5 py-8 text-white sm:px-10 sm:py-12 lg:px-12 lg:py-14">
              <div className="mb-7 flex items-center gap-3 sm:mb-9">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-[#c5d2b0]">
                  <LockKeyhole size={16} strokeWidth={1.5} />
                </span>
                <span className="text-sm font-semibold tracking-wide">Linier <span className="font-normal text-white/40">/ Studio</span></span>
              </div>
              <h2 className="mb-7 font-display text-3xl font-medium tracking-tight sm:text-4xl">{resetMode ? t.resetTitle : t.signIn}</h2>
              <label className="mb-6 block">
                <span className="mb-2 block text-sm font-medium text-white/80">{resetMode ? t.resetIdentifier : t.loginIdentifier}</span>
                <input
                  autoComplete="username"
                  autoCapitalize="none"
                  value={projectCode}
                  onChange={(event) => setProjectCode(event.target.value)}
                  required
                  maxLength={254}
                  className="w-full rounded-lg border border-white/15 bg-[#111210] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#b8c89f] focus:ring-4 focus:ring-[#b8c89f]/10"
                />
              </label>
              {resetMode ? (
                <label className="mb-6 block">
                  <span className="mb-2 block text-sm font-medium text-white/80">{t.whatsapp}</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+6281234567890"
                    value={whatsappNumber}
                    onChange={(event) => setWhatsappNumber(event.target.value)}
                    required
                    maxLength={24}
                    className="w-full rounded-lg border border-white/15 bg-[#111210] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#b8c89f] focus:ring-4 focus:ring-[#b8c89f]/10"
                  />
                  <span className="mt-2 block text-xs text-white/45">{t.whatsappHint}</span>
                </label>
              ) : (
                <div className="mb-2">
                  <label htmlFor="client-portal-password" className="mb-2 block text-sm font-medium text-white/80">{t.password}</label>
                  <div className="relative">
                    <input
                      id="client-portal-password"
                      type={passwordVisible ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      maxLength={256}
                      className="w-full rounded-lg border border-white/15 bg-[#111210] px-4 py-3.5 pr-12 text-sm text-white outline-none transition focus:border-[#b8c89f] focus:ring-4 focus:ring-[#b8c89f]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((visible) => !visible)}
                      aria-label={passwordVisible ? t.hidePassword : t.showPassword}
                      aria-pressed={passwordVisible}
                      title={passwordVisible ? t.hidePassword : t.showPassword}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-white/80 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#b8c89f]"
                    >
                      {passwordVisible ? <EyeOff size={19} strokeWidth={2.2} /> : <Eye size={19} strokeWidth={2.2} />}
                    </button>
                  </div>
                </div>
              )}
              {error && <div className="mt-5"><ErrorBanner message={error} /></div>}
              {resetNotice && <p role="status" className="mt-5 border-l-2 border-emerald-700 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">{resetNotice}</p>}
              <button disabled={submitting} className="mt-7 flex w-full items-center justify-between rounded-lg bg-[#b8c89f] px-5 py-4 text-left text-sm font-semibold text-[#171914] shadow-sm transition-colors hover:bg-[#c7d4b3] disabled:cursor-wait disabled:opacity-60">
                {submitting ? t.signingIn : resetMode ? t.sendReset : t.signIn} <ArrowUpRight size={17} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetMode((current) => !current);
                  setProjectCode('');
                  setPasswordVisible(false);
                  setError('');
                  setResetNotice('');
                }}
                className="mt-6 w-fit rounded-sm text-sm text-white/55 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8c89f]"
              >
                {resetMode ? t.backToSignIn : t.forgotPassword}
              </button>
              {!resetMode && <p className="mt-8 border-t border-white/10 pt-5 text-xs leading-6 text-white/45"><ShieldCheck size={15} className="mr-2 inline text-white/50" />{t.secure}</p>}
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

function formatCurrency(value: string | number, language: string): string {
  const locale = language === 'ID' ? 'id-ID' : language === 'CN' ? 'zh-CN' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
}

function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateTime(value: string, language: string): string {
  const locale = language === 'ID' ? 'id-ID' : language === 'CN' ? 'zh-CN' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
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
