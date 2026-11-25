import type {
  ArcadeOption,
  ArcadeQuestion,
  CsatWord,
  GameId,
  GameMeta,
  RpgDialogueInfo,
  TowerMatchPair,
} from './types';

export const GAME_CATALOG: GameMeta[] = [
  {
    id: 'sky-runner',
    order: 1,
    title: '문장 스카이 러너',
    englishTitle: 'Sentence Sky Runner',
    category: '문장 완성하기',
    shortDesc: '문장 빈칸에 맞는 정답 영단어를 한 번만 탭해 제트기로 게이트를 돌파하세요.',
    goalSummary: '정답 영단어 원탭으로 문장 빈칸 게이트 돌파',
    controlsHint: '정답 영단어 원탭 또는 1~3 키 · 좌우 스와이프',
    coinRateLabel: '최대 +95 코인',
    roundsPerRun: 7,
    accentHex: '#1CB0F6',
    accentDarkHex: '#1289C4',
  },
  {
    id: 'tower-crash',
    order: 2,
    title: '보카 타워 크래시',
    englishTitle: 'Voca Tower Crash',
    category: '짝짓기 포탑 격파',
    shortDesc: '영단어 성탑 3개와 한글 뜻 성탑 3개를 짝지어 이중 포탑 레이저로 연쇄 폭파하세요.',
    goalSummary: '영단어 성탑 + 한글 뜻 성탑 3쌍 짝지어 연쇄 격파',
    controlsHint: '영단어 성탑 클릭 → 짝이 되는 뜻 성탑 클릭',
    coinRateLabel: '최대 +110 코인',
    roundsPerRun: 5,
    accentHex: '#58CC02',
    accentDarkHex: '#46A302',
  },
  {
    id: 'spelling-hop',
    order: 3,
    title: '징검다리 스펠링 점프',
    englishTitle: 'River Stepping-Stone Hop',
    category: '징검다리 건너기',
    shortDesc: '계곡 강물 위 3단계 징검다리(접두→어근→접미)를 건너며 SAT 영단어를 완성하세요.',
    goalSummary: '강 위 3줄 징검다리를 순서대로 밟아 철자 완성',
    controlsHint: '3D 징검다리 클릭 또는 1~3 키 점프',
    coinRateLabel: '최대 +115 코인',
    roundsPerRun: 6,
    accentHex: '#FF9600',
    accentDarkHex: '#D47B00',
  },
  {
    id: 'synonym-defense',
    order: 4,
    title: '동의어·반대어 실드 디펜스',
    englishTitle: 'Synonym & Antonym Shield',
    category: '동의어·반대어 요격',
    shortDesc: '천문대 실드로 낙하하는 수정 운석 중 동의어 또는 반대어 표적만 정확히 요격하세요.',
    goalSummary: '상단 목표(동의어/반대어)에 맞는 운석만 레이저 요격',
    controlsHint: '3D 운석 클릭 또는 1~4 키 레이저 요격',
    coinRateLabel: '최대 +120 코인',
    roundsPerRun: 7,
    accentHex: '#8549BA',
    accentDarkHex: '#683496',
  },
  {
    id: 'vault-rush',
    order: 5,
    title: '스피드 볼트 러시',
    englishTitle: 'Speed Vault Rush',
    category: '맞는것·틀린것 O/X',
    shortDesc: '원어민 발음과 뜻을 보고 맞으면 O(초록), 틀리면 X(빨강) 금고 레버를 초고속 조작하세요.',
    goalSummary: '단어와 뜻이 맞으면 O, 틀리면 X 레버로 황금 금고 해금',
    controlsHint: 'A/← (O 맞다) · D/→ (X 틀리다) · V 발음',
    coinRateLabel: '최대 +125 코인',
    roundsPerRun: 10,
    accentHex: '#FFB800',
    accentDarkHex: '#D49000',
  },
  {
    id: 'rpg-street',
    order: 6,
    title: '보카 타운 RPG 거리',
    englishTitle: 'Voca Town RPG Street',
    category: 'RPG 길거리 대화',
    shortDesc: '3D 유럽풍 마을 돌길을 걸으며 길거리 주민(NPC)들과 영어 대화를 나누고 퀘스트를 깨세요.',
    goalSummary: '마을 길을 걸어 주민 NPC와 만나 문맥에 맞는 영단어로 대화',
    controlsHint: 'W/↑ 길 걷기 · 1~3 키 또는 대화 버튼 선택',
    coinRateLabel: '최대 +130 코인',
    roundsPerRun: 6,
    accentHex: '#EC4899',
    accentDarkHex: '#BE185D',
  },
  {
    id: 'voca-tetris',
    order: 7,
    title: '보카 테트리스 3D',
    englishTitle: 'Voca Tetris 3D',
    category: '3D 블록 퍼즐',
    shortDesc: '입체 보석 블록을 회전·배치해 가로줄을 완성하고, 줄 클리어마다 수능 영단어 보너스를 획득하세요.',
    goalSummary: '3D 블록을 쌓아 10줄 클리어 · 연속 콤보로 영단어 코인 획득',
    controlsHint: '←/→ 이동 · ↑ 회전 · ↓ 소프트 · Space 즉시낙하 · C 보관',
    coinRateLabel: '최대 +150 코인',
    roundsPerRun: 10,
    accentHex: '#06B6D4',
    accentDarkHex: '#0E7490',
  },
];

