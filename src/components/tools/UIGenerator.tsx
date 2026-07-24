import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Send, Loader2, Sparkles, Plus, Trash2, Download, FileCode2, FileJson, Grid3X3,
  ZoomIn, ZoomOut, RotateCcw, Upload, Image as ImageIcon, X, ChevronDown, ChevronRight,
  Monitor, Tablet, Smartphone, MousePointer2, Move, Maximize2, Copy, Layers, Settings,
  Eye, EyeOff, Lock, Unlock, Wand2, ChevronUp, PanelLeft, PanelRight, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabaseUrl } from '@/config/supabase'
import { localTemplateFallback } from './localTemplates'

const CHAT_API = `${supabaseUrl}/functions/v1/rodin-api?action=ui-generate`
const AI_PROXY = `${supabaseUrl}/functions/v1/ai-proxy`

const UI_SYSTEM_PROMPT = `You are the world-class Roblox UI designer. You create interfaces that look like games with 100M+ players: Blox Fruits, Adopt Me, Pet Simulator 99, Jailbreak, King Legacy, Bee Swarm Simulator.

IMPORTANT: Create BEAUTIFUL, POLISHED, PROFESSIONAL UIs — not boring black boxes with text. Use layered backgrounds, gradient effects, glass morphism, glow accents, and rich visual hierarchy. Every UI should look like it belongs in a top Roblox game.

=== OUTPUT FORMAT ===
Return ONLY: {"message":"short description","commands":[...]}

=== COMMAND FORMATS ===
ADD: {"action":"add","elementType":"TYPE","name":"UniqueName","parent":"ParentName_or_null","position":{"X":0.5,"Y":0.5},"size":{"X":0.4,"Y":0.5},"properties":{...}}
MODIFY: {"action":"modify","target":"ExactName","properties":{...}}
REMOVE: {"action":"remove","target":"ExactName"}

=== ELEMENT TYPES ===
Frame, TextLabel, TextButton, ImageLabel, ScrollingFrame, TextBox

=== MODIFIER CHILDREN (add as children of elements) ===
UICorner: parent="ElementName". properties: Radius (number 0-50, corner radius in px)
UIStroke: parent="ElementName". properties: Color ("#hex"), Thickness (number 1-8), Transparency (0-1)
UIPadding: parent="ElementName". properties: Top, Bottom, Left, Right (numbers, inner padding)
UIListLayout: parent="FrameName". properties: FillDirection ("Horizontal"/"Vertical"), Padding (number 0-0.05), HorizontalAlignment ("Left"/"Center"/"Right"), SortOrder ("LayoutOrder"/"Name")
UIGridLayout: parent="FrameName". properties: CellPaddingX, CellPaddingY (numbers), CellSizeX, CellSizeY (numbers)
UIScale: parent="ElementName". properties: Scale (number 0.5-2.0)
UIAspectRatioConstraint: parent="ElementName". properties: AspectRatio (number), AspectType ("ScaleWithParentSize"), DominantAxis ("Width"/"Height")
UIGradient: parent="ElementName". properties: Color ("#hex"), Transparency (0-1), Rotation (number, degrees)

=== ALL AVAILABLE PROPERTIES ===
Frame: BackgroundColor3, BackgroundTransparency (0-1), BorderSizePixel (0-10), BorderColor3, CornerRadius (0-50), ZIndex, LayoutOrder
Text: Text (with emojis!), TextColor3, TextTransparency (0-1), TextScaled (bool), Font (GothamBold/Gotham/SourceSans/Arial), TextSize, TextWrapped, TextXAlignment (Left/Center/Right), TextYAlignment (Top/Center/Bottom), RichText
Image: Image (URL), ImageColor3, ImageTransparency (0-1)
Scroll: ScrollBarThickness, ScrollBarImageColor3, CanvasSize, AutomaticCanvasSize
Layout: Rotation, Visible

=== DESIGN RULES (FOLLOW ALL — BEAUTIFUL PROFESSIONAL UIs) ===
1. LAYERS: Every UI needs 4+ layers: outer glow Frame → dark overlay (transparency 0.05-0.15) → main panel → content panels → items/buttons
2. GLASS MORPHISM: Main panels use BackgroundColor3 with 0.05-0.15 BackgroundTransparency for depth
3. ACCENT BORDERS: Use BorderSizePixel 1-2 with light BorderColor3 (#ffffff10) for panel edges
4. CORNER RADIUS: CornerRadius 12-20 on main panels, 6-10 on buttons/cards, 50 for circular
5. EMOJIS: EVERY title must have emojis. "🛒 ITEM SHOP", "⚔️ INVENTORY", "🏆 LEADERBOARD"
6. COLOR HIERARCHY: Dark bg (#0d1117) → panel (#161b22) → card (#1e293b) → accent color (blue/purple/green)
7. GLOW EFFECTS: Add a slightly larger transparent frame behind panels with accent BackgroundColor3 and 0.85-0.92 BackgroundTransparency
8. SPACING: Leave breathing room. Padding 0.01-0.02 between elements. Never cram
9. TEXT HIERARCHY: Big bold titles → medium subtitles → small body text → tiny labels
10. MINIMUM 20 ELEMENTS for professional look

=== IMAGE STRATEGY ===
--- PLAYER AVATARS (circular) ---
https://www.roblox.com/headshot-thumbnail/image?userId=1&width=150&height=150&format=png
OR https://ui-avatars.com/api/?name=PlayerName&background=3b82f6&color=fff&bold=true&size=150

--- ITEM ICONS (colored squares with emoji) ---
https://placehold.co/120x120/1e293b/ef4444?text=%E2%9A%94%EF%B8%8F&font-size=50 (sword)
https://placehold.co/120x120/1e293b/3b82f6?text=%F0%9F%9E%A1%EF%B8%8F&font-size=50 (shield)
https://placehold.co/120x120/1e293b/22c55e?text=%F0%9F%A7%A3&font-size=50 (potion)
https://placehold.co/120x120/1e293b/a78bfa?text=%F0%9F%92%8E&font-size=50 (gem)
https://placehold.co/120x120/1e293b/f59e0b?text=%F0%9F%92%B0&font-size=50 (coin)
https://placehold.co/120x120/1e293b/f472b6?text=%F0%9F%8E%AF&font-size=50 (wand)
https://placehold.co/120x120/1e293b/06b6d4?text=%F0%9F%94%A5&font-size=50 (fire)
https://placehold.co/120x120/1e293b/fda4af?text=%E2%9C%A8&font-size=50 (star)
Set BackgroundTransparency: 1 on ImageLabel.

--- FEATURE IMAGES (thumbnails, reveals) ---
https://picsum.photos/seed/darkforest/400/300, /seed/neoncity/400/300, /seed/mountains/400/300
https://picsum.photos/seed/ocean/400/300, /seed/night/400/300, /seed/fire/400/300
https://picsum.photos/seed/gold/400/300, /seed/crystal/400/300

--- BACKGROUNDS: Use solid color Frames, NOT images. Dark: #0d1117, Neon: #0a0a1a, Medieval: #1a0f0a
--- PROGRESS BARS: Solid color Frames with CornerRadius, NOT images

=== PROFESSIONAL UI PATTERNS ===
1. SHOP: Layered dark bg → glow frame behind → title bar with coin counter → scrolling grid of item cards (each: bg frame + icon + name + price + BUY button) → close button
2. HUD: Semi-transparent overlay → health bar (red fill + white text) → mana bar (blue) → XP bar (green) → coin/gem counters with icons → level badge
3. MAIN MENU: Full-screen bg ImageLabel → large game title with glow → PLAY button (green, large) → Shop/Settings/Inventory buttons → version text
4. INVENTORY: ScrollingFrame with grid → slots with item icons + quantity badges → empty slots with dashed border → header with slot counter
5. QUEST LOG: Side panel → quest cards with icon + name + progress bar → color-coded by difficulty
6. STATS: Character avatar → stat bars with labels → level badge → equipment slots
7. GACHA/PET: Center reveal card with glow border → large pet image → rarity label → spin button → currency cost
8. LEADERBOARD: Tabbed header → ranked rows with position + avatar + name + score → medal emojis for top 3
9. TRADING: Two player panels → avatar + offered items → trade status → accept/decline
10. BATTLE: Two fighter cards → health bars → ability buttons → VS divider

=== DESIGN STYLES ===
- Dark Gaming: bg #0d1117, panels #161b22/#1e293b, accent #3b82f6, glass borders
- Neon Cyberpunk: bg #0a0a1a, panels #0f172a, neon glow #06b6d4 + #8b5cf6
- Fantasy Medieval: bg #1a0f0a, panels #2a1f14, gold #d4a373, ornate borders
- Fun Colorful: bg #1e1e2e, panels #2a2a3e, pastels #f472b6/#a78bfa/#34d399
- Space Galaxy: bg #050510, panels #0a0a1f, purple #7c3aed + blue #3b82f6
- Anime/Clean: bg #0f0f23, panels #1a1a2e, sakura #fda4af
- Military HUD: bg #111318, panels #1a1f2e, green #22c55e, sharp corners

=== LAYOUT RULES ===
- 20-35 elements minimum for professional look
- Root Frame: parent null, position {"X":0.5,"Y":0.5}, size {"X":0.7,"Y":0.75}
- Children position/size RELATIVE to parent (0.5,0.5 = center)
- 3 cards: X=0.17, 0.5, 0.83. 4 cards: X=0.125, 0.375, 0.625, 0.875

=== POSITION AND SIZE RULES (CRITICAL) ===
- EVERY add MUST have: position={"X":N,"Y":N} AND size={"X":N,"Y":N}
- NEVER: missing fields, negative values, strings, nulls, NaN
- Values: 0.0 to 1.0 (size up to 1.2 for full panels)

Output ONLY the JSON. No markdown fences. No text before or after.`

const ROBLOX_DEFAULTS: Record<string, any> = {
  BackgroundColor3: '#c8c8c8', BackgroundTransparency: 0, BorderSizePixel: 1,
  BorderColor3: '#000000', AnchorPoint: { X: 0, Y: 0 },
  Rotation: 0, ZIndex: 1, LayoutOrder: 0,
  TextColor3: '#000000', TextTransparency: 0, TextScaled: false,
  Font: 'Legacy', TextSize: 14, TextWrapped: false, TextXAlignment: 'Center',
  TextYAlignment: 'Center', RichText: false,
  Image: '', ImageColor3: '#ffffff', ImageTransparency: 0,
  ScrollBarThickness: 12, ScrollBarImageColor3: '#000000',
  CanvasSize: { X: 0, Y: 200 }, AutomaticCanvasSize: 'None',
  CornerRadius: 0, Padding: 0,
  // UICorner
  UICorner_Radius: 8,
  // UIStroke
  UIStroke_Color: '#ffffff', UIStroke_Thickness: 2, UIStroke_Transparency: 0.3,
  // UIPadding
  UIPadding_Top: 0.01, UIPadding_Bottom: 0.01, UIPadding_Left: 0.01, UIPadding_Right: 0.01,
  // UIListLayout
  UIListLayout_FillDirection: 'Vertical', UIListLayout_Padding: 0.01, UIListLayout_HorizontalAlignment: 'Left', UIListLayout_SortOrder: 'LayoutOrder',
  // UIGridLayout
  UIGridLayout_CellPadding_X: 0.02, UIGridLayout_CellPadding_Y: 0.02, UIGridLayout_CellSize_X: 0.3, UIGridLayout_CellSize_Y: 0.25,
  // UIScale
  UIScale_Scale: 1.0,
  // UIAspectRatioConstraint
  UIAspectRatio_AspectRatio: 1.0, UIAspectRatio_AspectType: 'ScaleWithParentSize', UIAspectRatio_DominantAxis: 'Width',
  // UIGradient
  UIGradient_Color: '#ffffff', UIGradient_Transparency: 0, UIGradient_Rotation: 45,
}

const DEVICES = [
  { name: 'Desktop', w: 1920, h: 1080, icon: Monitor },
  { name: 'Tablet', w: 1024, h: 768, icon: Tablet },
  { name: 'Mobile', w: 540, h: 960, icon: Smartphone },
]

const ELEMENT_TYPES = [
  { type: 'Frame', label: 'Frame', desc: 'Container' },
  { type: 'TextLabel', label: 'TextLabel', desc: 'Text' },
  { type: 'TextButton', label: 'TextButton', desc: 'Button' },
  { type: 'ImageLabel', label: 'ImageLabel', desc: 'Image' },
  { type: 'ScrollingFrame', label: 'ScrollFrame', desc: 'Scroll' },
  { type: 'TextBox', label: 'TextBox', desc: 'Input' },
]

const MODIFIER_TYPES = [
  { type: 'UICorner', label: 'UICorner', desc: 'Rounded corners' },
  { type: 'UIStroke', label: 'UIStroke', desc: 'Border stroke' },
  { type: 'UIPadding', label: 'UIPadding', desc: 'Inner padding' },
  { type: 'UIListLayout', label: 'UIListLayout', desc: 'List layout' },
  { type: 'UIGridLayout', label: 'UIGridLayout', desc: 'Grid layout' },
  { type: 'UIScale', label: 'UIScale', desc: 'Scale child' },
  { type: 'UIAspectRatioConstraint', label: 'UIAspectRatio', desc: 'Aspect ratio' },
  { type: 'UIGradient', label: 'UIGradient', desc: 'Gradient fill' },
]

const PROP_GROUPS: Record<string, string[]> = {
  'Data': ['Name', 'LayoutOrder', 'Visible'],
  'Appearance': ['BackgroundColor3', 'BackgroundTransparency', 'BorderColor3', 'BorderSizePixel', 'Image', 'ImageColor3', 'ImageTransparency'],
  'Text': ['Text', 'TextColor3', 'TextTransparency', 'TextScaled', 'Font', 'TextSize', 'TextWrapped', 'TextXAlignment', 'TextYAlignment', 'RichText'],
  'Layout': ['Position', 'Size', 'AnchorPoint', 'Rotation', 'ZIndex'],
  'Corner': ['CornerRadius'],
  'Scroll': ['ScrollBarThickness', 'ScrollBarImageColor3', 'CanvasSize', 'AutomaticCanvasSize'],
  // Modifier props
  'UIStroke': ['UIStroke_Color', 'UIStroke_Thickness', 'UIStroke_Transparency'],
  'UIPadding': ['UIPadding_Top', 'UIPadding_Bottom', 'UIPadding_Left', 'UIPadding_Right'],
  'UIListLayout': ['UIListLayout_FillDirection', 'UIListLayout_Padding', 'UIListLayout_HorizontalAlignment', 'UIListLayout_SortOrder'],
  'UIGridLayout': ['UIGridLayout_CellPadding_X', 'UIGridLayout_CellPadding_Y', 'UIGridLayout_CellSize_X', 'UIGridLayout_CellSize_Y'],
  'UIScale': ['UIScale_Scale'],
  'UIAspectRatioConstraint': ['UIAspectRatio_AspectRatio', 'UIAspectRatio_AspectType', 'UIAspectRatio_DominantAxis'],
  'UIGradient': ['UIGradient_Color', 'UIGradient_Transparency', 'UIGradient_Rotation'],
}

