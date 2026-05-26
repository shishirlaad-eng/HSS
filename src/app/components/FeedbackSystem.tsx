import React, { useState, useRef, useEffect } from "react";
import { MessageSquarePlus, List, X, Send, Image as ImageIcon, Check, ChevronRight, MessageSquare, Plus, PenTool } from "lucide-react";

// Mock Data for Past Feedbacks
const MOCK_FEEDBACKS = [
  { id: "FB-1021", subject: "Layout breaks on small screens", date: "2026-05-15", status: "In Progress" },
  { id: "FB-1020", subject: "Button hover color issue", date: "2026-05-12", status: "Resolved" },
];

export function FeedbackSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"idle" | "annotate" | "form" | "list" | "detail">("idle");
  
  // Annotation State
  const [markers, setMarkers] = useState<{ x: number, y: number, id: number }[]>([]);
  const [boxes, setBoxes] = useState<{ x: number, y: number, w: number, h: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  
  // Form State
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("Point 1:\n\nPoint 2:\n");

  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen && mode === "idle") {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, mode]);

  // Annotation Handlers
  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (mode !== "annotate") return;
    setStartPos({ x: e.clientX, y: e.clientY });
    setIsDrawing(true);
  };

  const handleOverlayMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos) return;
    const currentX = e.clientX;
    const currentY = e.clientY;
    setCurrentBox({
      x: Math.min(startPos.x, currentX),
      y: Math.min(startPos.y, currentY),
      w: Math.abs(currentX - startPos.x),
      h: Math.abs(currentY - startPos.y)
    });
  };

  const handleOverlayMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos) return;
    setIsDrawing(false);
    
    // If it was just a click (or tiny drag), drop a marker instead
    if (Math.abs(e.clientX - startPos.x) < 10 && Math.abs(e.clientY - startPos.y) < 10) {
      setMarkers(prev => [...prev, { x: e.clientX, y: e.clientY, id: prev.length + 1 }]);
      setCurrentBox(null);
      setStartPos(null);
      return;
    }
    
    if (currentBox) {
      setBoxes(prev => [...prev, currentBox]);
    }
    setCurrentBox(null);
    setStartPos(null);
  };

  const resetAnnotation = () => {
    setMarkers([]);
    setBoxes([]);
    setMode("idle");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {mode === "idle" && (
        <div className="fixed bottom-20 right-6 z-[9000]" ref={fabRef}>
          {isOpen && (
            <div className="absolute bottom-16 right-0 mb-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden py-1">
              <button 
                onClick={() => { setMode("annotate"); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="bg-primary-50 dark:bg-primary-950 p-1.5 rounded-md text-primary-600 dark:text-primary-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <span className="font-medium">Create Feedback</span>
              </button>
              <button 
                onClick={() => { setMode("list"); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-t border-neutral-100 dark:border-neutral-800"
              >
                <div className="bg-orange-50 dark:bg-orange-950 p-1.5 rounded-md text-orange-600 dark:text-orange-400">
                  <List className="w-4 h-4" />
                </div>
                <span className="font-medium">List your Last Feedbacks</span>
              </button>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none"
            title="Feedback & Support"
          >
            {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* Annotation Overlay */}
      {mode === "annotate" && (
        <div className="fixed inset-0 z-[9999] cursor-crosshair">
          {/* Invisible background for capturing events */}
          <div 
            className="absolute inset-0 bg-black/10"
            onMouseDown={handleOverlayMouseDown}
            onMouseMove={handleOverlayMouseMove}
            onMouseUp={handleOverlayMouseUp}
          />
          
          {/* Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-lg px-4 py-2 flex items-center gap-4 z-50">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mr-2 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-primary-500" />
              Draw boxes or click to drop pins
            </div>
            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800"></div>
            <button 
              onClick={() => { setMarkers([]); setBoxes([]); }}
              className="text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
            >
              Clear
            </button>
            <button 
              onClick={() => { setMode("form"); }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            >
              Next
            </button>
            <button 
              onClick={resetAnnotation}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Render Boxes */}
          {boxes.map((box, i) => (
            <div 
              key={i} 
              className="absolute border-2 border-red-500 bg-red-500/10 pointer-events-none"
              style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
            />
          ))}

          {/* Render Current Box */}
          {currentBox && (
            <div 
              className="absolute border-2 border-red-500 bg-red-500/10 pointer-events-none"
              style={{ left: currentBox.x, top: currentBox.y, width: currentBox.w, height: currentBox.h }}
            />
          )}

          {/* Render Markers */}
          {markers.map((marker) => (
            <div 
              key={marker.id}
              className="absolute w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold pointer-events-none shadow-md"
              style={{ left: marker.x - 12, top: marker.y - 12 }}
            >
              {marker.id}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {(mode === "form" || mode === "detail") && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {mode === "detail" ? "Feedback Details" : "Send Feedback"}
              </h2>
              <button 
                onClick={() => {
                  if (mode === "detail") setMode("list");
                  else resetAnnotation();
                }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Column - Preview */}
              <div className="w-full md:w-3/5 bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 p-6 flex flex-col overflow-hidden relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Screenshot Preview</h3>
                </div>
                <div className="flex-1 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 relative overflow-hidden shadow-inner flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-700 absolute" />
                  
                  {/* Mock rendering of markers relative to the box */}
                  <div className="absolute inset-0 pointer-events-none opacity-50 bg-white dark:bg-neutral-900" />
                  
                  {/* Render relative boxes and markers for preview */}
                  {(mode === "form" ? boxes : selectedFeedback?.boxes || []).map((box: any, i: number) => {
                    // Scaled down logic: assuming standard screen 1920x1080 to container
                    // For simplicity, we'll just render them absolute and scale the container down via CSS transform
                    return (
                      <div 
                        key={i} 
                        className="absolute border-2 border-red-500 bg-red-500/10"
                        style={{ 
                          left: `${(box.x / window.innerWidth) * 100}%`, 
                          top: `${(box.y / window.innerHeight) * 100}%`, 
                          width: `${(box.w / window.innerWidth) * 100}%`, 
                          height: `${(box.h / window.innerHeight) * 100}%` 
                        }}
                      />
                    );
                  })}
                  
                  {(mode === "form" ? markers : selectedFeedback?.markers || []).map((marker: any) => (
                    <div 
                      key={marker.id}
                      className="absolute w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ 
                        left: `calc(${(marker.x / window.innerWidth) * 100}% - 10px)`, 
                        top: `calc(${(marker.y / window.innerHeight) * 100}% - 10px)` 
                      }}
                    >
                      {marker.id}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="w-full md:w-2/5 flex flex-col overflow-y-auto bg-white dark:bg-neutral-900 p-6">
                <div className="space-y-6 flex-1">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Your Email</label>
                    <input 
                      type="email" 
                      value="john.doe@company.com"
                      disabled
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-500"
                    />
                    <p className="text-xs text-neutral-400 mt-1.5">On this email you will get updates of task</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Subject</label>
                    <input 
                      type="text" 
                      placeholder="What is this about?"
                      value={mode === "detail" ? selectedFeedback?.subject : subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={mode === "detail"}
                      className="w-full px-4 py-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      value={mode === "detail" ? "Point 1: Issue with contrast\nPoint 2: Button unresponsive" : description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={mode === "detail"}
                      className="w-full flex-1 min-h-[250px] px-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none font-mono"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                {mode !== "detail" && (
                  <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <button 
                      onClick={() => setMode("annotate")}
                      className="px-6 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
                    >
                      Back to Edit
                    </button>
                    <button 
                      onClick={() => {
                        // Submit logic mock
                        resetAnnotation();
                      }}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List Feedbacks Modal */}
      {mode === "list" && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Your Feedbacks</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">View status of previously submitted feedback</p>
              </div>
              <button 
                onClick={resetAnnotation}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Submitted Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {MOCK_FEEDBACKS.map((fb) => (
                      <tr key={fb.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">{fb.id}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300">{fb.subject}</td>
                        <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">{fb.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            fb.status === "Resolved" 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}>
                            {fb.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedFeedback(fb);
                              setMode("detail");
                            }}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