export const CSAT_VOCABULARY: CsatWord[] = [
  {
    id: 'w01',
    word: 'inevitable',
    meaning: '피할 수 없는, 필연적인',
    pos: '형용사',
    pronunciation: '이네비터블',
    level: '수능필수',
    sentence: 'With rapid urbanization, shifts in local ecosystems became _____.',
    sentenceKo: '급속한 도시화로 인해 지역 생태계의 변화는 피할 수 없게 되었다.',
    synonym: 'unavoidable',
    synonymKo: '불가피한',
    antonym: 'preventable',
    antonymKo: '예방할 수 있는',
    englishDef: 'certain to happen and impossible to avoid',
    chunks: ['in', 'evit', 'able'],
  },
  {
    id: 'w02',
    word: 'sustainable',
    meaning: '지속 가능한',
    pos: '형용사',
    pronunciation: '서스테이너블',
    level: '수능필수',
    sentence: 'Cities are investing in _____ energy grids to cut carbon emissions.',
    sentenceKo: '도시들은 탄소 배출을 줄이기 위해 지속 가능한 에너지망에 투자하고 있다.',
    synonym: 'viable',
    synonymKo: '실행·지속 가능한',
    antonym: 'unsustainable',
    antonymKo: '지속 불가능한',
    englishDef: 'able to be maintained at a steady level without exhausting resources',
    chunks: ['sus', 'tain', 'able'],
  },
  {
    id: 'w03',
    word: 'ambiguous',
    meaning: '모호한, 애매한',
    pos: '형용사',
    pronunciation: '앰비규어스',
    level: '수능1등급',
    sentence: 'The witness gave an _____ answer that confused the investigators.',
    sentenceKo: '목격자는 수사관들을 혼란스럽게 하는 모호한 대답을 했다.',
    synonym: 'vague',
    synonymKo: '막연한, 모호한',
    antonym: 'explicit',
    antonymKo: '명확한, 분명한',
    englishDef: 'open to more than one interpretation; not having one obvious meaning',
    chunks: ['am', 'bigu', 'ous'],
  },
  {
    id: 'w04',
    word: 'substantial',
    meaning: '상당한, 실질적인',
    pos: '형용사',
    pronunciation: '섭스탠셜',
    level: '수능필수',
    sentence: 'The clinical trial showed a _____ improvement in patient recovery.',
    sentenceKo: '임상 시험은 환자 회복에서 상당한 향상을 보여주었다.',
    synonym: 'considerable',
    synonymKo: '상당한',
    antonym: 'negligible',
    antonymKo: '무시해도 될 정도의',
    englishDef: 'of considerable importance, size, or worth',
    chunks: ['sub', 'stan', 'tial'],
  },
  {
    id: 'w05',
    word: 'compensate',
    meaning: '보상하다, 보완하다',
    pos: '동사',
    pronunciation: '컴펜세이트',
    level: '수능필수',
    sentence: 'Strong teamwork helped _____ for the lack of expensive equipment.',
    sentenceKo: '탄탄한 팀워크는 비싼 장비의 부족을 보완하는 데 도움이 되었다.',
    synonym: 'reimburse',
    synonymKo: '배상·보상하다',
    antonym: 'penalize',
    antonymKo: '처벌하다',
    englishDef: 'to make up for a loss, weakness, or deficiency',
    chunks: ['com', 'pen', 'sate'],
  },
  {
    id: 'w06',
    word: 'vulnerable',
    meaning: '취약한, 상처받기 쉬운',
    pos: '형용사',
    pronunciation: '벌너러블',
    level: '수능필수',
    sentence: 'Coastal villages remain _____ to rising sea levels during storms.',
    sentenceKo: '해안 마을들은 폭풍 시 해수면 상승에 여전히 취약하다.',
    synonym: 'susceptible',
    synonymKo: '영향받기 쉬운',
    antonym: 'resilient',
    antonymKo: '회복력이 강한',
    englishDef: 'exposed to the possibility of being attacked or harmed',
    chunks: ['vul', 'ner', 'able'],
  },
  {
    id: 'w07',
    word: 'prominent',
    meaning: '저명한, 두드러진',
    pos: '형용사',
    pronunciation: '프라미넌트',
    level: '수능필수',
    sentence: 'A _____ physicist delivered the keynote speech on quantum computing.',
    sentenceKo: '저명한 물리학자가 양자 컴퓨팅에 관한 기조연설을 했다.',
    synonym: 'renowned',
    synonymKo: '유명한',
    antonym: 'obscure',
    antonymKo: '무명의, 불분명한',
    englishDef: 'important, famous, or easily noticeable',
    chunks: ['pro', 'mi', 'nent'],
  },
  {
    id: 'w08',
    word: 'contradict',
    meaning: '모순되다, 반박하다',
    pos: '동사',
    pronunciation: '컨트러딕트',
    level: '수능1등급',
    sentence: 'The newly uncovered fossil records _____ earlier evolutionary models.',
    sentenceKo: '새로 발견된 화석 기록은 초기 진화 모델들과 모순된다.',
    synonym: 'refute',
    synonymKo: '반박하다',
    antonym: 'confirm',
    antonymKo: '확인하다',
    englishDef: 'to deny the truth of a statement by asserting the opposite',
    chunks: ['con', 'tra', 'dict'],
  },
  {
    id: 'w09',
    word: 'allocate',
    meaning: '할당하다, 배분하다',
    pos: '동사',
    pronunciation: '앨러케이트',
    level: '수능1등급',
    sentence: 'The committee decided to _____ extra funds to rural school libraries.',
    sentenceKo: '위원회는 농촌 학교 도서관에 추가 기금을 배분하기로 결정했다.',
    synonym: 'distribute',
    synonymKo: '분배하다',
    antonym: 'withhold',
    antonymKo: '보류하다, 주지 않다',
    englishDef: 'to distribute resources or duties for a particular purpose',
    chunks: ['al', 'lo', 'cate'],
  },
  {
    id: 'w10',
    word: 'coherent',
    meaning: '일관성 있는, 논리 정연한',
    pos: '형용사',
    pronunciation: '코히어런트',
    level: '수능1등급',
    sentence: 'Every paragraph should support a _____ thesis throughout the essay.',
    sentenceKo: '모든 문단은 에세이 전반에 걸쳐 일관성 있는 논지를 뒷받침해야 한다.',
    synonym: 'logical',
    synonymKo: '논리적인',
    antonym: 'chaotic',
    antonymKo: '혼돈스러운',
    englishDef: 'logical, consistent, and forming a unified whole',
    chunks: ['co', 'her', 'ent'],
  },
  {
    id: 'w11',
    word: 'deteriorate',
    meaning: '악화되다, 저하되다',
    pos: '동사',
    pronunciation: '디티어리어레이트',
    level: '고난도빈출',
    sentence: 'Without proper maintenance, the historic bridge will rapidly _____.',
    sentenceKo: '적절한 유지보수가 없으면 그 역사적인 다리는 급속히 악화될 것이다.',
    synonym: 'worsen',
    synonymKo: '악화되다',
    antonym: 'improve',
    antonymKo: '개선되다',
    englishDef: 'to become progressively worse in quality or condition',
    chunks: ['de', 'terior', 'ate'],
  },
  {
    id: 'w12',
    word: 'implement',
    meaning: '시행하다, 이행하다',
    pos: '동사',
    pronunciation: '임플리먼트',
    level: '수능필수',
    sentence: 'The ministry plans to _____ the digital curriculum next semester.',
    sentenceKo: '교육부는 다음 학기에 디지털 교육과정을 시행할 계획이다.',
    synonym: 'execute',
    synonymKo: '실행하다',
    antonym: 'abandon',
    antonymKo: '폐기하다',
    englishDef: 'to put a decision, plan, or policy into effect',
    chunks: ['im', 'ple', 'ment'],
  },
  {
    id: 'w13',
    word: 'abundant',
    meaning: '풍부한, 많은',
    pos: '형용사',
    pronunciation: '어번던트',
    level: '수능필수',
    sentence: 'The valley offers _____ sunlight and fertile soil for organic farms.',
    sentenceKo: '그 계곡은 유기농 농장을 위한 풍부한 햇빛과 비옥한 토양을 제공한다.',
    synonym: 'plentiful',
    synonymKo: '풍부한',
    antonym: 'scarce',
    antonymKo: '부족한, 드문',
    englishDef: 'existing or available in large quantities',
    chunks: ['a', 'bun', 'dant'],
  },
  {
    id: 'w14',
    word: 'fluctuate',
    meaning: '변동하다, 오르내리다',
    pos: '동사',
    pronunciation: '플럭추에이트',
    level: '수능1등급',
    sentence: 'Raw material prices tend to _____ sharply during supply shortages.',
    sentenceKo: '원자재 가격은 공급 부족 시 급격히 변동하는 경향이 있다.',
    synonym: 'vary',
    synonymKo: '변화하다',
    antonym: 'stabilize',
    antonymKo: '안정되다',
    englishDef: 'to rise and fall irregularly in number or amount',
    chunks: ['fluc', 'tu', 'ate'],
  },
  {
    id: 'w15',
    word: 'elaborate',
    meaning: '정교한; 상세히 설명하다',
    pos: '형용사/동사',
    pronunciation: '일래버릿',
    level: '수능1등급',
    sentence: 'The architect unveiled an _____ blueprint for the floating museum.',
    sentenceKo: '건축가는 수상 박물관을 위한 정교한 청사진을 공개했다.',
    synonym: 'intricate',
    synonymKo: '복잡하고 정교한',
    antonym: 'simple',
    antonymKo: '단순한',
    englishDef: 'involving many carefully arranged parts or details',
    chunks: ['e', 'labor', 'ate'],
  },
  {
    id: 'w16',
    word: 'accelerate',
    meaning: '가속하다, 촉진하다',
    pos: '동사',
    pronunciation: '액셀러레이트',
    level: '수능필수',
    sentence: 'Open-source collaboration can _____ breakthroughs in medical imaging.',
    sentenceKo: '오픈소스 협업은 의료 영상 분야의 혁신을 가속할 수 있다.',
    synonym: 'expedite',
    synonymKo: '신속히 처리하다',
    antonym: 'decelerate',
    antonymKo: '감속하다',
    englishDef: 'to increase in speed, rate, or progress',
    chunks: ['ac', 'celer', 'ate'],
  },
  {
    id: 'w17',
    word: 'prevalent',
    meaning: '널리 퍼진, 만연한',
    pos: '형용사',
    pronunciation: '프레벌런트',
    level: '고난도빈출',
    sentence: 'Short-form video habits have become _____ among teenage learners.',
    sentenceKo: '숏폼 영상 습관이 십대 학습자들 사이에 널리 퍼지게 되었다.',
    synonym: 'widespread',
    synonymKo: '널리 퍼진',
    antonym: 'rare',
    antonymKo: '드문',
    englishDef: 'widespread in a particular area or at a particular time',
    chunks: ['pre', 'va', 'lent'],
  },
  {
    id: 'w18',
    word: 'mitigate',
    meaning: '완화하다, 경감시키다',
    pos: '동사',
    pronunciation: '미티게이트',
    level: '고난도빈출',
    sentence: 'Urban forests help _____ extreme heat waves during summer months.',
    sentenceKo: '도시 숲은 여름철 극심한 폭염을 완화하는 데 도움이 된다.',
    synonym: 'alleviate',
    synonymKo: '덜어주다, 완화하다',
    antonym: 'aggravate',
    antonymKo: '악화시키다',
    englishDef: 'to make something harmful less severe or serious',
    chunks: ['mi', 'ti', 'gate'],
  },
  {
    id: 'w19',
    word: 'empirical',
    meaning: '경험적인, 실증적인',
    pos: '형용사',
    pronunciation: '임피리컬',
    level: '고난도빈출',
    sentence: 'Sound scientific claims must be grounded in _____ observation.',
    sentenceKo: '타당한 과학적 주장은 실증적인 관찰에 근거해야 한다.',
    synonym: 'experimental',
    synonymKo: '실험적인',
    antonym: 'theoretical',
    antonymKo: '이론적인',
    englishDef: 'based on observation or experience rather than pure theory',
    chunks: ['em', 'piri', 'cal'],
  },
  {
    id: 'w20',
    word: 'incentive',
    meaning: '동기, 장려책',
    pos: '명사',
    pronunciation: '인센티브',
    level: '수능필수',
    sentence: 'Reward points provide an immediate _____ for daily vocabulary review.',
    sentenceKo: '보상 포인트는 매일 영단어를 복습할 즉각적인 동기를 제공한다.',
    synonym: 'motivation',
    synonymKo: '동기 부여',
    antonym: 'deterrent',
    antonymKo: '억제책',
    englishDef: 'something that encourages or motivates a person to act',
    chunks: ['in', 'cen', 'tive'],
  },
  {
    id: 'w21',
    word: 'compatible',
    meaning: '양립할 수 있는, 호환되는',
    pos: '형용사',
    pronunciation: '컴패터블',
    level: '수능1등급',
    sentence: 'Economic growth can be _____ with strict environmental protection.',
    sentenceKo: '경제 성장은 엄격한 환경 보호와 양립할 수 있다.',
    synonym: 'harmonious',
    synonymKo: '조화로운',
    antonym: 'conflicting',
    antonymKo: '상충하는',
    englishDef: 'able to exist or work together without conflict',
    chunks: ['com', 'pati', 'ble'],
  },
  {
    id: 'w22',
    word: 'simultaneous',
    meaning: '동시에 일어나는',
    pos: '형용사',
    pronunciation: '사이멀테이니어스',
    level: '수능1등급',
    sentence: 'The observatory recorded _____ signals from two distant galaxies.',
    sentenceKo: '천문대는 멀리 떨어진 두 은하에서 동시에 발생한 신호를 기록했다.',
    synonym: 'concurrent',
    synonymKo: '동시 발생의',
    antonym: 'sequential',
    antonymKo: '순차적인',
    englishDef: 'occurring, operating, or done at the exact same time',
    chunks: ['simul', 'tane', 'ous'],
  },
  {
    id: 'w23',
    word: 'legitimate',
    meaning: '정당한, 합법적인',
    pos: '형용사',
    pronunciation: '리지티밋',
    level: '수능1등급',
    sentence: 'Consumers raised _____ concerns about how their biometric data is stored.',
    sentenceKo: '소비자들은 생체 데이터가 어떻게 저장되는지에 대해 정당한 우려를 제기했다.',
    synonym: 'valid',
    synonymKo: '타당한',
    antonym: 'invalid',
    antonymKo: '부당한, 무효의',
    englishDef: 'conforming to the law or supported by valid reasoning',
    chunks: ['le', 'giti', 'mate'],
  },
  {
    id: 'w24',
    word: 'accumulate',
    meaning: '축적하다, 모으다',
    pos: '동사',
    pronunciation: '어큐뮬레이트',
    level: '수능필수',
    sentence: 'Small daily habits gradually _____ into remarkable long-term mastery.',
    sentenceKo: '작은 일상 습관들이 서서히 축적되어 놀라운 장기적 숙달로 이어진다.',
    synonym: 'amass',
    synonymKo: '모으다',
    antonym: 'disperse',
    antonymKo: '흩어지다',
    englishDef: 'to gather together or acquire an increasing quantity over time',
    chunks: ['ac', 'cumu', 'late'],
  },
  {
    id: 'w25',
    word: 'phenomenon',
    meaning: '현상, 경이로운 사건',
    pos: '명사',
    pronunciation: '피나미넌',
    level: '수능필수',
    sentence: 'Bioluminescence is a natural _____ observed in deep-sea organisms.',
    sentenceKo: '생물 발광은 심해 생물에서 관찰되는 자연 현상이다.',
    synonym: 'occurrence',
    synonymKo: '발생, 현상',
    antonym: 'illusion',
    antonymKo: '환영, 착각',
    englishDef: 'a fact or situation that is observed to exist or happen',
    chunks: ['phe', 'nome', 'non'],
  },
  {
    id: 'w26',
    word: 'cognitive',
    meaning: '인지의, 인식의',
    pos: '형용사',
    pronunciation: '카그니티브',
    level: '수능1등급',
    sentence: 'Active recall strengthens _____ pathways much faster than passive reading.',
    sentenceKo: '능동적 회상은 수동적 읽기보다 인지 경로를 훨씬 빠르게 강화한다.',
    synonym: 'mental',
    synonymKo: '정신적인',
    antonym: 'physical',
    antonymKo: '신체적인',
    englishDef: 'relating to thinking, memory, perception, and understanding',
    chunks: ['cog', 'ni', 'tive'],
  },
  {
    id: 'w27',
    word: 'distinguish',
    meaning: '구별하다, 식별하다',
    pos: '동사',
    pronunciation: '디스팅귀시',
    level: '수능필수',
    sentence: 'Trained linguists can easily _____ subtle regional accents.',
    sentenceKo: '훈련된 언어학자들은 미묘한 지역 억양을 쉽게 구별할 수 있다.',
    synonym: 'differentiate',
    synonymKo: '차별화하다',
    antonym: 'confuse',
    antonymKo: '혼동하다',
    englishDef: 'to recognize or treat something as different from another',
    chunks: ['dis', 'tin', 'guish'],
  },
  {
    id: 'w28',
    word: 'conventional',
    meaning: '전통적인, 관습적인',
    pos: '형용사',
    pronunciation: '컨벤셔널',
    level: '수능필수',
    sentence: 'The designer rejected _____ layouts in favor of interactive 3D space.',
    sentenceKo: '그 디자이너는 관습적인 배치를 거부하고 인터랙티브 3D 공간을 택했다.',
    synonym: 'traditional',
    synonymKo: '전통적인',
    antonym: 'innovative',
    antonymKo: '혁신적인',
    englishDef: 'based on or in accordance with what is generally done or believed',
    chunks: ['con', 'ven', 'tional'],
  },
  {
    id: 'w29',
    word: 'inequality',
    meaning: '불평등, 불균형',
    pos: '명사',
    pronunciation: '이니퀄리티',
    level: '수능필수',
    sentence: 'Digital access programs aim to narrow educational _____ across regions.',
    sentenceKo: '디지털 접근성 프로그램은 지역 간 교육 불평등을 줄이는 것을 목표로 한다.',
    synonym: 'disparity',
    synonymKo: '격차, 불균형',
    antonym: 'equality',
    antonymKo: '평등',
    englishDef: 'difference in size, degree, opportunity, or circumstances',
    chunks: ['in', 'equal', 'ity'],
  },
  {
    id: 'w30',
    word: 'resilient',
    meaning: '회복력이 있는, 탄력적인',
    pos: '형용사',
    pronunciation: '리질리언트',
    level: '고난도빈출',
    sentence: 'Diverse ecosystems are far more _____ when facing climate shifts.',
    sentenceKo: '다양한 생태계는 기후 변화에 직면했을 때 훨씬 더 회복력이 강하다.',
    synonym: 'adaptable',
    synonymKo: '적응력이 있는',
    antonym: 'fragile',
    antonymKo: '부서지기 쉬운',
    englishDef: 'able to withstand or recover quickly from difficult conditions',
    chunks: ['re', 'sili', 'ent'],
  },
  {
    id: 'w31',
    word: 'interpret',
    meaning: '해석하다, 통역하다',
    pos: '동사',
    pronunciation: '인터프릿',
    level: '수능필수',
    sentence: 'Historians _____ ancient pottery symbols to reconstruct trade routes.',
    sentenceKo: '역사가들은 무역로를 복원하기 위해 고대 도자기 문양을 해석한다.',
    synonym: 'decipher',
    synonymKo: '해독하다',
    antonym: 'misread',
    antonymKo: '오독하다',
    englishDef: 'to explain the meaning of information, words, or actions',
    chunks: ['in', 'ter', 'pret'],
  },
  {
    id: 'w32',
    word: 'arbitrary',
    meaning: '임의적인, 자의적인',
    pos: '형용사',
    pronunciation: '아비트리',
    level: '고난도빈출',
    sentence: 'Grading criteria must be transparent rather than _____ or biased.',
    sentenceKo: '채점 기준은 임의적이거나 편향되기보다 투명해야 한다.',
    synonym: 'random',
    synonymKo: '무작위의',
    antonym: 'systematic',
    antonymKo: '체계적인',
    englishDef: 'based on random choice or personal whim rather than reason',
    chunks: ['ar', 'bi', 'trary'],
  },
  {
    id: 'w33',
    word: 'catalyst',
    meaning: '촉매제, 기폭제',
    pos: '명사',
    pronunciation: '캐털리스트',
    level: '고난도빈출',
    sentence: 'The invention of the printing press acted as a _____ for literacy.',
    sentenceKo: '인쇄술의 발명은 문해력 확산의 촉매제 역할을 했다.',
    synonym: 'spark',
    synonymKo: '계기, 불씨',
    antonym: 'obstacle',
    antonymKo: '장애물',
    englishDef: 'a person or thing that precipitates a major event or change',
    chunks: ['ca', 'ta', 'lyst'],
  },
  {
    id: 'w34',
    word: 'integrate',
    meaning: '통합하다, 융합하다',
    pos: '동사',
    pronunciation: '인티그레이트',
    level: '수능필수',
    sentence: 'Modern transit apps _____ subway, bus, and bike schedules seamlessly.',
    sentenceKo: '현대 교통 앱은 지하철, 버스, 자전거 일정을 매끄럽게 통합한다.',
    synonym: 'unify',
    synonymKo: '하나로 합치다',
    antonym: 'separate',
    antonymKo: '분리하다',
    englishDef: 'to combine separate parts so that they become a cohesive whole',
    chunks: ['in', 'te', 'grate'],
  },
  {
    id: 'w35',
    word: 'objective',
    meaning: '객관적인; 목표',
    pos: '형용사/명사',
    pronunciation: '어브젝티브',
    level: '수능필수',
    sentence: 'Journalists strive to maintain an _____ tone when reporting conflicts.',
    sentenceKo: '언론인들은 갈등을 보도할 때 객관적인 어조를 유지하려 노력한다.',
    synonym: 'impartial',
    synonymKo: '공정한',
    antonym: 'subjective',
    antonymKo: '주관적인',
    englishDef: 'not influenced by personal feelings or opinions in considering facts',
    chunks: ['ob', 'jec', 'tive'],
  },
  {
    id: 'w36',
    word: 'plausible',
    meaning: '그럴듯한, 타당한',
    pos: '형용사',
    pronunciation: '플로저블',
    level: '고난도빈출',
    sentence: 'Astronomers proposed a _____ explanation for the comet’s unusual orbit.',
    sentenceKo: '천문학자들은 혜성의 특이한 궤도에 대해 그럴듯한 설명을 제시했다.',
    synonym: 'credible',
    synonymKo: '믿을 수 있는',
    antonym: 'absurd',
    antonymKo: '터무니없는',
    englishDef: 'seeming reasonable, believable, or probable',
    chunks: ['plau', 'si', 'ble'],
  },
  {
    id: 'w37',
    word: 'constrain',
    meaning: '제약하다, 제한하다',
    pos: '동사',
    pronunciation: '컨스트레인',
    level: '수능1등급',
    sentence: 'Tight budgets often _____ how quickly startups can expand overseas.',
    sentenceKo: '빠듯한 예산은 종종 스타트업이 해외로 얼마나 빨리 확장할 수 있는지를 제약한다.',
    synonym: 'restrict',
    synonymKo: '제한하다',
    antonym: 'liberate',
    antonymKo: '해방시키다',
    englishDef: 'to severely restrict the scope, extent, or activity of something',
    chunks: ['con', 'stra', 'in'],
  },
  {
    id: 'w38',
    word: 'authentic',
    meaning: '진정한, 진짜의',
    pos: '형용사',
    pronunciation: '어센틱',
    level: '수능필수',
    sentence: 'Curators verified that the celadon vase was an _____ Goryeo artifact.',
    sentenceKo: '큐레이터들은 그 청자 화병이 진품 고려 유물임을 검증했다.',
    synonym: 'genuine',
    synonymKo: '진짜의',
    antonym: 'counterfeit',
    antonymKo: '위조의',
    englishDef: 'of undisputed origin; genuine and not a copy',
    chunks: ['au', 'then', 'tic'],
  },
  {
    id: 'w39',
    word: 'correlate',
    meaning: '상관관계를 갖다',
    pos: '동사',
    pronunciation: '코럴레이트',
    level: '수능1등급',
    sentence: 'Adequate sleep hours strongly _____ with better exam concentration.',
    sentenceKo: '충분한 수면 시간은 더 나은 시험 집중력과 강한 상관관계를 갖는다.',
    synonym: 'connect',
    synonymKo: '연결되다',
    antonym: 'disconnect',
    antonymKo: '단절되다',
    englishDef: 'to have a mutual relationship or statistical connection',
    chunks: ['cor', 're', 'late'],
  },
  {
    id: 'w40',
    word: 'perceive',
    meaning: '인지하다, 인식하다',
    pos: '동사',
    pronunciation: '퍼시브',
    level: '수능필수',
    sentence: 'Color lighting alters how diners _____ the sweetness of a dessert.',
    sentenceKo: '색상 조명은 식사하는 사람들이 디저트의 단맛을 인지하는 방식을 바꾼다.',
    synonym: 'recognize',
    synonymKo: '알아차리다',
    antonym: 'overlook',
    antonymKo: '간과하다',
    englishDef: 'to become aware of or interpret something through the senses',
    chunks: ['per', 'cei', 've'],
  },
  {
    id: 'w41',
    word: 'profound',
    meaning: '심오한, 깊은',
    pos: '형용사',
    pronunciation: '프로파운드',
    level: '수능1등급',
    sentence: 'Reading classic literature leaves a _____ impression on empathy.',
    sentenceKo: '고전 문학을 읽는 것은 공감 능력에 깊은 인상을 남긴다.',
    synonym: 'deep',
    synonymKo: '깊은',
    antonym: 'superficial',
    antonymKo: '피상적인',
    englishDef: 'very great, intense, or showing deep insight',
    chunks: ['pro', 'fou', 'nd'],
  },
  {
    id: 'w42',
    word: 'scrutinize',
    meaning: '면밀히 조사하다',
    pos: '동사',
    pronunciation: '스크루터나이즈',
    level: '고난도빈출',
    sentence: 'Auditors carefully _____ every transaction before approving the report.',
    sentenceKo: '감사관들은 보고서를 승인하기 전에 모든 거래를 면밀히 조사한다.',
    synonym: 'examine',
    synonymKo: '조사하다',
    antonym: 'glance',
    antonymKo: '힐끗 보다',
    englishDef: 'to examine or inspect closely and thoroughly',
    chunks: ['scru', 'ti', 'nize'],
  },
  {
    id: 'w43',
    word: 'versatile',
    meaning: '다재다능한, 다용도의',
    pos: '형용사',
    pronunciation: '버서틸',
    level: '수능1등급',
    sentence: 'Bamboo is a remarkably _____ material used in textiles and architecture.',
    sentenceKo: '대나무는 섬유와 건축에 쓰이는 놀라울 정도로 다용도의 재료이다.',
    synonym: 'flexible',
    synonymKo: '유연한',
    antonym: 'limited',
    antonymKo: '제한적인',
    englishDef: 'able to adapt or be used for many different functions',
    chunks: ['ver', 'sa', 'tile'],
  },
  {
    id: 'w44',
    word: 'hypothesis',
    meaning: '가설',
    pos: '명사',
    pronunciation: '하이파서시스',
    level: '수능필수',
    sentence: 'The biology team ran three experiments to test their initial _____.',
    sentenceKo: '생물학 팀은 초기 가설을 검증하기 위해 세 번의 실험을 진행했다.',
    synonym: 'assumption',
    synonymKo: '가정',
    antonym: 'certainty',
    antonymKo: '확실성',
    englishDef: 'a proposed explanation made as a starting point for investigation',
    chunks: ['hy', 'pothe', 'sis'],
  },
  {
    id: 'w45',
    word: 'indispensable',
    meaning: '필수 불가결한',
    pos: '형용사',
    pronunciation: '인디스펜서블',
    level: '고난도빈출',
    sentence: 'Clean freshwater is an _____ resource for every living community.',
    sentenceKo: '깨끗한 담수는 모든 생명 공동체에 필수 불가결한 자원이다.',
    synonym: 'essential',
    synonymKo: '필수적인',
    antonym: 'optional',
    antonymKo: '선택적인',
    englishDef: 'absolutely necessary and impossible to do without',
    chunks: ['in', 'dispen', 'sable'],
  },
  {
    id: 'w46',
    word: 'compromise',
    meaning: '타협하다; 손상시키다',
    pos: '동사/명사',
    pronunciation: '컴프러마이즈',
    level: '수능필수',
    sentence: 'Safety engineers never _____ quality standards to shorten deadlines.',
    sentenceKo: '안전 엔지니어들은 마감일을 단축하기 위해 품질 기준을 결코 타협하지 않는다.',
    synonym: 'negotiate',
    synonymKo: '협상하다',
    antonym: 'insist',
    antonymKo: '고집하다',
    englishDef: 'to settle a dispute by mutual concession, or weaken standards',
    chunks: ['com', 'pro', 'mise'],
  },
  {
    id: 'w47',
    word: 'redundant',
    meaning: '불필요한, 중복되는',
    pos: '형용사',
    pronunciation: '리던던트',
    level: '고난도빈출',
    sentence: 'Good editors trim _____ adjectives to make every sentence crisp.',
    sentenceKo: '훌륭한 편집자는 모든 문장을 명쾌하게 만들기 위해 불필요한 형용사를 줄인다.',
    synonym: 'superfluous',
    synonymKo: '잉여의, 과다한',
    antonym: 'necessary',
    antonymKo: '필수적인',
    englishDef: 'not or no longer needed; needlessly repetitive',
    chunks: ['re', 'dun', 'dant'],
  },
  {
    id: 'w48',
    word: 'stimulate',
    meaning: '자극하다, 활성화하다',
    pos: '동사',
    pronunciation: '스티뮬레이트',
    level: '수능필수',
    sentence: 'Interactive puzzles _____ curiosity more effectively than rote drills.',
    sentenceKo: '인터랙티브 퍼즐은 단순 암기보다 호기심을 더 효과적으로 자극한다.',
    synonym: 'encourage',
    synonymKo: '북돋우다',
    antonym: 'suppress',
    antonymKo: '억누르다',
    englishDef: 'to raise levels of physiological, mental, or economic activity',
    chunks: ['sti', 'mu', 'late'],
  },
  {
    id: 'w49',
    word: 'equilibrium',
    meaning: '균형, 평형 상태',
    pos: '명사',
    pronunciation: '이퀄리브리엄',
    level: '고난도빈출',
    sentence: 'Predators and prey naturally maintain ecological _____ in the reserve.',
    sentenceKo: '포식자와 피식자는 보호구역에서 자연스럽게 생태적 균형을 유지한다.',
    synonym: 'balance',
    synonymKo: '균형',
    antonym: 'imbalance',
    antonymKo: '불균형',
    englishDef: 'a state in which opposing forces or influences are balanced',
    chunks: ['equi', 'libri', 'um'],
  },
  {
    id: 'w50',
    word: 'anticipate',
    meaning: '예상하다, 기대하다',
    pos: '동사',
    pronunciation: '앤티서페이트',
    level: '수능필수',
    sentence: 'Weather satellites help coastal cities _____ severe typhoons early.',
    sentenceKo: '기상 위성은 해안 도시들이 강력한 태풍을 조기에 예상하도록 돕는다.',
    synonym: 'foresee',
    synonymKo: '예견하다',
    antonym: 'doubt',
    antonymKo: '의심하다',
    englishDef: 'to expect or predict an event before it happens',
    chunks: ['an', 'tici', 'pate'],
  },
  {
    id: 'w51',
    word: 'paradox',
    meaning: '역설, 모순된 말',
    pos: '명사',
    pronunciation: '패러닥스',
    level: '수능1등급',
    sentence: 'Having too many choices often reduces satisfaction—a classic _____.',
    sentenceKo: '선택지가 너무 많으면 오히려 만족도가 떨어지는 것은 고전적인 역설이다.',
    synonym: 'contradiction',
    synonymKo: '모순',
    antonym: 'consistency',
    antonymKo: '일관성',
    englishDef: 'a seemingly absurd statement that may nonetheless prove true',
    chunks: ['pa', 'ra', 'dox'],
  },
  {
    id: 'w52',
    word: 'consensus',
    meaning: '합의, 의견 일치',
    pos: '명사',
    pronunciation: '컨센서스',
    level: '수능1등급',
    sentence: 'After hours of debate, the delegates reached a broad _____ on safety.',
    sentenceKo: '몇 시간의 토론 끝에 대표단은 안전에 관한 폭넓은 합의에 도달했다.',
    synonym: 'agreement',
    synonymKo: '동의, 합의',
    antonym: 'dispute',
    antonymKo: '분쟁, 이견',
    englishDef: 'general agreement reached by a group as a whole',
    chunks: ['con', 'sen', 'sus'],
  },
  {
    id: 'w53',
    word: 'subsidize',
    meaning: '보조금을 지급하다',
    pos: '동사',
    pronunciation: '섭시다이즈',
    level: '고난도빈출',
    sentence: 'The municipality will _____ electric buses to modernize public transit.',
    sentenceKo: '지방자치단체는 대중교통 현대화를 위해 전기 버스 보조금을 지급할 것이다.',
    synonym: 'fund',
    synonymKo: '자금을 대다',
    antonym: 'tax',
    antonymKo: '과세하다',
    englishDef: 'to support an organization or activity financially',
    chunks: ['sub', 'si', 'dize'],
  },
  {
    id: 'w54',
    word: 'rigorous',
    meaning: '엄격한, 철저한',
    pos: '형용사',
    pronunciation: '리거러스',
    level: '수능1등급',
    sentence: 'New vaccines undergo _____ peer review before global distribution.',
    sentenceKo: '신규 백신은 전 세계 보급 전에 철저한 동료 심사를 거친다.',
    synonym: 'strict',
    synonymKo: '엄격한',
    antonym: 'lenient',
    antonymKo: '관대한',
    englishDef: 'extremely thorough, exhaustive, and accurate',
    chunks: ['ri', 'go', 'rous'],
  },
  {
    id: 'w55',
    word: 'empathy',
    meaning: '공감, 감정이입',
    pos: '명사',
    pronunciation: '엠퍼시',
    level: '수능필수',
    sentence: 'Listening without interruption nurtures genuine _____ among teammates.',
    sentenceKo: '방해하지 않고 경청하는 것은 팀원들 사이에 진정한 공감을 기른다.',
    synonym: 'compassion',
    synonymKo: '연민, 공감',
    antonym: 'apathy',
    antonymKo: '무관심',
    englishDef: 'the ability to understand and share the feelings of another',
    chunks: ['em', 'pa', 'thy'],
  },
  {
    id: 'w56',
    word: 'obscure',
    meaning: '모호한, 무명의; 가리다',
    pos: '형용사/동사',
    pronunciation: '옵스큐어',
    level: '고난도빈출',
    sentence: 'Thick mountain mist began to _____ the trail markers ahead.',
    sentenceKo: '짙은 산안개가 앞쪽의 등산로 표지판을 가리기 시작했다.',
    synonym: 'conceal',
    synonymKo: '감추다',
    antonym: 'clarify',
    antonymKo: '명확히 하다',
    englishDef: 'not discovered or known about; uncertain or hidden from view',
    chunks: ['ob', 'scu', 're'],
  },
  {
    id: 'w57',
    word: 'spontaneous',
    meaning: '자발적인, 즉흥적인',
    pos: '형용사',
    pronunciation: '스판테이니어스',
    level: '수능1등급',
    sentence: 'The street jazz quartet drew _____ applause from passing commuters.',
    sentenceKo: '거리 재즈 사중주단은 지나가는 통근객들의 자발적인 박수를 끌어냈다.',
    synonym: 'impulsive',
    synonymKo: '즉흥적인',
    antonym: 'deliberate',
    antonymKo: '의도적인, 계획된',
    englishDef: 'performed or occurring as a result of a sudden natural impulse',
    chunks: ['spon', 'tane', 'ous'],
  },
  {
    id: 'w58',
    word: 'exaggerate',
    meaning: '과장하다',
    pos: '동사',
    pronunciation: '이그재저레이트',
    level: '수능필수',
    sentence: 'Clickbait headlines often _____ minor findings to attract views.',
    sentenceKo: '낚시성 헤드라인은 조회수를 끌기 위해 사소한 발견을 종종 과장한다.',
    synonym: 'overstate',
    synonymKo: '과장해서 말하다',
    antonym: 'understate',
    antonymKo: '축소해서 말하다',
    englishDef: 'to represent something as larger or more dramatic than it really is',
    chunks: ['ex', 'agger', 'ate'],
  },
  {
    id: 'w59',
    word: 'pragmatic',
    meaning: '실용적인, 현실적인',
    pos: '형용사',
    pronunciation: '프래그매틱',
    level: '고난도빈출',
    sentence: 'The mayor adopted a _____ plan that could be completed within a year.',
    sentenceKo: '시장은 1년 내에 완수할 수 있는 실용적인 계획을 채택했다.',
    synonym: 'practical',
    synonymKo: '실질적인',
    antonym: 'idealistic',
    antonymKo: '이상주의적인',
    englishDef: 'dealing with things sensibly and realistically',
    chunks: ['prag', 'ma', 'tic'],
  },
  {
    id: 'w60',
    word: 'altruistic',
    meaning: '이타적인',
    pos: '형용사',
    pronunciation: '앨트루이스틱',
    level: '고난도빈출',
    sentence: 'Volunteering weekends at the shelter reflected her _____ values.',
    sentenceKo: '주말마다 보호소에서 봉사하는 것은 그녀의 이타적인 가치관을 반영했다.',
    synonym: 'selfless',
    synonymKo: '사심 없는',
    antonym: 'selfish',
    antonymKo: '이기적인',
    englishDef: 'showing a disinterested and selfless concern for the well-being of others',
    chunks: ['al', 'tru', 'istic'],
  },
];

