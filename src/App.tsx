import { useState, useEffect, useRef, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ScreenState, HistoryItem } from "./types";
import { AnalysisInput, AnalysisReport } from "./services/analysisTypes";
import { analyzeContent } from "./services/geminiAnalyzer";
import {
  deleteAllScansForUser,
  fetchScanById,
  fetchScansForUser,
  saveScan,
  ScanListItem,
} from "./services/scanFirestore";
import { auth } from "./firebase";
import { detectLanguage } from "./services/multilingual/languageDetector";
import { extractUrls } from "./services/urls/heuristicUrlAnalyzer";
import { scoreThreats } from "./services/analysis/riskScoringEngine";
import { generateExplanations } from "./services/analysis/explanationEngine";
import { generateRecommendations } from "./services/analysis/recommendationEngine";

import AndroidFrame from "./components/AndroidFrame";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import HomeDashboard from "./components/HomeDashboard";
import AnalysisLoadingScreen from "./components/AnalysisLoadingScreen";
import ResultScreen from "./components/ResultScreen";
import ThreatExplanation from "./components/ThreatExplanation";
import HistoryScreen from "./components/HistoryScreen";
import ChatAssistantScreen from "./components/ChatAssistantScreen";
import QRScannerScreen from "./components/QRScannerScreen";
import DeepfakeDetectorScreen from "./components/DeepfakeDetectorScreen";
import CommunityFeedScreen from "./components/CommunityFeedScreen";
import ElderModeScreen from "./components/ElderModeScreen";
import { History, MessageSquare } from "lucide-react";

const MIN_LOADING_MS = 1800;

function scanItemsToHistory(items: ScanListItem[]): HistoryItem[] {
  return items.map((item) => ({
    id: item.id,
    previewText: item.previewText,
    riskScore: item.riskScore,
    riskLevel: item.riskLevel,
    timestamp: item.timestamp,
    reportId: item.id,
  }));
}

