import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Bot, User, ShieldAlert, Brain, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { scoreThreats } from "../services/analysis/riskScoringEngine";
import { generateExplanations } from "../services/analysis/explanationEngine";
import { generateRecommendations } from "../services/analysis/recommendationEngine";
import { detectLanguage } from "../services/multilingual/languageDetector";
import { analyzeLink, formatLinkAnalysis } from "../services/linkAnalysis/linkAnalyzer";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatAssistantScreenProps {
  onGoBack: () => void;
}

export default function ChatAssistantScreen({ onGoBack }: ChatAssistantScreenProps) {
  const [hasGreeted, setHasGreeted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [analystMode, setAnalystMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Preloaded demo cases
  const demoCases = [
    {
      id: "fake-news",
      label: "Fake News Detection",
      input: "Is this news real? 'Breaking: Scientists discover that drinking coffee cures all diseases instantly'",
    },
    {
      id: "link-analysis",
      label: "Link Trust Analysis",
      input: "Can I trust this link? https://example-bank-verify-login.com",
    },
    {
      id: "conflict",
      label: "Conflicting Evidence",
      input: "Some sources say this is safe, others say it's dangerous. What should I do?",
    },
  ];

  // Show Ai-Shafi greeting on chat screen open
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hi, I'm Ai-Shafi 👋 What can I help you with today?",
        timestamp: new Date().toLocaleString(),
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Intent detection
  type IntentType = "general" | "knowledge" | "productivity" | "truthlens";

  const detectIntent = (query: string): IntentType => {
    const lowerQuery = query.toLowerCase();

    // TruthLens analysis triggers
    const truthlensKeywords = [
      "fact check", "fact-check", "verify", "scam", "fraud", "fake", "suspicious",
      "trust", "safe", "link analysis", "deepfake", "misinformation", "phishing",
      "otp", "verification code", "kyc", "payment", "upi", "transfer", "money"
    ];

    // Check for explicit TruthLens requests
    if (truthlensKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return "truthlens";
    }

    // Check for URLs (link analysis)
    if (/(https?:\/\/[^\s]+)/gi.test(query)) {
      return "truthlens";
    }

    // General conversation patterns
    const greetingPatterns = ["hi", "hello", "hey", "how are you", "how's it going", "good morning", "good evening", "good afternoon"];
    if (greetingPatterns.some(pattern => lowerQuery.includes(pattern))) {
      return "general";
    }

    // Knowledge question patterns
    const knowledgePatterns = ["what is", "explain", "how does", "tell me about", "define", "why is", "who is", "when did"];
    if (knowledgePatterns.some(pattern => lowerQuery.includes(pattern))) {
      return "knowledge";
    }

    // Productivity/help patterns
    const productivityPatterns = ["help me", "can you help", "i need", "how to", "assist", "brainstorm", "idea"];
    if (productivityPatterns.some(pattern => lowerQuery.includes(pattern))) {
      return "productivity";
    }

    // Joke request
    if (lowerQuery.includes("joke") || lowerQuery.includes("funny")) {
      return "general";
    }

    // Default to general conversation
    return "general";
  };

  // General conversation responses
  const generateGeneralResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Greetings
    if (lowerQuery.includes("hi") || lowerQuery.includes("hello") || lowerQuery.includes("hey")) {
      const greetings = [
        "Hi there! 😊 How can I help you today?",
        "Hello! I'm doing well, thanks for asking! How are you?",
        "Hey! Great to hear from you. What's on your mind?",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (lowerQuery.includes("how are you")) {
      return "I'm doing well, thanks for asking! 😊 I'm ready to help you with whatever you need - whether it's answering questions, brainstorming ideas, or analyzing suspicious content. How can I assist you today?";
    }

    // Jokes
    if (lowerQuery.includes("joke") || lowerQuery.includes("funny")) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        "Why did the developer go broke? Because he used up all his cache! 💰",
        "What's a computer's favorite snack? Microchips! 🍟",
        "Why do Java developers wear glasses? Because they don't C#! 👓",
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // General conversational responses
    const generalResponses = [
      "That's interesting! I'd love to hear more about that. What else would you like to discuss?",
      "I see! Is there anything specific I can help you with today?",
      "Got it! Feel free to ask me anything - whether it's about technology, general knowledge, or if you need help analyzing something suspicious.",
      "Thanks for sharing! I'm here to help with a wide range of topics. What would you like to explore?",
    ];
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  // Knowledge question responses
  const generateKnowledgeResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("machine learning")) {
      return "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It works by:\n\n• **Training data** - Feeding algorithms large amounts of data\n• **Pattern recognition** - Identifying patterns in the data\n• **Prediction** - Making predictions or decisions based on learned patterns\n\nCommon applications include image recognition, language translation, and recommendation systems. Would you like me to explain any specific aspect in more detail?";
    }

    if (lowerQuery.includes("artificial intelligence") || lowerQuery.includes("ai")) {
      return "Artificial Intelligence (AI) refers to computer systems designed to perform tasks that typically require human intelligence, such as:\n\n• **Problem-solving** - Finding solutions to complex problems\n• **Learning** - Improving performance over time\n• **Perception** - Understanding visual and auditory information\n• **Language** - Understanding and generating human language\n\nAI is used in everything from virtual assistants to medical diagnosis. What aspect of AI interests you most?";
    }

    if (lowerQuery.includes("blockchain")) {
      return "Blockchain is a distributed ledger technology that records transactions across many computers. Key features include:\n\n• **Decentralization** - No single point of control\n• **Immutability** - Records cannot be altered\n• **Transparency** - All transactions are visible\n• **Security** - Cryptographic protection\n\nIt's the technology behind cryptocurrencies like Bitcoin, but has many other potential uses. Want to know more about any specific application?";
    }

    if (lowerQuery.includes("cybersecurity")) {
      return "Cybersecurity involves protecting computer systems, networks, and data from digital attacks. Key areas include:\n\n• **Network security** - Protecting network infrastructure\n• **Application security** - Securing software and apps\n• **Data protection** - Encrypting sensitive information\n• **User education** - Training people on safe practices\n\nIt's an increasingly important field as our digital world grows. Is there a specific security topic you'd like to explore?";
    }

    // General knowledge response
    return "That's a great question! While I have knowledge on many topics, I'm particularly strong in areas like technology, science, and general knowledge. Could you tell me a bit more about what specific aspect you're interested in? I'd be happy to provide a detailed explanation.";
  };

  // Productivity/help responses
  const generateProductivityResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("brainstorm") || lowerQuery.includes("idea")) {
      return "I'd be happy to help brainstorm! Here are some techniques we can use:\n\n• **Mind mapping** - Start with a central idea and branch out\n• **SCAMPER** - Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse\n• **Random word** - Pick a random word and connect it to your problem\n• **What if** - Ask \"what if\" questions to explore possibilities\n\nWhat topic or problem would you like to brainstorm about?";
    }

    if (lowerQuery.includes("how to")) {
      return "I can help with that! To give you the best guidance, could you tell me:\n\n• What specific task are you trying to accomplish?\n• What have you tried so far?\n• What's your current skill level with this?\n\nWith more details, I can provide step-by-step guidance tailored to your situation.";
    }

    // General productivity response
    return "I'm here to help! Whether you need assistance with:\n\n• **Planning** - Organizing tasks and projects\n• **Problem-solving** - Working through challenges\n• **Learning** - Understanding new concepts\n• **Decision-making** - Weighing options\n\nJust let me know what you're working on, and I'll do my best to assist!";
  };

  const generateSafetyResponse = (userQuery: string): string => {
    const lowerQuery = userQuery.toLowerCase();
    const intent = detectIntent(userQuery);

    // Route to appropriate response based on intent
    switch (intent) {
      case "general":
        return generateGeneralResponse(userQuery);
      case "knowledge":
        return generateKnowledgeResponse(userQuery);
      case "productivity":
        return generateProductivityResponse(userQuery);
      case "truthlens":
        return generateTruthLensResponse(userQuery);
      default:
        return generateGeneralResponse(userQuery);
    }
  };

  const generateTruthLensResponse = (userQuery: string): string => {
    const lowerQuery = userQuery.toLowerCase();
    const scoreBreakdown = scoreThreats(userQuery);
    const explanations = generateExplanations(scoreBreakdown.findings);
    const recommendations = generateRecommendations(scoreBreakdown.findings);
    const language = detectLanguage(userQuery);

    // Check for URLs in the query
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = userQuery.match(urlRegex);
    
    if (urls && urls.length > 0) {
      const analysis = analyzeLink(urls[0]);
      const formattedAnalysis = formatLinkAnalysis(analysis);
      
      if (analystMode) {
        return `**Direct Answer:**\n\n${formattedAnalysis}\n\n---\n\n**Technical Explanation:**\n\nI analyzed the domain structure and compared it against known trusted domains and suspicious patterns. The trust assessment is based on domain reputation, TLD patterns, and structural characteristics.\n\n**Trust Analysis:**\n• Domain: ${analysis.domainClassification.toUpperCase()}\n• Trust Assessment: ${analysis.trustAssessment}\n• Risk Indicators: ${analysis.riskIndicators.length > 0 ? analysis.riskIndicators.length + ' detected' : 'None detected'}\n\n**Suggested Next Step:**\n${analysis.domainClassification === 'trusted' ? 'You can likely proceed, but always verify the specific page content before sharing sensitive information.' : analysis.domainClassification === 'suspicious' ? 'I recommend avoiding this link and verifying through official channels.' : 'Approach with caution and verify the source before sharing sensitive information.'}`;
      }
      
      return formattedAnalysis;
    }

    // OTP-related queries
    if (lowerQuery.includes("otp") || lowerQuery.includes("verification code") || lowerQuery.includes("pin")) {
      if (analystMode) {
        return `**Direct Answer:**\n\nI can help with OTP safety. Legitimate organizations (banks, payment apps, government) typically don't ask for OTPs via phone, SMS, or email.\n\n---\n\n**Technical Explanation:**\n\nOTP (One-Time Password) is a security mechanism designed for single-use authentication. When someone contacts you asking for an OTP, this is a common technique used in unauthorized access attempts.\n\n**What it is:** A temporary code sent to verify identity\n**Why it matters:** OTPs protect accounts from unauthorized access\n**Risk factor:** Sharing OTPs with anyone who contacts you bypasses this protection\n\n**Suggested Next Step:**\n• If you're unsure, contact the organization directly using official channels\n• If you already shared an OTP, contact your bank immediately`;
      }
      
      return "I can help with OTP safety. Legitimate organizations (banks, payment apps, government) typically don't ask for OTPs via phone, SMS, or email.\n\n**Best practice:**\n• Don't share OTPs with anyone who contacts you\n• If you're unsure, contact the organization directly using official channels\n• If you already shared an OTP, contact your bank immediately\n\nThis is a common technique used in unauthorized access attempts.";
    }

    // Payment/UPI-related queries
    if (lowerQuery.includes("payment") || lowerQuery.includes("upi") || lowerQuery.includes("money") || lowerQuery.includes("transfer")) {
      if (analystMode) {
        return `**Direct Answer:**\n\nPayment-related requests require careful verification. Scammers sometimes create urgency using fake bank alerts or UPI requests.\n\n---\n\n**Technical Explanation:**\n\nPayment fraud often involves social engineering tactics to create urgency and bypass rational decision-making.\n\n**What it is:** Requests for money or payment verification\n**Why it matters:** Legitimate organizations don't create urgency for payments\n**Risk factor:** Urgency is a strong indicator of potential fraud\n\n**Suggested Next Step:**\n• Verify with the person directly through another channel\n• Use official banking apps\n• Check UPI handles carefully before approving`;
      }
      
      return "Payment-related requests require careful verification. Scammers sometimes create urgency using fake bank alerts or UPI requests.\n\n**Things to check:**\n• Is the request from someone you know?\n• Does the UPI handle match the expected recipient?\n• Is there unusual urgency?\n\n**Safe approach:**\n• Verify with the person directly through another channel\n• Use official banking apps\n• Check UPI handles carefully before approving\n\nIf something feels off, it's worth verifying before proceeding.";
    }

    // KYC-related queries
    if (lowerQuery.includes("kyc") || lowerQuery.includes("verify") || lowerQuery.includes("update account") || lowerQuery.includes("document")) {
      if (analystMode) {
        return `**Direct Answer:**\n\nKYC (Know Your Customer) updates are important, but requests via messages should be verified carefully.\n\n---\n\n**Technical Explanation:**\n\nKYC is a regulatory requirement for financial institutions to verify customer identity. Scammers exploit this by sending fake KYC requests to steal personal documents.\n\n**What it is:** Process to verify customer identity\n**Why it matters:** Protects against money laundering and fraud\n**Risk factor:** Fake KYC requests can lead to identity theft\n\n**Suggested Next Step:**\n• Don't click links in messages\n• Use your bank's official app or website\n• Verify with the bank using their official contact number`;
      }
      
      return "KYC (Know Your Customer) updates are important, but requests via messages should be verified carefully.\n\n**Legitimate KYC:**\n• Usually done through official bank apps/websites\n• Banks typically don't request documents via SMS/WhatsApp\n• You can verify by calling official bank customer care\n\n**If you receive a KYC request:**\n• Don't click links in messages\n• Use your bank's official app or website\n• Verify with the bank using their official contact number\n\nThis helps protect your personal documents and account security.";
    }

    // Website safety queries
    if (lowerQuery.includes("website") || lowerQuery.includes("link") || lowerQuery.includes("url") || lowerQuery.includes("click")) {
      if (analystMode) {
        return `**Direct Answer:**\n\nI can help analyze websites and links. Here's what to consider:\n\n**General indicators:**\n• Check the full URL (not just the domain name)\n• Look for HTTPS (lock icon in browser)\n• Be cautious with shortened URLs (bit.ly, tinyurl)\n• Verify domain spelling\n\n---\n\n**Technical Explanation:**\n\nLink analysis involves examining domain structure, reputation data, and potential security indicators.\n\n**What it is:** Process of evaluating URL safety\n**Why it matters:** Malicious links can steal credentials or install malware\n**Risk factor:** Shortened URLs hide destination, typosquatting mimics legitimate sites\n\n**Suggested Next Step:**\n• Share the specific link with me for detailed analysis\n• I'll provide a Trust Assessment and risk analysis`;
      }
      
      return "I can help analyze websites and links. Here's what to consider:\n\n**General indicators:**\n• Check the full URL (not just the domain name)\n• Look for HTTPS (lock icon in browser)\n• Be cautious with shortened URLs (bit.ly, tinyurl)\n• Verify domain spelling\n\n**If you share a specific link, I can provide:**\n• Trust Assessment\n• Analysis of the domain\n• Any notable patterns\n\nThis helps you make informed decisions about clicking links.";
    }

    // General scam queries
    if (lowerQuery.includes("scam") || lowerQuery.includes("fraud") || lowerQuery.includes("fake") || lowerQuery.includes("suspicious")) {
      if (analystMode) {
        return `**Direct Answer:**\n\nI can help analyze suspicious messages or situations. Common patterns include:\n\n**To watch for:**\n• Urgency or pressure to act quickly\n• Requests for sensitive information\n• Unexpected money or prize claims\n• Requests for payment to receive something\n• Impersonation of organizations\n\n---\n\n**Technical Explanation:**\n\nScam detection involves pattern recognition of social engineering tactics used to manipulate victims.\n\n**What it is:** Analysis of message patterns for fraud indicators\n**Why it matters:** Early detection prevents financial and data loss\n**Risk factor:** Psychological manipulation bypasses rational thinking\n\n**Suggested Next Step:**\n• Share the message text with me\n• Describe the situation\n• I'll provide an analysis and guidance`;
      }
      
      return "I can help analyze suspicious messages or situations. Common patterns include:\n\n**To watch for:**\n• Urgency or pressure to act quickly\n• Requests for sensitive information\n• Unexpected money or prize claims\n• Requests for payment to receive something\n• Impersonation of organizations\n\n**How I can help:**\n• Share the message text with me\n• Describe the situation\n• I'll provide an analysis and guidance\n\nMy goal is to help you make informed decisions, not to alarm you unnecessarily.";
    }

    // Default response with analysis
    const riskScore = scoreBreakdown.score;
    const riskLevel = riskScore >= 60 ? "Higher risk" : riskScore >= 30 ? "Moderate concern" : "Lower risk";
    
    if (riskScore > 0) {
      if (analystMode) {
        return `**Direct Answer:**\n\nBased on my analysis, this content has a risk score of ${riskScore}/100, which I classify as ${riskLevel}.\n\n---\n\n**Technical Explanation:**\n\nI analyzed the message for known scam patterns, urgency indicators, and suspicious language.\n\n**What it is:** Pattern-based risk assessment\n**Why it matters:** Identifies potential fraud indicators\n**Risk factors detected:** ${explanations.length} indicator${explanations.length !== 1 ? 's' : ''}\n\n**Trust Analysis:**\n• Risk Score: ${riskScore}/100\n• Assessment: ${riskLevel}\n• Indicators Found: ${explanations.length}\n\n**Suggested Next Step:**\n${recommendations.map(r => `• ${r.detail}`).join('\n')}\n\nThis is an analysis to help you make informed decisions. If you're unsure, it's always best to verify through official channels.`;
      }
      
      return `Based on my analysis:\n\n**Risk Score:** ${riskScore}/100\n**Assessment:** ${riskLevel}\n\n${explanations.map(e => `• ${e.detail}`).join('\n')}\n\n**Suggestions:**\n${recommendations.map(r => `• ${r.detail}`).join('\n')}\n\nThis is an analysis to help you make informed decisions. If you're unsure, it's always best to verify through official channels.`;
    }

    return "I'm here to help with online safety questions. I can assist with:\n\n• **OTP/Verification codes** - Safety guidance\n• **Payment/UPI requests** - Verification tips\n• **KYC updates** - How to verify legitimacy\n• **Website/Link analysis** - Trust assessment\n• **General suspicious messages** - Pattern analysis\n\nFeel free to share a message or describe a situation, and I'll provide helpful analysis.";
  };

  const handleSendMessage = () => {
    console.log("AI Assistant: Send message triggered");
    if (!inputText.trim()) {
      console.log("AI Assistant: No input text");
      return;
    }

    console.log("AI Assistant: Processing message:", inputText.trim());
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date().toLocaleString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateSafetyResponse(userMessage.content),
        timestamp: new Date().toLocaleString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              AI-SHAFI
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              demoMode 
                ? "bg-purple-600/20 border-purple-500/50 text-purple-400" 
                : "bg-slate-900/50 border-slate-805 text-slate-400 hover:text-white"
            }`}
            title="Toggle Demo Mode"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAnalystMode(!analystMode)}
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              analystMode 
                ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-400" 
                : "bg-slate-900/50 border-slate-805 text-slate-400 hover:text-white"
            }`}
            title="Toggle Analyst Mode"
          >
            <Brain className="w-4 h-4" />
          </button>
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <ShieldAlert className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 px-5 py-4 overflow-y-auto space-y-4">
        {/* Demo Mode Panel */}
        {demoMode && (
          <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-400" />
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                Demo Mode - Preloaded Cases
              </h5>
            </div>
            <div className="space-y-2">
              {demoCases.map((demoCase) => (
                <button
                  key={demoCase.id}
                  onClick={() => {
                    setInputText(demoCase.input);
                    setDemoMode(false);
                  }}
                  className="w-full p-3 bg-slate-950/50 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition-colors"
                >
                  <p className="text-[10px] font-bold text-purple-300 mb-1">{demoCase.label}</p>
                  <p className="text-[9px] text-slate-400 line-clamp-2">{demoCase.input}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                message.role === "user"
                  ? "bg-blue-600/20 border border-blue-500/30"
                  : "bg-slate-900/50 border border-slate-800"
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                {message.role === "assistant" ? (
                  <Bot className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                ) : (
                  <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <span className="text-[9px] font-mono text-slate-500 uppercase">
                  {message.role === "assistant" ? "Ai-Shafi" : "You"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <p className="text-[8px] text-slate-600 font-mono mt-2">
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-[10px] text-slate-400">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-5 py-4 border-t border-slate-900/65 bg-[#05070A]">
        <div className="flex gap-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything - from general questions to scam analysis..."
            className="flex-1 p-3 bg-slate-900/50 border border-slate-800 focus:border-blue-500 rounded-2xl outline-none text-xs text-slate-200 resize-none h-20 placeholder:text-slate-700"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-colors cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[9px] text-slate-600 font-mono mt-2">
          Ai-Shafi • TruthLens V2.0 AI • Offline-capable • Privacy-focused
        </p>
      </div>
    </div>
  );
}