const FONT_OPTIONS = ['Legacy', 'Gotham', 'GothamBold', 'GothamBlack', 'SourceSans', 'SourceSansBold', 'Arial', 'ArialBold', 'HighwayGothic', 'HighwayGothicBold', 'Cartoon', 'Code', 'FredokaOne', 'Granite', 'Jura', 'ShoppingCart']
const TEXT_X_ALIGN_OPTIONS = ['Left', 'Center', 'Right']
const TEXT_Y_ALIGN_OPTIONS = ['Top', 'Center', 'Bottom']
const AUTOMATIC_CANVAS_SIZE_OPTIONS = ['None', 'X', 'Y', 'XY']
const COLOR_PRESETS = ['#0d1117', '#161b22', '#1e293b', '#334155', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#f1f5f9', '#ffffff', '#000000']
const CONTAINER_TYPES = ['Frame', 'ScrollingFrame']

const ELEMENT_TYPE_ICONS: Record<string, string> = {
  Frame: '▬', TextLabel: 'Aa', TextButton: '☐', ImageLabel: '🖼', ScrollingFrame: '☰', TextBox: '□',
  UICorner: '◯', UIStroke: '▢', UIPadding: '⊞', UIListLayout: '☰', UIGridLayout: '▦',
  UIScale: '⊕', UIAspectRatioConstraint: '▭', UIGradient: '🌈',
}

const LAYOUT_TYPE_ICONS: Record<string, string> = { none: '⊞', grid: '▦', list: '☰' }

let _id = 0
const uid = () => `e${++_id}`

function parseColor(c: any): string {
  if (!c || c === '#000000' && false) return '#c8c8c8'
  if (typeof c === 'string' && c.startsWith('#')) return c
  if (typeof c === 'object' && c !== null && 'R' in c) {
    const r = Math.round((c.R || 0) * 255)
    const g = Math.round((c.G || 0) * 255)
    const b = Math.round((c.B || 0) * 255)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  return String(c)
}

function colorToRoblox(hex: string): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return 'Color3.new(0.78, 0.78, 0.78)'
  const r = (parseInt(h.slice(0, 2), 16) / 255).toFixed(2)
  const g = (parseInt(h.slice(2, 4), 16) / 255).toFixed(2)
  const b = (parseInt(h.slice(4, 6), 16) / 255).toFixed(2)
  return `Color3.new(${r}, ${g}, ${b})`
}

function getDefaultProp(key: string): any {
  return ROBLOX_DEFAULTS[key] ?? (typeof ROBLOX_DEFAULTS[key] === 'number' ? 0 : typeof ROBLOX_DEFAULTS[key] === 'boolean' ? false : '')
}

function differsFromDefault(key: string, value: any): boolean {
  const def = ROBLOX_DEFAULTS[key]
  if (def === undefined) return true
  if (typeof def === 'object' && typeof value === 'object') return JSON.stringify(def) !== JSON.stringify(value)
  return def !== value
}

export interface UIEl {
  id: string; type: string; name: string; parentId: string | null
  position: { X: number; Y: number }; size: { X: number; Y: number }
  props: Record<string, any>; children: string[]; zIndex: number; locked: boolean; visible: boolean
  layout?: 'none' | 'grid' | 'list' | 'page'
  layoutProps?: { cellSize?: { X: number; Y: number }; padding?: number; gap?: number; fillDirection?: 'Horizontal' | 'Vertical' }
}

interface ChatMsg { role: 'user' | 'assistant'; content: string; commands?: any[] }

// ─── Layout application ──────────────────────────────────────
function applyLayout(el: UIEl, allElements: UIEl[]): UIEl[] {
  if (!el.layout || el.layout === 'none') return allElements
  const childIds = el.children
  if (childIds.length === 0) return allElements
  const updated = [...allElements]
  const layoutProps = el.layoutProps || {}
  const padding = layoutProps.padding ?? 0.01
  const gap = layoutProps.gap ?? 0.005
  const cellSize = layoutProps.cellSize || { X: 0.2, Y: 0.15 }

  if (el.layout === 'list') {
    const usableW = el.size.X - padding * 2
    const usableH = el.size.Y - padding * 2
    childIds.forEach((cid, i) => {
      const idx = updated.findIndex(e => e.id === cid)
      if (idx < 0) return
      const child = updated[idx]
      const cx = el.position.X - el.size.X / 2 + padding + child.size.X / 2
      const cy = el.position.Y - el.size.Y / 2 + padding + cellSize.Y / 2 + i * (cellSize.Y + gap)
      updated[idx] = { ...child, position: { X: snapVal(cx), Y: snapVal(cy) } }
    })
  } else if (el.layout === 'grid') {
    const usableW = el.size.X - padding * 2
    const cols = Math.max(1, Math.floor(usableW / (cellSize.X + gap)))
    childIds.forEach((cid, i) => {
      const idx = updated.findIndex(e => e.id === cid)
      if (idx < 0) return
      const child = updated[idx]
      const col = i % cols
      const row = Math.floor(i / cols)
      const cx = el.position.X - el.size.X / 2 + padding + cellSize.X / 2 + col * (cellSize.X + gap)
      const cy = el.position.Y - el.size.Y / 2 + padding + cellSize.Y / 2 + row * (cellSize.Y + gap)
      updated[idx] = { ...child, position: { X: snapVal(cx), Y: snapVal(cy) } }
    })
  }
  return updated
}

function snapVal(v: number): number { return Math.round(v * 1000) / 1000 }

// ─── Lua Generator ───────────────────────────────────────────
function genVarName(el: UIEl, parent?: UIEl): string {
  const base = el.name.replace(/[^a-zA-Z0-9]/g, '')
  return base.charAt(0).toLowerCase() + base.slice(1)
}

function genLua(elements: UIEl[]): string {
  const lines: string[] = [
    '-- Generated by Yobest UI Builder',
    '-- Paste into Roblox Studio Command Bar or a LocalScript',
    '',
    'local screenGui = Instance.new("ScreenGui")',
    'screenGui.Name = "GeneratedUI"',
    'screenGui.ResetOnSpawn = false',
    'screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling',
    'screenGui.Parent = game.Players.LocalPlayer:WaitForChild("PlayerGui")',
    '',
  ]
  const map = new Map(elements.map(e => [e.id, e]))

  function emit(el: UIEl, parentVar: string, depth: number) {
    const v = genVarName(el)
    const indent = '  '.repeat(depth)
    const isModifier = el.type.startsWith('UI') && el.type !== 'UIScrollBar'

    if (isModifier) {
      // Modifiers only need Instance.new + properties + Parent
      lines.push(`${indent}local ${v} = Instance.new("${el.type}")`)

      // Modifier-specific properties
      if (el.type === 'UICorner') {
        const radius = el.props.UICorner_Radius ?? 8
        lines.push(`${indent}${v}.CornerRadius = UDim.new(0, ${radius})`)
      } else if (el.type === 'UIStroke') {
        const color = parseColor(el.props.UIStroke_Color || '#ffffff')
        lines.push(`${indent}${v}.Color = ${colorToRoblox(color)}`)
        lines.push(`${indent}${v}.Thickness = ${el.props.UIStroke_Thickness ?? 2}`)
        lines.push(`${indent}${v}.Transparency = ${el.props.UIStroke_Transparency ?? 0.3}`)
      } else if (el.type === 'UIPadding') {
        lines.push(`${indent}${v}.PaddingTop = UDim.new(0, ${el.props.UIPadding_Top ?? 0.01})`)
        lines.push(`${indent}${v}.PaddingBottom = UDim.new(0, ${el.props.UIPadding_Bottom ?? 0.01})`)
        lines.push(`${indent}${v}.PaddingLeft = UDim.new(0, ${el.props.UIPadding_Left ?? 0.01})`)
        lines.push(`${indent}${v}.PaddingRight = UDim.new(0, ${el.props.UIPadding_Right ?? 0.01})`)
      } else if (el.type === 'UIListLayout') {
        lines.push(`${indent}${v}.FillDirection = Enum.FillDirection.${el.props.UIListLayout_FillDirection ?? 'Vertical'}`)
        lines.push(`${indent}${v}.Padding = UDim.new(0, ${el.props.UIListLayout_Padding ?? 0.01})`)
        lines.push(`${indent}${v}.HorizontalAlignment = Enum.HorizontalAlignment.${el.props.UIListLayout_HorizontalAlignment ?? 'Left'}`)
        lines.push(`${indent}${v}.SortOrder = Enum.SortOrder.${el.props.UIListLayout_SortOrder ?? 'LayoutOrder'}`)
      } else if (el.type === 'UIGridLayout') {
        lines.push(`${indent}${v}.CellPadding = UDim2.new(${el.props.UIGridLayout_CellPadding_X ?? 0.02}, 0, ${el.props.UIGridLayout_CellPadding_Y ?? 0.02}, 0)`)
        lines.push(`${indent}${v}.CellSize = UDim2.new(${el.props.UIGridLayout_CellSize_X ?? 0.3}, 0, ${el.props.UIGridLayout_CellSize_Y ?? 0.25}, 0)`)
      } else if (el.type === 'UIScale') {
        lines.push(`${indent}${v}.Scale = ${el.props.UIScale_Scale ?? 1.0}`)
      } else if (el.type === 'UIAspectRatioConstraint') {
        lines.push(`${indent}${v}.AspectRatio = ${el.props.UIAspectRatio_AspectRatio ?? 1.0}`)
        lines.push(`${indent}${v}.AspectType = Enum.AspectType.${el.props.UIAspectRatio_AspectType ?? 'ScaleWithParentSize'}`)
        lines.push(`${indent}${v}.DominantAxis = Enum.DominantAxis.${el.props.UIAspectRatio_DominantAxis ?? 'Width'}`)
      } else if (el.type === 'UIGradient') {
        const gColor = parseColor(el.props.UIGradient_Color || '#ffffff')
        lines.push(`${indent}${v}.Color = ColorSequence.new(${colorToRoblox(gColor)})`)
        lines.push(`${indent}${v}.Transparency = NumberSequence.new(${el.props.UIGradient_Transparency ?? 0})`)
        lines.push(`${indent}${v}.Rotation = ${el.props.UIGradient_Rotation ?? 45}`)
      }
      lines.push(`${indent}${v}.Parent = ${parentVar}`)
      lines.push('')
      return
    }

    lines.push(`${indent}local ${v} = Instance.new("${el.type}")`)
    lines.push(`${indent}${v}.Name = "${el.name}"`)

    lines.push(`${indent}${v}.Position = UDim2.new(${el.position.X}, 0, ${el.position.Y}, 0)`)
    lines.push(`${indent}${v}.Size = UDim2.new(${el.size.X}, 0, ${el.size.Y}, 0)`)

    for (const [k, val] of Object.entries(el.props)) {
      if (k === 'Position' || k === 'Size') continue
      if (k.startsWith('UI') && (k.startsWith('UICorner') || k.startsWith('UIStroke') || k.startsWith('UIPadding') || k.startsWith('UIList') || k.startsWith('UIGrid') || k.startsWith('UIScale') || k.startsWith('UIAspect') || k.startsWith('UIGradient'))) continue
      if (!differsFromDefault(k, val)) continue
      if (val === undefined || val === null) continue

      if (k === 'BackgroundColor3' || k === 'TextColor3' || k === 'BorderColor3' || k === 'ImageColor3') {
        lines.push(`${indent}${v}.${k} = ${colorToRoblox(parseColor(val))}`)
      } else if (k === 'CornerRadius') {
        lines.push(`${indent}${v}.CornerRadius = UDim.new(0, ${val})`)
      } else if (k === 'AnchorPoint' && typeof val === 'object') {
        lines.push(`${indent}${v}.AnchorPoint = Vector2.new(${val.X}, ${val.Y})`)
      } else if (k === 'CanvasSize' && typeof val === 'object') {
        lines.push(`${indent}${v}.CanvasSize = UDim2.new(${val.X}, 0, ${val.Y}, 0)`)
      } else if (typeof val === 'string') {
        lines.push(`${indent}${v}.${k} = "${val}"`)
      } else if (typeof val === 'boolean') {
        lines.push(`${indent}${v}.${k} = ${val ? 'true' : 'false'}`)
      } else if (typeof val === 'number') {
        lines.push(`${indent}${v}.${k} = ${val}`)
      }
    }
    lines.push(`${indent}${v}.Parent = ${parentVar}`)
    lines.push('')

    for (const cid of el.children) {
      const child = map.get(cid)
      if (child && child.visible) emit(child, v, depth + 1)
    }
  }

  const roots = elements.filter(e => !e.parentId)
  for (const root of roots) emit(root, 'screenGui', 0)
  lines.push('')
  lines.push('print("UI Generated by Yobest UI Builder!")')
  return lines.join('\n')
}

function genJSON(elements: UIEl[]): string {
  return JSON.stringify(elements.map(e => ({
    type: e.type, name: e.name, parentId: e.parentId,
    position: e.position, size: e.size, props: e.props,
    children: e.children, zIndex: e.zIndex,
  })), null, 2)
}

function escapeXml(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }

function genRbxmx(elements: UIEl[]): string {
  const map = new Map(elements.map(e => [e.id, e]))
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n<roblox version="4">\n'
  function emit(el: UIEl, ind = 1) {
    const p = '  '.repeat(ind)
    xml += `${p}<Item class="${el.type}">\n${p}  <Properties>\n${p}    <string name="Name">${escapeXml(el.name)}</string>\n`
    xml += `${p}    <UDim2 name="Position">{${el.position.X}, 0},{${el.position.Y}, 0}</UDim2>\n`
    xml += `${p}    <UDim2 name="Size">{${el.size.X}, 0},{${el.size.Y}, 0}</UDim2>\n`
    for (const [k, v] of Object.entries(el.props)) {
      if (['Position', 'Size', 'Name'].includes(k)) continue
      if (k === 'BackgroundColor3' || k === 'TextColor3' || k === 'BorderColor3' || k === 'ImageColor3') {
        const h = parseColor(v).replace('#', '')
        if (h.length === 6) xml += `${p}    <Color3 name="${k}">${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}</Color3>\n`
      } else if (k === 'CornerRadius') {
        xml += `${p}    <UDim name="CornerRadius">{0, ${v}}</UDim>\n`
      } else if (k === 'AnchorPoint' && typeof v === 'object') {
        xml += `${p}    <Vector2 name="AnchorPoint">${v.X}, ${v.Y}</Vector2>\n`
      } else if (typeof v === 'string') {
        xml += `${p}    <string name="${k}">${escapeXml(v)}</string>\n`
      } else if (typeof v === 'number') {
        xml += `${p}    <float name="${k}">${v}</float>\n`
      } else if (typeof v === 'boolean') {
        xml += `${p}    <bool name="${k}">${v}</bool>\n`
      }
    }
    xml += `${p}  </Properties>\n`
    for (const cid of el.children) { const c = map.get(cid); if (c) emit(c, ind + 1) }
    xml += `${p}</Item>\n`
  }
  for (const root of elements.filter(e => !e.parentId)) emit(root)
  xml += '</roblox>'
  return xml
}

// ─── Component Templates ─────────────────────────────────────
type TemplateFn = () => Array<{ action: string; name?: string; elementType?: string; parent?: string; position?: { X: number; Y: number }; size?: { X: number; Y: number }; properties?: Record<string, any> }>

const COMPONENT_TEMPLATES: { name: string; icon: string; desc: string; fn: TemplateFn }[] = [
  {
    name: 'Button', icon: '☐', desc: 'TextButton',
    fn: () => [
      { action: 'add', name: 'BtnFrame', elementType: 'Frame', size: { X: 0.18, Y: 0.08 }, properties: { BackgroundColor3: '#10b981', BackgroundTransparency: 0, CornerRadius: 8 } },
      { action: 'add', name: 'ClickMe', elementType: 'TextButton', parent: 'BtnFrame', position: { X: 0.5, Y: 0.5 }, size: { X: 1, Y: 1 }, properties: { BackgroundTransparency: 1, Text: 'Click Me', TextColor3: '#ffffff', Font: 'GothamBold', TextScaled: true } },
    ],
  },
  {
    name: 'Card', icon: '▬', desc: 'Dark card',
    fn: () => [
      { action: 'add', name: 'CardFrame', elementType: 'Frame', size: { X: 0.3, Y: 0.35 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 12 } },
      { action: 'add', name: 'CardImage', elementType: 'ImageLabel', parent: 'CardFrame', position: { X: 0.5, Y: 0.3 }, size: { X: 0.9, Y: 0.4 }, properties: { BackgroundColor3: '#334155', BackgroundTransparency: 0, CornerRadius: 8 } },
      { action: 'add', name: 'CardTitle', elementType: 'TextLabel', parent: 'CardFrame', position: { X: 0.5, Y: 0.7 }, size: { X: 0.9, Y: 0.12 }, properties: { BackgroundTransparency: 1, Text: 'Title', TextColor3: '#f1f5f9', Font: 'GothamBold', TextScaled: true, TextXAlignment: 'Left' } },
      { action: 'add', name: 'CardDesc', elementType: 'TextLabel', parent: 'CardFrame', position: { X: 0.5, Y: 0.85 }, size: { X: 0.9, Y: 0.12 }, properties: { BackgroundTransparency: 1, Text: 'Description text here', TextColor3: '#94a3b8', Font: 'Gotham', TextScaled: true, TextXAlignment: 'Left' } },
    ],
  },
  {
    name: 'Input', icon: '□', desc: 'Input field',
    fn: () => [
      { action: 'add', name: 'InputFrame', elementType: 'Frame', size: { X: 0.25, Y: 0.06 }, properties: { BackgroundColor3: '#161b22', BackgroundTransparency: 0, CornerRadius: 6, BorderSizePixel: 1, BorderColor3: '#334155' } },
      { action: 'add', name: 'InputBox', elementType: 'TextBox', parent: 'InputFrame', position: { X: 0.5, Y: 0.5 }, size: { X: 0.95, Y: 0.9 }, properties: { BackgroundTransparency: 1, Text: '', PlaceholderText: 'Enter text...', PlaceholderColor3: '#64748b', TextColor3: '#f1f5f9', Font: 'Gotham', TextSize: 14, TextXAlignment: 'Left' } },
    ],
  },
  {
    name: 'NavBar', icon: '▬', desc: 'Navigation bar',
    fn: () => [
      { action: 'add', name: 'NavBarFrame', elementType: 'Frame', size: { X: 0.4, Y: 0.07 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, CornerRadius: 10 } },
      { action: 'add', name: 'NavHome', elementType: 'TextButton', parent: 'NavBarFrame', position: { X: 0.17, Y: 0.5 }, size: { X: 0.3, Y: 0.8 }, properties: { BackgroundTransparency: 1, Text: 'Home', TextColor3: '#3b82f6', Font: 'GothamBold', TextScaled: true } },
      { action: 'add', name: 'NavSearch', elementType: 'TextButton', parent: 'NavBarFrame', position: { X: 0.5, Y: 0.5 }, size: { X: 0.3, Y: 0.8 }, properties: { BackgroundTransparency: 1, Text: 'Search', TextColor3: '#f1f5f9', Font: 'GothamBold', TextScaled: true } },
      { action: 'add', name: 'NavProfile', elementType: 'TextButton', parent: 'NavBarFrame', position: { X: 0.83, Y: 0.5 }, size: { X: 0.3, Y: 0.8 }, properties: { BackgroundTransparency: 1, Text: 'Profile', TextColor3: '#f1f5f9', Font: 'GothamBold', TextScaled: true } },
    ],
  },
  {
    name: 'Modal', icon: '▬', desc: 'Dialog popup',
    fn: () => [
      { action: 'add', name: 'ModalOverlay', elementType: 'Frame', size: { X: 1, Y: 1 }, properties: { BackgroundColor3: '#000000', BackgroundTransparency: 0.5 } },
      { action: 'add', name: 'ModalCenter', elementType: 'Frame', parent: 'ModalOverlay', position: { X: 0.5, Y: 0.5 }, size: { X: 0.35, Y: 0.4 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 16 } },
      { action: 'add', name: 'ModalTitle', elementType: 'TextLabel', parent: 'ModalCenter', position: { X: 0.5, Y: 0.15 }, size: { X: 0.8, Y: 0.15 }, properties: { BackgroundTransparency: 1, Text: 'Modal Title', TextColor3: '#f1f5f9', Font: 'GothamBold', TextScaled: true } },
      { action: 'add', name: 'ModalClose', elementType: 'TextButton', parent: 'ModalCenter', position: { X: 0.9, Y: 0.1 }, size: { X: 0.08, Y: 0.08 }, properties: { BackgroundColor3: '#ef4444', Text: 'X', TextColor3: '#ffffff', Font: 'GothamBold', TextScaled: true, CornerRadius: 50 } },
      { action: 'add', name: 'ModalContent', elementType: 'Frame', parent: 'ModalCenter', position: { X: 0.5, Y: 0.6 }, size: { X: 0.8, Y: 0.5 }, properties: { BackgroundColor3: '#161b22', BackgroundTransparency: 0, CornerRadius: 8 } },
    ],
  },
  {
    name: 'Tooltip', icon: '▬', desc: 'Info tooltip',
    fn: () => [
      { action: 'add', name: 'TooltipFrame', elementType: 'Frame', size: { X: 0.14, Y: 0.05 }, properties: { BackgroundColor3: '#334155', BackgroundTransparency: 0, CornerRadius: 6 } },
      { action: 'add', name: 'TooltipText', elementType: 'TextLabel', parent: 'TooltipFrame', position: { X: 0.5, Y: 0.5 }, size: { X: 0.9, Y: 0.85 }, properties: { BackgroundTransparency: 1, Text: 'Tooltip info', TextColor3: '#f1f5f9', Font: 'Gotham', TextScaled: true } },
    ],
  },
  {
    name: 'ProgressBar', icon: '▬', desc: 'Progress bar',
    fn: () => [
      { action: 'add', name: 'ProgressBg', elementType: 'Frame', size: { X: 0.3, Y: 0.04 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 50 } },
      { action: 'add', name: 'ProgressFill', elementType: 'Frame', parent: 'ProgressBg', position: { X: 0.35, Y: 0.5 }, size: { X: 0.7, Y: 0.85 }, properties: { BackgroundColor3: '#3b82f6', BackgroundTransparency: 0, CornerRadius: 50 } },
      { action: 'add', name: 'ProgressLabel', elementType: 'TextLabel', parent: 'ProgressBg', position: { X: 0.5, Y: 0.5 }, size: { X: 0.3, Y: 0.9 }, properties: { BackgroundTransparency: 1, Text: '70%', TextColor3: '#ffffff', Font: 'GothamBold', TextScaled: true } },
    ],
  },
  {
    name: 'Avatar', icon: '🖼', desc: 'Avatar circle',
    fn: () => [
      { action: 'add', name: 'AvatarFrame', elementType: 'Frame', size: { X: 0.08, Y: 0.14 }, properties: { BackgroundColor3: '#334155', BackgroundTransparency: 0, CornerRadius: 50 } },
      { action: 'add', name: 'AvatarImg', elementType: 'ImageLabel', parent: 'AvatarFrame', position: { X: 0.5, Y: 0.5 }, size: { X: 0.85, Y: 0.85 }, properties: { BackgroundTransparency: 1, Image: 'https://www.roblox.com/headshot-thumbnail/image?userId=1&width=150&height=150&format=png', CornerRadius: 50, ImageColor3: '#ffffff' } },
    ],
  },
]

// ─── Main Component ──────────────────────────────────────────
export default function UIGenerator() {
  const [elements, setElements] = useState<UIEl[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [buildMode, setBuildMode] = useState(true)
  const [planeMode, setPlaneMode] = useState(false)
  const [dragThreshold, setDragThreshold] = useState(false)
  const [device, setDevice] = useState(0)
  const [zoom, setZoom] = useState(0.55)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0, px: 0, py: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const gridSize = 20

  // Chat
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState('')
  const [showChat, setShowChat] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Panels
  const [showLayers, setShowLayers] = useState(true)
  const [showProps, setShowProps] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Data', 'Appearance', 'Layout']))
  const [rightTab, setRightTab] = useState<'ai' | 'templates'>('ai')

  // Layers tree
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())

  // Export
  const [showExport, setShowExport] = useState(false)
  const [showImageSearch, setShowImageSearch] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imgSearchQuery, setImgSearchQuery] = useState('')
  const [imgSearchResults, setImgSearchResults] = useState<{url:string;full:string;alt:string;author:string}[]>([])
  const [imgSearching, setImgSearching] = useState(false)
  const [instantBuild, setInstantBuild] = useState(() => localStorage.getItem('ui-instant-build') === 'true')

  // Context menu
  const [ctxMenu, setCtxMenu] = useState<{x:number; y:number; elId:string} | null>(null)

  // Layer search
  const [layerSearch, setLayerSearch] = useState('')

  // Clipboard
  const [clipboard, setClipboard] = useState<UIEl | null>(null)

  // Canvas background
  const [canvasBg, setCanvasBg] = useState('#1a1a2e')

  // Drag & Resize
  const [dragging, setDragging] = useState(false)
  const [dragData, setDragData] = useState<{ sx: number; sy: number; ox: number; oy: number; startX: number; startY: number } | null>(null)
  const [resizing, setResizing] = useState(false)
  const [resizeData, setResizeData] = useState<{ sx: number; sy: number; ow: number; oh: number; corner: string } | null>(null)

  // History
  const [hist, setHist] = useState<UIEl[][]>([[]])
  const [histIdx, setHistIdx] = useState(0)

  const canvasRef = useRef<HTMLDivElement>(null)
  const selected = useMemo(() => elements.find(e => e.id === selectedId) || null, [elements, selectedId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { localStorage.setItem('ui-instant-build', String(instantBuild)) }, [instantBuild])

  const pushHist = useCallback((els: UIEl[]) => {
    setHist(h => [...h.slice(0, histIdx + 1), els])
    setHistIdx(i => i + 1)
  }, [histIdx])
  const undo = useCallback(() => { if (histIdx > 0) { setHistIdx(histIdx - 1); setElements(hist[histIdx - 1]); setSelectedId(null) } }, [histIdx, hist])
  const redo = useCallback(() => { if (histIdx < hist.length - 1) { setHistIdx(histIdx + 1); setElements(hist[histIdx + 1]); setSelectedId(null) } }, [histIdx, hist])

  const snap = (v: number) => snapToGrid ? Math.round(v * 1000) / 1000 : v

  // ─── Element CRUD ───
  const addEl = useCallback((type: string, parentId?: string | null) => {
    const id = uid()
    const count = elements.filter(e => e.type === type).length + 1
    const isMod = ['UICorner', 'UIStroke', 'UIPadding', 'UIListLayout', 'UIGridLayout', 'UIScale', 'UIAspectRatioConstraint', 'UIGradient'].includes(type)
    const parentEl = parentId ? elements.find(e => e.id === parentId) : null
    // Modifiers can be added to any element; regular elements only to containers
    const actualParent = isMod ? (parentEl?.id || null) : (parentEl && CONTAINER_TYPES.includes(parentEl.type) ? parentId : null)
    const el: UIEl = {
      id, type, name: `${type}${count}`, parentId: actualParent,
      position: isMod ? { X: 0.5, Y: 0.5 } : { X: 0.5, Y: 0.5 },
      size: isMod ? { X: 1, Y: 1 } : { X: 0.3, Y: 0.2 },
      props: isMod ? {} : {
        BackgroundColor3: type === 'TextLabel' || type === 'TextButton' || type === 'TextBox' ? '#2a2a3e' : '#1a1a2e',
        TextColor3: '#ffffff', Text: type.includes('Text') || type === 'TextBox' ? (type === 'TextBox' ? '' : 'Text') : '',
        Font: 'GothamBold', TextScaled: true, TextSize: 14,
      },
      children: [], zIndex: elements.length + 1, locked: false, visible: true,
    }
    if (type === 'ScrollingFrame') { el.props.ScrollBarThickness = 8; el.props.CanvasSize = { X: 0, Y: 2 } }
    const newEls = [...elements, el]
    if (actualParent) { const p = newEls.find(e => e.id === actualParent); if (p) p.children = [...p.children, id] }
    setElements(newEls); pushHist(newEls); setSelectedId(id)
  }, [elements, pushHist])

  const updateEl = useCallback((id: string, patch: Partial<UIEl>) => {
    const newEls = elements.map(e => e.id === id ? { ...e, ...patch } : e)
    setElements(newEls); pushHist(newEls)
  }, [elements, pushHist])

  const updateProps = useCallback((id: string, props: Record<string, any>) => {
    const newEls = elements.map(e => e.id === id ? { ...e, props: { ...e.props, ...props } } : e)
    setElements(newEls); pushHist(newEls)
  }, [elements, pushHist])

  const removeEl = useCallback((id: string) => {
    const newEls = elements.filter(e => e.id !== id).map(e => ({ ...e, children: e.children.filter(c => c !== id) }))
    setElements(newEls); pushHist(newEls); if (selectedId === id) setSelectedId(null)
  }, [elements, selectedId, pushHist])

  const duplicateEl = useCallback((id: string) => {
    const el = elements.find(e => e.id === id); if (!el) return
    const newId = uid()
    const dup: UIEl = { ...el, id: newId, name: el.name + ' Copy', position: { X: el.position.X + 0.02, Y: el.position.Y + 0.02 }, children: [], props: { ...el.props } }
    const newEls = [...elements, dup]
    setElements(newEls); pushHist(newEls); setSelectedId(newId)
  }, [elements, pushHist])

  const copyEl = useCallback((id: string) => {
    const el = elements.find(e => e.id === id); if (!el) return
    setClipboard({ ...el })
  }, [elements])

  const pasteEl = useCallback(() => {
    if (!clipboard) return
    const newId = uid()
    const paste: UIEl = { ...clipboard, id: newId, name: clipboard.name + ' Paste', position: { X: clipboard.position.X + 0.03, Y: clipboard.position.Y + 0.03 }, children: [], props: { ...clipboard.props } }
    const newEls = [...elements, paste]
    setElements(newEls); pushHist(newEls); setSelectedId(newId)
  }, [clipboard, elements, pushHist])

  const groupEl = useCallback((id: string) => {
    const el = elements.find(e => e.id === id); if (!el || !el.parentId) return
    const siblings = elements.filter(e => e.parentId === el.parentId)
    if (siblings.length < 2) return
    const frameId = uid()
    const frame: UIEl = {
      id: frameId, type: 'Frame', name: 'Group', parentId: el.parentId,
      position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.8 },
      props: { BackgroundColor3: '#1a1a2e', BackgroundTransparency: 1, BorderSizePixel: 0, CornerRadius: 0 },
      children: siblings.map(s => s.id), zIndex: el.zIndex, locked: false, visible: true,
    }
    let newEls = elements.map(e => {
      if (e.id === el.parentId) return { ...e, children: [...e.children, frameId] }
      if (siblings.some(s => s.id === e.id)) return { ...e, parentId: frameId }
      return e
    })
    newEls = [...newEls, frame]
    setElements(newEls); pushHist(newEls)
  }, [elements, pushHist])

  const ungroupEl = useCallback((id: string) => {
    const el = elements.find(e => e.id === id); if (!el || el.type !== 'Frame' || !el.parentId) return
    const parent = elements.find(e => e.id === el.parentId)
    if (!parent) return
    let newEls = elements.map(e => {
      if (e.id === id) return null
      if (el.children.includes(e.id)) return { ...e, parentId: el.parentId }
      return e
    }).filter(Boolean) as UIEl[]
    newEls = newEls.map(e => {
      if (e.id === el.parentId) return { ...e, children: e.children.filter(c => c !== id).concat(el.children) }
      return e
    })
    setElements(newEls); pushHist(newEls); setSelectedId(null)
  }, [elements, pushHist])

  const bringToFront = useCallback((id: string) => {
    const maxZ = Math.max(...elements.map(e => e.zIndex))
    const newEls = elements.map(e => e.id === id ? { ...e, zIndex: maxZ + 1 } : e)
    setElements(newEls); pushHist(newEls)
  }, [elements, pushHist])

  const sendToBack = useCallback((id: string) => {
    const minZ = Math.min(...elements.map(e => e.zIndex))
    const newEls = elements.map(e => e.id === id ? { ...e, zIndex: Math.max(0, minZ - 1) } : e)
    setElements(newEls); pushHist(newEls)
  }, [elements, pushHist])

  // Building state
  const [building, setBuilding] = useState(false)
  const [buildingId, setBuildingId] = useState<string | null>(null)
  const [buildingMsg, setBuildingMsg] = useState('')
  const buildingRef = useRef(false)
  const elementCountRef = useRef(0)

  // ─── Layout change handler ───
  const changeLayout = useCallback((elId: string, layoutType: 'none' | 'grid' | 'list' | 'page') => {
    const newEls = elements.map(e => e.id === elId ? { ...e, layout: layoutType } : e)
    const updated = applyLayout(newEls.find(e => e.id === elId)!, newEls)
    setElements(updated); pushHist(updated)
  }, [elements, pushHist])

  const updateLayoutProps = useCallback((elId: string, patch: Partial<NonNullable<UIEl['layoutProps']>>) => {
    const newEls = elements.map(e => e.id === elId ? { ...e, layoutProps: { ...e.layoutProps, ...patch } } : e)
    const updated = applyLayout(newEls.find(e => e.id === elId)!, newEls)
    setElements(updated); pushHist(updated)
  }, [elements, pushHist])

  // ─── Image Search ───
  const SEARCH_API = `${supabaseUrl}/functions/v1/rodin-api?action=search-images`
  const searchImages = async (q: string) => {
    if (!q.trim()) return
    setImgSearching(true)
    try {
      const r = await fetch(`${SEARCH_API}&q=${encodeURIComponent(q.trim())}`)
      const d = await r.json()
      setImgSearchResults(d.images || [])
    } catch { setImgSearchResults([]) }
    setImgSearching(false)
  }

  const addImageToCanvas = (url: string) => {
    addEl('ImageLabel')
    setTimeout(() => {
      setElements(prev => {
        const n = [...prev]; const l = n[n.length - 1]
        if (l) { l.props.Image = url; l.name = `Image_${l.name.replace('Element', '')}` }
        return n
      })
    }, 0)
    setShowImageSearch(false)
    setImgSearchResults([])
    setImgSearchQuery('')
  }

  // ─── Apply template ───
  const applyTemplate = useCallback((template: typeof COMPONENT_TEMPLATES[0]) => {
    const cmds = template.fn()
    applyCmds(cmds)
  }, [])

  // ─── AI Commands (synchronized, one by one) ───
  const applyCmds = useCallback(async (cmds: any[]) => {
    if (buildingRef.current) return
    buildingRef.current = true
    setBuilding(true)
    setBuildingMsg('Building...')

    const sorted = [...cmds].sort((a: any, b: any) => {
      if (a.action === 'add' && !a.parent) return -1
      if (b.action === 'add' && !b.parent) return 1
      if (a.action === 'add' && b.action === 'add') return 0
      if (a.action === 'modify') return 1
      if (a.action === 'remove') return 2
      return 0
    })

    const nameToId = new Map<string, string>()
    let zCounter = elementCountRef.current

    const instantMode = localStorage.getItem('ui-instant-build') === 'true'
    const delay = instantMode ? 0 : 120

    for (let i = 0; i < sorted.length; i++) {
      const cmd = sorted[i]
      if (cmd.action === 'add') {
        const id = uid()
        zCounter++
        const resolvedParent = cmd.parent ? (nameToId.get(cmd.parent) || null) : null
        const isMod = cmd.elementType?.startsWith('UI') && cmd.elementType !== 'UIScrollBar'
        const el: UIEl = {
          id, type: cmd.elementType || 'Frame', name: cmd.name || `Element${zCounter}`,
          parentId: resolvedParent,
          position: isMod ? { X: 0.5, Y: 0.5 } : (cmd.position || { X: 0.5, Y: 0.5 }),
          size: isMod ? { X: 1, Y: 1 } : (cmd.size || { X: 0.3, Y: 0.2 }),
          props: isMod ? { ...cmd.properties } : { BackgroundColor3: '#1a1a2e', TextColor3: '#ffffff', Text: '', Font: 'GothamBold', TextScaled: true, TextSize: 14, ...cmd.properties },
          children: [], zIndex: zCounter, locked: false, visible: true,
        }
        nameToId.set(el.name, id)
        setBuildingId(id)
        setBuildingMsg(`Adding ${el.name}...`)
        setElements(prev => {
          const newEls = [...prev.map(e => ({ ...e })), el]
          if (el.parentId) {
            const p = newEls.find(e => e.id === el.parentId)
            if (p) {
              const updatedParent = { ...p, children: [...p.children, id] }
              const idx = newEls.findIndex(e => e.id === el.parentId)
              newEls[idx] = updatedParent
            }
          }
          elementCountRef.current = zCounter
          return newEls
        })
        if (delay > 0) await new Promise(r => setTimeout(r, delay))
      } else if (cmd.action === 'modify') {
        setBuildingMsg(`Modifying ${cmd.target}...`)
        setElements(prev => prev.map(e => e.name.toLowerCase() === (cmd.target || '').toLowerCase() ? { ...e, props: { ...e.props, ...cmd.properties } } : e))
        if (delay > 0) await new Promise(r => setTimeout(r, 60))
      } else if (cmd.action === 'remove') {
        setBuildingMsg(`Removing ${cmd.target}...`)
        setElements(prev => {
          const idx = prev.findIndex(e => e.name.toLowerCase() === (cmd.target || '').toLowerCase())
          if (idx >= 0) { const rid = prev[idx].id; return prev.filter(e => e.id !== rid).map(e => ({ ...e, children: e.children.filter(c => c !== rid) })) }
          return prev
        })
        if (delay > 0) await new Promise(r => setTimeout(r, 60))
      }
    }

    setBuildingId(null)
    setBuildingMsg('')
    setBuilding(false)
    buildingRef.current = false
    setIsLoading(false)
    setAiStatus('')
  }, [])

  // Client-side normalizer — fixes common AI output variations
  const normalizeCommands = useCallback((parsed: any): any => {
    if (!parsed || !Array.isArray(parsed.commands)) return parsed
    const skipTypes = new Set(['ScreenGui', 'LocalScript', 'Script'])
    const modifierTypes = new Set(['UICorner', 'UIStroke', 'UIPadding', 'UIListLayout', 'UIGridLayout', 'UIScale', 'UIAspectRatioConstraint', 'UIGradient'])
    const nameMap = new Map<string, string>()

    const cleaned = parsed.commands.filter((c: any) => {
      if (!c || typeof c !== 'object') return false
      if (c.action === 'create') c.action = 'add'
      if (c.action === 'delete') c.action = 'remove'
      if (!['add', 'modify', 'remove'].includes(c.action)) return false
      if (c.action === 'add' && skipTypes.has(c.elementType)) {
        if (c.name) nameMap.set(c.name, '__ROOT__')
        return false
      }
      return true
    })

    for (const c of cleaned) {
      if (c.action === 'add') {
        const isMod = modifierTypes.has(c.elementType)

        // Modifier elements don't need position/size
        if (!isMod) {
          // Position normalization
          if (typeof c.position === 'string') {
            const parts = c.position.split(/[,\s]+/).map(Number)
            c.position = { X: parts[0] || 0.5, Y: parts[1] || 0.5 }
          }
          if (!c.position || typeof c.position !== 'object') c.position = { X: 0.5, Y: 0.5 }
          if (c.position.x !== undefined) { c.position.X = c.position.x; c.position.Y = c.position.y }
          if (typeof c.position.X !== 'number' || isNaN(c.position.X)) c.position.X = 0.5
          if (typeof c.position.Y !== 'number' || isNaN(c.position.Y)) c.position.Y = 0.5
          c.position.X = Math.max(0, Math.min(1, c.position.X))
          c.position.Y = Math.max(0, Math.min(1, c.position.Y))

          // Size normalization
          if (typeof c.size === 'string') {
            const parts = c.size.split(/[,\s]+/).map(Number)
            c.size = { X: parts[0] || 0.4, Y: parts[1] || 0.5 }
          }
          if (!c.size || typeof c.size !== 'object') c.size = { X: 0.4, Y: 0.5 }
          if (c.size.x !== undefined) { c.size.X = c.size.x; c.size.Y = c.size.y }
          if (typeof c.size.X !== 'number' || isNaN(c.size.X)) c.size.X = 0.4
          if (typeof c.size.Y !== 'number' || isNaN(c.size.Y)) c.size.Y = 0.5
          c.size.X = Math.max(0.02, Math.min(1.5, c.size.X))
          c.size.Y = Math.max(0.02, Math.min(1.5, c.size.Y))
        } else {
          // Modifiers: normalize properties only
          c.position = { X: 0.5, Y: 0.5 }
          c.size = { X: 1, Y: 1 }
        }

        // Parent fixes
        if (c.parent && nameMap.has(c.parent)) c.parent = null
        if (typeof c.parent === 'string' && ['CoreGui', 'StarterGui', 'game.Players.LocalPlayer.PlayerGui'].includes(c.parent)) c.parent = null

        // Properties
        if (!c.properties || typeof c.properties !== 'object') c.properties = {}
        const props = c.properties
        for (const key of ['BackgroundColor3', 'TextColor3', 'ImageColor3']) {
          if (typeof props[key] === 'string' && props[key].includes('fromRGB')) {
            const m = props[key].match(/fromRGB\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
            if (m) props[key] = `#${parseInt(m[1]).toString(16).padStart(2, '0')}${parseInt(m[2]).toString(16).padStart(2, '0')}${parseInt(m[3]).toString(16).padStart(2, '0')}`
          }
        }
        if (!c.name) c.name = `${c.elementType}${Math.random().toString(36).substring(2, 6)}`
        if (typeof props.BackgroundTransparency === 'number') props.BackgroundTransparency = Math.max(0, Math.min(1, props.BackgroundTransparency))
        if (typeof props.CornerRadius === 'number') props.CornerRadius = Math.max(0, Math.min(50, props.CornerRadius))
      }
      if (c.action === 'modify') {
        if (c.target && !c.name) c.name = c.target
        if (!c.properties) {
          c.properties = {}
          for (const k of ['BackgroundColor3', 'TextColor3', 'Text', 'TextScaled', 'Font', 'CornerRadius', 'BackgroundTransparency', 'Image', 'BorderSizePixel']) {
            if (c[k] !== undefined) { c.properties[k] = c[k]; delete c[k] }
          }
        }
      }
    }

    parsed.commands = cleaned.filter((c: any) => {
      if (c.action === 'add') return c.elementType && c.name
      if (c.action === 'modify') return (c.target || c.name) && c.properties
      if (c.action === 'remove') return c.target || c.name
      return false
    })
    return parsed
  }, [])

  const sendMsg = async (text?: string) => {
    const msg = (text || input).trim(); if (!msg || isLoading || building) return
    const um: ChatMsg = { role: 'user', content: msg }
    setMessages(p => [...p, um]); setInput(''); setIsLoading(true)

    const editKeywords = ['change', 'make', 'edit', 'update', 'modify', 'alter', 'adjust', 'tweak', 'better', 'improve', 'fix', 'remove', 'delete', 'add', 'move', 'resize', 'recolor', 'replace', 'swap']
    const lowerMsg = msg.toLowerCase()
    const isEditRequest = elements.length > 0 && editKeywords.some(k => lowerMsg.includes(k))

    try {
      const cs = elements.map(e => ({ name: e.name, type: e.type, parent: e.parentId ? elements.find(p => p.id === e.parentId)?.name || null : null, position: e.position, size: e.size, props: e.props }))

      let canvasContext = ''
      if (cs.length > 0) {
        const lines = cs.map((e, i) => `[${i+1}] ${e.name} (${e.type}) parent=${e.parent || 'null'} pos=(${e.position.X.toFixed(3)},${e.position.Y.toFixed(3)}) sz=(${e.size.X.toFixed(3)},${e.size.Y.toFixed(3)})`)
        canvasContext = `\n\n=== EXISTING CANVAS (${cs.length} elements) ===\n${lines.join('\n')}\n\nUse EXACT element names above for modify/remove.`
      }

      let editInstruction = ''
      if (isEditRequest) {
        editInstruction = `\n\n*** EDIT MODE — DO NOT CREATE NEW UI ***\nThe canvas has ${cs.length} elements. Output ONLY "modify" and/or "remove" commands. DO NOT output "add" commands. Use EXACT element names from the canvas.`
      }

      const systemMsg = UI_SYSTEM_PROMPT + canvasContext + editInstruction

      // ── Step 1: Try AI — proxy through ai-proxy edge function (Gemini BYOK) ──
      let parsed: any = null
      const models = [
        'gemini-2.5-flash',
        'gemini-2.5-flash-pro',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
      ]

      for (const model of models) {
        if (parsed) break
        setAiStatus(`Trying ${model}...`)
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 60000)
          const payload = {
            messages: [
              { role: 'system', content: systemMsg },
              { role: 'user', content: msg },
            ],
            model,
            temperature: 0.3,
            max_tokens: 4000,
          }
          const r = await fetch(AI_PROXY, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          })
          clearTimeout(timeout)
          const data = await r.json()
          if (data.error) {
            console.log(`AI proxy ${model} returned error:`, data.error)
            continue
          }
          const content = data.choices?.[0]?.message?.content || ''
          if (content) {
            try { parsed = JSON.parse(content) } catch {
              const m = content.match(/\{[\s\S]*\}/)
              if (m) try { parsed = JSON.parse(m[0]) } catch {}
            }
          }
          if (parsed) {
            parsed = normalizeCommands(parsed)
            console.log(`Gemini model ${model} succeeded`)
          }
        } catch (e) {
          console.log(`AI proxy model ${model} failed:`, e instanceof Error ? e.message : e)
        }
      }

      // ── Step 2: If AI failed, try edge function template fallback ──
      if (!parsed || !parsed.commands?.length) {
        console.log('AI failed, trying edge template fallback')
        try {
          const tmplResp = await fetch(CHAT_API, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: msg }], canvas_state: cs, force_template: true }),
          })
          if (tmplResp.ok) {
            parsed = await tmplResp.json()
          }
        } catch (e) {
          console.log('Edge template fallback failed:', e instanceof Error ? e.message : e)
        }
      }

      // ── Step 3: If edge function also failed, use LOCAL client-side template ──
      if (!parsed || !parsed.commands?.length) {
        console.log('Using local template fallback')
        parsed = localTemplateFallback(msg)
      }

      // ── Step 4: Apply commands ──
      if (parsed?.commands?.length) {
        const am: ChatMsg = { role: 'assistant', content: parsed.message || 'Built your UI', commands: parsed.commands }
        setMessages(p => [...p, am])
        await applyCmds(parsed.commands)
      } else {
        setMessages(p => [...p, { role: 'assistant', content: 'No UI elements generated. Try describing what you want, like "shop with 4 items" or "health bar HUD".' }])
        setIsLoading(false)
        setAiStatus('')
      }
    } catch (e) {
      console.error('UI Builder error:', e)
      setIsLoading(false)
      setAiStatus('')
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      const isNetwork = errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('Failed to')
      setMessages(p => [...p, { role: 'assistant', content: isNetwork
        ? 'Connection error — AI is unreachable. A local template has been applied as backup. You can also try the Templates tab for pre-built components.'
        : `Error: ${errMsg}. Try again or use the Templates tab.` }])
    }
  }

  // ─── Canvas Interactions ───
  const dev = DEVICES[device]
  const cw = dev.w * zoom; const ch = dev.h * zoom

  const handleCanvasDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true); setPanStart({ x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }); return
    }
    if (buildMode && e.button === 0 && selectedId && canvasRef.current) {
      const el = elements.find(x => x.id === selectedId); if (!el || el.locked) return
      const rect = canvasRef.current.getBoundingClientRect()
      const sx = (e.clientX - rect.left) / rect.width
      const sy = (e.clientY - rect.top) / rect.height
      setDragData({ sx, sy, ox: el.position.X, oy: el.position.Y, startX: e.clientX, startY: e.clientY })
      setDragThreshold(false)
    }
  }, [buildMode, selectedId, elements, pan])

  const handleCanvasMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: panStart.px + (e.clientX - panStart.x), y: panStart.py + (e.clientY - panStart.y) }); return
    }
    if (dragData && selectedId && canvasRef.current) {
      // Check drag threshold (3px)
      if (!dragThreshold) {
        const dx = e.clientX - dragData.startX
        const dy = e.clientY - dragData.startY
        if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return
        setDragThreshold(true)
        setDragging(true)
      }
      const rect = canvasRef.current.getBoundingClientRect()
      const dx = ((e.clientX - rect.left) / rect.width - dragData.sx) / zoom
      const dy = ((e.clientY - rect.top) / rect.height - dragData.sy) / zoom
      const nx = Math.max(0, Math.min(1, snap(dragData.ox + dx)))
      const ny = Math.max(0, Math.min(1, snap(dragData.oy + dy)))
      setElements(prev => prev.map(el => el.id === selectedId ? { ...el, position: { X: nx, Y: ny } } : el))
    }
    if (resizing && resizeData && selectedId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const dx = ((e.clientX - rect.left) / rect.width - (resizeData.sx - rect.left) / rect.width) / zoom
      const dy = ((e.clientY - rect.top) / rect.height - (resizeData.sy - rect.top) / rect.height) / zoom
      let nw = resizeData.ow, nh = resizeData.oh
      if (resizeData.corner.includes('e')) nw = Math.max(0.01, resizeData.ow + dx)
      if (resizeData.corner.includes('s')) nh = Math.max(0.01, resizeData.oh + dy)
      if (resizeData.corner.includes('w')) nw = Math.max(0.01, resizeData.ow - dx)
      if (resizeData.corner.includes('n')) nh = Math.max(0.01, resizeData.oh - dy)
      setElements(prev => prev.map(el => el.id === selectedId ? { ...el, size: { X: snap(nw), Y: snap(nh) } } : el))
    }
  }, [isPanning, panStart, dragData, resizing, resizeData, selectedId, zoom, snap, dragThreshold])

  const handleCanvasUp = useCallback(() => {
    if (dragging) pushHist(elements)
    setIsPanning(false); setDragging(false); setResizing(false); setDragData(null); setResizeData(null); setDragThreshold(false)
  }, [dragging, elements, pushHist])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedId) { e.preventDefault(); removeEl(selectedId) } }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo() }
      if (e.ctrlKey && e.key === 'd') { e.preventDefault(); if (selectedId) duplicateEl(selectedId) }
      if (e.ctrlKey && e.key === 'c') { e.preventDefault(); if (selectedId) copyEl(selectedId) }
      if (e.ctrlKey && e.key === 'v') { e.preventDefault(); pasteEl() }
      if (e.key === 'Escape') { if (planeMode) setPlaneMode(false); else { setSelectedId(null); setCtxMenu(null) } }
      if (selectedId && buildMode && !building) {
        const nudge = e.shiftKey ? 0.01 : 0.005
        const el = elements.find(x => x.id === selectedId); if (!el) return
        if (e.key === 'ArrowLeft') { e.preventDefault(); updateEl(selectedId, { position: { X: Math.max(0, el.position.X - nudge), Y: el.position.Y } }) }
        if (e.key === 'ArrowRight') { e.preventDefault(); updateEl(selectedId, { position: { X: Math.min(1, el.position.X + nudge), Y: el.position.Y } }) }
        if (e.key === 'ArrowUp') { e.preventDefault(); updateEl(selectedId, { position: { X: el.position.X, Y: Math.max(0, el.position.Y - nudge) } }) }
        if (e.key === 'ArrowDown') { e.preventDefault(); updateEl(selectedId, { position: { X: el.position.X, Y: Math.min(1, el.position.Y + nudge) } }) }
      }
    }
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler)
  }, [selectedId, buildMode, building, elements, removeEl, updateEl, undo, redo, duplicateEl, copyEl, pasteEl, planeMode])

  const suggestedPrompts = [
    'Create a neon cyberpunk shop with glowing borders',
    'Medieval fantasy inventory with rarity-colored item slots',
    'Anime-style character stats panel with level and XP bar',
    'Space galaxy themed main menu with nebula background',
    'Steampunk settings panel with brass-colored toggles',
    'Underwater themed quest tracker with bubble effects',
    'Military tactical HUD with radar-style health display',
    'Fun colorful daily rewards calendar with bouncing icons',
    'Dark elegant guild leaderboard with gold accents',
    'Toxic gamer-style kill feed with neon green highlights',
  ]

  const quickPresets = [
    { label: 'Shop', emoji: '🛒', prompt: 'Create a shop with a unique style - surprise me!' },
    { label: 'Menu', emoji: '🎮', prompt: 'Design a main menu that looks like a AAA Roblox game' },
    { label: 'HUD', emoji: '❤️', prompt: 'Build a stylish HUD with health, mana, and XP bars' },
    { label: 'Inventory', emoji: '🎒', prompt: 'Make an inventory grid with item rarity colors' },
    { label: 'Stats', emoji: '⚔️', prompt: 'Create a character stats panel with avatar and level' },
    { label: 'Quest', emoji: '📜', prompt: 'Design a quest tracker with progress bars and objectives' },
  ]

  // ─── Element Style ───
  function elStyle(el: UIEl, isHoveredContainer = false): React.CSSProperties {
    const p = el.props
    return {
      position: 'absolute', left: `${el.position.X * 100}%`, top: `${el.position.Y * 100}%`,
      width: `${el.size.X * 100}%`, height: `${el.size.Y * 100}%`,
      transform: `translate(-50%, -50%)${p.Rotation ? ` rotate(${p.Rotation}deg)` : ''}`,
      backgroundColor: (p.BackgroundTransparency ?? 0) >= 1 ? 'transparent' : parseColor(p.BackgroundColor3),
      borderRadius: p.CornerRadius || 0,
      border: p.BorderSizePixel > 0 ? `${p.BorderSizePixel}px solid ${parseColor(p.BorderColor3)}` : undefined,
      zIndex: el.zIndex || 1, overflow: el.type === 'ScrollingFrame' ? 'auto' : 'hidden',
      opacity: el.visible ? 1 : 0.3, outline: selectedId === el.id ? '2px solid #3b82f6' : undefined,
      outlineOffset: '1px',
    }
  }

  function childStyle(el: UIEl): React.CSSProperties {
    const p = el.props
    return {
      position: 'absolute', left: `${el.position.X * 100}%`, top: `${el.position.Y * 100}%`,
      width: `${el.size.X * 100}%`, height: `${el.size.Y * 100}%`,
      transform: 'translate(-50%, -50%)',
      backgroundColor: (p.BackgroundTransparency ?? 0) >= 1 ? 'transparent' : parseColor(p.BackgroundColor3),
      borderRadius: p.CornerRadius || 0, zIndex: el.zIndex || 1, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: p.BorderSizePixel > 0 ? `${p.BorderSizePixel}px solid ${parseColor(p.BorderColor3)}` : undefined,
    }
  }

  // ─── Layers Tree ───
  const toggleCollapse = (id: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const renderLayerTree = (parentId: string | null, depth: number): React.ReactNode => {
    const children = elements.filter(e => e.parentId === parentId)
    if (children.length === 0) return null
    return children.map(el => {
      const isContainer = CONTAINER_TYPES.includes(el.type)
      const isCollapsed = collapsedNodes.has(el.id)
      const childCount = el.children.length
      const matchesSearch = !layerSearch || el.name.toLowerCase().includes(layerSearch.toLowerCase()) || el.type.toLowerCase().includes(layerSearch.toLowerCase())
      const hasMatchingChild = layerSearch && el.children.some(cid => {
        const child = elements.find(e => e.id === cid)
        return child && (child.name.toLowerCase().includes(layerSearch.toLowerCase()) || child.type.toLowerCase().includes(layerSearch.toLowerCase()))
      })
      if (!matchesSearch && !hasMatchingChild && layerSearch) return null
      return (
        <div key={el.id}>
          <div
            className={cn('flex items-center gap-1.5 px-2 py-1 cursor-pointer transition-all group',
              selectedId === el.id ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-secondary hover:bg-bg-elevated')}
            onClick={() => setSelectedId(el.id)}
            onContextMenu={(e) => { e.preventDefault(); setSelectedId(el.id); setCtxMenu({ x: e.clientX, y: e.clientY, elId: el.id }) }}
            style={{ paddingLeft: `${12 + depth * 12}px` }}>
            {isContainer && childCount > 0 ? (
              <button onClick={(e) => { e.stopPropagation(); toggleCollapse(el.id) }}
                className="p-0.5 shrink-0">
                {isCollapsed ? <ChevronRight size={9} className="text-text-dim" /> : <ChevronDown size={9} className="text-text-dim" />}
              </button>
            ) : (
              <span className="w-[15px] shrink-0" />
            )}
            <span className="text-[10px] text-text-dim w-4 shrink-0 text-center">
              {ELEMENT_TYPE_ICONS[el.type] || '□'}
            </span>
            <span className="flex-1 text-[10px] truncate font-medium">{el.name}</span>
            {isContainer && childCount > 0 && (
              <span className="px-1 py-0 rounded text-[8px] font-mono bg-bg-secondary text-text-dim border border-border-primary">{childCount}</span>
            )}
            <button onClick={(e) => { e.stopPropagation(); updateEl(el.id, { visible: !el.visible }) }} className="opacity-0 group-hover:opacity-100 p-0.5 transition-opacity">
              {el.visible ? <Eye size={9} className="text-text-dim" /> : <EyeOff size={9} className="text-red-400" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); updateEl(el.id, { locked: !el.locked }) }} className="opacity-0 group-hover:opacity-100 p-0.5 transition-opacity">
              {el.locked ? <Lock size={9} className="text-yellow-400" /> : <Unlock size={9} className="text-text-dim" />}
            </button>
          </div>
          {isContainer && !isCollapsed && renderLayerTree(el.id, depth + 1)}
        </div>
      )
    })
  }

  // ─── Specialized property controls ───
  const renderPropControl = (key: string, val: any) => {
    if (!selected) return null

    // Font dropdown
    if (key === 'Font') {
      return (
        <select value={String(val || 'Legacy')}
          onChange={e => updateProps(selected.id, { [key]: e.target.value })}
          className="flex-1 px-1.5 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary focus:outline-none focus:border-accent-blue/50">
          {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      )
    }

    // TextXAlignment dropdown
    if (key === 'TextXAlignment') {
      return (
        <select value={String(val || 'Center')}
          onChange={e => updateProps(selected.id, { [key]: e.target.value })}
          className="flex-1 px-1.5 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary focus:outline-none focus:border-accent-blue/50">
          {TEXT_X_ALIGN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }

    // TextYAlignment dropdown
    if (key === 'TextYAlignment') {
      return (
        <select value={String(val || 'Center')}
          onChange={e => updateProps(selected.id, { [key]: e.target.value })}
          className="flex-1 px-1.5 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary focus:outline-none focus:border-accent-blue/50">
          {TEXT_Y_ALIGN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }

    // AutomaticCanvasSize dropdown
    if (key === 'AutomaticCanvasSize') {
      return (
        <select value={String(val || 'None')}
          onChange={e => updateProps(selected.id, { [key]: e.target.value })}
          className="flex-1 px-1.5 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary focus:outline-none focus:border-accent-blue/50">
          {AUTOMATIC_CANVAS_SIZE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }

    // Range sliders for transparency props
    if (key === 'BackgroundTransparency' || key === 'ImageTransparency' || key === 'TextTransparency') {
      const numVal = typeof val === 'number' ? val : 0
      return (
        <div className="flex items-center gap-1.5 flex-1">
          <input type="range" min="0" max="1" step="0.01" value={numVal}
            onChange={e => updateProps(selected.id, { [key]: parseFloat(e.target.value) })}
            className="flex-1 h-1 accent-accent-blue cursor-pointer" />
          <span className="text-[8px] text-text-dim font-mono w-7 text-right">{numVal.toFixed(2)}</span>
        </div>
      )
    }

    // CornerRadius range slider
    if (key === 'CornerRadius') {
      const numVal = typeof val === 'number' ? val : 0
      return (
        <div className="flex items-center gap-1.5 flex-1">
          <input type="range" min="0" max="50" step="1" value={numVal}
            onChange={e => updateProps(selected.id, { [key]: parseInt(e.target.value) })}
            className="flex-1 h-1 accent-accent-blue cursor-pointer" />
          <span className="text-[8px] text-text-dim font-mono w-7 text-right">{numVal}</span>
        </div>
      )
    }

    // Toggle buttons for boolean props
    if (key === 'TextScaled' || key === 'RichText' || key === 'TextWrapped') {
      return (
        <button onClick={() => updateProps(selected.id, { [key]: !val })}
          className={cn('px-2 py-0.5 rounded text-[9px] font-medium transition-all',
            val ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-bg-secondary text-text-dim border border-border-primary')}>
          {val ? 'On' : 'Off'}
        </button>
      )
    }

    // Is color?
    const isColor = k => (k.toLowerCase().includes('color') || k === 'BackgroundColor3' || k === 'TextColor3' || k === 'BorderColor3' || k === 'ImageColor3' || k === 'ScrollBarImageColor3')
    if (isColor(key)) {
      return (
        <div className="flex items-center gap-1 flex-1">
          <input type="color" value={parseColor(val)} onChange={e => updateProps(selected.id, { [key]: e.target.value })}
            className="w-5 h-5 rounded border border-border-primary cursor-pointer shrink-0" />
          <input value={parseColor(val)} onChange={e => updateProps(selected.id, { [key]: e.target.value })}
            className="flex-1 px-1.5 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
        </div>
      )
    }

    // Default: boolean toggle
    if (typeof val === 'boolean') {
      return (
        <button onClick={() => updateProps(selected.id, { [key]: !val })}
          className={cn('px-2 py-0.5 rounded text-[9px] font-medium transition-all', val ? 'bg-green-500/15 text-green-400' : 'bg-bg-secondary text-text-dim')}>
          {val ? 'True' : 'False'}
        </button>
      )
    }

    // Number
    if (typeof val === 'number') {
      return (
        <input type="number" step="1" value={val}
          onChange={e => updateProps(selected.id, { [key]: parseFloat(e.target.value) || 0 })}
          className="flex-1 px-1.5 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
      )
    }

    // String fallback
    return (
      <input value={String(val ?? '')}
        onChange={e => updateProps(selected.id, { [key]: e.target.value })}
        className="flex-1 px-1.5 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
    )
  }

  const isColorProp = (k: string) => (k.toLowerCase().includes('color') || k === 'BackgroundColor3' || k === 'TextColor3' || k === 'BorderColor3' || k === 'ImageColor3' || k === 'ScrollBarImageColor3')

  // ─── Render ───
  const roots = elements.filter(e => !e.parentId)
  const isContainerSelected = selected && CONTAINER_TYPES.includes(selected.type)
  const selectedLayout = selected?.layout || 'none'

  return (
    <div className="flex flex-col rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden" style={{ height: '75vh', minHeight: 650 }}>

      {/* ─── Top Bar ─── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-primary bg-bg-elevated/80">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-accent-purple" />
          <span className="text-xs font-bold text-text-primary">UI Builder</span>
          {elements.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono text-text-dim bg-bg-secondary border border-border-primary">{elements.length} el</span>
          )}
        </div>
        <div className="h-4 w-px bg-border-primary" />

        {/* Device Preview */}
        <div className="flex items-center gap-0.5 p-0.5 bg-bg-secondary rounded-lg border border-border-primary">
          {DEVICES.map((d, i) => {
            const Icon = d.icon
            return (
              <button key={i} onClick={() => setDevice(i)} title={d.name}
                className={cn('p-1.5 rounded-md transition-all', device === i ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-dim hover:text-text-muted')}>
                <Icon size={13} />
              </button>
            )
          })}
        </div>
        <span className="text-[10px] text-text-dim font-mono">{dev.w}×{dev.h}</span>

        <div className="h-4 w-px bg-border-primary" />

        {/* Tools */}
        <button onClick={() => setBuildMode(!buildMode)} className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all', buildMode ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-text-dim hover:text-text-muted border border-transparent')} title="Toggle select/drag/resize mode">
          <MousePointer2 size={11} /> Build
        </button>
        <button onClick={() => elements.length > 0 && setPlaneMode(!planeMode)} className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all', planeMode ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20' : elements.length === 0 ? 'text-text-dim/30 border border-transparent cursor-not-allowed' : 'text-text-dim hover:text-text-muted border border-transparent')} title={elements.length === 0 ? "Add elements first to preview" : "Fullscreen preview of your UI"}>
          <Eye size={11} /> Preview
        </button>
        <button onClick={() => setShowGrid(!showGrid)} className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all', showGrid ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20' : 'text-text-dim hover:text-text-muted border border-transparent')}>
          <Grid3X3 size={11} /> Grid
        </button>
        <button onClick={() => setSnapToGrid(!snapToGrid)} className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all', snapToGrid ? 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20' : 'text-text-dim hover:text-text-muted border border-transparent')}>
          Snap
        </button>
        <button onClick={() => setInstantBuild(!instantBuild)} className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all', instantBuild ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-text-dim hover:text-text-muted border border-transparent')} title="Skip animation, build instantly">
          <Zap size={11} /> Instant
        </button>
        <div className="flex items-center gap-1" title="Canvas background color">
          <span className="text-[9px] text-text-dim">BG:</span>
          <input type="color" value={canvasBg} onChange={e => setCanvasBg(e.target.value)}
            className="w-5 h-5 rounded border border-border-primary cursor-pointer" />
        </div>

        {/* Layout mode selector - only visible when container is selected */}
        {isContainerSelected && (
          <>
            <div className="h-4 w-px bg-border-primary" />
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-text-dim font-medium">Layout:</span>
              <div className="flex items-center gap-0.5 p-0.5 bg-bg-secondary rounded border border-border-primary">
                {(['none', 'grid', 'list'] as const).map(lt => (
                  <button key={lt} onClick={() => changeLayout(selected!.id, lt)}
                    className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium transition-all capitalize',
                      selectedLayout === lt ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-dim hover:text-text-muted')}>
                    {lt}
                  </button>
                ))}
              </div>
            </div>
            {selectedLayout !== 'none' && (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-text-dim">Gap:</span>
                  <input type="number" step="0.001" min="0" max="0.1"
                    value={selected?.layoutProps?.gap ?? 0.005}
                    onChange={e => selected && updateLayoutProps(selected.id, { gap: parseFloat(e.target.value) || 0 })}
                    className="w-12 px-1 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-text-dim">Pad:</span>
                  <input type="number" step="0.001" min="0" max="0.1"
                    value={selected?.layoutProps?.padding ?? 0.01}
                    onChange={e => selected && updateLayoutProps(selected.id, { padding: parseFloat(e.target.value) || 0 })}
                    className="w-12 px-1 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
                </div>
                {selectedLayout === 'grid' && (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-text-dim">CellX:</span>
                      <input type="number" step="0.01" min="0.01" max="1"
                        value={selected?.layoutProps?.cellSize?.X ?? 0.2}
                        onChange={e => selected && updateLayoutProps(selected.id, { cellSize: { X: parseFloat(e.target.value) || 0.2, Y: selected.layoutProps?.cellSize?.Y ?? 0.15 } })}
                        className="w-12 px-1 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-text-dim">CellY:</span>
                      <input type="number" step="0.01" min="0.01" max="1"
                        value={selected?.layoutProps?.cellSize?.Y ?? 0.15}
                        onChange={e => selected && updateLayoutProps(selected.id, { cellSize: { X: selected.layoutProps?.cellSize?.X ?? 0.2, Y: parseFloat(e.target.value) || 0.15 } })}
                        className="w-12 px-1 py-0.5 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        <div className="h-4 w-px bg-border-primary" />

        {/* Zoom */}
        <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1 rounded text-text-dim hover:text-text-muted"><ZoomIn size={12} /></button>
        <span className="text-[10px] text-text-dim w-8 text-center font-mono">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-1 rounded text-text-dim hover:text-text-muted"><ZoomOut size={12} /></button>
        <button onClick={() => { setZoom(0.55); setPan({ x: 0, y: 0 }) }} className="p-1 rounded text-text-dim hover:text-text-muted"><RotateCcw size={11} /></button>

        <div className="flex-1" />

        {/* Add + Export */}
        <div className="flex items-center gap-1">
          {ELEMENT_TYPES.map(et => (
            <button key={et.type} onClick={() => addEl(et.type, selectedId)} title={`Add ${et.label}`}
              className="px-2 py-1 rounded-md text-[10px] text-text-dim hover:text-text-primary hover:bg-bg-secondary border border-transparent hover:border-border-hover transition-all">
              + {et.desc}
            </button>
          ))}
          <div className="h-4 w-px bg-border-primary mx-1" />
          {MODIFIER_TYPES.map(mt => (
            <button key={mt.type} onClick={() => addEl(mt.type, selectedId || undefined)} title={`Add ${mt.label}`}
              className="px-2 py-1 rounded-md text-[10px] text-accent-purple/70 hover:text-accent-purple hover:bg-accent-purple/10 border border-transparent hover:border-accent-purple/20 transition-all">
              + {mt.desc}
            </button>
          ))}
        </div>

        <button onClick={() => setShowImageSearch(true)} className="p-1.5 rounded-md text-text-dim hover:text-text-muted hover:bg-bg-secondary transition-all"><ImageIcon size={12} /></button>
        <button onClick={() => setShowExport(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-accent-purple/15 text-accent-purple border border-accent-purple/20 hover:bg-accent-purple/25 transition-all">
          <Download size={11} /> Export
        </button>
      </div>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex min-h-0">

        {/* ─── Layers Panel ─── */}
        {showLayers && (
          <div className="w-52 border-r border-border-primary flex flex-col bg-bg-primary/30">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border-primary">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Layers</span>
              <span className="text-[10px] text-text-dim">{elements.length}</span>
            </div>
            {elements.length > 0 && (
              <div className="px-2 py-1.5 border-b border-border-primary/50">
                <input value={layerSearch} onChange={e => setLayerSearch(e.target.value)} placeholder="Search layers..."
                  className="w-full px-2 py-1 rounded bg-bg-secondary border border-border-primary text-[9px] text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50" />
              </div>
            )}
            <div className="flex-1 overflow-y-auto py-1">
              {elements.length === 0 && <p className="px-3 py-4 text-[10px] text-text-dim text-center">No elements yet</p>}
              {renderLayerTree(null, 0)}
            </div>
          </div>
        )}

        {/* ─── Canvas ─── */}
        <div className="flex-1 overflow-hidden bg-[#08080c] relative"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); handleCanvasDown(e) }} onMouseMove={handleCanvasMove} onMouseUp={handleCanvasUp} onMouseLeave={handleCanvasUp}
          style={{ cursor: isPanning ? 'grabbing' : 'default' }}>
          <div ref={canvasRef} className="absolute" style={{
            width: cw, height: ch,
            left: `calc(50% + ${pan.x}px)`, top: `calc(50% + ${pan.y}px)`,
            transform: 'translate(-50%, -50%)',
          }}>
            {/* Grid */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none rounded-lg" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                backgroundSize: `${cw / (dev.w / gridSize)}px ${ch / (dev.h / gridSize)}px`
              }} />
            )}
            {/* Screen */}
            <div className="absolute inset-0 rounded-lg border border-white/5 shadow-2xl overflow-hidden" style={{ backgroundColor: canvasBg }}>
              {/* Recursive element renderer */}
              {(() => {
                const renderEl = (el: UIEl, isChild = false): React.ReactNode => {
                  if (!el.visible) return null
                  const isModifier = el.type.startsWith('UI') && el.type !== 'UIScrollBar'
                  if (isModifier) return null // Modifiers are applied to parent, not rendered directly
                  const childEls = el.children.map(cid => elements.find(e => e.id === cid)).filter(Boolean) as UIEl[]
                  const isBuilding = buildingId === el.id
                  const isContainer = CONTAINER_TYPES.includes(el.type)
                  const isSelectedContainer = selectedId === el.id && isContainer

                  // Gather modifier props from children
                  const uiCorner = childEls.find(c => c.type === 'UICorner')
                  const uiStroke = childEls.find(c => c.type === 'UIStroke')

                  const style = isChild ? childStyle(el) : elStyle(el)

                  // Apply UIStroke to style
                  if (uiStroke) {
                    const strokeColor = parseColor(uiStroke.props.UIStroke_Color || '#ffffff')
                    const thickness = (uiStroke.props.UIStroke_Thickness ?? 2) * 1.5
                    const transparency = uiStroke.props.UIStroke_Transparency ?? 0.3
                    style.border = `${thickness}px solid ${strokeColor}${Math.round((1 - transparency) * 255).toString(16).padStart(2, '0')}`
                  }

                  // Add dashed border on hover for containers
                  const containerBorderClass = isContainer && !isSelectedContainer ? 'hover:border-2 hover:border-dashed hover:border-white/20' : ''
                  // Grid layout grid lines overlay
                  const showLayoutGrid = isSelectedContainer && el.layout === 'grid' && el.layoutProps
                  const gridGap = el.layoutProps?.gap ?? 0.005
                  const gridPad = el.layoutProps?.padding ?? 0.01
                  const cellW = el.layoutProps?.cellSize?.X ?? 0.2
                  const cellH = el.layoutProps?.cellSize?.Y ?? 0.15

                  return (
                    <div key={el.id}
                      style={{
                        ...style,
                        borderStyle: isContainer ? 'dashed' : style.borderStyle,
                        outline: selectedId === el.id ? '2px solid #3b82f6' : style.outline,
                        outlineOffset: '2px',
                      }}
                      className={cn('cursor-pointer select-none group', isBuilding && 'el-building', isContainer && 'hover:ring-1 hover:ring-white/10')}
                      onClick={(e) => { e.stopPropagation(); setSelectedId(el.id) }}
                      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedId(el.id); setCtxMenu({ x: e.clientX, y: e.clientY, elId: el.id }) }}
                      onMouseDown={(e) => { e.stopPropagation(); if (buildMode && !el.locked) { setSelectedId(el.id); handleCanvasDown(e) } }}>
                      {childEls.map(child => renderEl(child, true))}
                      {/* Hover label */}
                      {selectedId !== el.id && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-mono bg-black/80 text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {el.name} ({el.type})
                        </div>
                      )}
                      {/* Layout grid lines */}
                      {showLayoutGrid && childEls.length === 0 && (
                        <div className="absolute inset-0 pointer-events-none">
                          {(() => {
                            const lines: React.ReactNode[] = []
                            const usableW = 100 - gridPad * 200
                            const cols = Math.max(1, Math.floor(usableW / ((cellW * 100) + gridGap * 100)))
                            for (let i = 0; i <= cols; i++) {
                              const x = gridPad * 100 + i * (cellW * 100 + gridGap * 100)
                              lines.push(<div key={`vl${i}`} className="absolute top-0 bottom-0 border-l border-dashed border-white/10" style={{ left: `${x}%` }} />)
                            }
                            for (let r = 0; r < 20; r++) {
                              const y = gridPad * 100 + r * (cellH * 100 + gridGap * 100)
                              if (y > 100) break
                              lines.push(<div key={`hl${r}`} className="absolute left-0 right-0 border-t border-dashed border-white/10" style={{ top: `${y}%` }} />)
                            }
                            return lines
                          })()}
                        </div>
                      )}
                      {/* Drop zone indicator for containers when dragging */}
                      {isContainer && dragging && selectedId !== el.id && (
                        <div className="absolute inset-1 rounded-lg border-2 border-dashed border-accent-blue/30 flex items-center justify-center pointer-events-none">
                          <div className="bg-accent-blue/10 rounded-full p-1">
                            <Plus size={12} className="text-accent-blue/50" />
                          </div>
                        </div>
                      )}
                      {(el.type === 'TextLabel' || el.type === 'TextButton' || el.type === 'TextBox') && childEls.length === 0 && (
                        <span style={{ color: parseColor(el.props.TextColor3), fontSize: el.props.TextScaled ? undefined : (el.props.TextSize || 14), textAlign: el.props.TextXAlignment === 'Left' ? 'left' : el.props.TextXAlignment === 'Right' ? 'right' : 'center' }} className="px-2 font-bold truncate w-full block">{el.props.Text || (el.type === 'TextBox' ? 'Input...' : 'Text')}</span>
                      )}
                      {el.type === 'ImageLabel' && el.props.Image && childEls.length === 0 && (
                        <img src={el.props.Image} alt="" className="w-full h-full object-cover" style={{ opacity: 1 - (el.props.ImageTransparency || 0) }} />
                      )}
                      {el.type === 'ScrollingFrame' && childEls.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/10 text-[9px]">Scroll Area</div>
                      )}
                    </div>
                  )
                }
                return roots.map(el => renderEl(el, false))
              })()}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/15 pointer-events-none">
                  <Layers size={36} className="mb-2 opacity-30" />
                  <p className="text-xs font-medium">Empty Canvas</p>
                  <p className="text-[10px] opacity-50">Use AI chat or + buttons to add elements</p>
                </div>
              )}
            </div>
            {/* Resize handles */}
            {selected && buildMode && !selected.locked && !planeMode && (
              <>
                {['nw', 'ne', 'sw', 'se'].map(c => (
                  <div key={c} className={cn('absolute w-3 h-3 bg-white border-2 border-accent-blue rounded-full z-50 shadow-lg',
                    c === 'nw' && '-top-1.5 -left-1.5 cursor-nw-resize', c === 'ne' && '-top-1.5 -right-1.5 cursor-ne-resize',
                    c === 'sw' && '-bottom-1.5 -left-1.5 cursor-sw-resize', c === 'se' && '-bottom-1.5 -right-1.5 cursor-se-resize'
                  )} style={{ left: c.includes('w') ? `${selected.position.X * 100 - 1}%` : undefined, right: c.includes('e') ? `${(1 - selected.position.X) * 100 - 1}%` : undefined, top: c.includes('n') ? `${selected.position.Y * 100 - 1}%` : undefined, bottom: c.includes('s') ? `${(1 - selected.position.Y) * 100 - 1}%` : undefined, position: 'absolute' }}
                    onMouseDown={(e) => { e.stopPropagation(); setResizing(true); setResizeData({ sx: e.clientX, sy: e.clientY, ow: selected.size.X, oh: selected.size.Y, corner: c }) }} />
                ))}
              </>
            )}
          </div>
          {/* Building progress */}
          {building && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-accent-purple/30 shadow-lg shadow-accent-purple/10">
              <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
              <span className="text-[11px] text-white/90 font-medium">{buildingMsg}</span>
            </div>
          )}
          {/* Keyboard hints */}
          <div className="absolute bottom-2 left-2 flex gap-1.5 text-[9px] text-white/15 pointer-events-none">
            <span>Arrow: nudge</span><span>Shift+Arrow: fast</span><span>Del: remove</span><span>Ctrl+Z: undo</span><span>Alt+Drag: pan</span>
          </div>
        </div>

        {/* ─── Right Panel: Properties + Chat/Templates ─── */}
        <div className="w-[320px] border-l border-border-primary flex flex-col bg-bg-primary/30">
          {/* Properties */}
          {selected && showProps && (
            <div className="border-b border-border-primary max-h-[45%] overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2 sticky top-0 bg-bg-elevated/90 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                  <Settings size={11} className="text-text-dim" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{selected.type}</span>
                  <span className="text-[10px] text-text-dim">{selected.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => duplicateEl(selected.id)} className="p-1 rounded hover:bg-bg-secondary text-text-dim hover:text-text-muted"><Copy size={10} /></button>
                  <button onClick={() => removeEl(selected.id)} className="p-1 rounded hover:bg-red-500/10 text-text-dim hover:text-red-400"><Trash2 size={10} /></button>
                </div>
              </div>
              {/* Name */}
              <div className="px-3 py-1.5 border-b border-border-primary/50">
                <label className="text-[9px] text-text-dim block mb-0.5">Name</label>
                <input value={selected.name} onChange={e => updateEl(selected.id, { name: e.target.value })}
                  className="w-full px-2 py-1 rounded bg-bg-secondary border border-border-primary text-[10px] text-text-primary focus:outline-none focus:border-accent-blue/50" />
              </div>
              {/* Position */}
              {!['UICorner', 'UIStroke', 'UIPadding', 'UIListLayout', 'UIGridLayout', 'UIScale', 'UIAspectRatioConstraint', 'UIGradient'].includes(selected.type) && (
              <>
              <div className="px-3 py-1.5 border-b border-border-primary/50 flex gap-2">
                <div className="flex-1">
                  <label className="text-[9px] text-text-dim block mb-0.5">Pos X</label>
                  <input type="number" step="0.01" min="0" max="1" value={+selected.position.X.toFixed(3)}
                    onChange={e => updateEl(selected.id, { position: { ...selected.position, X: Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)) } })}
                    className="w-full px-2 py-1 rounded bg-bg-secondary border border-border-primary text-[10px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-text-dim block mb-0.5">Pos Y</label>
                  <input type="number" step="0.01" min="0" max="1" value={+selected.position.Y.toFixed(3)}
                    onChange={e => updateEl(selected.id, { position: { ...selected.position, Y: Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)) } })}
                    className="w-full px-2 py-1 rounded bg-bg-secondary border border-border-primary text-[10px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
                </div>
              </div>
              {/* Size */}
              <div className="px-3 py-1.5 border-b border-border-primary/50 flex gap-2">
                <div className="flex-1">
                  <label className="text-[9px] text-text-dim block mb-0.5">Size X</label>
                  <input type="number" step="0.01" min="0.01" max="1" value={+selected.size.X.toFixed(3)}
                    onChange={e => updateEl(selected.id, { size: { ...selected.size, X: Math.max(0.01, Math.min(1, parseFloat(e.target.value) || 0.01)) } })}
                    className="w-full px-2 py-1 rounded bg-bg-secondary border border-border-primary text-[10px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-text-dim block mb-0.5">Size Y</label>
                  <input type="number" step="0.01" min="0.01" max="1" value={+selected.size.Y.toFixed(3)}
                    onChange={e => updateEl(selected.id, { size: { ...selected.size, Y: Math.max(0.01, Math.min(1, parseFloat(e.target.value) || 0.01)) } })}
                    className="w-full px-2 py-1 rounded bg-bg-secondary border border-border-primary text-[10px] text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
                </div>
              </div>
              </>
              )}
              {/* Property Groups */}
              {Object.entries(PROP_GROUPS).map(([group, keys]) => {
                const relevant = keys.filter(k => {
                  // Modifier-specific props: only show for matching modifier type
                  if (group === 'UIStroke' && selected.type !== 'UIStroke') return false
                  if (group === 'UIPadding' && selected.type !== 'UIPadding') return false
                  if (group === 'UIListLayout' && selected.type !== 'UIListLayout') return false
                  if (group === 'UIGridLayout' && selected.type !== 'UIGridLayout') return false
                  if (group === 'UIScale' && selected.type !== 'UIScale') return false
                  if (group === 'UIAspectRatioConstraint' && selected.type !== 'UIAspectRatioConstraint') return false
                  if (group === 'UIGradient' && selected.type !== 'UIGradient') return false
                  // Regular element props: skip modifier groups
                  if (['UIStroke', 'UIPadding', 'UIListLayout', 'UIGridLayout', 'UIScale', 'UIAspectRatioConstraint', 'UIGradient'].includes(group) && !k.startsWith('UI')) return false
                  // Standard element prop filters
                  if (['Text', 'TextColor3', 'TextTransparency', 'TextScaled', 'Font', 'TextSize', 'TextWrapped', 'TextXAlignment', 'TextYAlignment', 'RichText'].includes(k) && !selected.type.includes('Text') && selected.type !== 'TextBox') return false
                  if (['Image', 'ImageColor3', 'ImageTransparency'].includes(k) && !['ImageLabel', 'ImageButton'].includes(selected.type)) return false
                  if (['CornerRadius'].includes(k) && !['Frame', 'TextLabel', 'TextButton', 'ImageLabel', 'ScrollingFrame', 'TextBox'].includes(selected.type)) return false
                  if (['ScrollBarThickness', 'ScrollBarImageColor3', 'CanvasSize', 'AutomaticCanvasSize'].includes(k) && selected.type !== 'ScrollingFrame') return false
                  // Skip regular groups for modifier elements
                  if (['Data', 'Appearance', 'Text', 'Layout', 'Corner', 'Scroll'].includes(group) && ['UICorner', 'UIStroke', 'UIPadding', 'UIListLayout', 'UIGridLayout', 'UIScale', 'UIAspectRatioConstraint', 'UIGradient'].includes(selected.type)) return false
                  return true
                })
                if (relevant.length === 0) return null
                const expanded = expandedGroups.has(group)
                return (
                  <div key={group} className="border-b border-border-primary/50">
                    <button onClick={() => { const s = new Set(expandedGroups); if (s.has(group)) s.delete(group); else s.add(group); setExpandedGroups(s) }}
                      className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold text-text-dim uppercase tracking-wider hover:bg-bg-elevated transition-all">
                      {expanded ? <ChevronDown size={9} /> : <ChevronRight size={9} />}{group}
                    </button>
                    {expanded && relevant.map(k => {
                      const val = selected.props[k]
                      return (
                        <div key={k} className="flex items-center gap-2 px-3 py-1">
                          <label className="text-[9px] text-text-dim w-20 shrink-0 truncate">{k}</label>
                          {renderPropControl(k, val)}
                          {/* Color presets row */}
                          {isColorProp(k) && expanded && (
                            <div />
                          )}
                        </div>
                      )
                    })}
                    {/* Color presets row for color groups */}
                    {expanded && group === 'Appearance' && (
                      <div className="px-3 py-1.5 flex flex-wrap gap-1">
                        {COLOR_PRESETS.map((c, i) => (
                          <button key={i} onClick={() => {
                            const colorKeys = ['BackgroundColor3', 'BorderColor3', 'ImageColor3']
                            const targetKey = colorKeys.find(ck => relevant.includes(ck)) || 'BackgroundColor3'
                            updateProps(selected.id, { [targetKey]: c })
                          }}
                            className="w-4 h-4 rounded border border-white/10 hover:ring-1 hover:ring-white/30 transition-all"
                            style={{ backgroundColor: c }} title={c} />
                        ))}
                      </div>
                    )}
                    {expanded && group === 'Text' && (
                      <div className="px-3 py-1.5 flex flex-wrap gap-1">
                        {COLOR_PRESETS.map((c, i) => (
                          <button key={i} onClick={() => updateProps(selected.id, { TextColor3: c })}
                            className="w-4 h-4 rounded border border-white/10 hover:ring-1 hover:ring-white/30 transition-all"
                            style={{ backgroundColor: c }} title={c} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              {/* Add to container button */}
              {isContainerSelected && (
                <div className="px-3 py-2 border-b border-border-primary/50">
                  <div className="flex flex-wrap gap-1">
                    {ELEMENT_TYPES.map(et => (
                      <button key={et.type} onClick={() => addEl(et.type, selected!.id)}
                        className="px-1.5 py-0.5 rounded text-[8px] text-text-dim hover:text-text-primary bg-bg-secondary border border-border-primary hover:border-accent-blue/30 transition-all">
                        + {et.desc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right panel tabs: AI Assistant + Templates */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tab bar */}
            <div className="flex border-b border-border-primary">
              <button onClick={() => setRightTab('ai')}
                className={cn('flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold transition-all',
                  rightTab === 'ai' ? 'text-accent-purple border-b-2 border-accent-purple bg-accent-purple/5' : 'text-text-dim hover:text-text-muted')}>
                <Sparkles size={10} /> AI Assistant
              </button>
              <button onClick={() => setRightTab('templates')}
                className={cn('flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold transition-all',
                  rightTab === 'templates' ? 'text-accent-blue border-b-2 border-accent-blue bg-accent-blue/5' : 'text-text-dim hover:text-text-muted')}>
                <Layers size={10} /> Templates
              </button>
            </div>

            {/* AI Chat Tab */}
            {rightTab === 'ai' && (
              <>
                <div className="flex items-center justify-between px-3 py-2 border-b border-border-primary">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center"><Sparkles size={10} className="text-white" /></div>
                    <span className="text-[10px] font-bold text-text-muted">AI Assistant</span>
                    {elements.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-accent-blue/10 text-accent-blue border border-accent-blue/20">EDIT MODE</span>
                    )}
                  </div>
                  {messages.length > 0 && (
                    <button onClick={() => setMessages([])} className="text-[9px] text-text-dim hover:text-text-muted transition-all">Clear</button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-2">
                      <Sparkles size={20} className="text-accent-purple/30 mb-2" />
                      <p className="text-[10px] text-text-dim mb-3">
                        {elements.length > 0
                          ? 'Describe changes to apply to your canvas, or create new UI from scratch'
                          : 'Describe your UI and AI builds it on the canvas'}
                      </p>
                      <div className="grid grid-cols-3 gap-1.5 mb-3 w-full">
                        {quickPresets.map((p, i) => (
                          <button key={i} onClick={() => sendMsg(p.prompt)}
                            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[10px] text-text-dim bg-bg-elevated border border-border-primary hover:border-accent-purple/40 hover:text-accent-purple hover:bg-accent-purple/5 transition-all">
                            <span className="text-base">{p.emoji}</span>
                            <span className="font-medium">{p.label}</span>
                          </button>
                        ))}
                      </div>
                      {elements.length === 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {suggestedPrompts.slice(0, 4).map((p, i) => (
                            <button key={i} onClick={() => sendMsg(p)} className="px-2 py-1 rounded-md text-[9px] text-text-dim bg-bg-elevated border border-border-primary hover:border-accent-purple/30 hover:text-accent-purple transition-all">{p}</button>
                          ))}
                        </div>
                      )}
                        {elements.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {['Change the style to neon cyberpunk', 'Make it look medieval/fantasy', 'Switch to a colorful fun theme', 'Add glowing border effects', 'Change to an anime/Japanese style', 'Make it look like a military HUD'].map((p, i) => (
                            <button key={i} onClick={() => sendMsg(p)} className="px-2 py-1 rounded-md text-[9px] text-text-dim bg-bg-elevated border border-border-primary hover:border-accent-purple/30 hover:text-accent-purple transition-all">{p}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[90%] px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed',
                        msg.role === 'user' ? 'bg-accent-blue text-white rounded-br-sm' : 'bg-bg-elevated text-text-primary rounded-bl-sm border border-border-primary')}>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        {msg.commands?.length ? (
                          <div className="mt-1 flex flex-wrap gap-0.5">
                            {msg.commands.map((c: any, j: number) => (
                              <span key={j} className={cn('px-1 py-0.5 rounded text-[8px] font-mono', c.action === 'add' && 'bg-green-500/10 text-green-400', c.action === 'modify' && 'bg-yellow-500/10 text-yellow-400', c.action === 'remove' && 'bg-red-500/10 text-red-400')}>
                                {c.action} {c.name || c.target || c.elementType}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 border border-accent-purple/20 rounded-xl px-3 py-2 max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="relative">
                            <Sparkles size={12} className="text-accent-purple animate-pulse" />
                            <div className="absolute inset-0 animate-ping"><Sparkles size={12} className="text-accent-purple opacity-30" /></div>
                          </div>
                          <span className="text-[9px] font-bold text-accent-purple">{aiStatus || 'AI is designing...'}</span>
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <div className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[8px] text-text-dim">generating UI elements...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="px-3 pb-2 pt-1 border-t border-border-primary">
                  <div className="flex items-end gap-1.5 bg-bg-elevated rounded-lg px-2.5 py-1.5 border border-border-primary focus-within:border-accent-purple/50 transition-colors">
                    <textarea value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }}
                      placeholder={elements.length > 0 ? "Edit existing elements or add new ones..." : "Describe your UI and AI builds it..."} rows={1}
                      className="flex-1 bg-transparent text-text-primary text-[10px] resize-none focus:outline-none placeholder:text-text-dim max-h-16" />
                    <button onClick={() => sendMsg()} disabled={!input.trim() || isLoading || building}
                      className={cn('h-6 w-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all', input.trim() && !isLoading && !building ? 'bg-accent-purple text-white' : 'bg-bg-tertiary text-text-dim')}>
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Templates Tab */}
            {rightTab === 'templates' && (
              <>
                <div className="px-3 py-2 border-b border-border-primary">
                  <p className="text-[10px] text-text-dim">Click a template to add it to the canvas.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 auto-rows-min">
                  {COMPONENT_TEMPLATES.map((t, i) => (
                    <button key={i} onClick={() => applyTemplate(t)}
                      className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl bg-bg-elevated border border-border-primary hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all group">
                      <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">{t.icon}</span>
                      <span className="text-[10px] font-bold text-text-primary">{t.name}</span>
                      <span className="text-[8px] text-text-dim">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Plane Mode ─── */}
      {planeMode && elements.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-[#08080c] flex items-center justify-center">
          <div className="relative" style={{ width: cw, height: ch }}>
            <div className="absolute inset-0 bg-[#1a1a2e] rounded-lg shadow-2xl overflow-hidden">
              {(() => {
                const renderPreviewEl = (el: UIEl): React.ReactNode => {
                  if (!el.visible) return null
                  const childEls = el.children.map(cid => elements.find(e => e.id === cid)).filter(Boolean) as UIEl[]
                  const p = el.props
                  const style: React.CSSProperties = {
                    position: 'absolute', left: `${el.position.X * 100}%`, top: `${el.position.Y * 100}%`,
                    width: `${el.size.X * 100}%`, height: `${el.size.Y * 100}%`,
                    transform: `translate(-50%, -50%)${p.Rotation ? ` rotate(${p.Rotation}deg)` : ''}`,
                    backgroundColor: (p.BackgroundTransparency ?? 0) >= 1 ? 'transparent' : parseColor(p.BackgroundColor3),
                    borderRadius: p.CornerRadius || 0, zIndex: el.zIndex || 1,
                    overflow: el.type === 'ScrollingFrame' ? 'auto' : 'hidden',
                    border: p.BorderSizePixel > 0 ? `${p.BorderSizePixel}px solid ${parseColor(p.BorderColor3)}` : undefined,
                  }
                  return (
                    <div key={el.id} style={style} className="select-none">
                      {childEls.map(child => renderPreviewEl(child))}
                      {(el.type === 'TextLabel' || el.type === 'TextButton' || el.type === 'TextBox') && childEls.length === 0 && (
                        <span style={{ color: parseColor(p.TextColor3), fontSize: p.TextScaled ? undefined : (p.TextSize || 14), textAlign: p.TextXAlignment === 'Left' ? 'left' : p.TextXAlignment === 'Right' ? 'right' : 'center', fontWeight: p.Font?.includes('Bold') ? 'bold' : undefined }} className="px-2 truncate w-full block">{p.Text || (el.type === 'TextBox' ? 'Input...' : 'Text')}</span>
                      )}
                      {el.type === 'ImageLabel' && p.Image && childEls.length === 0 && (
                        <img src={p.Image} alt="" className="w-full h-full object-cover" style={{ opacity: 1 - (p.ImageTransparency || 0) }} />
                      )}
                      {el.type === 'ScrollingFrame' && childEls.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/10 text-[9px]">Scroll Area</div>
                      )}
                    </div>
                  )
                }
                return roots.map(el => renderPreviewEl(el))
              })()}
            </div>
          </div>
          <button onClick={() => setPlaneMode(false)}
            className="fixed top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium hover:bg-black/80 transition-all z-50">
            <X size={14} /> Exit Plane
          </button>
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/50 text-[10px] z-50">
            <span>Fullscreen Preview</span><span className="text-white/20">|</span><span>{elements.length} elements</span><span className="text-white/20">|</span><span>{dev.name} {dev.w}×{dev.h}</span><span className="text-white/20">|</span><span>Esc to exit</span>
          </div>
        </div>
      )}

      {/* ─── Context Menu ─── */}
      {ctxMenu && (
        <div className="fixed inset-0 z-[70]" onClick={() => setCtxMenu(null)} onContextMenu={e => { e.preventDefault(); setCtxMenu(null) }}>
          <div className="absolute bg-bg-elevated border border-border-primary rounded-xl shadow-2xl py-1 min-w-[160px]"
            style={{ left: ctxMenu.x, top: ctxMenu.y }} onClick={e => e.stopPropagation()}>
            {[
              { label: 'Duplicate', icon: '📋', fn: () => { duplicateEl(ctxMenu.elId); setCtxMenu(null) } },
              { label: 'Copy', icon: '📄', fn: () => { copyEl(ctxMenu.elId); setCtxMenu(null) } },
              { label: 'Paste', icon: '📌', fn: () => { pasteEl(); setCtxMenu(null) }, disabled: !clipboard },
              'sep',
              { label: 'Bring to Front', icon: '⬆️', fn: () => { bringToFront(ctxMenu.elId); setCtxMenu(null) } },
              { label: 'Send to Back', icon: '⬇️', fn: () => { sendToBack(ctxMenu.elId); setCtxMenu(null) } },
              'sep',
              { label: 'Delete', icon: '🗑️', fn: () => { removeEl(ctxMenu.elId); setCtxMenu(null) }, danger: true },
            ].map((item, i) => item === 'sep' ? (
              <div key={i} className="h-px bg-border-primary my-1" />
            ) : (
              <button key={i} onClick={(item as any).fn} disabled={(item as any).disabled}
                className={cn('w-full flex items-center gap-2 px-3 py-1.5 text-[10px] transition-all',
                  (item as any).disabled ? 'text-text-dim/30 cursor-not-allowed' : (item as any).danger ? 'text-red-400 hover:bg-red-500/10' : 'text-text-primary hover:bg-bg-secondary')}>
                <span className="text-[11px]">{(item as any).icon}</span>
                <span className="font-medium">{(item as any).label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Export Modal ─── */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowExport(false)}>
          <div className="bg-bg-elevated border border-border-primary rounded-2xl shadow-2xl w-[420px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-border-primary">
              <h3 className="text-sm font-bold text-text-primary">Export UI ({elements.length} elements)</h3>
              <button onClick={() => setShowExport(false)} className="p-1 rounded-lg hover:bg-bg-secondary"><X size={14} className="text-text-muted" /></button>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: 'Lua Script', desc: 'Paste into Roblox Studio Command Bar', icon: FileCode2, color: 'green', fn: () => { navigator.clipboard.writeText(genLua(elements)); setShowExport(false) } },
                { label: 'Download .lua', desc: 'LocalScript file for StarterGui', icon: Download, color: 'blue', fn: () => { const b = new Blob([genLua(elements)], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'GeneratedUI.lua'; a.click(); setShowExport(false) } },
                { label: 'Download .rbxmx', desc: 'Import via Studio → Insert from File', icon: FileJson, color: 'purple', fn: () => { const b = new Blob([genRbxmx(elements)], { type: 'application/xml' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'GeneratedUI.rbxmx'; a.click(); setShowExport(false) } },
                { label: 'JSON Project', desc: 'Re-import to continue editing', icon: FileJson, color: 'orange', fn: () => { const b = new Blob([genJSON(elements)], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'UIProject.json'; a.click(); setShowExport(false) } },
              ].map((item, i) => (
                <button key={i} onClick={item.fn}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-primary hover:border-accent-blue/30 transition-all text-left group">
                  <div className={`w-9 h-9 rounded-xl bg-${item.color === 'green' ? 'accent-green' : item.color === 'blue' ? 'accent-blue' : item.color === 'purple' ? 'accent-purple' : 'accent-orange'}/10 flex items-center justify-center`}>
                    <item.icon size={16} className={`text-${item.color === 'green' ? 'accent-green' : item.color === 'blue' ? 'accent-blue' : item.color === 'purple' ? 'accent-purple' : 'accent-orange'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary group-hover:text-accent-blue transition-colors">{item.label}</p>
                    <p className="text-[10px] text-text-dim">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Image Search Modal ─── */}
      {showImageSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowImageSearch(false); setImgSearchResults([]); setImgSearchQuery('') }}>
          <div className="bg-bg-elevated border border-border-primary rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-border-primary shrink-0">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <ImageIcon size={14} className="text-accent-purple" /> Search Images
              </h3>
              <button onClick={() => { setShowImageSearch(false); setImgSearchResults([]); setImgSearchQuery('') }} className="p-1 rounded-lg hover:bg-bg-secondary"><X size={14} className="text-text-muted" /></button>
            </div>
            <div className="px-4 pt-3 pb-2 shrink-0">
              <div className="flex gap-2">
                <input value={imgSearchQuery} onChange={e => setImgSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') searchImages(imgSearchQuery) }}
                  placeholder="Search for images (e.g. sword, galaxy, button)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-bg-secondary border border-border-primary text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-purple/50" />
                <button onClick={() => searchImages(imgSearchQuery)} disabled={imgSearching || !imgSearchQuery.trim()}
                  className={cn('px-4 py-2 rounded-xl text-xs font-medium transition-all', imgSearchQuery.trim() && !imgSearching ? 'bg-accent-purple text-white hover:bg-purple-600' : 'bg-bg-tertiary text-text-dim')}>
                  {imgSearching ? <Loader2 size={12} className="animate-spin" /> : 'Search'}
                </button>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {['gaming', 'nature', 'abstract', 'tech', 'fantasy', 'space', 'medieval', 'cyberpunk'].map(tag => (
                  <button key={tag} onClick={() => { setImgSearchQuery(tag); searchImages(tag) }}
                    className="px-2 py-0.5 rounded-md text-[9px] text-text-dim bg-bg-secondary border border-border-primary hover:border-accent-purple/40 hover:text-accent-purple transition-all capitalize">{tag}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {imgSearchResults.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {imgSearchResults.map((img, i) => (
                    <button key={i} onClick={() => addImageToCanvas(img.url)}
                      className="group relative aspect-video rounded-lg overflow-hidden border border-border-primary hover:border-accent-purple/60 hover:ring-2 hover:ring-accent-purple/20 transition-all bg-bg-secondary">
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold bg-accent-purple/80 px-2 py-1 rounded-md transition-all">+ Add</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !imgSearching && imgSearchQuery ? (
                <div className="text-center py-8 text-text-dim text-xs">No results. Try different keywords.</div>
              ) : !imgSearchQuery ? (
                <div className="text-center py-8 text-text-dim text-xs">Search for images or click a category above.</div>
              ) : null}
              {imgSearching && (
                <div className="flex items-center justify-center py-8 gap-2 text-text-dim text-xs">
                  <Loader2 size={14} className="animate-spin" /> Searching...
                </div>
              )}
            </div>
            <div className="px-4 py-2 border-t border-border-primary shrink-0">
              <p className="text-[9px] text-text-dim">Or paste a URL and add manually:</p>
              <div className="flex gap-2 mt-1">
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.png"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-primary text-[10px] text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-purple/50" />
                <button onClick={() => { if (imageUrl) addImageToCanvas(imageUrl); setImageUrl('') }}
                  disabled={!imageUrl.trim()}
                  className={cn('px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all', imageUrl.trim() ? 'bg-accent-blue text-white hover:bg-blue-600' : 'bg-bg-tertiary text-text-dim')}>Add URL</button>
                <label className="px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-primary text-[10px] text-text-muted hover:text-text-primary cursor-pointer transition-all">
                  <Upload size={10} className="inline mr-1" />Upload
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if (f) { const url = URL.createObjectURL(f); addImageToCanvas(url) }
                  }} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