/** Deterministic mulberry32 PRNG for reproducible tests & seeded runs */
export function createSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const DECOY_CHUNK_PREFIXES = ['pre', 'dis', 'sub', 'con', 'in', 're', 'un', 'ex', 'pro', 'trans'];
const DECOY_CHUNK_MIDDLES = ['ver', 'tane', 'stan', 'pen', 'ti', 'lo', 'cel', 'her', 'ni', 'ra'];
const DECOY_CHUNK_SUFFIXES = ['able', 'ous', 'ate', 'ent', 'ive', 'ment', 'ity', 'tial', 'ize', 'cal'];

function pickDistractors(
  target: CsatWord,
  pool: readonly CsatWord[],
  count: number,
  rng: () => number
): CsatWord[] {
  const samePos = pool.filter((w) => w.id !== target.id && w.pos === target.pos);
  const others = pool.filter((w) => w.id !== target.id && w.pos !== target.pos);
  const candidates = [...shuffleArray(samePos, rng), ...shuffleArray(others, rng)];
  return candidates.slice(0, count);
}

const RPG_NPC_CAST: Omit<RpgDialogueInfo, 'npcLineEn' | 'npcLineKo'>[] = [
  {
    npcId: 'npc-barista',
    npcName: '바리스타 미나',
    npcRole: '보카 카페 주인',
    locationName: '선샤인 코너 카페',
    shirtColor: 0xf43f5e,
    accentColor: 0xfef08a,
    greetingKo: '어서 와요 여행자님! 손님과 대화하다가 딱 맞는 영어 표현이 헷갈리네요.',
    replySuccessKo: '와, 완벽한 표현이에요! 따뜻한 코인 선물 받아가세요!',
  },
  {
    npcId: 'npc-bookstore',
    npcName: '서점 주인 레오',
    npcRole: '고서점 마스터',
    locationName: '올드 브릭 서점 앞',
    shirtColor: 0x0284c7,
    accentColor: 0xf59e0b,
    greetingKo: '잠깐만요 학생! 이 SAT 고전 문장의 빈칸에 들어갈 단어를 알려줄 수 있나요?',
    replySuccessKo: '역시 대단해요! 이 책장의 비밀 코인을 드릴게요!',
  },
  {
    npcId: 'npc-musician',
    npcName: '거리 악사 진',
    npcRole: '광장 버스커',
    locationName: '분수대 광장 옆',
    shirtColor: 0x8b5cf6,
    accentColor: 0x38bdf8,
    greetingKo: '헤이 친구! 새 영어 노래 가사에 들어갈 단어를 같이 골라줄래요?',
    replySuccessKo: '완전 찰떡이에요! 오늘 광장 공연 대성공 예감!',
  },
  {
    npcId: 'npc-professor',
    npcName: '박 교수님',
    npcRole: '천문대 학자',
    locationName: '시계탑 아치길',
    shirtColor: 0x10b981,
    accentColor: 0xfbbf24,
    greetingKo: '반갑네! 논문에 쓸 핵심 수능·SAT 어휘 하나만 확인해 줄 수 있겠나?',
    replySuccessKo: '훌륭하군! 자네라면 수능 영어 1등급은 문제없겠어!',
  },
  {
    npcId: 'npc-traveler',
    npcName: '여행가 클라라',
    npcRole: '세계 탐험가',
    locationName: '돌다리 입구',
    shirtColor: 0xf97316,
    accentColor: 0x67e8f9,
    greetingKo: '안녕! 다음 도시로 떠나기 전에 이 여행 일기 문장을 완성하고 싶어요.',
    replySuccessKo: '고마워요! 덕분에 멋진 여행 기록이 완성됐어요!',
  },
  {
    npcId: 'npc-architect',
    npcName: '건축가 준호',
    npcRole: '마을 설계사',
    locationName: '타운 홀 앞 대로',
    shirtColor: 0x0ea5e9,
    accentColor: 0xfde047,
    greetingKo: '잠시 시간 있나요? 마을 발표회에 쓸 영어 문장 빈칸을 도와주세요!',
    replySuccessKo: '명쾌하네요! 발표회 보너스 코인을 챙겨가세요!',
  },
];

