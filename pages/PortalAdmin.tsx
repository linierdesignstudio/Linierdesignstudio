import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Bell, CalendarDays, ChartNoAxesColumn, Check, CheckCircle2, ClipboardList, Copy, Download, Eye, EyeOff, FileCheck2, FileText, FolderOpen, ImagePlus, KeyRound, Landmark, Layers, LayoutDashboard, LogOut, Mail, MapPin, MessageCircle, Moon, Phone, Plus, RefreshCw, Search, Send, Sun, Trash2, Upload, Users, X } from 'lucide-react';
import PortalActivityPanel from '../components/PortalActivityPanel';
import PortalFilePreview from '../components/PortalFilePreview';
import { useLanguage } from '../contexts/LanguageContext';
import { portalRequest, type AdminFeedback, type BillingItem, type PasswordResetRequest, type PortalAttachment, type PortalNotification, type PortalPaymentSettings, type PortalProject, type PortalUpdate, type ProjectChangeOrder } from '../lib/portalApi';
import { canPreviewPortalDocument, getPortalDocumentKind, type PortalDocumentKind } from '../lib/portalDocuments';
import PortalLanguageSwitcher from '../components/PortalLanguageSwitcher';

const copy = {
  ID: {
    eyebrow: 'LINIER STUDIO / ADMIN',
    title: 'Kelola progress proyek.',
    subtitle: 'Masuk untuk membuat akses klien dan membagikan update harian.',
    teamLoginBadge: 'AKSES TIM STUDIO',
    teamLoginWelcome: 'Selamat datang, silakan masuk ke akun Anda.',
    email: 'Email admin/staf',
    password: 'Password admin/staf',
    showPassword: 'Tampilkan password',
    hidePassword: 'Sembunyikan password',
    forgotPassword: 'Lupa password admin?',
    forgotPasswordHint: 'Hubungi administrator sistem untuk bantuan mereset password.',
    contact: 'Kontak',
    services: 'Jenis layanan',
    signIn: 'Masuk',
    signOut: 'Keluar',
    projects: 'Daftar proyek',
    createProject: 'Buat akses proyek',
    projectCode: 'ID Proyek',
    projectName: 'Nama proyek',
    clientName: 'Nama klien',
    clientEmail: 'Email klien (opsional)',
    noClientEmail: 'Email login belum diatur',
    projectType: 'Jenis proyek',
    architecture: 'Arsitektur',
    interior: 'Interior',
    construction: 'Konstruksi',
    projectTypeNotSet: 'Belum diatur',
    clientPhone: 'No. telepon klien',
    saveProjectDetails: 'Simpan detail proyek',
    savedProjectDetails: 'Detail proyek berhasil disimpan.',
    location: 'Lokasi',
    clientLoginPassword: 'Password akun',
    accountPasswordHint: 'Email klien opsional. Jika diisi, semua proyek dengan email yang sama memakai password ini untuk login lewat email atau ID proyek; jika kosong, password hanya untuk login dengan ID proyek. Password baru minimal 12 karakter.',
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
    savedProject: 'Proyek berhasil dibuat. Simpan password klien dengan aman; password tidak dapat ditampilkan kembali.',
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
    documents: 'Dokumen',
    documentsDescription: 'Foto dan dokumen yang dilampirkan pada update proyek. Pilih proyek, jenis file, atau rentang tanggal untuk menemukan lampiran.',
    documentsEmpty: 'Belum ada dokumen pada proyek ini.',
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
    previewFile: 'Pratinjau file',
    downloadFile: 'Unduh file',
    closePreview: 'Tutup pratinjau',
    documentsLoading: 'Memuat dokumen proyek...',
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
    actionCenter: 'Perlu tindakan',
    actionCenterEmpty: 'Tidak ada tindakan admin yang menunggu.',
    activityCenter: 'Aktivitas terbaru',
    activityCenterEmpty: 'Belum ada notifikasi.',
    viewAll: 'Tampilkan semuanya',
    activityBack: 'Kembali ke dashboard',
    needsAttention: 'Perlu ditindaklanjuti',
    unread: 'belum dibaca',
    notificationRefresh: 'Perbarui aktivitas',
    notificationLoading: 'Memuat aktivitas...',
    notificationOpen: 'Buka aktivitas',
    notificationLoadFailed: 'Aktivitas portal tidak dapat dimuat.',
    noDate: 'Tanggal mulai belum diatur',
    adminDashboard: 'Dashboard admin',
    studioAdmin: 'Admin studio',
    studioStaff: 'Staf studio',
    navigation: 'Navigasi',
    more: 'Lainnya',
    viewAllProjects: 'Lihat semua proyek',
    clients: 'Klien',
    clientDirectory: 'Direktori klien',
    noClients: 'Belum ada data klien.',
    clientProjects: 'Proyek klien',
    feedback: 'Feedback',
    feedbackInbox: 'Inbox feedback klien',
    feedbackCount: 'Feedback masuk',
    pendingFeedback: 'Feedback belum dibuka',
    noFeedback: 'Belum ada feedback dari klien.',
    refreshFeedback: 'Perbarui feedback',
    feedbackSubmitted: 'Dikirim',
    feedbackReply: 'Balasan untuk klien',
    feedbackReplyPlaceholder: 'Tulis balasan yang akan dilihat klien di portal...',
    feedbackSendReply: 'Kirim balasan',
    feedbackSaveReply: 'Perbarui balasan',
    feedbackReplySaved: 'Balasan feedback berhasil disimpan.',
    feedbackWaiting: 'Belum dibalas',
    feedbackReplied: 'Sudah dibalas',
    clientCount: 'Jumlah klien',
    billingNav: 'Tagihan',
    billingTitle: 'Tagihan & pembayaran',
    bankSettingsTitle: 'Rekening transfer klien',
    bankName: 'Nama bank',
    bankAccountNumber: 'Nomor rekening',
    bankAccountHolder: 'Nama pemilik rekening',
    bankLogo: 'Logo bank',
    bankLogoHint: 'JPG, PNG, atau WEBP · Maksimal 2 MB.',
    chooseBankLogo: 'Pilih logo bank',
    removeBankLogo: 'Hapus logo',
    restoreBankLogo: 'Batalkan hapus logo',
    saveBankSettings: 'Simpan rekening bank',
    savingBankSettings: 'Menyimpan...',
    bankSettingsSaved: 'Informasi rekening berhasil disimpan.',
    bankSettingsLoading: 'Memuat informasi rekening...',
    bankLogoUploadFailed: 'Logo bank gagal diunggah. Periksa konfigurasi penyimpanan.',
    bankLogoCleanupWarning: 'Informasi tersimpan, tetapi logo lama gagal dihapus dari penyimpanan.',
    billingAdd: 'Tambah termin',
    billingProject: 'Proyek tagihan',
    billingName: 'Nama termin',
    billingAmount: 'Nominal (Rp)',
    billingDueDate: 'Jatuh tempo',
    billingSave: 'Simpan termin',
    billingEmpty: 'Belum ada termin pembayaran untuk proyek ini.',
    billingUnpaid: 'Belum dibayar',
    billingUploading: 'Mengunggah bukti',
    billingPending: 'Menunggu pemeriksaan',
    billingRejected: 'Bukti perlu diperbaiki',
    billingPaid: 'Lunas',
    billingProof: 'Bukti pembayaran',
    billingProofReceived: 'Bukti pembayaran diunggah',
    billingProofLinkUnavailable: 'Tautan bukti belum tersedia; periksa konfigurasi penyimpanan atau muat ulang.',
    billingSubmittedAt: 'Dikirim',
    billingNoProof: 'Belum ada bukti pembayaran.',
    billingUploadProof: 'Unggah bukti pembayaran',
    billingProofHint: 'JPG, PNG, WEBP, atau PDF · Maksimal 5 MB.',
    billingReviewNote: 'Catatan untuk klien',
    billingApproveProof: 'Tandai lunas',
    billingRejectProof: 'Minta unggah ulang',
    billingDelete: 'Hapus tagihan',
    billingDeleteConfirm: 'Hapus tagihan ini beserta bukti pembayarannya secara permanen? Tindakan ini tidak dapat dibatalkan.',
    billingCreated: 'Termin pembayaran berhasil ditambahkan.',
    billingPaidSaved: 'Pembayaran berhasil ditandai lunas.',
    billingProofRejected: 'Bukti ditolak dan klien dapat mengunggah ulang.',
    billingDeleted: 'Termin pembayaran berhasil dihapus.',
    billingDeletedCleanupFailed: 'Tagihan sudah dihapus, tetapi file bukti gagal dibersihkan dari penyimpanan.',
    billingOverdue: 'Terlambat',
    billingRefresh: 'Perbarui tagihan',
    changeOrders: 'Perubahan pekerjaan',
    changeOrdersTitle: 'Permintaan perubahan pekerjaan',
    changeOrdersEmpty: 'Belum ada permintaan atau usulan perubahan.',
    changeNewProposal: 'Buat usulan perubahan',
    changeRequestedByClient: 'Permintaan dari klien',
    changeRequestedByAdmin: 'Usulan dari studio',
    changeTitle: 'Judul perubahan',
    changeDescription: 'Rincian perubahan',
    changeCostImpact: 'Dampak biaya (Rp; minus untuk pengurangan)',
    changeScheduleImpact: 'Dampak jadwal (hari; minus untuk lebih cepat)',
    changeAdminNote: 'Catatan untuk klien (opsional)',
    changeRequestNote: 'Catatan tanggapan klien',
    changeSubmitProposal: 'Kirim usulan untuk persetujuan',
    changeSendRequest: 'Kirim permintaan perubahan',
    changeStatusRequested: 'Perlu estimasi studio',
    changeStatusPending: 'Menunggu persetujuan klien',
    changeStatusApproved: 'Disetujui klien',
    changeStatusRejected: 'Ditolak klien',
    changeApprove: 'Setujui',
    changeReject: 'Tolak',
    changeProposalSaved: 'Usulan perubahan dikirim kepada klien.',
    changeRequestSaved: 'Permintaan perubahan klien berhasil dikirim.',
    changeDecisionSaved: 'Tanggapan klien berhasil disimpan.',
    changeConfirmApprove: 'Setujui perubahan ini beserta dampak biaya dan jadwalnya?',
    changeConfirmReject: 'Tolak usulan perubahan ini?',
    changeCost: 'Dampak biaya',
    changeSchedule: 'Dampak jadwal',
    changeRefresh: 'Perbarui perubahan',
  },
  EN: {
    eyebrow: 'LINIER STUDIO / ADMIN',
    title: 'Manage project progress.',
    subtitle: 'Sign in to create client access and share daily updates.',
    teamLoginBadge: 'STUDIO TEAM ACCESS',
    teamLoginWelcome: 'Welcome, sign in to your account.',
    email: 'Admin/staff email',
    password: 'Admin/staff password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    forgotPassword: 'Forgot admin password?',
    forgotPasswordHint: 'Contact your system administrator for help resetting your password.',
    contact: 'Contact',
    services: 'Our services',
    signIn: 'Sign in',
    signOut: 'Sign out',
    projects: 'Projects',
    createProject: 'Create project access',
    projectCode: 'Project ID',
    projectName: 'Project name',
    clientName: 'Client name',
    clientEmail: 'Client email (optional)',
    noClientEmail: 'Email login not set',
    projectType: 'Project type',
    architecture: 'Architecture',
    interior: 'Interior',
    construction: 'Construction',
    projectTypeNotSet: 'Not set',
    clientPhone: 'Client phone number',
    saveProjectDetails: 'Save project details',
    savedProjectDetails: 'Project details saved.',
    location: 'Location',
    clientLoginPassword: 'Account password',
    accountPasswordHint: 'Client email is optional. If provided, projects with the same email use this password to sign in with either email or Project ID; without an email, it works only with the Project ID. New passwords must be at least 12 characters.',
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
    savedProject: 'Project created. Store the client password securely; it cannot be shown again.',
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
    documents: 'Documents',
    documentsDescription: 'Photos and documents attached to project updates. Choose a project, file type, or date range to find attachments.',
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
    previewFile: 'Preview file',
    downloadFile: 'Download file',
    closePreview: 'Close preview',
    documentsLoading: 'Loading project documents...',
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
    actionCenter: 'Needs attention',
    actionCenterEmpty: 'There are no pending admin actions.',
    activityCenter: 'Recent activity',
    activityCenterEmpty: 'There are no notifications yet.',
    viewAll: 'View all',
    activityBack: 'Back to dashboard',
    needsAttention: 'Action needed',
    unread: 'unread',
    notificationRefresh: 'Refresh activity',
    notificationLoading: 'Loading activity...',
    notificationOpen: 'Open activity',
    notificationLoadFailed: 'Portal activity could not be loaded.',
    noDate: 'Start date not set',
    adminDashboard: 'Admin dashboard',
    studioAdmin: 'Studio admin',
    studioStaff: 'Studio staff',
    navigation: 'Navigation',
    more: 'More',
    viewAllProjects: 'View all projects',
    clients: 'Clients',
    clientDirectory: 'Client directory',
    noClients: 'No client records yet.',
    clientProjects: 'Client projects',
    feedback: 'Feedback',
    feedbackInbox: 'Client feedback inbox',
    feedbackCount: 'Feedback received',
    pendingFeedback: 'Unread feedback',
    noFeedback: 'There is no client feedback yet.',
    refreshFeedback: 'Refresh feedback',
    feedbackSubmitted: 'Submitted',
    feedbackReply: 'Reply to client',
    feedbackReplyPlaceholder: 'Write a reply the client can see in the portal...',
    feedbackSendReply: 'Send reply',
    feedbackSaveReply: 'Update reply',
    feedbackReplySaved: 'Feedback reply saved.',
    feedbackWaiting: 'Not replied',
    feedbackReplied: 'Replied',
    clientCount: 'Total clients',
    billingNav: 'Billing',
    billingTitle: 'Billing & payments',
    bankSettingsTitle: 'Client transfer account',
    bankName: 'Bank name',
    bankAccountNumber: 'Account number',
    bankAccountHolder: 'Account holder',
    bankLogo: 'Bank logo',
    bankLogoHint: 'JPG, PNG, or WEBP · Up to 2 MB.',
    chooseBankLogo: 'Choose bank logo',
    removeBankLogo: 'Remove logo',
    restoreBankLogo: 'Restore logo',
    saveBankSettings: 'Save bank account',
    savingBankSettings: 'Saving...',
    bankSettingsSaved: 'Bank account details saved.',
    bankSettingsLoading: 'Loading bank account details...',
    bankLogoUploadFailed: 'The bank logo could not be uploaded. Check storage configuration.',
    bankLogoCleanupWarning: 'Details were saved, but the previous logo could not be removed from storage.',
    billingAdd: 'Add installment',
    billingProject: 'Billing project',
    billingName: 'Installment name',
    billingAmount: 'Amount (IDR)',
    billingDueDate: 'Due date',
    billingSave: 'Save installment',
    billingEmpty: 'There are no payment installments for this project yet.',
    billingUnpaid: 'Unpaid',
    billingUploading: 'Uploading proof',
    billingPending: 'Awaiting review',
    billingRejected: 'Proof needs changes',
    billingPaid: 'Paid',
    billingProof: 'Payment proof',
    billingProofReceived: 'Payment proof uploaded',
    billingProofLinkUnavailable: 'The proof link is unavailable; check storage configuration or refresh.',
    billingSubmittedAt: 'Submitted',
    billingNoProof: 'No payment proof submitted.',
    billingUploadProof: 'Upload payment proof',
    billingProofHint: 'JPG, PNG, WEBP, or PDF · Up to 5 MB.',
    billingReviewNote: 'Note for the client',
    billingApproveProof: 'Mark as paid',
    billingRejectProof: 'Request new proof',
    billingDelete: 'Delete bill',
    billingDeleteConfirm: 'Permanently delete this bill and its payment proof? This action cannot be undone.',
    billingCreated: 'Payment installment added.',
    billingPaidSaved: 'Payment marked as paid.',
    billingProofRejected: 'Proof rejected; the client can upload a replacement.',
    billingDeleted: 'Payment installment deleted.',
    billingDeletedCleanupFailed: 'The bill was deleted, but its proof file could not be removed from storage.',
    billingOverdue: 'Overdue',
    billingRefresh: 'Refresh billing',
    changeOrders: 'Scope changes',
    changeOrdersTitle: 'Project change requests',
    changeOrdersEmpty: 'There are no change requests or proposals yet.',
    changeNewProposal: 'Create a change proposal',
    changeRequestedByClient: 'Requested by client',
    changeRequestedByAdmin: 'Proposed by studio',
    changeTitle: 'Change title',
    changeDescription: 'Change details',
    changeCostImpact: 'Cost impact (IDR; negative for a reduction)',
    changeScheduleImpact: 'Schedule impact (days; negative for sooner)',
    changeAdminNote: 'Note for client (optional)',
    changeRequestNote: 'Client response note',
    changeSubmitProposal: 'Send proposal for approval',
    changeSendRequest: 'Send change request',
    changeStatusRequested: 'Studio estimate needed',
    changeStatusPending: 'Awaiting client approval',
    changeStatusApproved: 'Approved by client',
    changeStatusRejected: 'Rejected by client',
    changeApprove: 'Approve',
    changeReject: 'Reject',
    changeProposalSaved: 'Change proposal sent to the client.',
    changeRequestSaved: 'Client change request sent.',
    changeDecisionSaved: 'Client response saved.',
    changeConfirmApprove: 'Approve this change and its cost and schedule impacts?',
    changeConfirmReject: 'Reject this change proposal?',
    changeCost: 'Cost impact',
    changeSchedule: 'Schedule impact',
    changeRefresh: 'Refresh changes',
  },
  CN: {
    eyebrow: 'LINIER STUDIO / 管理',
    title: '管理项目进度。',
    subtitle: '登录以创建客户访问权限并发布每日更新。',
    teamLoginBadge: '工作室团队登录',
    teamLoginWelcome: '欢迎，请登录您的账号。',
    email: '管理员/员工邮箱',
    password: '管理员/员工密码',
    showPassword: '显示密码',
    hidePassword: '隐藏密码',
    forgotPassword: '忘记管理员密码？',
    forgotPasswordHint: '如需重置密码，请联系系统管理员。',
    contact: '联系我们',
    services: '服务类型',
    signIn: '登录',
    signOut: '退出',
    projects: '项目列表',
    createProject: '创建项目访问权限',
    projectCode: '项目编号',
    projectName: '项目名称',
    clientName: '客户名称',
    clientEmail: '客户邮箱（可选）',
    noClientEmail: '尚未设置登录邮箱',
    projectType: '项目类型',
    architecture: '建筑设计',
    interior: '室内设计',
    construction: '施工',
    projectTypeNotSet: '未设置',
    clientPhone: '客户电话号码',
    saveProjectDetails: '保存项目详情',
    savedProjectDetails: '项目详情已保存。',
    location: '地点',
    clientLoginPassword: '账号密码',
    accountPasswordHint: '客户邮箱为可选项。填写邮箱时，同一邮箱的项目可使用此密码通过邮箱或项目编号登录；不填写邮箱时，只能通过项目编号登录。新密码至少 12 个字符。',
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
    savedProject: '项目已创建。请妥善保存客户密码；密码无法再次显示。',
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
    documents: '项目文件',
    documentsDescription: '项目更新中的照片和文件附件。可按项目、文件类型或日期范围筛选。',
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
    previewFile: '预览文件',
    downloadFile: '下载文件',
    closePreview: '关闭预览',
    documentsLoading: '正在加载项目文件...',
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
    actionCenter: '待处理事项',
    actionCenterEmpty: '目前没有待处理的管理员事项。',
    activityCenter: '最新动态',
    activityCenterEmpty: '暂无通知。',
    viewAll: '查看全部',
    activityBack: '返回仪表板',
    needsAttention: '需要处理',
    unread: '未读',
    notificationRefresh: '刷新动态',
    notificationLoading: '正在加载动态...',
    notificationOpen: '打开动态',
    notificationLoadFailed: '无法加载门户动态。',
    noDate: '未设置开始日期',
    adminDashboard: '管理员仪表板',
    studioAdmin: '工作室管理员',
    studioStaff: '工作室员工',
    navigation: '导航',
    more: '更多',
    viewAllProjects: '查看所有项目',
    clients: '客户',
    clientDirectory: '客户目录',
    noClients: '暂无客户记录。',
    clientProjects: '客户项目',
    feedback: '反馈',
    feedbackInbox: '客户反馈收件箱',
    feedbackCount: '收到的反馈',
    pendingFeedback: '未读反馈',
    noFeedback: '暂无客户反馈。',
    refreshFeedback: '刷新反馈',
    feedbackSubmitted: '提交时间',
    feedbackReply: '回复客户',
    feedbackReplyPlaceholder: '撰写客户可在门户中查看的回复...',
    feedbackSendReply: '发送回复',
    feedbackSaveReply: '更新回复',
    feedbackReplySaved: '反馈回复已保存。',
    feedbackWaiting: '尚未回复',
    feedbackReplied: '已回复',
    clientCount: '客户数量',
    billingNav: '账单',
    billingTitle: '账单与付款',
    bankSettingsTitle: '客户转账账户',
    bankName: '银行名称',
    bankAccountNumber: '银行账号',
    bankAccountHolder: '账户持有人',
    bankLogo: '银行标志',
    bankLogoHint: 'JPG、PNG 或 WEBP · 最大 2 MB。',
    chooseBankLogo: '选择银行标志',
    removeBankLogo: '删除标志',
    restoreBankLogo: '恢复标志',
    saveBankSettings: '保存银行账户',
    savingBankSettings: '正在保存...',
    bankSettingsSaved: '银行账户信息已保存。',
    bankSettingsLoading: '正在加载银行账户信息...',
    bankLogoUploadFailed: '无法上传银行标志，请检查存储配置。',
    bankLogoCleanupWarning: '信息已保存，但无法从存储中删除旧标志。',
    billingAdd: '添加付款阶段',
    billingProject: '账单项目',
    billingName: '阶段名称',
    billingAmount: '金额（印尼盾）',
    billingDueDate: '到期日',
    billingSave: '保存阶段',
    billingEmpty: '此项目暂无付款阶段。',
    billingUnpaid: '未付款',
    billingUploading: '正在上传凭证',
    billingPending: '等待审核',
    billingRejected: '凭证需要修改',
    billingPaid: '已付款',
    billingProof: '付款凭证',
    billingProofReceived: '付款凭证已上传',
    billingProofLinkUnavailable: '凭证链接暂不可用，请检查存储配置或刷新。',
    billingSubmittedAt: '提交时间',
    billingNoProof: '尚未提交付款凭证。',
    billingUploadProof: '上传付款凭证',
    billingProofHint: 'JPG、PNG、WEBP 或 PDF · 最大 5 MB。',
    billingReviewNote: '给客户的说明',
    billingApproveProof: '标记为已付款',
    billingRejectProof: '要求重新上传',
    billingDelete: '删除账单',
    billingDeleteConfirm: '永久删除此账单及其付款凭证？此操作无法撤销。',
    billingCreated: '付款阶段已添加。',
    billingPaidSaved: '付款已标记为已付款。',
    billingProofRejected: '凭证已退回，客户可以重新上传。',
    billingDeleted: '付款阶段已删除。',
    billingDeletedCleanupFailed: '账单已删除，但付款凭证文件未能从存储中清除。',
    billingOverdue: '已逾期',
    billingRefresh: '刷新账单',
    changeOrders: '工程变更',
    changeOrdersTitle: '工程变更申请',
    changeOrdersEmpty: '暂无变更申请或提案。',
    changeNewProposal: '创建变更提案',
    changeRequestedByClient: '客户申请',
    changeRequestedByAdmin: '工作室提案',
    changeTitle: '变更标题',
    changeDescription: '变更详情',
    changeCostImpact: '费用影响（印尼盾；负数表示减少）',
    changeScheduleImpact: '工期影响（天；负数表示提前）',
    changeAdminNote: '给客户的说明（可选）',
    changeRequestNote: '客户回复说明',
    changeSubmitProposal: '发送提案等待批准',
    changeSendRequest: '发送变更申请',
    changeStatusRequested: '等待工作室估价',
    changeStatusPending: '等待客户批准',
    changeStatusApproved: '客户已批准',
    changeStatusRejected: '客户已拒绝',
    changeApprove: '批准',
    changeReject: '拒绝',
    changeProposalSaved: '变更提案已发送给客户。',
    changeRequestSaved: '客户变更申请已发送。',
    changeDecisionSaved: '客户回复已保存。',
    changeConfirmApprove: '批准此变更及其费用和工期影响？',
    changeConfirmReject: '拒绝此变更提案？',
    changeCost: '费用影响',
    changeSchedule: '工期影响',
    changeRefresh: '刷新变更',
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

async function loadAdminData(): Promise<{ projects: PortalProject[]; requests: PasswordResetRequest[]; feedback: AdminFeedback[] }> {
  const [projectResult, requestResult, feedbackResult] = await Promise.all([
    portalRequest<{ projects: PortalProject[] }>('/api/portal/admin/projects'),
    portalRequest<{ requests: PasswordResetRequest[] }>('/api/portal/admin/password-reset-requests'),
    portalRequest<{ feedback: AdminFeedback[] }>('/api/portal/admin/updates?resource=feedback'),
  ]);
  return { projects: projectResult.projects, requests: requestResult.requests, feedback: feedbackResult.feedback };
}

async function loadAdminUpdates(projectId: string): Promise<PortalUpdate[]> {
  const result = await portalRequest<{ updates: PortalUpdate[] }>(
    `/api/portal/admin/updates?projectId=${encodeURIComponent(projectId)}`
  );
  return result.updates;
}

const PortalAdmin: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const t = copy[language];
  const [authenticated, setAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordVisible, setAdminPasswordVisible] = useState(false);
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordResetRequest[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<AdminFeedback[]>([]);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PortalPaymentSettings | null>(null);
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(false);
  const [paymentSettingsSaving, setPaymentSettingsSaving] = useState(false);
  const [paymentSettingsError, setPaymentSettingsError] = useState('');
  const [paymentSettingsNotice, setPaymentSettingsNotice] = useState('');
  const [bankLogoFile, setBankLogoFile] = useState<File | null>(null);
  const [removeBankLogo, setRemoveBankLogo] = useState(false);
  const [billingAmount, setBillingAmount] = useState('');
  const [changeOrders, setChangeOrders] = useState<ProjectChangeOrder[]>([]);
  const [seenFeedbackIds, setSeenFeedbackIds] = useState<Set<string>>(() => new Set(
    (localStorage.getItem('linier-admin-seen-feedback') ?? '').split(',').filter(Boolean)
  ));
  const [issuedPassword, setIssuedPassword] = useState<IssuedPassword | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [adminUpdates, setAdminUpdates] = useState<PortalUpdate[]>([]);
  const [documentSearch, setDocumentSearch] = useState('');
  const [documentType, setDocumentType] = useState<PortalDocumentKind | 'all'>('all');
  const [documentDateFrom, setDocumentDateFrom] = useState('');
  const [documentDateTo, setDocumentDateTo] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<PortalAttachment | null>(null);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [notificationsRefreshToken, setNotificationsRefreshToken] = useState(0);
  const [loadingAdminUpdates, setLoadingAdminUpdates] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState('');
  const [editingAttachments, setEditingAttachments] = useState<PortalAttachment[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<Array<{ name: string; url: string }>>([]);
  const [activeSection, setActiveSection] = useState('admin-dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const documentInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

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
          setFeedbackItems(result.feedback);
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
    if (!authenticated) {
      setNotifications([]);
      setNotificationsLoading(false);
      return () => { active = false; };
    }

    const refresh = async () => {
      setNotificationsLoading(true);
      setNotificationsError('');
      try {
        const result = await portalRequest<{ notifications: PortalNotification[] }>('/api/portal/notifications');
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
  }, [authenticated, notificationsRefreshToken, language]);

  useEffect(() => {
    let active = true;
    if (!authenticated || !selectedProjectId) {
      setAdminUpdates([]);
      setLoadingAdminUpdates(false);
      return () => { active = false; };
    }

    setLoadingAdminUpdates(true);
    loadAdminUpdates(selectedProjectId)
      .then((updates) => {
        if (active) setAdminUpdates(updates);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Riwayat update tidak dapat dimuat.');
        }
      })
      .finally(() => {
        if (active) setLoadingAdminUpdates(false);
      });
    return () => { active = false; };
  }, [authenticated, selectedProjectId]);

  useEffect(() => {
    let active = true;
    if (!authenticated || adminRole !== 'admin' || !selectedProjectId) {
      setBillingItems([]);
      setChangeOrders([]);
      return () => { active = false; };
    }

    Promise.all([
      portalRequest<{ items: BillingItem[] }>(`/api/portal/admin/billing?projectId=${encodeURIComponent(selectedProjectId)}`),
      portalRequest<{ orders: ProjectChangeOrder[] }>(`/api/portal/admin/change-orders?projectId=${encodeURIComponent(selectedProjectId)}`),
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
  }, [authenticated, adminRole, selectedProjectId]);

  useEffect(() => {
      let active = true;
      if (!authenticated || adminRole !== 'admin' || activeSection !== 'admin-billing') {
        setPaymentSettingsLoading(false);
        return () => { active = false; };
      }

      setPaymentSettingsLoading(true);
      setPaymentSettingsError('');
      portalRequest<{ settings: PortalPaymentSettings }>('/api/portal/payment-settings')
        .then(({ settings }) => {
          if (active) setPaymentSettings(settings);
        })
        .catch((cause: unknown) => {
          if (active) setPaymentSettingsError(cause instanceof Error ? cause.message : 'Informasi rekening bank tidak dapat dimuat.');
        })
        .finally(() => {
          if (active) setPaymentSettingsLoading(false);
        });
      return () => { active = false; };
  }, [authenticated, adminRole, activeSection]);

  useEffect(() => {
    if (!authenticated || adminRole !== 'admin' || !selectedProjectId || activeSection !== 'admin-billing') return;
    let active = true;
    let refreshing = false;
    const refreshBilling = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        const { items } = await portalRequest<{ items: BillingItem[] }>(
          `/api/portal/admin/billing?projectId=${encodeURIComponent(selectedProjectId)}`
        );
        if (active) setBillingItems(items);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Tagihan tidak dapat dimuat.');
      } finally {
        refreshing = false;
      }
    };
    void refreshBilling();
    const interval = window.setInterval(() => void refreshBilling(), 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [authenticated, adminRole, selectedProjectId, activeSection]);

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
      setFeedbackItems(result.feedback);
      setSelectedProjectId(result.projects[0]?.id ?? '');
      setAdminRole(role);
      setAuthenticated(true);
      setAdminEmail('');
      setAdminPassword('');
      setAdminPasswordVisible(false);
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
          projectType: form.get('projectType'),
          clientPhone: form.get('clientPhone'),
          clientEmail: form.get('clientEmail'),
          location: form.get('location'),
          startDate: form.get('startDate'),
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

  const saveProjectDetails = async (event: React.FormEvent<HTMLFormElement>) => {
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
          projectType: form.get('projectType'),
          clientPhone: form.get('clientPhone'),
        }),
      });
      setProjects((current) => current.map((project) => project.id === result.project.id ? result.project : project));
      setNotice(t.savedProjectDetails);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Detail proyek tidak dapat disimpan.');
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

  const refreshFeedback = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await portalRequest<{ feedback: AdminFeedback[] }>('/api/portal/admin/updates?resource=feedback');
      setFeedbackItems(result.feedback);
      if (activeSection === 'admin-feedback') markFeedbackAsSeen(result.feedback);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Feedback tidak dapat dimuat.');
    } finally {
      setBusy(false);
    }
  };

  const markFeedbackAsSeen = (items: AdminFeedback[]) => {
    const seenIds = new Set(items.map((item) => item.id));
    setSeenFeedbackIds(seenIds);
    localStorage.setItem('linier-admin-seen-feedback', [...seenIds].join(','));
  };

  const submitFeedbackReply = async (event: React.FormEvent<HTMLFormElement>, item: AdminFeedback) => {
    event.preventDefault();
    const form = event.currentTarget;
    const reply = String(new FormData(form).get('reply') ?? '').trim();
    if (!reply) {
      setError('Balasan feedback tidak boleh kosong.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await portalRequest<{
        reply: string;
        replied_by: 'admin' | 'staff';
        replied_at: string;
      }>('/api/portal/admin/updates?resource=feedback', {
        method: 'POST',
        body: JSON.stringify({ feedbackId: item.id, reply }),
      });
      setFeedbackItems((current) => current.map((feedback) => feedback.id === item.id
        ? { ...feedback, ...result }
        : feedback));
      setNotice(t.feedbackReplySaved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Balasan feedback tidak dapat disimpan.');
    } finally {
      setBusy(false);
    }
  };

  const submitBillingItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const billingProjectId = String(values.get('projectId') ?? '');
    if (!billingProjectId) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { item } = await portalRequest<{ item: BillingItem }>('/api/portal/admin/billing', {
        method: 'POST',
        body: JSON.stringify({
          projectId: billingProjectId,
          title: values.get('title'),
          amount: Number(String(values.get('amount') ?? '').replace(/\./g, '')),
          dueDate: values.get('dueDate'),
        }),
      });
      if (billingProjectId === selectedProjectId) {
        setBillingItems((current) => [...current, item].sort((a, b) => a.due_date.localeCompare(b.due_date)));
      }
      form.reset();
      setBillingAmount('');
      setNotice(t.billingCreated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Termin pembayaran tidak dapat disimpan.');
    } finally {
      setBusy(false);
    }
  };

  const savePaymentSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!paymentSettings) return;

    setPaymentSettingsSaving(true);
    setPaymentSettingsError('');
    setPaymentSettingsNotice('');
    let uploadedLogoPath: string | null = null;
    try {
      if (bankLogoFile) {
        const upload = await portalRequest<{ path: string; uploadUrl: string }>('/api/portal/payment-settings', {
          method: 'POST',
          body: JSON.stringify({
            action: 'start-logo-upload',
            file: { contentType: bankLogoFile.type, size: bankLogoFile.size },
          }),
        });
        uploadedLogoPath = upload.path;
        const response = await fetch(upload.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': bankLogoFile.type, 'x-upsert': 'false' },
          body: bankLogoFile,
        });
        if (!response.ok) throw new Error(t.bankLogoUploadFailed);
      }

      const { settings, cleanupFailed } = await portalRequest<{
        settings: PortalPaymentSettings;
        cleanupFailed: boolean;
      }>('/api/portal/payment-settings', {
        method: 'PUT',
        body: JSON.stringify({
          bankName: paymentSettings.bank_name,
          accountNumber: paymentSettings.account_number,
          accountHolder: paymentSettings.account_holder,
          bankLogoPath: uploadedLogoPath ?? (removeBankLogo ? null : paymentSettings.bank_logo_path),
        }),
      });
      setPaymentSettings(settings);
      setBankLogoFile(null);
      setRemoveBankLogo(false);
      setPaymentSettingsNotice(cleanupFailed ? t.bankLogoCleanupWarning : t.bankSettingsSaved);
    } catch (cause) {
      let message = cause instanceof Error ? cause.message : 'Informasi rekening bank tidak dapat disimpan.';
      if (uploadedLogoPath) {
        try {
          await portalRequest('/api/portal/payment-settings', {
            method: 'DELETE',
            body: JSON.stringify({ path: uploadedLogoPath }),
          });
        } catch (cleanupCause) {
          console.error('Uploaded bank logo cleanup failed after saving payment settings failed:', cleanupCause);
          message = `${message} ${t.bankLogoCleanupWarning}`;
        }
      }
      setPaymentSettingsError(message);
    } finally {
      setPaymentSettingsSaving(false);
    }
  };

  const reviewBillingItem = async (item: BillingItem, status: 'paid' | 'rejected', reviewNote = '') => {
    if (status === 'rejected' && !reviewNote.trim()) {
      setError(t.billingReviewNote);
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await portalRequest<{ item: BillingItem }>('/api/portal/admin/billing', {
        method: 'PATCH',
        body: JSON.stringify({ itemId: item.id, status, reviewNote }),
      });
      setBillingItems((current) => current.map((entry) => entry.id === item.id ? result.item : entry));
      setNotice(status === 'paid' ? t.billingPaidSaved : t.billingProofRejected);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Status pembayaran tidak dapat diperbarui.');
    } finally {
      setBusy(false);
    }
  };

  const deleteBillingItem = async (item: BillingItem) => {
    if (!window.confirm(t.billingDeleteConfirm)) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { cleanupFailed } = await portalRequest<{ deleted: boolean; cleanupFailed: boolean }>('/api/portal/admin/billing', {
        method: 'DELETE',
        body: JSON.stringify({ itemId: item.id }),
      });
      setBillingItems((current) => current.filter((entry) => entry.id !== item.id));
      setNotice(cleanupFailed ? t.billingDeletedCleanupFailed : t.billingDeleted);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Termin pembayaran tidak dapat dihapus.');
    } finally {
      setBusy(false);
    }
  };

  const submitChangeProposal = async (event: React.FormEvent<HTMLFormElement>, order?: ProjectChangeOrder) => {
    event.preventDefault();
    if (!selectedProjectId) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await portalRequest<{ order: ProjectChangeOrder }>('/api/portal/admin/change-orders', {
        method: order ? 'PATCH' : 'POST',
        body: JSON.stringify({
          ...(order ? { orderId: order.id } : { projectId: selectedProjectId }),
          title: values.get('title'),
          description: values.get('description'),
          costImpact: Number(values.get('costImpact')),
          scheduleImpactDays: Number(values.get('scheduleImpactDays')),
          adminNote: values.get('adminNote'),
        }),
      });
      setChangeOrders((current) => order
        ? current.map((entry) => entry.id === order.id ? result.order : entry)
        : [result.order, ...current]);
      if (!order) form.reset();
      setNotice(t.changeProposalSaved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Usulan perubahan tidak dapat disimpan.');
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
      setFeedbackItems((current) => current.filter((item) => item.project_id !== project.id));
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
  const latestUpdateWithPhotos = adminUpdates.find((update) =>
    update.attachments.some((attachment) => attachment.contentType.startsWith('image/') && attachment.url)
  );
  const dashboardPreviewFiles = previewFiles.length > 0
    ? previewFiles
    : (latestUpdateWithPhotos?.attachments ?? []).flatMap((attachment) =>
        attachment.contentType.startsWith('image/') && attachment.url
          ? [{ name: attachment.name, url: attachment.url }]
          : []
      );
  const selectedProjectDocuments = adminUpdates.flatMap((update) =>
    update.attachments
      .map((attachment) => ({
        ...attachment,
        updateId: update.id,
        updateTitle: update.title,
        updateDate: update.update_date,
        updateAttachments: update.attachments,
      }))
  );
  const filteredProjectDocuments = selectedProjectDocuments.filter((attachment) => {
    const query = documentSearch.trim().toLowerCase();
    const matchesQuery = !query
      || attachment.name.toLowerCase().includes(query)
      || attachment.updateTitle.toLowerCase().includes(query);
    const matchesType = documentType === 'all' || getPortalDocumentKind(attachment) === documentType;
    const matchesFrom = !documentDateFrom || attachment.updateDate >= documentDateFrom;
    const matchesTo = !documentDateTo || attachment.updateDate <= documentDateTo;
    return matchesQuery && matchesType && matchesFrom && matchesTo;
  });
  const clientDirectory = Array.from(projects.reduce((clients, project) => {
    const key = project.client_email?.trim().toLowerCase() || project.id;
    const client = clients.get(key) ?? {
      key,
      name: project.client_name,
      email: project.client_email,
      projects: [] as PortalProject[],
    };
    client.projects.push(project);
    clients.set(key, client);
    return clients;
  }, new Map<string, { key: string; name: string; email: string | null | undefined; projects: PortalProject[] }>()).values());
  const existingPhotos = editingAttachments.filter((attachment) => attachment.contentType.startsWith('image/'));
  const existingDocuments = editingAttachments.filter((attachment) => !attachment.contentType.startsWith('image/'));
  const selectedPhotos = selectedFiles.filter((file) => file.type.startsWith('image/'));
  const selectedDocuments = selectedFiles.filter((file) => !file.type.startsWith('image/'));
  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.progress_percent, 0) / projects.length)
    : 0;
  const completedProjectCount = projects.filter((project) => project.progress_percent === 100).length;
  const unreadFeedbackCount = feedbackItems.filter((item) => !seenFeedbackIds.has(item.id)).length;
  const openAdminPage = (sectionId: string) => {
    if (sectionId === 'admin-feedback') markFeedbackAsSeen(feedbackItems);
    setActiveSection(sectionId);
    const searchParams = new URLSearchParams(location.search);
    if ((searchParams.get('section') ?? 'admin-dashboard') !== sectionId) {
      searchParams.set('section', sectionId);
      navigate(
        { pathname: location.pathname, search: `?${searchParams.toString()}` },
        { state: location.state }
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const getNotificationLabel = (eventType: PortalNotification['event_type']) => {
    switch (eventType) {
      case 'project_update':
      case 'project_update_edited':
        return t.projectProgress;
      case 'feedback_received':
      case 'feedback_replied':
        return t.feedback;
      case 'billing_created':
        return t.billingTitle;
      case 'payment_review':
        return t.billingPending;
      case 'payment_paid':
        return t.billingPaid;
      case 'payment_rejected':
        return t.billingRejected;
      case 'change_requested':
      case 'change_proposed':
      case 'change_decided':
        return t.changeOrdersTitle;
    }
    return t.activityCenter;
  };
  const openNotification = async (notification: PortalNotification) => {
    try {
      await portalRequest('/api/portal/notifications', {
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

    setSelectedProjectId(notification.project_id);
    if (notification.event_type === 'feedback_received' || notification.event_type === 'feedback_replied') {
      openAdminPage('admin-feedback');
    } else if (notification.event_type === 'billing_created'
      || notification.event_type === 'payment_review'
      || notification.event_type === 'payment_paid'
      || notification.event_type === 'payment_rejected') {
      openAdminPage('admin-billing');
    } else if (notification.event_type === 'change_requested'
      || notification.event_type === 'change_proposed'
      || notification.event_type === 'change_decided') {
      openAdminPage('admin-changes');
    } else {
      openAdminPage('admin-progress');
    }
  };
  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    setIsDark(nextIsDark);
  };
  const navigation = [
    { id: 'admin-dashboard', label: t.dashboard, icon: <LayoutDashboard size={17} /> },
    { id: 'admin-activity', label: t.activityCenter, icon: <Bell size={17} /> },
    { id: 'admin-progress', label: t.projectProgress, icon: <ChartNoAxesColumn size={17} /> },
    { id: 'admin-documents', label: t.documents, icon: <FileText size={17} /> },
    { id: 'admin-clients', label: t.clients, icon: <Users size={17} /> },
    { id: 'admin-feedback', label: t.feedback, icon: <MessageCircle size={17} /> },
    { id: 'admin-billing', label: t.billingNav, icon: <FileCheck2 size={17} /> },
    { id: 'admin-changes', label: t.changeOrders, icon: <ClipboardList size={17} /> },
    { id: 'admin-access', label: t.clientAccess, icon: <FolderOpen size={17} /> },
    { id: 'admin-resets', label: t.passwordRequestsNav, icon: <KeyRound size={17} /> },
  ].filter((item) => adminRole === 'admin' || !['admin-access', 'admin-billing', 'admin-changes'].includes(item.id));
  useEffect(() => {
    const requestedSection = new URLSearchParams(location.search).get('section');
    const matchingSection = navigation.find((item) => item.id === requestedSection);
    setActiveSection(matchingSection?.id ?? 'admin-dashboard');
  }, [location.search, adminRole]);
  const primaryMobileNavIds = ['admin-dashboard', 'admin-progress', 'admin-documents', 'admin-feedback'];
  const primaryMobileNavigation = navigation.filter((item) => primaryMobileNavIds.includes(item.id));
  const moreMobileNavigation = navigation.filter((item) => !primaryMobileNavIds.includes(item.id));
  const navigateFromMobile = (sectionId: string) => {
    setMobileNavOpen(false);
    openAdminPage(sectionId);
  };
  const activePageTitle = activeSection === 'admin-dashboard'
    ? t.adminDashboard
    : navigation.find((item) => item.id === activeSection)?.label ?? t.adminDashboard;
  const activityPanelProps = {
    notifications,
    labels: {
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
    },
    error: notificationsError,
    loading: notificationsLoading,
    onRefresh: () => setNotificationsRefreshToken((current) => current + 1),
    onOpen: openNotification,
    getEventLabel: getNotificationLabel,
    formatDate: (value: string) => formatAdminDateTime(value, language),
  };

  return (
    <div className={`portal-readable ${authenticated ? 'min-h-screen overflow-x-clip bg-[#f4f3ef] text-neutral-900 dark:bg-[#0b0c0b] dark:text-white' : 'grid min-h-[100svh] place-items-center overflow-x-clip bg-[#4b4d48] px-4 py-8 text-neutral-900 sm:px-6'}`}>
      {authenticated && !checking && (
        <aside className="z-40 bg-[#20211d] text-white shadow-xl shadow-black/10 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
          <div className="border-b border-white/[0.08] px-4 py-4 sm:px-7 sm:py-5 lg:px-6 lg:py-7">
            <div className="flex items-center gap-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                <img src={logoImage} alt="Linier Studio" className="absolute left-1/2 top-1/2 h-40 w-40 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain" />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-wide">Linier Studio</p>
                <p className="mt-1 text-[10px] text-white/45">{t.workspace}</p>
              </div>
            </div>
          </div>
          <p className="hidden px-6 pb-3 pt-7 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35 lg:block">{t.navigation}</p>
          <nav aria-label={t.navigation} className="hidden px-3 py-3 lg:block lg:space-y-1.5 lg:py-0">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openAdminPage(item.id)}
                title={item.label}
                className={`flex min-w-0 w-full items-center gap-2 rounded-xl px-2.5 py-3 text-left text-[11px] font-medium transition-colors lg:gap-3 lg:px-3 lg:text-xs ${activeSection === item.id ? 'bg-white/10 text-white shadow-inner shadow-white/[0.03]' : 'text-white/55 hover:bg-white/[0.06] hover:text-white'}`}
              >
                <span className={`shrink-0 ${activeSection === item.id ? 'text-bronze-300' : 'text-white/45'}`}>{item.icon}</span><span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.id === 'admin-resets' && passwordRequests.length > 0 && <span className="shrink-0 rounded-full bg-bronze-500 px-2 py-0.5 font-mono text-[9px] text-white">{passwordRequests.length}</span>}
                {item.id === 'admin-feedback' && unreadFeedbackCount > 0 && <span className="shrink-0 rounded-full bg-bronze-500 px-2 py-0.5 font-mono text-[9px] text-white">{unreadFeedbackCount}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto hidden border-t border-white/[0.08] p-4 lg:block">
            <Link to="/portal" className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-xs text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"><ArrowDownLeft size={16} />{t.back}</Link>
            <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"><LogOut size={16} />{t.signOut}</button>
          </div>
        </aside>
      )}
      <div className={authenticated && !checking ? 'min-w-0 lg:pl-64' : 'w-full'}>
        {authenticated && !checking && (
          <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between gap-2 border-b border-neutral-200/80 bg-white/90 px-3 text-neutral-900 shadow-sm shadow-neutral-900/[0.02] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#111210]/90 dark:text-white sm:min-h-[76px] sm:gap-4 sm:px-7 lg:px-10">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">{t.eyebrow}</p>
              <h1 className="mt-1 font-display text-base font-medium leading-tight tracking-tight sm:text-xl">{activePageTitle}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-4">
              <PortalLanguageSwitcher language={language} onChange={setLanguage} />
              <button type="button" onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-bronze-500 hover:text-bronze-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300 sm:h-10 sm:w-10">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button type="button" onClick={() => openAdminPage('admin-resets')} aria-label={t.passwordRequestsNav} title={t.passwordRequestsNav} className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-bronze-500 hover:text-bronze-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300 sm:h-10 sm:w-10">
                <Bell size={17} />
                {passwordRequests.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[8px] text-white">{passwordRequests.length}</span>}
              </button>
              <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#262722] font-mono text-[10px] font-medium text-white sm:flex dark:bg-white dark:text-neutral-900">LS</span>
              <span className="hidden text-xs font-medium sm:block">{adminRole === 'staff' ? t.studioStaff : t.studioAdmin}</span>
              <Link to="/portal" aria-label={t.back} className="inline-flex items-center gap-1 border-l border-neutral-200 pl-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500 transition-colors hover:text-neutral-900 dark:border-white/15 dark:text-neutral-300 sm:pl-4"><span className="hidden sm:inline">{t.back}</span><ArrowUpRight size={13} /></Link>
              <button type="button" onClick={signOut} aria-label={t.signOut} title={t.signOut} className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-red-400 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300 sm:h-10 sm:w-10 lg:hidden"><LogOut size={16} /></button>
            </div>
          </header>
        )}
        <div className={`mx-auto w-full min-w-0 ${authenticated ? 'max-w-[1600px] px-4 pt-6 pb-24 sm:px-7 lg:px-10 lg:py-8' : 'max-w-7xl px-0 sm:px-3 lg:px-0'}`}>
        {authenticated && activeSection === 'admin-dashboard' && <header id="admin-dashboard" className="relative mb-6 min-w-0 scroll-mt-24 overflow-hidden rounded-2xl bg-neutral-900 p-4 text-white shadow-[0_24px_70px_rgba(27,25,20,0.12)] sm:mb-8 sm:rounded-3xl sm:p-10 lg:p-12">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-40" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/80 to-neutral-900/25" />
          <div className="relative flex items-center justify-between gap-4">
            {!authenticated && (
              <Link to="/portal" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/65 transition-colors hover:border-white/35 hover:bg-white/[0.08] hover:text-white">
                <ArrowDownLeft size={14} /> {t.back}
              </Link>
            )}
          </div>
          <div className="relative mt-8 max-w-3xl sm:mt-16">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">{authenticated && selectedProject ? `${t.overview} / ${selectedProject.project_code}` : t.eyebrow}</p>
            <h1 className="break-words font-display text-3xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl">{authenticated && selectedProject ? selectedProject.project_name : t.title}</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              {authenticated && selectedProject
                ? [
                    selectedProject.client_name,
                    selectedProject.project_type === 'Architecture' ? t.architecture : selectedProject.project_type === 'Interior' ? t.interior : selectedProject.project_type === 'Construction' ? t.construction : t.projectTypeNotSet,
                    selectedProject.client_phone,
                    selectedProject.location,
                  ].filter(Boolean).join(' / ')
                : t.subtitle}
            </p>
          </div>
          <div className="relative mt-10 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5 text-xs text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze-400" /> {t.workspace}
            {authenticated && selectedProject && <span className="ml-auto rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-white/75">{selectedProject.progress_percent === 100 ? t.completed : t.inProgress} · {selectedProject.progress_percent}%</span>}
          </div>
        </header>}

        {authenticated && error && <ErrorBanner message={error} />}
        {authenticated && notice && <p role="status" className="mb-6 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300"><Check size={17} className="mt-0.5 shrink-0" />{notice}</p>}

        {checking ? (
          <div className="mx-auto flex min-h-64 max-w-xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#151613] text-white/60 shadow-sm">
            <span className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#8c795e] dark:border-white/10 dark:border-t-bronze-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{language === 'ID' ? 'Memuat ruang kerja...' : language === 'CN' ? '正在加载工作区...' : 'Loading workspace...'}</span>
          </div>
        ) : !authenticated ? (
          <form onSubmit={signIn} className="portal-login mx-auto grid w-full min-w-0 max-w-[1080px] overflow-hidden rounded-[1.6rem] border-[7px] border-[#11120f] bg-white shadow-[0_35px_90px_rgba(15,17,14,0.28)] lg:min-h-[590px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <section className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-[#191a16] p-5 text-white sm:min-h-[380px] sm:p-8 lg:min-h-[590px] lg:p-9">
              <img src={heroImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
              <div className="relative">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/80">
                  <KeyRound size={12} /> {t.teamLoginBadge}
                </p>
                <div className="mt-14 max-w-[390px] sm:mt-20">
                  <h1 className="font-display text-3xl font-medium leading-[1.04] tracking-[-0.04em] sm:text-5xl">{t.title}</h1>
                  <p className="mt-4 max-w-sm text-xs leading-6 text-white/75 sm:text-sm sm:leading-7">{t.subtitle}</p>
                </div>
              </div>
              <div className="relative mt-8 flex items-center justify-between gap-4 border-t border-white/20 pt-4">
                <img src={logoImage} alt="Linier Studio" className="h-7 w-auto max-w-[150px] object-contain brightness-0 invert" />
                <Link to="/portal" className="inline-flex shrink-0 items-center gap-1.5 text-[10px] text-white/65 transition-colors hover:text-white">
                  <ArrowDownLeft size={13} /> {t.back}
                </Link>
              </div>
            </section>

            <div className="flex flex-col justify-center bg-white px-5 py-8 text-neutral-900 sm:px-9 sm:py-10 lg:px-10 lg:py-12">
              <div className="mb-10 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold tracking-wide">LINIER STUDIO</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">{t.eyebrow}</p>
                </div>
                <PortalLanguageSwitcher language={language} onChange={setLanguage} />
              </div>
              <h2 className="max-w-sm font-display text-3xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-4xl">{t.teamLoginWelcome}</h2>
              <div className="mt-8">
                <label className="mb-5 block">
                  <span className="mb-2 block text-xs font-medium text-neutral-700">{t.email}</span>
                  <input name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} required maxLength={254} className="w-full rounded-full border-0 bg-[#f0f0ee] px-4 py-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-[#142526]/15" />
                </label>
                <div>
                  <label htmlFor="admin-login-password" className="mb-2 block text-xs font-medium text-neutral-700">{t.password}</label>
                  <div className="relative">
                    <input id="admin-login-password" name="password" type={adminPasswordVisible ? 'text' : 'password'} autoComplete="current-password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} required maxLength={256} className="w-full rounded-full border-0 bg-[#f0f0ee] px-4 py-3.5 pr-12 text-sm outline-none transition focus:ring-2 focus:ring-[#142526]/15" />
                    <button
                      type="button"
                      onClick={() => setAdminPasswordVisible((visible) => !visible)}
                      aria-label={adminPasswordVisible ? t.hidePassword : t.showPassword}
                      aria-pressed={adminPasswordVisible}
                      title={adminPasswordVisible ? t.hidePassword : t.showPassword}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-full text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#142526]"
                    >
                      {adminPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
              <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                <button disabled={busy} className="inline-flex items-center gap-3 rounded-full bg-[#142526] px-6 py-3 text-xs font-medium text-white transition-colors hover:bg-[#263b3c] disabled:cursor-wait disabled:opacity-60">
                  {busy ? '...' : t.signIn} <ArrowUpRight size={14} />
                </button>
                <details className="max-w-[190px] pt-2 text-right text-[10px]">
                  <summary className="cursor-pointer text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-950">{t.forgotPassword}</summary>
                  <p className="mt-3 text-left leading-5 text-neutral-500">{t.forgotPasswordHint}</p>
                </details>
              </div>
              <p className="mt-10 border-t border-neutral-200 pt-4 text-[10px] text-neutral-400">{t.workspace}</p>
            </div>
          </form>
        ) : (
          <>
            {activeSection === 'admin-dashboard' && (
              <>
            <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <Metric icon={<Layers size={17} />} label={t.projectCount} value={projects.length.toString().padStart(2, '0')} />
              <Metric icon={<Send size={17} />} label={t.activeProjects} value={projects.filter((project) => project.progress_percent < 100).length.toString().padStart(2, '0')} />
              <Metric icon={<CheckCircle2 size={17} />} label={t.completedProjects} value={completedProjectCount.toString().padStart(2, '0')} />
              <Metric icon={<ClipboardList size={17} />} label={t.progress} value={`${averageProgress}%`} />
              <Metric icon={<Users size={17} />} label={t.clientCount} value={clientDirectory.length.toString().padStart(2, '0')} />
              <Metric icon={<MessageCircle size={17} />} label={t.pendingFeedback} value={unreadFeedbackCount.toString().padStart(2, '0')} />
            </div>
            <PortalActivityPanel
              {...activityPanelProps}
              onViewAll={() => openAdminPage('admin-activity')}
            />
            <div className="mb-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <section className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><CalendarDays size={17} /></span>
                    <div>
                      <p className="text-xs text-neutral-500">{t.overview}</p>
                      <h2 className="mt-1 font-display text-xl font-medium">{t.timeline}</h2>
                    </div>
                  </div>
                  <button type="button" onClick={() => openAdminPage('admin-progress')} className="rounded-lg px-2 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-white/[0.05] dark:hover:text-white">{t.viewAllProjects}<ArrowUpRight size={12} className="ml-1 inline" /></button>
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
                          className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${selectedProjectId === project.id ? 'border-bronze-500/40 bg-bronze-500/[0.06] dark:border-bronze-400/30' : 'border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50 dark:border-white/[0.06] dark:hover:bg-white/[0.03]'}`}
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span className="min-w-0 flex-1">
                              <span className="block break-words text-sm font-medium">{project.project_name}</span>
                              <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-neutral-400">{project.project_code} · {project.start_date ? formatAdminDate(project.start_date, language) : t.noDate}</span>
                            </span>
                            <span className="shrink-0 text-right">
                              <span className={`block text-[9px] font-medium ${project.progress_percent === 100 ? 'text-emerald-600' : 'text-bronze-600'}`}>{project.progress_percent === 100 ? t.completed : t.inProgress}</span>
                              <span className="mt-1 block font-mono text-xs">{project.progress_percent}%</span>
                            </span>
                          </span>
                          <span className="mt-3 block h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
                            <span className="block h-full rounded-full bg-bronze-500" style={{ width: `${project.progress_percent}%` }} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
              <section className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><ImagePlus size={17} /></span>
                    <div>
                      <p className="text-xs text-neutral-500">{selectedProject?.project_name ?? t.chooseProject}</p>
                      <h2 className="mt-1 font-display text-xl font-medium">{t.photoPreview}</h2>
                    </div>
                  </div>
                  {selectedFiles.length > 0 && <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">{selectedFiles.length} / 5</span>}
                </div>
                {dashboardPreviewFiles.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {dashboardPreviewFiles.map((file) => (
                      <div key={file.url} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 dark:bg-white/5">
                        <img src={file.url} alt={file.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-6 text-[9px] text-white">{file.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 text-center dark:border-white/15 dark:bg-white/[0.02]">
                    <ImagePlus size={22} className="mb-3 text-neutral-400" />
                    <p className="max-w-xs text-xs leading-5 text-neutral-500">{t.noPhotoPreview}</p>
                  </div>
                )}
              </section>
            </div>
              </>
            )}
            {activeSection === 'admin-activity' && (
              <section className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 dark:border-white/10 dark:bg-neutral-900">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">{t.eyebrow}</p>
                    <h2 className="mt-1 font-display text-2xl font-medium tracking-tight">{t.activityCenter}</h2>
                  </div>
                  <button type="button" onClick={() => openAdminPage('admin-dashboard')} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-xs font-medium text-neutral-600 transition-colors hover:border-bronze-500 hover:text-bronze-700 dark:border-white/10 dark:text-neutral-300 dark:hover:text-bronze-300">
                    <ArrowLeft size={14} /> {t.activityBack}
                  </button>
                </div>
                <PortalActivityPanel {...activityPanelProps} showAll />
              </section>
            )}
            {activeSection === 'admin-clients' && (
              <section id="admin-clients" className="min-w-0 scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-5 dark:border-white/10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><Users size={18} /></span>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">CLIENT RELATIONS</p>
                    <h2 className="mt-1 font-display text-xl font-medium tracking-tight">{t.clientDirectory}</h2>
                  </div>
                  <span className="ml-auto font-mono text-xs text-neutral-500">{clientDirectory.length.toString().padStart(2, '0')}</span>
                </div>
                {clientDirectory.length === 0 ? (
                  <p className="py-4 text-sm text-neutral-500">{t.noClients}</p>
                ) : (
                  <ul className="grid gap-3 lg:grid-cols-2">
                    {clientDirectory.map((client) => (
                      <li key={client.key} className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 sm:p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-medium">{client.name}</h3>
                            <p className="mt-1 break-all text-xs text-neutral-500">{client.email || t.noClientEmail}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-[#f4f1eb] px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-[#746349] dark:bg-white/[0.07] dark:text-neutral-300">
                            {client.projects.length} {t.clientProjects}
                          </span>
                        </div>
                        <ul className="mt-4 space-y-2 border-t border-neutral-200 pt-3 dark:border-white/10">
                          {client.projects.map((project) => (
                            <li key={project.id} className="flex items-center justify-between gap-3 text-xs">
                              <span className="min-w-0">
                                <span className="font-mono text-[10px] text-bronze-600 dark:text-bronze-400">{project.project_code}</span>
                                <span className="mx-2 text-neutral-300">/</span>
                                <span className="break-words text-neutral-700 dark:text-neutral-300">{project.project_name}</span>
                              </span>
                              <span className="shrink-0 font-mono text-[10px] text-neutral-500">{project.progress_percent}%</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
            {activeSection === 'admin-feedback' && (
              <section id="admin-feedback" className="min-w-0 scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-5 dark:border-white/10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><MessageCircle size={18} /></span>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">CLIENT RELATIONS</p>
                    <h2 className="mt-1 font-display text-xl font-medium tracking-tight">{t.feedbackInbox}</h2>
                  </div>
                  <span className="ml-auto font-mono text-xs text-neutral-500">{feedbackItems.length.toString().padStart(2, '0')}</span>
                  <button type="button" disabled={busy} onClick={refreshFeedback} aria-label={t.refreshFeedback} title={t.refreshFeedback} className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-bronze-500 hover:text-bronze-500 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03]">
                    <RefreshCw size={14} />
                  </button>
                </div>
                {feedbackItems.length === 0 ? (
                  <p className="py-4 text-sm text-neutral-500">{t.noFeedback}</p>
                ) : (
                  <ol className="space-y-4">
                    {feedbackItems.map((item) => (
                      <li key={item.id} className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 sm:p-6 dark:border-white/[0.06] dark:bg-white/[0.02]">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{item.client_name}<span className="mx-2 text-neutral-300">/</span><span className="font-mono text-[10px] text-bronze-600 dark:text-bronze-400">{item.project_code}</span></p>
                            <p className="mt-1 break-words text-xs text-neutral-500">{item.project_name}{item.client_email ? ` · ${item.client_email}` : ''}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1.5 text-[9px] font-medium ${item.reply ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                            {item.reply ? t.feedbackReplied : t.feedbackWaiting}
                          </span>
                        </div>
                        <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-white/10">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="min-w-0 break-words font-display text-lg font-medium">{item.subject}</h3>
                            <time className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">{t.feedbackSubmitted}: {formatAdminDateTime(item.created_at, language)}</time>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-600 dark:text-neutral-400">{item.message}</p>
                        </div>
                        {item.reply && item.replied_at && (
                          <p className="mt-4 text-[10px] text-neutral-500">
                            {item.replied_by === 'staff' ? t.studioStaff : t.studioAdmin} · {formatAdminDateTime(item.replied_at, language)}
                          </p>
                        )}
                        <form key={`${item.id}-${item.replied_at ?? 'pending'}`} onSubmit={(event) => submitFeedbackReply(event, item)} className="mt-4 border-t border-neutral-200 pt-4 dark:border-white/10">
                          <label className="block">
                            <span className="mb-2 block text-xs font-medium text-neutral-700 dark:text-neutral-300">{t.feedbackReply}</span>
                            <textarea name="reply" defaultValue={item.reply ?? ''} required minLength={1} maxLength={5000} rows={3} placeholder={t.feedbackReplyPlaceholder} className="w-full resize-y rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#8c795e] focus:ring-4 focus:ring-[#8c795e]/10 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-bronze-400" />
                          </label>
                          <div className="mt-3 flex justify-end">
                            <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-white transition-colors hover:bg-bronze-600 disabled:cursor-wait disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                              <Send size={13} /> {item.reply ? t.feedbackSaveReply : t.feedbackSendReply}
                            </button>
                          </div>
                        </form>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            )}
            {activeSection === 'admin-billing' && (
              <section id="admin-billing" className="scroll-mt-24 space-y-5">
                <form onSubmit={savePaymentSettings} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                  <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-5 dark:border-white/10">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><Landmark size={18} /></span>
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{t.bankSettingsTitle}</p>
                      <h2 className="mt-1 font-display text-xl font-medium tracking-tight">{t.bankSettingsTitle}</h2>
                    </div>
                  </div>
                  {paymentSettingsError && <p role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-700 dark:text-red-300">{paymentSettingsError}</p>}
                  {paymentSettingsNotice && <p role="status" className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs leading-5 text-emerald-700 dark:text-emerald-300">{paymentSettingsNotice}</p>}
                  {paymentSettingsLoading ? (
                    <p className="text-sm text-neutral-500">{t.bankSettingsLoading}</p>
                  ) : !paymentSettings ? (
                    <p className="text-sm text-neutral-500">{paymentSettingsError || t.bankSettingsLoading}</p>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-xs font-medium">{t.bankName}</span>
                          <input value={paymentSettings.bank_name} onChange={(event) => setPaymentSettings((current) => current ? { ...current, bank_name: event.target.value } : current)} maxLength={80} autoComplete="organization" className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs font-medium">{t.bankAccountNumber}</span>
                          <input value={paymentSettings.account_number} onChange={(event) => setPaymentSettings((current) => current ? { ...current, account_number: event.target.value } : current)} type="text" inputMode="numeric" autoComplete="off" maxLength={64} className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-xs font-medium">{t.bankAccountHolder}</span>
                          <input value={paymentSettings.account_holder} onChange={(event) => setPaymentSettings((current) => current ? { ...current, account_holder: event.target.value } : current)} maxLength={120} autoComplete="name" className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" />
                        </label>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-neutral-100 pt-5 dark:border-white/10">
                        <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-2 dark:border-white/10 dark:bg-neutral-950">
                          {paymentSettings.bank_logo_url && !removeBankLogo
                            ? <img src={paymentSettings.bank_logo_url} alt={paymentSettings.bank_name || t.bankLogo} className="max-h-full max-w-full object-contain" />
                            : <Landmark size={23} className="text-neutral-400" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium">{t.bankLogo}</p>
                          <p className="mt-1 text-[10px] leading-5 text-neutral-500">{t.bankLogoHint}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-bronze-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-200">
                              <Upload size={14} />
                              <span className="max-w-48 truncate">{bankLogoFile?.name || t.chooseBankLogo}</span>
                              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                event.target.value = '';
                                setBankLogoFile(file);
                                setRemoveBankLogo(false);
                              }} />
                            </label>
                            {(bankLogoFile || paymentSettings.bank_logo_path) && (
                              <button type="button" onClick={() => {
                                if (bankLogoFile) {
                                  setBankLogoFile(null);
                                  return;
                                }
                                setRemoveBankLogo((current) => !current);
                              }} className="rounded-lg px-3 py-2 text-xs text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-red-600 dark:hover:bg-white/[0.06]">
                                {removeBankLogo ? t.restoreBankLogo : t.removeBankLogo}
                              </button>
                            )}
                          </div>
                        </div>
                        <button disabled={paymentSettingsSaving || paymentSettingsLoading} className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-bronze-600 disabled:cursor-wait disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                          <Check size={14} /> {paymentSettingsSaving ? t.savingBankSettings : t.saveBankSettings}
                        </button>
                      </div>
                    </>
                  )}
                </form>
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                  <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-5 dark:border-white/10">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><FileCheck2 size={18} /></span>
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{selectedProject?.project_code}</p>
                      <h2 className="mt-1 font-display text-xl font-medium tracking-tight">{t.billingTitle}</h2>
                    </div>
                    <button type="button" disabled={busy || !selectedProjectId} onClick={() => {
                      setBusy(true);
                      setError('');
                      portalRequest<{ items: BillingItem[] }>(`/api/portal/admin/billing?projectId=${encodeURIComponent(selectedProjectId)}`)
                        .then(({ items }) => setBillingItems(items))
                        .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Tagihan tidak dapat dimuat.'))
                        .finally(() => setBusy(false));
                    }} aria-label={t.billingRefresh} title={t.billingRefresh} className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-bronze-500 hover:text-bronze-500 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03]">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  {!selectedProjectId ? <p className="text-sm text-neutral-500">{t.chooseProject}</p> : billingItems.length === 0 ? (
                    <p className="py-2 text-sm text-neutral-500">{t.billingEmpty}</p>
                  ) : (
                    <ul className="space-y-3">
                      {billingItems.map((item) => (
                        <li key={item.id} className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 sm:p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="break-words font-medium">{item.title}</h3>
                              <p className="mt-1 text-xs text-neutral-500">{formatAdminCurrency(item.amount, language)} · {t.billingDueDate}: {formatAdminDate(item.due_date, language)}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1.5 text-[9px] font-medium ${item.status === 'paid' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : item.status === 'pending_review' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : item.status === 'rejected' || (item.status === 'unpaid' && item.due_date < today()) ? 'bg-red-500/10 text-red-700 dark:text-red-300' : item.status === 'uploading' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-neutral-200/70 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'}`}>
                              {item.status === 'paid' ? t.billingPaid : item.status === 'pending_review' ? t.billingPending : item.status === 'rejected' ? t.billingRejected : item.status === 'uploading' ? t.billingUploading : item.due_date < today() ? t.billingOverdue : t.billingUnpaid}
                            </span>
                          </div>
                          {item.payment_proof_url && (
                            <a href={item.payment_proof_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-bronze-700 underline underline-offset-2 dark:text-bronze-300">
                              <FileText size={14} /> {t.billingProof}: {item.payment_proof_name || t.billingProof}
                            </a>
                          )}
                          {item.payment_proof_submitted_at && (
                            <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 size={14} className="shrink-0" />
                              <span>{t.billingProofReceived} · {t.billingSubmittedAt}: {formatAdminDateTime(item.payment_proof_submitted_at, language)}</span>
                            </p>
                          )}
                          {item.payment_proof_unavailable && <p role="status" className="mt-3 rounded-lg bg-amber-500/10 p-3 text-xs leading-5 text-amber-800 dark:text-amber-200">{t.billingProofLinkUnavailable}</p>}
                          {item.status === 'pending_review' && !item.payment_proof_url && !item.payment_proof_unavailable && <p role="alert" className="mt-3 rounded-lg bg-red-500/10 p-3 text-xs leading-5 text-red-700 dark:text-red-200">{t.billingNoProof}</p>}
                          {item.payment_review_note && <p className="mt-3 rounded-lg bg-red-500/5 p-3 text-xs leading-5 text-neutral-600 dark:text-neutral-300">{item.payment_review_note}</p>}
                          {item.status === 'pending_review' && (
                            <form className="mt-4 border-t border-neutral-200 pt-4 dark:border-white/10" onSubmit={(event) => {
                              event.preventDefault();
                              const note = String(new FormData(event.currentTarget).get('reviewNote') ?? '');
                              void reviewBillingItem(item, 'rejected', note);
                            }}>
                              <label className="block">
                                <span className="mb-2 block text-xs font-medium text-neutral-700 dark:text-neutral-300">{t.billingReviewNote}</span>
                                <textarea name="reviewNote" required maxLength={1000} rows={2} placeholder={t.billingReviewNote} className="w-full resize-y rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#8c795e] focus:ring-4 focus:ring-[#8c795e]/10 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-bronze-400" />
                              </label>
                              <div className="mt-3 flex flex-wrap justify-end gap-2">
                                <button type="button" disabled={busy} onClick={() => void reviewBillingItem(item, 'paid')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"><Check size={14} /> {t.billingApproveProof}</button>
                                <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 px-4 py-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-500/5 disabled:opacity-50 dark:text-red-300"><X size={14} /> {t.billingRejectProof}</button>
                              </div>
                            </form>
                          )}
                          <div className="mt-3 flex justify-end">
                            <button type="button" disabled={busy} onClick={() => void deleteBillingItem(item)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-500/5 disabled:opacity-50 dark:text-red-300"><Trash2 size={13} /> {t.billingDelete}</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <form onSubmit={submitBillingItem} className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                  <h3 className="mb-5 font-display text-lg font-medium">{t.billingAdd}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-xs font-medium">{t.billingProject}</span>
                      <select name="projectId" value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} required className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950 dark:[color-scheme:dark]">
                        <option value="" disabled>{t.chooseProject}</option>
                        {projects.map((project) => <option key={project.id} value={project.id}>{project.project_code} — {project.project_name}</option>)}
                      </select>
                    </label>
                    <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-medium">{t.billingName}</span><input name="title" required maxLength={120} className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                    <label className="block"><span className="mb-2 block text-xs font-medium">{t.billingAmount}</span><input name="amount" type="text" inputMode="numeric" autoComplete="off" placeholder="1.000.000" value={billingAmount} onChange={(event) => setBillingAmount(formatAdminIntegerInput(event.target.value))} required className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                    <label className="block"><span className="mb-2 block text-xs font-medium">{t.billingDueDate}</span><input name="dueDate" type="date" required className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950 dark:[color-scheme:dark]" /></label>
                  </div>
                  <div className="mt-5 flex justify-end"><button disabled={busy || !selectedProjectId} className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-bronze-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-950"><Plus size={14} /> {t.billingSave}</button></div>
                </form>
              </section>
            )}
            {activeSection === 'admin-changes' && (
              <section id="admin-changes" className="scroll-mt-24 space-y-5">
                <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                  <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-5 dark:border-white/10">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><ClipboardList size={18} /></span>
                    <div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{selectedProject?.project_code}</p><h2 className="mt-1 font-display text-xl font-medium tracking-tight">{t.changeOrdersTitle}</h2></div>
                    <button type="button" disabled={busy || !selectedProjectId} onClick={() => {
                      setBusy(true);
                      setError('');
                      portalRequest<{ orders: ProjectChangeOrder[] }>(`/api/portal/admin/change-orders?projectId=${encodeURIComponent(selectedProjectId)}`)
                        .then(({ orders }) => setChangeOrders(orders))
                        .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Perubahan pekerjaan tidak dapat dimuat.'))
                        .finally(() => setBusy(false));
                    }} aria-label={t.changeRefresh} title={t.changeRefresh} className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-bronze-500 hover:text-bronze-500 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03]"><RefreshCw size={14} /></button>
                  </div>
                  {changeOrders.length === 0 ? <p className="text-sm text-neutral-500">{t.changeOrdersEmpty}</p> : (
                    <ul className="space-y-4">
                      {changeOrders.map((order) => (
                        <li key={order.id} className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 sm:p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0"><p className="text-[9px] uppercase tracking-wider text-neutral-400">{order.requested_by === 'client' ? t.changeRequestedByClient : t.changeRequestedByAdmin} · {formatAdminDate(order.created_at, language)}</p><h3 className="mt-1 break-words font-medium">{order.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600 dark:text-neutral-300">{order.description}</p></div>
                            <span className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-medium ${order.status === 'approved' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : order.status === 'rejected' ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>{order.status === 'requested' ? t.changeStatusRequested : order.status === 'pending_approval' ? t.changeStatusPending : order.status === 'approved' ? t.changeStatusApproved : t.changeStatusRejected}</span>
                          </div>
                          {order.status !== 'requested' && <p className="mt-3 text-xs text-neutral-500">{t.changeCost}: {formatAdminCurrency(order.cost_impact, language)} · {t.changeSchedule}: {order.schedule_impact_days} {language === 'EN' ? 'days' : language === 'CN' ? '天' : 'hari'}</p>}
                          {order.admin_note && <p className="mt-2 rounded-lg bg-white/70 p-3 text-xs leading-5 text-neutral-600 dark:bg-white/[0.03] dark:text-neutral-300">{order.admin_note}</p>}
                          {order.client_response_note && <p className="mt-2 rounded-lg bg-[#f5f2ec] p-3 text-xs leading-5 text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-300">{t.changeRequestNote}: {order.client_response_note}</p>}
                          {(order.status === 'requested' || order.status === 'pending_approval') && (
                            <form onSubmit={(event) => void submitChangeProposal(event, order)} className="mt-4 grid gap-3 border-t border-neutral-200 pt-4 dark:border-white/10">
                              <input name="title" defaultValue={order.title} required maxLength={120} aria-label={t.changeTitle} placeholder={t.changeTitle} className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" />
                              <textarea name="description" defaultValue={order.description} required maxLength={5000} rows={3} aria-label={t.changeDescription} placeholder={t.changeDescription} className="w-full resize-y rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" />
                              <div className="grid gap-3 sm:grid-cols-2">
                                <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeCostImpact}</span><input name="costImpact" type="number" step={1} defaultValue={order.cost_impact} required className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                                <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeScheduleImpact}</span><input name="scheduleImpactDays" type="number" step={1} defaultValue={order.schedule_impact_days} required className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                              </div>
                              <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeAdminNote}</span><textarea name="adminNote" defaultValue={order.admin_note ?? ''} maxLength={1000} rows={2} className="w-full resize-y rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                              <div className="flex justify-end"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-bronze-600 disabled:opacity-50 dark:bg-white dark:text-neutral-950"><Send size={14} /> {t.changeSubmitProposal}</button></div>
                            </form>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <form onSubmit={(event) => void submitChangeProposal(event)} className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                  <h3 className="mb-5 font-display text-lg font-medium">{t.changeNewProposal}</h3>
                  <div className="grid gap-4">
                    <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeTitle}</span><input name="title" required maxLength={120} className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                    <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeDescription}</span><textarea name="description" required maxLength={5000} rows={3} className="w-full resize-y rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeCostImpact}</span><input name="costImpact" type="number" step={1} defaultValue={0} required className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                      <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeScheduleImpact}</span><input name="scheduleImpactDays" type="number" step={1} defaultValue={0} required className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                    </div>
                    <label className="block"><span className="mb-2 block text-xs font-medium">{t.changeAdminNote}</span><textarea name="adminNote" maxLength={1000} rows={2} className="w-full resize-y rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950" /></label>
                  </div>
                  <div className="mt-5 flex justify-end"><button disabled={busy || !selectedProjectId} className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-bronze-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-950"><Plus size={14} /> {t.changeSubmitProposal}</button></div>
                </form>
              </section>
            )}
            {activeSection === 'admin-documents' && (
              <section id="admin-documents" className="min-w-0 scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
                <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><FileText size={18} /></span>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{selectedProject?.project_code ?? t.documents}</p>
                    <h2 className="mt-1 font-display text-xl font-medium tracking-tight">{t.documents}</h2>
                  </div>
                  <span className="ml-auto rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-xs tabular-nums text-neutral-500 dark:border-white/10 dark:bg-white/[0.03]">{filteredProjectDocuments.length.toString().padStart(2, '0')}</span>
                </div>
                <p className="mb-5 text-sm leading-6 text-neutral-500">{t.documentsDescription}</p>
                {projects.length === 0 ? (
                  <p className="text-sm text-neutral-500">{t.emptyProjects}</p>
                ) : (
                  <>
                    <label className="mb-5 block max-w-xl">
                      <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.projects}</span>
                      <select
                        value={selectedProjectId}
                        onChange={(event) => {
                          setAdminUpdates([]);
                          setEditingUpdateId('');
                          setEditingAttachments([]);
                          setLoadingAdminUpdates(Boolean(event.target.value));
                          setSelectedProjectId(event.target.value);
                        }}
                        className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8c795e] dark:border-white/15 dark:bg-neutral-950 dark:[color-scheme:dark]"
                      >
                        {projects.map((project) => <option key={project.id} value={project.id}>{project.project_code} — {project.project_name}</option>)}
                      </select>
                    </label>
                    {loadingAdminUpdates ? (
                      <p className="py-4 text-sm text-neutral-500">{t.documentsLoading}</p>
                    ) : selectedProjectDocuments.length === 0 ? (
                      <p className="py-4 text-sm text-neutral-500">{t.documentsEmpty}</p>
                    ) : (
                      <>
                        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                          <p className="py-8 text-center text-sm text-neutral-500">{t.documentsNoResults}</p>
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
                                    <p className="mt-1 truncate text-xs text-neutral-500">{attachment.updateTitle} · {formatAdminDate(attachment.updateDate, language)}</p>
                                  </div>
                                  {canPreview && <button type="button" onClick={() => setPreviewAttachment(attachment)} aria-label={`${t.previewFile}: ${attachment.name}`} title={t.previewFile} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-bronze-500 hover:text-bronze-600 dark:border-white/10 dark:text-neutral-300"><Eye size={16} /></button>}
                                  {href && <a href={href} target="_blank" rel="noreferrer" aria-label={`${t.downloadFile}: ${attachment.name}`} title={t.downloadFile} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-bronze-500 hover:text-bronze-600 dark:border-white/10 dark:text-neutral-300"><Download size={15} /></a>}
                                  <button
                                    type="button"
                                    aria-label={`${t.editUpdate}: ${attachment.updateTitle}`}
                                    onClick={() => {
                                      setEditingUpdateId(attachment.updateId);
                                      setEditingAttachments(attachment.updateAttachments);
                                      setSelectedFiles([]);
                                      setError('');
                                      setNotice('');
                                      if (imageInputRef.current) imageInputRef.current.value = '';
                                      if (documentInputRef.current) documentInputRef.current.value = '';
                                      openAdminPage('admin-progress');
                                    }}
                                    className="hidden shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:border-bronze-500 hover:text-bronze-700 dark:border-white/10 dark:text-neutral-300 dark:hover:text-bronze-300 sm:inline-flex"
                                  >
                                    {t.editUpdate}
                                  </button>
                                  <button type="button" onClick={() => { setEditingUpdateId(attachment.updateId); setEditingAttachments(attachment.updateAttachments); setSelectedFiles([]); setError(''); setNotice(''); if (imageInputRef.current) imageInputRef.current.value = ''; if (documentInputRef.current) documentInputRef.current.value = ''; openAdminPage('admin-progress'); }} aria-label={`${t.editUpdate}: ${attachment.updateTitle}`} title={t.editUpdate} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-bronze-500 hover:text-bronze-600 sm:hidden dark:border-white/10 dark:text-neutral-300"><ArrowUpRight size={15} /></button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </>
                    )}
                  </>
                )}
              </section>
            )}
            {activeSection === 'admin-resets' && (
              <>
            <section id="admin-resets" className="mb-5 min-w-0 scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400"><KeyRound size={17} /></span>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">SECURITY / ACCESS</p>
                  <h2 className="mt-1 font-mono text-xs uppercase tracking-widest">{t.resetRequests}</h2>
                </div>
                <span className="ml-auto font-mono text-xs text-neutral-500">{passwordRequests.length.toString().padStart(2, '0')}</span>
                <button type="button" disabled={busy} onClick={refreshPasswordRequests} aria-label={t.refreshRequests} title={t.refreshRequests} className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-bronze-500 hover:text-bronze-500 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03]">
                  <RefreshCw size={14} />
                </button>
              </div>
              {passwordRequests.length === 0 ? (
                <p className="text-sm text-neutral-500">{t.noResetRequests}</p>
              ) : (
                <ul className="space-y-3">
                  {passwordRequests.map((request) => (
                    <li key={request.id} className="flex flex-col justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 sm:flex-row sm:items-center sm:p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                      <div>
                        <p className="font-medium">{request.client_name}<span className="mx-2 text-neutral-300">/</span><span className="font-mono text-xs text-bronze-600 dark:text-bronze-400">{request.project_code}</span></p>
                        <p className="mt-1 text-xs text-neutral-500">{request.project_name} <span className="mx-1">·</span>{request.whatsapp_number}</p>
                        <p className="mt-1 text-[10px] text-neutral-400">{request.credential_type === 'account' ? t.emailPasswordReset : t.projectPasswordReset}</p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400">{formatAdminDate(request.created_at, language)}</p>
                      </div>
                      <button type="button" disabled={busy} onClick={() => processPasswordReset(request)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-bronze-600 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                        <KeyRound size={14} /> {t.processReset}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {issuedPassword && (
              <section role="status" className="mb-5 min-w-0 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm sm:p-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{t.temporaryPassword} / {issuedPassword.resetRequest.credential_type === 'account' ? t.emailPasswordReset : t.projectPasswordReset} · {issuedPassword.resetRequest.credential_type === 'account' ? issuedPassword.resetRequest.client_email : issuedPassword.resetRequest.project_code}</p>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{issuedPassword.resetRequest.client_name} — {t.verifyClient}</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <code className="block min-w-0 flex-1 select-all break-all rounded-xl border border-emerald-500/20 bg-white px-4 py-3 font-mono text-lg dark:bg-neutral-950">{issuedPassword.password}</code>
                  <button type="button" onClick={copyIssuedPassword} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-emerald-800 transition-colors hover:bg-emerald-700 hover:text-white dark:text-emerald-300">
                    <Copy size={14} /> {t.copyPassword}
                  </button>
                </div>
                <a
                  href={`https://wa.me/${issuedPassword.resetRequest.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-emerald-600"
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
            {adminRole === 'admin' && activeSection === 'admin-access' && <section id="admin-access" className="mx-auto w-full min-w-0 max-w-3xl scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
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
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.projectType}</span>
                  <select name="projectType" required defaultValue="" className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8c795e] focus:ring-4 focus:ring-[#8c795e]/10 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-bronze-400 dark:focus:ring-bronze-400/10">
                    <option value="" disabled>{t.projectTypeNotSet}</option>
                    <option value="Architecture">{t.architecture}</option>
                    <option value="Interior">{t.interior}</option>
                    <option value="Construction">{t.construction}</option>
                  </select>
                </label>
                <Field name="clientPhone" label={t.clientPhone} type="tel" maxLength={32} placeholder="+62 812 3456 7890" />
                <Field name="clientEmail" label={t.clientEmail} type="email" maxLength={254} autoCapitalize="none" />
                <Field name="location" label={t.location} maxLength={120} />
                <Field name="startDate" label={t.startDate} type="date" defaultValue={today()} required />
                <Field name="clientLoginPassword" label={t.clientLoginPassword} type="password" required minLength={8} maxLength={256} autoComplete="new-password" />
                <p className="-mt-3 text-xs leading-5 text-neutral-500">{t.accountPasswordHint}</p>
                <button disabled={busy} className="mt-2 flex w-full items-center justify-between rounded-xl bg-neutral-900 px-5 py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-600 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                  {t.create} <ArrowUpRight size={17} />
                </button>
              </form>
            </section>}

            {activeSection === 'admin-progress' && <section id="admin-progress" className="mx-auto grid w-full min-w-0 max-w-7xl items-start gap-5 scroll-mt-24 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900 xl:col-start-1 xl:row-span-2">
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
                      <select value={selectedProjectId} onChange={(event) => { setSelectedFiles([]); setEditingUpdateId(''); setEditingAttachments([]); setAdminUpdates([]); if (imageInputRef.current) imageInputRef.current.value = ''; if (documentInputRef.current) documentInputRef.current.value = ''; setSelectedProjectId(event.target.value); }} required className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8c795e] focus:ring-4 focus:ring-[#8c795e]/10 dark:border-white/15 dark:bg-neutral-950 dark:[color-scheme:dark] dark:focus:border-bronze-400">
                        <option value="">{t.chooseProject}</option>
                        {projects.map((project) => <option key={project.id} value={project.id}>{project.project_code} — {project.project_name}</option>)}
                      </select>
                    </label>
                    {selectedUpdate && (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bronze-500/30 bg-bronze-500/5 px-4 py-3 text-xs">
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
                      <textarea name="description" defaultValue={selectedUpdate?.description ?? ''} required minLength={2} maxLength={5000} rows={4} className="w-full resize-y rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#8c795e] focus:ring-4 focus:ring-[#8c795e]/10 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-bronze-400" />
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
                        <section className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 p-4 dark:border-white/15 dark:bg-white/[0.03]">
                          <div className="mb-3 flex items-center gap-2">
                            <ImagePlus size={16} className="text-bronze-500" />
                            <h3 className="font-mono text-[10px] uppercase tracking-widest">{t.photo}</h3>
                          </div>
                          {editingUpdateId && existingPhotos.length > 0 && (
                            <div className="mb-4 space-y-2">
                              <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">{t.existingAttachments}</p>
                              {existingPhotos.map((attachment) => (
                                <div key={attachment.path} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-2 dark:border-white/10 dark:bg-neutral-900">
                                  {attachment.url && <img src={attachment.url} alt={attachment.name} className="h-14 w-20 shrink-0 rounded-md object-cover" />}
                                  <a href={attachment.downloadUrl ?? attachment.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-xs hover:text-bronze-600">{attachment.name}</a>
                                  <button type="button" onClick={() => setEditingAttachments((current) => current.filter((item) => item.path !== attachment.path))} aria-label={`${t.removeAttachment}: ${attachment.name}`} title={t.removeAttachment} className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 hover:text-red-500">
                                    <X size={15} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-5 text-center transition-colors hover:border-bronze-500 hover:bg-bronze-500/[0.03] dark:border-white/10 dark:bg-neutral-900">
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
                          <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-white/10">
                            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">{t.photoPreview}</p>
                            {previewFiles.length > 0 ? (
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {previewFiles.map((file) => (
                                  <div key={file.url} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100 dark:bg-white/5">
                                    <img src={file.url} alt={file.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-6 text-[9px] text-white">{file.name}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white/70 px-4 py-5 text-center dark:border-white/15 dark:bg-white/[0.02]">
                                <ImagePlus size={20} className="mb-2 text-neutral-400" />
                                <p className="max-w-xs text-xs leading-5 text-neutral-500">{t.noPhotoPreview}</p>
                              </div>
                            )}
                          </div>
                        </section>

                        <section className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 p-4 dark:border-white/15 dark:bg-white/[0.03]">
                          <div className="mb-3 flex items-center gap-2">
                            <FileText size={16} className="text-bronze-500" />
                            <h3 className="font-mono text-[10px] uppercase tracking-widest">{t.progressFiles}</h3>
                          </div>
                          {editingUpdateId && existingDocuments.length > 0 && (
                            <div className="mb-4 space-y-2">
                              <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">{t.existingAttachments}</p>
                              {existingDocuments.map((attachment) => (
                                <div key={attachment.path} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-2 dark:border-white/10 dark:bg-neutral-900">
                                  <FileText size={18} className="mx-1 shrink-0 text-bronze-500" />
                                  <a href={attachment.downloadUrl ?? attachment.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-xs hover:text-bronze-600">{attachment.name}</a>
                                  <button type="button" onClick={() => setEditingAttachments((current) => current.filter((item) => item.path !== attachment.path))} aria-label={`${t.removeAttachment}: ${attachment.name}`} title={t.removeAttachment} className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 hover:text-red-500">
                                    <X size={15} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-5 text-center transition-colors hover:border-bronze-500 hover:bg-bronze-500/[0.03] dark:border-white/10 dark:bg-neutral-900">
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
                    <button disabled={busy || projects.length === 0} className="flex w-full items-center justify-between rounded-xl bg-neutral-900 px-5 py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-bronze-600 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                      {busy ? (language === 'ID' ? 'Mengunggah...' : language === 'CN' ? '正在上传...' : 'Uploading...') : editingUpdateId ? t.saveChanges : t.publish} <ArrowUpRight size={17} />
                    </button>
                  </form>
                )}
              </div>

              <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-neutral-900 xl:col-start-2 xl:row-start-1">
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
                  <ul className="space-y-3">
                    {adminUpdates.map((update) => (
                      <li key={update.id} className="flex flex-col justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 sm:flex-row sm:items-center dark:border-white/[0.06] dark:bg-white/[0.02]">
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
                            className="rounded-lg border border-neutral-200 px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors hover:border-bronze-500 hover:text-bronze-600 disabled:opacity-50 dark:border-white/15"
                          >
                            {editingUpdateId === update.id ? t.editingUpdate : t.editUpdate}
                          </button>
                          {adminRole === 'admin' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => deleteProgressUpdate(update)}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-500/10"
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

              <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-neutral-900 xl:col-start-2">
                <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
                  <ClipboardList size={17} className="text-bronze-500" />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">03 / OVERVIEW</p>
                    <h2 className="mt-1 font-mono text-xs uppercase tracking-widest">{t.projects}</h2>
                  </div>
                </div>
                {projects.length === 0 ? <p className="text-sm text-neutral-500">{t.emptyProjects}</p> : (
                  <ul className="space-y-3">
                    {projects.map((project) => (
                      <li key={`${project.id}-${project.start_date ?? ''}`} className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 text-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
                        <div className="flex min-w-0 items-center justify-between gap-4">
                          <span className="min-w-0 flex-1 break-words"><strong className="break-all font-mono text-[10px] text-bronze-600 dark:text-bronze-400">{project.project_code}</strong><span className="mx-2 text-neutral-300">/</span><span className="font-medium">{project.project_name}</span><span className="mt-1 block break-words text-xs text-neutral-500">{project.client_name} · {project.project_type === 'Architecture' ? t.architecture : project.project_type === 'Interior' ? t.interior : project.project_type === 'Construction' ? t.construction : t.projectTypeNotSet}</span>{project.client_phone && <span className="mt-1 block break-all text-xs text-neutral-500">{project.client_phone}</span>}<span className="mt-1 block break-all text-[10px] text-neutral-400">{project.client_email ?? t.noClientEmail}</span></span>
                          <span className="w-24 shrink-0">
                            <span className="mb-1 block text-right font-mono text-[10px] text-neutral-500">{project.progress_percent}%</span>
                            <span className="block h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10"><span className="block h-full rounded-full bg-bronze-500" style={{ width: `${project.progress_percent}%` }} /></span>
                          </span>
                        </div>
                        {adminRole === 'admin' && (
                          <>
                        <form onSubmit={saveProjectDetails} className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 dark:border-white/10 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                          <input type="hidden" name="projectId" value={project.id} />
                          <label className="block">
                            <span className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-neutral-500">{t.projectType}</span>
                            <select name="projectType" required defaultValue={project.project_type ?? ''} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-bronze-500 dark:border-white/10 dark:bg-neutral-950 dark:[color-scheme:dark]">
                              <option value="" disabled>{t.projectTypeNotSet}</option>
                              <option value="Architecture">{t.architecture}</option>
                              <option value="Interior">{t.interior}</option>
                              <option value="Construction">{t.construction}</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-neutral-500">{t.clientPhone}</span>
                            <input name="clientPhone" type="tel" maxLength={32} defaultValue={project.client_phone} placeholder="+62 812 3456 7890" className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-bronze-500 dark:border-white/10 dark:bg-neutral-950" />
                          </label>
                          <button disabled={busy} className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest transition-colors hover:border-bronze-500 disabled:opacity-50 dark:border-white/15 dark:bg-white/[0.03]">{t.saveProjectDetails}</button>
                        </form>
                        <form onSubmit={saveProjectStartDate} className="mt-4 flex flex-wrap items-end gap-3 border-t border-neutral-100 pt-4 dark:border-white/10">
                          <input type="hidden" name="projectId" value={project.id} />
                          <label className="min-w-0 flex-1 sm:min-w-[180px]">
                            <span className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-neutral-500"><CalendarDays size={12} />{t.startDate}</span>
                            <input name="startDate" type="date" defaultValue={project.start_date ?? ''} required className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-bronze-500 focus:ring-4 focus:ring-bronze-500/10 dark:border-white/10 dark:bg-neutral-950 dark:[color-scheme:dark]" />
                          </label>
                          <button disabled={busy} className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest transition-colors hover:border-bronze-500 disabled:opacity-50 dark:border-white/15 dark:bg-white/[0.03]">{t.saveDate}</button>
                        </form>
                        <form onSubmit={saveClientAccount} className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 dark:border-white/10 sm:grid-cols-[1fr_auto] sm:items-end">
                          <input type="hidden" name="projectId" value={project.id} />
                          <Field name="clientEmail" label={t.clientEmail} type="email" defaultValue={project.client_email ?? ''} required maxLength={254} autoCapitalize="none" />
                          <button disabled={busy} className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 font-mono text-[9px] uppercase tracking-widest transition-colors hover:border-bronze-500 disabled:opacity-50 dark:border-white/15 dark:bg-white/[0.03]">{t.saveClientAccount}</button>
                        </form>
                        <p className="mt-2 text-[10px] leading-5 text-neutral-500">{t.clientEmailEditHint}</p>
                        <div className="mt-4 flex justify-end border-t border-neutral-100 pt-4 dark:border-white/10">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => deleteProject(project)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-500/10"
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
      </div>
      {authenticated && !checking && (
        <>
          {mobileNavOpen && (
            <button type="button" onClick={() => setMobileNavOpen(false)} aria-label={t.more} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] lg:hidden" />
          )}
          {mobileNavOpen && (
            <nav id="admin-mobile-more" aria-label={t.more} className="fixed inset-x-3 z-50 max-h-[min(60dvh,520px)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-neutral-900 lg:hidden" style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}>
              {moreMobileNavigation.map((item) => (
                <button key={item.id} type="button" onClick={() => navigateFromMobile(item.id)} className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors ${activeSection === item.id ? 'bg-[#f5f2ec] text-[#746349] dark:bg-white/[0.07] dark:text-bronze-300' : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/[0.05]'}`}>
                  <span className="text-bronze-600 dark:text-bronze-400">{item.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.id === 'admin-resets' && passwordRequests.length > 0 && <span className="rounded-full bg-bronze-500 px-2 py-0.5 font-mono text-[9px] text-white">{passwordRequests.length}</span>}
                  {item.id === 'admin-feedback' && unreadFeedbackCount > 0 && <span className="rounded-full bg-bronze-500 px-2 py-0.5 font-mono text-[9px] text-white">{unreadFeedbackCount}</span>}
                </button>
              ))}
            </nav>
          )}
          <nav aria-label={t.navigation} className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-neutral-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-8px_24px_rgba(27,25,20,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#111210]/95 lg:hidden">
            {primaryMobileNavigation.map((item) => (
              <button key={item.id} type="button" onClick={() => navigateFromMobile(item.id)} aria-current={activeSection === item.id ? 'page' : undefined} className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[9px] font-medium transition-colors ${activeSection === item.id ? 'text-bronze-700 dark:text-bronze-300' : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/[0.06]'}`}>
                <span>{item.icon}</span>
                <span className="w-full truncate text-center">{item.label}</span>
              </button>
            ))}
            <button type="button" onClick={() => setMobileNavOpen((open) => !open)} aria-expanded={mobileNavOpen} aria-controls="admin-mobile-more" className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[9px] font-medium transition-colors ${mobileNavOpen || moreMobileNavigation.some((item) => item.id === activeSection) ? 'text-bronze-700 dark:text-bronze-300' : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/[0.06]'}`}>
              <Layers size={17} />
              <span className="w-full truncate text-center">{t.more}</span>
            </button>
          </nav>
        </>
      )}
      {authenticated && !checking && previewAttachment && (
        <PortalFilePreview
          attachment={previewAttachment}
          labels={{ preview: t.previewFile, download: t.downloadFile, close: t.closePreview }}
          onClose={() => setPreviewAttachment(null)}
        />
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
      <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
      <input {...props} className="w-full rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8c795e] focus:ring-4 focus:ring-[#8c795e]/10 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-bronze-400 dark:focus:ring-bronze-400/10" />
    </label>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-h-28 flex-col justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5 dark:border-white/10 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2 text-neutral-500">
        <p className="text-xs font-medium">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#8c795e] dark:bg-white/[0.06] dark:text-bronze-400">{icon}</span>
      </div>
      <p className="mt-4 font-display text-3xl font-medium tracking-tight tabular-nums sm:text-4xl">{value}</p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <p role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm leading-6 text-red-600 dark:text-red-300">{message}</p>;
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

function formatAdminCurrency(value: string | number, language: string): string {
  const locale = language === 'ID' ? 'id-ID' : language === 'CN' ? 'zh-CN' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
}

function formatAdminIntegerInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatAdminDateTime(value: string, language: string): string {
  const locale = language === 'ID' ? 'id-ID' : language === 'CN' ? 'zh-CN' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function today(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default PortalAdmin;
