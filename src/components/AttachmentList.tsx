import {
  Trash2,
  FileText,
  Image as ImageIcon,
  Eye,
  Paperclip,
  Download,
} from 'lucide-react';
import { useState } from 'react';
import type { Attachment } from '../types';
import FilePreviewModal from './FilePreviewModal';
import { deleteFile, saveFile, getFile } from '../utils/fileStorage';

interface AttachmentListProps {
  attachments: Attachment[];
  onAdd: (attachment: Attachment) => void;
  onDelete: (attachmentId: string) => void;
}

const AttachmentList = ({
  attachments,
  onAdd,
  onDelete,
}: AttachmentListProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(
    null
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Size validation (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Max size is 5MB.`);
          continue;
        }

        const storageId = await saveFile(file);

        const newAttachment: Attachment = {
          id: crypto.randomUUID(),
          storageId,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };

        onAdd(newAttachment);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    if (!confirm(`Are you sure you want to delete ${attachment.name}?`)) return;

    try {
      await deleteFile(attachment.storageId);
      onDelete(attachment.id);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file.');
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const storedFile = await getFile(attachment.storageId);
      if (storedFile) {
        const url = URL.createObjectURL(storedFile.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-primary" />
          Attachments
        </h3>
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <button
            disabled={isUploading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isUploading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Upload</span>
                <span className="text-text-secondary text-xs">
                  (Images, PDF)
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="group relative bg-surface border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/5 rounded-lg text-primary">
                {attachment.type.includes('image') ? (
                  <ImageIcon className="w-6 h-6" />
                ) : (
                  <FileText className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-white truncate"
                  title={attachment.name}
                >
                  {attachment.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {(attachment.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/90 rounded-lg shadow-sm">
              <button
                onClick={() => setPreviewAttachment(attachment)}
                className="p-1.5 hover:bg-primary/20 text-text-secondary hover:text-primary rounded transition-colors"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownload(attachment)}
                className="p-1.5 hover:bg-primary/20 text-text-secondary hover:text-primary rounded transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(attachment)}
                className="p-1.5 hover:bg-red-500/20 text-text-secondary hover:text-red-500 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {attachments.length === 0 && (
          <div className="col-span-full border border-dashed border-white/10 rounded-xl p-8 text-center">
            <p className="text-text-secondary text-sm">No attachments yet.</p>
          </div>
        )}
      </div>

      <FilePreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
};

export default AttachmentList;