/**
 * Generates a full ordered deck of CSAT/SAT questions tailored to each of the 6 distinct 3D Arcade Games.
 * Prioritizes wrong-answer notebook words (SRS) when provided.
 */
export function generateGameQuestions(
  gameId: GameId,
  options?: {
    count?: number;
    priorityWordIds?: string[];
    customPool?: CsatWord[];
    difficulty?: 'ALL' | '수능필수' | '수능1등급' | '고난도빈출';
    seed?: number;
  }
): ArcadeQuestion[] {
  const meta = GAME_CATALOG.find((g) => g.id === gameId) ?? GAME_CATALOG[0];
  const count = options?.count ?? meta.roundsPerRun;
  const basePool = options?.customPool && options.customPool.length >= 6 ? options.customPool : CSAT_VOCABULARY;
  const filteredPool =
    options?.difficulty && options.difficulty !== 'ALL'
      ? basePool.filter((w) => w.level === options.difficulty)
      : basePool;
  const pool = filteredPool.length >= 6 ? filteredPool : basePool;
  const rng = options?.seed !== undefined ? createSeededRng(options.seed) : Math.random;

  const prioritySet = new Set(options?.priorityWordIds ?? []);
  const priorityWords = shuffleArray(
    pool.filter((w) => prioritySet.has(w.id)),
    rng
  );
  const remainingWords = shuffleArray(
    pool.filter((w) => !prioritySet.has(w.id)),
    rng
  );

  // Mix up to half from wrong-answer SRS notebook for smart review
  const maxPriority = Math.min(priorityWords.length, Math.ceil(count / 2));
  const selected = [...priorityWords.slice(0, maxPriority), ...remainingWords].slice(0, count);

  return selected.map((wordEntry, idx) => {
    const qId = `${gameId}-${wordEntry.id}-${idx}`;

    if (gameId === 'sky-runner') {
      // Game 1: Sentence Completion — 3-Lane Airplane Flight Runner
      const distractors = pickDistractors(wordEntry, pool, 2, rng);
      const opts: ArcadeOption[] = shuffleArray(
        [
          { id: `${qId}-c`, label: wordEntry.word, subLabel: wordEntry.pos, isCorrect: true },
          ...distractors.map((d, i) => ({
            id: `${qId}-d${i}`,
            label: d.word,
            subLabel: d.pos,
            isCorrect: false,
          })),
        ],
        rng
      );
      return {
        id: qId,
        gameId,
        wordEntry,
        goalHeadline: '목표 [원탭 비행 돌파]: 하단 정답 영단어를 한 번만 탭해 빈칸 게이트를 통과하세요!',
        goalTone: 'sky',
        promptBadge: `${wordEntry.level} · 문장 빈칸 완성`,
        promptMain: wordEntry.sentence,
        promptSub: wordEntry.sentenceKo,
        speakText: wordEntry.sentence.replace('_____', wordEntry.word),
        options: opts,
      };
    }

    if (gameId === 'tower-crash') {
      // Game 2: 3-Pair Simultaneous Castle Matching Cannon (3 English + 3 Korean towers on courtyard!)
      const extraWords = pickDistractors(wordEntry, pool, 2, rng);
      const trio = [wordEntry, ...extraWords];
      const pairs: TowerMatchPair[] = trio.map((entry, pIdx) => ({
        pairId: `${qId}-p${pIdx}`,
        wordEntry: entry,
        leftLabel: entry.word,
        rightLabel: entry.meaning,
      }));
      const leftOrder = shuffleArray(
        pairs.map((p) => p.pairId),
        rng
      );
      const rightOrder = shuffleArray(
        pairs.map((p) => p.pairId),
        rng
      );
      // Also expose flat options array for test compatibility
      const opts: ArcadeOption[] = pairs.map((p, pIdx) => ({
        id: p.pairId,
        label: p.leftLabel,
        subLabel: p.rightLabel,
        isCorrect: pIdx === 0,
      }));
      return {
        id: qId,
        gameId,
        wordEntry,
        goalHeadline: '목표 [3쌍 짝짓기 포격]: 왼쪽 영단어 성탑 1개 + 오른쪽 뜻 성탑 1개를 짝지어 3쌍 모두 폭파하세요!',
        goalTone: 'emerald',
        promptBadge: `웨이브 ${idx + 1}/${count} · 영단어 ↔ 뜻 3쌍 연쇄 매칭`,
        promptMain: '영단어 성탑과 알맞은 한글 뜻 성탑을 짝지어 포탑으로 격파하세요!',
        promptSub: '1) 왼쪽 영단어 클릭 → 2) 오른쪽 뜻 클릭 → 이중 레이저 폭파!',
        speakText: wordEntry.word,
        options: opts,
        matchPairs: {
          pairs,
          leftOrder,
          rightOrder,
        },
      };
    }

    if (gameId === 'spelling-hop') {
      // Game 3: River Stepping-Stone Bridge Crossing (3 rows x 3 mossy stones)
      const [c0, c1, c2] = wordEntry.chunks;
      const decoyPools = [DECOY_CHUNK_PREFIXES, DECOY_CHUNK_MIDDLES, DECOY_CHUNK_SUFFIXES];
      const stepLabels = ['1단계 앞 음절 징검다리', '2단계 중간 어근 징검다리', '3단계 끝 음절 징검다리'];

      const steps = [c0, c1, c2].map((correctChunk, stepIdx) => {
        const poolChunks = shuffleArray(
          decoyPools[stepIdx].filter((ch) => ch.toLowerCase() !== correctChunk.toLowerCase()),
          rng
        );
        const choices: ArcadeOption[] = shuffleArray(
          [
            { id: `${qId}-s${stepIdx}-c`, label: correctChunk, isCorrect: true },
            { id: `${qId}-s${stepIdx}-d0`, label: poolChunks[0], isCorrect: false },
            { id: `${qId}-s${stepIdx}-d1`, label: poolChunks[1], isCorrect: false },
          ],
          rng
        );
        return {
          promptHint: stepLabels[stepIdx],
          choices,
        };
      });

      return {
        id: qId,
        gameId,
        wordEntry,
        goalHeadline: '목표 [징검다리 건너기]: 강 위 3단계 징검다리(접두→어근→접미)를 순서대로 밟아 단어를 완성하세요!',
        goalTone: 'amber',
        promptBadge: `${wordEntry.level} · 3단 징검다리 철자 완성`,
        promptMain: wordEntry.meaning,
        promptSub: `힌트: ${wordEntry.word[0].toUpperCase()}··· (${wordEntry.word.length}글자 · ${wordEntry.pos})`,
        speakText: wordEntry.word,
        options: steps[0].choices,
        steps,
      };
    }

    if (gameId === 'synonym-defense') {
      // Game 4: Synonym / Antonym Crystal Meteor Intercept — ZERO ANSWER SPOILERS!
      const relationMode: 'SYNONYM' | 'ANTONYM' = idx % 2 === 0 ? 'SYNONYM' : 'ANTONYM';
      const targetWord = relationMode === 'SYNONYM' ? wordEntry.synonym : wordEntry.antonym;
      const oppositeWord = relationMode === 'SYNONYM' ? wordEntry.antonym : wordEntry.synonym;

      // Deduplicate labels strictly so no two meteors ever display the same English word
      const usedLabels = new Set<string>([
        wordEntry.word.toLowerCase(),
        targetWord.toLowerCase(),
        oppositeWord.toLowerCase(),
      ]);

      const decoyLabels: string[] = [];
      const candidatePool = pickDistractors(wordEntry, pool, 12, rng);
      for (const cand of candidatePool) {
        const candidateLabel = relationMode === 'SYNONYM' ? cand.synonym : cand.antonym;
        const lower = candidateLabel.toLowerCase();
        if (!usedLabels.has(lower)) {
          usedLabels.add(lower);
          decoyLabels.push(candidateLabel);
          if (decoyLabels.length >= 2) break;
        }
      }

      // Clean English-only choices — NO Korean answer hints, NO "주의: 반의어" spoilers!
      const opts: ArcadeOption[] = shuffleArray(
        [
          { id: `${qId}-c`, label: targetWord, isCorrect: true },
          { id: `${qId}-opp`, label: oppositeWord, isCorrect: false },
          ...decoyLabels.map((lbl, i) => ({
            id: `${qId}-d${i}`,
            label: lbl,
            isCorrect: false,
          })),
        ],
        rng
      );

      return {
        id: qId,
        gameId,
        wordEntry,
        relationMode,
        goalHeadline:
          relationMode === 'SYNONYM'
            ? '목표 [동의어 요격]: 제시어와 비슷한 뜻(동의어) 운석만 클릭·격추하세요!'
            : '목표 [반대어 요격]: 제시어와 반대 뜻(반대어) 운석만 클릭·격추하세요!',
        goalTone: relationMode === 'SYNONYM' ? 'sky' : 'coral',
        promptBadge: relationMode === 'SYNONYM' ? '동의어(SYNONYM) 찾기' : '반대어(ANTONYM) 찾기',
        promptMain: `${wordEntry.word} (${wordEntry.meaning})`,
        promptSub:
          relationMode === 'SYNONYM'
            ? '비슷한 뜻의 영단어 운석을 찾아 실드 레이저로 격추하세요'
            : '정반대 뜻의 영단어 운석을 찾아 실드 레이저로 격추하세요',
        speakText: wordEntry.word,
        options: opts,
      };
    }

    if (gameId === 'rpg-street') {
      // Game 6: 3D RPG Village Street — Walk up to NPCs & answer contextual English dialogue!
      const npc = RPG_NPC_CAST[idx % RPG_NPC_CAST.length];
      const distractors = pickDistractors(wordEntry, pool, 2, rng);
      const opts: ArcadeOption[] = shuffleArray(
        [
          { id: `${qId}-c`, label: wordEntry.word, subLabel: wordEntry.pos, isCorrect: true },
          ...distractors.map((d, i) => ({
            id: `${qId}-d${i}`,
            label: d.word,
            subLabel: d.pos,
            isCorrect: false,
          })),
        ],
        rng
      );

      return {
        id: qId,
        gameId,
        wordEntry,
        goalHeadline: `목표 [RPG 길거리 대화]: ${npc.locationName}에서 만난 ${npc.npcName}의 말에 맞는 영단어로 대답하세요!`,
        goalTone: 'violet',
        promptBadge: `${npc.npcName} (${npc.npcRole}) · ${wordEntry.level}`,
        promptMain: `"${wordEntry.sentence}"`,
        promptSub: `해석: ${wordEntry.sentenceKo}`,
        speakText: wordEntry.sentence.replace('_____', wordEntry.word),
        options: opts,
        rpgDialogue: {
          ...npc,
          npcLineEn: wordEntry.sentence,
          npcLineKo: wordEntry.sentenceKo,
        },
      };
    }

    if (gameId === 'voca-tetris') {
      const decoy = pickDistractors(wordEntry, pool, 1, rng)[0];
      const opts: ArcadeOption[] = shuffleArray(
        [
          { id: `${qId}-c`, label: wordEntry.meaning, isCorrect: true },
          { id: `${qId}-d0`, label: decoy.meaning, isCorrect: false },
        ],
        rng
      );
      return {
        id: qId,
        gameId,
        wordEntry,
        goalHeadline: '목표 [보카 테트리스 3D]: 블록으로 줄을 완성하거나 단어 폭탄으로 단번에 격파하세요!',
        goalTone: 'sky',
        promptBadge: `단어 폭탄 퀴즈 · ${wordEntry.level}`,
        promptMain: wordEntry.word,
        promptSub: `${wordEntry.pos} · [${wordEntry.pronunciation}]`,
        speakText: wordEntry.word,
        options: opts,
      };
    }

    // Game 5: vault-rush — Speed O/X (맞는것만 / 틀린것만) with TTS Listening
    const isStatementTrue = rng() >= 0.48;
    const decoy = pickDistractors(wordEntry, pool, 1, rng)[0];
    const useEnglishDef = idx % 3 === 2;
    const shownText = isStatementTrue
      ? useEnglishDef
        ? wordEntry.englishDef
        : wordEntry.meaning
      : useEnglishDef
        ? decoy.englishDef
        : decoy.meaning;

    const opts: ArcadeOption[] = [
      { id: `${qId}-true`, label: 'O 맞다', subLabel: 'TRUE [←/A]', isCorrect: isStatementTrue },
      { id: `${qId}-false`, label: 'X 틀리다', subLabel: 'FALSE [→/D]', isCorrect: !isStatementTrue },
    ];

    return {
      id: qId,
      gameId,
      wordEntry,
      isStatementTrue,
      goalHeadline: useEnglishDef
        ? '목표 [맞는것·틀린것 O/X]: 발음과 영영풀이가 일치하면 O, 틀리면 X 레버를 당기세요!'
        : '목표 [맞는것·틀린것 O/X]: 영단어와 제시된 뜻이 일치하면 O, 틀리면 X 레버를 당기세요!',
      goalTone: 'amber',
      promptBadge: useEnglishDef ? '스피드 영영풀이 O/X' : '스피드 뜻·발음 O/X',
      promptMain: wordEntry.word,
      promptSub: `= "${shownText}"`,
      speakText: wordEntry.word,
      options: opts,
    };
  });
}

