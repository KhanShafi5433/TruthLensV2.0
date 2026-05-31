import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, AlertTriangle, TrendingUp, Clock, ShieldAlert, Upload, X, CheckCircle, Loader2, Globe, Phone, Flame, BarChart3, Flag, Info } from "lucide-react";
import { getCommunityFeed, getTrendingScams, reportScam, getTrendingScamsByType, getThreatIntelligenceStats, getDangerousDomains, getDangerousNumbers, reportPost } from "../services/communityFeed";
import { CommunityFeedItem, TrendingScam, ThreatIntelligenceStats } from "../services/communityFeed";
import { readImageFile } from "../utils/readImageFile";

interface CommunityFeedScreenProps {
  onGoBack: () => void;
  userEmail?: string;
}

export default function CommunityFeedScreen({ onGoBack, userEmail }: CommunityFeedScreenProps) {
  const [activeTab, setActiveTab] = useState<"latest" | "trending" | "intelligence">("latest");
  const [feedItems, setFeedItems] = useState<CommunityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    scamType: "other" as "sms" | "upi" | "kyc" | "otp" | "phishing" | "other",
    description: "",
    phoneNumber: "",
    suspiciousUrl: "",
    image: null as File | null,
    imageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  
  // Post report modal state
  const [showPostReportModal, setShowPostReportModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postReportReason, setPostReportReason] = useState<"spam" | "misinformation" | "offensive" | "other">("spam");
  const [postReportDescription, setPostReportDescription] = useState("");
  const [isSubmittingPostReport, setIsSubmittingPostReport] = useState(false);
  const [postReportSuccess, setPostReportSuccess] = useState(false);
  const [postReportError, setPostReportError] = useState("");
  const [reportedPosts, setReportedPosts] = useState<Set<string>>(new Set());
  
  // Intelligence data
  const [trendingScams, setTrendingScams] = useState<TrendingScam[]>([]);
  const [threatStats, setThreatStats] = useState<ThreatIntelligenceStats | null>(null);
  const [dangerousDomains, setDangerousDomains] = useState<any[]>([]);
  const [dangerousNumbers, setDangerousNumbers] = useState<any[]>([]);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [activeTab]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      if (activeTab === "intelligence") {
        setIntelligenceLoading(true);
        const [trending, stats, domains, numbers] = await Promise.all([
          getTrendingScamsByType(),
          getThreatIntelligenceStats(),
          getDangerousDomains(5),
          getDangerousNumbers(5),
        ]);
        setTrendingScams(trending);
        setThreatStats(stats);
        setDangerousDomains(domains);
        setDangerousNumbers(numbers);
        setIntelligenceLoading(false);
      } else {
        const items = activeTab === "trending" 
          ? await getTrendingScams()
          : await getCommunityFeed();
        setFeedItems(items);
      }
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const prepared = await readImageFile(file);
      setReportForm({ ...reportForm, image: file, imageUrl: prepared.base64 });
      setImagePreview(prepared.previewUrl);
    } catch (err) {
      console.error("Error loading image:", err);
      setSubmitError("Failed to load image. Please try again.");
    }
  };

  const handlePostReport = async () => {
    console.log("Post Report: Submit triggered");
    if (!userEmail) {
      console.log("Post Report: No user email");
      setPostReportError("Please log in to report posts.");
      return;
    }

    if (!selectedPostId) {
      console.log("Post Report: No post ID");
      setPostReportError("Invalid post ID.");
      return;
    }

    console.log("Post Report: Starting submission");
    setIsSubmittingPostReport(true);
    setPostReportError("");

    try {
      console.log("Post Report: Calling reportPost service");
      await reportPost(selectedPostId, userEmail, postReportReason, postReportDescription);

      console.log("Post Report: Submission successful");
      setPostReportSuccess(true);
      setShowPostReportModal(false);
      
      // Add to reported posts set
      setReportedPosts(prev => new Set(prev).add(selectedPostId));
      
      // Reset form
      setSelectedPostId(null);
      setPostReportReason("spam");
      setPostReportDescription("");

      // Hide success message after 3 seconds
      setTimeout(() => setPostReportSuccess(false), 3000);
    } catch (error) {
      console.error("Post Report: Error submitting report:", error);
      
      let errorMessage = "Unable to submit report. Please try again later.";
      
      if (error instanceof Error) {
        if (error.message.includes("already reported")) {
          errorMessage = "You have already reported this post.";
        } else if (error.message.includes("permission-denied") || error.message.includes("PERMISSION_DENIED")) {
          errorMessage = "Permission denied. You may not have permission to submit reports.";
        } else if (error.message.includes("network") || error.message.includes("NETWORK")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        }
      }
      
      setPostReportError(errorMessage);
    } finally {
      setIsSubmittingPostReport(false);
    }
  };

  const handleSubmitReport = async () => {
    console.log("Report Scam: Submit triggered");
    if (!userEmail) {
      console.log("Report Scam: No user email");
      setSubmitError("Please log in to report scams.");
      return;
    }

    if (!reportForm.description.trim()) {
      console.log("Report Scam: No description provided");
      setSubmitError("Please provide a description of the scam.");
      return;
    }

    console.log("Report Scam: Starting submission");
    setIsSubmitting(true);
    setSubmitError("");

    try {
      console.log("Report Scam: Calling reportScam service");
      await reportScam(userEmail, {
        scamType: reportForm.scamType,
        content: reportForm.description,
        phone: reportForm.phoneNumber || undefined,
        url: reportForm.suspiciousUrl || undefined,
        imageUrl: reportForm.imageUrl || undefined,
        riskLevel: "Suspicious",
        description: reportForm.description,
      });

      console.log("Report Scam: Submission successful");
      setSubmitSuccess(true);
      setShowReportModal(false);
      
      // Reset form
      setReportForm({
        scamType: "other",
        description: "",
        phoneNumber: "",
        suspiciousUrl: "",
        image: null,
        imageUrl: "",
      });
      setImagePreview("");

      // Reload feed to show new report (single call)
      console.log("Report Scam: Reloading feed");
      await loadFeed();

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Report Scam: Error submitting report:", error);
      
      // Provide specific error messages based on error type
      let errorMessage = "Failed to submit report. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("permission-denied") || error.message.includes("PERMISSION_DENIED")) {
          errorMessage = "Permission denied. You may not have permission to submit reports.";
        } else if (error.message.includes("network") || error.message.includes("NETWORK")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("unavailable") || error.message.includes("UNAVAILABLE")) {
          errorMessage = "Service temporarily unavailable. Please try again later.";
        } else if (error.message.includes("auth") || error.message.includes("AUTH")) {
          errorMessage = "Authentication error. Please log in and try again.";
        }
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "danger":
        return "text-red-400 border-red-500/30 bg-red-950/20";
      case "warning":
        return "text-amber-400 border-amber-500/30 bg-amber-950/20";
      default:
        return "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "danger":
        return "HIGH RISK";
      case "warning":
        return "SUSPICIOUS";
      default:
        return "INFO";
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-[#05070A]">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-[#05070A] border-b border-slate-900/40 flex items-center justify-between z-40 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={onGoBack}
            className="p-2.5 bg-slate-900/50 border border-slate-805 text-slate-350 hover:text-white rounded-2xl cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <Users className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              COMMUNITY SCAM FEED
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 py-3 border-b border-slate-900/40 flex gap-2">
        <button
          onClick={() => setActiveTab("latest")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-mono font-bold transition-colors ${
            activeTab === "latest"
              ? "bg-blue-600 text-white"
              : "bg-slate-900/50 text-slate-400 hover:text-slate-300"
          }`}
        >
          Latest
        </button>
        <button
          onClick={() => setActiveTab("trending")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-mono font-bold transition-colors ${
            activeTab === "trending"
              ? "bg-blue-600 text-white"
              : "bg-slate-900/50 text-slate-400 hover:text-slate-300"
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => setActiveTab("intelligence")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-mono font-bold transition-colors ${
            activeTab === "intelligence"
              ? "bg-blue-600 text-white"
              : "bg-slate-900/50 text-slate-400 hover:text-slate-300"
          }`}
        >
          Intelligence
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
        {activeTab === "intelligence" ? (
          intelligenceLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-slate-500 mx-auto mb-3 animate-spin" />
              <p className="text-xs text-slate-500">Loading threat intelligence...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Threat Intelligence Dashboard */}
              {threatStats && (
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Threat Intelligence Dashboard
                    </h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                      <p className="text-[10px] text-slate-500 font-mono uppercase">Total Reports</p>
                      <p className="text-lg font-bold text-white">{threatStats.totalReports}</p>
                    </div>
                    <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                      <p className="text-[10px] text-slate-500 font-mono uppercase">Today's Reports</p>
                      <p className="text-lg font-bold text-emerald-400">{threatStats.todayReports}</p>
                    </div>
                    <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                      <p className="text-[10px] text-slate-500 font-mono uppercase">This Week</p>
                      <p className="text-lg font-bold text-blue-400">{threatStats.weekReports}</p>
                    </div>
                    <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                      <p className="text-[10px] text-slate-500 font-mono uppercase">Most Common</p>
                      <p className="text-sm font-bold text-amber-400 line-clamp-1">{threatStats.mostCommonScam}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trending Scams */}
              {trendingScams.length > 0 && (
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Trending Scams
                    </h5>
                  </div>
                  <div className="space-y-2">
                    {trendingScams.map((scam, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-200">{scam.scamType}</p>
                          <p className="text-[10px] text-slate-500">{scam.reportCount} reports</p>
                        </div>
                        <div className="flex items-center gap-1 text-orange-400">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-[10px] font-mono">{scam.reportCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dangerous Domains */}
              {dangerousDomains.length > 0 && (
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-red-400" />
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Dangerous Domains
                    </h5>
                  </div>
                  <div className="space-y-2">
                    {dangerousDomains.map((domain, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-950/50 border border-red-900/30 rounded-xl"
                      >
                        <p className="text-xs font-bold text-red-400">{domain.domain}</p>
                        <p className="text-[10px] text-slate-500">{domain.reportCount} reports • {domain.riskLevel}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dangerous Numbers */}
              {dangerousNumbers.length > 0 && (
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-5 h-5 text-purple-400" />
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Dangerous Numbers
                    </h5>
                  </div>
                  <div className="space-y-2">
                    {dangerousNumbers.map((number, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-950/50 border border-purple-900/30 rounded-xl"
                      >
                        <p className="text-xs font-bold text-purple-400">{number.phoneNumber}</p>
                        <p className="text-[10px] text-slate-500">{number.reportCount} reports • {number.riskLevel}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ) : loading ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500">Loading community reports...</p>
          </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-8">
            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-500">No community reports yet.</p>
            <p className="text-[10px] text-slate-600 mt-1">Be the first to report a scam!</p>
          </div>
        ) : (
          feedItems.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${getSeverityColor(item.severity)}`}>
                      {getSeverityBadge(item.severity)}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">
                      {item.scamType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2">
                    {item.description}
                  </p>
                </div>
                {activeTab === "trending" && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-mono">{item.reportCount}</span>
                  </div>
                )}
              </div>

              {/* Content Preview */}
              <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <p className="text-[10px] text-slate-400 line-clamp-3">{item.content}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span className="text-[9px] font-mono">{item.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.verified && (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <ShieldAlert className="w-3 h-3" />
                      <span className="text-[9px] font-mono">VERIFIED</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedPostId(item.id);
                      setShowPostReportModal(true);
                      setPostReportError("");
                    }}
                    disabled={reportedPosts.has(item.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      reportedPosts.has(item.id)
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                        : "bg-slate-900/50 text-slate-400 hover:text-red-400 hover:bg-red-950/20"
                    }`}
                    title="Report content for review"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Button */}
      <div className="px-5 py-4 border-t border-slate-900/65 bg-[#05070A] relative">
        {/* Toast Notification */}
        {postReportSuccess && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-mono font-bold shadow-lg animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Report submitted successfully</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowReportModal(true)}
          className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          REPORT A SCAM
        </button>
      </div>

      {/* Post Report Modal */}
      {showPostReportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-5 animate-in fade-in duration-200">
          <div className="bg-[#05070A] border border-slate-800 rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white">Report Post</h3>
              </div>
              <button
                onClick={() => {
                  setShowPostReportModal(false);
                  setPostReportError("");
                  setSelectedPostId(null);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              {/* Success Message */}
              {postReportSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs text-emerald-300">Report submitted successfully!</span>
                </div>
              )}

              {/* Error Message */}
              {postReportError && (
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-xs text-red-300">{postReportError}</span>
                </div>
              )}

              {/* Report Reason */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase">
                  Reason for Report
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "spam", label: "Spam" },
                    { value: "misinformation", label: "Misinformation" },
                    { value: "offensive", label: "Offensive Content" },
                    { value: "other", label: "Other" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPostReportReason(option.value as any)}
                      className={`p-3 rounded-xl text-xs font-medium transition-colors ${
                        postReportReason === option.value
                          ? "bg-red-600 text-white border border-red-500"
                          : "bg-slate-900/50 text-slate-300 border border-slate-800 hover:border-red-500/50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={postReportDescription}
                  onChange={(e) => setPostReportDescription(e.target.value)}
                  placeholder="Provide more context about why you're reporting this post..."
                  className="w-full p-3 bg-slate-900/50 border border-slate-800 focus:border-red-500 rounded-xl outline-none text-xs text-slate-200 resize-none h-20 placeholder:text-slate-700"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePostReport}
                disabled={isSubmittingPostReport}
                className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingPostReport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    SUBMITTING...
                  </>
                ) : (
                  "SUBMIT REPORT"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-5">
          <div className="bg-[#05070A] border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Report a Scam</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSubmitError("");
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              {/* Success Message */}
              {submitSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs text-emerald-300">Report submitted successfully!</span>
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-xs text-red-300">{submitError}</span>
                </div>
              )}

              {/* Scam Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase">
                  Scam Type
                </label>
                <select
                  value={reportForm.scamType}
                  onChange={(e) => setReportForm({ ...reportForm, scamType: e.target.value as any })}
                  className="w-full p-3 bg-slate-900/50 border border-slate-800 focus:border-orange-500 rounded-xl outline-none text-xs text-slate-200"
                >
                  <option value="sms">SMS Scam</option>
                  <option value="upi">UPI/Payment Fraud</option>
                  <option value="kyc">Fake KYC Request</option>
                  <option value="otp">OTP Theft</option>
                  <option value="phishing">Phishing Link</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase">
                  Description *
                </label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Describe the scam in detail..."
                  className="w-full p-3 bg-slate-900/50 border border-slate-800 focus:border-orange-500 rounded-xl outline-none text-xs text-slate-200 resize-none h-24 placeholder:text-slate-700"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={reportForm.phoneNumber}
                  onChange={(e) => setReportForm({ ...reportForm, phoneNumber: e.target.value })}
                  placeholder="Suspicious phone number"
                  className="w-full p-3 bg-slate-900/50 border border-slate-800 focus:border-orange-500 rounded-xl outline-none text-xs text-slate-200 placeholder:text-slate-700"
                />
              </div>

              {/* Suspicious URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase">
                  Suspicious URL (Optional)
                </label>
                <input
                  type="text"
                  value={reportForm.suspiciousUrl}
                  onChange={(e) => setReportForm({ ...reportForm, suspiciousUrl: e.target.value })}
                  placeholder="Suspicious link or website"
                  className="w-full p-3 bg-slate-900/50 border border-slate-800 focus:border-orange-500 rounded-xl outline-none text-xs text-slate-200 placeholder:text-slate-700"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase">
                  Screenshot (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="report-image-input"
                />
                {!imagePreview ? (
                  <label
                    htmlFor="report-image-input"
                    className="block w-full p-8 border-2 border-dashed border-slate-800 hover:border-orange-500/40 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer bg-slate-900/10 hover:bg-slate-950/30"
                  >
                    <Upload className="w-8 h-8 text-slate-500" />
                    <span className="text-xs text-slate-300">Click to upload screenshot</span>
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-xl border border-slate-800"
                    />
                    <button
                      onClick={() => {
                        setReportForm({ ...reportForm, image: null, imageUrl: "" });
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 rounded-full text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    SUBMITTING...
                  </>
                ) : (
                  "SUBMIT REPORT"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
