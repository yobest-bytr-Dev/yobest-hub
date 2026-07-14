export const avatarDecorations = [
  { value: 'none', label: 'None' },
  { value: 'fairy-sprites', label: 'Fairy Sprites' },
  { value: 'angel-wings', label: 'Angel Wings' },
  { value: 'flower-crown', label: 'Flower Crown' },
  { value: 'cyber-glitch', label: 'Cyber Glitch' },
  { value: 'mystic-aura', label: 'Mystic Aura' },
  { value: 'neon-pulse', label: 'Neon Pulse' },
  { value: 'holo-frame', label: 'Holo Frame' },
  { value: 'fire-ember', label: 'Fire Ember' },
  { value: 'magic-sparkles', label: 'Magic Sparkles' },
  { value: 'tech-hud', label: 'Tech HUD' },
  { value: 'arcade-pixel', label: 'Arcade Pixel' },
  { value: 'dark-energy', label: 'Dark Energy' },
  { value: 'cloud-drift', label: 'Cloud Drift' },
  { value: 'golden-halo', label: 'Golden Halo' },
  { value: 'purple-flames', label: 'Purple Flames' },
  { value: 'green-vines', label: 'Green Vines' },
  { value: 'blue-energy', label: 'Blue Energy' },
  { value: 'rainbow-ring', label: 'Rainbow Ring' },
  { value: 'dark-wings', label: 'Dark Wings' },
  { value: 'golden-crown', label: 'Golden Crown' },
  { value: 'pink-aura', label: 'Pink Aura' },
] as const

export type AvatarDecorationType = (typeof avatarDecorations)[number]['value']

const decorationUrls: Record<string, string> = {
  'fairy-sprites': 'https://r2.haunt.gg/decorations/fairy_sprites.png',
  'angel-wings': 'https://cdn.discordapp.com/avatar-decoration-presets/a_1e929fcc6a6a5193d17f016d4c97746e.png?size=96&passthrough=true',
  'flower-crown': 'https://cdn.discordapp.com/avatar-decoration-presets/a_a41b03990d296e4ebb25ac0332e6b893.png?size=96&passthrough=true',
  'cyber-glitch': 'https://cdn.discordapp.com/avatar-decoration-presets/a_e90ebc0114e7bdc30353c8b11953ea41.png?size=96&passthrough=true',
  'mystic-aura': 'https://cdn.discordapp.com/avatar-decoration-presets/a_f740031cc97d1b7eb73c0d0ac1dd09f3.png?size=96&passthrough=true',
  'neon-pulse': 'https://cdn.discordapp.com/avatar-decoration-presets/a_49c479e15533fb4c02eb320c9c137433.png?size=96&passthrough=true',
  'holo-frame': 'https://cdn.discordapp.com/avatar-decoration-presets/a_c6b3bc1dc49e5b284dca0b6437831004.png?size=96&passthrough=true',
  'fire-ember': 'https://cdn.discordapp.com/avatar-decoration-presets/a_d1ea7b8650bf3d64a03304c2ceb7d089.png?size=96&passthrough=true',
  'magic-sparkles': 'https://cdn.discordapp.com/avatar-decoration-presets/a_13913a00bd9990ab4102a3bf069f0f3f.png?size=96&passthrough=true',
  'tech-hud': 'https://cdn.discordapp.com/avatar-decoration-presets/a_9532e6bc08133eb1401c654a4f1a800e.png?size=96&passthrough=true',
  'arcade-pixel': 'https://cdn.discordapp.com/avatar-decoration-presets/a_65db91cee351e36150a2b506b26eba71.png?size=96&passthrough=true',
  'dark-energy': 'https://cdn.discordapp.com/avatar-decoration-presets/a_10b9f886b513b77ccdd67c8784f1a496.png?size=96&passthrough=true',
  'cloud-drift': 'https://cdn.discordapp.com/avatar-decoration-presets/a_e8c11f139e55dac538cdaafb3caa2317.png?size=96&passthrough=true',
  'golden-halo': 'https://cdn.discordapp.com/avatar-decoration-presets/a_39fa45dc828d5def2ba160786f1e6a17.png',
  'purple-flames': 'https://cdn.discordapp.com/avatar-decoration-presets/a_386445551be850bb16b73a225d0d0602.png',
  'green-vines': 'https://cdn.discordapp.com/avatar-decoration-presets/a_c45abe8c7585fdb41b8d8d4d666f1588.png',
  'blue-energy': 'https://cdn.discordapp.com/avatar-decoration-presets/a_3c97a2d37f433a7913a1c7b7a735d000.png',
  'rainbow-ring': 'https://cdn.discordapp.com/avatar-decoration-presets/a_65ab42be2fb75f90282cbee2506e384c.png',
  'dark-wings': 'https://cdn.discordapp.com/avatar-decoration-presets/a_c86b11a49bb8057ce9c974a6f7ad658a.png?size=160&passthrough=true',
  'golden-crown': 'https://cdn.discordapp.com/avatar-decoration-presets/a_b70f0a0cecf3097eae17a8f7d8c659a8.png?size=160&passthrough=true',
  'pink-aura': 'https://cdn.discordapp.com/avatar-decoration-presets/a_af21a730b99ed414e520decfea99aa79.png?size=160&passthrough=true',
}

export function getDecorationUrl(effect: string | null | undefined): string | null {
  if (!effect || effect === 'none') return null
  return decorationUrls[effect] || null
}
