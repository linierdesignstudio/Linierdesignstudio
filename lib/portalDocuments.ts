import type { PortalAttachment } from './portalApi';

export type PortalDocumentKind = 'image' | 'pdf' | 'word' | 'spreadsheet' | 'other';

export function getPortalDocumentKind(attachment: Pick<PortalAttachment, 'name' | 'contentType'>): PortalDocumentKind {
  const contentType = attachment.contentType.toLowerCase();
  const extension = attachment.name.split('.').pop()?.toLowerCase() ?? '';

  if (contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(extension)) return 'image';
  if (contentType === 'application/pdf' || extension === 'pdf') return 'pdf';
  if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(contentType)
    || ['doc', 'docx'].includes(extension)) return 'word';
  if (contentType.includes('spreadsheet') || contentType === 'text/csv' || ['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'spreadsheet';
  }
  return 'other';
}

export function canPreviewPortalDocument(attachment: Pick<PortalAttachment, 'name' | 'contentType'>): boolean {
  const kind = getPortalDocumentKind(attachment);
  return kind === 'image' || kind === 'pdf';
}
