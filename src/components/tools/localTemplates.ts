export function localTemplateFallback(prompt: string): { message: string; commands: any[] } | null {
  const lower = prompt.toLowerCase()

  if (lower.includes('shop') || lower.includes('store') || lower.includes('buy') || lower.includes('item')) {
    return { message: 'Built a shop UI with 4 item cards', commands: [
      { action: 'add', elementType: 'Frame', name: 'ShopFrame', parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.5, Y: 0.7 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16 }},
      { action: 'add', elementType: 'Frame', name: 'TitleBar', parent: 'ShopFrame', position: { X: 0.5, Y: 0.05 }, size: { X: 0.94, Y: 0.08 }, properties: { BackgroundColor3: '#161b22', BackgroundTransparency: 0, CornerRadius: 10 }},
      { action: 'add', elementType: 'TextLabel', name: 'ShopTitle', parent: 'TitleBar', position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.8 }, properties: { Text: '🛒 ITEM SHOP', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'ScrollingFrame', name: 'ItemGrid', parent: 'ShopFrame', position: { X: 0.5, Y: 0.55 }, size: { X: 0.94, Y: 0.85 }, properties: { BackgroundColor3: '#111827', BackgroundTransparency: 0.2, BorderSizePixel: 0, CornerRadius: 8, ScrollBarThickness: 4 }},
      { action: 'add', elementType: 'Frame', name: 'Item1', parent: 'ItemGrid', position: { X: 0.25, Y: 0.15 }, size: { X: 0.44, Y: 0.28 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12 }},
      { action: 'add', elementType: 'ImageLabel', name: 'Icon1', parent: 'Item1', position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/120x120/1e293b/ef4444?text=%E2%9A%94%EF%B8%8F&font-size=50' }},
      { action: 'add', elementType: 'TextLabel', name: 'Name1', parent: 'Item1', position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: '⚔️ Iron Sword', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
      { action: 'add', elementType: 'TextLabel', name: 'Price1', parent: 'Item1', position: { X: 0.62, Y: 0.58 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: '💰 500', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
      { action: 'add', elementType: 'TextButton', name: 'Buy1', parent: 'Item1', position: { X: 0.82, Y: 0.78 }, size: { X: 0.25, Y: 0.3 }, properties: { Text: 'BUY', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#10b981', BackgroundTransparency: 0, CornerRadius: 6 }},
      { action: 'add', elementType: 'Frame', name: 'Item2', parent: 'ItemGrid', position: { X: 0.75, Y: 0.15 }, size: { X: 0.44, Y: 0.28 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12 }},
      { action: 'add', elementType: 'ImageLabel', name: 'Icon2', parent: 'Item2', position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/120x120/1e293b/3b82f6?text=%F0%9F%9E%A1%EF%B8%8F&font-size=50' }},
      { action: 'add', elementType: 'TextLabel', name: 'Name2', parent: 'Item2', position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: '🛡️ Steel Shield', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
      { action: 'add', elementType: 'TextLabel', name: 'Price2', parent: 'Item2', position: { X: 0.62, Y: 0.58 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: '💰 1200', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
      { action: 'add', elementType: 'TextButton', name: 'Buy2', parent: 'Item2', position: { X: 0.82, Y: 0.78 }, size: { X: 0.25, Y: 0.3 }, properties: { Text: 'BUY', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#10b981', BackgroundTransparency: 0, CornerRadius: 6 }},
      { action: 'add', elementType: 'Frame', name: 'Item3', parent: 'ItemGrid', position: { X: 0.25, Y: 0.52 }, size: { X: 0.44, Y: 0.28 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12 }},
      { action: 'add', elementType: 'ImageLabel', name: 'Icon3', parent: 'Item3', position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/120x120/1e293b/22c55e?text=%F0%9F%A7%A3&font-size=50' }},
      { action: 'add', elementType: 'TextLabel', name: 'Name3', parent: 'Item3', position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: '🧪 Health Potion', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
      { action: 'add', elementType: 'TextLabel', name: 'Price3', parent: 'Item3', position: { X: 0.62, Y: 0.58 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: '💰 250', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
      { action: 'add', elementType: 'TextButton', name: 'Buy3', parent: 'Item3', position: { X: 0.82, Y: 0.78 }, size: { X: 0.25, Y: 0.3 }, properties: { Text: 'BUY', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#10b981', BackgroundTransparency: 0, CornerRadius: 6 }},
      { action: 'add', elementType: 'Frame', name: 'Item4', parent: 'ItemGrid', position: { X: 0.75, Y: 0.52 }, size: { X: 0.44, Y: 0.28 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 12 }},
      { action: 'add', elementType: 'ImageLabel', name: 'Icon4', parent: 'Item4', position: { X: 0.2, Y: 0.45 }, size: { X: 0.3, Y: 0.65 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/120x120/1e293b/a78bfa?text=%F0%9F%92%8E&font-size=50' }},
      { action: 'add', elementType: 'TextLabel', name: 'Name4', parent: 'Item4', position: { X: 0.62, Y: 0.25 }, size: { X: 0.7, Y: 0.3 }, properties: { Text: '💎 Magic Gem', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
      { action: 'add', elementType: 'TextLabel', name: 'Price4', parent: 'Item4', position: { X: 0.62, Y: 0.58 }, size: { X: 0.4, Y: 0.25 }, properties: { Text: '💰 800', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
      { action: 'add', elementType: 'TextButton', name: 'Buy4', parent: 'Item4', position: { X: 0.82, Y: 0.78 }, size: { X: 0.25, Y: 0.3 }, properties: { Text: 'BUY', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#10b981', BackgroundTransparency: 0, CornerRadius: 6 }},
    ]}
  }

  if (lower.includes('hud') || lower.includes('health') || lower.includes('mana')) {
    return { message: 'Built a player HUD with health, mana, and coins', commands: [
      { action: 'add', elementType: 'Frame', name: 'HudFrame', parent: null, position: { X: 0.5, Y: 0.92 }, size: { X: 0.4, Y: 0.1 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0.15, BorderSizePixel: 0, CornerRadius: 10 }},
      { action: 'add', elementType: 'Frame', name: 'HealthBg', parent: 'HudFrame', position: { X: 0.32, Y: 0.3 }, size: { X: 0.45, Y: 0.18 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 4 }},
      { action: 'add', elementType: 'Frame', name: 'HealthFill', parent: 'HealthBg', position: { X: 0.4, Y: 0.5 }, size: { X: 0.75, Y: 0.85 }, properties: { BackgroundColor3: '#ef4444', BackgroundTransparency: 0, CornerRadius: 4 }},
      { action: 'add', elementType: 'TextLabel', name: 'HealthText', parent: 'HealthBg', position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.9 }, properties: { Text: '750 / 1000', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'Frame', name: 'ManaBg', parent: 'HudFrame', position: { X: 0.32, Y: 0.65 }, size: { X: 0.45, Y: 0.18 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 4 }},
      { action: 'add', elementType: 'Frame', name: 'ManaFill', parent: 'ManaBg', position: { X: 0.35, Y: 0.5 }, size: { X: 0.6, Y: 0.85 }, properties: { BackgroundColor3: '#3b82f6', BackgroundTransparency: 0, CornerRadius: 4 }},
      { action: 'add', elementType: 'TextLabel', name: 'ManaText', parent: 'ManaBg', position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.9 }, properties: { Text: '200 / 500', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'TextLabel', name: 'CoinIcon', parent: 'HudFrame', position: { X: 0.88, Y: 0.28 }, size: { X: 0.08, Y: 0.45 }, properties: { Text: '💰', TextScaled: true, BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'TextLabel', name: 'CoinCount', parent: 'HudFrame', position: { X: 0.95, Y: 0.28 }, size: { X: 0.1, Y: 0.45 }, properties: { Text: '5,420', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
    ]}
  }

  if (lower.includes('menu') || lower.includes('main') || lower.includes('start') || lower.includes('lobby')) {
    return { message: 'Built a main menu with play and settings buttons', commands: [
      { action: 'add', elementType: 'Frame', name: 'MenuFrame', parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.35, Y: 0.7 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0.05, BorderSizePixel: 0, CornerRadius: 20 }},
      { action: 'add', elementType: 'TextLabel', name: 'GameTitle', parent: 'MenuFrame', position: { X: 0.5, Y: 0.12 }, size: { X: 0.85, Y: 0.12 }, properties: { Text: '🎮 MY GAME', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'TextLabel', name: 'Subtitle', parent: 'MenuFrame', position: { X: 0.5, Y: 0.22 }, size: { X: 0.7, Y: 0.06 }, properties: { Text: 'Welcome back, Player!', TextColor3: '#64748b', TextScaled: true, Font: 'SourceSans', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'TextButton', name: 'PlayBtn', parent: 'MenuFrame', position: { X: 0.5, Y: 0.42 }, size: { X: 0.7, Y: 0.1 }, properties: { Text: '▶ PLAY', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#10b981', BackgroundTransparency: 0, CornerRadius: 12 }},
      { action: 'add', elementType: 'TextButton', name: 'ShopBtn', parent: 'MenuFrame', position: { X: 0.5, Y: 0.56 }, size: { X: 0.7, Y: 0.1 }, properties: { Text: '🛒 SHOP', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 12 }},
      { action: 'add', elementType: 'TextButton', name: 'SettingsBtn', parent: 'MenuFrame', position: { X: 0.5, Y: 0.7 }, size: { X: 0.7, Y: 0.1 }, properties: { Text: '⚙ SETTINGS', TextColor3: '#94a3b8', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#161b22', BackgroundTransparency: 0, CornerRadius: 12 }},
      { action: 'add', elementType: 'TextLabel', name: 'Version', parent: 'MenuFrame', position: { X: 0.5, Y: 0.92 }, size: { X: 0.4, Y: 0.05 }, properties: { Text: 'v1.0.0', TextColor3: '#334155', TextScaled: true, Font: 'SourceSans', BackgroundTransparency: 1 }},
    ]}
  }

  if (lower.includes('inventory') || lower.includes('bag') || lower.includes('backpack')) {
    return { message: 'Built an inventory with 12 item slots', commands: [
      { action: 'add', elementType: 'Frame', name: 'InvFrame', parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.4, Y: 0.65 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16 }},
      { action: 'add', elementType: 'TextLabel', name: 'InvTitle', parent: 'InvFrame', position: { X: 0.5, Y: 0.06 }, size: { X: 0.85, Y: 0.08 }, properties: { Text: '🎒 INVENTORY', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'TextLabel', name: 'InvCount', parent: 'InvFrame', position: { X: 0.5, Y: 0.14 }, size: { X: 0.5, Y: 0.05 }, properties: { Text: '5 / 12 slots', TextColor3: '#64748b', TextScaled: true, Font: 'SourceSans', BackgroundTransparency: 1 }},
      ...(['⚔️|🛡️|🧪|💰|💎', '', '', '', '', '', '', '', '', '', '', ''].flatMap((icon, i) => {
        if (!icon) return [{ action: 'add', elementType: 'Frame', name: `Slot${i+1}`, parent: 'InvFrame', position: { X: 0.14 + (i % 4) * 0.22, Y: 0.22 + Math.floor(i / 4) * 0.22 }, size: { X: 0.18, Y: 0.16 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0.3, BorderSizePixel: 1, BorderColor3: '#334155', CornerRadius: 8 }}]
        const [emoji] = icon.split('|')
        const colors = { '⚔️': 'ef4444', '🛡️': '3b82f6', '🧪': '22c55e', '💰': 'f59e0b', '💎': 'a78bfa' }
        const c = colors[emoji as keyof typeof colors] || '94a3b8'
        const x = 0.14 + (i % 4) * 0.22, y = 0.22 + Math.floor(i / 4) * 0.22
        return [
          { action: 'add', elementType: 'Frame', name: `Slot${i+1}`, parent: 'InvFrame', position: { X: x, Y: y }, size: { X: 0.18, Y: 0.16 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, BorderSizePixel: 1, BorderColor3: '#334155', CornerRadius: 8 }},
          { action: 'add', elementType: 'ImageLabel', name: `SlotIcon${i+1}`, parent: `Slot${i+1}`, position: { X: 0.5, Y: 0.45 }, size: { X: 0.6, Y: 0.6 }, properties: { BackgroundTransparency: 1, Image: `https://placehold.co/80x80/1e293b/${c}?text=${encodeURIComponent(emoji)}&font-size=30` }},
        ]
      })),
    ]}
  }

  if (lower.includes('stats') || lower.includes('character') || lower.includes('rpg') || lower.includes('level')) {
    return { message: 'Built a character stats panel', commands: [
      { action: 'add', elementType: 'Frame', name: 'StatsFrame', parent: null, position: { X: 0.18, Y: 0.5 }, size: { X: 0.25, Y: 0.6 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 14 }},
      { action: 'add', elementType: 'TextLabel', name: 'StatsTitle', parent: 'StatsFrame', position: { X: 0.5, Y: 0.05 }, size: { X: 0.8, Y: 0.08 }, properties: { Text: '📊 CHARACTER', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'ImageLabel', name: 'Avatar', parent: 'StatsFrame', position: { X: 0.5, Y: 0.16 }, size: { X: 0.3, Y: 0.18 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 50, Image: 'https://ui-avatars.com/api/?name=Hero&background=3b82f6&color=fff&bold=true&size=150' }},
      { action: 'add', elementType: 'TextLabel', name: 'CharName', parent: 'StatsFrame', position: { X: 0.5, Y: 0.3 }, size: { X: 0.8, Y: 0.06 }, properties: { Text: 'Level 42 Warrior', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      ...['STR|#ef4444|0.75', 'DEF|#3b82f6|0.6', 'SPD|#22c55e|0.85', 'INT|#8b5cf6|0.45'].flatMap((s, i) => {
        const [label, color, fill] = s.split('|')
        const y = 0.4 + i * 0.13
        return [
          { action: 'add', elementType: 'TextLabel', name: `${label}Label`, parent: 'StatsFrame', position: { X: 0.15, Y: y }, size: { X: 0.2, Y: 0.08 }, properties: { Text: label, TextColor3: '#94a3b8', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
          { action: 'add', elementType: 'Frame', name: `${label}Bar`, parent: 'StatsFrame', position: { X: 0.6, Y: y }, size: { X: 0.6, Y: 0.06 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 4 }},
          { action: 'add', elementType: 'Frame', name: `${label}Fill`, parent: `${label}Bar`, position: { X: 0.5, Y: 0.5 }, size: { X: parseFloat(fill), Y: 0.85 }, properties: { BackgroundColor3: color, BackgroundTransparency: 0, CornerRadius: 4 }},
        ]
      }),
    ]}
  }

  if (lower.includes('leaderboard') || lower.includes('rank') || lower.includes('top')) {
    return { message: 'Built a leaderboard with player rankings', commands: [
      { action: 'add', elementType: 'Frame', name: 'LbFrame', parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.35, Y: 0.65 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16 }},
      { action: 'add', elementType: 'TextLabel', name: 'LbTitle', parent: 'LbFrame', position: { X: 0.5, Y: 0.05 }, size: { X: 0.8, Y: 0.08 }, properties: { Text: '🏆 LEADERBOARD', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      ...['🥇 ProGamer99|12500', '🥈 ShadowNinja|11200', '🥉 EpicPlayer|9800', '4️⃣ NoobMaster|7500', '5️⃣ CasualFan|5200'].flatMap((entry, i) => {
        const [rank, name, score] = entry.split('|')
        const y = 0.12 + i * 0.15
        return [
          { action: 'add', elementType: 'Frame', name: `Row${i+1}`, parent: 'LbFrame', position: { X: 0.5, Y: y }, size: { X: 0.9, Y: 0.12 }, properties: { BackgroundColor3: i === 0 ? '#1e293b' : '#161b22', BackgroundTransparency: i === 0 ? 0 : 0.3, BorderSizePixel: 0, CornerRadius: 8 }},
          { action: 'add', elementType: 'TextLabel', name: `Rank${i+1}`, parent: `Row${i+1}`, position: { X: 0.1, Y: 0.5 }, size: { X: 0.15, Y: 0.7 }, properties: { Text: rank, TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
          { action: 'add', elementType: 'TextLabel', name: `PName${i+1}`, parent: `Row${i+1}`, position: { X: 0.45, Y: 0.5 }, size: { X: 0.55, Y: 0.7 }, properties: { Text: name, TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
          { action: 'add', elementType: 'TextLabel', name: `Score${i+1}`, parent: `Row${i+1}`, position: { X: 0.88, Y: 0.5 }, size: { X: 0.25, Y: 0.7 }, properties: { Text: score, TextColor3: '#3b82f6', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Right' }},
        ]
      }),
    ]}
  }

  if (lower.includes('gacha') || lower.includes('pet') || lower.includes('spin') || lower.includes('roll') || lower.includes('egg')) {
    return { message: 'Built a gacha/pet spin UI', commands: [
      { action: 'add', elementType: 'Frame', name: 'GachaFrame', parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.4, Y: 0.65 }, properties: { BackgroundColor3: '#0a0a1a', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 20 }},
      { action: 'add', elementType: 'Frame', name: 'GlowFrame', parent: 'GachaFrame', position: { X: 0.5, Y: 0.5 }, size: { X: 1.02, Y: 1.02 }, properties: { BackgroundColor3: '#8b5cf6', BackgroundTransparency: 0.92, BorderSizePixel: 0, CornerRadius: 22 }},
      { action: 'add', elementType: 'TextLabel', name: 'GachaTitle', parent: 'GachaFrame', position: { X: 0.5, Y: 0.06 }, size: { X: 0.8, Y: 0.08 }, properties: { Text: '✨ PET SPIN ✨', TextColor3: '#a78bfa', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'Frame', name: 'RevealArea', parent: 'GachaFrame', position: { X: 0.5, Y: 0.38 }, size: { X: 0.75, Y: 0.4 }, properties: { BackgroundColor3: '#161b22', BackgroundTransparency: 0, BorderSizePixel: 2, BorderColor3: '#8b5cf6', CornerRadius: 16 }},
      { action: 'add', elementType: 'ImageLabel', name: 'PetImage', parent: 'RevealArea', position: { X: 0.5, Y: 0.42 }, size: { X: 0.55, Y: 0.55 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/200x200/1e293b/a78bfa?text=%F0%9F%90%9E&font-size=80' }},
      { action: 'add', elementType: 'TextLabel', name: 'RarityLabel', parent: 'RevealArea', position: { X: 0.5, Y: 0.85 }, size: { X: 0.5, Y: 0.12 }, properties: { Text: '⭐ LEGENDARY ⭐', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'TextLabel', name: 'CostLabel', parent: 'GachaFrame', position: { X: 0.5, Y: 0.65 }, size: { X: 0.5, Y: 0.06 }, properties: { Text: '💰 500 Coins', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'TextButton', name: 'SpinBtn', parent: 'GachaFrame', position: { X: 0.5, Y: 0.78 }, size: { X: 0.65, Y: 0.1 }, properties: { Text: '🎯 SPIN NOW!', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#8b5cf6', BackgroundTransparency: 0, CornerRadius: 12 }},
      { action: 'add', elementType: 'TextButton', name: 'MultiSpinBtn', parent: 'GachaFrame', position: { X: 0.5, Y: 0.9 }, size: { X: 0.65, Y: 0.08 }, properties: { Text: 'x10 SPIN (4500)', TextColor3: '#a78bfa', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#1e293b', BackgroundTransparency: 0, BorderSizePixel: 1, BorderColor3: '#8b5cf6', CornerRadius: 10 }},
    ]}
  }

  if (lower.includes('quest') || lower.includes('mission') || lower.includes('task')) {
    return { message: 'Built a quest log panel', commands: [
      { action: 'add', elementType: 'Frame', name: 'QuestFrame', parent: null, position: { X: 0.85, Y: 0.5 }, size: { X: 0.22, Y: 0.65 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 14 }},
      { action: 'add', elementType: 'TextLabel', name: 'QuestTitle', parent: 'QuestFrame', position: { X: 0.5, Y: 0.05 }, size: { X: 0.85, Y: 0.07 }, properties: { Text: '📜 QUESTS', TextColor3: '#f59e0b', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      ...['🗡️ Defeat 10 Slimes|7/10', '💎 Find Crystal Shard|1/1', '🏃 Reach the Village|3/5 km'].flatMap((q, i) => {
        const [name, prog] = q.split('|')
        const y = 0.14 + i * 0.26
        return [
          { action: 'add', elementType: 'Frame', name: `Quest${i+1}`, parent: 'QuestFrame', position: { X: 0.5, Y: y }, size: { X: 0.9, Y: 0.22 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 8 }},
          { action: 'add', elementType: 'TextLabel', name: `QName${i+1}`, parent: `Quest${i+1}`, position: { X: 0.5, Y: 0.25 }, size: { X: 0.88, Y: 0.35 }, properties: { Text: name, TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
          { action: 'add', elementType: 'Frame', name: `QBarBg${i+1}`, parent: `Quest${i+1}`, position: { X: 0.5, Y: 0.72 }, size: { X: 0.88, Y: 0.2 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, CornerRadius: 4 }},
          { action: 'add', elementType: 'TextLabel', name: `QProg${i+1}`, parent: `Quest${i+1}`, position: { X: 0.5, Y: 0.72 }, size: { X: 0.3, Y: 0.2 }, properties: { Text: prog, TextColor3: '#3b82f6', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
        ]
      }),
    ]}
  }

  if (lower.includes('chat') || lower.includes('message') || lower.includes('dialog')) {
    return { message: 'Built a chat panel', commands: [
      { action: 'add', elementType: 'Frame', name: 'ChatFrame', parent: null, position: { X: 0.18, Y: 0.75 }, size: { X: 0.3, Y: 0.35 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0.1, BorderSizePixel: 0, CornerRadius: 12 }},
      { action: 'add', elementType: 'Frame', name: 'ChatHeader', parent: 'ChatFrame', position: { X: 0.5, Y: 0.06 }, size: { X: 0.94, Y: 0.1 }, properties: { BackgroundColor3: '#161b22', BackgroundTransparency: 0, CornerRadius: 8 }},
      { action: 'add', elementType: 'TextLabel', name: 'ChatTitle', parent: 'ChatHeader', position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.8 }, properties: { Text: '💬 TEAM CHAT', TextColor3: '#3b82f6', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'ScrollingFrame', name: 'ChatMessages', parent: 'ChatFrame', position: { X: 0.5, Y: 0.5 }, size: { X: 0.94, Y: 0.72 }, properties: { BackgroundColor3: '#111827', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 6, ScrollBarThickness: 3 }},
      { action: 'add', elementType: 'TextLabel', name: 'Msg1', parent: 'ChatMessages', position: { X: 0.5, Y: 0.1 }, size: { X: 0.9, Y: 0.15 }, properties: { Text: 'Player1: Anyone want to trade?', TextColor3: '#94a3b8', TextScaled: true, Font: 'SourceSans', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
      { action: 'add', elementType: 'TextLabel', name: 'Msg2', parent: 'ChatMessages', position: { X: 0.5, Y: 0.35 }, size: { X: 0.9, Y: 0.15 }, properties: { Text: 'Player2: I have a legendary sword!', TextColor3: '#a78bfa', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
      { action: 'add', elementType: 'Frame', name: 'ChatInput', parent: 'ChatFrame', position: { X: 0.5, Y: 0.92 }, size: { X: 0.94, Y: 0.12 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 6 }},
      { action: 'add', elementType: 'TextLabel', name: 'InputPlaceholder', parent: 'ChatInput', position: { X: 0.5, Y: 0.5 }, size: { X: 0.85, Y: 0.7 }, properties: { Text: 'Type a message...', TextColor3: '#4b5563', TextScaled: true, Font: 'SourceSans', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
    ]}
  }

  if (lower.includes('settings') || lower.includes('option') || lower.includes('config')) {
    return { message: 'Built a settings panel', commands: [
      { action: 'add', elementType: 'Frame', name: 'SettingsFrame', parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.38, Y: 0.6 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16 }},
      { action: 'add', elementType: 'TextLabel', name: 'SettingsTitle', parent: 'SettingsFrame', position: { X: 0.5, Y: 0.06 }, size: { X: 0.8, Y: 0.08 }, properties: { Text: '⚙ SETTINGS', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      ...['🔊 Master Volume', '🎵 Music', '🔔 Notifications'].flatMap((label, i) => {
        const y = 0.18 + i * 0.16
        return [
          { action: 'add', elementType: 'TextLabel', name: `SetLabel${i+1}`, parent: 'SettingsFrame', position: { X: 0.15, Y: y }, size: { X: 0.5, Y: 0.1 }, properties: { Text: label, TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1, TextXAlignment: 'Left' }},
          { action: 'add', elementType: 'Frame', name: `ToggleBg${i+1}`, parent: 'SettingsFrame', position: { X: 0.85, Y: y }, size: { X: 0.12, Y: 0.08 }, properties: { BackgroundColor3: i < 2 ? '#10b981' : '#334155', BackgroundTransparency: 0, CornerRadius: 50 }},
          { action: 'add', elementType: 'Frame', name: `ToggleKnob${i+1}`, parent: `ToggleBg${i+1}`, position: { X: i < 2 ? 0.7 : 0.3, Y: 0.5 }, size: { X: 0.4, Y: 0.8 }, properties: { BackgroundColor3: '#fff', BackgroundTransparency: 0, CornerRadius: 50 }},
        ]
      }),
      { action: 'add', elementType: 'TextButton', name: 'ApplyBtn', parent: 'SettingsFrame', position: { X: 0.5, Y: 0.88 }, size: { X: 0.6, Y: 0.1 }, properties: { Text: '✅ APPLY', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#3b82f6', BackgroundTransparency: 0, CornerRadius: 10 }},
    ]}
  }

  if (lower.includes('minimap') || lower.includes('map') || lower.includes('radar')) {
    return { message: 'Built a minimap in the corner', commands: [
      { action: 'add', elementType: 'Frame', name: 'MinimapFrame', parent: null, position: { X: 0.92, Y: 0.12 }, size: { X: 0.15, Y: 0.2 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0.15, BorderSizePixel: 2, BorderColor3: '#334155', CornerRadius: 50 }},
      { action: 'add', elementType: 'ImageLabel', name: 'MapBg', parent: 'MinimapFrame', position: { X: 0.5, Y: 0.5 }, size: { X: 0.85, Y: 0.85 }, properties: { Image: 'https://picsum.photos/seed/darkforest/200/200', BackgroundTransparency: 1, CornerRadius: 50 }},
      { action: 'add', elementType: 'Frame', name: 'PlayerDot', parent: 'MinimapFrame', position: { X: 0.5, Y: 0.5 }, size: { X: 0.06, Y: 0.06 }, properties: { BackgroundColor3: '#3b82f6', BackgroundTransparency: 0, BorderSizePixel: 1, BorderColor3: '#ffffff', CornerRadius: 50 }},
    ]}
  }

  if (lower.includes('trade') || lower.includes('exchange') || lower.includes('swap')) {
    return { message: 'Built a trading UI', commands: [
      { action: 'add', elementType: 'Frame', name: 'TradeFrame', parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.55, Y: 0.55 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16 }},
      { action: 'add', elementType: 'TextLabel', name: 'TradeTitle', parent: 'TradeFrame', position: { X: 0.5, Y: 0.05 }, size: { X: 0.8, Y: 0.08 }, properties: { Text: '🤝 TRADE', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'Frame', name: 'LeftPanel', parent: 'TradeFrame', position: { X: 0.25, Y: 0.42 }, size: { X: 0.46, Y: 0.5 }, properties: { BackgroundColor3: '#161b22', BackgroundTransparency: 0, BorderSizePixel: 1, BorderColor3: '#22c55e', CornerRadius: 10 }},
      { action: 'add', elementType: 'ImageLabel', name: 'LeftAvatar', parent: 'LeftPanel', position: { X: 0.5, Y: 0.12 }, size: { X: 0.2, Y: 0.18 }, properties: { BackgroundTransparency: 1, Image: 'https://ui-avatars.com/api/?name=P1&background=22c55e&color=fff&bold=true&size=150', CornerRadius: 50 }},
      { action: 'add', elementType: 'TextLabel', name: 'LeftName', parent: 'LeftPanel', position: { X: 0.5, Y: 0.28 }, size: { X: 0.8, Y: 0.08 }, properties: { Text: 'Player1', TextColor3: '#22c55e', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'Frame', name: 'LeftItems', parent: 'LeftPanel', position: { X: 0.5, Y: 0.62 }, size: { X: 0.9, Y: 0.5 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 6 }},
      { action: 'add', elementType: 'ImageLabel', name: 'LItem1', parent: 'LeftItems', position: { X: 0.25, Y: 0.35 }, size: { X: 0.35, Y: 0.55 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/100x100/1e293b/ef4444?text=%E2%9A%94%EF%B8%8F&font-size=40' }},
      { action: 'add', elementType: 'ImageLabel', name: 'LItem2', parent: 'LeftItems', position: { X: 0.75, Y: 0.35 }, size: { X: 0.35, Y: 0.55 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/100x100/1e293b/a78bfa?text=%F0%9F%92%8E&font-size=40' }},
      { action: 'add', elementType: 'Frame', name: 'RightPanel', parent: 'TradeFrame', position: { X: 0.75, Y: 0.42 }, size: { X: 0.46, Y: 0.5 }, properties: { BackgroundColor3: '#161b22', BackgroundTransparency: 0, BorderSizePixel: 1, BorderColor3: '#3b82f6', CornerRadius: 10 }},
      { action: 'add', elementType: 'ImageLabel', name: 'RightAvatar', parent: 'RightPanel', position: { X: 0.5, Y: 0.12 }, size: { X: 0.2, Y: 0.18 }, properties: { BackgroundTransparency: 1, Image: 'https://ui-avatars.com/api/?name=P2&background=3b82f6&color=fff&bold=true&size=150', CornerRadius: 50 }},
      { action: 'add', elementType: 'TextLabel', name: 'RightName', parent: 'RightPanel', position: { X: 0.5, Y: 0.28 }, size: { X: 0.8, Y: 0.08 }, properties: { Text: 'Player2', TextColor3: '#3b82f6', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'Frame', name: 'RightItems', parent: 'RightPanel', position: { X: 0.5, Y: 0.62 }, size: { X: 0.9, Y: 0.5 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, CornerRadius: 6 }},
      { action: 'add', elementType: 'ImageLabel', name: 'RItem1', parent: 'RightItems', position: { X: 0.25, Y: 0.35 }, size: { X: 0.35, Y: 0.55 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/100x100/1e293b/3b82f6?text=%F0%9F%9E%A1%EF%B8%8F&font-size=40' }},
      { action: 'add', elementType: 'ImageLabel', name: 'RItem2', parent: 'RightItems', position: { X: 0.75, Y: 0.35 }, size: { X: 0.35, Y: 0.55 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/100x100/1e293b/f59e0b?text=%F0%9F%92%B0&font-size=40' }},
      { action: 'add', elementType: 'TextButton', name: 'AcceptBtn', parent: 'TradeFrame', position: { X: 0.35, Y: 0.93 }, size: { X: 0.25, Y: 0.08 }, properties: { Text: '✅ ACCEPT', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#22c55e', BackgroundTransparency: 0, CornerRadius: 10 }},
      { action: 'add', elementType: 'TextButton', name: 'DeclineBtn', parent: 'TradeFrame', position: { X: 0.65, Y: 0.93 }, size: { X: 0.25, Y: 0.08 }, properties: { Text: '❌ DECLINE', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#ef4444', BackgroundTransparency: 0, CornerRadius: 10 }},
    ]}
  }

  if (lower.includes('battle') || lower.includes('fight') || lower.includes('pvp')) {
    return { message: 'Built a battle UI with two fighters', commands: [
      { action: 'add', elementType: 'Frame', name: 'BattleFrame', parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.6, Y: 0.65 }, properties: { BackgroundColor3: '#0a0a0a', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16 }},
      { action: 'add', elementType: 'Frame', name: 'Fighter1', parent: 'BattleFrame', position: { X: 0.22, Y: 0.3 }, size: { X: 0.35, Y: 0.4 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, BorderSizePixel: 2, BorderColor3: '#ef4444', CornerRadius: 12 }},
      { action: 'add', elementType: 'ImageLabel', name: 'Fighter1Img', parent: 'Fighter1', position: { X: 0.5, Y: 0.35 }, size: { X: 0.5, Y: 0.5 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/200x200/1e293b/ef4444?text=%F0%9F%91%AA&font-size=80' }},
      { action: 'add', elementType: 'TextLabel', name: 'Fighter1Name', parent: 'Fighter1', position: { X: 0.5, Y: 0.72 }, size: { X: 0.8, Y: 0.1 }, properties: { Text: 'Warrior', TextColor3: '#ef4444', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'Frame', name: 'HP1Bg', parent: 'Fighter1', position: { X: 0.5, Y: 0.88 }, size: { X: 0.8, Y: 0.08 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, CornerRadius: 4 }},
      { action: 'add', elementType: 'Frame', name: 'HP1Fill', parent: 'HP1Bg', position: { X: 0.4, Y: 0.5 }, size: { X: 0.75, Y: 0.85 }, properties: { BackgroundColor3: '#ef4444', BackgroundTransparency: 0, CornerRadius: 4 }},
      { action: 'add', elementType: 'TextLabel', name: 'VS', parent: 'BattleFrame', position: { X: 0.5, Y: 0.3 }, size: { X: 0.15, Y: 0.15 }, properties: { Text: '⚔️', TextScaled: true, BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'Frame', name: 'Fighter2', parent: 'BattleFrame', position: { X: 0.78, Y: 0.3 }, size: { X: 0.35, Y: 0.4 }, properties: { BackgroundColor3: '#1e293b', BackgroundTransparency: 0, BorderSizePixel: 2, BorderColor3: '#3b82f6', CornerRadius: 12 }},
      { action: 'add', elementType: 'ImageLabel', name: 'Fighter2Img', parent: 'Fighter2', position: { X: 0.5, Y: 0.35 }, size: { X: 0.5, Y: 0.5 }, properties: { BackgroundTransparency: 1, Image: 'https://placehold.co/200x200/1e293b/3b82f6?text=%F0%9F%91%AA&font-size=80' }},
      { action: 'add', elementType: 'TextLabel', name: 'Fighter2Name', parent: 'Fighter2', position: { X: 0.5, Y: 0.72 }, size: { X: 0.8, Y: 0.1 }, properties: { Text: 'Mage', TextColor3: '#3b82f6', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
      { action: 'add', elementType: 'Frame', name: 'HP2Bg', parent: 'Fighter2', position: { X: 0.5, Y: 0.88 }, size: { X: 0.8, Y: 0.08 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, CornerRadius: 4 }},
      { action: 'add', elementType: 'Frame', name: 'HP2Fill', parent: 'HP2Bg', position: { X: 0.6, Y: 0.5 }, size: { X: 0.6, Y: 0.85 }, properties: { BackgroundColor3: '#3b82f6', BackgroundTransparency: 0, CornerRadius: 4 }},
      { action: 'add', elementType: 'TextButton', name: 'AttackBtn', parent: 'BattleFrame', position: { X: 0.5, Y: 0.85 }, size: { X: 0.4, Y: 0.1 }, properties: { Text: '⚔️ ATTACK', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#ef4444', BackgroundTransparency: 0, CornerRadius: 10 }},
    ]}
  }

  // Default fallback: generate a simple generic panel
  return { message: 'Built a generic UI panel', commands: [
    { action: 'add', elementType: 'Frame', name: 'GenericFrame', parent: null, position: { X: 0.5, Y: 0.5 }, size: { X: 0.4, Y: 0.5 }, properties: { BackgroundColor3: '#0d1117', BackgroundTransparency: 0, BorderSizePixel: 0, CornerRadius: 16 }},
    { action: 'add', elementType: 'Frame', name: 'Header', parent: 'GenericFrame', position: { X: 0.5, Y: 0.06 }, size: { X: 0.94, Y: 0.1 }, properties: { BackgroundColor3: '#161b22', BackgroundTransparency: 0, CornerRadius: 10 }},
    { action: 'add', elementType: 'TextLabel', name: 'Title', parent: 'Header', position: { X: 0.5, Y: 0.5 }, size: { X: 0.8, Y: 0.8 }, properties: { Text: '✨ UI Panel', TextColor3: '#f1f5f9', TextScaled: true, Font: 'GothamBold', BackgroundTransparency: 1 }},
    { action: 'add', elementType: 'TextLabel', name: 'Description', parent: 'GenericFrame', position: { X: 0.5, Y: 0.35 }, size: { X: 0.85, Y: 0.15 }, properties: { Text: 'Describe what you want and AI will build it!', TextColor3: '#94a3b8', TextScaled: true, Font: 'Gotham', BackgroundTransparency: 1 }},
    { action: 'add', elementType: 'TextButton', name: 'ActionBtn', parent: 'GenericFrame', position: { X: 0.5, Y: 0.7 }, size: { X: 0.5, Y: 0.1 }, properties: { Text: '🎮 Action', TextColor3: '#fff', TextScaled: true, Font: 'GothamBold', BackgroundColor3: '#3b82f6', BackgroundTransparency: 0, CornerRadius: 10 }},
  ]}
}
