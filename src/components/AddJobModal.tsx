import React, { useState } from 'react';
import { X, Paperclip } from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import type { JobStatus, Attachment } from '../../shared/types';
import { saveFile } from '../utils/fileStorage';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddJobModal = ({ isOpen, onClose }: AddJobModalProps) => {
  const { addJob } = useJobs();
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>(
    []
  );

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'Wishlist' as JobStatus,
    dateApplied: new Date().toISOString().slice(0, 10),
    location: '',
    salary: '',
    jobUrl: '',
    description: '',
  });

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large.Max size is 5MB.`);
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

        setPendingAttachments((prev) => [...prev, newAttachment]);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addJob({
      ...formData,
      dateApplied: new Date(formData.dateApplied).toISOString(),
      rounds: [],
      attachments: pendingAttachments,
    });
    onClose();
    setFormData({
      company: '',
      position: '',
      status: 'Wishlist',
      dateApplied: new Date().toISOString().slice(0, 10),
      location: '',
      salary: '',
      jobUrl: '',
      description: '',
    });
    setPendingAttachments([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-surface/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-white/[0.06] sticky top-0 bg-surface/95 backdrop-blur-xl z-10">
          <h2 className="text-xl font-bold text-white">Add New Job</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Company
              </label>
              <input
                required
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full bg-black/50 border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Google"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Position
              </label>
              <input
                required
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                placeholder="e.g. Frontend Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as JobStatus,
                  })
                }
                className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              >
                <option value="Wishlist">Wishlist</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Date Applied
              </label>
              <input
                type="date"
                value={formData.dateApplied}
                onChange={(e) =>
                  setFormData({ ...formData, dateApplied: e.target.value })
                }
                className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                placeholder="e.g. Remote, NY"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Offered CTC (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  ₹
                </span>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className="w-full bg-background border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white focus:border-primary outline-none"
                  placeholder="e.g. 12,00,000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary uppercase">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full h-32 bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary uppercase">
              Job URL
            </label>
            <input
              type="text"
              value={formData.jobUrl}
              onChange={(e) =>
                setFormData({ ...formData, jobUrl: e.target.value })
              }
              className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Attachments
              </label>
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
                  type="button"
                  disabled={isUploading}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Paperclip className="w-3 h-3" />
                  Add File
                </button>
              </div>
            </div>

            {pendingAttachments.length > 0 && (
              <div className="space-y-2">
                {pendingAttachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10"
                  >
                    <span className="text-sm text-text-secondary truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePendingAttachment(file.id)}
                      className="text-text-muted hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium transition-all hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isUploading ? 'Uploading...' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobModal;
