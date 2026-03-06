'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Cloud, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
}

const FileUploader = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, currentFolderId } = useApp();
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isUploadModalOpen && fileInputRef.current) {
      fileInputRef.current.click();
      setIsUploadModalOpen(false); // Close modal state immediately since we use the native dialog
    }
  }, [isUploadModalOpen, setIsUploadModalOpen]);

  const handleUpload = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: UploadingFile[] = Array.from(selectedFiles).map(
        (file) => ({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'uploading',
        })
      );

      setFiles((prev) => [...prev, ...newFiles]);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const uploadingFile = newFiles[i];

        const formData = new FormData();
        formData.append('file', file);
        formData.append('parentId', currentFolderId || 'null');

        try {
          await axios.post('/api/upload', formData, {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadingFile.id
                    ? { ...f, progress: percentCompleted }
                    : f
                )
              );
            },
          });

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadingFile.id
                ? { ...f, status: 'completed', progress: 100 }
                : f
            )
          );
        } catch (error: any) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadingFile.id
                ? {
                    ...f,
                    status: 'failed',
                    error: 'Upload falhou',
                  }
                : f
            )
          );
        }
      }

      router.refresh();
    },
    [currentFolderId, router]
  );

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status === 'uploading'));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  if (files.length === 0) {
    return (
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={(e) => handleUpload(e.target.files)}
      />
    );
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={(e) => handleUpload(e.target.files)}
      />

      <AnimatePresence>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-70 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              <span className="font-medium text-sm">
                {files.some((f) => f.status === 'uploading')
                  ? 'Fazendo upload...'
                  : 'Uploads concluídos'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearCompleted}
                className="hover:bg-blue-700 p-1 rounded-full transition-colors"
                title="Limpar concluídos"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* File List */}
          <div className="max-h-80 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                    <File className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-900 truncate pr-2">
                        {file.name}
                      </p>
                      {file.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : file.status === 'failed' ? (
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                          className={`h-full ${
                            file.status === 'failed'
                              ? 'bg-red-500'
                              : 'bg-blue-600'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 tabular-nums">
                        {file.progress}%
                      </span>
                    </div>

                    {file.status === 'failed' && (
                      <p className="text-[10px] text-red-500 mt-1 truncate">
                        {file.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default FileUploader;