export default function App() {
  const [screen, setScreen] = useState<ScreenState>("SPLASH");
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [reports, setReports] = useState<Record<string, AnalysisReport>>({});
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [resultReturnScreen, setResultReturnScreen] = useState<"HOME" | "HISTORY">("HOME");
  const [pendingInput, setPendingInput] = useState<AnalysisInput | null>(null);
  const [isImageAnalysis, setIsImageAnalysis] = useState(false);
  const [isPhoneMockup, setIsPhoneMockup] = useState(true);

  const [analysingFileLabel, setAnalysingFileLabel] = useState("");
  const [analysingType, setAnalysingType] = useState<AnalysisInput["type"]>("text");

  const analysisRunId = useRef(0);
  const [splashDone, setSplashDone] = useState(false);

  const loadUserScans = useCallback(async (email: string) => {
    if (!email.trim()) {
      setHistory([]);
      setReports({});
      setHistoryError(null);
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const { items, reports: loadedReports } = await fetchScansForUser(email);
      setHistory(scanItemsToHistory(items));
      setReports(loadedReports);
      setHistoryError(null);
    } catch (error) {
      console.error("[App] Failed to load scan history:", error);
      setHistory([]);
      setReports({});
      setHistoryError("Could not load your scan history. Check your connection and try again.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setIsLoggedIn(true);
        setUserEmail(user.email);
        const namePart = user.email.split("@")[0] || "User";
        const beautifiedName = namePart
          .split(".")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
        setUserName(beautifiedName);
        loadUserScans(user.email);
      } else {
        setIsLoggedIn(false);
        setUserEmail("");
        setUserName("");
        setHistory([]);
        setReports({});
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [loadUserScans]);

  useEffect(() => {
    if (screen === "HISTORY" && isLoggedIn && userEmail) {
      loadUserScans(userEmail);
    }
  }, [screen, isLoggedIn, userEmail, loadUserScans]);

  useEffect(() => {
    if (screen !== "LOADING" || !pendingInput || !userEmail) return;

    const runId = ++analysisRunId.current;
    let cancelled = false;

    const run = async () => {
      const [output] = await Promise.all([
        analyzeContent(pendingInput),
        new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS)),
      ]);

      if (cancelled || runId !== analysisRunId.current) return;

      const finalInput: AnalysisInput = {
        ...pendingInput,
        ...output.enrichedInput,
      };

      const report: AnalysisReport = {
        id: `pending_${Date.now()}`,
        input: finalInput,
        analysis: output.analysis,
        createdAt: new Date().toLocaleString(),
      };

      // Calculate additional fields for Firebase storage
      const scoreBreakdown = scoreThreats(finalInput.content);
      const language = detectLanguage(finalInput.content);
      const detectedUrls = extractUrls(finalInput.content);
      const explanations = generateExplanations(scoreBreakdown.findings);
      const recommendations = generateRecommendations(scoreBreakdown.findings);

      try {
        const scanId = await saveScan(
          userEmail,
          report,
          scoreBreakdown.confidence,
          language,
          detectedUrls,
          explanations.map(e => `${e.title}: ${e.detail}`),
          recommendations.map(r => r.detail)
        );
        const savedReport: AnalysisReport = { ...report, id: scanId };

        setReports((prev) => ({ ...prev, [scanId]: savedReport }));
        setCurrentReport(savedReport);
        setResultReturnScreen("HOME");

        const listItem: HistoryItem = {
          id: scanId,
          reportId: scanId,
          previewText: (finalInput.content || finalInput.title).trim().slice(0, 90) +
            ((finalInput.content || finalInput.title).length > 90 ? "…" : ""),
          riskScore: output.analysis.score,
          riskLevel: output.analysis.riskLevel,
          timestamp: savedReport.createdAt,
        };

        setHistory((prev) => [listItem, ...prev.filter((h) => h.id !== scanId)]);
      } catch (error) {
        console.error("Failed to save scan:", error);
        setReports((prev) => ({ ...prev, [report.id]: report }));
        setCurrentReport(report);
        setHistoryError("Analysis completed but could not save to cloud history.");
      }

      setPendingInput(null);
      setScreen("RESULT");
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [screen, pendingInput, userEmail]);

  const handleSplashComplete = () => {
    setSplashDone(true);
  };

  useEffect(() => {
    if (!splashDone || !authReady) return;
    setScreen(isLoggedIn ? "HOME" : "LOGIN");
  }, [splashDone, authReady, isLoggedIn]);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    const namePart = email.split("@")[0] || "User";
    const beautifiedName = namePart
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    setUserName(beautifiedName);
    setScreen("HOME");
    loadUserScans(email);
  };

  const handleRegisterSuccess = (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name);
    setScreen("HOME");
    loadUserScans(email);
  };

  const handleStartAnalysis = (input: AnalysisInput) => {
    if (!isLoggedIn || !userEmail) {
      setScreen("LOGIN");
      return;
    }
    setAnalysingType(input.type);
    setAnalysingFileLabel(input.fileName || input.title);
    setIsImageAnalysis(Boolean(input.image?.base64 && input.type === "screenshot"));
    setPendingInput(input);
    setScreen("LOADING");
  };

  const handleSelectHistoryItem = async (reportId: string) => {
    let report = reports[reportId];

    if (!report && userEmail) {
      try {
        report = (await fetchScanById(reportId)) ?? undefined;
        if (report) {
          setReports((prev) => ({ ...prev, [reportId]: report! }));
        }
      } catch (error) {
        console.error("Failed to load scan:", error);
        setHistoryError("Could not open this scan. Please try again.");
        return;
      }
    }

    if (report) {
      setCurrentReport(report);
      setResultReturnScreen("HISTORY");
      setScreen("RESULT");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setHistory([]);
    setReports({});
    setCurrentReport(null);
    setScreen("LOGIN");
  };

  const handleClearHistory = async () => {
    if (!userEmail) return;
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      await deleteAllScansForUser(userEmail);
      setHistory([]);
      setReports({});
      setCurrentReport(null);
    } catch (error) {
      console.error("Failed to clear history:", error);
      setHistoryError("Could not delete scan history. Please try again.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleResetApp = async () => {
    try {
      await signOut(auth);
    } catch {
      /* ignore */
    }
    setHistory([]);
    setReports({});
    setCurrentReport(null);
    setPendingInput(null);
    setUserEmail("");
    setUserName("");
    setScreen("SPLASH");
  };

  const handleResultBack = () => {
    setScreen(resultReturnScreen);
  };

  const renderScreenContent = () => {
    switch (screen) {
      case "SPLASH":
        return <SplashScreen onComplete={handleSplashComplete} />;

      case "LOGIN":
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setScreen("REGISTER")}
          />
        );

      case "REGISTER":
        return (
          <RegisterScreen
            onRegisterSuccess={handleRegisterSuccess}
            onGoToLogin={() => setScreen("LOGIN")}
          />
        );

      case "HOME":
        return (
          <div className="flex-grow flex flex-col h-full">
            <HomeDashboard
              userName={userName}
              history={history}
              historyLoading={historyLoading}
              onStartAnalysis={handleStartAnalysis}
              onNavigateToScreen={(scr) => setScreen(scr as any)}
              onSelectHistoryItem={handleSelectHistoryItem}
              onLogout={handleLogout}
            />
          </div>
        );

      case "LOADING":
        return (
          <AnalysisLoadingScreen
            mediaType={analysingType}
            fileName={analysingFileLabel}
            isImageAnalysis={isImageAnalysis}
          />
        );

      case "RESULT":
        return currentReport ? (
          <ResultScreen report={currentReport} onGoBack={handleResultBack} />
        ) : (
          <div className="text-white p-6 text-sm">No report available.</div>
        );

      case "THREAT_EXPLANATIONS":
        return (
          <div className="flex-grow flex flex-col h-full">
            <ThreatExplanation />
          </div>
        );

      case "CHAT_ASSISTANT":
        return (
          <div className="flex-grow flex flex-col h-full">
            <ChatAssistantScreen onGoBack={() => setScreen("HOME")} />
          </div>
        );

      case "QR_SCANNER":
        return (
          <div className="flex-grow flex flex-col h-full">
            <QRScannerScreen onGoBack={() => setScreen("HOME")} />
          </div>
        );

      case "DEEPFAKE_DETECTOR":
        return (
          <div className="flex-grow flex flex-col h-full">
            <DeepfakeDetectorScreen onGoBack={() => setScreen("HOME")} />
          </div>
        );

      case "COMMUNITY_FEED":
        return (
          <div className="flex-grow flex flex-col h-full">
            <CommunityFeedScreen onGoBack={() => setScreen("HOME")} userEmail={userEmail} />
          </div>
        );

      case "ELDER_MODE":
        return (
          <div className="flex-grow flex flex-col h-full">
            <ElderModeScreen onGoBack={() => setScreen("HOME")} />
          </div>
        );

      case "HISTORY":
        return (
          <div className="flex-grow flex flex-col h-full">
            <HistoryScreen
              historyItems={history}
              loading={historyLoading}
              error={historyError}
              onSelectHistoryItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
              onRetry={() => userEmail && loadUserScans(userEmail)}
            />
          </div>
        );

      default:
        return <div className="text-white p-6">Invalid Screen State</div>;
    }
  };

  const handleHomeClick = () => {
    if (
      isLoggedIn &&
      screen !== "SPLASH" &&
      screen !== "LOGIN" &&
      screen !== "REGISTER" &&
      screen !== "LOADING"
    ) {
      setScreen("HOME");
    }
  };

  return (
    <AndroidFrame
      currentScreen={screen}
      onHomeClick={handleHomeClick}
      onNavigateToScreen={(scr) => setScreen(scr)}
      isPhoneMockup={isPhoneMockup}
      setIsPhoneMockup={setIsPhoneMockup}
      onResetApp={handleResetApp}
    >
      {renderScreenContent()}
    </AndroidFrame>
  );
}
