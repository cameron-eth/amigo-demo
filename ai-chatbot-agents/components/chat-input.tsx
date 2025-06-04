import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardFooter } from "@/components/ui/card";
import { Loader2, Send, RotateCcw, History } from "lucide-react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  showIntakeForm: boolean;
  handleFormSubmit: (e: React.FormEvent) => void;
  handleShowHistory: () => void;
  handleClearConversation: () => void;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  isLoading,
  showIntakeForm,
  handleFormSubmit,
  handleShowHistory,
  handleClearConversation,
  setInput,
}) => {
  if (showIntakeForm) return null;

  return (
    <CardFooter className="border-t bg-white p-4">
      <div className="flex w-full space-x-3">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowHistory}
            className="h-12"
            title="Show conversation history"
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearConversation}
            className="h-12"
            title="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleFormSubmit} className="flex flex-1 space-x-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message or ask a follow-up question..."
              disabled={isLoading}
              className="pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </CardFooter>
  );
};

export default ChatInput; 