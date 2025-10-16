"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  LogOut,
  Menu,
  Edit2,
  Trash2,
  Save,
  Clock,
  X,
  Download,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/modetoggle";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_URL = `${process.env.NEXT_PUBLIC_B_URL}/api`;

interface Document {
  id: number;
  title: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
}

declare global {
  interface Window {
    Quill: any;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const quillRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDoc, setCurrentDoc] = useState<DocumentDetail | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [greet, setGreet] = useState<string>("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close sidebar on mobile
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load Quill CSS and JS
  useEffect(() => {
    // Load CSS
    const cssLink = document.createElement("link");
    cssLink.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
    cssLink.rel = "stylesheet";
    document.head.appendChild(cssLink);

    // Add custom CSS for dark mode and mobile
    const styleElement = document.createElement("style");
    styleElement.id = "quill-dark-mode";
    styleElement.textContent = `
      /* Quill Editor Theme Sync */
      .ql-toolbar.ql-snow {
        background: hsl(var(--card));
        border-color: hsl(var(--border)) !important;
      }
      
      .ql-container.ql-snow {
        background: hsl(var(--background));
        border-color: hsl(var(--border)) !important;
        color: hsl(var(--foreground));
      }
      
      .ql-editor {
        color: hsl(var(--foreground));
      }
      
      .ql-editor.ql-blank::before {
        color: hsl(var(--muted-foreground));
      }
      
      /* Toolbar buttons */
      .ql-toolbar.ql-snow .ql-stroke {
        stroke: hsl(var(--foreground));
      }
      
      .ql-toolbar.ql-snow .ql-fill {
        fill: hsl(var(--foreground));
      }
      
      .ql-toolbar.ql-snow .ql-picker-label {
        color: hsl(var(--foreground));
      }
      
      /* Hover states */
      .ql-toolbar.ql-snow button:hover,
      .ql-toolbar.ql-snow button:focus {
        background: hsl(var(--secondary));
      }
      
      .ql-toolbar.ql-snow button:hover .ql-stroke,
      .ql-toolbar.ql-snow button:focus .ql-stroke {
        stroke: hsl(var(--primary));
      }
      
      .ql-toolbar.ql-snow button:hover .ql-fill,
      .ql-toolbar.ql-snow button:focus .ql-fill {
        fill: hsl(var(--primary));
      }
      
      /* Active state */
      .ql-toolbar.ql-snow button.ql-active {
        background: hsl(var(--primary));
      }
      
      .ql-toolbar.ql-snow button.ql-active .ql-stroke {
        stroke: hsl(var(--primary-foreground));
      }
      
      .ql-toolbar.ql-snow button.ql-active .ql-fill {
        fill: hsl(var(--primary-foreground));
      }
      
      /* Picker options */
      .ql-snow .ql-picker-options {
        background: hsl(var(--card));
        border-color: hsl(var(--border));
      }
      
      .ql-snow .ql-picker-item:hover {
        background: hsl(var(--secondary));
      }
      
      /* Tooltips */
      .ql-toolbar.ql-snow .ql-picker-label:hover,
      .ql-toolbar.ql-snow .ql-picker-item:hover {
        color: hsl(var(--primary));
      }

      /* Mobile responsive toolbar */
      @media (max-width: 640px) {
        .ql-toolbar.ql-snow {
          padding: 4px;
        }
        .ql-toolbar.ql-snow button {
          width: 24px !important;
          height: 24px !important;
          padding: 2px !important;
        }
        .ql-toolbar.ql-snow .ql-picker {
          font-size: 12px;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Load JS
    const script = document.createElement("script");
    script.src = "https://cdn.quilljs.com/1.3.6/quill.js";
    script.onload = () => {
      setEditorReady(true);
    };
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(cssLink);
      document.head.removeChild(styleElement);
      document.body.removeChild(script);
    };
  }, []);

  // Initialize Quill when editor is ready and currentDoc changes
  useEffect(() => {
    if (!editorReady || !currentDoc || !editorContainerRef.current) return;

    // Clear existing editor
    if (quillRef.current) {
      editorContainerRef.current.innerHTML = "";
    }

    // Create editor container
    const editorDiv = document.createElement("div");
    editorDiv.id = "editor";
    editorContainerRef.current.appendChild(editorDiv);

    // Initialize Quill with responsive toolbar
    const toolbarOptions = isMobile
      ? [
          // [{ header: [1, 2, 3, false] }],
          // ["bold", "italic", "underline"],
          // [{ list: "ordered" }, { list: "bullet" }],
          // ["link"],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image"],
          ["clean"],
        ]
      : [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image"],
          ["clean"],
        ];

    const quill = new window.Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: "Start writing your document...",
    });

    // Set initial content
    if (currentDoc.content) {
      try {
        const delta = JSON.parse(currentDoc.content);
        quill.setContents(delta);
      } catch {
        // If content is HTML, insert it
        quill.root.innerHTML = currentDoc.content;
      }
    }

    // Listen for changes
    quill.on("text-change", () => {
      const delta = quill.getContents();
      const content = JSON.stringify(delta);
      setCurrentDoc((prev) => (prev ? { ...prev, content } : null));
    });

    quillRef.current = quill;

    return () => {
      if (editorContainerRef.current) {
        editorContainerRef.current.innerHTML = "";
      }
      quillRef.current = null;
    };
  }, [editorReady, currentDoc?.id, isMobile]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".export-menu-container")) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showExportMenu]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("aside") && !target.closest(".menu-button")) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Check authentication and fetch initial data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        await Promise.all([fetchUser(), fetchDocuments()]);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("auth_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    greetUser();
  }, [router]);

  const fetchUser = async () => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_URL}/auth/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    const data = await res.json();
    setUser(data);
  };

  const fetchDocuments = async () => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_URL}/document`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch documents");
    const data = await res.json();
    setDocuments(data);
    if (data.length > 0 && !currentDoc) {
      fetchDocument(data[0].id);
    }
  };

  const fetchDocument = async (id: number) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_URL}/document/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch document");
    const data = await res.json();
    setCurrentDoc(data);
    // Close sidebar on mobile after selecting document
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const createNewDocument = async () => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_URL}/document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Untitled Document",
        content: JSON.stringify({ ops: [{ insert: "\n" }] }),
      }),
    });
    if (!res.ok) throw new Error("Failed to create document");
    const data = await res.json();
    setCurrentDoc(data);
    await fetchDocuments();
    // Close sidebar on mobile after creating document
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const saveDocument = async () => {
    if (!currentDoc) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/document/${currentDoc.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: currentDoc.title,
          content: currentDoc.content,
        }),
      });
      if (!res.ok) throw new Error("Failed to save document");
      const data = await res.json();
      setCurrentDoc(data);
      await fetchDocuments();
    } finally {
      setIsSaving(false);
    }
  };

  const greetUser = useCallback((): void => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 4 && hour < 12) {
      setGreet("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setGreet("Good afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreet("Good evening");
    } else {
      setGreet("Hello Night Owl");
    }
  }, []);

  const deleteDocument = async (id: number) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_URL}/document/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete document");

    if (currentDoc?.id === id) {
      setCurrentDoc(null);
    }
    await fetchDocuments();
    setShowDeleteDialog(false);
  };

  const exportToPDF = async () => {
    if (!currentDoc || !quillRef.current) return;
    setIsExporting(true);

    try {
      const editorContent = quillRef.current.root;

      // Create a temporary container with better styling for PDF
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.width = "210mm"; // A4 width
      tempContainer.style.padding = "20mm";
      tempContainer.style.backgroundColor = "white";
      tempContainer.style.color = "black";
      tempContainer.style.fontFamily = "Arial, sans-serif";

      // Clone editor content (without title)
      const contentClone = editorContent.cloneNode(true) as HTMLElement;
      contentClone.style.color = "black";
      tempContainer.appendChild(contentClone);

      document.body.appendChild(tempContainer);

      // Generate canvas from HTML
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF (handle multiple pages if needed)
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Download
      pdf.save(`${currentDoc.title}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportToDOCX = () => {
    if (!currentDoc || !quillRef.current) return;
    setIsExporting(true);

    try {
      const editorContent = quillRef.current.root;

      // Create HTML structure for DOCX (without title)
      const htmlContent = `
        <!DOCTYPE html>
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset='utf-8'>
            <title>${currentDoc.title}</title>
            <style>
              body { 
                font-family: Arial, Calibri, sans-serif; 
                font-size: 11pt;
                line-height: 1.5;
              }
              h1 { 
                font-size: 24pt; 
                font-weight: bold; 
                margin-bottom: 12pt; 
              }
              h2 { font-size: 18pt; font-weight: bold; margin-bottom: 10pt; }
              h3 { font-size: 14pt; font-weight: bold; margin-bottom: 8pt; }
              p { margin-bottom: 10pt; }
              ul, ol { margin-bottom: 10pt; }
              strong { font-weight: bold; }
              em { font-style: italic; }
              u { text-decoration: underline; }
            </style>
          </head>
          <body>
            ${editorContent.innerHTML}
          </body>
        </html>
      `;

      // Convert HTML to Blob
      const blob = new Blob(["\ufeff", htmlContent], {
        type: "application/msword",
      });

      // Download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${currentDoc.title}.doc`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error exporting to DOCX:", error);
      alert("Failed to export DOCX. Please try again.");
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="hidden lg:block w-64 h-full border-r border-border bg-sidebar animate-pulse" />
        <div className="flex-1 p-4 sm:p-8">
          <div className="h-12 w-48 mb-4 bg-muted rounded animate-pulse" />
          <div className="h-64 w-full bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-sidebar bg-background border-r border-border transition-all duration-300 flex flex-col z-50
          ${isMobile ? "fixed inset-y-0 left-0" : "relative"}
          ${sidebarOpen ? "w-64" : isMobile ? "-translate-x-full w-64" : "w-20"}
          ${isMobile && sidebarOpen ? "translate-x-0" : ""}
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div
              className={`flex items-center gap-2 ${
                !sidebarOpen && !isMobile && "hidden"
              }`}
            >
              <FileText className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Snapwrite</span>
            </div>
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 hover:bg-secondary rounded-md transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-secondary rounded-md transition-colors lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* New Document Button */}
        <div className="p-4 border-b border-border">
          <button
            onClick={createNewDocument}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            {(sidebarOpen || isMobile) && "New"}
          </button>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className={sidebarOpen || isMobile ? "space-y-1" : "space-y-2"}>
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2 text-center">
                No documents yet
              </p>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => fetchDocument(doc.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentDoc?.id === doc.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  {sidebarOpen || isMobile ? (
                    <div>
                      <p className="font-medium truncate text-sm">
                        {doc.title}
                      </p>
                    </div>
                  ) : (
                    <FileText className="w-4 h-4 mx-auto" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={logout}
            className="w-full border border-border hover:bg-secondary px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="w-4 h-4" />
            {(sidebarOpen || isMobile) && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-border p-3 sm:p-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1 hover:bg-secondary rounded-md transition-colors menu-button lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold truncate">
              {greet}, {user?.name ?? "User"}!
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {currentDoc && (
              <span className="hidden sm:flex text-sm text-muted-foreground items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(currentDoc.updatedAt).toLocaleDateString()}
              </span>
            )}
            <div className="ml-2">
              <ModeToggle />
            </div>
          </div>
        </div>

        {/* Editor */}
        {currentDoc ? (
          <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-hidden gap-3 sm:gap-4">
            <input
              type="text"
              value={currentDoc.title}
              onChange={(e) =>
                setCurrentDoc({ ...currentDoc, title: e.target.value })
              }
              placeholder="Document Title"
              className="text-xl sm:text-2xl font-bold border-0 bg-transparent px-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
            />

            {/* Quill Editor */}
            <div className="flex-1 overflow-hidden rounded-md border border-border bg-white">
              <div ref={editorContainerRef} className="h-full" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => fetchDocument(currentDoc.id)}
                className="border border-border hover:bg-secondary px-3 sm:px-4 py-2 rounded-md transition-colors font-medium text-sm"
              >
                <span className="hidden sm:inline">Discard</span>
                <X className="w-4 h-4 sm:hidden" />
              </button>

              {/* Export Dropdown */}
              <div className="relative export-menu-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExportMenu(!showExportMenu);
                  }}
                  disabled={isExporting}
                  className="border border-border hover:bg-secondary px-3 sm:px-4 py-2 rounded-md transition-colors font-medium flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isExporting ? "Exporting..." : "Export"}
                  </span>
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 bottom-full mb-2 bg-card border border-border rounded-md shadow-lg overflow-hidden z-10 min-w-[160px]">
                    <button
                      onClick={exportToPDF}
                      className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export as PDF
                    </button>
                    <button
                      onClick={exportToDOCX}
                      className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export as DOCX
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setDocToDelete(currentDoc.id);
                  setShowDeleteDialog(true);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 sm:px-4 py-2 rounded-md transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
              <button
                onClick={saveDocument}
                disabled={isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-3 sm:px-4 py-2 rounded-md transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isSaving ? "Saving..." : "Save"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted-foreground px-4">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 opacity-50" />
            <p className="text-center text-sm sm:text-base">
              No document selected. Create a new one to get started!
            </p>
            <button
              onClick={createNewDocument}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Document
            </button>
          </div>
        )}
      </main>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg p-4 sm:p-6 max-w-sm w-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold">
                Delete Document
              </h2>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Are you sure you want to delete this document? This action cannot
              be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="border border-border hover:bg-secondary px-3 sm:px-4 py-2 rounded-md transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => docToDelete && deleteDocument(docToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 sm:px-4 py-2 rounded-md transition-colors font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
