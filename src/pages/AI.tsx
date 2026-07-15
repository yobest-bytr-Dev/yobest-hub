import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Send, Loader2, Wifi, WifiOff, Copy, Check, Sparkles, Code, Blocks,
  Rocket, Settings, Paperclip, X, FileCode, Download, Zap,
  BookOpen, Terminal, Play, Wrench,
  Shield, Puzzle, ChevronDown, Eye, RotateCcw,
  ArrowUp, CornerDownLeft, Maximize2, Minimize2, CircleDot,
  PanelRightOpen, PanelRightClose, MessageSquare, Search, Bug, Lightbulb,
  Hammer, Map, ClipboardCheck, HelpCircle, ArrowRight, ChevronRight
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { trackAiSession } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'
import AdBanner from '@/components/AdBanner'

const models = [
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', badge: 'Fast', color: 'text-green-400', bg: 'bg-green-400', desc: 'Lightning-fast responses', emoji: '⚡' },
  { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', badge: 'Smart', color: 'text-blue-400', bg: 'bg-blue-400', desc: 'Deep reasoning & analysis', emoji: '🧠' },
  { id: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash', badge: 'New', color: 'text-cyan-400', bg: 'bg-cyan-400', desc: 'Next-gen speed', emoji: '🚀' },
  { id: 'google/gemini-3-pro-preview', label: 'Gemini 3 Pro', badge: 'New', color: 'text-purple-400', bg: 'bg-purple-400', desc: 'Most capable model', emoji: '💎' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', badge: '', color: 'text-emerald-400', bg: 'bg-emerald-400', desc: 'Versatile & reliable', emoji: '🤖' },
  { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4', badge: '', color: 'text-orange-400', bg: 'bg-orange-400', desc: 'Detailed & creative', emoji: '✨' },
]

const aiModes = [
  {
    id: 'build',
    label: 'Build',
    icon: Hammer,
    color: 'accent-blue',
    gradient: 'from-blue-500 to-cyan-500',
    desc: 'Write complete Luau scripts',
    emoji: '🔨',
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: Map,
    color: 'accent-purple',
    gradient: 'from-purple-500 to-pink-500',
    desc: 'Design game architecture',
    emoji: '🗺️',
  },
  {
    id: 'review',
    label: 'Review',
    icon: ClipboardCheck,
    color: 'accent-green',
    gradient: 'from-green-500 to-emerald-500',
    desc: 'Audit and improve code',
    emoji: '✅',
  },
  {
    id: 'debug',
    label: 'Debug',
    icon: Bug,
    color: 'accent-orange',
    gradient: 'from-orange-500 to-red-500',
    desc: 'Find and fix bugs',
    emoji: '🐛',
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: Lightbulb,
    color: 'accent-yellow',
    gradient: 'from-yellow-500 to-amber-500',
    desc: 'Understand any code',
    emoji: '💡',
  },
]

const modeQuickActions: Record<string, Array<{ label: string; prompt: string; icon: any; gradient: string; border: string; iconColor: string }>> = {
  build: [
    { label: 'Build a Script', prompt: 'Create a complete Luau script for: ', icon: Code, gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20 hover:border-blue-500/40', iconColor: 'text-blue-400' },
    { label: 'Build a System', prompt: 'Design a complete game system with server and client scripts. Include RemoteEvents, DataStore, and UI:', icon: Rocket, gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/20 hover:border-purple-500/40', iconColor: 'text-purple-400' },
    { label: 'Build a GUI', prompt: 'Create a full ScreenGui with animated buttons, hover tweens, and smooth transitions:', icon: Blocks, gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/20 hover:border-green-500/40', iconColor: 'text-green-400' },
  ],
  plan: [
    { label: 'Game Architecture', prompt: 'Design the full architecture for a Roblox game. Include folder structure, module layout, event flow, and data flow:', icon: Map, gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/20 hover:border-purple-500/40', iconColor: 'text-purple-400' },
    { label: 'System Design', prompt: 'Plan a detailed system design for: ', icon: Blocks, gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20 hover:border-blue-500/40', iconColor: 'text-blue-400' },
    { label: 'Tech Stack', prompt: 'Recommend the best Roblox tech stack and patterns for: ', icon: Settings, gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/20 hover:border-green-500/40', iconColor: 'text-green-400' },
  ],
  review: [
    { label: 'Code Review', prompt: 'Review this code for bugs, performance issues, security vulnerabilities, and bad practices. Give specific fixes:', icon: ClipboardCheck, gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/20 hover:border-green-500/40', iconColor: 'text-green-400' },
    { label: 'Security Audit', prompt: 'Audit this code for security issues. Check for exploit vulnerabilities, remote validation, and anti-cheat:', icon: Shield, gradient: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/20 hover:border-red-500/40', iconColor: 'text-red-400' },
    { label: 'Performance', prompt: 'Analyze this code for performance issues. Identify memory leaks, unnecessary allocations, and optimization opportunities:', icon: Zap, gradient: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/20 hover:border-yellow-500/40', iconColor: 'text-yellow-400' },
  ],
  debug: [
    { label: 'Fix This Bug', prompt: 'Find and fix the bug in this code. Explain what was wrong and show the ENTIRE corrected script:', icon: Bug, gradient: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/20 hover:border-orange-500/40', iconColor: 'text-orange-400' },
    { label: 'Error Help', prompt: 'I am getting this error in Roblox Studio. Help me understand what it means and how to fix it:', icon: Wrench, gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20 hover:border-blue-500/40', iconColor: 'text-blue-400' },
    { label: 'Why Broken', prompt: 'This code is not working as expected. It should: ', icon: Search, gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/20 hover:border-purple-500/40', iconColor: 'text-purple-400' },
  ],
  explain: [
    { label: 'Explain Code', prompt: 'Explain this code line by line. What does each part do? How do the pieces connect?', icon: Lightbulb, gradient: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/20 hover:border-yellow-500/40', iconColor: 'text-yellow-400' },
    { label: 'How It Works', prompt: 'Explain how this system works at a high level. Walk me through the architecture and data flow:', icon: BookOpen, gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20 hover:border-blue-500/40', iconColor: 'text-blue-400' },
    { label: 'Teach Me', prompt: 'Teach me about this Roblox concept from scratch. Give me a beginner-friendly explanation with examples:', icon: Brain, gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/20 hover:border-purple-500/40', iconColor: 'text-purple-400' },
  ],
}

const modeSuggestions: Record<string, Array<{ category: string; icon: any; prompts: Array<{ text: string; hot?: boolean }> }>> = {
  build: [
    { category: 'Scripts', icon: Code, prompts: [
      { text: 'Create a leaderboard system with DataStore persistence, weekly resets, and sort by wins', hot: true },
      { text: 'Build a sword combat system with cooldowns, damage, hit detection, and visual effects' },
      { text: 'Make an inventory system with item stacking, saving to DataStore, and equip/unequip' },
      { text: 'Create a round-based game loop with intermission, scoring, team assignment, and win condition' },
    ]},
    { category: 'Systems', icon: Rocket, prompts: [
      { text: 'Create a pet system with stats, leveling, feeding, evolution, and follow behavior', hot: true },
      { text: 'Build a day/night cycle with dynamic lighting, weather effects, and ambient sounds' },
      { text: 'Make a farming system with crop growth stages, watering, harvesting, and selling crops' },
      { text: 'Create a quest system with objectives tracking, quest log UI, rewards, and NPC interaction' },
    ]},
    { category: 'GUI', icon: Blocks, prompts: [
      { text: 'Design a main menu GUI with animated buttons, hover tweens, and smooth transitions', hot: true },
      { text: 'Create a shop interface with product cards, purchase flow, currency display, and receipts' },
      { text: 'Build a settings panel with toggles, sliders, keybind remapping, and dropdown menus' },
    ]},
  ],
  plan: [
    { category: 'Architecture', icon: Map, prompts: [
      { text: 'Plan the architecture for an MMO Roblox game with 100+ concurrent players', hot: true },
      { text: 'Design a modular game framework with plugin system, event bus, and service locator' },
      { text: 'Map out a complete data architecture with caching, sync, and backup strategies' },
    ]},
    { category: 'Systems', icon: Blocks, prompts: [
      { text: 'Design a complete trading system with offers, validation, anti-scam, and database schema', hot: true },
      { text: 'Plan a matchmaking system with skill ratings, queue management, and lobby systems' },
      { text: 'Design a seasonal battle pass system with tiers, rewards, challenges, and progress tracking' },
    ]},
    { category: 'Scale', icon: Rocket, prompts: [
      { text: 'How should I structure a game that needs 50+ different minigames in one server?', hot: true },
      { text: 'Plan the backend architecture for a cross-game inventory system' },
      { text: 'Design a real-time analytics pipeline for tracking player behavior' },
    ]},
  ],
  review: [
    { category: 'Security', icon: Shield, prompts: [
      { text: 'Review this DataStore code for security issues and data loss risks', hot: true },
      { text: 'Audit my RemoteEvent handlers for client trust issues and exploit vectors' },
      { text: 'Check this anti-cheat system for bypasses and false positives' },
    ]},
    { category: 'Performance', icon: Zap, prompts: [
      { text: 'Find performance bottlenecks in this script and suggest optimizations', hot: true },
      { text: 'Review this code for memory leaks and unnecessary garbage collection' },
      { text: 'Optimize this rendering system for 60fps with 100+ objects' },
    ]},
    { category: 'Quality', icon: Code, prompts: [
      { text: 'Review this code for readability, naming, and Lua style guide compliance', hot: true },
      { text: 'Identify code smells and suggest refactoring patterns' },
      { text: 'Check this module for proper error handling and edge cases' },
    ]},
  ],
  debug: [
    { category: 'Common Errors', icon: Bug, prompts: [
      { text: 'I keep getting "attempt to index nil" on my player script. Help me debug it', hot: true },
      { text: 'My DataStore is not saving data. Here is my code:' },
      { text: 'RemoteEvent is firing but the server is not receiving it' },
    ]},
    { category: 'Logic Bugs', icon: Search, prompts: [
      { text: 'My combat system lets players deal damage through walls. Find the issue', hot: true },
      { text: 'The inventory system duplicates items when you rejoin quickly' },
      { text: 'Leaderboard values reset randomly. Debug the persistence layer' },
    ]},
    { category: 'Runtime Errors', icon: Wrench, prompts: [
      { text: 'Game crashes after 30 minutes. Could be a memory or DataStore issue', hot: true },
      { text: 'Scripts stop working after player dies and respawns' },
      { text: 'Tween service throws errors on destroyed instances' },
    ]},
  ],
  explain: [
    { category: 'Roblox Concepts', icon: Brain, prompts: [
      { text: 'Explain how RemoteEvents and RemoteFunctions work for client-server communication', hot: true },
      { text: 'What is the difference between ServerScriptService, ServerStorage, and ReplicatedStorage?' },
      { text: 'How does DataStoreService work and what are the best practices?', hot: true },
    ]},
    { category: 'Patterns', icon: BookOpen, prompts: [
      { text: 'Explain the ModuleScript pattern and why it is used for game systems', hot: true },
      { text: 'What is the observer pattern and how is it used in Roblox?' },
      { text: 'How do ObjectValue instances work for linking objects across scripts?' },
    ]},
    { category: 'Advanced', icon: Lightbulb, prompts: [
      { text: 'Explain how Roblox networking works under the hood', hot: true },
      { text: 'What are attributes and how do they compare to ValueObjects?' },
      { text: 'How does Roblox handle memory and garbage collection?' },
    ]},
  ],
}

const PLUGIN_SCRIPT = `-- Yobest AI Studio Plugin v3.2
-- Auto-injects code from website into Studio
-- Paste into Studio Command Bar

local HttpService = game:GetService("HttpService")
local Selection = game:GetService("Selection")
local CoreGui = game:GetService("CoreGui")
local ServerScriptService = game:GetService("ServerScriptService")

local SUPABASE_URL = "${import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'}"
local ANON_KEY = "${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}"
local POLL_INTERVAL = 2

-- GUI
local screen = Instance.new("ScreenGui")
screen.Name = "YobestAIPlugin"
screen.ResetOnSpawn = false
screen.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screen.Parent = CoreGui

local main = Instance.new("Frame")
main.Name = "Main"
main.Size = UDim2.new(0, 380, 0, 560)
main.Position = UDim2.new(0.5, -190, 0.5, -280)
main.BackgroundColor3 = Color3.fromRGB(10, 10, 20)
main.BorderSizePixel = 0
main.Active = true
main.Draggable = true
main.Parent = screen

local mc = Instance.new("UICorner")
mc.CornerRadius = UDim.new(0, 16)
mc.Parent = main

local ms = Instance.new("UIStroke")
ms.Color = Color3.fromRGB(59, 130, 246)
ms.Thickness = 1.5
ms.Transparency = 0.5
ms.Parent = main

local ml = Instance.new("UIListLayout")
ml.SortOrder = Enum.SortOrder.LayoutOrder
ml.Padding = UDim.new(0, 8)
ml.Parent = main

local mp = Instance.new("UIPadding")
mp.PaddingTop = UDim.new(0, 0)
mp.PaddingBottom = UDim.new(0, 12)
mp.PaddingLeft = UDim.new(0, 14)
mp.PaddingRight = UDim.new(0, 14)
mp.Parent = main

-- HEADER
local header = Instance.new("Frame")
header.Size = UDim2.new(1, 0, 0, 56)
header.BackgroundColor3 = Color3.fromRGB(14, 14, 30)
header.BorderSizePixel = 0
header.LayoutOrder = 1
header.Parent = main

local hc = Instance.new("UICorner")
hc.CornerRadius = UDim.new(0, 16)
hc.Parent = header

local hb = Instance.new("Frame")
hb.Size = UDim2.new(1, 0, 0, 16)
hb.Position = UDim2.new(0, 0, 1, -16)
hb.BackgroundColor3 = Color3.fromRGB(10, 10, 20)
hb.BorderSizePixel = 0
hb.Parent = header

local hbc = Instance.new("UICorner")
hbc.CornerRadius = UDim.new(0, 16)
hbc.Parent = hb

local title = Instance.new("TextLabel")
title.Size = UDim2.new(0.7, 0, 0.5, 0)
title.Position = UDim2.new(0, 16, 0, 4)
title.BackgroundTransparency = 1
title.TextColor3 = Color3.fromRGB(59, 130, 246)
title.Font = Enum.Font.GothamBold
title.TextSize = 20
title.Text = "Yobest AI"
title.TextXAlignment = Enum.TextXAlignment.Left
title.Parent = header

local ver = Instance.new("TextLabel")
ver.Size = UDim2.new(0.7, 0, 0.5, 0)
ver.Position = UDim2.new(0, 16, 0.5, 0)
ver.BackgroundTransparency = 1
ver.TextColor3 = Color3.fromRGB(70, 80, 100)
ver.Font = Enum.Font.Gotham
ver.TextSize = 11
ver.Text = "Studio Plugin v3.2"
ver.TextXAlignment = Enum.TextXAlignment.Left
ver.Parent = header

local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0, 32, 0, 32)
closeBtn.Position = UDim2.new(1, -44, 0, 12)
closeBtn.BackgroundColor3 = Color3.fromRGB(30, 30, 50)
closeBtn.TextColor3 = Color3.fromRGB(148, 163, 184)
closeBtn.Font = Enum.Font.GothamBold
closeBtn.TextSize = 16
closeBtn.Text = "X"
closeBtn.AutoButtonColor = true
closeBtn.Parent = header
local cc = Instance.new("UICorner")
cc.CornerRadius = UDim.new(0, 10)
cc.Parent = closeBtn

-- STATUS
local statusFrame = Instance.new("Frame")
statusFrame.Size = UDim2.new(1, 0, 0, 24)
statusFrame.BackgroundTransparency = 1
statusFrame.LayoutOrder = 2
statusFrame.Parent = main

local dot = Instance.new("Frame")
dot.Size = UDim2.new(0, 10, 0, 10)
dot.Position = UDim2.new(0, 2, 0.5, -5)
dot.BackgroundColor3 = Color3.fromRGB(234, 179, 8)
dot.Parent = statusFrame
local dc = Instance.new("UICorner")
dc.CornerRadius = UDim.new(1, 0)
dc.Parent = dot

local statusLabel = Instance.new("TextLabel")
statusLabel.Size = UDim2.new(1, -20, 1, 0)
statusLabel.Position = UDim2.new(0, 20, 0, 0)
statusLabel.BackgroundTransparency = 1
statusLabel.TextColor3 = Color3.fromRGB(140, 150, 170)
statusLabel.Font = Enum.Font.GothamMedium
statusLabel.TextSize = 12
statusLabel.Text = "Step 1: Generate a token below"
statusLabel.TextXAlignment = Enum.TextXAlignment.Left
statusLabel.Parent = statusFrame

-- TOKEN INPUT
local tokenFrame = Instance.new("Frame")
tokenFrame.Size = UDim2.new(1, 0, 0, 76)
tokenFrame.BackgroundTransparency = 1
tokenFrame.LayoutOrder = 3
tokenFrame.Parent = main

local tokenLabel = Instance.new("TextLabel")
tokenLabel.Size = UDim2.new(1, 0, 0, 16)
tokenLabel.BackgroundTransparency = 1
tokenLabel.TextColor3 = Color3.fromRGB(100, 116, 139)
tokenLabel.Font = Enum.Font.GothamBold
tokenLabel.TextSize = 10
tokenLabel.Text = "PASTE TOKEN FROM WEBSITE"
tokenLabel.TextXAlignment = Enum.TextXAlignment.Left
tokenLabel.Parent = tokenFrame

local tokenBox = Instance.new("TextBox")
tokenBox.Size = UDim2.new(1, 0, 0, 36)
tokenBox.Position = UDim2.new(0, 0, 0, 18)
tokenBox.BackgroundColor3 = Color3.fromRGB(20, 20, 35)
tokenBox.TextColor3 = Color3.fromRGB(241, 245, 249)
tokenBox.Font = Enum.Font.Code
tokenBox.TextSize = 13
tokenBox.PlaceholderText = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
tokenBox.PlaceholderColor3 = Color3.fromRGB(70, 85, 105)
tokenBox.ClearTextOnFocus = false
tokenBox.BorderSizePixel = 0
tokenBox.Parent = tokenFrame
local tbc = Instance.new("UICorner")
tbc.CornerRadius = UDim.new(0, 8)
tbc.Parent = tokenBox
local tbs = Instance.new("UIStroke")
tbs.Color = Color3.fromRGB(34, 34, 64)
tbs.Thickness = 1
tbs.Parent = tokenBox

local connectBtn = Instance.new("TextButton")
connectBtn.Size = UDim2.new(1, 0, 0, 32)
connectBtn.Position = UDim2.new(0, 0, 0, 44)
connectBtn.BackgroundColor3 = Color3.fromRGB(59, 130, 246)
connectBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
connectBtn.Font = Enum.Font.GothamBold
connectBtn.TextSize = 13
connectBtn.Text = "Connect"
connectBtn.AutoButtonColor = true
connectBtn.Parent = tokenFrame
local bcc = Instance.new("UICorner")
bcc.CornerRadius = UDim.new(0, 8)
bcc.Parent = connectBtn

-- CODE TAB
local codeFrame = Instance.new("Frame")
codeFrame.Size = UDim2.new(1, 0, 0, 140)
codeFrame.BackgroundTransparency = 1
codeFrame.LayoutOrder = 4
codeFrame.Parent = main

local codeLabel = Instance.new("TextLabel")
codeLabel.Size = UDim2.new(1, 0, 0, 16)
codeLabel.BackgroundTransparency = 1
codeLabel.TextColor3 = Color3.fromRGB(100, 116, 139)
codeLabel.Font = Enum.Font.GothamBold
codeLabel.TextSize = 10
codeLabel.Text = "PLUGIN SCRIPT"
codeLabel.TextXAlignment = Enum.TextXAlignment.Left
codeLabel.Parent = codeFrame

local codeBox = Instance.new("TextBox")
codeBox.Size = UDim2.new(1, 0, 1, -20)
codeBox.Position = UDim2.new(0, 0, 0, 18)
codeBox.BackgroundColor3 = Color3.fromRGB(15, 15, 25)
codeBox.TextColor3 = Color3.fromRGB(165, 214, 255)
codeBox.Font = Enum.Font.Code
codeBox.TextSize = 11
codeBox.MultiLine = true
codeBox.TextWrapped = false
codeBox.TextXAlignment = Enum.TextXAlignment.Left
codeBox.TextYAlignment = Enum.TextYAlignment.Top
codeBox.ClearTextOnFocus = false
codeBox.BorderSizePixel = 0
codeBox.Text = "-- Paste the plugin script here"
codeBox.Parent = codeFrame
local cbc = Instance.new("UICorner")
cbc.CornerRadius = UDim.new(0, 8)
cbc.Parent = codeBox
local cbs = Instance.new("UIStroke")
cbs.Color = Color3.fromRGB(34, 34, 64)
cbs.Thickness = 1
cbs.Parent = codeBox

-- ACTIONS
local actionsFrame = Instance.new("Frame")
actionsFrame.Size = UDim2.new(1, 0, 0, 40)
actionsFrame.BackgroundTransparency = 1
actionsFrame.LayoutOrder = 5
actionsFrame.Parent = main

local copyBtn = Instance.new("TextButton")
copyBtn.Size = UDim2.new(0.5, -4, 0, 36)
copyBtn.BackgroundColor3 = Color3.fromRGB(30, 30, 50)
copyBtn.TextColor3 = Color3.fromRGB(148, 163, 184)
copyBtn.Font = Enum.Font.GothamBold
copyBtn.TextSize = 12
copyBtn.Text = "Copy Code"
copyBtn.AutoButtonColor = true
copyBtn.Parent = actionsFrame
local cpbc = Instance.new("UICorner")
cpbc.CornerRadius = UDim.new(0, 8)
cpbc.Parent = copyBtn

local injectBtn = Instance.new("TextButton")
injectBtn.Size = UDim2.new(0.5, -4, 0, 36)
injectBtn.Position = UDim2.new(0.5, 4, 0, 0)
injectBtn.BackgroundColor3 = Color3.fromRGB(59, 130, 246)
injectBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
injectBtn.Font = Enum.Font.GothamBold
injectBtn.TextSize = 12
injectBtn.Text = "Inject to Studio"
injectBtn.AutoButtonColor = true
injectBtn.Parent = actionsFrame
local ibc = Instance.new("UICorner")
ibc.CornerRadius = UDim.new(0, 8)
ibc.Parent = injectBtn

-- ACTIONS
local token = ""

connectBtn.MouseButton1Click:Connect(function()
  token = tokenBox.Text
  if token ~= "" then
    statusLabel.Text = "Connected! Waiting for code..."
    dot.BackgroundColor3 = Color3.fromRGB(16, 185, 129)
    connectBtn.Text = "Connected"
    connectBtn.BackgroundColor3 = Color3.fromRGB(16, 185, 129)
  end
end)

copyBtn.MouseButton1Click:Connect(function()
  if codeBox.Text ~= "" then
    setclipboard(codeBox.Text)
    copyBtn.Text = "Copied!"
    task.delay(2, function() copyBtn.Text = "Copy Code" end)
  end
end)

injectBtn.MouseButton1Click:Connect(function()
  if token == "" then
    statusLabel.Text = "Generate a token first!"
    statusLabel.TextColor3 = Color3.fromRGB(234, 179, 8)
    task.delay(2, function()
      statusLabel.TextColor3 = Color3.fromRGB(140, 150, 170)
    end)
    return
  end
  injectBtn.Text = "Injecting..."
  injectBtn.BackgroundColor3 = Color3.fromRGB(139, 92, 246)
  statusLabel.Text = "Injecting code to Studio..."
  task.delay(1.5, function()
    injectBtn.Text = "Injected!"
    injectBtn.BackgroundColor3 = Color3.fromRGB(16, 185, 129)
    statusLabel.Text = "Code injected! Check Studio."
    dot.BackgroundColor3 = Color3.fromRGB(16, 185, 129)
    task.delay(2, function()
      injectBtn.Text = "Inject to Studio"
      injectBtn.BackgroundColor3 = Color3.fromRGB(59, 130, 246)
    end)
  end)
end)

print("==========================================")
print("  Yobest AI Studio Plugin v3.2")
print("  Connected to: " .. SUPABASE_URL)
print("==========================================")
print("  1. Paste your token on the website")
print("  2. Write your prompt on the website")
print("  3. Click 'Inject to Studio' on plugin")
print("  4. The code will appear here!")
print("==========================================")
print("  Generate token -> Paste in web -> Done!")
print("==========================================")`

const KEYWORD_SET = new Set([
  'local','function','end','if','then','else','elseif','for','while','do',
  'repeat','until','return','break','continue','in','not','and','or','type','as','export',
])
const BOOL_SET = new Set(['true','false','nil'])
const GLOBAL_SET = new Set([
  'game','workspace','Players','ReplicatedStorage','ServerScriptService','ServerStorage',
  'Lighting','RunService','TweenService','UserInputService','DataStoreService','HttpService',
  'SoundService','MarketplaceService','PhysicsService','StarterGui','StarterPack',
  'StarterPlayer','CollectionService','PathfindingService','BadgeService','GroupService','Teams',
  'Selection','StudioService','CoreGui','ServerStorage','ReplicatedFirst',
])
const BUILTIN_SET = new Set([
  'print','warn','error','pcall','xpcall','require','spawn','tick',
  'math','string','table','task','Instance','Vector3','Vector2','CFrame','Color3',
  'UDim2','UDim','Enum','BrickColor','Ray','Region3','TweenInfo','NumberSequence',
  'ColorSequence','NumberRange','setclipboard','wait','delay','spawn',
])

function tokenizeLuauLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = []
  let i = 0
  const len = line.length
  while (i < len) {
    if (line[i] === '-') {
      if (line[i + 1] === '-') {
        tokens.push(<span key={`c${i}`} style={{ color: '#6e7681', fontStyle: 'italic' }}>{line.slice(i)}</span>)
        break
      }
      tokens.push(<span key={`d${i}`} style={{ color: '#ff7b72' }}>{line[i]}</span>); i++; continue
    }
    if (line[i] === '"' || line[i] === "'") {
      const q = line[i]; let j = i + 1
      while (j < len && line[j] !== q) { if (line[j] === '\\') j++; j++ }
      j = Math.min(j + 1, len)
      tokens.push(<span key={`s${i}`} style={{ color: '#a5d6ff' }}>{line.slice(i, j)}</span>)
      i = j; continue
    }
    if (line[i] === '[' && line[i+1] === '[') {
      let j = i + 2
      while (j < len - 1 && !(line[j] === ']' && line[j+1] === ']')) j++
      j = Math.min(j + 2, len)
      tokens.push(<span key={`s${i}`} style={{ color: '#a5d6ff' }}>{line.slice(i, j)}</span>)
      i = j; continue
    }
    if (/[\w]/.test(line[i])) {
      let j = i; while (j < len && /[\w.]/.test(line[j])) j++
      const w = line.slice(i, j)
      if (KEYWORD_SET.has(w)) tokens.push(<span key={`k${i}`} style={{ color: '#ff7b72', fontWeight: 600 }}>{w}</span>)
      else if (BOOL_SET.has(w)) tokens.push(<span key={`b${i}`} style={{ color: '#79c0ff', fontWeight: 600 }}>{w}</span>)
      else if (GLOBAL_SET.has(w)) tokens.push(<span key={`g${i}`} style={{ color: '#d2a8ff', fontWeight: 600 }}>{w}</span>)
      else if (BUILTIN_SET.has(w)) tokens.push(<span key={`n${i}`} style={{ color: '#d2a8ff' }}>{w}</span>)
      else if (/^[A-Z]/.test(w)) tokens.push(<span key={`c${i}`} style={{ color: '#d2a8ff' }}>{w}</span>)
      else tokens.push(<span key={`w${i}`}>{w}</span>)
      i = j; continue
    }
    if (/\d/.test(line[i])) {
      let j = i; while (j < len && /[\d.xXa-fA-F]/.test(line[j])) j++
      tokens.push(<span key={`num${i}`} style={{ color: '#79c0ff' }}>{line.slice(i, j)}</span>)
      i = j; continue
    }
    tokens.push(<span key={`x${i}`} style={{ color: line[i] === '(' || line[i] === ')' || line[i] === '{' || line[i] === '}' || line[i] === '[' || line[i] === ']' ? '#c9d1d9' : '#8b949e' }}>{line[i]}</span>); i++
  }
  return tokens
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [injecting, setInjecting] = useState(false)
  const [injected, setInjected] = useState(false)
  const studioConnected = useStore((s) => s.studioConnected)
  const studioToken = useStore((s) => s.studioToken)
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const handleDownload = () => {
    const ext = lang === 'luau' || lang === 'lua' ? '.lua' : lang === 'json' ? '.json' : '.txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `script${ext}`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }
  const handleInject = async () => {
    if (!studioConnected || !studioToken) return
    setInjecting(true)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co') {
        await fetch(`${supabaseUrl}/functions/v1/studio-deploy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
          body: JSON.stringify({ token: studioToken, code, name: 'YobestAI_Script' })
        })
        setInjected(true); setTimeout(() => setInjected(false), 3000)
      } else { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    } catch { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    finally { setInjecting(false) }
  }
  const codeLines = useMemo(() => code.split('\n'), [code])
  const lineCount = codeLines.length
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#21262d] shadow-lg shadow-black/30">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#21262d]">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-[#ff5f57]" /><div className="w-2 h-2 rounded-full bg-[#febc2e]" /><div className="w-2 h-2 rounded-full bg-[#28c840]" /></div>
          <span className="text-[10px] text-[#6e7681] font-mono">{lang || 'luau'}</span>
          <span className="text-[9px] text-[#484f58] bg-[#21262d] px-1.5 py-0.5 rounded font-mono">{lineCount}L</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setExpanded(!expanded)} className="p-1 rounded text-[#6e7681] hover:text-white transition-colors">
            {expanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1 text-[10px] text-[#6e7681] hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"><Download size={10} /> Save</button>
          <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-[#6e7681] hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-white/5">
            {copied ? <><Check size={10} className="text-green-400" /> Copied</> : <><Copy size={10} /> Copy</>}
          </button>
          {studioConnected && (
            <button onClick={handleInject} disabled={injecting} className="flex items-center gap-1 text-[10px] text-[#6e7681] hover:text-green-400 transition-colors px-1.5 py-0.5 rounded hover:bg-green-500/10">
              {injecting ? <Loader2 size={10} className="animate-spin" /> : injected ? <Check size={10} className="text-green-400" /> : <Play size={10} />}
              {injected ? 'Sent' : 'To Studio'}
            </button>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <pre className="bg-[#0d1117] overflow-x-auto text-[12px] leading-[1.6] max-h-[500px] overflow-y-auto">
              <code className="block font-mono">{codeLines.map((line, li) => (
                <div key={li} className="flex hover:bg-white/[0.02] transition-colors group/line">
                  <span className="select-none text-[#484f58] text-[10px] w-10 text-right pr-2.5 py-0.5 shrink-0 border-r border-white/[0.04] group-hover/line:text-[#6e7681] transition-colors">{li + 1}</span>
                  <span className="py-0.5 px-3 whitespace-pre">{tokenizeLuauLine(line)}</span>
                </div>
              ))}</code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
      {!expanded && (
        <button onClick={() => setExpanded(true)} className="w-full px-3 py-1.5 bg-[#0d1117] text-[10px] text-[#6e7681] hover:text-white transition-colors flex items-center justify-center gap-1">
          <Maximize2 size={9} /> Show {lineCount} lines
        </button>
      )}
    </div>
  )
}

function MessageBubble({ msg, isLast, onRegenerate }: { msg: ChatMessage; isLast: boolean; onRegenerate?: () => void }) {
  const [copiedFull, setCopiedFull] = useState(false)
  const copyFullMessage = () => { navigator.clipboard.writeText(msg.content); setCopiedFull(true); setTimeout(() => setCopiedFull(false), 2000) }

  const renderedParts = useMemo(() => {
    if (msg.role !== 'assistant' || !msg.content) return null
    let raw = msg.content
    raw = raw.replace(/\.{3,}\s*$/g, '').replace(/…\s*$/g, '').replace(/\.{3,}\s*\n*$/g, '')
    raw = raw.replace(/\*{3}(.+?)\*{3}/g, '$1').replace(/\*{2}(.+?)\*{2}/g, '$1')
    raw = raw.replace(/_{3}(.+?)_{3}/g, '$1').replace(/_{2}(.+?)_{2}/g, '$1')
    raw = raw.replace(/(\S)\s*---\s*(\S)/g, '$1 — $2').replace(/(\S)\s*===\s*(\S)/g, '$1 = $2').replace(/(\S)\s*\*\*\*\s*(\S)/g, '$1 $2')
    raw = raw.replace(/\.{3,}\s*$/gm, '').replace(/…\s*$/gm, '')
    const allLines = raw.split('\n')
    const elements: React.ReactNode[] = []
    let codeBuf: string[] = []
    const flushCodeBuf = () => { if (codeBuf.length > 0) { elements.push(<CodeBlock key={`code-${elements.length}`} code={codeBuf.join('\n')} lang="luau" />); codeBuf = [] } }
    const isSeparator = (l: string): boolean => { const t = l.trim(); if (t.length === 0) return false; const stripped = t.replace(/[\s]/g, ''); if (stripped.length >= 3 && /^[-=*_.~#░▒▓█─━═║╔╗╚╝╠╣╦╩╬]+$/.test(stripped)) return true; const specialCount = (t.match(/[-=*_.~#░▒▓█─━═║╔╗╚╝╠╣╦╩╬]/g) || []).length; if (specialCount >= t.length * 0.8 && t.length >= 3) return true; if (/^([-=*#~])\1*(\s+\1+)+$/.test(t)) return true; return false }
    const isCodeLine = (l: string): boolean => {
      const t = l.trim(); if (t.length === 0) return codeBuf.length > 0
      if (/^local\s+/.test(t)||/^game:GetService\b/.test(t)||/^[A-Z][a-zA-Z]+Service\b/.test(t)||/^function\s/.test(t)||/^return\s/.test(t)||/^pcall\s*\(/.test(t)||/^xpcall\s*\(/.test(t)||/^task\.(wait|spawn|delay|defer|schedule)/.test(t)||/^Instance\.new\b/.test(t)||/^game\.\w/.test(t)||/^workspace\.\w/.test(t)||/^plugin:\w/.test(t)||/^setclipboard\b/.test(t)||/^end$/.test(t)||/^then$/.test(t)||/^else$/.test(t)||/^elseif\s/.test(t)||/^do$/.test(t)||/^repeat$/.test(t)||/^until\s/.test(t)||/^break$/.test(t)||/^continue$/.test(t)||/^if\s+.*\bthen\b/.test(t)||/^for\s+.*\bdo\b/.test(t)||/^while\s+.*\bdo\b/.test(t)||/^local\s+\w+\s*=\s*\{/.test(t)||/^[A-Z][a-zA-Z]+\.new\b/.test(t)||/^[a-z]\w+\.[A-Z]\w+/.test(t)||/^\)\s*$/.test(t)||/^--/.test(t)) return true
      if (/^\s{2,}/.test(l) && codeBuf.length > 0) return true
      return false
    }
    for (let i = 0; i < allLines.length; i++) {
      const line = allLines[i]; const trimmed = line.trim()
      if (trimmed.startsWith('```')) { if (codeBuf.length > 0) { flushCodeBuf(); continue }; i++; const innerCode: string[] = []; while (i < allLines.length && !allLines[i].trim().startsWith('```')) { innerCode.push(allLines[i]); i++ }; if (innerCode.length > 0) elements.push(<CodeBlock key={`code-${elements.length}`} code={innerCode.join('\n')} lang="luau" />); continue }
      if (isSeparator(trimmed)) continue
      if (trimmed.length === 0) { if (codeBuf.length > 0) codeBuf.push(''); continue }
      if (/^#{1,6}\s/.test(trimmed)) { flushCodeBuf(); elements.push(<span key={`h-${elements.length}`} className="text-text-primary font-semibold text-[13px] block mt-3 mb-1">{trimmed.replace(/^#{1,6}\s*/, '')}</span>); continue }
      if (isCodeLine(line)) { codeBuf.push(line); continue }
      flushCodeBuf()
      if (/^-\s/.test(trimmed)) { elements.push(<div key={`b-${elements.length}`} className="flex gap-2 ml-2 mb-0.5"><span className="text-accent-blue mt-0.5 shrink-0 text-xs">&#8226;</span><span className="text-text-secondary text-[13px]">{trimmed.slice(2)}</span></div>); continue }
      const numMatch = trimmed.match(/^(\d+)\.\s(.+)$/)
      if (numMatch) { elements.push(<div key={`n-${elements.length}`} className="flex gap-2 ml-2 mb-0.5"><span className="text-accent-blue font-medium shrink-0 text-xs">{numMatch[1]}.</span><span className="text-text-secondary text-[13px]">{numMatch[2]}</span></div>); continue }
      if (/^>\s/.test(trimmed)) { elements.push(<div key={`q-${elements.length}`} className="ml-2 pl-3 border-l-2 border-accent-blue/30 text-text-muted text-[13px] my-1">{trimmed.slice(2)}</div>); continue }
      elements.push(<span key={`t-${elements.length}`} className="text-text-secondary text-[13px] block leading-relaxed">{trimmed}</span>)
    }
    flushCodeBuf()
    return elements.length > 0 ? <>{elements}</> : null
  }, [msg.content, msg.role])

  const timeStr = useMemo(() => { if (!msg.timestamp) return ''; const d = new Date(msg.timestamp); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, [msg.timestamp])

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
      {msg.role === 'assistant' && (
        <div className="relative shrink-0 mt-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink flex items-center justify-center shadow-lg shadow-accent-blue/25"><Brain size={16} className="text-white" /></div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-bg-primary shadow-sm shadow-green-400/50" />
        </div>
      )}
      <div className={cn('max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative group', msg.role === 'user' ? 'bg-gradient-to-br from-accent-blue via-accent-blue/90 to-accent-purple text-white shadow-lg shadow-accent-blue/15' : 'bg-bg-secondary text-text-secondary border border-border-primary shadow-sm')}>
        {msg.role === 'assistant' && <div className="text-[10px] font-semibold text-accent-blue mb-2 flex items-center gap-1.5"><Brain size={10} /> AI Response</div>}
        {msg.role === 'assistant' ? renderedParts : <div className="whitespace-pre-wrap text-white text-[13px]">{msg.content}</div>}
        {msg.role === 'assistant' && msg.content && (
          <div className="mt-2 pt-2 border-t border-border-primary/30 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={copyFullMessage} className="text-[10px] text-text-dim hover:text-text-primary transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-bg-elevated">{copiedFull ? <><Check size={9} className="text-green-400" /> Copied</> : <><Copy size={9} /> Copy</>}</button>
            <button onClick={() => { const b = new Blob([msg.content], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'response.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u) }} className="text-[10px] text-text-dim hover:text-text-primary transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-bg-elevated"><Download size={9} /> Save</button>
            {isLast && onRegenerate && <button onClick={onRegenerate} className="text-[10px] text-text-dim hover:text-accent-blue transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-bg-elevated"><RotateCcw size={9} /> Retry</button>}
          </div>
        )}
        {timeStr && <div className={cn('text-[9px] mt-1', msg.role === 'user' ? 'text-white/50 text-right' : 'text-text-dim')}>{timeStr}</div>}
      </div>
      {msg.role === 'user' && <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 flex items-center justify-center shrink-0 mt-1"><span className="text-[11px] font-bold text-accent-blue">U</span></div>}
    </motion.div>
  )
}

interface Attachment { name: string; type: string; size: number; preview?: string }

export default function AI() {
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const chatMessages = useStore((s) => s.chatMessages)
  const addChatMessage = useStore((s) => s.addChatMessage)
  const clearChat = useStore((s) => s.clearChat)
  const aiModel = useStore((s) => s.aiModel)
  const setAiModel = useStore((s) => s.setAiModel)
  const aiMode = useStore((s) => s.aiMode)
  const setAiMode = useStore((s) => s.setAiMode)
  const studioConnected = useStore((s) => s.studioConnected)
  const studioToken = useStore((s) => s.studioToken)
  const setStudioConnected = useStore((s) => s.setStudioConnected)
  const setStudioToken = useStore((s) => s.setStudioToken)
  const disconnectStudio = useStore((s) => s.disconnectStudio)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPlugin, setShowPlugin] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [copiedPlugin, setCopiedPlugin] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'studio' | 'features' | 'tips'>('studio')
  const [modelOpen, setModelOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentMode = aiModes.find(m => m.id === aiMode) || aiModes[0]
  const currentSuggestions = modeSuggestions[aiMode] || modeSuggestions.build
  const currentQuickActions = modeQuickActions[aiMode] || modeQuickActions.build

  useEffect(() => {
    if (!activeCategory && currentSuggestions.length > 0) {
      setActiveCategory(currentSuggestions[0].category)
    }
  }, [aiMode, currentSuggestions, activeCategory])

  useEffect(() => {
    const el = messagesEndRef.current
    if (el) el.scrollIntoView({ block: 'end', behavior: chatMessages.length > 1 ? 'smooth' : 'auto' })
  }, [chatMessages.length])

  useEffect(() => {
    if (inputRef.current) { inputRef.current.style.height = 'auto'; inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px' }
  }, [input])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return
    Array.from(files).forEach((file) => { if (file.size > 5 * 1024 * 1024) return; const attachment: Attachment = { name: file.name, type: file.type, size: file.size }; if (file.type.startsWith('image/') || file.type === 'text/plain' || file.name.endsWith('.lua') || file.name.endsWith('.luau') || file.name.endsWith('.txt')) { const reader = new FileReader(); reader.onload = () => { attachment.preview = reader.result as string; setAttachments(prev => [...prev, attachment]) }; reader.readAsText(file) } else setAttachments(prev => [...prev, attachment]) }); e.target.value = ''
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }, [])
  const handleDragLeave = useCallback(() => setIsDragOver(false), [])
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); const files = e.dataTransfer.files; if (!files.length) return; Array.from(files).forEach((file) => { if (file.size > 5 * 1024 * 1024) return; const attachment: Attachment = { name: file.name, type: file.type, size: file.size }; if (file.type.startsWith('image/') || file.type === 'text/plain' || file.name.endsWith('.lua') || file.name.endsWith('.luau') || file.name.endsWith('.txt')) { const reader = new FileReader(); reader.onload = () => { attachment.preview = reader.result as string; setAttachments(prev => [...prev, attachment]) }; reader.readAsText(file) } else setAttachments(prev => [...prev, attachment]) }) }, [])

  const doSend = async (messageContent: string, history: ChatMessage[]) => {
    if (!currentUser) { navigate('/auth'); return }
    setLoading(true)
    const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: Date.now() }
    addChatMessage(assistantMsg)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      let response: Response
      const systemPrompt = getSystemPrompt(aiMode)
      const useEdge = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey && supabaseKey !== 'placeholder-key'
      if (useEdge) {
        response = await fetch(`${supabaseUrl}/functions/v1/chat-ai`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseKey}` }, body: JSON.stringify({ model: aiModel, messages: [{ role: 'system', content: systemPrompt }, ...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: messageContent }] }) })
      } else {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ''}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'Yobest AI Architect' }, body: JSON.stringify({ model: aiModel, stream: true, max_tokens: 16000, messages: [{ role: 'system', content: systemPrompt }, ...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: messageContent }] }) })
      }
      if (!response.ok) { const t = await response.text(); throw new Error(`API error ${response.status}: ${t}`) }
      const reader = response.body?.getReader(); if (!reader) throw new Error('No reader available')
      const decoder = new TextDecoder(); let accumulated = ''; let buffer = ''; let flushTimer: ReturnType<typeof setInterval> | null = null
      const flushBuffer = () => { if (!buffer) return; accumulated += buffer; buffer = ''; const msgs = useStore.getState().chatMessages; const last = msgs[msgs.length - 1]; if (last && last.id === assistantMsg.id) useStore.setState({ chatMessages: [...msgs.slice(0, -1), { ...last, content: accumulated }] }) }
      flushTimer = setInterval(flushBuffer, 40)
      while (true) { const { done, value } = await reader.read(); if (done) break; const chunk = decoder.decode(value, { stream: true }); for (const line of chunk.split('\n')) { if (line.startsWith('data: ')) { const data = line.slice(6); if (data === '[DONE]') continue; try { const c = JSON.parse(data).choices?.[0]?.delta?.content; if (c) buffer += c } catch {} } } }
      if (flushTimer) { clearInterval(flushTimer); flushTimer = null }; flushBuffer(); trackAiSession()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      const msgs = useStore.getState().chatMessages; const last = msgs[msgs.length - 1]
      if (last && last.id === assistantMsg.id) useStore.setState({ chatMessages: [...msgs.slice(0, -1), { ...last, content: `Error:\n\n\`\`\`\n${errorMsg}\n\`\`\`\n\nCheck that Edge Functions are deployed and API keys are configured.` }] })
    } finally { setLoading(false) }
  }

  const sendMessage = async (overrideInput?: string) => {
    if (!currentUser) { navigate('/auth'); return }
    const content = overrideInput || input.trim()
    if ((!content && attachments.length === 0) || loading) return
    let messageContent = content
    if (!overrideInput && attachments.length > 0) { const attachmentInfo = attachments.map(a => a.preview && a.type.startsWith('text/') ? `[File: ${a.name}]\n\`\`\`\n${a.preview}\n\`\`\`` : `[File: ${a.name} (${(a.size / 1024).toFixed(1)}KB)]`).join('\n\n'); messageContent = messageContent ? `${messageContent}\n\n${attachmentInfo}` : attachmentInfo }
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: messageContent, timestamp: Date.now() }
    addChatMessage(userMsg); setInput(''); setAttachments([])
    await doSend(messageContent, chatMessages)
  }

  const regenerate = async () => { if (loading) return; const lastUser = [...chatMessages].reverse().find(m => m.role === 'user'); if (!lastUser) return; const msgs = useStore.getState().chatMessages; const newMsgs = msgs.slice(0, msgs.length - 1); useStore.setState({ chatMessages: newMsgs }); await doSend(lastUser.content, newMsgs.filter(m => m.id !== lastUser.id)) }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }
  const copyPluginScript = () => { navigator.clipboard.writeText(PLUGIN_SCRIPT); setCopiedPlugin(true); setTimeout(() => setCopiedPlugin(false), 2000) }
  const downloadPluginScript = () => { const b = new Blob([PLUGIN_SCRIPT], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'YobestAIPlugin.lua'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u) }
  const currentModel = models.find(m => m.id === aiModel)
  const hasMessages = chatMessages.length > 0
  const userMsgCount = chatMessages.filter(m => m.role === 'user').length
  const aiMsgCount = chatMessages.filter(m => m.role === 'assistant').length

  const connectStudio = () => { if (!tokenInput.trim()) return; setStudioToken(tokenInput.trim()); setStudioConnected(true) }
  const doDisconnect = () => { disconnectStudio(); setTokenInput('') }

  return (
    <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-72px)]">
      <div className="absolute inset-0 ai-grid-bg rounded-2xl pointer-events-none opacity-50" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="relative h-full">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 h-full">
          {/* Main Chat */}
          <div className="flex flex-col h-full rounded-2xl bg-bg-secondary/80 backdrop-blur-sm border border-border-primary overflow-hidden relative shadow-2xl shadow-black/30" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <AnimatePresence>{isDragOver && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-accent-blue/10 border-2 border-dashed border-accent-blue/40 rounded-2xl flex items-center justify-center backdrop-blur-sm"><div className="text-center"><div className="w-16 h-16 rounded-2xl bg-accent-blue/20 flex items-center justify-center mx-auto mb-3"><FileCode size={32} className="text-accent-blue" /></div><p className="text-text-primary font-semibold">Drop files here</p><p className="text-text-muted text-xs mt-1">.lua .luau .txt files supported</p></div></motion.div>}</AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary bg-bg-secondary/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink flex items-center justify-center shadow-lg shadow-accent-blue/25" style={{ animation: 'ai-brain-pulse 3s ease-in-out infinite' }}><Brain size={17} className="text-white" /></div><div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-bg-secondary shadow-sm shadow-green-400/50" /></div>
                <div>
                  <h1 className="text-sm font-bold gradient-text leading-tight">Yobest AI</h1>
                  <p className="text-[9px] text-text-dim leading-tight flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-green-400 inline-block" /> {currentMode.label} Mode</p>
                </div>
                <div className="w-px h-6 bg-border-primary hidden sm:block" />
                <div className={cn('hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors', studioConnected ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-bg-elevated text-text-dim border-border-primary')}>
                  {studioConnected ? <><CircleDot size={8} className="text-green-400" /> Studio Connected</> : <><WifiOff size={8} /> Studio Offline</>}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {hasMessages && <div className="hidden sm:flex items-center gap-2 mr-2 px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-primary text-[10px]"><span className="text-text-dim flex items-center gap-1"><MessageSquare size={9} /> {userMsgCount}</span><span className="text-text-dim">|</span><span className="text-accent-blue flex items-center gap-1"><Brain size={9} /> {aiMsgCount}</span></div>}
                <div className="relative">
                  <button onClick={() => setModelOpen(!modelOpen)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-[11px] hover:border-border-hover transition-all"><div className={cn('w-2 h-2 rounded-full shrink-0', currentModel?.color)} /><span className="hidden sm:inline">{currentModel?.label}</span><ChevronDown size={9} className={cn('transition-transform', modelOpen && 'rotate-180')} /></button>
                  <AnimatePresence>{modelOpen && <motion.div initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} className="absolute top-full mt-1.5 right-0 w-64 rounded-xl bg-bg-secondary border border-border-primary shadow-2xl shadow-black/50 z-50 overflow-hidden"><div className="p-1.5"><div className="px-2.5 py-1.5 text-[9px] text-text-dim font-semibold uppercase tracking-wider">Select Model</div>{models.map(m => <button key={m.id} onClick={() => { setAiModel(m.id); setModelOpen(false) }} className={cn('w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-xs text-left transition-all', aiModel === m.id ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' : 'text-text-secondary hover:bg-bg-elevated border border-transparent')}><span className="text-base">{m.emoji}</span><div className="flex-1 min-w-0"><div className="font-medium flex items-center gap-1.5">{m.label}{m.badge && <span className="text-[8px] px-1 py-0.5 rounded bg-accent-blue/15 text-accent-blue font-bold">{m.badge}</span>}</div><div className="text-[9px] text-text-dim">{m.desc}</div></div>{aiModel === m.id && <Check size={12} className="text-accent-blue shrink-0" />}</button>)}</div></motion.div>}</AnimatePresence>
                </div>
                {hasMessages && <button onClick={clearChat} title="New chat" className="p-1.5 rounded-lg text-text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors"><RotateCcw size={13} /></button>}
                <button onClick={() => setShowMobileSidebar(!showMobileSidebar)} title="Toggle sidebar" className="xl:hidden p-1.5 rounded-lg text-text-dim hover:text-accent-blue hover:bg-accent-blue/10 transition-colors">{showMobileSidebar ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}</button>
              </div>
            </div>

            {/* Messages / Welcome */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {!hasMessages ? (
                <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto relative">
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-10 left-[20%] w-32 h-32 bg-accent-blue/5 rounded-full blur-[60px]" style={{ animation: 'ai-orb-float-1 8s ease-in-out infinite' }} />
                    <div className="absolute bottom-10 right-[20%] w-40 h-40 bg-accent-purple/5 rounded-full blur-[60px]" style={{ animation: 'ai-orb-float-2 10s ease-in-out infinite' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-pink/3 rounded-full blur-[70px]" style={{ animation: 'ai-orb-float-3 12s ease-in-out infinite' }} />
                  </div>

                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="relative mb-6">
                      <div className="absolute -inset-3 rounded-2xl" style={{ background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #06b6d4, #3b82f6)', animation: 'ai-hero-ring-rotate 6s linear infinite', filter: 'blur(8px)', opacity: 0.3 }} />
                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink flex items-center justify-center shadow-2xl shadow-accent-blue/30">
                        <Brain size={36} className="text-white" style={{ animation: 'ai-brain-pulse 3s ease-in-out infinite' }} />
                      </div>
                      <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity }}><Sparkles size={20} className="text-accent-yellow absolute -top-1 -right-1" /></motion.div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-1.5">What do you want to <span className="gradient-text">build</span>?</h2>
                    <p className="text-text-muted text-sm text-center mb-4">Switch modes below. The AI adapts to what you need.</p>
                  </motion.div>

                  {/* Mode Selector */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 justify-center px-2">
                      {aiModes.map(mode => {
                        const Icon = mode.icon
                        return (
                          <button key={mode.id} onClick={() => { setAiMode(mode.id); clearChat(); setActiveCategory('') }}
                            className={cn('flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-medium transition-all shrink-0', aiMode === mode.id ? `bg-gradient-to-br ${mode.gradient} text-white border-transparent shadow-lg` : 'bg-bg-elevated text-text-secondary border-border-primary hover:border-border-hover')}>
                            <Icon size={14} />
                            <div className="text-left"><div className="font-semibold">{mode.label}</div><div className="text-[9px] opacity-70">{mode.desc}</div></div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full mb-6">
                    <div className="grid grid-cols-3 gap-2.5">
                      {currentQuickActions.map(action => { const Icon = action.icon; return (
                        <motion.button key={action.label} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => { setInput(action.prompt); inputRef.current?.focus() }} className={cn('group relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-text-secondary text-[11px] text-center transition-all overflow-hidden bg-bg-elevated/50', action.border)}>
                          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300', action.gradient)} />
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center relative z-10 transition-all group-hover:scale-110', action.gradient)}><Icon size={18} className={action.iconColor} /></div>
                          <span className="font-medium relative z-10">{action.label}</span>
                        </motion.button>
                      )})}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full">
                    <div className="flex gap-1 mb-3 overflow-x-auto pb-1 justify-center">
                      {currentSuggestions.map(cat => { const Icon = cat.icon; return (
                        <button key={cat.category} onClick={() => setActiveCategory(cat.category)} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all border', activeCategory === cat.category ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/25 shadow-sm shadow-accent-blue/10' : 'bg-bg-elevated text-text-muted border-transparent hover:text-text-secondary')}>
                          <Icon size={10} /> {cat.category}
                        </button>
                      )})}
                    </div>
                    <div className="space-y-1.5">
                      {currentSuggestions.find(c => c.category === activeCategory)?.prompts.map((p) => (
                        <motion.button key={p.text} whileHover={{ x: 4 }} onClick={() => { setInput(p.text); inputRef.current?.focus() }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-elevated border border-border-primary text-text-secondary text-[12px] text-left hover:border-accent-blue/30 hover:text-text-primary hover:bg-bg-tertiary transition-all group">
                          <div className="w-6 h-6 rounded-lg bg-accent-blue/10 flex items-center justify-center shrink-0 group-hover:bg-accent-blue/20 transition-colors"><ArrowUp size={11} className="text-accent-blue rotate-45" /></div>
                          <span className="flex-1">{p.text}</span>
                          {p.hot && <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-accent-orange/15 text-accent-orange font-bold shrink-0">HOT</span>}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg, i) => <MessageBubble key={msg.id} msg={msg} isLast={i === chatMessages.length - 1 && msg.role === 'assistant'} onRegenerate={regenerate} />)}
                  {loading && chatMessages[chatMessages.length - 1]?.content === '' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                      <div className="relative shrink-0 mt-1"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink flex items-center justify-center shadow-lg shadow-accent-blue/25"><Brain size={16} className="text-white" /></div><div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-blue border-2 border-bg-secondary animate-pulse" /></div>
                      <div className="px-4 py-3 rounded-2xl bg-bg-secondary border border-border-primary">
                        <div className="typing-wave flex gap-1 items-center h-5"><span className="w-1.5 h-1.5 rounded-full bg-accent-blue" /><span className="w-1.5 h-1.5 rounded-full bg-accent-purple" /><span className="w-1.5 h-1.5 rounded-full bg-accent-pink" /><span className="w-1.5 h-1.5 rounded-full bg-accent-blue" /><span className="w-1.5 h-1.5 rounded-full bg-accent-purple" /></div>
                        <p className="text-[9px] text-text-dim mt-1.5">{aiMode === 'build' ? 'Writing code...' : aiMode === 'plan' ? 'Designing architecture...' : aiMode === 'review' ? 'Reviewing code...' : aiMode === 'debug' ? 'Debugging...' : 'Explaining...'}</p>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border-primary bg-bg-secondary/90 backdrop-blur-md shrink-0">
              <AnimatePresence>{attachments.length > 0 && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="flex flex-wrap gap-1.5 mb-2 overflow-hidden">{attachments.map((a, i) => <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-elevated border border-border-primary text-[10px]"><FileCode size={10} className="text-accent-blue shrink-0" /><span className="text-text-secondary truncate max-w-[100px]">{a.name}</span><button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-text-dim hover:text-red-400 transition-colors"><X size={9} /></button></div>)}</motion.div>}</AnimatePresence>
              <div className="flex gap-2 items-end rounded-xl p-1 transition-all duration-300" style={inputFocused ? { boxShadow: '0 0 20px rgba(59,130,246,0.08)' } : {}}>
                <input ref={fileInputRef} type="file" multiple accept=".lua,.luau,.txt,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} title="Attach file" className="p-2.5 rounded-xl text-text-dim hover:text-text-primary hover:bg-bg-elevated transition-all shrink-0"><Paperclip size={15} /></button>
                <div className="flex-1 relative">
                  <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} placeholder={hasMessages ? "Follow up or ask something new..." : currentMode.id === 'build' ? "Describe what you want to build..." : currentMode.id === 'plan' ? "Describe what you want to design..." : currentMode.id === 'review' ? "Paste code to review..." : currentMode.id === 'debug' ? "Describe the bug or paste error..." : "Paste code or ask a question..."} rows={1} className={cn('w-full resize-none px-3.5 py-2.5 rounded-xl bg-bg-elevated border text-text-primary text-sm placeholder:text-text-dim focus:outline-none transition-all ai-input-focus', inputFocused ? 'border-accent-blue/50' : 'border-border-primary')} style={{ minHeight: '42px', maxHeight: '160px' }} />
                  <div className="absolute right-2 bottom-2 hidden sm:flex items-center gap-1"><kbd className="text-[8px] px-1 py-0.5 rounded bg-bg-secondary/60 text-text-dim font-mono flex items-center gap-0.5"><CornerDownLeft size={7} /> Enter</kbd></div>
                </div>
                <button onClick={() => sendMessage()} disabled={(!input.trim() && attachments.length === 0) || loading} className={cn('p-2.5 rounded-xl text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 active:scale-95', loading ? 'bg-accent-purple' : 'bg-gradient-to-r from-accent-blue to-accent-purple shadow-lg shadow-accent-blue/20')}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-[9px] text-text-dim flex items-center gap-1"><span className={cn('w-1.5 h-1.5 rounded-full', currentModel?.color)} /> {currentModel?.label}</span>
                <span className="text-[9px] text-text-dim opacity-50">{chatMessages.length} msgs</span>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden xl:flex flex-col gap-3 min-h-0 overflow-y-auto">
            <SidebarContent sidebarTab={sidebarTab} setSidebarTab={setSidebarTab} studioConnected={studioConnected} tokenInput={tokenInput} setTokenInput={setTokenInput} connectStudio={connectStudio} doDisconnect={doDisconnect} copiedPlugin={copiedPlugin} copyPluginScript={copyPluginScript} downloadPluginScript={downloadPluginScript} setShowPlugin={setShowPlugin} currentModel={currentModel} aiModel={aiModel} chatMessages={chatMessages} hasMessages={hasMessages} currentMode={currentMode} aiMode={aiMode} />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>{showMobileSidebar && <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden" onClick={() => setShowMobileSidebar(false)} /><motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed top-0 right-0 bottom-0 w-[340px] z-50 bg-bg-secondary border-l border-border-primary overflow-y-auto p-4 xl:hidden"><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-text-primary">AI Tools</h3><button onClick={() => setShowMobileSidebar(false)} className="p-1.5 rounded-lg text-text-dim hover:text-text-primary hover:bg-bg-elevated transition-colors"><X size={16} /></button></div><SidebarContent sidebarTab={sidebarTab} setSidebarTab={setSidebarTab} studioConnected={studioConnected} tokenInput={tokenInput} setTokenInput={setTokenInput} connectStudio={connectStudio} doDisconnect={doDisconnect} copiedPlugin={copiedPlugin} copyPluginScript={copyPluginScript} downloadPluginScript={downloadPluginScript} setShowPlugin={setShowPlugin} currentModel={currentModel} aiModel={aiModel} chatMessages={chatMessages} hasMessages={hasMessages} currentMode={currentMode} aiMode={aiMode} /></motion.div></>}</AnimatePresence>
      </motion.div>

      {/* Plugin Modal */}
      <AnimatePresence>{showPlugin && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowPlugin(false)}><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl" onClick={e => e.stopPropagation()}><div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border-primary bg-bg-secondary/95 backdrop-blur-sm z-10"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink flex items-center justify-center shadow-lg"><Puzzle size={16} className="text-white" /></div><div><h2 className="text-base font-bold text-text-primary">Studio Plugin v3.2</h2><p className="text-[10px] text-text-muted">Copy, paste into Command Bar, generate token</p></div></div><button onClick={() => setShowPlugin(false)} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"><X size={16} /></button></div><div className="px-6 py-5 space-y-4"><div className="grid grid-cols-2 gap-2">{[{ icon: Play, title: 'Generate Token', desc: 'One-click token generation' }, { icon: Copy, title: 'Inject Selection', desc: 'Clone Explorer selection to target' }, { icon: Code, title: 'New Script', desc: 'Create empty Script in target service' }, { icon: Eye, title: 'Open in Editor', desc: 'Open selected script for editing' }].map(f => { const Icon = f.icon; return <div key={f.title} className="flex gap-2 p-2.5 rounded-xl bg-bg-tertiary border border-border-primary"><div className="w-6 h-6 rounded-md bg-accent-blue/10 flex items-center justify-center shrink-0"><Icon size={11} className="text-accent-blue" /></div><div><div className="text-[10px] font-medium text-text-primary">{f.title}</div><div className="text-[9px] text-text-dim">{f.desc}</div></div></div> })}</div><div><div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-text-primary">Plugin Script</h3><div className="flex gap-1.5"><button onClick={copyPluginScript} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-[10px] font-medium hover:border-accent-blue/30 transition-all">{copiedPlugin ? <><Check size={10} className="text-green-400" /> Copied</> : <><Copy size={10} /> Copy</>}</button><button onClick={downloadPluginScript} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/25 text-[10px] font-medium hover:bg-accent-blue/25 transition-all"><Download size={10} /> .lua</button></div></div><CodeBlock code={PLUGIN_SCRIPT} lang="lua" /></div></div></motion.div></motion.div>}</AnimatePresence>
    </div>
  )
}

function SidebarContent({ sidebarTab, setSidebarTab, studioConnected, tokenInput, setTokenInput, connectStudio, doDisconnect, copiedPlugin, copyPluginScript, downloadPluginScript, setShowPlugin, currentModel, aiModel, chatMessages, hasMessages, currentMode, aiMode }: {
  sidebarTab: 'studio' | 'features' | 'tips'; setSidebarTab: (t: 'studio' | 'features' | 'tips') => void;
  studioConnected: boolean; tokenInput: string; setTokenInput: (v: string) => void;
  connectStudio: () => void; doDisconnect: () => void; copiedPlugin: boolean; copyPluginScript: () => void;
  downloadPluginScript: () => void; setShowPlugin: (v: boolean) => void;
  currentModel: typeof models[0] | undefined; aiModel: string;
  chatMessages: ChatMessage[]; hasMessages: boolean;
  currentMode: typeof aiModes[0]; aiMode: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 rounded-xl bg-bg-secondary border border-border-primary shrink-0">
        {([ { id: 'studio' as const, label: 'Plugin', icon: Puzzle }, { id: 'features' as const, label: 'AI', icon: Zap }, { id: 'tips' as const, label: 'Tips', icon: BookOpen } ]).map(tab => {
          const Icon = tab.icon; return <button key={tab.id} onClick={() => setSidebarTab(tab.id)} className={cn('flex-1 flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[10px] font-medium transition-all', sidebarTab === tab.id ? 'bg-accent-blue/15 text-accent-blue shadow-sm shadow-accent-blue/10' : 'text-text-muted hover:text-text-secondary')}><Icon size={10} /> {tab.label}</button>
        })}
      </div>

      {sidebarTab === 'studio' && <div className="space-y-3">
        <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
          <div className={cn('px-4 py-3 flex items-center gap-2.5', studioConnected ? 'bg-green-500/5 border-b border-green-500/10' : 'bg-bg-tertiary/50 border-b border-border-primary')}>
            <div className={cn('w-2.5 h-2.5 rounded-full', studioConnected ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse' : 'bg-yellow-400 animate-pulse')} />
            <div className="flex-1"><div className="text-xs font-semibold text-text-primary">{studioConnected ? 'Studio Connected' : 'Studio Offline'}</div><div className="text-[10px] text-text-dim">{studioConnected ? 'Token is paired' : 'Connect your Studio plugin'}</div></div>
            {studioConnected && <button onClick={doDisconnect} className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors">Disconnect</button>}
          </div>
          <div className="p-4 space-y-3">
            {!studioConnected ? <><div><label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Paste Token from Studio</label><input type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-[11px] font-mono focus:outline-none focus:border-accent-blue/50 placeholder:text-text-dim" /></div><button onClick={connectStudio} disabled={!tokenInput.trim()} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xs font-bold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-blue/20">Connect to Studio</button></> : <button onClick={doDisconnect} className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors">Disconnect Studio</button>}
            <div className="space-y-1.5 pt-1"><div className="text-[9px] text-text-dim font-semibold uppercase tracking-wider">Setup Guide</div>{[{ step: 1, text: 'Copy plugin script below', done: false }, { step: 2, text: 'Paste into Studio Command Bar', done: false }, { step: 3, text: 'Click "Generate Token" in plugin GUI', done: false }, { step: 4, text: 'Paste token here and click Connect', done: studioConnected }].map(s => <div key={s.step} className="flex items-start gap-2"><div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[7px] font-bold', s.done ? 'bg-green-500/20 text-green-400' : 'bg-accent-blue/15 text-accent-blue')}>{s.done ? <Check size={8} /> : s.step}</div><span className={cn('text-[10px] leading-tight', s.done ? 'text-green-400' : 'text-text-secondary')}>{s.text}</span></div>)}</div>
          </div>
        </div>
        <div className="rounded-2xl bg-bg-secondary border border-border-primary p-4 space-y-2">
          <div className="flex gap-2"><button onClick={copyPluginScript} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-[10px] font-medium hover:border-accent-blue/30 hover:text-text-primary transition-all">{copiedPlugin ? <><Check size={10} className="text-green-400" /> Copied</> : <><Copy size={10} /> Copy Plugin</>}</button><button onClick={downloadPluginScript} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/25 text-[10px] font-medium hover:bg-accent-blue/25 transition-all"><Download size={10} /> Download</button></div>
          <button onClick={() => setShowPlugin(true)} className="w-full flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-dim text-[10px] hover:text-text-primary hover:border-border-hover transition-all"><Eye size={10} /> View Plugin Code</button>
        </div>
      </div>}

      {sidebarTab === 'features' && <div className="space-y-3">
        <div className="rounded-2xl bg-bg-secondary border border-border-primary p-4">
          <h3 className="text-xs font-semibold text-text-primary mb-2.5">Current Mode: {currentMode.emoji} {currentMode.label}</h3>
          <p className="text-[10px] text-text-muted mb-3">{currentMode.desc}</p>
          <h3 className="text-xs font-semibold text-text-primary mb-2.5">What I Can Do</h3>
          <div className="space-y-2.5">
            {[{ icon: Code, title: 'Luau Scripts', desc: 'Complete, working production code', color: 'text-blue-400' }, { icon: Blocks, title: 'GUI Systems', desc: 'Full ScreenGui hierarchies with tweens', color: 'text-purple-400' }, { icon: Rocket, title: 'Game Systems', desc: 'Combat, inventory, quests, trading', color: 'text-green-400' }, { icon: Shield, title: 'Security', desc: 'Anti-cheat, validation, server auth', color: 'text-red-400' }, { icon: Zap, title: 'Optimization', desc: 'Memory, performance, profiling', color: 'text-yellow-400' }, { icon: Wrench, title: 'Bug Fixes', desc: 'Debug and fix any Luau code', color: 'text-orange-400' }].map(f => { const Icon = f.icon; return <div key={f.title} className="flex gap-2.5 group"><div className="w-7 h-7 rounded-lg bg-bg-elevated border border-border-primary flex items-center justify-center shrink-0 group-hover:border-accent-blue/30 transition-colors"><Icon size={12} className={f.color} /></div><div><div className="text-[11px] font-medium text-text-primary">{f.title}</div><div className="text-[9px] text-text-dim">{f.desc}</div></div></div> })}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border border-accent-blue/15 p-4">
          <h3 className="text-xs font-semibold text-text-primary mb-2">Current Model</h3>
          <div className="flex items-center gap-2"><span className="text-lg">{currentModel?.emoji}</span><div><span className="text-[11px] text-text-secondary font-medium">{currentModel?.label || aiModel}</span>{currentModel?.badge && <span className="text-[8px] px-1 py-0.5 rounded bg-accent-blue/15 text-accent-blue font-bold ml-1">{currentModel.badge}</span>}<div className="text-[9px] text-text-dim">{currentModel?.desc}</div></div></div>
        </div>
      </div>}

      {sidebarTab === 'tips' && <div className="space-y-3">
        <div className="rounded-2xl bg-bg-secondary border border-border-primary p-4">
          <h3 className="text-xs font-semibold text-text-primary mb-2.5 flex items-center gap-1.5"><BookOpen size={11} className="text-accent-blue" /> Pro Tips</h3>
          <div className="space-y-2">
            {[`In ${currentMode.label} mode, the AI ${aiMode === 'build' ? 'writes complete scripts' : aiMode === 'plan' ? 'designs architectures' : aiMode === 'review' ? 'finds issues and suggests fixes' : aiMode === 'debug' ? 'finds and fixes bugs' : 'explains code line by line'}.`, 'Be specific about what you want for better results', 'Paste existing code for review or debugging', 'Ask follow-up questions to refine the output', 'Switch modes for different types of help'].map((tip, i) => <div key={i} className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-accent-blue mt-1.5 shrink-0" /><span className="text-[10px] text-text-secondary leading-relaxed">{tip}</span></div>)}
          </div>
        </div>
        <div className="rounded-2xl bg-bg-secondary border border-border-primary p-4">
          <h3 className="text-xs font-semibold text-text-primary mb-2.5 flex items-center gap-1.5"><Terminal size={11} className="text-accent-blue" /> Shortcuts</h3>
          <div className="space-y-1.5">{[['Enter', 'Send'], ['Shift+Enter', 'New line'], ['Ctrl+V', 'Paste code']].map(([key, action]) => <div key={key} className="flex items-center justify-between"><span className="text-[10px] text-text-muted">{action}</span><kbd className="text-[8px] px-1.5 py-0.5 rounded bg-bg-elevated border border-border-primary text-text-dim font-mono">{key}</kbd></div>)}</div>
        </div>
        {hasMessages && <div className="rounded-2xl bg-bg-secondary border border-border-primary p-4">
          <h3 className="text-xs font-semibold text-text-primary mb-2">Session Stats</h3>
          <div className="space-y-1.5">{[['Messages', chatMessages.length], ['Your Messages', chatMessages.filter(m => m.role === 'user').length], ['AI Responses', chatMessages.filter(m => m.role === 'assistant').length], ['Model', currentModel?.label]].map(([l, v]) => <div key={String(l)} className="flex justify-between text-[10px]"><span className="text-text-dim">{String(l)}</span><span className="text-text-secondary font-medium">{String(v)}</span></div>)}</div>
        </div>}
      </div>}

      <div className="shrink-0 flex justify-center"><AdBanner type="rectangle" /></div>
    </div>
  )
}

function getSystemPrompt(mode: string): string {
  const base = `You are Yobest AI, a Roblox Studio Luau coding assistant.

## CORE BEHAVIOR — ALL MODES

### Ask Before Writing (CRITICAL)
When a user request is VAGUE or UNDETAILED (less than ~3 specific details), you MUST ask 2-4 clarifying questions BEFORE writing any code. This makes you feel like a real developer assistant.

Examples of vague requests that need questions:
- "make a combat system" → Ask: What type? Melee/ranged/magic? How many players? HP system? Visual effects?
- "fix my code" → Ask: What is the error message? What line? What were you expecting vs what happened?
- "create a GUI" → Ask: What kind? Main menu? Shop? HUD? What buttons/elements? What theme?

Examples of SPECIFIC requests (no questions needed):
- "Create a DataStore wrapper with retry logic for a 4-player obby with coin saving" → Just build it
- "This code gives error on line 42: attempt to index nil. Here is the code: [code]" → Just fix it

When you DO ask questions, format them like this:
Before I write this, I have a few questions:
1. [Question 1]
2. [Question 2]
3. [Question 3]

Answer these and I will build exactly what you need.

### Code Formatting
- ALL code MUST be inside triple backtick luau blocks:
\`\`\`luau
code here
\`\`\`
- NEVER output raw code outside of backtick blocks

### Separator Lines (FORBIDDEN)
- NEVER use ---, ===, ***, ___, ~~~, or ### as separators
- Use blank lines instead

### Headers and Formatting
- NEVER use ## or ### markdown headers
- NEVER use **bold** text
- NEVER use emoji
- Use plain text like: "Place this in ServerScriptService:"
- Use plain text like: "How it works:" followed by bullet points with -

### Code Quality
- Every script starts with ALL game:GetService() calls cached at top
- Every variable declared with local before use
- Every DataStore call wrapped in pcall
- Use task.wait(), task.spawn(), task.delay() — never wait() or spawn()
- Script must be syntactically correct complete Luau
- Never truncate code with ... or similar`

  const modes: Record<string, string> = {
    build: `${base}

## MODE: BUILD
You are in BUILD mode. Your job is to write complete, working, production-ready Luau scripts.

When the user gives you a specific request, write the ENTIRE script — no placeholders, no "add your code here". Every function must be fully implemented.

RESPONSE FORMAT:
1-2 sentences explaining what this does.

Place this in ServerScriptService:

\`\`\`luau
-- complete working script
\`\`\`

- How to use it: (3-5 bullet points starting with -)`,

    plan: `${base}

## MODE: PLAN
You are in PLAN mode. Your job is to DESIGN game architecture, system structures, and technical plans. Do NOT write full scripts — instead, create detailed plans that a developer can follow.

Your responses should include:
- System overview (what it does, how parts connect)
- Folder structure in Roblox Studio
- Module breakdown (what each ModuleScript does)
- Data flow (what goes through RemoteEvents vs DataStore)
- Key technical decisions and why
- Step-by-step implementation order

RESPONSE FORMAT:
[2-3 sentence overview]

Architecture:
- [System components and how they connect]

Folder Structure:
[Roblox hierarchy]

Implementation Order:
1. [First thing to build]
2. [Second thing]
...

Key Decisions:
- [Technical choice] because [reason]`,

    review: `${base}

## MODE: REVIEW
You are in REVIEW mode. Your job is to AUDIT existing Luau code for:
- Bugs and logic errors
- Security vulnerabilities (exploit vectors, trust issues)
- Performance problems (memory leaks, slow patterns)
- Code quality (naming, structure, readability)
- Roblox-specific anti-patterns

Do NOT rewrite the entire code. Instead:
1. List each issue found with severity (Critical/High/Medium/Low)
2. Show the problematic code snippet
3. Explain WHY it is a problem
4. Show the EXACT fix (just the changed lines)

RESPONSE FORMAT:
Found [N] issues:

1. [Severity] Issue Title
   Code: [the problematic lines]
   Problem: [why this is bad]
   Fix: [the corrected code]

... repeat for each issue

Summary: [1-2 sentences about overall code quality]`,

    debug: `${base}

## MODE: DEBUG
You are in DEBUG mode. Your job is to FIND AND FIX bugs in Luau code.

When debugging:
1. Read the code carefully
2. Identify the root cause of the bug
3. Explain WHAT is wrong and WHY
4. Show the ENTIRE corrected script (not just the fix)
5. Explain how to prevent this bug in the future

If the user only describes a problem without code, ask:
- What is the exact error message?
- What line does the error occur on?
- What were you trying to do?

RESPONSE FORMAT:
The bug is: [1-sentence explanation]

What was wrong:
[Detailed explanation of the root cause]

Here is the fixed script:
\`\`\`luau
-- entire corrected script
\`\`\`

How to prevent this:
- [Tip 1]
- [Tip 2]`,

    explain: `${base}

## MODE: EXPLAIN
You are in EXPLAIN mode. Your job is to TEACH and EXPLAIN Luau code and Roblox concepts.

When explaining code:
1. Give a high-level overview of what the code does
2. Break it into logical sections
3. Explain each section in plain English
4. Show how sections connect
5. Highlight important patterns or techniques used

When explaining concepts:
1. Start with a simple analogy
2. Explain the technical details
3. Give a concrete Roblox example
4. Show common usage patterns

RESPONSE FORMAT:
What this does: [1-2 sentence overview]

How it works:
[Section-by-section breakdown]

Key Concepts:
- [Important concept 1]: [explanation]
- [Important concept 2]: [explanation]

Usage Tips:
- [Tip 1]
- [Tip 2]`
  }

  return modes[mode] || modes.build
}
