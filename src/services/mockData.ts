import { MediaItem, Season, CastMember, CrewMember, AudioTrack, SubtitleTrack } from '../types/media';

// Verified, high-availability public test streams:
export const RELIABLE_STREAMS = {
  default: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  sintel: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  tears: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  elephants: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  blazes: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
};

export const STREAM_BIG_BUCK_BUNNY = RELIABLE_STREAMS.default;
export const STREAM_SINTEL = RELIABLE_STREAMS.sintel;
export const STREAM_TEARS_OF_STEEL = RELIABLE_STREAMS.tears;
export const STREAM_ELEPHANTS_DREAM = RELIABLE_STREAMS.elephants;
export const STREAM_FOR_BIGGER_BLAZES = RELIABLE_STREAMS.blazes;
export const DEFAULT_FALLBACK_STREAM = RELIABLE_STREAMS.default;

export const ITEM_VIDEO_URLS: Record<number, string> = {
  101: RELIABLE_STREAMS.tears,     // Interstellar (Sci-Fi)
  102: RELIABLE_STREAMS.sintel,    // Cyberpunk (Anime/Action)
  103: RELIABLE_STREAMS.elephants, // Severance (Sci-Fi/Mystery)
  104: RELIABLE_STREAMS.tears,     // Dune: Part Two (Sci-Fi Epic)
  105: RELIABLE_STREAMS.default,   // The Last of Us (Drama/Action)
  106: RELIABLE_STREAMS.blazes,    // Oppenheimer (Drama/History)
  107: RELIABLE_STREAMS.sintel,    // Stranger Things (Sci-Fi/Fantasy)
  108: RELIABLE_STREAMS.tears,     // The Batman (Crime/Action)
  109: RELIABLE_STREAMS.elephants, // Arcane (Animation/Fantasy)
  110: RELIABLE_STREAMS.default,   // Succession (Drama/Business)
  111: RELIABLE_STREAMS.tears,     // Blade Runner 2049 (Sci-Fi)
  112: RELIABLE_STREAMS.blazes,    // Shōgun (Historical Drama)
  113: RELIABLE_STREAMS.sintel,    // Spider-Man (Animation)
  114: RELIABLE_STREAMS.tears,     // Fallout (Sci-Fi Action)
  115: RELIABLE_STREAMS.default,   // Breaking Bad (Crime Drama)
  116: RELIABLE_STREAMS.elephants, // Inception (Sci-Fi Action)
};

export function getDefaultAudioTracks(mediaId: number | string, baseVideoUrl: string): AudioTrack[] {
  return [
    {
      id: `${mediaId}-audio-en`,
      language: 'English [Original 5.1]',
      code: 'en',
      src: baseVideoUrl,
      isDefault: true,
    },
    {
      id: `${mediaId}-audio-es`,
      language: 'Spanish (Español Latino)',
      code: 'es',
      src: baseVideoUrl,
    },
    {
      id: `${mediaId}-audio-hi`,
      language: 'Hindi (हिन्दी Dubbed)',
      code: 'hi',
      src: baseVideoUrl,
    },
    {
      id: `${mediaId}-audio-fr`,
      language: 'French (Français V.F.)',
      code: 'fr',
      src: baseVideoUrl,
    },
    {
      id: `${mediaId}-audio-de`,
      language: 'German (Deutsch)',
      code: 'de',
      src: baseVideoUrl,
    },
    {
      id: `${mediaId}-audio-ja`,
      language: 'Japanese (日本語 吹替)',
      code: 'ja',
      src: baseVideoUrl,
    },
  ];
}

