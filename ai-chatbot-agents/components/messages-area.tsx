import React from "react";
import { CardContent, Card } from "@/components/ui/card";
import { SectionedIntakeForm } from "@/components/sectioned-intake-form";
import { MessageCard } from "@/components/message-card";
import { Loader2 } from "lucide-react";

interface MessagesAreaProps {
  showIntakeForm: boolean;
  isLoading: boolean;
  messages: any[];
  streamedMessages: string[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleIntakeSubmit: (intakeData: any) => void;
  handleSuggestionClick: (suggestion: string) => void;
}

const MessagesArea: React.FC<MessagesAreaProps> = ({
  showIntakeForm,
  isLoading,
  messages,
  streamedMessages,
  messagesEndRef,
  handleIntakeSubmit,
  handleSuggestionClick,
}) => {
  return (
    <CardContent className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="space-y-1">
        {showIntakeForm && <SectionedIntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />}

        {messages.map((message) => (
          <MessageCard key={message.id} message={message} onSuggestionClick={handleSuggestionClick} />
        ))}

        {streamedMessages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}

        {isLoading && !showIntakeForm && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <Card className="bg-white border border-gray-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">Medical assistant is analyzing with context...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </CardContent>
  );
};

export default MessagesArea; 