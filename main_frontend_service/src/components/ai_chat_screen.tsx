"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import clsx from 'clsx';
import { Button } from "@/components/ui/button";
import { ArrowUp, CornerDownRight, Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";


import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import "katex/dist/katex.min.css";
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, Maximize2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";
type Props = {
  unique_id: string;
  content: string;
  resume_context: string;
};
interface Message {
  type: "ai" | "user";
  content: string;
}
interface MarkdownStreamerProps {
  content: string;
}
interface CodeBlockProps {
  children: string;
  className?: string;
}

function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const language = className?.replace('language-', '') || 'plaintext';

  return (
    <div className="group relative my-4">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="rounded-md bg-slate-800/90 dark:bg-slate-700/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-slate-300 border border-slate-700/50">
          {language}
        </span>
        <button 
          className="rounded-md p-1.5 bg-slate-800/90 dark:bg-slate-700/90 backdrop-blur-sm text-slate-300 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-600 border border-slate-700/50 transition-colors"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre className="mt-0 overflow-x-auto rounded-xl bg-slate-900 dark:bg-slate-950 p-4 text-sm border border-slate-800/50 shadow-lg">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
const ChatMessage = ({ type, content }: { type: any; content: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex mb-4 ${
        type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className={`flex items-start gap-3 max-w-[85%] sm:max-w-[75%] ${type === "user" ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          type === "user"
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg"
            : "bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 shadow-lg"
        }`}>
          {type === "user" ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>
        
        {/* Message Bubble */}
        <div
          className={`px-4 py-3 break-words rounded-2xl shadow-lg ${
            type === "user"
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm"
              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
          }`}
        >
          {type !== "user" ? (
            <div className={clsx([
              'prose prose-slate dark:prose-invert max-w-none',
              'prose-p:my-2 prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-200',
              'prose-headings:border-b prose-headings:border-slate-200 dark:prose-headings:border-slate-700 prose-headings:pb-2 prose-headings:text-slate-900 dark:prose-headings:text-slate-100',
              'prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-3 prose-th:text-left prose-th:font-semibold',
              'prose-td:p-3 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700',
              'prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700',
              '[&_table]:mt-0 [&_table]:rounded-lg [&_table]:overflow-hidden',
              'prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline',
              'prose-strong:text-slate-900 dark:prose-strong:text-slate-100',
              'prose-code:text-emerald-600 dark:prose-code:text-emerald-400',
            ])}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  pre: ({ children }) => <>{children}</>,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !className?.includes('language-');
                    if (className?.includes('math')) {
                      return <code {...props} className={className}>{children}</code>;
                    }
                    return !isInline && match ? (
                      <CodeBlock className={className}>{String(children).replace(/\n$/, '')}</CodeBlock>
                    ) : (
                      <code {...props} className="rounded-md bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 text-sm font-mono text-emerald-600 dark:text-emerald-400">
                        {children}
                      </code>
                    );
                  },
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm">
                      <table>{children}</table>
                    </div>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ProfessionalAIChatScreen = ({ unique_id, content, resume_context }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    // { type: 'ai', content: '' },
  ]);


  
  const [inputValue, setInputValue] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesEndRef]);
 
  useEffect(() => {
    const savedMessages = localStorage.getItem(`${unique_id}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
      setIsChatStarted(true);
    } else {
      setMessages([]);
      setIsChatStarted(false);
    }
    // console.log(savedMessages);
  }, [unique_id]);
  // useEffect(() => {
  //   // Scroll to the bottom of the chat when new messages are added
  //   if (chatContainerRef.current) {
  //     chatContainerRef.current.scrollTop =
  //       chatContainerRef.current.scrollHeight;
  //   }
  // }, [messages]);

  const handleSendMessage = async () => {
    try {
      if (inputValue.trim() !== "") {
        const newMessage = { type: "user", content: inputValue };
        setMessages([...messages, { type: "user", content: inputValue }]);

        const updatedMessages = [...messages, newMessage];
        localStorage.setItem(`${unique_id}`, JSON.stringify(updatedMessages));
        setIsChatStarted(true);
        setInputValue("");
        // Simulate AI response after a short delay
        setIsLoading(true);
        console.log(unique_id, "unique_id");
        
        // // Get the latest messages (max 10 or all if less than 10)
        // const messagesToSend = updatedMessages.length > 10 
        //   ? updatedMessages.slice(-10) 
        //   : updatedMessages;
        //   const response = await fetch(`${backendUrl}/api/get-resume-context`, {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       fileurl: profile.resumelink,
        //       filetype: "pdf",
        //       chatId: profile.id,
        //     }),
        //   });
        console.log("resume_context",resume_context)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MAIN_BACKEND_SERVICE_URL}/api/question-answer-with-content`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query_text: inputValue,
              unique_id: unique_id,
              context: content,
              resume_context: resume_context || "",
              messages: updatedMessages.length > 10 ? updatedMessages.slice(-10) : updatedMessages // Send the latest messages
            }),
          }
        );
        if (!response) throw new Error("Network response was not ok");

        if (!response.ok) throw new Error("Network response was not ok");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let currentMessage = "";
        // Process stream chunks
        setIsLoading(false);
        while (true) {
          const { value, done } = await reader!.read();
          if (done) break;
          // Update AI message with new chunk
          const chunk = decoder.decode(value);
          // chunk.replaceAll('\n',"")
          console.log(chunk);

          currentMessage += chunk;
          //  currentMessage = sanitizeMarkdown(currentMessage.trim());
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];

            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage && lastMessage.type === "ai") {
              updatedMessages[updatedMessages.length - 1] = {
                type: "ai",
                content: currentMessage.trim(),
              };
              localStorage.setItem(
                `${unique_id}`,
                JSON.stringify(updatedMessages)
              );
              return [
                ...prevMessages.slice(0, -1),
                { type: "ai", content: currentMessage.trim() },
              ];
            } else {
              updatedMessages.push({
                type: "ai",
                content: currentMessage.trim(),
              });
              localStorage.setItem(
                `${unique_id}`,
                JSON.stringify(updatedMessages)
              );
              return [...prevMessages, { type: "ai", content: currentMessage }];
            }
          });
        }
        // simulateStreamingResponse(aiResponse);
      }
    } catch (e) {
      setIsLoading(false);
      toast({
        title: "Sorry",
        description:
          "For Lots of Traffic not avail to Generate response in this moment",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Card className="w-full h-full flex flex-col bg-white/95 backdrop-blur-sm border-emerald-200/50 shadow-xl">
        <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-emerald-100/50">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-600" />
            AI Career Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
          <div
            ref={chatContainerRef}
            className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent pr-2"
          >
            {!isChatStarted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex flex-col items-center justify-center space-y-8 py-12"
              >
                {/* Welcome Message */}
                <div className="text-center space-y-4 max-w-2xl px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg mb-4">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Welcome to AI Chat!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                    I'm here to help you with any questions. Ask me anything, and I'll do my best to assist you!
                  </p>
                </div>

                {/* Suggested Questions */}
                <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInputValue("Tell me about the content?")}
                    className="group text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                        <CornerDownRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Tell me about the content?
                        </p>
                      </div>
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInputValue("What is AI?")}
                    className="group text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                        <CornerDownRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          What is AI?
                        </p>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            )}
            {isChatStarted && (
              <div className="space-y-2 py-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    type={message.type}
                    content={message.content}
                  />
                ))}
                <div ref={messagesEndRef} />
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 shadow-lg flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="flex gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-emerald-500"
                                animate={{
                                  y: [0, -8, 0],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </motion.div>
                          <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
         
          <div className="flex items-end gap-3 p-3 mt-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/95 backdrop-blur-sm shadow-lg focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-colors">
            <Textarea
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 min-h-[56px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none text-[15px] leading-relaxed"
            />
            <Button
              size="icon"
              disabled={!inputValue.trim() || isLoading}
              className="flex-shrink-0 h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalAIChatScreen;