import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  employeeName: string;
}

export default function ImageViewerModal({ isOpen, onClose, imageUrl, employeeName }: ImageViewerModalProps) {
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${employeeName.replace(/\s+/g, '_')}_photo.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 max-w-5xl w-full mx-4 animate-in zoom-in-95 fade-in-0">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-t-lg px-4 py-3 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              {employeeName}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Profile Photo
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>
            
            <span className="text-xs text-neutral-600 dark:text-neutral-400 min-w-[45px] text-center">
              {zoom}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>

            <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Download Photo"
            >
              <Download className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="bg-neutral-100 dark:bg-neutral-950 rounded-b-lg p-6 max-h-[calc(100vh-200px)] overflow-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <img
              src={imageUrl}
              alt={employeeName}
              style={{ 
                transform: `scale(${zoom / 100})`,
                transition: 'transform 0.2s ease-in-out'
              }}
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Keyboard Hint */}
        <div className="mt-2 text-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Press <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded text-[10px] font-mono">ESC</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