export function getDefaultSubtitles(mediaId: number | string, title: string): SubtitleTrack[] {
  return [
    {
      id: `${mediaId}-sub-en`,
      language: 'English [CC]',
      code: 'en',
      isDefault: true,
      cues: [
        { start: 2, end: 7, text: '[Atmospheric cinematic soundtrack rises slowly]' },
        { start: 8, end: 15, text: `${title}: "Every choice we make ripples across the infinite horizon."` },
        { start: 16, end: 23, text: '"We were never meant to stand still. We were born to explore."' },
        { start: 24, end: 32, text: '[Deep pulsing cinematic bass vibrating]' },
        { start: 33, end: 41, text: '"Trajectory locked. Systems nominal in 3... 2... 1..."' },
        { start: 42, end: 50, text: '[Thrusters ignite with blinding brilliance and roar to life]' },
        { start: 51, end: 60, text: '"Whatever happens on the other side... remember why we started."' },
        { start: 61, end: 72, text: '"Do not look back. The future is waiting for us."' },
      ],
    },
    {
      id: `${mediaId}-sub-es`,
      language: 'Spanish (Español)',
      code: 'es',
      cues: [
        { start: 2, end: 7, text: '[Música cinematográfica atmosférica en aumento]' },
        { start: 8, end: 15, text: `${title}: "Cada decisión que tomamos resuena en el horizonte infinito."` },
        { start: 16, end: 23, text: '"Nunca estuvimos destinados a quedarnos quietos. Nacimos para explorar."' },
        { start: 24, end: 32, text: '[Vibraciones intensas de frecuencias bajas]' },
        { start: 33, end: 41, text: '"Trayectoria fijada. Sistemas nominales en 3... 2... 1..."' },
        { start: 42, end: 50, text: '[Los propulsores se encienden con fuerza]' },
        { start: 51, end: 60, text: '"Pase lo que pase al otro lado... recuerda por qué empezamos."' },
        { start: 61, end: 72, text: '"No mires atrás. El futuro nos está esperando."' },
      ],
    },
    {
      id: `${mediaId}-sub-hi`,
      language: 'Hindi (हिन्दी)',
      code: 'hi',
      cues: [
        { start: 2, end: 7, text: '[गहन सिनेमाई संगीत की गूंज]' },
        { start: 8, end: 15, text: `${title}: "हमारा हर फैसला इस अनंत क्षितिज पर असर डालता है।"` },
        { start: 16, end: 23, text: '"हम ठहरने के लिए नहीं, बल्कि सीमाओं को पार करने के लिए बने हैं।"' },
        { start: 24, end: 32, text: '[शक्तिशाली ध्वनि कंपन]' },
        { start: 33, end: 41, text: '"कक्षा प्रज्वलन की तैयारी करें। उल्टी गिनती: 3... 2... 1..."' },
        { start: 42, end: 50, text: '[रॉकेट इंजनों की प्रचंड गर्जना]' },
        { start: 51, end: 60, text: '"दूसरी तरफ चाहे कुछ भी हो... याद रखना हम क्यों निकले थे।"' },
        { start: 61, end: 72, text: '"पीछे मुड़कर मत देखो। हमारा भविष्य तैयार है।"' },
      ],
    },
    {
      id: `${mediaId}-sub-fr`,
      language: 'French (Français)',
      code: 'fr',
      cues: [
        { start: 2, end: 7, text: '[Musique orchestrale atmosphérique en crescendo]' },
        { start: 8, end: 15, text: `${title}: "Chaque choix résonne à travers l'horizon infini."` },
        { start: 16, end: 23, text: '"Nous n\'étions pas faits pour rester immobiles. Nous sommes nés pour explorer."' },
        { start: 24, end: 32, text: '[Vibrations de basses profondes]' },
        { start: 33, end: 41, text: '"Trajectoire confirmée. Systèmes prêts dans 3... 2... 1..."' },
        { start: 42, end: 50, text: '[Les réacteurs s\'allument dans un éclat aveuglant]' },
        { start: 51, end: 60, text: '"Quoi qu\'il arrive de l\'autre côté... souvenez-vous de notre but."' },
        { start: 61, end: 72, text: '"Ne regardez pas en arrière. L\'avenir nous attend."' },
      ],
    },
    {
      id: `${mediaId}-sub-de`,
      language: 'German (Deutsch)',
      code: 'de',
      cues: [
        { start: 2, end: 7, text: '[Atmosphärische orchestrale Musik schwillt an]' },
        { start: 8, end: 15, text: `${title}: "Jede Entscheidung hallt über den unendlichen Horizont wider."` },
        { start: 16, end: 23, text: '"Wir wurden nicht geboren, um stillzustehen. Wir wurden geboren, um zu forschen."' },
        { start: 24, end: 32, text: '[Intensive Bassfrequenzen]' },
        { start: 33, end: 41, text: '"Trajektorie verriegelt. Systeme bereit in 3... 2... 1..."' },
        { start: 42, end: 50, text: '[Triebwerke entflammen mit gewaltiger Energie]' },
        { start: 51, end: 60, text: '"Was auch immer drüben geschieht... vergesst nicht, warum wir begannen."' },
        { start: 61, end: 72, text: '"Blickt nicht zurück. Die Zukunft erwartet uns."' },
      ],
    },
    {
      id: `${mediaId}-sub-ja`,
      language: 'Japanese (日本語)',
      code: 'ja',
      cues: [
        { start: 2, end: 7, text: '[荘厳な映画音楽が高まる]' },
        { start: 8, end: 15, text: `${title}: 「私たちの選んだ道は、無限の地平線に響き渡る。」` },
        { start: 16, end: 23, text: `「立ち止まるために生まれたのではない。未知を切り拓くために生まれた。」` },
        { start: 24, end: 32, text: `[重低音の振動が空間を満たす]` },
        { start: 33, end: 41, text: `「軌道推進点火準備。カウントダウン: 3... 2... 1...」` },
        { start: 42, end: 50, text: `[エンジンが眩い光と共に点火]` },
        { start: 51, end: 60, text: `「向こう側で何が起きようと、旅立った理由を忘れるな。」` },
        { start: 61, end: 72, text: `「振り返るな。未来が私たちを待っている。」` },
      ],
    },
  ];
}


/**
 * Generate rich seasons and episodes for TV series
 */
