import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Send, Loader2, Wifi, WifiOff, Copy, Check, Sparkles, Code, Blocks,
  Rocket, Settings, Paperclip, X, FileCode, Trash2, Download, Zap,
  BookOpen, Terminal, History, ExternalLink, Play, Wrench,
  Shield, Puzzle, ChevronDown, Eye, RotateCcw,
  ArrowUp, CornerDownLeft, Maximize2, Minimize2, CircleDot, AlertTriangle
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { trackAiSession } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'
import AdBanner from '@/components/AdBanner'

const models = [
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', badge: 'Fast', color: 'text-green-400', desc: 'Lightning-fast responses' },
  { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', badge: 'Smart', color: 'text-blue-400', desc: 'Deep reasoning & analysis' },
  { id: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash', badge: 'New', color: 'text-cyan-400', desc: 'Next-gen speed' },
  { id: 'google/gemini-3-pro-preview', label: 'Gemini 3 Pro', badge: 'New', color: 'text-purple-400', desc: 'Most capable model' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', badge: '', color: 'text-emerald-400', desc: 'Versatile & reliable' },
  { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4', badge: '', color: 'text-orange-400', desc: 'Detailed & creative' },
]

const quickActions = [
  { label: 'Build a Script', prompt: 'Create a complete Luau script for: ', icon: Code, gradient: 'from-blue-500/20 to-cyan-500/20' },
  { label: 'Fix Bug', prompt: 'Find and fix the bug in this code. Explain what was wrong and show the ENTIRE corrected script:', icon: Wrench, gradient: 'from-red-500/20 to-orange-500/20' },
  { label: 'Explain Code', prompt: 'Explain this code line by line. What does each part do?', icon: BookOpen, gradient: 'from-green-500/20 to-emerald-500/20' },
  { label: 'Optimize', prompt: 'Optimize this code for better performance. Reduce memory usage and improve speed:', icon: Zap, gradient: 'from-yellow-500/20 to-amber-500/20' },
  { label: 'Design System', prompt: 'Design a complete game system with server and client scripts. Include RemoteEvents, DataStore, and UI:', icon: Rocket, gradient: 'from-purple-500/20 to-pink-500/20' },
  { label: 'Convert Format', prompt: 'Convert this code to a proper ModuleScript pattern with clean API:', icon: Blocks, gradient: 'from-indigo-500/20 to-violet-500/20' },
]

const suggestedPrompts = [
  { category: 'Scripts', icon: Code, prompts: [
    { text: 'Create a leaderboard system with DataStore persistence, weekly resets, and sort by wins', hot: true },
    { text: 'Build a sword combat system with cooldowns, damage, hit detection, and visual effects' },
    { text: 'Make an inventory system with item stacking, saving to DataStore, and equip/unequip' },
    { text: 'Create a round-based game loop with intermission, scoring, team assignment, and win condition' },
    { text: 'Build a trading system with offer/accept/decline flow and anti-scam protection' },
  ]},
  { category: 'UI', icon: Blocks, prompts: [
    { text: 'Design a main menu GUI with animated buttons, hover tweens, and smooth transitions', hot: true },
    { text: 'Create a shop interface with product cards, purchase flow, currency display, and receipts' },
    { text: 'Build a settings panel with toggles, sliders, keybind remapping, and dropdown menus' },
    { text: 'Make a responsive HUD with health bar, XP bar, level display, and popup notifications' },
    { text: 'Create a dialog system with typewriter text effect, player choices, and NPC portraits' },
  ]},
  { category: 'Systems', icon: Rocket, prompts: [
    { text: 'Create a pet system with stats, leveling, feeding, evolution, and follow behavior', hot: true },
    { text: 'Build a day/night cycle with dynamic lighting, weather effects, and ambient sounds' },
    { text: 'Make a farming system with crop growth stages, watering, harvesting, and selling crops' },
    { text: 'Create a quest system with objectives tracking, quest log UI, rewards, and NPC interaction' },
    { text: 'Build a crafting system with recipes, material requirements, and crafting stations' },
  ]},
  { category: 'Security', icon: Shield, prompts: [
    { text: 'Create an anti-cheat system with server-side sanity checks, speed detection, and logging', hot: true },
    { text: 'Build a remote validation layer with rate limiting, input sanitization, and session tokens' },
    { text: 'Make a secure DataStore wrapper with retry logic, fallbacks, backup keys, and error logging' },
    { text: 'Create a server-authoritative movement validation system with lag compensation' },
  ]},
]

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

-- GENERATE BUTTON (BIG)
local btnGen = Instance.new("TextButton")
btnGen.Size = UDim2.new(1, 0, 0, 48)
btnGen.BackgroundColor3 = Color3.fromRGB(59, 130, 246)
btnGen.TextColor3 = Color3.fromRGB(255, 255, 255)
btnGen.Font = Enum.Font.GothamBold
btnGen.TextSize = 16
btnGen.Text = "Generate Token"
btnGen.AutoButtonColor = true
btnGen.LayoutOrder = 3
btnGen.Parent = main
local bgc = Instance.new("UICorner")
bgc.CornerRadius = UDim.new(0, 12)
bgc.Parent = btnGen

-- TOKEN DISPLAY
local tokenFrame = Instance.new("Frame")
tokenFrame.Size = UDim2.new(1, 0, 0, 44)
tokenFrame.BackgroundColor3 = Color3.fromRGB(18, 18, 35)
tokenFrame.BorderSizePixel = 0
tokenFrame.LayoutOrder = 4
tokenFrame.Parent = main
local tfc = Instance.new("UICorner")
tfc.CornerRadius = UDim.new(0, 10)
tfc.Parent = tokenFrame
local tfs = Instance.new("UIStroke")
tfs.Color = Color3.fromRGB(35, 35, 60)
tfs.Thickness = 1
tfs.Parent = tokenFrame

local tokenBox = Instance.new("TextBox")
tokenBox.Size = UDim2.new(1, -20, 1, 0)
tokenBox.Position = UDim2.new(0, 10, 0, 0)
tokenBox.BackgroundTransparency = 1
tokenBox.TextColor3 = Color3.fromRGB(160, 180, 210)
tokenBox.Font = Enum.Font.Code
tokenBox.TextSize = 13
tokenBox.PlaceholderText = "Click Generate Token above..."
tokenBox.PlaceholderColor3 = Color3.fromRGB(60, 70, 90)
tokenBox.Text = ""
tokenBox.TextXAlignment = Enum.TextXAlignment.Left
tokenBox.ClearTextOnFocus = false
tokenBox.Parent = tokenFrame

-- COPY BUTTON
local btnCopy = Instance.new("TextButton")
btnCopy.Size = UDim2.new(1, 0, 0, 38)
btnCopy.BackgroundColor3 = Color3.fromRGB(25, 30, 45)
btnCopy.TextColor3 = Color3.fromRGB(148, 163, 184)
btnCopy.Font = Enum.Font.GothamBold
btnCopy.TextSize = 13
btnCopy.Text = "Copy Token to Clipboard"
btnCopy.AutoButtonColor = true
btnCopy.LayoutOrder = 5
btnCopy.Parent = main
local bcc = Instance.new("UICorner")
bcc.CornerRadius = UDim.new(0, 10)
bcc.Parent = btnCopy

-- TARGET SELECTOR
local targetFrame = Instance.new("Frame")
targetFrame.Size = UDim2.new(1, 0, 0, 36)
targetFrame.BackgroundTransparency = 1
targetFrame.LayoutOrder = 6
targetFrame.Parent = main

local tlabel = Instance.new("TextLabel")
tlabel.Size = UDim2.new(0.22, 0, 1, 0)
tlabel.BackgroundTransparency = 1
tlabel.TextColor3 = Color3.fromRGB(80, 90, 110)
tlabel.Font = Enum.Font.GothamMedium
tlabel.TextSize = 12
tlabel.Text = "Target:"
tlabel.TextXAlignment = Enum.TextXAlignment.Left
tlabel.Parent = targetFrame

local targetBtn = Instance.new("TextButton")
targetBtn.Size = UDim2.new(0.76, 0, 1, 0)
targetBtn.Position = UDim2.new(0.24, 0, 0, 0)
targetBtn.BackgroundColor3 = Color3.fromRGB(18, 18, 35)
targetBtn.TextColor3 = Color3.fromRGB(180, 190, 210)
targetBtn.Font = Enum.Font.GothamMedium
targetBtn.TextSize = 12
targetBtn.Text = "ServerScriptService"
targetBtn.AutoButtonColor = true
targetBtn.Parent = targetFrame
local tgtc = Instance.new("UICorner")
tgtc.CornerRadius = UDim.new(0, 8)
tgtc.Parent = targetBtn

local targets = {"ServerScriptService", "StarterPlayerScripts", "ReplicatedStorage", "ServerStorage", "Workspace"}
local currentTarget = 1

-- POLLING STATUS
local pollFrame = Instance.new("Frame")
pollFrame.Size = UDim2.new(1, 0, 0, 30)
pollFrame.BackgroundColor3 = Color3.fromRGB(14, 14, 30)
pollFrame.BorderSizePixel = 0
pollFrame.LayoutOrder = 7
pollFrame.Parent = main
local pfc = Instance.new("UICorner")
pfc.CornerRadius = UDim.new(0, 10)
pfc.Parent = pollFrame

local pollDot = Instance.new("Frame")
pollDot.Size = UDim2.new(0, 8, 0, 8)
pollDot.Position = UDim2.new(0, 12, 0.5, -4)
pollDot.BackgroundColor3 = Color3.fromRGB(100, 100, 120)
pollDot.Parent = pollFrame
local pdc = Instance.new("UICorner")
pdc.CornerRadius = UDim.new(1, 0)
pdc.Parent = pollDot

local pollLabel = Instance.new("TextLabel")
pollLabel.Size = UDim2.new(1, -30, 1, 0)
pollLabel.Position = UDim2.new(0, 28, 0, 0)
pollLabel.BackgroundTransparency = 1
pollLabel.TextColor3 = Color3.fromRGB(80, 90, 110)
pollLabel.Font = Enum.Font.GothamMedium
pollLabel.TextSize = 11
pollLabel.Text = "Auto-inject: Waiting for token..."
pollLabel.TextXAlignment = Enum.TextXAlignment.Left
pollLabel.Parent = pollFrame

-- ACTION BUTTONS
local sep1 = Instance.new("Frame")
sep1.Size = UDim2.new(1, 0, 0, 1)
sep1.BackgroundColor3 = Color3.fromRGB(30, 30, 55)
sep1.BorderSizePixel = 0
sep1.LayoutOrder = 8
sep1.Parent = main

local actFrame = Instance.new("Frame")
actFrame.Size = UDim2.new(1, 0, 0, 0)
actFrame.BackgroundTransparency = 1
actFrame.AutomaticSize = Enum.AutomaticSize.Y
actFrame.LayoutOrder = 9
actFrame.Parent = main

local actLayout = Instance.new("UIListLayout")
actLayout.SortOrder = Enum.SortOrder.LayoutOrder
actLayout.Padding = UDim.new(0, 6)
actLayout.Parent = actFrame

local function makeActBtn(parent, text, color, order)
    local b = Instance.new("TextButton")
    b.Size = UDim2.new(1, 0, 0, 36)
    b.BackgroundColor3 = color
    b.TextColor3 = Color3.fromRGB(255, 255, 255)
    b.Font = Enum.Font.GothamBold
    b.TextSize = 13
    b.Text = text
    b.AutoButtonColor = true
    b.LayoutOrder = order
    b.Parent = parent
    local c = Instance.new("UICorner")
    c.CornerRadius = UDim.new(0, 10)
    c.Parent = b
    return b
end

local btnNewScript = makeActBtn(actFrame, "Create New Empty Script", Color3.fromRGB(100, 60, 180), 1)
local btnOpen = makeActBtn(actFrame, "Open Selected in Editor", Color3.fromRGB(40, 90, 160), 2)
local btnClear = makeActBtn(actFrame, "Clear Explorer Selection", Color3.fromRGB(160, 40, 40), 3)

-- LOG
local sep2 = Instance.new("Frame")
sep2.Size = UDim2.new(1, 0, 0, 1)
sep2.BackgroundColor3 = Color3.fromRGB(30, 30, 55)
sep2.BorderSizePixel = 0
sep2.LayoutOrder = 10
sep2.Parent = main

local logFrame = Instance.new("ScrollingFrame")
logFrame.Size = UDim2.new(1, 0, 1, -400)
logFrame.BackgroundTransparency = 1
logFrame.BorderSizePixel = 0
logFrame.ScrollBarThickness = 3
logFrame.ScrollBarImageColor3 = Color3.fromRGB(59, 130, 246)
logFrame.CanvasSize = UDim2.new(0, 0, 0, 0)
logFrame.AutomaticCanvasSize = Enum.AutomaticSize.Y
logFrame.LayoutOrder = 11
logFrame.Parent = main

local logLayout = Instance.new("UIListLayout")
logLayout.SortOrder = Enum.SortOrder.LayoutOrder
logLayout.Padding = UDim.new(0, 2)
logLayout.Parent = logFrame

local logCount = 0
local function addLog(text, color)
    logCount = logCount + 1
    local l = Instance.new("TextLabel")
    l.Size = UDim2.new(1, 0, 0, 0)
    l.AutomaticSize = Enum.AutomaticSize.Y
    l.BackgroundTransparency = 1
    l.TextColor3 = color or Color3.fromRGB(90, 100, 120)
    l.Font = Enum.Font.Code
    l.TextSize = 10
    l.TextWrapped = true
    l.TextXAlignment = Enum.TextXAlignment.Left
    l.Text = text
    l.LayoutOrder = logCount
    l.Parent = logFrame
end

-- LOGIC
local currentToken = nil
local isPolling = false
local pollConnection = nil

addLog("[Plugin] v3.2 loaded. Auto-inject enabled.", Color3.fromRGB(59, 130, 246))
addLog("[Steps] Generate token -> Paste in Yobest web -> Code auto-creates scripts", Color3.fromRGB(100, 110, 130))

local function getTarget()
    local name = targets[currentTarget]
    if name == "ServerScriptService" then
        return ServerScriptService
    elseif name == "StarterPlayerScripts" then
        return game:GetService("StarterPlayer"):FindFirstChild("StarterPlayerScripts")
    elseif name == "ReplicatedStorage" then
        return game:GetService("ReplicatedStorage")
    elseif name == "ServerStorage" then
        return game:GetService("ServerStorage")
    elseif name == "Workspace" then
        return workspace
    end
    return nil
end

local function injectCode(code, scriptName)
    local target = getTarget()
    if not target then
        addLog("[Inject] Target not found!", Color3.fromRGB(220, 50, 50))
        return false
    end

    local ok, err = pcall(function()
        local newScript = Instance.new("Script")
        newScript.Name = scriptName or "YobestAI_Script"
        newScript.Source = code
        newScript.Parent = target
        return newScript
    end)

    if ok and typeof(ok) == "Instance" then
        addLog("[Inject] Created: " .. ok:GetFullName(), Color3.fromRGB(34, 197, 94))
        pcall(function()
            if plugin and plugin.OpenScript then
                plugin:OpenScript(ok)
                addLog("[Inject] Opened in editor.", Color3.fromRGB(34, 197, 94))
            else
                Selection:Set({ok})
                addLog("[Inject] Selected in Explorer. Double-click to open.", Color3.fromRGB(234, 179, 8))
            end
        end)
        return true
    else
        addLog("[Inject] Error: " .. tostring(err), Color3.fromRGB(220, 50, 50))
        return false
    end
end

local function pollForCode()
    if not currentToken or not isPolling then return end

    local ok, result = pcall(function()
        local req = HttpService:RequestAsync({
            Url = SUPABASE_URL .. "/functions/v1/studio-deploy?token=" .. currentToken,
            Method = "GET",
            Headers = {
                ["Authorization"] = "Bearer " .. ANON_KEY,
                ["Content-Type"] = "application/json",
            },
        })
        if req.Success then
            return HttpService:JSONDecode(req.Body)
        end
        return nil
    end)

    if ok and result and not result.idle then
        local code = result.code
        local name = result.script_name or "YobestAI_Script"
        addLog("[Poll] Received: " .. name .. " (" .. #code .. " chars)", Color3.fromRGB(139, 92, 246))
        injectCode(code, name)
    end
end

local function startPolling()
    if pollConnection then
        pollConnection:Disconnect()
        pollConnection = nil
    end
    isPolling = true
    pollDot.BackgroundColor3 = Color3.fromRGB(34, 197, 94)
    pollLabel.Text = "Auto-inject: Polling every " .. POLL_INTERVAL .. "s..."

    -- Poll immediately, then on interval
    pcall(pollForCode)

    pollConnection = game:GetService("RunService").Heartbeat:Connect(function()
        -- Simple timer-based polling
    end)

    -- Use a while loop in a separate thread
    task.spawn(function()
        while isPolling and currentToken do
            pcall(pollForCode)
            task.wait(POLL_INTERVAL)
        end
    end)

    addLog("[Poll] Started auto-inject polling.", Color3.fromRGB(34, 197, 94))
end

local function stopPolling()
    isPolling = false
    pollDot.BackgroundColor3 = Color3.fromRGB(100, 100, 120)
    pollLabel.Text = "Auto-inject: Stopped"
    if pollConnection then
        pollConnection:Disconnect()
        pollConnection = nil
    end
end

targetBtn.MouseButton1Click:Connect(function()
    currentTarget = currentTarget + 1
    if currentTarget > #targets then currentTarget = 1 end
    targetBtn.Text = targets[currentTarget]
end)

closeBtn.MouseButton1Click:Connect(function()
    stopPolling()
    screen:Destroy()
end)

btnGen.MouseButton1Click:Connect(function()
    currentToken = HttpService:GenerateGUID(false)
    tokenBox.Text = currentToken
    dot.BackgroundColor3 = Color3.fromRGB(34, 197, 94)
    statusLabel.Text = "Token ready! Paste in Yobest AI web."
    addLog("[Token] Generated!", Color3.fromRGB(34, 197, 94))

    -- Auto-start polling
    startPolling()
end)

btnCopy.MouseButton1Click:Connect(function()
    if currentToken then
        local ok = pcall(function() setclipboard(currentToken) end)
        if ok then
            addLog("[Token] Copied! Paste into Yobest AI web.", Color3.fromRGB(34, 197, 94))
            statusLabel.Text = "Copied! Paste in Yobest AI web and click Connect"
        else
            addLog("[Token] Copy failed. Select and copy manually.", Color3.fromRGB(234, 179, 8))
        end
    else
        addLog("[Token] Click Generate Token first!", Color3.fromRGB(234, 179, 8))
    end
end)

btnNewScript.MouseButton1Click:Connect(function()
    local target = getTarget()
    if not target then
        addLog("[Script] Target not found!", Color3.fromRGB(220, 50, 50))
        return
    end

    local newScript = Instance.new("Script")
    newScript.Name = "YobestAI_Script"
    newScript.Parent = target
    addLog("[Script] Created empty script in " .. targets[currentTarget], Color3.fromRGB(139, 92, 246))

    pcall(function()
        if plugin and plugin.OpenScript then
            plugin:OpenScript(newScript)
        else
            Selection:Set({newScript})
        end
    end)

    statusLabel.Text = "Created " .. targets[currentTarget] .. "/YobestAI_Script"
end)

btnOpen.MouseButton1Click:Connect(function()
    local sel = Selection:Get()
    if #sel == 0 then
        addLog("[Open] Select a Script first.", Color3.fromRGB(234, 179, 8))
        return
    end

    local obj = sel[1]
    if obj:IsA("LuaSourceContainer") then
        local s, e = pcall(function()
            if plugin and plugin.OpenScript then
                plugin:OpenScript(obj)
            end
        end)
        if s then
            addLog("[Open] " .. obj:GetFullName(), Color3.fromRGB(59, 130, 246))
        else
            addLog("[Open] Double-click in Explorer to open.", Color3.fromRGB(234, 179, 8))
        end
    else
        addLog("[Open] " .. obj.Name .. " is not a script.", Color3.fromRGB(234, 179, 8))
    end
end)

btnClear.MouseButton1Click:Connect(function()
    Selection:Set({})
    addLog("[Selection] Cleared.", Color3.fromRGB(100, 110, 130))
end)

print("==========================================")
print("  Yobest AI Studio Plugin v3.2 loaded!")
print("  Auto-inject is enabled.")
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
        setInjected(true)
        setTimeout(() => setInjected(false), 3000)
      } else {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } finally {
      setInjecting(false)
    }
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
          <button onClick={() => setExpanded(!expanded)} className="p-1 rounded text-[#6e7681] hover:text-white transition-colors" title={expanded ? 'Collapse' : 'Expand'}>
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

    // Strip trailing truncation markers
    raw = raw.replace(/\.{3,}\s*$/g, '')
    raw = raw.replace(/…\s*$/g, '')
    raw = raw.replace(/\.{3,}\s*\n*$/g, '')

    // Strip ALL markdown formatting markers
    raw = raw.replace(/\*{3}(.+?)\*{3}/g, '$1')  // ***bold italic***
    raw = raw.replace(/\*{2}(.+?)\*{2}/g, '$1')  // **bold**
    raw = raw.replace(/_{3}(.+?)_{3}/g, '$1')    // ___bold italic___
    raw = raw.replace(/_{2}(.+?)_{2}/g, '$1')    // __bold__

    // Strip inline horizontal rules between words (e.g. "word --- word")
    raw = raw.replace(/(\S)\s*---\s*(\S)/g, '$1 — $2')
    raw = raw.replace(/(\S)\s*===\s*(\S)/g, '$1 = $2')
    raw = raw.replace(/(\S)\s*\*\*\*\s*(\S)/g, '$1 $2')

    // Strip trailing ... on EVERY line (not just last)
    raw = raw.replace(/\.{3,}\s*$/gm, '')
    raw = raw.replace(/…\s*$/gm, '')

    // Split into lines
    const allLines = raw.split('\n')
    const elements: React.ReactNode[] = []
    let codeBuf: string[] = []

    const flushCodeBuf = () => {
      if (codeBuf.length > 0) {
        elements.push(
          <CodeBlock key={`code-${elements.length}`} code={codeBuf.join('\n')} lang="luau" />
        )
        codeBuf = []
      }
    }

    const isSeparator = (l: string): boolean => {
      const t = l.trim()
      if (t.length === 0) return false
      // Empty or whitespace only
      if (/^\s*$/.test(t)) return false
      // Pure repeated special chars: ---, ===, ***, ___, ~~~, ###, etc.
      // Also handles spaced versions: - - -, * * *, = = =
      const stripped = t.replace(/[\s]/g, '')
      if (stripped.length >= 3 && /^[-=*_.~#░▒▓█─━═║╔╗╚╝╠╣╦╩╬]+$/.test(stripped)) return true
      // Lines that are mostly special chars (80%+)
      const specialCount = (t.match(/[-=*_.~#░▒▓█─━═║╔╗╚╝╠╣╦╩╬\u2500\u2501\u2550\u2551\u2554\u2557\u255A\u255D\u2560\u2563\u2566\u2569\u256C]/g) || []).length
      if (specialCount >= t.length * 0.8 && t.length >= 3) return true
      // Pattern like "- - -" or "* * *"
      if (/^([-=*#~])\1*(\s+\1+)+$/.test(t)) return true
      return false
    }

    const isCodeLine = (l: string): boolean => {
      const t = l.trim()
      if (t.length === 0) return codeBuf.length > 0
      // Definitely code patterns
      if (/^local\s+/.test(t)) return true
      if (/^game:GetService\b/.test(t)) return true
      if (/^[A-Z][a-zA-Z]+Service\b/.test(t)) return true
      if (/^function\s/.test(t)) return true
      if (/^return\s/.test(t)) return true
      if (/^pcall\s*\(/.test(t)) return true
      if (/^xpcall\s*\(/.test(t)) return true
      if (/^task\.(wait|spawn|delay|defer|schedule)/.test(t)) return true
      if (/^Instance\.new\b/.test(t)) return true
      if (/^game\.\w/.test(t)) return true
      if (/^workspace\.\w/.test(t)) return true
      if (/^plugin:\w/.test(t)) return true
      if (/^setclipboard\b/.test(t)) return true
      if (/^end$/.test(t)) return true
      if (/^then$/.test(t)) return true
      if (/^else$/.test(t)) return true
      if (/^elseif\s/.test(t)) return true
      if (/^do$/.test(t)) return true
      if (/^repeat$/.test(t)) return true
      if (/^until\s/.test(t)) return true
      if (/^break$/.test(t)) return true
      if (/^continue$/.test(t)) return true
      if (/^if\s+.*\bthen\b/.test(t)) return true
      if (/^for\s+.*\bdo\b/.test(t)) return true
      if (/^while\s+.*\bdo\b/.test(t)) return true
      if (/^local\s+\w+\s*=\s*\{/.test(t)) return true
      if (/^[A-Z][a-zA-Z]+\.new\b/.test(t)) return true
      if (/^[a-z]\w+\.[A-Z]\w+/.test(t)) return true
      if (/^\)\s*$/.test(t)) return true
      if (/^--/.test(t)) return true
      // Indented lines after code (continuation)
      if (/^\s{2,}/.test(l) && codeBuf.length > 0) return true
      return false
    }

    for (let i = 0; i < allLines.length; i++) {
      const line = allLines[i]
      const trimmed = line.trim()

      // Handle existing ``` code blocks
      if (trimmed.startsWith('```')) {
        if (codeBuf.length > 0) {
          // We were collecting code - this closes it
          flushCodeBuf()
          continue
        }
        // This opens a code block - collect until closing ```
        i++
        const innerCode: string[] = []
        while (i < allLines.length && !allLines[i].trim().startsWith('```')) {
          innerCode.push(allLines[i])
          i++
        }
        if (innerCode.length > 0) {
          elements.push(
            <CodeBlock key={`code-${elements.length}`} code={innerCode.join('\n')} lang="luau" />
          )
        }
        continue
      }

      // Skip separator lines
      if (isSeparator(trimmed)) continue

      // Skip empty lines (unless we're in code)
      if (trimmed.length === 0) {
        if (codeBuf.length > 0) {
          codeBuf.push('')
        }
        continue
      }

      // Skip markdown headers (render as plain bold text)
      if (/^#{1,6}\s/.test(trimmed)) {
        flushCodeBuf()
        elements.push(
          <span key={`h-${elements.length}`} className="text-text-primary font-semibold text-[13px] block mt-3 mb-1">
            {trimmed.replace(/^#{1,6}\s*/, '')}
          </span>
        )
        continue
      }

      // Detect code lines
      if (isCodeLine(line)) {
        codeBuf.push(line)
        continue
      }

      // Not a code line - flush any pending code
      flushCodeBuf()

      // Render bullet points
      if (/^-\s/.test(trimmed)) {
        elements.push(
          <div key={`b-${elements.length}`} className="flex gap-2 ml-2 mb-0.5">
            <span className="text-accent-blue mt-0.5 shrink-0 text-xs">&#8226;</span>
            <span className="text-text-secondary text-[13px]">{trimmed.slice(2)}</span>
          </div>
        )
        continue
      }

      // Numbered lists
      const numMatch = trimmed.match(/^(\d+)\.\s(.+)$/)
      if (numMatch) {
        elements.push(
          <div key={`n-${elements.length}`} className="flex gap-2 ml-2 mb-0.5">
            <span className="text-accent-blue font-medium shrink-0 text-xs">{numMatch[1]}.</span>
            <span className="text-text-secondary text-[13px]">{numMatch[2]}</span>
          </div>
        )
        continue
      }

      // Blockquotes
      if (/^>\s/.test(trimmed)) {
        elements.push(
          <div key={`q-${elements.length}`} className="ml-2 pl-3 border-l-2 border-accent-blue/30 text-text-muted text-[13px] my-1">
            {trimmed.slice(2)}
          </div>
        )
        continue
      }

      // Plain text
      elements.push(
        <span key={`t-${elements.length}`} className="text-text-secondary text-[13px] block leading-relaxed">
          {trimmed}
        </span>
      )
    }

    // Flush any remaining code
    flushCodeBuf()

    return elements.length > 0 ? <>{elements}</> : null
  }, [msg.content, msg.role])

  const timeStr = useMemo(() => {
    if (!msg.timestamp) return ''
    const d = new Date(msg.timestamp)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, [msg.timestamp])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
    >
      {msg.role === 'assistant' && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-accent-blue/25">
          <Brain size={14} className="text-white" />
        </div>
      )}
      <div className={cn('max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative group', msg.role === 'user'
        ? 'bg-gradient-to-br from-accent-blue/20 to-accent-blue/10 text-text-primary border border-accent-blue/20'
        : 'bg-bg-secondary text-text-secondary border border-border-primary'
      )}>
        {msg.role === 'assistant' ? renderedParts : (
          <div className="whitespace-pre-wrap text-text-primary text-[13px]">{msg.content}</div>
        )}
        {msg.role === 'assistant' && msg.content && (
          <div className="mt-2 pt-2 border-t border-border-primary/30 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={copyFullMessage} className="text-[10px] text-text-dim hover:text-text-primary transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-bg-elevated">
              {copiedFull ? <><Check size={9} className="text-green-400" /> Copied</> : <><Copy size={9} /> Copy</>}
            </button>
            <button onClick={() => { const b = new Blob([msg.content], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'response.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u) }} className="text-[10px] text-text-dim hover:text-text-primary transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-bg-elevated"><Download size={9} /> Save</button>
            {isLast && onRegenerate && (
              <button onClick={onRegenerate} className="text-[10px] text-text-dim hover:text-accent-blue transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-bg-elevated"><RotateCcw size={9} /> Retry</button>
            )}
          </div>
        )}
        {timeStr && <div className={cn('text-[9px] text-text-dim mt-1', msg.role === 'user' ? 'text-right' : '')}>{timeStr}</div>}
      </div>
      {msg.role === 'user' && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bg-elevated to-bg-tertiary border border-border-primary flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[11px] font-bold text-text-secondary">U</span>
        </div>
      )}
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
  const studioConnected = useStore((s) => s.studioConnected)
  const studioToken = useStore((s) => s.studioToken)
  const setStudioConnected = useStore((s) => s.setStudioConnected)
  const setStudioToken = useStore((s) => s.setStudioToken)
  const disconnectStudio = useStore((s) => s.disconnectStudio)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPlugin, setShowPlugin] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [activeCategory, setActiveCategory] = useState('Scripts')
  const [copiedPlugin, setCopiedPlugin] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'studio' | 'features' | 'tips'>('studio')
  const [modelOpen, setModelOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = messagesEndRef.current
    if (el) el.scrollIntoView({ block: 'end', behavior: chatMessages.length > 1 ? 'smooth' : 'auto' })
  }, [chatMessages.length])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px'
    }
  }, [input])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return
      const attachment: Attachment = { name: file.name, type: file.type, size: file.size }
      if (file.type.startsWith('image/') || file.type === 'text/plain' || file.name.endsWith('.lua') || file.name.endsWith('.luau') || file.name.endsWith('.txt')) {
        const reader = new FileReader()
        reader.onload = () => { attachment.preview = reader.result as string; setAttachments(prev => [...prev, attachment]) }
        reader.readAsText(file)
      } else { setAttachments(prev => [...prev, attachment]) }
    })
    e.target.value = ''
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }, [])
  const handleDragLeave = useCallback(() => setIsDragOver(false), [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    const files = e.dataTransfer.files
    if (!files.length) return
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return
      const attachment: Attachment = { name: file.name, type: file.type, size: file.size }
      if (file.type.startsWith('image/') || file.type === 'text/plain' || file.name.endsWith('.lua') || file.name.endsWith('.luau') || file.name.endsWith('.txt')) {
        const reader = new FileReader()
        reader.onload = () => { attachment.preview = reader.result as string; setAttachments(prev => [...prev, attachment]) }
        reader.readAsText(file)
      } else { setAttachments(prev => [...prev, attachment]) }
    })
  }, [])

  const doSend = async (messageContent: string, history: ChatMessage[]) => {
    if (!currentUser) { navigate('/auth'); return }
    setLoading(true)
    const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: Date.now() }
    addChatMessage(assistantMsg)

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      let response: Response
      const useEdge = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey && supabaseKey !== 'placeholder-key'
      if (useEdge) {
        response = await fetch(`${supabaseUrl}/functions/v1/chat-ai`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseKey}` }, body: JSON.stringify({ model: aiModel, messages: [...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: messageContent }] }) })
      } else {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ''}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'Yobest AI Architect' }, body: JSON.stringify({ model: aiModel, stream: true, max_tokens: 16000, messages: [{ role: 'system', content: AI_SYSTEM_PROMPT }, ...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: messageContent }] }) })
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
    if (!overrideInput && attachments.length > 0) {
      const attachmentInfo = attachments.map(a => a.preview && a.type.startsWith('text/') ? `[File: ${a.name}]\n\`\`\`\n${a.preview}\n\`\`\`` : `[File: ${a.name} (${(a.size / 1024).toFixed(1)}KB)]`).join('\n\n')
      messageContent = messageContent ? `${messageContent}\n\n${attachmentInfo}` : attachmentInfo
    }
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: messageContent, timestamp: Date.now() }
    addChatMessage(userMsg); setInput(''); setAttachments([])
    await doSend(messageContent, chatMessages)
  }

  const regenerate = async () => {
    if (loading) return
    const lastUser = [...chatMessages].reverse().find(m => m.role === 'user')
    if (!lastUser) return
    const msgs = useStore.getState().chatMessages
    const newMsgs = msgs.slice(0, msgs.length - 1)
    useStore.setState({ chatMessages: newMsgs })
    await doSend(lastUser.content, newMsgs.filter(m => m.id !== lastUser.id))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }
  const copyPluginScript = () => { navigator.clipboard.writeText(PLUGIN_SCRIPT); setCopiedPlugin(true); setTimeout(() => setCopiedPlugin(false), 2000) }
  const downloadPluginScript = () => { const b = new Blob([PLUGIN_SCRIPT], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'YobestAIPlugin.lua'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u) }
  const currentModel = models.find(m => m.id === aiModel)
  const hasMessages = chatMessages.length > 0
  const lastAssistant = [...chatMessages].reverse().find(m => m.role === 'assistant' && m.content)

  const connectStudio = () => {
    if (!tokenInput.trim()) return
    setStudioToken(tokenInput.trim())
    setStudioConnected(true)
  }

  const doDisconnect = () => {
    disconnectStudio()
    setTokenInput('')
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-72px)]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="h-full">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 h-full">
          {/* Main Chat */}
          <div className="flex flex-col h-full rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden relative"
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <AnimatePresence>
              {isDragOver && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-accent-blue/10 border-2 border-dashed border-accent-blue/40 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center"><FileCode size={48} className="mx-auto mb-3 text-accent-blue" /><p className="text-text-primary font-semibold">Drop files here</p><p className="text-text-muted text-xs mt-1">.lua .luau .txt files</p></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-primary bg-bg-secondary/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink flex items-center justify-center shadow-lg shadow-accent-blue/25">
                  <Brain size={15} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold gradient-text leading-tight">Yobest AI</h1>
                  <p className="text-[9px] text-text-dim leading-tight">Luau Architect</p>
                </div>
                <div className="w-px h-5 bg-border-primary" />
                <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium', studioConnected ? 'bg-green-500/10 text-green-400' : 'bg-bg-elevated text-text-dim')}>
                  {studioConnected ? <><CircleDot size={8} className="text-green-400" /> Studio Connected</> : <><WifiOff size={8} /> Studio Offline</>}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button onClick={() => setModelOpen(!modelOpen)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-[11px] hover:border-border-hover transition-all">
                    <div className={cn('w-1.5 h-1.5 rounded-full', currentModel?.color)} />
                    <span className="hidden sm:inline">{currentModel?.label}</span>
                    <ChevronDown size={9} className={cn('transition-transform', modelOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {modelOpen && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full mt-1.5 right-0 w-60 rounded-xl bg-bg-secondary border border-border-primary shadow-2xl shadow-black/40 z-50 overflow-hidden">
                        <div className="p-1.5">
                          {models.map(m => (
                            <button key={m.id} onClick={() => { setAiModel(m.id); setModelOpen(false) }} className={cn('w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left transition-all', aiModel === m.id ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-secondary hover:bg-bg-elevated')}>
                              <div className={cn('w-2 h-2 rounded-full shrink-0', m.color)} />
                              <div className="flex-1 min-w-0"><div className="font-medium flex items-center gap-1.5">{m.label}{m.badge && <span className="text-[8px] px-1 py-0.5 rounded bg-accent-blue/15 text-accent-blue font-bold">{m.badge}</span>}</div><div className="text-[9px] text-text-dim">{m.desc}</div></div>
                              {aiModel === m.id && <Check size={10} className="text-accent-blue shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {hasMessages && <button onClick={clearChat} title="New chat" className="p-1.5 rounded-lg text-text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors"><RotateCcw size={13} /></button>}
              </div>
            </div>

            {/* Messages / Welcome */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {!hasMessages ? (
                <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink flex items-center justify-center shadow-2xl shadow-accent-blue/30">
                        <Brain size={36} className="text-white" />
                      </div>
                      <Sparkles size={18} className="text-accent-yellow absolute -top-1 -right-1 animate-bounce" />
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <h2 className="text-2xl font-bold text-text-primary text-center mb-1.5">What do you want to <span className="gradient-text">build</span>?</h2>
                    <p className="text-text-muted text-sm text-center mb-6">Complete Luau scripts, game systems, UIs, and Studio integration.</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="w-full mb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {quickActions.map(action => { const Icon = action.icon; return (
                        <button key={action.label} onClick={() => { setInput(action.prompt); inputRef.current?.focus() }}
                          className={cn('group relative flex flex-col items-center gap-1.5 px-2 py-3.5 rounded-xl border border-border-primary text-text-secondary text-[11px] text-center hover:border-border-hover hover:text-text-primary transition-all overflow-hidden bg-bg-elevated/50')}>
                          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity', action.gradient)} />
                          <Icon size={16} className="text-text-muted group-hover:text-accent-blue transition-colors relative z-10" />
                          <span className="font-medium relative z-10">{action.label}</span>
                        </button>
                      )})}
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="w-full">
                    <div className="flex gap-1 mb-2.5 overflow-x-auto pb-1 justify-center">
                      {suggestedPrompts.map(cat => { const Icon = cat.icon; return (
                        <button key={cat.category} onClick={() => setActiveCategory(cat.category)} className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all border', activeCategory === cat.category ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/25' : 'bg-bg-elevated text-text-muted border-transparent hover:text-text-secondary')}>
                          <Icon size={10} /> {cat.category}
                        </button>
                      )})}
                    </div>
                    <div className="space-y-1.5">
                      {suggestedPrompts.find(c => c.category === activeCategory)?.prompts.map((p) => (
                        <button key={p.text} onClick={() => { setInput(p.text); inputRef.current?.focus() }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-secondary text-[12px] text-left hover:border-accent-blue/30 hover:text-text-primary hover:bg-bg-tertiary transition-all group">
                          <ArrowUp size={12} className="text-text-dim group-hover:text-accent-blue transition-colors shrink-0 rotate-45" />
                          <span className="flex-1">{p.text}</span>
                          {p.hot && <span className="text-[8px] px-1 py-0.5 rounded bg-accent-orange/15 text-accent-orange font-bold shrink-0">HOT</span>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg, i) => <MessageBubble key={msg.id} msg={msg} isLast={i === chatMessages.length - 1 && msg.role === 'assistant'} onRegenerate={regenerate} />)}
                  {loading && chatMessages[chatMessages.length - 1]?.content === '' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink flex items-center justify-center shrink-0 shadow-lg shadow-accent-blue/25"><Brain size={14} className="text-white" /></div>
                      <div className="px-4 py-3 rounded-2xl bg-bg-secondary border border-border-primary">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border-primary bg-bg-secondary/90 backdrop-blur-md shrink-0">
              <AnimatePresence>
                {attachments.length > 0 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="flex flex-wrap gap-1.5 mb-2 overflow-hidden">
                    {attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-elevated border border-border-primary text-[10px]">
                        <FileCode size={10} className="text-accent-blue shrink-0" /><span className="text-text-secondary truncate max-w-[100px]">{a.name}</span>
                        <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-text-dim hover:text-red-400 transition-colors"><X size={9} /></button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex gap-2 items-end">
                <input ref={fileInputRef} type="file" multiple accept=".lua,.luau,.txt,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} title="Attach" className="p-2.5 rounded-xl text-text-dim hover:text-text-primary hover:bg-bg-elevated transition-colors shrink-0"><Paperclip size={15} /></button>
                <div className="flex-1 relative">
                  <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder={hasMessages ? "Follow up or ask something new..." : "Describe what you want to build..."}
                    rows={1}
                    className="w-full resize-none px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                    style={{ minHeight: '42px', maxHeight: '160px' }}
                  />
                  <div className="absolute right-2 bottom-2 hidden sm:flex items-center gap-1">
                    <kbd className="text-[8px] px-1 py-0.5 rounded bg-bg-secondary/50 text-text-dim font-mono flex items-center gap-0.5"><CornerDownLeft size={7} /> Enter</kbd>
                  </div>
                </div>
                <button onClick={() => sendMessage()} disabled={(!input.trim() && attachments.length === 0) || loading}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg shadow-accent-blue/20 active:scale-95">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 px-0.5">
                <span className="text-[9px] text-text-dim"><span className="opacity-50">via</span> {currentModel?.label || 'OpenRouter'}</span>
                <span className="text-[9px] text-text-dim opacity-50">{chatMessages.length} msgs</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden xl:flex flex-col gap-3 min-h-0 overflow-y-auto">
            <div className="flex gap-1 p-1 rounded-xl bg-bg-secondary border border-border-primary shrink-0">
              {([ { id: 'studio' as const, label: 'Plugin', icon: Puzzle }, { id: 'features' as const, label: 'AI', icon: Zap }, { id: 'tips' as const, label: 'Tips', icon: BookOpen } ]).map(tab => {
                const Icon = tab.icon; return (
                  <button key={tab.id} onClick={() => setSidebarTab(tab.id)} className={cn('flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium transition-all', sidebarTab === tab.id ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-secondary')}><Icon size={10} /> {tab.label}</button>
                )
              })}
            </div>

            {sidebarTab === 'studio' && (
              <div className="space-y-3">
                {/* Connection Panel */}
                <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
                  {/* Status Header */}
                  <div className={cn('px-4 py-3 flex items-center gap-2.5', studioConnected ? 'bg-green-500/5 border-b border-green-500/10' : 'bg-bg-tertiary/50 border-b border-border-primary')}>
                    <div className={cn('w-2.5 h-2.5 rounded-full', studioConnected ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse' : 'bg-yellow-400')} />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-text-primary">{studioConnected ? 'Studio Connected' : 'Studio Offline'}</div>
                      <div className="text-[10px] text-text-dim">{studioConnected ? 'Token is paired' : 'Connect your Studio plugin'}</div>
                    </div>
                    {studioConnected && (
                      <button onClick={doDisconnect} className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors">
                        Disconnect
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    {!studioConnected ? (
                      <>
                        <div>
                          <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Paste Token from Studio</label>
                          <input type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            value={tokenInput} onChange={(e) => setTokenInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-[11px] font-mono focus:outline-none focus:border-accent-blue/50 placeholder:text-text-dim" />
                        </div>
                        <button onClick={connectStudio} disabled={!tokenInput.trim()}
                          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xs font-bold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-blue/20">
                          Connect to Studio
                        </button>
                      </>
                    ) : (
                      <button onClick={doDisconnect}
                        className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors">
                        Disconnect Studio
                      </button>
                    )}

                    {/* Setup Steps */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[9px] text-text-dim font-semibold uppercase tracking-wider">Setup Guide</div>
                      {[
                        { step: 1, text: 'Copy plugin script below', done: false },
                        { step: 2, text: 'Paste into Studio Command Bar', done: false },
                        { step: 3, text: 'Click "Generate Token" in plugin GUI', done: false },
                        { step: 4, text: 'Paste token here and click Connect', done: studioConnected },
                      ].map(s => (
                        <div key={s.step} className="flex items-start gap-2">
                          <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[7px] font-bold', s.done ? 'bg-green-500/20 text-green-400' : 'bg-accent-blue/15 text-accent-blue')}>
                            {s.done ? <Check size={8} /> : s.step}
                          </div>
                          <span className={cn('text-[10px] leading-tight', s.done ? 'text-green-400' : 'text-text-secondary')}>{s.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Plugin Actions */}
                <div className="rounded-2xl bg-bg-secondary border border-border-primary p-4 space-y-2">
                  <div className="flex gap-2">
                    <button onClick={copyPluginScript} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-[10px] font-medium hover:border-accent-blue/30 hover:text-text-primary transition-all">
                      {copiedPlugin ? <><Check size={10} className="text-green-400" /> Copied</> : <><Copy size={10} /> Copy Plugin</>}
                    </button>
                    <button onClick={downloadPluginScript} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/25 text-[10px] font-medium hover:bg-accent-blue/25 transition-all">
                      <Download size={10} /> Download
                    </button>
                  </div>
                  <button onClick={() => setShowPlugin(true)} className="w-full flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-dim text-[10px] hover:text-text-primary hover:border-border-hover transition-all">
                    <Eye size={10} /> View Plugin Code
                  </button>
                </div>
              </div>
            )}

            {sidebarTab === 'features' && (
              <div className="space-y-3">
                <div className="rounded-2xl bg-bg-secondary border border-border-primary p-4">
                  <h3 className="text-xs font-semibold text-text-primary mb-2.5">What I Can Do</h3>
                  <div className="space-y-2">
                    {[
                      { icon: Code, title: 'Luau Scripts', desc: 'Complete, working production code' },
                      { icon: Blocks, title: 'GUI Systems', desc: 'Full ScreenGui hierarchies with tweens' },
                      { icon: Rocket, title: 'Game Systems', desc: 'Combat, inventory, quests, trading' },
                      { icon: Shield, title: 'Security', desc: 'Anti-cheat, validation, server auth' },
                      { icon: Zap, title: 'Optimization', desc: 'Memory, performance, profiling' },
                      { icon: Wrench, title: 'Bug Fixes', desc: 'Debug and fix any Luau code' },
                    ].map(f => { const Icon = f.icon; return (
                      <div key={f.title} className="flex gap-2 group">
                        <div className="w-6 h-6 rounded-md bg-bg-elevated border border-border-primary flex items-center justify-center shrink-0 group-hover:border-accent-blue/30 transition-colors"><Icon size={11} className="text-accent-blue" /></div>
                        <div><div className="text-[11px] font-medium text-text-primary">{f.title}</div><div className="text-[9px] text-text-dim">{f.desc}</div></div>
                      </div>
                    )})}
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border border-accent-blue/15 p-4">
                  <h3 className="text-xs font-semibold text-text-primary mb-2">Current Model</h3>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', currentModel?.color || 'bg-text-muted')} />
                    <span className="text-[11px] text-text-secondary font-medium">{currentModel?.label || aiModel}</span>
                    {currentModel?.badge && <span className="text-[8px] px-1 py-0.5 rounded bg-accent-blue/15 text-accent-blue font-bold">{currentModel.badge}</span>}
                  </div>
                  <div className="text-[10px] text-text-dim mt-1">{currentModel?.desc}</div>
                </div>
              </div>
            )}

            {sidebarTab === 'tips' && (
              <div className="space-y-3">
                <div className="rounded-2xl bg-bg-secondary border border-border-primary p-4">
                  <h3 className="text-xs font-semibold text-text-primary mb-2.5 flex items-center gap-1.5"><BookOpen size={11} className="text-accent-blue" /> Pro Tips</h3>
                  <div className="space-y-1.5">
                    {[
                      'Paste your existing code to get targeted fixes',
                      'Describe the game type for better architecture',
                      'Ask for server AND client scripts together',
                      'Request full systems, not fragments',
                      'Say "fix this" and paste broken code',
                      'Ask "how does this work" for explanations',
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-accent-blue mt-1.5 shrink-0" />
                        <span className="text-[10px] text-text-secondary leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-bg-secondary border border-border-primary p-4">
                  <h3 className="text-xs font-semibold text-text-primary mb-2.5 flex items-center gap-1.5"><Terminal size={11} className="text-accent-blue" /> Shortcuts</h3>
                  <div className="space-y-1">
                    {[['Enter', 'Send'], ['Shift+Enter', 'New line'], ['Ctrl+V', 'Paste code']].map(([key, action]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-[10px] text-text-muted">{action}</span>
                        <kbd className="text-[8px] px-1.5 py-0.5 rounded bg-bg-elevated border border-border-primary text-text-dim font-mono">{key}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
                {hasMessages && (
                  <div className="rounded-2xl bg-bg-secondary border border-border-primary p-4">
                    <h3 className="text-xs font-semibold text-text-primary mb-2">Session</h3>
                    <div className="space-y-1">
                      {[['Messages', chatMessages.length], ['User', chatMessages.filter(m => m.role === 'user').length], ['AI', chatMessages.filter(m => m.role === 'assistant').length], ['Model', currentModel?.label]].map(([l, v]) => (
                        <div key={String(l)} className="flex justify-between text-[10px]"><span className="text-text-dim">{String(l)}</span><span className="text-text-secondary font-medium">{String(v)}</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ad in sidebar */}
          <div className="shrink-0 flex justify-center">
            <AdBanner type="rectangle" />
          </div>
        </div>
      </motion.div>

      {/* Plugin Modal */}
      <AnimatePresence>
        {showPlugin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowPlugin(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border-primary bg-bg-secondary/95 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink flex items-center justify-center shadow-lg"><Puzzle size={16} className="text-white" /></div>
                  <div><h2 className="text-base font-bold text-text-primary">Studio Plugin v3.0</h2><p className="text-[10px] text-text-muted">Copy, paste into Command Bar, generate token</p></div>
                </div>
                <button onClick={() => setShowPlugin(false)} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"><X size={16} /></button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Play, title: 'Generate Token', desc: 'One-click token generation' },
                    { icon: Copy, title: 'Inject Selection', desc: 'Clone Explorer selection to target' },
                    { icon: Code, title: 'New Script', desc: 'Create empty Script in target service' },
                    { icon: Eye, title: 'Open in Editor', desc: 'Open selected script for editing' },
                  ].map(f => { const Icon = f.icon; return (
                    <div key={f.title} className="flex gap-2 p-2.5 rounded-xl bg-bg-tertiary border border-border-primary">
                      <div className="w-6 h-6 rounded-md bg-accent-blue/10 flex items-center justify-center shrink-0"><Icon size={11} className="text-accent-blue" /></div>
                      <div><div className="text-[10px] font-medium text-text-primary">{f.title}</div><div className="text-[9px] text-text-dim">{f.desc}</div></div>
                    </div>
                  )})}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-text-primary">Plugin Script</h3>
                    <div className="flex gap-1.5">
                      <button onClick={copyPluginScript} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-[10px] font-medium hover:border-accent-blue/30 transition-all">
                        {copiedPlugin ? <><Check size={10} className="text-green-400" /> Copied</> : <><Copy size={10} /> Copy</>}
                      </button>
                      <button onClick={downloadPluginScript} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/25 text-[10px] font-medium hover:bg-accent-blue/25 transition-all"><Download size={10} /> .lua</button>
                    </div>
                  </div>
                  <CodeBlock code={PLUGIN_SCRIPT} lang="lua" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const AI_SYSTEM_PROMPT = `You are Yobest AI, a Roblox Studio Luau coding assistant. Your ONLY job is to produce complete, working, copy-paste-ready Luau scripts.

## CRITICAL RULES — VIOLATION = FAILURE

### Code Formatting (MOST IMPORTANT)
- ALL code MUST be inside triple backtick luau blocks like this:
\`\`\`luau
local Players = game:GetService("Players")
-- code here
\`\`\`
- NEVER output raw code outside of backtick blocks
- EVERY script must have an opening \`\`\`luau and closing \`\`\`
- If the AI does not use code blocks, the code will not display properly

### Separator Lines (FORBIDDEN)
- NEVER use ---, ===, ***, ___, ~~~, or ### as separators
- NEVER use any line of repeated characters as decoration
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
- Never truncate code with ... or similar

## RESPONSE FORMAT (follow exactly)

1-2 sentences explaining what this does.

Place this in ServerScriptService:

\`\`\`luau
-- complete working script here
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
-- etc
\`\`\`

- How to use it: (3-5 bullet points starting with -)

That is the ONLY acceptable format. No headers. No separators. No bold. Just plain text and code blocks.

## LUAU PATTERNS

Service caching:
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

DataStore:
local ds = DataStoreService:GetDataStore("StoreName")
local ok, data = pcall(function() return ds:GetAsync(key) end)

RemoteEvent:
local event = Instance.new("RemoteEvent")
event.Name = "EventName"
event.Parent = ReplicatedStorage

GUI:
local sg = Instance.new("ScreenGui")
sg.Name = "GuiName"
sg.ResetOnSpawn = false
sg.Parent = player.PlayerGui
local frame = Instance.new("Frame")
frame.Size = UDim2.new(0, 300, 0, 200)
frame.Position = UDim2.new(0.5, -150, 0.5, -100)
frame.BackgroundColor3 = Color3.fromRGB(20, 20, 30)
frame.BorderSizePixel = 0
frame.Parent = sg
Instance.new("UICorner", frame).CornerRadius = UDim.new(0, 12)

Tween:
local tween = TweenService:Create(obj, TweenInfo.new(0.3, Enum.EasingStyle.Quint), {Property = value})
tween:Play()

Write working code. Every time.`