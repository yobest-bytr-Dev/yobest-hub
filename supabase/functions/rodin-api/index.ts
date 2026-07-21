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
      { action: "add", elementType: "TextLabel", name: "ShopTitle", parent: "TitleBar", position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.8 }, properties: { Text: "ITEM SHOP", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, ZIndex: 3 }},
      { action: "add", elementType: "ScrollingFrame", name: "ItemGrid", parent: "ShopFrame", position: { X: 0.5, Y: 0.55 }, size: { X: 0.92, Y: 0.82 }, properties: { BackgroundColor3: "#161b22", BackgroundTransparency: 0.3, BorderSizePixel: 0, CornerRadius: 8, ZIndex: 2, ScrollBarThickness: 6 }},
      // Item 1
      { action: "add", elementType: "Frame", name: "Item1", parent: "ItemGrid", position: { X: 0.25, Y: 0.15 }, size: { X: 0.45, Y: 0.25 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 3 }},
      { action: "add", elementType: "ImageLabel", name: "ItemIcon1", parent: "Item1", position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundColor3: "#334155", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, Image: "https://picsum.photos/seed/sword/200/200", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemName1", parent: "Item1", position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: "Iron Sword", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemPrice1", parent: "Item1", position: { X: 0.62, Y: 0.55 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: "500 Gold", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextButton", name: "BuyBtn1", parent: "Item1", position: { X: 0.82, Y: 0.75 }, size: { X: 0.25, Y: 0.35 }, properties: { Text: "BUY", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ZIndex: 4 }},
      // Item 2
      { action: "add", elementType: "Frame", name: "Item2", parent: "ItemGrid", position: { X: 0.75, Y: 0.15 }, size: { X: 0.45, Y: 0.25 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 3 }},
      { action: "add", elementType: "ImageLabel", name: "ItemIcon2", parent: "Item2", position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundColor3: "#334155", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, Image: "https://picsum.photos/seed/shield/200/200", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemName2", parent: "Item2", position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: "Steel Shield", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemPrice2", parent: "Item2", position: { X: 0.62, Y: 0.55 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: "1200 Gold", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextButton", name: "BuyBtn2", parent: "Item2", position: { X: 0.82, Y: 0.75 }, size: { X: 0.25, Y: 0.35 }, properties: { Text: "BUY", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ZIndex: 4 }},
      // Item 3
      { action: "add", elementType: "Frame", name: "Item3", parent: "ItemGrid", position: { X: 0.25, Y: 0.5 }, size: { X: 0.45, Y: 0.25 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 3 }},
      { action: "add", elementType: "ImageLabel", name: "ItemIcon3", parent: "Item3", position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundColor3: "#334155", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, Image: "https://picsum.photos/seed/potion/200/200", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemName3", parent: "Item3", position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: "Health Potion", TextColor3: "#f1f5f9", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextLabel", name: "ItemPrice3", parent: "Item3", position: { X: 0.62, Y: 0.55 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: "250 Gold", TextColor3: "#f59e0b", TextScaled: true, Font: "GothamBold", BackgroundTransparency: 1, TextXAlignment: "Left", ZIndex: 4 }},
      { action: "add", elementType: "TextButton", name: "BuyBtn3", parent: "Item3", position: { X: 0.82, Y: 0.75 }, size: { X: 0.25, Y: 0.35 }, properties: { Text: "BUY", TextColor3: "#ffffff", TextScaled: true, Font: "GothamBold", BackgroundColor3: "#10b981", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ZIndex: 4 }},
      // Item 4
      { action: "add", elementType: "Frame", name: "Item4", parent: "ItemGrid", position: { X: 0.75, Y: 0.5 }, size: { X: 0.45, Y: 0.25 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 10, ZIndex: 3 }},
      { action: "add", elementType: "ImageLabel", name: "ItemIcon4", parent: "Item4", position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundColor3: "#334155", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8, Image: "https://picsum.photos/seed/gem/200/200", ZIndex: 4 }},
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
          const icons = ["sword", "shield", "potion", "coin", "gem"];
          cmds.push({ action: "add", elementType: "ImageLabel", name: `SlotIcon${idx}`, parent: `Slot${idx}`, position: { X: 0.5, Y: 0.45 }, size: { X: 0.6, Y: 0.6 }, properties: { BackgroundTransparency: 1, Image: `https://picsum.photos/seed/${icons[idx-1]}/100/100`, ZIndex: 4 }});
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
      { action: "add", elementType: "ImageLabel", name: "Avatar", parent: "StatsFrame", position: { X: 0.5, Y: 0.12 }, size: { X: 0.35, Y: 0.2 }, properties: { BackgroundColor3: "#1e293b", BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 50, Image: "https://picsum.photos/seed/avatar/200/200", ZIndex: 2 }},
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

  if (lower.includes("minimap") || lower.includes("map") || lower.includes("radar")) {
    return { message: "Built a minimap frame in the corner", commands: [
      { action: "add", elementType: "Frame", name: "MinimapFrame", parent: null, position: { X: 0.92, Y: 0.12 }, size: { X: 0.15, Y: 0.2 }, properties: { BackgroundColor3: "#0d1117", BackgroundTransparency: 0.15, BorderSizePixel: 2, BorderColor3: "#334155", CornerRadius: 50, ZIndex: 1 }},
      { action: "add", elementType: "ImageLabel", name: "MapImage", parent: "MinimapFrame", position: { X: 0.5, Y: 0.5 }, size: { X: 0.85, Y: 0.85 }, properties: { Image: "https://picsum.photos/seed/minimap/200/200", BackgroundTransparency: 1, CornerRadius: 50, ZIndex: 2 }},
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
          model: "openrouter/free",
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
      const { messages, canvas_state, force_template } = body;
      const userMsg = messages?.length > 0 ? messages[messages.length - 1].content : "Create a shop UI";

      // Build rich canvas context for AI — includes element names, types, positions, sizes, and key props
      let canvasContext = "";
      if (canvas_state && Array.isArray(canvas_state) && canvas_state.length > 0) {
        canvasContext = "\n\nCurrent canvas elements (" + canvas_state.length + " total):\n" + canvas_state.map((e: any) => {
          const props = e.props || {};
          const keyProps: string[] = [];
          if (props.Text) keyProps.push(`Text:"${props.Text}"`);
          if (props.BackgroundColor3 && props.BackgroundColor3 !== '#c8c8c8') keyProps.push(`BG:${props.BackgroundColor3}`);
          if (props.TextColor3 && props.TextColor3 !== '#000000') keyProps.push(`FG:${props.TextColor3}`);
          if (props.Font && props.Font !== 'Legacy') keyProps.push(`Font:${props.Font}`);
          if (props.CornerRadius) keyProps.push(`Corner:${props.CornerRadius}`);
          if (props.Image) keyProps.push(`Image:${props.Image.substring(0, 60)}`);
          if (props.BackgroundTransparency !== undefined && props.BackgroundTransparency > 0) keyProps.push(`BGAlpha:${props.BackgroundTransparency}`);
          if (props.TextScaled) keyProps.push("Scaled");
          return `- ${e.name} (${e.type}) pos(${e.position?.X?.toFixed(3)},${e.position?.Y?.toFixed(3)}) size(${e.size?.X?.toFixed(3)},${e.size?.Y?.toFixed(3)})${keyProps.length ? ' {' + keyProps.join(', ') + '}' : ''}`;
        }).join("\n");
      }

      const SYSTEM_PROMPT = `You are a Roblox UI generator AND editor. Output ONLY a JSON object.

COMMAND FORMAT — "commands" MUST be an array of these command objects:

1) ADD command — create a new element:
{"action":"add","elementType":"Frame|TextLabel|TextButton|ImageLabel|ScrollingFrame|TextBox","name":"PascalCase","parent":null|"ParentName","position":{"X":0.5,"Y":0.5},"size":{"X":0.4,"Y":0.5},"properties":{"BackgroundColor3":"#hex","CornerRadius":12,"Text":"string","TextColor3":"#hex","TextScaled":true,"Font":"GothamBold","Image":"url","BackgroundTransparency":0-1,"BorderSizePixel":0,"ZIndex":number}}

2) MODIFY command — change an existing element's properties (match by exact name):
{"action":"modify","target":"ExactName","properties":{"BackgroundColor3":"#hex","Text":"new text","TextColor3":"#hex","TextScaled":true,"CornerRadius":8,"BackgroundTransparency":0.5}}

3) REMOVE command — delete an element and its children:
{"action":"remove","target":"ExactName"}

RESPONSE FORMAT:
{"message":"what you did in one sentence","commands":[...]}

RULES:
1. "commands" MUST be an ARRAY of objects. Never a string, never an object.
2. For new UIs: put root elements first (parent: null), then children after their parent. Build 10-30 elements.
3. For editing: use modify/remove commands targeting EXACT element names shown in canvas context. You can change colors, text, size, position, font, transparency, etc.
4. Dark theme colors: #0d1117, #161b22, #1e293b, #334155, #f1f5f9, #94a3b8, #64748b
5. 0.5, 0.5 = center of screen. Include title bars, content areas, buttons, labels, images.
6. Output ONLY the JSON object. No markdown, no explanation, no \`\`\`json blocks.`;

      let parsed = null;

      // If force_template, skip AI entirely
      if (force_template) {
        console.log("Force template mode for:", userMsg);
        parsed = generateFromTemplate(userMsg);
      } else {
      // Try AI model with timeout
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);
        const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://yobest-bytr.vercel.app",
            "X-Title": "Yobest UI Builder",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001:free",
            messages: [
              { role: "system", content: SYSTEM_PROMPT + canvasContext },
              { role: "user", content: userMsg }
            ],
            temperature: 0.2,
            max_tokens: 3000,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content || "";

        // Try parse — extract JSON from response
        try { parsed = JSON.parse(content); } catch {
          const m = content.match(/\{[\s\S]*\}/);
          if (m) try { parsed = JSON.parse(m[0]); } catch {}
        }
      } catch (e) {
        console.log("AI generation failed:", e instanceof Error ? e.message : e);
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