export function getGameMeta(gameId: GameId): GameMeta {
  return GAME_CATALOG.find((g) => g.id === gameId) ?? GAME_CATALOG[0];
}

const CURATED_MEMORY_TIPS: Record<string, string> = {
  inevitable: '어원: in(부정) + evit(피하다) + able → 피할 수 없는',
  sustainable: '어원: sus(아래서) + tain(지탱하다) → 오래 버틸 수 있는',
  ambiguous: '어원: ambi(양쪽) + ag(몰다) → 이쪽저쪽 모호한',
  substantial: '어원: sub(아래) + stance(서다) → 실체가 뚜렷한, 상당한',
  compensate: '어원: com(함께) + pens(무게 재다) → 균형 맞춰 보상하다',
  vulnerable: '어원: vulner(상처) + able → 상처받기 쉬운, 취약한',
  prominent: '어원: pro(앞으로) + min(돌출) → 앞으로 튀어나온, 저명한',
  contradict: '어원: contra(반대) + dict(말하다) → 반대로 말하다, 모순되다',
  allocate: '어원: al(향해) + loc(장소) → 자리를 배정·할당하다',
  coherent: '어원: co(함께) + her(달라붙다) → 논리가 착착 붙는, 일관된',
  deteriorate: '어원: deterior(더 나쁜) + ate → 점점 악화되다',
  implement: '어원: im(안) + ple(채우다) → 계획을 실현·시행하다',
  abundant: '어원: ab(넘쳐) + und(파도) → 파도처럼 넘치게 풍부한',
  fluctuate: '어원: fluct(물결) + ate → 물결치듯 오르내리다',
  elaborate: '어원: e(밖으로) + labor(노력) → 공들여 만든, 정교한',
  accelerate: '어원: ac(더) + celer(빠른) → 속도를 높여 가속하다',
  prevalent: '어원: pre(앞서) + val(강한) → 힘있게 널리 퍼진',
  mitigate: '어원: mitis(부드러운) + gate → 고통을 부드럽게 완화하다',
  empirical: '어원: em(안) + peira(실험/경험) → 실증적·경험적인',
  incentive: '어원: in(안) + cant(노래) → 의욕을 북돋우는 동기',
  compatible: '어원: com(함께) + path(겪다) → 함께 어울려 호환되는',
  simultaneous: '어원: simul(함께) → 같은 시각에 동시에 일어나는',
  legitimate: '어원: leg(법) → 법과 이치에 맞는 정당한',
  accumulate: '어원: ac(더) + cumul(더미) → 더미처럼 차곡차곡 축적하다',
  cognitive: '어원: cogn(알다) → 지식을 인식하는, 인지의',
  resilient: '어원: re(다시) + sil(튀어오르다) → 다시 튀어오르는 회복력',
  catalyst: '어원: cata(완전히) + lys(풀다) → 변화를 터뜨리는 촉매제',
  indispensable: '어원: in(불가) + dispens(떼어주다) → 떼어낼 수 없는 필수적인',
  equilibrium: '어원: equi(같은) + libr(저울) → 저울이 수평인 균형 상태',
  altruistic: '어원: alter(타인) → 타인을 먼저 생각하는 이타적인',
  pragmatic: '어원: pragma(행동/실제) → 현실적이고 실용적인',
};

export function getWordMemoryTip(entry: CsatWord): string {
  if (entry.memoryTip) return entry.memoryTip;
  if (CURATED_MEMORY_TIPS[entry.word]) return CURATED_MEMORY_TIPS[entry.word];
  return `음절 분해: ${entry.chunks.join(' + ')} · 유의어 ${entry.synonym}(${entry.synonymKo})`;
}
