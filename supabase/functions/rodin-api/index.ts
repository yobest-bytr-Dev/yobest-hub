import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const RODIN_KEY = "vibecoding";
const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Template Fallback: generates UI when AI fails ──────────
function generateFromTemplate(prompt: string): { message: string; commands: any[] } {
  const lower = prompt.toLowerCase();

  // Detect UI type from keywords
  if (lower.includes("shop") || lower.includes("store") || lower.includes("buy") || lower.includes("purchase") || lower.includes("item shop")) {
    return { message: "Built a shop UI with item grid and buy buttons", commands: [
      { action: "add", elementType: "Frame", name: "ShopFrame", parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.42, Y: 0.65 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16, ZIndex: 1 }},
      { action: "add", elementType: "Frame", name: "TitleBar", parent: "ShopFrame", position: { X: 0.5, Y: 0.06 }, size: { X: 0.92, Y: 0.08 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "ShopTitle", parent: "TitleBar", position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.8 }, properties: { Text: "🛒 ITEM SHOP", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 3 }},
      { action: "add", elementType: "ScrollingFrame", name: "ItemGrid", parent: "ShopFrame", position: { X: 0.5, Y: 0.55 }, size: { X: 0.92, Y: 0.82 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0.3, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2, ScrollBarThickness: 6 }},
      // Item 1
      { action: "add", elementType: "Frame", name: "Item1", parent: "ItemGrid", position: { X: 0.25, Y: 0.15 }, size: { X: 0.45, Y: 0.25 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 3 }},
      { action: "add", elementType: "ImageLabel", name: "ItemIcon1", parent: "Item1", position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundTransparency: 1, Image: "https://placehold.co/120x120/1e293b/ef4444?text=%E2%9A%94%EF%B8%8F&font-size=50", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemName1", parent: "Item1", position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: "⚔️ Iron Sword", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemPrice1", parent: "Item1", position: { X: 0.62, Y: 0.55 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: "500 Gold", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextButton", name: "BuyBtn1", parent: "Item1", position: { X: 0.82, Y: 0.75 }, size: { X: 0.25, Y: 0.35 }, properties: { Text: "BUY", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ZIndex: 4 }},
      // Item 2
      { action: "add", elementType: "Frame", name: "Item2", parent: "ItemGrid", position: { X: 0.75, Y: 0.15 }, size: { X: 0.45, Y: 0.25 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 3 }},
      { action: "add", elementType: "ImageLabel", name: "ItemIcon2", parent: "Item2", position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundTransparency: 1, Image: "https://placehold.co/120x120/1e293b/3b82f6?text=%F0%9F%9E%A1%EF%B8%8F&font-size=50", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemName2", parent: "Item2", position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: "Steel Shield", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemPrice2", parent: "Item2", position: { X: 0.62, Y: 0.55 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: "1200 Gold", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextButton", name: "BuyBtn2", parent: "Item2", position: { X: 0.82, Y: 0.75 }, size: { X: 0.25, Y: 0.35 }, properties: { Text: "BUY", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ZIndex: 4 }},
      // Item 3
      { action: "add", elementType: "Frame", name: "Item3", parent: "ItemGrid", position: { X: 0.25, Y: 0.5 }, size: { X: 0.45, Y: 0.25 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 3 }},
      { action: "add", elementType: "ImageLabel", name: "ItemIcon3", parent: "Item3", position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundTransparency: 1, Image: "https://placehold.co/120x120/1e293b/22c55e?text=%F0%9F%A7%A3&font-size=50", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemName3", parent: "Item3", position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: "Health Potion", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemPrice3", parent: "Item3", position: { X: 0.62, Y: 0.55 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: "250 Gold", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextButton", name: "BuyBtn3", parent: "Item3", position: { X: 0.82, Y: 0.75 }, size: { X: 0.25, Y: 0.35 }, properties: { Text: "BUY", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ZIndex: 4 }},
      // Item 4
      { action: "add", elementType: "Frame", name: "Item4", parent: "ItemGrid", position: { X: 0.75, Y: 0.5 }, size: { X: 0.45, Y: 0.25 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 3 }},
      { action: "add", elementType: "ImageLabel", name: "ItemIcon4", parent: "Item4", position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundTransparency: 1, Image: "https://placehold.co/120x120/1e293b/a78bfa?text=%F0%9F%92%8E&font-size=50", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemName4", parent: "Item4", position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: "Magic Gem", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemPrice4", parent: "Item4", position: { X: 0.62, Y: 0.55 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: "800 Gold", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextButton", name: "BuyBtn4", parent: "Item4", position: { X: 0.82, Y: 0.75 }, size: { X: 0.25, Y: 0.35 }, properties: { Text: "BUY", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ZIndex: 4 }},
    ]};
  }

  if (lower.includes("menu") || lower.includes("main menu") || lower.includes("start") || lower.includes("lobby")) {
    return { message: "Built a main menu with play and settings buttons", commands: [
      { action: "add", elementType: "Frame", name: "MenuFrame", parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.35, Y: 0.7 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0.05, BorderSizePixel: 0, CornerRadius: 20, ZIndex: 1 }},
      { action: "add", elementType: "TextLabel", name: "GameTitle", parent: "MenuFrame", position: { X: 0.5, Y: 0.12 }, size: { X: 0.85, Y: 0.12 }, properties: { Text: "MY GAME", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "Subtitle", parent: "MenuFrame", position: { X: 0.5, Y: 0.22 }, size: { X: 0.7, Y: 0.06 }, properties: { Text: "Welcome back, Player!", TextColor3: "#64748b", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, ZIndex: 2 }},
      { action: "add", elementType: "TextButton", name: "PlayBtn", parent: "MenuFrame", position: { X: 0.5, Y: 0.42 }, size: { X: 0.7, Y: 0.1 }, properties: { Text: "PLAY", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12, ZIndex: 2 }},
      { action: "add", elementType: "TextButton", name: "SettingsBtn", parent: "MenuFrame", position: { X: 0.5, Y: 0.56 }, size: { X: 0.7, Y: 0.1 }, properties: { Text: "SETTINGS", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12, ZIndex: 2 }},
      { action: "add", elementType: "TextButton", name: "CreditsBtn", parent: "MenuFrame", position: { X: 0.5, Y: 0.7 }, size: { X: 0.7, Y: 0.1 }, properties: { Text: "CREDITS", TextColor3: "#94a3b8", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "Version", parent: "MenuFrame", position: { X: 0.5, Y: 0.92 }, size: { X: 0.4, Y: 0.05 }, properties: { Text: "v1.0.0", TextColor3: "#334155", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, ZIndex: 2 }},
    ]};
  }

  if (lower.includes("inventory") || lower.includes("bag") || lower.includes("backpack")) {
    const cmds: any[] = [
      { action: "add", elementType: "Frame", name: "InvFrame", parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.38, Y: 0.6 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16, ZIndex: 1 }},
      { action: "add", elementType: "TextLabel", name: "InvTitle", parent: "InvFrame", position: { X: 0.5, Y: 0.06 }, size: { X: 0.85, Y: 0.08 }, properties: { Text: "INVENTORY", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "InvCount", parent: "InvFrame", position: { X: 0.5, Y: 0.14 }, size: { X: 0.5, Y: 0.05 }, properties: { Text: "12 / 24 slots", TextColor3: "#64748b", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, ZIndex: 2 }},
    ];
    // 4x3 grid of slots
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const idx = row * 4 + col + 1;
        const x = 0.14 + col * 0.22;
        const y = 0.3 + row * 0.22;
        cmds.push({ action: "add", elementType: "Frame", name: `Slot${idx}`, parent: "InvFrame", position: { X: x, Y: y }, size: { X: 0.18, Y: 0.18 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: idx > 12 ? 0.5 : 0, BorderSizePixel: 1, BorderColor3: "#334155", CornerRadius: 8, ZIndex: 3 }});
        if (idx <= 5) {
          const icons = [
            {url:"https://placehold.co/100x100/1e293b/ef4444?text=%E2%9A%94%EF%B8%8F&font-size=40"},
            {url:"https://placehold.co/100x100/1e293b/3b82f6?text=%F0%9F%9E%A1%EF%B8%8F&font-size=40"},
            {url:"https://placehold.co/100x100/1e293b/22c55e?text=%F0%9F%A7%A3&font-size=40"},
            {url:"https://placehold.co/100x100/1e293b/f59e0b?text=%F0%9F%92%B0&font-size=40"},
            {url:"https://placehold.co/100x100/1e293b/a78bfa?text=%F0%9F%92%8E&font-size=40"}
          ];
          cmds.push({ action: "add", elementType: "ImageLabel", name: `SlotIcon${idx}`, parent: `Slot${idx}`, position: { X: 0.5, Y: 0.45 }, size: { X: 0.6, Y: 0.6 }, properties: { BackgroundTransparency: 1, Image: icons[idx-1].url, ZIndex: 4 }});
          cmds.push({ action: "add", elementType: "TextLabel", name: `SlotCount${idx}`, parent: `Slot${idx}`, position: { X: 0.78, Y: 0.8 }, size: { X: 0.35, Y: 0.3 }, properties: { Text: `${Math.floor(Math.random()*10)+1}`, TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 5 }});
        }
      }
    }
    return { message: "Built an inventory with 12 item slots", commands: cmds };
  }

  if (lower.includes("hud") || lower.includes("health") || lower.includes("player") || lower.includes("status bar")) {
    return { message: "Built a player HUD with health, mana, and currency", commands: [
      { action: "add", elementType: "Frame", name: "HudFrame", parent: null, position: { X: 0.5, Y: 0.92 }, size: { X: 0.35, Y: 0.12 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0.15, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 1 }},
      { action: "add", elementType: "Frame", name: "HealthBarBG", parent: "HudFrame", position: { X: 0.35, Y: 0.3 }, size: { X: 0.55, Y: 0.22 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 4, ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "HealthBarFill", parent: "HealthBarBG", position: { X: 0.4, Y: 0.5 }, size: { X: 0.75, Y: 0.9 }, properties: { BackgroundColor3: "#ef4444", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 4, ZIndex: 3 }},
      { action: "add", elementType: "TextLabel", name: "HealthText", parent: "HealthBarBG", position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.9 }, properties: { Text: "750 / 1000", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 4 }},
      { action: "add", elementType: "Frame", name: "ManaBarBG", parent: "HudFrame", position: { X: 0.35, Y: 0.7 }, size: { X: 0.55, Y: 0.22 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 4, ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "ManaBarFill", parent: "ManaBarBG", position: { X: 0.3, Y: 0.5 }, size: { X: 0.55, Y: 0.9 }, properties: { BackgroundColor3: "#3b82f6", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 4, ZIndex: 3 }},
      { action: "add", elementType: "TextLabel", name: "ManaText", parent: "ManaBarBG", position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.9 }, properties: { Text: "200 / 500", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "CoinIcon", parent: "HudFrame", position: { X: 0.88, Y: 0.3 }, size: { X: 0.1, Y: 0.5 }, properties: { Text: "💰", TextScaled: true, BackgroundTransparency: 1, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "CoinCount", parent: "HudFrame", position: { X: 0.95, Y: 0.3 }, size: { X: 0.12, Y: 0.5 }, properties: { Text: "5,420", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 2 }},
    ]};
  }

  if (lower.includes("stats") || lower.includes("character") || lower.includes("rpg") || lower.includes("level")) {
    return { message: "Built a character stats panel with level and attribute bars", commands: [
      { action: "add", elementType: "Frame", name: "StatsFrame", parent: null, position: { X: 0.15, Y: 0.5 }, size: { X: 0.22, Y: 0.55 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 14, ZIndex: 1 }},
      { action: "add", elementType: "ImageLabel", name: "Avatar", parent: "StatsFrame", position: { X: 0.5, Y: 0.12 }, size: { X: 0.35, Y: 0.2 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 50, Image: "https://ui-avatars.com/api/?name=Hero&background=3b82f6&color=fff&bold=true&size=150", ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "PlayerName", parent: "StatsFrame", position: { X: 0.5, Y: 0.3 }, size: { X: 0.85, Y: 0.07 }, properties: { Text: "DragonSlayer99", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "PlayerLevel", parent: "StatsFrame", position: { X: 0.5, Y: 0.37 }, size: { X: 0.5, Y: 0.05 }, properties: { Text: "Level 42 Warrior", TextColor3: "#8b5cf6", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "ExpBarBG", parent: "StatsFrame", position: { X: 0.5, Y: 0.44 }, size: { X: 0.8, Y: 0.04 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 3, ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "ExpBarFill", parent: "ExpBarBG", position: { X: 0.35, Y: 0.5 }, size: { X: 0.65, Y: 0.9 }, properties: { BackgroundColor3: "#8b5cf6", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 3, ZIndex: 3 }},
      // Stats
      { action: "add", elementType: "TextLabel", name: "StrLabel", parent: "StatsFrame", position: { X: 0.15, Y: 0.52 }, size: { X: 0.2, Y: 0.05 }, properties: { Text: "STR", TextColor3: "#ef4444", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "StrBar", parent: "StatsFrame", position: { X: 0.6, Y: 0.52 }, size: { X: 0.55, Y: 0.04 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 2, ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "StrFill", parent: "StrBar", position: { X: 0.7, Y: 0.5 }, size: { X: 0.85, Y: 0.9 }, properties: { BackgroundColor3: "#ef4444", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 2, ZIndex: 3 }},
      { action: "add", elementType: "TextLabel", name: "DefLabel", parent: "StatsFrame", position: { X: 0.15, Y: 0.6 }, size: { X: 0.2, Y: 0.05 }, properties: { Text: "DEF", TextColor3: "#3b82f6", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "DefBar", parent: "StatsFrame", position: { X: 0.6, Y: 0.6 }, size: { X: 0.55, Y: 0.04 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 2, ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "DefFill", parent: "DefBar", position: { X: 0.5, Y: 0.5 }, size: { X: 0.65, Y: 0.9 }, properties: { BackgroundColor3: "#3b82f6", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 2, ZIndex: 3 }},
      { action: "add", elementType: "TextLabel", name: "SpdLabel", parent: "StatsFrame", position: { X: 0.15, Y: 0.68 }, size: { X: 0.2, Y: 0.05 }, properties: { Text: "SPD", TextColor3: "#10b981", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "SpdBar", parent: "StatsFrame", position: { X: 0.6, Y: 0.68 }, size: { X: 0.55, Y: 0.04 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 2, ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "SpdFill", parent: "SpdBar", position: { X: 0.4, Y: 0.5 }, size: { X: 0.5, Y: 0.9 }, properties: { BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 2, ZIndex: 3 }},
    ]};
  }

  if (lower.includes("chat") || lower.includes("message") || lower.includes("text box")) {
    return { message: "Built a chat interface with message input", commands: [
      { action: "add", elementType: "Frame", name: "ChatFrame", parent: null, position: { X: 0.18, Y: 0.75 }, size: { X: 0.3, Y: 0.35 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0.15, BorderSizePixel: 0, CornerRadius: 12, ZIndex: 1 }},
      { action: "add", elementType: "TextLabel", name: "ChatTitle", parent: "ChatFrame", position: { X: 0.5, Y: 0.06 }, size: { X: 0.9, Y: 0.08 }, properties: { Text: "CHAT", TextColor3: "#64748b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "ChatMessages", parent: "ChatFrame", position: { X: 0.5, Y: 0.45 }, size: { X: 0.9, Y: 0.72 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0.3, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "Msg1", parent: "ChatMessages", position: { X: 0.5, Y: 0.15 }, size: { X: 0.9, Y: 0.12 }, properties: { Text: "Player1: Hello everyone!", TextColor3: "#94a3b8", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "TextLabel", name: "Msg2", parent: "ChatMessages", position: { X: 0.5, Y: 0.35 }, size: { X: 0.9, Y: 0.12 }, properties: { Text: "Player2: Let's go to the dungeon", TextColor3: "#94a3b8", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "ChatInput", parent: "ChatFrame", position: { X: 0.5, Y: 0.92 }, size: { X: 0.9, Y: 0.12 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "InputPlaceholder", parent: "ChatInput", position: { X: 0.5, Y: 0.5 }, size: { X: 0.85, Y: 0.7 }, properties: { Text: "Type a message...", TextColor3: "#334155", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "TextButton", name: "SendBtn", parent: "ChatInput", position: { X: 0.92, Y: 0.5 }, size: { X: 0.12, Y: 0.8 }, properties: { Text: "→", TextColor3: "#ffffff", TextScaled: true, BackgroundColor3: "#3b82f6", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ZIndex: 3 }},
    ]};
  }

  if (lower.includes("settings") || lower.includes("options") || lower.includes("config") || lower.includes("preferences")) {
    return { message: "Built a settings panel with toggles", commands: [
      { action: "add", elementType: "Frame", name: "SettingsFrame", parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.35, Y: 0.6 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16, ZIndex: 1 }},
      { action: "add", elementType: "TextLabel", name: "SettingsTitle", parent: "SettingsFrame", position: { X: 0.5, Y: 0.06 }, size: { X: 0.85, Y: 0.08 }, properties: { Text: "SETTINGS", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "Setting1", parent: "SettingsFrame", position: { X: 0.5, Y: 0.2 }, size: { X: 0.88, Y: 0.1 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "Setting1Label", parent: "Setting1", position: { X: 0.3, Y: 0.5 }, size: { X: 0.55, Y: 0.7 }, properties: { Text: "Sound Effects", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "TextButton", name: "Setting1Toggle", parent: "Setting1", position: { X: 0.9, Y: 0.5 }, size: { X: 0.12, Y: 0.6 }, properties: { Text: "", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12, ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "Setting2", parent: "SettingsFrame", position: { X: 0.5, Y: 0.33 }, size: { X: 0.88, Y: 0.1 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "Setting2Label", parent: "Setting2", position: { X: 0.3, Y: 0.5 }, size: { X: 0.55, Y: 0.7 }, properties: { Text: "Music", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "TextButton", name: "Setting2Toggle", parent: "Setting2", position: { X: 0.9, Y: 0.5 }, size: { X: 0.12, Y: 0.6 }, properties: { Text: "", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12, ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "Setting3", parent: "SettingsFrame", position: { X: 0.5, Y: 0.46 }, size: { X: 0.88, Y: 0.1 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "Setting3Label", parent: "Setting3", position: { X: 0.3, Y: 0.5 }, size: { X: 0.55, Y: 0.7 }, properties: { Text: "Show Names", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "TextButton", name: "Setting3Toggle", parent: "Setting3", position: { X: 0.9, Y: 0.5 }, size: { X: 0.12, Y: 0.6 }, properties: { Text: "", BackgroundColor3: "#334155", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12, ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "Setting4", parent: "SettingsFrame", position: { X: 0.5, Y: 0.59 }, size: { X: 0.88, Y: 0.1 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "Setting4Label", parent: "Setting4", position: { X: 0.3, Y: 0.5 }, size: { X: 0.55, Y: 0.7 }, properties: { Text: "Vibration", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "TextButton", name: "Setting4Toggle", parent: "Setting4", position: { X: 0.9, Y: 0.5 }, size: { X: 0.12, Y: 0.6 }, properties: { Text: "", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12, ZIndex: 3 }},
      { action: "add", elementType: "TextButton", name: "ApplyBtn", parent: "SettingsFrame", position: { X: 0.5, Y: 0.92 }, size: { X: 0.5, Y: 0.08 }, properties: { Text: "APPLY", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#3b82f6", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
    ]};
  }

  if (lower.includes("quest") || lower.includes("tracker") || lower.includes("mission") || lower.includes("objective")) {
    return { message: "Built a quest tracker with progress bars", commands: [
      { action: "add", elementType: "Frame", name: "QuestFrame", parent: null, position: { X: 0.88, Y: 0.4 }, size: { X: 0.2, Y: 0.5 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0.1, BorderSizePixel: 0, CornerRadius: 12, ZIndex: 1 }},
      { action: "add", elementType: "TextLabel", name: "QuestTitle", parent: "QuestFrame", position: { X: 0.5, Y: 0.06 }, size: { X: 0.9, Y: 0.08 }, properties: { Text: "ACTIVE QUESTS", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "Quest1", parent: "QuestFrame", position: { X: 0.5, Y: 0.2 }, size: { X: 0.9, Y: 0.22 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "Quest1Name", parent: "Quest1", position: { X: 0.5, Y: 0.2 }, size: { X: 0.9, Y: 0.3 }, properties: { Text: "Defeat the Dragon", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "TextLabel", name: "Quest1Desc", parent: "Quest1", position: { X: 0.5, Y: 0.5 }, size: { X: 0.9, Y: 0.25 }, properties: { Text: "Slay the fire dragon in the volcano", TextColor3: "#64748b", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "Quest1Bar", parent: "Quest1", position: { X: 0.5, Y: 0.82 }, size: { X: 0.9, Y: 0.15 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 3, ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "Quest1Fill", parent: "Quest1Bar", position: { X: 0.35, Y: 0.5 }, size: { X: 0.65, Y: 0.9 }, properties: { BackgroundColor3: "#ef4444", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 3, ZIndex: 4 }},
      { action: "add", elementType: "Frame", name: "Quest2", parent: "QuestFrame", position: { X: 0.5, Y: 0.5 }, size: { X: 0.9, Y: 0.22 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "Quest2Name", parent: "Quest2", position: { X: 0.5, Y: 0.2 }, size: { X: 0.9, Y: 0.3 }, properties: { Text: "Collect 10 Gems", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "TextLabel", name: "Quest2Desc", parent: "Quest2", position: { X: 0.5, Y: 0.5 }, size: { X: 0.9, Y: 0.25 }, properties: { Text: "7/10 gems collected", TextColor3: "#64748b", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "Quest2Bar", parent: "Quest2", position: { X: 0.5, Y: 0.82 }, size: { X: 0.9, Y: 0.15 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 3, ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "Quest2Fill", parent: "Quest2Bar", position: { X: 0.7, Y: 0.5 }, size: { X: 0.85, Y: 0.9 }, properties: { BackgroundColor3: "#3b82f6", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 3, ZIndex: 4 }},
    ]};
  }

  if (lower.includes("leaderboard") || lower.includes("ranking") || lower.includes("score") || lower.includes("top")) {
    const names = ["DragonSlayer99", "NinjaPro42", "StarGazer", "PixelMaster", "BladeRunner"];
    const scores = ["10000", "8500", "7200", "5800", "4000"];
    const cmds: any[] = [
      { action: "add", elementType: "Frame", name: "LbFrame", parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.3, Y: 0.55 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16, ZIndex: 1 }},
      { action: "add", elementType: "TextLabel", name: "LbTitle", parent: "LbFrame", position: { X: 0.5, Y: 0.06 }, size: { X: 0.85, Y: 0.08 }, properties: { Text: "LEADERBOARD", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 2 }},
    ];
    for (let i = 0; i < 5; i++) {
      cmds.push({ action: "add", elementType: "Frame", name: `LbRow${i+1}`, parent: "LbFrame", position: { X: 0.5, Y: 0.15 + i * 0.16 }, size: { X: 0.9, Y: 0.12 }, properties: { BackgroundColor3: i === 0 ? "#1e293b" : "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }});
      cmds.push({ action: "add", elementType: "TextLabel", name: `LbRank${i+1}`, parent: `LbRow${i+1}`, position: { X: 0.1, Y: 0.5 }, size: { X: 0.15, Y: 0.6 }, properties: { Text: `#${i+1}`, TextColor3: i === 0 ? "#f59e0b" : "#64748b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 3 }});
      cmds.push({ action: "add", elementType: "TextLabel", name: `LbName${i+1}`, parent: `LbRow${i+1}`, position: { X: 0.45, Y: 0.5 }, size: { X: 0.55, Y: 0.6 }, properties: { Text: names[i], TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 3 }});
      cmds.push({ action: "add", elementType: "TextLabel", name: `LbScore${i+1}`, parent: `LbRow${i+1}`, position: { X: 0.85, Y: 0.5 }, size: { X: 0.25, Y: 0.6 }, properties: { Text: scores[i], TextColor3: "#3b82f6", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Right", ZIndex: 3 }});
    }
    return { message: "Built a leaderboard panel with player rankings", commands: cmds };
  }

  if (lower.includes("gacha") || lower.includes("pet") || lower.includes("spin") || lower.includes("roll") || lower.includes("egg") || lower.includes("hatch")) {
    return { message: "Built a gacha/pet spin UI", commands: [
      { action: "add", elementType: "Frame", name: "GachaFrame", parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.4, Y: 0.65 }, properties: { BackgroundColor3: "#0a0a1a", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 20, ZIndex: 1 }},
      { action: "add", elementType: "Frame", name: "GlowFrame", parent: "GachaFrame", position: { X: 0.5, Y: 0.5 }, size: { X: 1.02, Y: 1.02 }, properties: { BackgroundColor3: "#8b5cf6", BackgroundTransparency: 0.92, BorderSizePixel: 0, CornerRadius: 22, ZIndex: 0 }},
      { action: "add", elementType: "TextLabel", name: "GachaTitle", parent: "GachaFrame", position: { X: 0.5, Y: 0.06 }, size: { X: 0.8, Y: 0.08 }, properties: { Text: "✨ PET SPIN ✨", TextColor3: "#a78bfa", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "RevealArea", parent: "GachaFrame", position: { X: 0.5, Y: 0.38 }, size: { X: 0.75, Y: 0.4 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 2, BorderColor3: "#8b5cf6", CornerRadius: 16, ZIndex: 2 }},
      { action: "add", elementType: "ImageLabel", name: "PetImage", parent: "RevealArea", position: { X: 0.5, Y: 0.45 }, size: { X: 0.6, Y: 0.6 }, properties: { Image: "https://placehold.co/200x200/1e293b/a78bfa?text=%F0%9F%90%9E&font-size=80", BackgroundTransparency: 1, ZIndex: 3 }},
      { action: "add", elementType: "TextLabel", name: "RarityLabel", parent: "RevealArea", position: { X: 0.5, Y: 0.85 }, size: { X: 0.5, Y: 0.12 }, properties: { Text: "⭐ LEGENDARY ⭐", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "CostBar", parent: "GachaFrame", position: { X: 0.5, Y: 0.65 }, size: { X: 0.8, Y: 0.06 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "CostText", parent: "CostBar", position: { X: 0.5, Y: 0.5 }, size: { X: 0.6, Y: 0.8 }, properties: { Text: "💰 500 Coins", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 3 }},
      { action: "add", elementType: "TextButton", name: "SpinBtn", parent: "GachaFrame", position: { X: 0.5, Y: 0.78 }, size: { X: 0.65, Y: 0.1 }, properties: { Text: "🎯 SPIN NOW!", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#8b5cf6", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12, ZIndex: 2 }},
      { action: "add", elementType: "TextButton", name: "MultiSpinBtn", parent: "GachaFrame", position: { X: 0.5, Y: 0.9 }, size: { X: 0.65, Y: 0.08 }, properties: { Text: "x10 SPIN (4500)", TextColor3: "#a78bfa", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 1, BorderColor3: "#8b5cf6", CornerRadius: 10, ZIndex: 2 }},
    ]};
  }

  if (lower.includes("trade") || lower.includes("exchange") || lower.includes("swap")) {
    return { message: "Built a trading UI", commands: [
      { action: "add", elementType: "Frame", name: "TradeFrame", parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.55, Y: 0.55 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16, ZIndex: 1 }},
      { action: "add", elementType: "Frame", name: "TradeHeader", parent: "TradeFrame", position: { X: 0.5, Y: 0.06 }, size: { X: 0.92, Y: 0.08 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 2 }},
      { action: "add", elementType: "TextLabel", name: "TradeTitle", parent: "TradeHeader", position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.8 }, properties: { Text: "🤝 TRADE", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "LeftPlayer", parent: "TradeFrame", position: { X: 0.25, Y: 0.4 }, size: { X: 0.46, Y: 0.5 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 1, BorderColor3: "#22c55e", CornerRadius: 10, ZIndex: 2 }},
      { action: "add", elementType: "ImageLabel", name: "LeftAvatar", parent: "LeftPlayer", position: { X: 0.5, Y: 0.12 }, size: { X: 0.2, Y: 0.18 }, properties: { Image: "https://ui-avatars.com/api/?name=P1&background=22c55e&color=fff&bold=true&size=150", BackgroundTransparency: 1, CornerRadius: 50, ZIndex: 3 }},
      { action: "add", elementType: "TextLabel", name: "LeftName", parent: "LeftPlayer", position: { X: 0.5, Y: 0.26 }, size: { X: 0.8, Y: 0.08 }, properties: { Text: "Player1", TextColor3: "#22c55e", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "LeftItems", parent: "LeftPlayer", position: { X: 0.5, Y: 0.62 }, size: { X: 0.9, Y: 0.55 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ZIndex: 3 }},
      { action: "add", elementType: "ImageLabel", name: "LeftItem1", parent: "LeftItems", position: { X: 0.25, Y: 0.35 }, size: { X: 0.35, Y: 0.55 }, properties: { Image: "https://placehold.co/100x100/1e293b/ef4444?text=%E2%9A%94%EF%B8%8F&font-size=40", BackgroundTransparency: 1, ZIndex: 4 }},
      { action: "add", elementType: "ImageLabel", name: "LeftItem2", parent: "LeftItems", position: { X: 0.75, Y: 0.35 }, size: { X: 0.35, Y: 0.55 }, properties: { Image: "https://placehold.co/100x100/1e293b/a78bfa?text=%F0%9F%92%8E&font-size=40", BackgroundTransparency: 1, ZIndex: 4 }},
      { action: "add", elementType: "Frame", name: "RightPlayer", parent: "TradeFrame", position: { X: 0.75, Y: 0.4 }, size: { X: 0.46, Y: 0.5 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 1, BorderColor3: "#3b82f6", CornerRadius: 10, ZIndex: 2 }},
      { action: "add", elementType: "ImageLabel", name: "RightAvatar", parent: "RightPlayer", position: { X: 0.5, Y: 0.12 }, size: { X: 0.2, Y: 0.18 }, properties: { Image: "https://ui-avatars.com/api/?name=P2&background=3b82f6&color=fff&bold=true&size=150", BackgroundTransparency: 1, CornerRadius: 50, ZIndex: 3 }},
      { action: "add", elementType: "TextLabel", name: "RightName", parent: "RightPlayer", position: { X: 0.5, Y: 0.26 }, size: { X: 0.8, Y: 0.08 }, properties: { Text: "Player2", TextColor3: "#3b82f6", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 3 }},
      { action: "add", elementType: "Frame", name: "RightItems", parent: "RightPlayer", position: { X: 0.5, Y: 0.62 }, size: { X: 0.9, Y: 0.55 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ZIndex: 3 }},
      { action: "add", elementType: "ImageLabel", name: "RightItem1", parent: "RightItems", position: { X: 0.25, Y: 0.35 }, size: { X: 0.35, Y: 0.55 }, properties: { Image: "https://placehold.co/100x100/1e293b/3b82f6?text=%F0%9F%9E%A1%EF%B8%8F&font-size=40", BackgroundTransparency: 1, ZIndex: 4 }},
      { action: "add", elementType: "ImageLabel", name: "RightItem2", parent: "RightItems", position: { X: 0.75, Y: 0.35 }, size: { X: 0.35, Y: 0.55 }, properties: { Image: "https://placehold.co/100x100/1e293b/f59e0b?text=%F0%9F%92%B0&font-size=40", BackgroundTransparency: 1, ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "TradeStatus", parent: "TradeFrame", position: { X: 0.5, Y: 0.85 }, size: { X: 0.5, Y: 0.06 }, properties: { Text: "Waiting...", TextColor3: "#64748b", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, ZIndex: 2 }},
      { action: "add", elementType: "TextButton", name: "AcceptBtn", parent: "TradeFrame", position: { X: 0.35, Y: 0.93 }, size: { X: 0.25, Y: 0.08 }, properties: { Text: "✅ ACCEPT", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#22c55e", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 2 }},
      { action: "add", elementType: "TextButton", name: "DeclineBtn", parent: "TradeFrame", position: { X: 0.65, Y: 0.93 }, size: { X: 0.25, Y: 0.08 }, properties: { Text: "❌ DECLINE", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#ef4444", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 2 }},
    ]};
  }

  if (lower.includes("minimap") || lower.includes("map") || lower.includes("radar")) {
    return { message: "Built a minimap frame in the corner", commands: [
      { action: "add", elementType: "Frame", name: "MinimapFrame", parent: null, position: { X: 0.92, Y: 0.12 }, size: { X: 0.15, Y: 0.2 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0.15, BorderSizePixel: 2, BorderColor3: "#334155", CornerRadius: 50, ZIndex: 1 }},
      { action: "add", elementType: "ImageLabel", name: "MapImage", parent: "MinimapFrame", position: { X: 0.5, Y: 0.5 }, size: { X: 0.85, Y: 0.85 }, properties: { Image: "https://picsum.photos/seed/darkforest/200/200", BackgroundTransparency: 1, CornerRadius: 50, ZIndex: 2 }},
      { action: "add", elementType: "Frame", name: "PlayerDot", parent: "MinimapFrame", position: { X: 0.5, Y: 0.5 }, size: { X: 0.06, Y: 0.06 }, properties: { BackgroundColor3: "#3b82f6", BackgroundTransparency: 0, BorderSizePixel: 1, BorderColor3: "#ffffff", CornerRadius: 50, ZIndex: 3 }},
    ]};
  }

  // Default: generic UI panel
  return { message: "Built a generic UI panel", commands: [
    { action: "add", elementType: "Frame", name: "PanelFrame", parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.35, Y: 0.55 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16, ZIndex: 1 }},
    { action: "add", elementType: "TextLabel", name: "PanelTitle", parent: "PanelFrame", position: { X: 0.5, Y: 0.08 }, size: { X: 0.85, Y: 0.1 }, properties: { Text: "PANEL", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 2 }},
    { action: "add", elementType: "Frame", name: "ContentArea", parent: "PanelFrame", position: { X: 0.5, Y: 0.52 }, size: { X: 0.9, Y: 0.7 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 2 }},
    { action: "add", elementType: "TextLabel", name: "InfoText", parent: "ContentArea", position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.3 }, properties: { Text: "Your UI content here", TextColor3: "#64748b", TextScaled: true, Font: "SourceSans", BackgroundTransparency: 1, ZIndex: 3 }},
    { action: "add", elementType: "TextButton", name: "ActionBtn", parent: "PanelFrame", position: { X: 0.5, Y: 0.92 }, size: { X: 0.5, Y: 0.08 }, properties: { Text: "ACTION", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#3b82f6", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2 }},
  ]};
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "";

    if (action === "submit") {
      const formData = await req.formData();
      const resp = await fetch("https://api.hyper3d.com/api/v2/rodin", {
        method: "POST",
        headers: { Authorization: `Bearer ${RODIN_KEY}` },
        body: formData,
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: resp.status,
      });
    }

    if (action === "status") {
      const body = await req.json();
      const resp = await fetch("https://api.hyper3d.com/api/v2/status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RODIN_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ subscription_key: body.subscription_key }),
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: resp.status,
      });
    }

    if (action === "download") {
      const body = await req.json();
      const resp = await fetch("https://api.hyper3d.com/api/v2/download", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RODIN_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ task_uuid: body.task_uuid }),
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: resp.status,
      });
    }

    if (action === "proxy") {
      const fileUrl = url.searchParams.get("url");
      if (!fileUrl) {
        return new Response(JSON.stringify({ error: "Missing url" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      const resp = await fetch(fileUrl, {
        headers: { Accept: "*/*" },
      });
      return new Response(resp.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": resp.headers.get("content-type") || "model/gltf-binary",
          "Cache-Control": "public, max-age=3600",
        },
        status: resp.status,
      });
    }

    if (action === "chat") {
      const body = await req.json();
      const { messages } = body;
      const SYSTEM_PROMPT = `You are a Smart Assistant for a 3D Model Generator powered by Yobest Bytr and Hyper3D Rodin AI.

Your job is to help users write better prompts for generating 3D models. When the user describes what they want in natural language, you help them refine it into a clear, effective prompt.

Rules:
- Be concise, friendly, and helpful
- Suggest improved prompts that work well for 3D model generation
- Good prompts describe: object name, shape, style, material, color, and intended use
- Keep prompts under 100 words
- When you have a refined prompt, output ONLY the final prompt text wrapped like: [PROMPT]your refined prompt here[/PROMPT]
- For 3D model generation, simple focused descriptions work best
- Do NOT use markdown formatting
- Write in plain text only`;

      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yobest-bytr.vercel.app",
          "X-Title": "Yobest 3D Generator",
        },
        body: JSON.stringify({
            model: "google/gemma-4-26b-a4b-it:free",
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            temperature: 0.7,
            max_tokens: 500,
          }),
      });
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "ui-generate") {
      const body = await req.json();
      const { messages, canvas_state, force_template, edit_mode } = body;
      const userMsg = messages?.length > 0 ? messages[messages.length - 1].content : "Create a shop UI";
      const hasElements = canvas_state && Array.isArray(canvas_state) && canvas_state.length > 0;

      // Detect edit-like messages on server side
      const editWords = ['change', 'make', 'edit', 'update', 'modify', 'adjust', 'tweak', 'better', 'improve', 'fix', 'remove', 'delete', 'move', 'resize', 'recolor', 'replace', 'swap', 'bigger', 'smaller', 'darker', 'lighter', 'brighter', 'add a', 'add new', 'turn', 'set', 'put'];
      const lowerMsg = userMsg.toLowerCase();
      const forceEdit = (edit_mode || false) || (hasElements && editWords.some(w => lowerMsg.includes(w)));

      // Build hierarchy-aware canvas context
      let canvasContext = "";
      if (hasElements) {
        const buildTree = (parentName: string | null, depth: number): string[] => {
          return canvas_state
            .filter((e: any) => (parentName === null ? !e.parent : e.parent === parentName))
            .map((e: any) => {
              const idx = canvas_state.indexOf(e) + 1;
              const indent = "  ".repeat(depth);
              const props = e.props || {};
              const parts: string[] = [];
              if (props.Text) parts.push(`Text="${props.Text}"`);
              if (props.BackgroundColor3) parts.push(`BG=${props.BackgroundColor3}`);
              if (props.TextColor3) parts.push(`FG=${props.TextColor3}`);
              if (props.Font) parts.push(`Font=${props.Font}`);
              if (props.CornerRadius) parts.push(`Corner=${props.CornerRadius}`);
              if (props.Image) parts.push(`Image=${props.Image.substring(0, 50)}`);
              if (props.BackgroundTransparency > 0) parts.push(`BGa=${props.BackgroundTransparency}`);
              if (props.TextScaled) parts.push("Scaled=true");
              if (props.TextSize) parts.push(`TextSize=${props.TextSize}`);
              const line = `${indent}[${idx}] ${e.name} (${e.type}) pos=(${e.position?.X?.toFixed(3)},${e.position?.Y?.toFixed(3)}) sz=(${e.size?.X?.toFixed(3)},${e.size?.Y?.toFixed(3)}) ${parts.join(', ')}`;
              const children = buildTree(e.name, depth + 1);
              return [line, ...children];
            });
        };
        const tree = buildTree(null, 0).join("\n");
        canvasContext = `\n\n=== EXISTING CANVAS (${canvas_state.length} elements) ===\n${tree}\n\nElement names listed above are EXACT. Use them for modify/remove.`;
      }

      // EDIT INSTRUCTION
      const EDIT_INSTRUCTION = forceEdit && hasElements ? `
\n\n*** CRITICAL: EDIT MODE — DO NOT CREATE NEW UI ***
The canvas already has ${canvas_state.length} elements. The user wants to CHANGE the existing UI.
YOU MUST output ONLY "modify" and/or "remove" commands.
DO NOT output "add" commands unless the user EXPLICITLY says "add" or "create".
DO NOT rebuild or recreate the UI. MODIFY what exists.
Use the EXACT element names from the canvas list above.
Example: if user says "make title bigger", output: {"action":"modify","target":"TitleName","properties":{"Size":{"X":0.8,"Y":0.15}}}
Example: if user says "change color to red", output: {"action":"modify","target":"FrameName","properties":{"BackgroundColor3":"#ef4444"}}` : '';

      const SYSTEM_PROMPT = `You are a top Roblox UI designer who creates interfaces seen in popular games like Blox Fruits, Adopt Me, Pet Simulator 99, Murder Mystery 2, Jailbreak, and Tower of Hell.

=== OUTPUT FORMAT ===
Return ONLY: {"message":"description","commands":[...]}

=== ADD COMMAND ===
{"action":"add","elementType":"TYPE","name":"Name","parent":null,"position":{"X":0.5,"Y":0.5},"size":{"X":0.4,"Y":0.5},"properties":{...}}

=== MODIFY COMMAND ===
{"action":"modify","target":"Name","properties":{"BackgroundColor3":"#hex"}}

=== REMOVE COMMAND ===
{"action":"remove","target":"Name"}

=== ELEMENT TYPES ===
Frame, TextLabel, TextButton, ImageLabel, ScrollingFrame, TextBox

=== MODIFIER TYPES (child of an element, no position/size) ===
UICorner: properties: Radius (number, corner radius in px)
UIStroke: properties: Color (#hex), Thickness (number), Transparency (0-1)
UIPadding: properties: Top, Bottom, Left, Right (numbers, inner padding)
UIListLayout: properties: FillDirection ("Horizontal"/"Vertical"), Padding (number), HorizontalAlignment ("Left"/"Center"/"Right"), SortOrder ("LayoutOrder"/"Name")
UIGridLayout: properties: CellPaddingX, CellPaddingY (numbers), CellSizeX, CellSizeY (numbers)
UIScale: properties: Scale (number 0.5-2.0)
UIAspectRatioConstraint: properties: AspectRatio (number), AspectType ("ScaleWithParentSize"), DominantAxis ("Width"/"Height")
UIGradient: properties: Color (#hex), Transparency (0-1), Rotation (number degrees)

Example modifier command: {"action":"add","elementType":"UICorner","name":"Corner1","parent":"Frame1","properties":{"Radius":12}}

=== PROPERTIES ===
BackgroundColor3 (#hex), BackgroundTransparency (0-1), BorderSizePixel (0), CornerRadius (0-50)
Text (string), TextColor3 (#hex), TextScaled (bool), Font (GothamBold/Gotham), TextSize (number)
TextXAlignment (Left/Center/Right), LayoutOrder (number)
Image (URL), ImageTransparency (0-1)

=== IMAGE AND ICON STRATEGY (CRITICAL — SELECT THE RIGHT IMAGE) ===

Every element type needs a DIFFERENT kind of image. Never use random images.

--- PLAYER AVATARS (circular character portraits) ---
Use Roblox headshots: https://www.roblox.com/headshot-thumbnail/image?userId=1&width=150&height=150&format=png
Or letter avatars: https://ui-avatars.com/api/?name=PlayerName&background=3b82f6&color=fff&bold=true&size=150
Use CornerRadius: 50 to make circular.

--- ITEM ICONS (swords, shields, potions, weapons) ---
Use colored placeholder boxes with emoji — these look like actual game item icons:
https://placehold.co/120x120/1e293b/ef4444?text=%E2%9A%94%EF%B8%8F&font-size=50 (sword)
https://placehold.co/120x120/1e293b/3b82f6?text=%F0%9F%9E%A1%EF%B8%8F&font-size=50 (shield)
https://placehold.co/120x120/1e293b/22c55e?text=%F0%9F%A7%A3&font-size=50 (potion)
https://placehold.co/120x120/1e293b/a78bfa?text=%F0%9F%92%8E&font-size=50 (gem)
https://placehold.co/120x120/1e293b/f59e0b?text=%F0%9F%92%B0&font-size=50 (coin)
https://placehold.co/120x120/1e293b/f472b6?text=%F0%9F%8E%AF&font-size=50 (wand)
https://placehold.co/120x120/1e293b/06b6d4?text=%F0%9F%94%A5&font-size=50 (fire)
https://placehold.co/120x120/1e293b/fda4af?text=%E2%9C%A8&font-size=50 (star)
Set BackgroundTransparency: 1 on the ImageLabel.

--- CURRENCY ICONS (small, next to prices) ---
Small emoji icons: https://placehold.co/40x40/f59e0b/000000?text=%F0%9F%92%B0&font-size=24 (gold)
https://placehold.co/40x40/8b5cf6/000000?text=%F0%9F%92%8E&font-size=24 (gem)

--- GAME THUMBNAILS / FEATURE IMAGES ---
Use curated picsum seeds for dark/moody game-like images:
https://picsum.photos/seed/darkforest/400/300, https://picsum.photos/seed/neoncity/400/300
https://picsum.photos/seed/mountains/400/300, https://picsum.photos/seed/ocean/400/300
https://picsum.photos/seed/night/400/300, https://picsum.photos/seed/fire/400/300
https://picsum.photos/seed/gold/400/300, https://picsum.photos/seed/crystal/400/300

--- BACKGROUNDS ---
DO NOT use images for backgrounds. Use solid colored Frames:
Dark gaming: #0d1117, Neon: #0a0a1a, Medieval: #1a0f0a, Colorful: #1e1e2e

--- RULES ---
1. Player avatars → Roblox headshots or ui-avatars.com (circular)
2. Item icons → placehold.co with emoji text (colored squares)
3. Currency → small placehold.co with coin emoji
4. Feature images → curated picsum seeds (darkforest, neoncity, etc.)
5. UI backgrounds → solid color Frames (no images)
6. NEVER use random picsum for icons or avatars
Use emojis IN Text property for icons: 🎮 ⚔️ 🛡️ 💰 🔥 ✨ 🏆 ⭐ 💎 🛒 👑 🗡️ 🏹 🛒 ❤️ 🎯 💜 🔵 ⚡ 🌟

=== POPULAR ROBLOX UI PATTERNS ===
1. SHOP UI: Dark background, grid of item cards with ImageLabel thumbnail + name + price + "Buy" button, currency display at top, close button
2. INVENTORY: ScrollingFrame with grid of item slots, each slot = ImageLabel + quantity TextLabel, drag-to-equip
3. HUD: Top bar (health/coins/level), minimap area, action buttons at bottom
4. QUEST LOG: Side panel with scrollable quest list, each with icon + title + progress bar
5. MAIN MENU: Large game logo ImageLabel, centered buttons (Play, Shop, Settings, Inventory)
6. STATS PAGE: Character model area + stat bars (Strength, Speed, Defense) with progress bars
7. BATTLE UI: Player cards top-left/bottom-right, health bars, ability buttons at bottom
8. LEADERBOARD: Tabbed header, scrollable player list with rank + avatar + name + score

=== DESIGN STYLES ===
- Dark Gaming: bg #0d1117/#111827, accent #3b82f6, glass morphism borders, 8-12px corner radius
- Neon Cyberpunk: bg #0a0a1a, neon cyan #06b6d4 + purple #8b5cf6, glowing borders
- Fantasy Medieval: bg #1a0f0a, gold #d4a373, ornate borders, parchment textures
- Fun Colorful: bg #1e1e2e, pastels #f472b6/#a78bfa, rounded, playful
- Military HUD: bg #111318, green #22c55e, sharp corners, tactical grid
- Anime Style: bg #0f0f23, sakura pink #fda4af, clean minimalist
- Toxic Gamer: bg #0a0a0a, neon green #22c55e, toxic drip effects
- Space Galaxy: bg #050510, purple #7c3aed, cosmic particles
- Pirate/Adventure: bg #1a1208, warm brown #b87333, wooden frame textures

=== LAYOUT RULES ===
- 12-18 elements. Make every element count — quality over quantity
- Root elements: parent null. Children: parent="ParentName"
- Root Frame: position {"X":0.5,"Y":0.5}, size {"X":0.7,"Y":0.75} for most UIs
- Children position is RELATIVE to parent center (0.5,0.5 = center of parent)
- Children size is RELATIVE to parent (1.0,1.0 = same size as parent)
- For 3 cards side by side: X = 0.17, 0.5, 0.83
- For 4 cards: X = 0.125, 0.375, 0.625, 0.875

=== POSITION AND SIZE RULES (CRITICAL) ===
- EVERY add command MUST have position={"X":N,"Y":N} and size={"X":N,"Y":N} with BOTH fields
- NEVER: position={"X":0.5} (missing Y), position=0.5 (not object), position={"X":-0.3} (negative)
- Values MUST be 0.0 to 1.0 (never negative, never over 1.5)

Output ONLY the JSON. No markdown. No explanation.` + EDIT_INSTRUCTION;

      // Normalization: fix common AI output variations to match our expected format
      function normalizeCommands(parsed: any): any {
        if (!parsed || typeof parsed !== "object") return parsed;
        if (!Array.isArray(parsed.commands)) return parsed;

        const skipTypes = new Set(["ScreenGui", "ScreenGui", "LocalScript", "Script"]);
        const modifierTypes = new Set(["UICorner", "UIStroke", "UIPadding", "UIListLayout", "UIGridLayout", "UIScale", "UIAspectRatioConstraint", "UIGradient"]);
        const nameMap = new Map<string, string>();

        // Pass 1: Build name map, filter wrappers
        const cleaned = parsed.commands.filter((c: any) => {
          if (!c || typeof c !== "object") return false;
          // Fix action names
          if (c.action === "create") c.action = "add";
          if (c.action === "delete") c.action = "remove";
          if (!["add", "modify", "remove"].includes(c.action)) return false;
          // Filter out wrapper types we don't need
          if (c.action === "add" && skipTypes.has(c.elementType)) {
            // But remember its name for child remapping
            if (c.name) nameMap.set(c.name, "__ROOT__");
            return false;
          }
          return true;
        });

        // Pass 2: Fix each command
        for (const c of cleaned) {
          if (c.action === "add") {
            const isMod = modifierTypes.has(c.elementType);

            if (isMod) {
              // Modifiers don't need position/size
              c.position = { X: 0.5, Y: 0.5 };
              c.size = { X: 1, Y: 1 };
              if (!c.properties || typeof c.properties !== "object") c.properties = {};
            } else {
              // Fix position format variations
              if (typeof c.position === "string") {
                const parts = c.position.split(/[,\s]+/).map(Number);
                c.position = { X: parts[0] || 0.5, Y: parts[1] || 0.5 };
              }
              if (!c.position || typeof c.position !== "object") c.position = { X: 0.5, Y: 0.5 };
              if (c.position.x !== undefined) { c.position.X = c.position.x; c.position.Y = c.position.y; }
              if (typeof c.position.X !== "number" || isNaN(c.position.X)) c.position.X = 0.5;
              if (typeof c.position.Y !== "number" || isNaN(c.position.Y)) c.position.Y = 0.5;
              c.position.X = Math.max(0, Math.min(1, c.position.X));
              c.position.Y = Math.max(0, Math.min(1, c.position.Y));

              // Fix size format variations
              if (typeof c.size === "string") {
                const parts = c.size.split(/[,\s]+/).map(Number);
                c.size = { X: parts[0] || 0.4, Y: parts[1] || 0.5 };
              }
              if (!c.size || typeof c.size !== "object") c.size = { X: 0.4, Y: 0.5 };
              if (c.size.x !== undefined) { c.size.X = c.size.x; c.size.Y = c.size.y; }
              if (typeof c.size.X !== "number" || isNaN(c.size.X)) c.size.X = 0.4;
              if (typeof c.size.Y !== "number" || isNaN(c.size.Y)) c.size.Y = 0.5;
              c.size.X = Math.max(0.02, Math.min(1.5, c.size.X));
              c.size.Y = Math.max(0.02, Math.min(1.5, c.size.Y));
            }

            // Fix parent mapping from filtered wrappers
            if (c.parent && nameMap.has(c.parent)) {
              c.parent = null; // Promote to root
            }

            // Remap CoreGui/StarterGui parents to null
            if (typeof c.parent === "string" && ["CoreGui", "StarterGui", "StarterGui", "game.Players.LocalPlayer.PlayerGui"].includes(c.parent)) {
              c.parent = null;
            }

            // Ensure properties exist
            if (!c.properties || typeof c.properties !== "object") c.properties = {};

            // Fix Color3.fromRGB(r,g,b) -> #hex
            const props = c.properties;
            for (const key of ["BackgroundColor3", "TextColor3", "ImageColor3"]) {
              if (typeof props[key] === "string" && props[key].includes("fromRGB")) {
                const match = props[key].match(/fromRGB\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
                if (match) {
                  const r = parseInt(match[1]).toString(16).padStart(2, "0");
                  const g = parseInt(match[2]).toString(16).padStart(2, "0");
                  const b = parseInt(match[3]).toString(16).padStart(2, "0");
                  props[key] = `#${r}${g}${b}`;
                }
              }
            }

            // Ensure name exists
            if (!c.name) c.name = `${c.elementType}${Math.random().toString(36).substring(2, 6)}`;

            // Clamp values
            if (typeof props.BackgroundTransparency === "number") props.BackgroundTransparency = Math.max(0, Math.min(1, props.BackgroundTransparency));
            if (typeof props.CornerRadius === "number") props.CornerRadius = Math.max(0, Math.min(50, props.CornerRadius));
          }

          if (c.action === "modify") {
            // Fix target -> name alias
            if (c.target && !c.name) c.name = c.target;
            // Fix properties location (some models put props at root)
            if (!c.properties) {
              c.properties = {};
              for (const k of ["BackgroundColor3", "TextColor3", "Text", "TextScaled", "Font", "CornerRadius", "BackgroundTransparency", "Image", "BorderSizePixel", "Size"]) {
                if (c[k] !== undefined) { c.properties[k] = c[k]; delete c[k]; }
              }
            }
            // Fix nested size in properties
            if (c.properties.Size && typeof c.properties.Size === "object") {
              // Size as modify target — convert to size command
              if (!c.properties.Size.X && c.properties.Size.x !== undefined) {
                c.properties.Size = { X: c.properties.Size.x, Y: c.properties.Size.y };
              }
            }
          }
        }

        // Filter out any remaining invalid commands
        parsed.commands = cleaned.filter((c: any) => {
          if (c.action === "add") return c.elementType && c.name;
          if (c.action === "modify") return (c.target || c.name) && c.properties;
          if (c.action === "remove") return c.target || c.name;
          return false;
        });

        return parsed;
      }

      let parsed = null;

      // If force_template, skip AI entirely
      if (force_template) {
        console.log("Force template mode for:", userMsg);
        parsed = generateFromTemplate(userMsg);
      } else {
        // Try AI model — single model with generous timeout
        // Free OpenRouter models can take 30-90s. Edge function limit is 150s.
        // We try 2 models max to stay under the limit.
        const models = [
          "nvidia/nemotron-nano-9b-v2:free",    // fastest free model
          "google/gemma-4-26b-a4b-it:free",      // best quality fallback
        ];

        for (const model of models) {
          if (parsed) break;
          try {
            console.log(`Trying AI model: ${model}`);
            const controller = new AbortController();
            // 45s per model — enough for slow free models, leaves room for 2nd attempt
            const timeout = setTimeout(() => controller.abort(), 45000);
            const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${OPENROUTER_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://yobest-bytr.vercel.app",
                "X-Title": "Yobest UI Builder",
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: "system", content: SYSTEM_PROMPT + canvasContext },
                  { role: "user", content: userMsg }
                ],
                temperature: 0.2,
                max_tokens: 2000,
              }),
              signal: controller.signal,
            });
            clearTimeout(timeout);
            const data = await resp.json();
            console.log(`Model ${model} responded:`, resp.status, data.error ? data.error.message : "ok");
            const content = data.choices?.[0]?.message?.content || "";

            // Try parse — extract JSON from response
            try { parsed = JSON.parse(content); } catch {
              const m = content.match(/\{[\s\S]*\}/);
              if (m) try { parsed = JSON.parse(m[0]); } catch {}
            }

            if (parsed) {
              parsed = normalizeCommands(parsed);
            }
          } catch (e) {
            console.log(`Model ${model} failed:`, e instanceof Error ? e.message : e);
          }
        }
      } // end else (AI attempt)

      // Validate: commands MUST be an array with valid actions
      const isValid = parsed
        && typeof parsed === "object"
        && Array.isArray(parsed.commands)
        && parsed.commands.length > 0
        && parsed.commands.every((c: any) => c && typeof c === "object" && ["add", "modify", "remove"].includes(c.action));

      // Fallback: template-based generation
      if (!isValid) {
        console.log("AI returned invalid commands, using template fallback for:", userMsg);
        parsed = generateFromTemplate(userMsg);
      }

      if (!parsed.message) parsed.message = "Built your UI";
      if (!Array.isArray(parsed.commands)) parsed.commands = [];

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search-images") {
      const url2 = new URL(req.url);
      const query = url2.searchParams.get("q") || "";
      if (!query) {
        return new Response(JSON.stringify({ error: "Missing query" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      // Try Unsplash with API key, fall back to curated Picsum seeds
      try {
        const resp = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`,
          { headers: { Authorization: `Client-ID ${OPENROUTER_KEY}` } }
        );
        if (resp.ok) {
          const data = await resp.json();
          const images = (data.results || []).map((img: any) => ({
            url: img.urls?.small || img.urls?.regular,
            full: img.urls?.full,
            thumb: img.urls?.thumb,
            alt: img.alt_description || query,
            author: img.user?.name || "Unknown",
            width: img.width,
            height: img.height,
          }));
          return new Response(JSON.stringify({ images, source: "unsplash" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {}
      // Fallback: curated Picsum with varied seeds based on query
      const queryWords = query.toLowerCase().split(/\s+/);
      const seeds = [
        ...queryWords,
        ...queryWords.map((w: string) => w + "-dark"),
        ...queryWords.map((w: string) => w + "-texture"),
        "abstract-" + queryWords[0],
        "gradient-" + queryWords[0],
        "pattern-" + queryWords[0],
      ].slice(0, 12);
      const images = seeds.map((seed: string, i: number) => ({
        url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/300`,
        full: `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`,
        thumb: `https://picsum.photos/seed/${encodeURIComponent(seed)}/200/150`,
        alt: `${query} ${i + 1}`,
        author: "Picsum",
        width: 400,
        height: 300,
      }));
      return new Response(JSON.stringify({ images, source: "picsum" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Proxy: forward request to OpenRouter (keeps API key server-side)
    if (action === "proxy-openrouter") {
      if (!OPENROUTER_KEY) {
        console.error("OPENROUTER_API_KEY is not set");
        return new Response(JSON.stringify({ error: "OpenRouter API key not configured" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      console.log("Proxying request to OpenRouter...");
      const body = await req.json();
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yobest-bytr.vercel.app",
          "X-Title": "Yobest UI Builder",
        },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: resp.status,
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
