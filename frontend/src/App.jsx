import React, { useState } from "react";
import {
  Upload,
  Youtube,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function SynthAI() {
  const [activeTab, setActiveTab] = useState("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);

  function FancySummary({ summary }) {
    return (
      <div className="prose prose-slate max-w-none p-6 bg-white rounded-2xl shadow-lg">
        <ReactMarkdown
          components={{
            // Bold text (**bold**) → emerald green
            strong: ({ children }) => (
              <span className="text-emerald-600 font-semibold">{children}</span>
            ),

            // Headings (###) → blue with left border
            h3: ({ children }) => (
              <h3 className="text-blue-600 font-bold border-l-4 border-blue-300 pl-2 mt-6 mb-4">
                {children}
              </h3>
            ),

            // Paragraphs → subtle gray background with extra line spacing
            p: ({ children }) => (
              <p className="bg-gray-50 p-3 rounded-lg my-4 leading-relaxed text-gray-800">
                {children}
              </p>
            ),

            // Marked text (==highlight== in your markdown) → yellow highlight
            mark: ({ children }) => (
              <span className="bg-yellow-200 px-1 rounded">{children}</span>
            ),
          }}
        >
          {summary}
        </ReactMarkdown>
      </div>
    );
  }

  const handleYouTubeSummarize = async () => {
    if (!youtubeUrl.trim()) return;

    setIsLoading(true);
    setSummary(""); // clear previous summary
    try {
      const result = await axios.get(`/transcript?url=${youtubeUrl}`);
      setSummary(result.data.summary);
    } catch (error) {
      console.error("YouTube summarization failed:", error);
      setSummary("❌ Failed to summarize video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    const formData = new FormData();
    formData.append("file", selectedFile);
    const result = await axios.post("/file-summary", formData);
    setSummary(result.data.summary);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SynthAI
            </h1>
            <span className="text-slate-500 text-sm font-medium">
              AI-Powered Summarizer
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex bg-white rounded-2xl p-2 shadow-sm border border-slate-200/60 mb-8">
          <button
            onClick={() => setActiveTab("youtube")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "youtube"
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Youtube className="w-5 h-5" />
            YouTube Videos
          </button>
          <button
            onClick={() => setActiveTab("document")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "document"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-5 h-5" />
            Documents
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {activeTab === "youtube" ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      YouTube Summarizer
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Extract key insights from any YouTube video
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleYouTubeSummarize}
                    disabled={!youtubeUrl.trim() || isLoading}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Video...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Summarize Video
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Document Summarizer
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Upload documents to get instant summaries
                    </p>
                  </div>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragOver
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">
                        Drop your documents here
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        or click to browse files
                      </p>
                      <p className="text-slate-400 text-xs mt-2">
                        Supports PDF, DOCX, TXT files
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 cursor-pointer transition-all duration-200 shadow-lg shadow-blue-500/25"
                    >
                      Choose Files
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    AI Summary
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Generated insights and key points
                  </p>
                </div>
              </div>
              {summary && (
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            <div className="min-h-[300px] flex items-center justify-center">
              {isLoading ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-slate-600">
                    AI is analyzing your content...
                  </p>
                  <div className="w-48 h-2 bg-slate-200 rounded-full mx-auto mt-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ) : summary ? (
                <div className="w-full">
                  <div className="prose prose-slate max-w-none">
                    <FancySummary summary = {summary}/>
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/60">
                    <p className="text-sm text-emerald-700 font-medium">
                      ✨ Summary generated successfully!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">
                    Your AI-generated summary will appear here
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    {activeTab === "youtube"
                      ? "Add a YouTube URL to get started"
                      : "Upload a document to get started"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