export function getOrGenerateSeasons(showId: number, showTitle: string, seasonCount: number = 2): Season[] {
  const seasons: Season[] = [];

  const episodeThemes: Record<number, Array<{ title: string; desc: string; runtime: string }>> = {
    102: [ // Cyberpunk
      { title: 'Ghost in the Machine', desc: 'In the lower levels of Santo Domingo, David confronts an underground cyberware dealer.', runtime: '26m' },
      { title: 'Neon Pulse Protocol', desc: 'A military-grade Sandevistan implant unlocks dangerous abilities during an ambush.', runtime: '24m' },
      { title: 'Sub-Level Infiltration', desc: 'Lucy guides the squad through corporate ice firewalls beneath Arasaka Tower.', runtime: '28m' },
      { title: 'Chrome Overdrive', desc: 'Cyberpsychosis threatens the squad as cybernetic tolerances are pushed beyond the limit.', runtime: '25m' },
      { title: 'Night City Rebirth', desc: 'An unforgettable standoff on the orbital shuttle platform determines their freedom.', runtime: '31m' },
    ],
    103: [ // Severance
      { title: 'Good News About Hell', desc: 'Mark Scout is promoted to department chief of Macrodata Refinement following Petey\'s departure.', runtime: '57m' },
      { title: 'Half Loop Protocol', desc: 'Helly R. undergoes orientation in the severed basement, questioning the handbook invariants.', runtime: '53m' },
      { title: 'In Perpetuity', desc: 'The team sneaks to the Perpetuity Wing where Lumon\'s founding fathers are immortalized.', runtime: '54m' },
      { title: 'The You You Are', desc: 'An illicit contraband book sparks ideological rebellion among the refinement department.', runtime: '51m' },
      { title: 'The We We Are', desc: 'The overtime contingency is triggered, revealing shocking truths on the outside.', runtime: '59m' },
    ],
    105: [ // The Last of Us
      { title: 'When You\'re Lost in the Darkness', desc: 'Twenty years after a fungal outbreak devastates the globe, Joel is given a life-altering cargo.', runtime: '81m' },
      { title: 'Infected Ruins', desc: 'Joel, Tess, and Ellie navigate the flooded ruins of Boston under constant stalker threats.', runtime: '53m' },
      { title: 'Long, Long Time', desc: 'An isolated survivalist community becomes a sanctuary of humanity in a merciless world.', runtime: '75m' },
      { title: 'Please Hold to My Hand', desc: 'In Kansas City, the travelers encounter a ruthless resistance movement hunting collaborators.', runtime: '50m' },
      { title: 'Endure and Survive', desc: 'A subterranean horde breaches the surface, forcing a desperate night escape.', runtime: '59m' },
    ],
    109: [ // Arcane
      { title: 'Welcome to the Playground', desc: 'Orphan sisters Vi and Powder navigate the neon-lit depths of the underground city of Zaun.', runtime: '43m' },
      { title: 'Some Mysteries Are Better Left Unsolved', desc: 'Jayce and Viktor unlock forbidden hextech mysteries using raw arcane magic crystals.', runtime: '41m' },
      { title: 'The Base Violence Necessary for Change', desc: 'An epic showdown transforms Powder forever into the volatile force known as Jinx.', runtime: '44m' },
      { title: 'Happy Progress Day!', desc: 'Piltover celebrates its centenary while shadows from the undercity infiltrate the celebration.', runtime: '40m' },
      { title: 'Everybody Wants to Be My Enemy', desc: 'Firelights confront the enforcers atop the great suspension bridge.', runtime: '42m' },
    ],
  };

  const genericTitles = [
    { title: 'The Awakening Principle', desc: 'Secrets buried in previous cycles surface under unexpected circumstances.', runtime: '52m' },
    { title: 'Threshold of Shadows', desc: 'Alliances fracture as external pressures mount from rival factions.', runtime: '48m' },
    { title: 'Convergence Point', desc: 'A tactical breakthrough yields critical intelligence at immense personal cost.', runtime: '55m' },
    { title: 'Echoes of the Past', desc: 'The origins of the core conflict are unraveled in a series of revelations.', runtime: '50m' },
    { title: 'Reckoning at Dawn', desc: 'The season finale forces impossible choices with lasting consequences.', runtime: '62m' },
  ];

  for (let s = 1; s <= Math.max(2, seasonCount); s++) {
    const epCount = s === 1 ? 5 : 4;
    const episodes = [];
    const pool = episodeThemes[showId] || genericTitles;

    for (let e = 1; e <= epCount; e++) {
      const template = pool[(e - 1) % pool.length];
      const epName = s === 1 ? template.title : `S${s}E${e}: ${template.title} Part II`;
      const epDesc = s === 1 ? template.desc : `Season ${s} escalation: ${template.desc}`;

      episodes.push({
        id: showId * 1000 + s * 100 + e,
        episode_number: e,
        season_number: s,
        name: epName,
        overview: epDesc,
        still_path: `/rkB4LyZHo1NHXSTXYZaCRv0z04a.jpg`,
        runtime: template.runtime || '50m',
        duration: template.runtime || '50m',
        duration_seconds: 3000,
        durationSeconds: 3000,
        vote_average: Number((8.5 + (e % 3) * 0.4).toFixed(1)),
      });
    }

    seasons.push({
      id: showId * 10 + s,
      season_number: s,
      name: `Season ${s}`,
      episode_count: epCount,
      episodes,
      overview: `The complete critically acclaimed Season ${s} of ${showTitle}.`,
    });
  }

  return seasons;
}

/**
 * Fallback generator for Cast & Crew when not directly specified
 */
export function getOrGenerateCastAndCrew(mediaId: number | string, title?: string): { cast_members: CastMember[]; crew_members: CrewMember[] } {
  const targetIdStr = String(mediaId);
  const targetIdNum = Number(mediaId);
  const found = RAW_MOCK_ITEMS.find((m) => String(m.id) === targetIdStr || m.id === targetIdNum);
  if (found?.cast_members && found.crew_members) {
    return { cast_members: found.cast_members, crew_members: found.crew_members };
  }

  // Realistic fallback generated members
  const cast_members: CastMember[] = [
    { id: 1, name: 'Lead Performer', character: 'Protagonist' },
    { id: 2, name: 'Co-Star Artist', character: 'Primary Ally' },
    { id: 3, name: 'Supporting Talent', character: 'Key Figure' },
    { id: 4, name: 'Featured Actor', character: 'Adversary / Catalyst' },
  ];

  const crew_members: CrewMember[] = [
    { id: 11, name: 'Visionary Director', job: 'Director', department: 'Directing' },
    { id: 12, name: 'Lead Screenwriter', job: 'Screenplay', department: 'Writing' },
    { id: 13, name: 'Orchestral Composer', job: 'Original Music Composer', department: 'Sound' },
    { id: 14, name: 'Cinematographer', job: 'Director of Photography', department: 'Camera' },
  ];

  return { cast_members, crew_members };
}

