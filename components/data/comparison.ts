// Slides 51–52. Licences: research/T2-projects.md §1 (verified via GitHub
// LICENSE files); pros/cons: T2 §10. Wording on Reticulum's licence is
// neutral facts only, no OSI verdict on the slide (speaker decision 2026-10-21):
// status = licence name, one neutral tone for all three (T9a, 2026-10-21).
import type { IconName } from './icons'
import type { Project, Tone } from './tones'

export interface CompareColumn {
  project: Project
  status?: { text: string, tone: Tone }
  lines?: string[]
  // Closed part of an otherwise open project: one box, drawn last, with a
  // lock, in the red tone. details say what is free and what exactly costs money,
  // one sub-card each: short label on top, text below.
  closed?: { title: string, details: { label: string, text: string }[] }
  pros?: string[]
  cons?: string[]
}

export const LICENSE_COLUMNS: CompareColumn[] = [
  { project: 'meshtastic', status: { text: 'GPL-3.0', tone: 'slate' }, lines: ['фърмуер', 'приложения', 'CLI'] },
  {
    // The closed part is one named app (Liam Cottle, FAQ §1.1, §5.7), not
    // „the official apps“ in general. MeshCore Open is the MIT community app.
    project: 'meshcore',
    status: { text: 'MIT', tone: 'slate' },
    lines: ['фърмуер', 'CLI и библиотеки', 'MeshCore Open: MIT, от общността'],
    // FAQ §4.9, §5.7: free app, the in-app purchase removes the wait timer for
    // remote management of repeaters and room servers over RF. App Store
    // id6742354151 (2026-11-07): one purchase „Remote Management“, $7.99 (US),
    // listed as an in-app purchase with no period, not under subscriptions,
    // and the FAQ calls it an unlock: a one-time payment.
    closed: {
      title: 'приложението на Liam Cottle е затворено',
      details: [
        { label: 'безплатно', text: 'съобщения и канали' },
        { label: 'еднократно: 7,99 $', text: 'Remote Management' },
        { label: 'без покупка', text: 'управление с изчакване' },
      ],
    },
  },
  {
    // MIT text plus two bans (LICENSE in Reticulum and LXMF, 2026-11-07).
    project: 'reticulum',
    status: { text: 'Reticulum License', tone: 'slate' },
    lines: ['MIT + две забрани', 'забрана: вреда на хора', 'забрана: обучение на AI', 'RNode GPL-3.0, Sideband CC BY-NC-SA'],
  },
]

export const PROSCONS_COLUMNS: CompareColumn[] = [
  { project: 'meshtastic', pros: ['бърз старт', 'много устройства'], cons: ['всеки възел препраща', 'видими хедъри'] },
  { project: 'meshcore', pros: ['мащабира се', 'градски мрежи'], cons: ['нужни repeater-и', 'затворен клиент'] },
  { project: 'reticulum', pros: ['всяка среда', 'силна криптография'], cons: ['трудно за начинаещи', 'без Sideband за iOS'] },
]

export const PROSCONS_FOOTER = { text: 'Не се разбират помежду си.', tone: 'red' as Tone }

// Slide 53 „Къде пасва всеки“. Sources: DEF CON 33 is the Meshtastic blog
// „That one time at DEF CON“ (more than 2000 nodes, reported by attendees).
// UMNG is arXiv 2605.20379 (smart campus, T3 §A). #emergency is a public
// meshcore.bg channel (T3 §A). Reticulum bridging is understanding.rst (T2 §2).
export interface UseCase { icon: IconName, label: string, tag?: string }
export interface UseCaseColumn { project: Project, subtitle: string, cases: [UseCase, UseCase] }

export const USE_CASE_COLUMNS: UseCaseColumn[] = [
  {
    project: 'meshtastic',
    subtitle: 'бърз старт, много устройства',
    cases: [
      { icon: 'user-multiple', label: 'Големи събития', tag: 'DEF CON 33, 2025' },
      { icon: 'weather-station', label: 'Сензори на открито', tag: 'кампус UMNG, Колумбия' },
    ],
  },
  {
    project: 'meshcore',
    subtitle: 'планирана мрежа с repeater-и',
    cases: [
      { icon: 'chart-network', label: 'Градски мрежи с repeater-и' },
      { icon: 'flood-warning', label: 'Спешен канал', tag: 'MeshCore България' },
    ],
  },
  {
    project: 'reticulum',
    subtitle: 'смесени връзки, силна криптография',
    cases: [
      { icon: 'cloud', label: 'LoRa, Wi-Fi, интернет' },
      { icon: 'chat', label: 'Шифровани съобщения', tag: 'LXMF, Sideband' },
    ],
  },
]
