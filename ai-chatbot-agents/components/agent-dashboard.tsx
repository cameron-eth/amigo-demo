"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import {
  Activity,
  Brain,
  Heart,
  Search,
  Shield,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Zap,
  Target,
} from "lucide-react"

interface AgentMetrics {
  name: string
  activations: number
  successRate: number
  avgResponseTime: number
  decisions: number
  status: "active" | "idle" | "processing"
  lastUsed: string
}

interface CaseMetrics {
  mild: number
  potentialEmergency: number
  emergency: number
  total: number
}

interface AgentFlow {
  step: string
  agent: string
  timestamp: string
  duration: number
  success: boolean
}

export function AgentDashboard() {
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([
    {
      name: "Intake Agent",
      activations: 156,
      successRate: 98.7,
      avgResponseTime: 120,
      decisions: 156,
      status: "active",
      lastUsed: "2 minutes ago",
    },
    {
      name: "Triage Agent",
      activations: 142,
      successRate: 95.8,
      avgResponseTime: 850,
      decisions: 142,
      status: "active",
      lastUsed: "3 minutes ago",
    },
    {
      name: "Timeline Agent",
      activations: 89,
      successRate: 97.2,
      avgResponseTime: 650,
      decisions: 89,
      status: "idle",
      lastUsed: "15 minutes ago",
    },
    {
      name: "Empathy Agent",
      activations: 234,
      successRate: 99.1,
      avgResponseTime: 200,
      decisions: 187,
      status: "processing",
      lastUsed: "1 minute ago",
    },
    {
      name: "Content Agent",
      activations: 98,
      successRate: 96.9,
      avgResponseTime: 1200,
      decisions: 98,
      status: "active",
      lastUsed: "5 minutes ago",
    },
    {
      name: "Search Agent",
      activations: 67,
      successRate: 94.0,
      avgResponseTime: 950,
      decisions: 67,
      status: "idle",
      lastUsed: "8 minutes ago",
    },
    {
      name: "Language Check Agent",
      activations: 145,
      successRate: 92.4,
      avgResponseTime: 300,
      decisions: 134,
      status: "active",
      lastUsed: "2 minutes ago",
    },
    {
      name: "Escalation Agent",
      activations: 23,
      successRate: 100.0,
      avgResponseTime: 400,
      decisions: 23,
      status: "idle",
      lastUsed: "45 minutes ago",
    },
  ])

  const [caseMetrics, setCaseMetrics] = useState<CaseMetrics>({
    mild: 89,
    potentialEmergency: 34,
    emergency: 19,
    total: 142,
  })

  const [agentFlow, setAgentFlow] = useState<AgentFlow[]>([
    { step: "Intake", agent: "Intake Agent", timestamp: "14:32:15", duration: 120, success: true },
    { step: "Triage", agent: "Triage Agent", timestamp: "14:32:17", duration: 850, success: true },
    { step: "Timeline", agent: "Timeline Agent", timestamp: "14:32:26", duration: 650, success: true },
    { step: "Empathy", agent: "Empathy Agent", timestamp: "14:32:33", duration: 200, success: true },
    { step: "Content", agent: "Content Agent", timestamp: "14:32:35", duration: 1200, success: true },
    { step: "Language Check", agent: "Language Check Agent", timestamp: "14:32:47", duration: 300, success: true },
  ])

  const getAgentIcon = (agentName: string) => {
    switch (agentName.toLowerCase()) {
      case "intake agent":
        return <Users className="w-4 h-4 text-gray-500" />
      case "triage agent":
        return <Target className="w-4 h-4 text-gray-500" />
      case "timeline agent":
        return <Clock className="w-4 h-4 text-gray-500" />
      case "empathy agent":
        return <Heart className="w-4 h-4 text-gray-500" />
      case "content agent":
        return <Brain className="w-4 h-4 text-gray-500" />
      case "search agent":
        return <Search className="w-4 h-4 text-gray-500" />
      case "language check agent":
        return <Shield className="w-4 h-4 text-gray-500" />
      case "escalation agent":
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-50 text-blue-600 border-blue-200"
      case "processing":
        return "bg-purple-50 text-purple-600 border-purple-200"
      case "idle":
        return "bg-gray-50 text-gray-500 border-gray-200"
      default:
        return "bg-gray-50 text-gray-500 border-gray-200"
    }
  }

  const caseDistributionData = [
    { name: "Mild Cases", value: caseMetrics.mild, color: "#8b5cf6" },
    { name: "Potential Emergency", value: caseMetrics.potentialEmergency, color: "#a855f7" },
    { name: "Emergency", value: caseMetrics.emergency, color: "#c084fc" },
  ]

  const agentPerformanceData = agentMetrics.map((agent) => ({
    name: agent.name.replace(" Agent", ""),
    activations: agent.activations,
    successRate: agent.successRate,
    responseTime: agent.avgResponseTime,
  }))

  const agentUsageOverTime = [
    { time: "00:00", intake: 12, triage: 10, empathy: 15, content: 8, search: 5 },
    { time: "04:00", intake: 8, triage: 7, empathy: 11, content: 6, search: 3 },
    { time: "08:00", intake: 25, triage: 22, empathy: 28, content: 18, search: 12 },
    { time: "12:00", intake: 35, triage: 32, empathy: 38, content: 25, search: 18 },
    { time: "16:00", intake: 42, triage: 38, empathy: 45, content: 32, search: 22 },
    { time: "20:00", intake: 28, triage: 25, empathy: 32, content: 20, search: 15 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-b border-blue-200/50">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl text-gray-600 mb-2"
                style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
              >
                Physician Assistant Agent
              </h1>
              <p className="text-gray-500" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}>
                AI-powered medical guidance and support
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className="text-2xl font-bold text-gray-700"
                style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
              >
                amigo
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-600" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}>
              Agent Performance Dashboard
            </h2>
            <p className="text-gray-500 mt-1" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}>
              Real-time monitoring of your medical AI agents
            </p>
          </div>
          <div className="flex space-x-3">
            <Badge className="bg-blue-50 text-blue-600 border-blue-200">
              <Activity className="w-3 h-3 mr-1" />
              System Healthy
            </Badge>
            <Badge className="bg-purple-50 text-purple-600 border-purple-200">
              <Zap className="w-3 h-3 mr-1" />8 Agents Active
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm border border-gray-200/50">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
            >
              Agent Details
            </TabsTrigger>
            <TabsTrigger
              value="flow"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
            >
              Process Flow
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm text-gray-500 mb-1"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                      >
                        Total Cases
                      </p>
                      <p
                        className="text-2xl text-gray-600"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                      >
                        {caseMetrics.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% this week
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm text-gray-500 mb-1"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                      >
                        Avg Success Rate
                      </p>
                      <p
                        className="text-2xl text-gray-600"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                      >
                        96.8%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <Progress value={96.8} className="mt-3 bg-gray-100" />
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm text-gray-500 mb-1"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                      >
                        Avg Response Time
                      </p>
                      <p
                        className="text-2xl text-gray-600"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                      >
                        540ms
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-indigo-400" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-purple-50 text-purple-600 border-purple-200">-8% faster</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm text-gray-500 mb-1"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                      >
                        Emergency Cases
                      </p>
                      <p
                        className="text-2xl text-gray-600"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                      >
                        {caseMetrics.emergency}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-red-50 text-red-600 border-red-200">13.4% of total</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Case Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                <CardHeader>
                  <CardTitle
                    className="text-xl text-gray-600"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                  >
                    Case Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      mild: { label: "Mild Cases", color: "#8b5cf6" },
                      potential: { label: "Potential Emergency", color: "#a855f7" },
                      emergency: { label: "Emergency", color: "#c084fc" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={caseDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {caseDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                <CardHeader>
                  <CardTitle
                    className="text-xl text-gray-600"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                  >
                    Agent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      successRate: { label: "Success Rate", color: "#8b5cf6" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={agentPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <Bar dataKey="successRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agentMetrics.map((agent, index) => (
                <Card
                  key={index}
                  className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                          {getAgentIcon(agent.name)}
                        </div>
                        <div>
                          <CardTitle
                            className="text-lg text-gray-600"
                            style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                          >
                            {agent.name}
                          </CardTitle>
                          <p
                            className="text-sm text-gray-400"
                            style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                          >
                            Last used: {agent.lastUsed}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>{agent.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p
                          className="text-sm text-gray-500"
                          style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                        >
                          Activations
                        </p>
                        <p
                          className="text-xl text-gray-600"
                          style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                        >
                          {agent.activations}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-sm text-gray-500"
                          style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                        >
                          Decisions
                        </p>
                        <p
                          className="text-xl text-gray-600"
                          style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                        >
                          {agent.decisions}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span
                          className="text-gray-500"
                          style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                        >
                          Success Rate
                        </span>
                        <span
                          className="text-gray-600"
                          style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                        >
                          {agent.successRate}%
                        </span>
                      </div>
                      <Progress value={agent.successRate} className="bg-gray-100" />
                    </div>
                    <div>
                      <p
                        className="text-sm text-gray-500"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                      >
                        Avg Response Time
                      </p>
                      <p
                        className="text-lg text-gray-600"
                        style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                      >
                        {agent.avgResponseTime}ms
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flow" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle
                  className="text-xl text-gray-600"
                  style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                >
                  Latest Process Flow
                </CardTitle>
                <p className="text-sm text-gray-500" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}>
                  Step-by-step agent execution for the most recent case
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentFlow.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-lg border border-gray-200/30"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.success ? "bg-blue-50" : "bg-red-50"
                          }`}
                        >
                          {step.success ? (
                            <CheckCircle className="w-5 h-5 text-blue-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4
                              className="text-gray-600"
                              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                            >
                              {step.step}
                            </h4>
                            <p
                              className="text-sm text-gray-500"
                              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                            >
                              {step.agent}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className="text-sm text-gray-600"
                              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                            >
                              {step.timestamp}
                            </p>
                            <p
                              className="text-xs text-gray-400"
                              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                            >
                              {step.duration}ms
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle
                  className="text-xl text-gray-600"
                  style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                >
                  Agent Usage Over Time
                </CardTitle>
                <p className="text-sm text-gray-500" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}>
                  24-hour agent activation patterns
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    intake: { label: "Intake", color: "#8b5cf6" },
                    triage: { label: "Triage", color: "#a855f7" },
                    empathy: { label: "Empathy", color: "#c084fc" },
                    content: { label: "Content", color: "#ddd6fe" },
                    search: { label: "Search", color: "#e9d5ff" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={agentUsageOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <Area
                        type="monotone"
                        dataKey="intake"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="triage"
                        stackId="1"
                        stroke="#a855f7"
                        fill="#a855f7"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="empathy"
                        stackId="1"
                        stroke="#c084fc"
                        fill="#c084fc"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="content"
                        stackId="1"
                        stroke="#ddd6fe"
                        fill="#ddd6fe"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="search"
                        stackId="1"
                        stroke="#e9d5ff"
                        fill="#e9d5ff"
                        fillOpacity={0.6}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                <CardHeader>
                  <CardTitle
                    className="text-xl text-gray-600"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                  >
                    Response Time Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      responseTime: { label: "Response Time (ms)", color: "#8b5cf6" },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={agentPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <Line
                          type="monotone"
                          dataKey="responseTime"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                <CardHeader>
                  <CardTitle
                    className="text-xl text-gray-600"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 300 }}
                  >
                    Agent Activations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      activations: { label: "Activations", color: "#a855f7" },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={agentPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <Bar dataKey="activations" fill="#a855f7" radius={[4, 4, 0, 0]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