const RAW_MOCK_ITEMS: MediaItem[] = [
  {
    id: 101,
    title: 'Interstellar: Beyond The Horizon',
    overview: 'When Earth faces an ecological collapse, a team of explorers embarks on the most crucial mission in human history: traveling through a newly discovered wormhole beyond our galaxy to discover whether mankind has a future among the stars.',
    poster_path: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    vote_average: 8.7,
    release_date: '2024-11-07',
    media_type: 'movie',
    genre_ids: [878, 18, 12],
    trailer_key: 'zSWdZVtXT7E',
    maturity_rating: 'PG-13',
    match_percentage: 98,
    duration: '2h 49m',
    duration_seconds: 7200,
    durationSeconds: 7200,
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    director: 'Christopher Nolan',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    cast_members: [
      { id: 10288, name: 'Matthew McConaughey', character: 'Joseph Cooper' },
      { id: 18277, name: 'Anne Hathaway', character: 'Dr. Amelia Brand' },
      { id: 83002, name: 'Jessica Chastain', character: 'Murphy "Murph" Cooper' },
      { id: 3895, name: 'Michael Caine', character: 'Professor John Brand' },
      { id: 1892, name: 'Matt Damon', character: 'Dr. Mann' },
      { id: 12519, name: 'John Lithgow', character: 'Donald' },
    ],
    crew_members: [
      { id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' },
      { id: 947, name: 'Hans Zimmer', job: 'Original Music Composer', department: 'Sound' },
      { id: 6411, name: 'Hoyte van Hoytema', job: 'Director of Photography', department: 'Camera' },
      { id: 527, name: 'Emma Thomas', job: 'Producer', department: 'Production' },
    ],
  },
  {
    id: 102,
    name: 'Cyberpunk: Neon Syndicate',
    overview: 'In a dystopian city consumed by corruption and cybernetic implants, a street kid striving to survive in the technological underworld resolves to stay alive by becoming an edgerunner—a mercenary outlaw.',
    poster_path: '/7jSWOc6jWSw5hZ78HB8Hw3pJxuk.jpg',
    backdrop_path: '/7jSWOc6jWSw5hZ78HB8Hw3pJxuk.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/7jSWOc6jWSw5hZ78HB8Hw3pJxuk.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/7jSWOc6jWSw5hZ78HB8Hw3pJxuk.jpg',
    vote_average: 8.9,
    first_air_date: '2023-09-13',
    media_type: 'tv',
    genre_ids: [16, 878, 28],
    trailer_key: 'JtqIas3bYhg',
    maturity_rating: 'TV-MA',
    match_percentage: 96,
    duration: '50m',
    duration_seconds: 3000,
    durationSeconds: 3000,
    seasons: 2,
    seasons_data: getOrGenerateSeasons(102, 'Cyberpunk: Neon Syndicate', 2),
    cast: ['Aoi Yuuki', 'Zach Aguilar', 'Giancarlo Esposito'],
    director: 'Hiroyuki Imaishi',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    cast_members: [
      { id: 201, name: 'Aoi Yuuki', character: 'Lucy Kushinada' },
      { id: 202, name: 'Zach Aguilar', character: 'David Martinez' },
      { id: 203, name: 'Giancarlo Esposito', character: 'Faraday' },
      { id: 204, name: 'Emi Uwagawa', character: 'Gloria Martinez' },
      { id: 205, name: 'Hiroki Touchi', character: 'Maine' },
    ],
    crew_members: [
      { id: 211, name: 'Hiroyuki Imaishi', job: 'Director', department: 'Directing' },
      { id: 212, name: 'Masahiko Otsuka', job: 'Screenplay', department: 'Writing' },
      { id: 213, name: 'Akira Yamaoka', job: 'Original Music Composer', department: 'Sound' },
      { id: 214, name: 'Yoh Yoshinari', job: 'Character Designer', department: 'Visual' },
    ],
  },
  {
    id: 103,
    name: 'Severance: Macrodata Refinement',
    overview: 'Mark Scout leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.',
    poster_path: '/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
    backdrop_path: '/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
    vote_average: 8.8,
    first_air_date: '2024-02-18',
    media_type: 'tv',
    genre_ids: [18, 9648, 878],
    trailer_key: 'xEQP4VVuyrY',
    maturity_rating: 'TV-MA',
    match_percentage: 95,
    duration: '50m',
    duration_seconds: 3000,
    durationSeconds: 3000,
    seasons: 2,
    seasons_data: getOrGenerateSeasons(103, 'Severance', 2),
    cast: ['Adam Scott', 'Patricia Arquette', 'John Turturro', 'Christopher Walken'],
    director: 'Ben Stiller',
    genres: ['Sci-Fi', 'Thriller', 'Mystery'],
    cast_members: [
      { id: 301, name: 'Adam Scott', character: 'Mark Scout' },
      { id: 302, name: 'Patricia Arquette', character: 'Harmony Cobel' },
      { id: 303, name: 'John Turturro', character: 'Irving Bailiff' },
      { id: 304, name: 'Christopher Walken', character: 'Burt Goodman' },
      { id: 305, name: 'Britt Lower', character: 'Helly Riggs' },
      { id: 306, name: 'Tramell Tillman', character: 'Seth Milchick' },
    ],
    crew_members: [
      { id: 311, name: 'Ben Stiller', job: 'Director', department: 'Directing' },
      { id: 312, name: 'Dan Erickson', job: 'Creator', department: 'Writing' },
      { id: 313, name: 'Theodore Shapiro', job: 'Original Music Composer', department: 'Sound' },
      { id: 314, name: 'Jessica Lee Gagné', job: 'Director of Photography', department: 'Camera' },
    ],
  },
  {
    id: 104,
    title: 'Dune: Awakening of Prophecy',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    poster_path: '/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    vote_average: 8.9,
    release_date: '2024-03-01',
    media_type: 'movie',
    genre_ids: [878, 12, 28],
    trailer_key: 'Way9Dexny3w',
    maturity_rating: 'PG-13',
    match_percentage: 99,
    duration: '2h 46m',
    duration_seconds: 7200,
    durationSeconds: 7200,
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    director: 'Denis Villeneuve',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    cast_members: [
      { id: 401, name: 'Timothée Chalamet', character: 'Paul Atreides' },
      { id: 402, name: 'Zendaya', character: 'Chani' },
      { id: 403, name: 'Rebecca Ferguson', character: 'Lady Jessica' },
      { id: 404, name: 'Javier Bardem', character: 'Stilgar' },
      { id: 405, name: 'Austin Butler', character: 'Feyd-Rautha Harkonnen' },
      { id: 406, name: 'Florence Pugh', character: 'Princess Irulan' },
    ],
    crew_members: [
      { id: 411, name: 'Denis Villeneuve', job: 'Director', department: 'Directing' },
      { id: 412, name: 'Jon Spaihts', job: 'Screenplay', department: 'Writing' },
      { id: 413, name: 'Hans Zimmer', job: 'Original Music Composer', department: 'Sound' },
      { id: 414, name: 'Greig Fraser', job: 'Director of Photography', department: 'Camera' },
    ],
  },
  {
    id: 105,
    name: 'The Last of Us',
    overview: 'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone across a brutal, post-pandemic America.',
    poster_path: '/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg',
    backdrop_path: '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    vote_average: 8.7,
    first_air_date: '2023-01-15',
    media_type: 'tv',
    genre_ids: [18, 10759, 10765],
    trailer_key: 'uLtkt8BonwM',
    maturity_rating: 'TV-MA',
    match_percentage: 97,
    duration: '50m',
    duration_seconds: 3000,
    durationSeconds: 3000,
    seasons: 2,
    seasons_data: getOrGenerateSeasons(105, 'The Last of Us', 2),
    cast: ['Pedro Pascal', 'Bella Ramsey', 'Gabriel Luna'],
    director: 'Craig Mazin',
    genres: ['Drama', 'Action', 'Sci-Fi'],
    cast_members: [
      { id: 501, name: 'Pedro Pascal', character: 'Joel Miller' },
      { id: 502, name: 'Bella Ramsey', character: 'Ellie Williams' },
      { id: 503, name: 'Gabriel Luna', character: 'Tommy Miller' },
      { id: 504, name: 'Anna Torv', character: 'Tess Servopoulos' },
      { id: 505, name: 'Nick Offerman', character: 'Bill' },
      { id: 506, name: 'Murray Bartlett', character: 'Frank' },
    ],
    crew_members: [
      { id: 511, name: 'Craig Mazin', job: 'Creator', department: 'Writing' },
      { id: 512, name: 'Neil Druckmann', job: 'Executive Producer', department: 'Production' },
      { id: 513, name: 'Gustavo Santaolalla', job: 'Original Music Composer', department: 'Sound' },
      { id: 514, name: 'Ksenia Sereda', job: 'Director of Photography', department: 'Camera' },
    ],
  },
  {
    id: 106,
    title: 'Oppenheimer',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II, examining the intellectual fury and moral anguish of the man who created the weapon that transformed civilization forever.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    vote_average: 8.9,
    release_date: '2023-07-21',
    media_type: 'movie',
    genre_ids: [18, 36],
    trailer_key: 'uYPbbksJxIg',
    maturity_rating: 'R',
    match_percentage: 94,
    duration: '3h 00m',
    duration_seconds: 7200,
    durationSeconds: 7200,
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    director: 'Christopher Nolan',
    genres: ['Drama', 'History', 'Biography'],
    cast_members: [
      { id: 601, name: 'Cillian Murphy', character: 'J. Robert Oppenheimer' },
      { id: 602, name: 'Emily Blunt', character: 'Katherine "Kitty" Oppenheimer' },
      { id: 603, name: 'Matt Damon', character: 'Leslie Groves' },
      { id: 604, name: 'Robert Downey Jr.', character: 'Lewis Strauss' },
      { id: 605, name: 'Florence Pugh', character: 'Jean Tatlock' },
      { id: 606, name: 'Josh Hartnett', character: 'Ernest Lawrence' },
    ],
    crew_members: [
      { id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' },
      { id: 611, name: 'Ludwig Göransson', job: 'Original Music Composer', department: 'Sound' },
      { id: 6411, name: 'Hoyte van Hoytema', job: 'Director of Photography', department: 'Camera' },
      { id: 612, name: 'Jennifer Lame', job: 'Editor', department: 'Editing' },
    ],
  },
  {
    id: 107,
    name: 'Stranger Things: Hawkins Secrets',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl with telekinetic powers.',
    poster_path: '/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    vote_average: 8.6,
    first_air_date: '2022-05-27',
    media_type: 'tv',
    genre_ids: [10765, 9648, 18],
    trailer_key: 'b9EkMc79ZSU',
    maturity_rating: 'TV-14',
    match_percentage: 93,
    duration: '50m',
    duration_seconds: 3000,
    durationSeconds: 3000,
    seasons: 4,
    seasons_data: getOrGenerateSeasons(107, 'Stranger Things', 4),
    cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder', 'David Harbour'],
    director: 'The Duffer Brothers',
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    cast_members: [
      { id: 701, name: 'Millie Bobby Brown', character: 'Eleven' },
      { id: 702, name: 'Finn Wolfhard', character: 'Mike Wheeler' },
      { id: 703, name: 'Winona Ryder', character: 'Joyce Byers' },
      { id: 704, name: 'David Harbour', character: 'Jim Hopper' },
      { id: 705, name: 'Gaten Matarazzo', character: 'Dustin Henderson' },
      { id: 706, name: 'Sadie Sink', character: 'Max Mayfield' },
    ],
    crew_members: [
      { id: 711, name: 'Matt Duffer', job: 'Creator', department: 'Writing' },
      { id: 712, name: 'Ross Duffer', job: 'Creator', department: 'Writing' },
      { id: 713, name: 'Kyle Dixon', job: 'Original Music Composer', department: 'Sound' },
      { id: 714, name: 'Shawn Levy', job: 'Executive Producer', department: 'Production' },
    ],
  },
  {
    id: 108,
    title: 'The Batman: Shadows of Gotham',
    overview: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
    poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
    vote_average: 8.4,
    release_date: '2022-03-04',
    media_type: 'movie',
    genre_ids: [80, 9648, 28],
    trailer_key: 'EXeTwQWrcwY',
    maturity_rating: 'PG-13',
    match_percentage: 92,
    duration: '2h 56m',
    duration_seconds: 7200,
    durationSeconds: 7200,
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Colin Farrell'],
    director: 'Matt Reeves',
    genres: ['Crime', 'Mystery', 'Action'],
    cast_members: [
      { id: 801, name: 'Robert Pattinson', character: 'Bruce Wayne / Batman' },
      { id: 802, name: 'Zoë Kravitz', character: 'Selina Kyle / Catwoman' },
      { id: 803, name: 'Paul Dano', character: 'Edward Nashton / The Riddler' },
      { id: 804, name: 'Colin Farrell', character: 'Oswald Cobblepot / Penguin' },
      { id: 805, name: 'Jeffrey Wright', character: 'Lt. James Gordon' },
      { id: 806, name: 'Andy Serkis', character: 'Alfred Pennyworth' },
    ],
    crew_members: [
      { id: 811, name: 'Matt Reeves', job: 'Director', department: 'Directing' },
      { id: 812, name: 'Michael Giacchino', job: 'Original Music Composer', department: 'Sound' },
      { id: 414, name: 'Greig Fraser', job: 'Director of Photography', department: 'Camera' },
      { id: 813, name: 'Dylan Clark', job: 'Producer', department: 'Production' },
    ],
  },
  {
    id: 109,
    name: 'Arcane: League of Legends',
    overview: 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.',
    poster_path: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    backdrop_path: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    vote_average: 9.0,
    first_air_date: '2024-11-09',
    media_type: 'tv',
    genre_ids: [16, 10765, 10759],
    trailer_key: 'fXmAurh012s',
    maturity_rating: 'TV-14',
    match_percentage: 99,
    duration: '50m',
    duration_seconds: 3000,
    durationSeconds: 3000,
    seasons: 2,
    seasons_data: getOrGenerateSeasons(109, 'Arcane', 2),
    cast: ['Hailee Steinfeld', 'Ella Purnell', 'Kevin Alejandro'],
    director: 'Christian Linke',
    genres: ['Animation', 'Sci-Fi', 'Action'],
    cast_members: [
      { id: 901, name: 'Hailee Steinfeld', character: 'Vi' },
      { id: 902, name: 'Ella Purnell', character: 'Jinx / Powder' },
      { id: 903, name: 'Kevin Alejandro', character: 'Jayce Talis' },
      { id: 904, name: 'Katie Leung', character: 'Caitlyn Kiramman' },
      { id: 905, name: 'Harry Lloyd', character: 'Viktor' },
      { id: 906, name: 'Jason Spisak', character: 'Silco' },
    ],
    crew_members: [
      { id: 911, name: 'Christian Linke', job: 'Creator', department: 'Directing' },
      { id: 912, name: 'Alex Yee', job: 'Creator', department: 'Writing' },
      { id: 913, name: 'Arnaud Delord', job: 'Director', department: 'Directing' },
      { id: 914, name: 'Pascal Charrue', job: 'Director', department: 'Directing' },
    ],
  },
  {
    id: 110,
    name: 'Succession: Waystar Royco',
    overview: 'The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their aging father steps down from the company.',
    poster_path: '/z0XiwdrCQ9yVIr4O0pxzaAYRxdW.jpg',
    backdrop_path: '/z0XiwdrCQ9yVIr4O0pxzaAYRxdW.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/z0XiwdrCQ9yVIr4O0pxzaAYRxdW.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/z0XiwdrCQ9yVIr4O0pxzaAYRxdW.jpg',
    vote_average: 8.9,
    first_air_date: '2023-03-26',
    media_type: 'tv',
    genre_ids: [18],
    trailer_key: 't33IGgqL1yU',
    maturity_rating: 'TV-MA',
    match_percentage: 95,
    duration: '50m',
    duration_seconds: 3000,
    durationSeconds: 3000,
    seasons: 4,
    seasons_data: getOrGenerateSeasons(110, 'Succession', 3),
    cast: ['Brian Cox', 'Jeremy Strong', 'Sarah Snook', 'Kieran Culkin'],
    director: 'Jesse Armstrong',
    genres: ['Drama', 'Business'],
    cast_members: [
      { id: 1001, name: 'Brian Cox', character: 'Logan Roy' },
      { id: 1002, name: 'Jeremy Strong', character: 'Kendall Roy' },
      { id: 1003, name: 'Sarah Snook', character: 'Siobhan "Shiv" Roy' },
      { id: 1004, name: 'Kieran Culkin', character: 'Roman Roy' },
      { id: 1005, name: 'Matthew Macfadyen', character: 'Tom Wambsgans' },
      { id: 1006, name: 'Nicholas Braun', character: 'Greg Hirsch' },
    ],
    crew_members: [
      { id: 1011, name: 'Jesse Armstrong', job: 'Creator', department: 'Writing' },
      { id: 1012, name: 'Nicholas Britell', job: 'Original Music Composer', department: 'Sound' },
      { id: 1013, name: 'Mark Mylod', job: 'Director', department: 'Directing' },
      { id: 1014, name: 'Frank Rich', job: 'Executive Producer', department: 'Production' },
    ],
  },
  {
    id: 111,
    title: 'Blade Runner 2049',
    overview: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.',
    poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdrop_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    vote_average: 8.5,
    release_date: '2017-10-06',
    media_type: 'movie',
    genre_ids: [878, 18, 9648],
    trailer_key: 'gCcx85zbxz4',
    maturity_rating: 'R',
    match_percentage: 91,
    duration: '2h 44m',
    duration_seconds: 7200,
    durationSeconds: 7200,
    cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas', 'Sylvia Hoeks'],
    director: 'Denis Villeneuve',
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    cast_members: [
      { id: 1101, name: 'Ryan Gosling', character: 'Officer K' },
      { id: 1102, name: 'Harrison Ford', character: 'Rick Deckard' },
      { id: 1103, name: 'Ana de Armas', character: 'Joi' },
      { id: 1104, name: 'Sylvia Hoeks', character: 'Luv' },
      { id: 1105, name: 'Robin Wright', character: 'Lt. Joshi' },
      { id: 1106, name: 'Mackenzie Davis', character: 'Mariette' },
    ],
    crew_members: [
      { id: 411, name: 'Denis Villeneuve', job: 'Director', department: 'Directing' },
      { id: 947, name: 'Hans Zimmer', job: 'Original Music Composer', department: 'Sound' },
      { id: 1111, name: 'Roger Deakins', job: 'Director of Photography', department: 'Camera' },
      { id: 1112, name: 'Hampton Fancher', job: 'Screenplay', department: 'Writing' },
    ],
  },
  {
    id: 112,
    name: 'Shōgun',
    overview: 'In Japan in the year 1600, Lord Yoshii Toranaga is fighting for his life as his enemies on the Council of Regents unite against him, when a mysterious European ship is found marooned in a nearby fishing village.',
    poster_path: '/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
    backdrop_path: '/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
    vote_average: 8.8,
    first_air_date: '2024-02-27',
    media_type: 'tv',
    genre_ids: [18, 10768],
    trailer_key: 'yAN5uspAo8U',
    maturity_rating: 'TV-MA',
    match_percentage: 97,
    duration: '50m',
    duration_seconds: 3000,
    durationSeconds: 3000,
    seasons: 1,
    seasons_data: getOrGenerateSeasons(112, 'Shōgun', 2),
    cast: ['Hiroyuki Sanada', 'Cosmo Jarvis', 'Anna Sawai'],
    director: 'Rachel Kondo',
    genres: ['Drama', 'War & Politics', 'History'],
    cast_members: [
      { id: 1201, name: 'Hiroyuki Sanada', character: 'Lord Yoshii Toranaga' },
      { id: 1202, name: 'Cosmo Jarvis', character: 'John Blackthorne' },
      { id: 1203, name: 'Anna Sawai', character: 'Toda Mariko' },
      { id: 1204, name: 'Tadanobu Asano', character: 'Kashigi Yabushige' },
      { id: 1205, name: 'Takehiro Hira', character: 'Ishido Kazunari' },
    ],
    crew_members: [
      { id: 1211, name: 'Rachel Kondo', job: 'Creator', department: 'Writing' },
      { id: 1212, name: 'Justin Marks', job: 'Creator', department: 'Writing' },
      { id: 1213, name: 'Atticus Ross', job: 'Original Music Composer', department: 'Sound' },
      { id: 1214, name: 'Sam McCurdy', job: 'Director of Photography', department: 'Camera' },
    ],
  },
  {
    id: 113,
    title: 'Spider-Man: Across the Spider-Verse',
    overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop_path: '/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    vote_average: 8.9,
    release_date: '2023-06-02',
    media_type: 'movie',
    genre_ids: [16, 28, 12, 878],
    trailer_key: 'cqGjhVJWtEg',
    maturity_rating: 'PG',
    match_percentage: 98,
    duration: '2h 20m',
    duration_seconds: 7200,
    durationSeconds: 7200,
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
    director: 'Joaquim Dos Santos',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    cast_members: [
      { id: 1301, name: 'Shameik Moore', character: 'Miles Morales / Spider-Man' },
      { id: 901, name: 'Hailee Steinfeld', character: 'Gwen Stacy / Spider-Woman' },
      { id: 1302, name: 'Oscar Isaac', character: 'Miguel O\'Hara / Spider-Man 2099' },
      { id: 1303, name: 'Daniel Kaluuya', character: 'Hobart "Hobie" Brown / Spider-Punk' },
      { id: 1304, name: 'Jake Johnson', character: 'Peter B. Parker' },
    ],
    crew_members: [
      { id: 1311, name: 'Joaquim Dos Santos', job: 'Director', department: 'Directing' },
      { id: 1312, name: 'Phil Lord', job: 'Screenplay', department: 'Writing' },
      { id: 1313, name: 'Christopher Miller', job: 'Screenplay', department: 'Writing' },
      { id: 1314, name: 'Daniel Pemberton', job: 'Original Music Composer', department: 'Sound' },
    ],
  },
  {
    id: 114,
    name: 'Fallout: The Wasteland',
    overview: 'In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants, and bandits.',
    poster_path: '/c15BtJxCXMrISLVmysdsnZUPQft.jpg',
    backdrop_path: '/c15BtJxCXMrISLVmysdsnZUPQft.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/c15BtJxCXMrISLVmysdsnZUPQft.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/c15BtJxCXMrISLVmysdsnZUPQft.jpg',
    vote_average: 8.6,
    first_air_date: '2024-04-10',
    media_type: 'tv',
    genre_ids: [10765, 10759, 18],
    trailer_key: 'V-mugKDQDlg',
    maturity_rating: 'TV-MA',
    match_percentage: 94,
    duration: '50m',
    duration_seconds: 3000,
    durationSeconds: 3000,
    seasons: 1,
    seasons_data: getOrGenerateSeasons(114, 'Fallout', 2),
    cast: ['Ella Purnell', 'Walton Goggins', 'Aaron Moten'],
    director: 'Jonathan Nolan',
    genres: ['Sci-Fi', 'Action', 'Drama'],
    cast_members: [
      { id: 902, name: 'Ella Purnell', character: 'Lucy MacLean' },
      { id: 1401, name: 'Walton Goggins', character: 'The Ghoul / Cooper Howard' },
      { id: 1402, name: 'Aaron Moten', character: 'Maximus' },
      { id: 1403, name: 'Kyle MacLachlan', character: 'Hank MacLean' },
      { id: 1404, name: 'Moisés Arias', character: 'Norm MacLean' },
    ],
    crew_members: [
      { id: 1411, name: 'Jonathan Nolan', job: 'Director', department: 'Directing' },
      { id: 1412, name: 'Geneva Robertson-Dworet', job: 'Creator', department: 'Writing' },
      { id: 1413, name: 'Graham Wagner', job: 'Creator', department: 'Writing' },
      { id: 1414, name: 'Ramin Djawadi', job: 'Original Music Composer', department: 'Sound' },
    ],
  },
  {
    id: 115,
    name: 'Breaking Bad: Empire Business',
    overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s financial future.',
    poster_path: '/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg',
    backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    vote_average: 9.3,
    first_air_date: '2008-01-20',
    media_type: 'tv',
    genre_ids: [18, 80],
    trailer_key: 'HhesaQXLuRY',
    maturity_rating: 'TV-MA',
    match_percentage: 99,
    duration: '50m',
    duration_seconds: 3000,
    durationSeconds: 3000,
    seasons: 5,
    seasons_data: getOrGenerateSeasons(115, 'Breaking Bad', 5),
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Giancarlo Esposito'],
    director: 'Vince Gilligan',
    genres: ['Crime', 'Drama', 'Thriller'],
    cast_members: [
      { id: 1501, name: 'Bryan Cranston', character: 'Walter White / Heisenberg' },
      { id: 1502, name: 'Aaron Paul', character: 'Jesse Pinkman' },
      { id: 1503, name: 'Anna Gunn', character: 'Skyler White' },
      { id: 203, name: 'Giancarlo Esposito', character: 'Gustavo Fring' },
      { id: 1504, name: 'Bob Odenkirk', character: 'Saul Goodman' },
      { id: 1505, name: 'Dean Norris', character: 'Hank Schrader' },
    ],
    crew_members: [
      { id: 1511, name: 'Vince Gilligan', job: 'Creator', department: 'Directing' },
      { id: 1512, name: 'Dave Porter', job: 'Original Music Composer', department: 'Sound' },
      { id: 1513, name: 'Michael Slovis', job: 'Director of Photography', department: 'Camera' },
      { id: 1514, name: 'Michelle MacLaren', job: 'Director', department: 'Directing' },
    ],
  },
  {
    id: 116,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: inception.',
    poster_path: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    vote_average: 8.8,
    release_date: '2010-07-16',
    media_type: 'movie',
    genre_ids: [28, 878, 12],
    trailer_key: 'YoHD9XEInc0',
    maturity_rating: 'PG-13',
    match_percentage: 96,
    duration: '2h 28m',
    duration_seconds: 7200,
    durationSeconds: 7200,
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    director: 'Christopher Nolan',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    cast_members: [
      { id: 1601, name: 'Leonardo DiCaprio', character: 'Dom Cobb' },
      { id: 1602, name: 'Joseph Gordon-Levitt', character: 'Arthur' },
      { id: 1603, name: 'Elliot Page', character: 'Ariadne' },
      { id: 1604, name: 'Tom Hardy', character: 'Eames' },
      { id: 1605, name: 'Ken Watanabe', character: 'Saito' },
      { id: 601, name: 'Cillian Murphy', character: 'Robert Fischer' },
    ],
    crew_members: [
      { id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' },
      { id: 947, name: 'Hans Zimmer', job: 'Original Music Composer', department: 'Sound' },
      { id: 1611, name: 'Wally Pfister', job: 'Director of Photography', department: 'Camera' },
      { id: 1612, name: 'Lee Smith', job: 'Editor', department: 'Editing' },
    ],
  },
];

export const MOCK_MEDIA_ITEMS: MediaItem[] = RAW_MOCK_ITEMS.map((item) => {
  const vidUrl = ITEM_VIDEO_URLS[item.id] || DEFAULT_FALLBACK_STREAM;
  const audioTracks = item.audio_tracks || item.audioTracks || getDefaultAudioTracks(item.id, vidUrl);
  const subtitles = item.subtitles || getDefaultSubtitles(item.id, item.title || item.name || 'CineStream');
  const durSec = item.duration_seconds || item.durationSeconds || (item.media_type === 'movie' ? 7200 : 3000);
  const poster = item.posterUrl || (item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w780${item.poster_path}`);
  const backdrop = item.backdropUrl || (item.backdrop_path.startsWith('http') ? item.backdrop_path : `https://image.tmdb.org/t/p/original${item.backdrop_path}`);
  return {
    ...item,
    poster_path: item.poster_path || poster,
    backdrop_path: item.backdrop_path || backdrop,
    posterUrl: poster,
    backdropUrl: backdrop,
    duration_seconds: durSec,
    durationSeconds: durSec,
    video_url: item.video_url || item.videoUrl || vidUrl,
    videoUrl: item.videoUrl || item.video_url || vidUrl,
    audio_tracks: audioTracks,
    audioTracks: audioTracks,
    subtitles: subtitles,
  };
});

