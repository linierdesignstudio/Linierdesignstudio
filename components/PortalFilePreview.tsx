import React, { useEffect } from 'react';
import { Download, FileText, X } from 'lucide-react';
import type { PortalAttachment } from '../lib/portalApi';
import { getPortalDocumentKind } from '../lib/portalDocuments';

interface PortalFilePreviewProps {
  attachment: PortalAttachment;
  labels: {
    preview: string;
    download: string;
    close: string;
  };
  iconColorClassName?: string;
  onClose: () => void;
}

const PortalFilePreview: React.FC<PortalFilePreviewProps> = ({
  attachment,
  labels,
  iconColorClassName = 'text-[#8c795e] dark:text-bronze-400',
  onClose,
}) => {
  const previewUrl = attachment.url;
  const downloadUrl = attachment.downloadUrl ?? attachment.url;
  const kind = getPortalDocumentKind(attachment);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!previewUrl) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-6">
      <button
        type="button"
        aria-label={labels.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${labels.preview}: ${attachment.name}`}
        className="relative flex h-[min(94dvh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-neutral-950"
      >
        <header className="flex min-h-14 items-center gap-3 border-b border-neutral-200 px-3 py-2.5 dark:border-white/10 sm:px-5">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f2ec] dark:bg-white/[0.06] ${iconColorClassName}`}>
            <FileText size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">{attachment.name}</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">{labels.preview}</p>
          </div>
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={attachment.name}
              target="_blank"
              rel="noreferrer"
              aria-label={`${labels.download}: ${attachment.name}`}
              title={labels.download}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-neutral-900 px-3 text-xs font-medium text-white transition-colors hover:bg-bronze-600 dark:bg-white dark:text-neutral-950 dark:hover:bg-bronze-300 sm:px-4"
            >
              <Download size={15} />
              <span className="hidden sm:inline">{labels.download}</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            title={labels.close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-white/10 dark:text-neutral-300 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 bg-neutral-100 dark:bg-black">
          {kind === 'image' ? (
            <div className="flex h-full items-center justify-center overflow-auto p-2 sm:p-5">
              <img src={previewUrl} alt={attachment.name} className="max-h-full max-w-full rounded-lg object-contain" />
            </div>
          ) : kind === 'pdf' ? (
            <iframe title={`${labels.preview}: ${attachment.name}`} src={previewUrl} className="h-full w-full border-0 bg-white" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-neutral-500">
              <FileText size={32} />
              <p className="text-sm">{attachment.name}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PortalFilePreview;
