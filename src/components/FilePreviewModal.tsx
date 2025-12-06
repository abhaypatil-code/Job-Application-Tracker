import { X, Download, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Attachment } from '../types';
import { getFile } from '../utils/fileStorage';

interface FilePreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

const FilePreviewModal = ({ attachment, onClose }: FilePreviewModalProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (attachment) {
      setLoading(true);
      setError(null);
      getFile(attachment.storageId)
        .then((file) => {
          if (file) {
            const url = URL.createObjectURL(file.data);
            setFileUrl(url);
          } else {
            setError('File not found in storage');
          }
        })
        .catch(() => setError('Error loading file'))
        .finally(() => setLoading(false));
    } else {
      setFileUrl(null);
    }

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [attachment]);

  if (!attachment) return null;

  const isImage = attachment.type.startsWith('image/');
  const isPdf = attachment.type === 'application/pdf';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-surface rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white truncate max-w-md">
              {attachment.name}
            </h2>
            <span className="text-xs text-text-secondary px-2 py-1 rounded bg-white/5">
              {(attachment.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <div className="flex items-center gap-2">
            {fileUrl && (
              <a
                href={fileUrl}
                download={attachment.name}
                className="p-2 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative bg-black/50 p-4 flex items-center justify-center">
          {loading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          )}

          {error && (
            <div className="text-red-400 flex flex-col items-center gap-2">
              <X className="w-8 h-8" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && fileUrl && (
            <>
              {isImage && (
                <img
                  src={fileUrl}
                  alt={attachment.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              )}
              {isPdf && (
                <iframe
                  src={fileUrl}
                  className="w-full h-full rounded-lg bg-white"
                  title={attachment.name}
                />
              )}
              {!isImage && !isPdf && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto">
                    <ExternalLink className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-text-secondary">
                    Preview not available for this file type.
                  </p>
                  <a
                    href={fileUrl}
                    download={attachment.name}
                    className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Download File
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
