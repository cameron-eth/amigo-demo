import React from "react";
import Image from 'next/image';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import Link from "next/link";

const MedicalChatHeader: React.FC = () => {
  return (
    <CardHeader className="bg-gradient-to-r from-blue-200 to-purple-200 border-blue-200 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-2xl text-gray-600" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }} >                Primary Care Agent
            </CardTitle>
            <p className="text-blue-100 text-zinc-900/65 text-sm">AI-powered medical guidance and support</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Image src="/og-image.png" alt="Amigo Logo" width={100} height={100} />
          <Link href="/dashboard">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">View Dashboard</span>
          </Link>
        </div>
      </div>
    </CardHeader>
  );
};

export default MedicalChatHeader; 