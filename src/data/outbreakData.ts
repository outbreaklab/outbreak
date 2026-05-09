// Static fallback data - used when API is loading or fails
export const FALLBACK_DATA = {
  metrics: {
    casesTotal: 8,
    casesConfirmed: 5,
    casesSuspected: 3,
    deaths: 3,
    cfrPct: 37.5,
    symptomaticNow: 0,
    evacuated: 3,
    inIcu: 2,
    nationalities: 23,
    peopleOnboard: 150,
    shipStatus: 'En route Tenerife',
    strain: 'Andes (ANDV)',
  },
  indexDate: '2026-04-06T12:00:00Z',
  riskAssessment: {
    level: 'Low (general public) \u00b7 Moderate (close contacts)',
    detail: 'Outbreak linked to a single cruise ship. No community spread detected.',
    syncNote: 'Data auto-syncs with WHO every 10 min',
  },
  situation: {
    summary: `An unprecedented hantavirus cluster is linked to the MV Hondius, an Antarctic expedition cruise ship operated by Oceanwide Expeditions. 8 cases (5 PCR-confirmed, 3 suspected) and 3 deaths have been reported across multiple countries. The causative agent is Andes orthohantavirus (ANDV) \u2014 the only hantavirus known to spread person to person. ~120 passengers and crew remain aboard. The ship is en route to the Canary Islands for quarantine processing. No new symptomatic cases reported onboard since May 4.`,
  },
  keyFacts: [
    'If you were not on the MV Hondius, your risk is essentially zero.',
    'Hantavirus does NOT spread through casual contact, food, or water.',
    'Andes virus can spread person-to-person, but only via prolonged close contact.',
    'There is no approved vaccine or antiviral. Treatment is supportive (ICU, oxygen, fluids).',
    '30 passengers disembarked on Saint Helena on Apr 24 \u2014 health authorities in 23+ countries are monitoring.',
    'All remaining passengers onboard are currently asymptomatic.',
  ],
  shipData: [
    { label: 'Vessel', value: 'MV Hondius' },
    { label: 'Operator', value: 'Oceanwide Expeditions' },
    { label: 'Ship status', value: 'En route Tenerife', color: '#38bdf8' },
    { label: 'People onboard', value: '~150' },
    { label: 'Symptomatic now', value: '0', color: '#34d399' },
    { label: 'PCR confirmed', value: '5', color: '#ff9f1c' },
    { label: 'Suspected', value: '3' },
    { label: 'Evacuated', value: '3', color: '#38bdf8' },
    { label: 'In ICU', value: '2', color: '#e63946' },
    { label: 'Strain', value: 'Andes (ANDV)', color: '#ff9f1c' },
    { label: 'Nationalities', value: '23' },
    { label: 'Incubation', value: '7-39 days' },
  ],
  geographicSpread: [
    { region: 'MV Hondius (At Sea)', status: 'Active Outbreak', cases: 8, severity: 'Critical' },
    { region: 'Saint Helena', status: 'Exposed', cases: 0, severity: 'Monitoring' },
    { region: 'Cape Verde', status: 'Evacuations', cases: 0, severity: 'Alert' },
    { region: 'Johannesburg, SA', status: 'Imported Cases', cases: 2, severity: 'High' },
    { region: 'Amsterdam, NL', status: 'Receiving', cases: 1, severity: 'Alert' },
    { region: 'Tenerife, ES', status: 'Quarantine', cases: 0, severity: 'Standby' },
  ],
  epiCurve: [
    ['Apr 6', 1, 0], ['Apr 7-10', 0, 0], ['Apr 11', 0, 1],
    ['Apr 24', 0, 0], ['Apr 25', 1, 0], ['Apr 26', 0, 1],
    ['Apr 28', 1, 0], ['Apr 29-May 1', 2, 0], ['May 2', 1, 1],
    ['May 4', 1, 0], ['May 5-7', 0, 0],
  ] as [string, number, number][],
  timeline: [
    { date: 'Apr 6', event: 'Index case: first symptoms reported onboard MV Hondius' },
    { date: 'Apr 11', event: 'First death reported' },
    { date: 'Apr 24', event: '30 passengers disembark at Saint Helena' },
    { date: 'Apr 25', event: 'Second confirmed case identified' },
    { date: 'Apr 26', event: 'Second death; ANDV strain confirmed' },
    { date: 'Apr 28', event: 'Third confirmed case' },
    { date: 'Apr 29-May 1', event: 'Two additional confirmed cases' },
    { date: 'May 2', event: 'Fourth confirmed case; third death' },
    { date: 'May 4', event: 'Fifth confirmed case; last symptomatic case to date' },
    { date: 'May 7', event: 'Evacuees received in Amsterdam' },
  ],
  strains: [
    { name: 'Andes', abbr: 'ANDV', host: 'Oligoryzomys longicaudatus', region: 'Argentina, Chile', cfr: '~40%', h2h: true, color: '#ef4444' },
    { name: 'Sin Nombre', abbr: 'SNV', host: 'Peromyscus maniculatus', region: 'USA, Canada, Mexico', cfr: '30-50%', h2h: false, color: '#f97316' },
    { name: 'Hantaan', abbr: 'HTNV', host: 'Apodemus agrarius', region: 'China, Korea, Russia', cfr: '1-5%', h2h: false, color: '#eab308' },
    { name: 'Seoul', abbr: 'SEOV', host: 'Rattus norvegicus', region: 'Worldwide', cfr: '<1%', h2h: false, color: '#22c55e' },
    { name: 'Puumala', abbr: 'PUUV', host: 'Myodes glareolus', region: 'Europe, Scandinavia', cfr: '0.1-0.4%', h2h: false, color: '#22c55e' },
    { name: 'Dobrava', abbr: 'DOBV', host: 'Apodemus flavicollis', region: 'Balkans, Central EU', cfr: '5-15%', h2h: false, color: '#f97316' },
    { name: 'Laguna Negra', abbr: 'LANV', host: 'Calomys laucha', region: 'Paraguay, Bolivia', cfr: '10-20%', h2h: false, color: '#f97316' },
    { name: 'Choclo', abbr: 'CHOV', host: 'Oligoryzomys fulvescens', region: 'Panama', cfr: '~10%', h2h: false, color: '#eab308' },
  ],
  faq: [
    { q: 'Should I be worried?', a: 'If you were not aboard the MV Hondius, your personal risk is essentially zero. This outbreak is contained to a single cruise ship and its passengers. Hantaviruses do not spread easily between people, and there is no community transmission.' },
    { q: 'Can hantavirus spread from person to person?', a: 'Most hantaviruses do NOT spread between people. The Andes virus is the sole exception: it can transmit between close contacts (household members, intimate partners) over prolonged exposure. Casual contact, shared surfaces, and airborne transmission in open spaces are not documented routes.' },
    { q: 'What are the symptoms?', a: 'Early (1-5 days): Fever, fatigue, muscle aches, headache, dizziness, chills, nausea. Late (4-10 days): Coughing, shortness of breath, fluid in the lungs (pulmonary edema), hypotension, shock. Late-stage HPS is a medical emergency.' },
    { q: 'Is there a vaccine or treatment?', a: 'No. There is currently no approved vaccine or specific antiviral for any hantavirus. Treatment is supportive: oxygen therapy, mechanical ventilation, fluid management, and ICU monitoring. Early hospitalization significantly improves survival.' },
    { q: 'How long is the incubation period?', a: 'For Andes virus: typically 7-39 days, with a median of ~18 days. This means exposed passengers who left the ship could develop symptoms up to 5+ weeks later, which is why health authorities across 23+ countries are actively monitoring.' },
    { q: 'Where does this data come from?', a: 'Case data is synced from WHO Disease Outbreak News (DON) via their public API. News articles are aggregated from GDELT Project, Google News, and NewsAPI. Ship status information comes from Oceanwide Expeditions press releases. All data updates automatically every 10 minutes.' },
  ],
  news: [
    { source: 'WHO', title: 'WHO confirms Andes hantavirus cluster linked to Antarctic cruise ship', date: '2026-05-08T14:30:00Z', severity: 'critical', image: '/news-1.jpg' },
    { source: 'Reuters', title: 'MV Hondius: Death toll rises to 3 as hantavirus cases reach 8', date: '2026-05-07T10:15:00Z', severity: 'high', image: '/news-2.jpg' },
    { source: 'ECDC', title: 'European CDC issues alert for passengers of MV Hondius expedition', date: '2026-05-06T16:45:00Z', severity: 'high' },
    { source: 'ProMED', title: 'Hantavirus pulmonary syndrome aboard Antarctic cruise vessel', date: '2026-05-05T08:20:00Z', severity: 'medium' },
    { source: 'BBC', title: 'Antarctic cruise ship outbreak: What we know about the hantavirus cases', date: '2026-05-04T12:00:00Z', severity: 'medium', image: '/news-3.jpg' },
    { source: 'The Guardian', title: 'Passengers quarantined as hantavirus spreads on expedition ship', date: '2026-05-03T09:30:00Z', severity: 'medium' },
    { source: 'Science Magazine', title: 'Andes virus: The only hantavirus known for human-to-human transmission', date: '2026-05-02T11:00:00Z', severity: 'low' },
    { source: 'CNN', title: 'Cruise ship headed to Canary Islands for quarantine processing', date: '2026-05-01T15:20:00Z', severity: 'medium' },
  ],
};

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical': return '#e63946';
    case 'high': return '#ff9f1c';
    case 'alert': return '#ff9f1c';
    case 'medium': return '#eab308';
    case 'monitoring': return '#8fa3af';
    case 'standby': return '#34d399';
    case 'low': return '#34d399';
    default: return '#8fa3af';
  }
}

export function timeAgo(iso: string): string {
  const sec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 3600) return `${Math.max(1, Math.round(sec / 60))}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  return `${Math.round(sec / 86400)}d ago`;
}

export const ACTIVE_OUTBREAKS = [
  {
    id: 'dengue-sa-2026',
    disease: 'Dengue fever',
    pathogen: 'Dengue virus',
    location: 'South America',
    country: 'Brazil, Argentina, Colombia',
    casesConfirmed: 45200,
    casesSuspected: 128000,
    deaths: 87,
    severity: 'high',
    riskLevel: 'high',
    lat: -14.235,
    lng: -51.925,
    transmission: 'Vector-borne (Aedes aegypti)',
    source: 'PAHO/WHO',
    sourceUrl: 'https://www.paho.org/en/topics/dengue',
    lastUpdate: '2026-05-08',
  },
  {
    id: 'mpox-cladeib-2026',
    disease: 'Mpox (clade Ib)',
    pathogen: 'Monkeypox virus clade Ib',
    location: 'Central Africa / Europe',
    country: 'DRC, Germany, France',
    casesConfirmed: 342,
    casesSuspected: 120,
    deaths: 12,
    severity: 'high',
    riskLevel: 'high',
    lat: -4.038,
    lng: 21.758,
    transmission: 'Person-to-person (close contact)',
    source: 'WHO/ECDC',
    sourceUrl: 'https://www.who.int/emergencies/disease-outbreak-news',
    lastUpdate: '2026-05-07',
  },
  {
    id: 'cholera-ea-2026',
    disease: 'Cholera',
    pathogen: 'Vibrio cholerae',
    location: 'Eastern Africa',
    country: 'Malawi, Mozambique, Zambia',
    casesConfirmed: 18500,
    casesSuspected: 4200,
    deaths: 245,
    severity: 'critical',
    riskLevel: 'critical',
    lat: -13.254,
    lng: 34.301,
    transmission: 'Fecal-oral (water/food)',
    source: 'WHO/Gov',
    sourceUrl: 'https://www.who.int/emergencies/disease-outbreak-news',
    lastUpdate: '2026-05-06',
  },
  {
    id: 'h5n1-global-2026',
    disease: 'H5N1 avian influenza',
    pathogen: 'Influenza A/H5N1',
    location: 'North America / Global',
    country: 'USA, Canada, Mexico',
    casesConfirmed: 42,
    casesSuspected: 18,
    deaths: 1,
    severity: 'high',
    riskLevel: 'high',
    lat: 37.09,
    lng: -95.71,
    transmission: 'Zoonotic (poultry/wild birds)',
    source: 'CDC/WHO',
    sourceUrl: 'https://www.cdc.gov/flu/avianflu/index.htm',
    lastUpdate: '2026-05-05',
  },
  {
    id: 'marburg-tz-2026',
    disease: 'Marburg virus disease',
    pathogen: 'Marburg virus',
    location: 'Tanzania',
    country: 'Tanzania',
    casesConfirmed: 1,
    casesSuspected: 0,
    deaths: 0,
    severity: 'critical',
    riskLevel: 'critical',
    lat: -6.369,
    lng: 34.889,
    transmission: 'Zoonotic (Rousettus bats) / person-to-person',
    source: 'WHO',
    sourceUrl: 'https://www.who.int/emergencies/disease-outbreak-news',
    lastUpdate: '2026-05-04',
  },
  {
    id: 'influenza-eu-2026',
    disease: 'Seasonal influenza',
    pathogen: 'Influenza A/B',
    location: 'Europe',
    country: 'Germany, France, UK, Italy',
    casesConfirmed: 125000,
    casesSuspected: 34000,
    deaths: 320,
    severity: 'medium',
    riskLevel: 'moderate',
    lat: 51.165,
    lng: 10.451,
    transmission: 'Airborne / droplet',
    source: 'ECDC',
    sourceUrl: 'https://www.ecdc.europa.eu/en/seasonal-influenza',
    lastUpdate: '2026-05-03',
  },
  {
    id: 'zika-sea-2026',
    disease: 'Zika virus',
    pathogen: 'Zika virus',
    location: 'Southeast Asia',
    country: 'Thailand, Vietnam',
    casesConfirmed: 89,
    casesSuspected: 210,
    deaths: 0,
    severity: 'medium',
    riskLevel: 'moderate',
    lat: 15.87,
    lng: 100.992,
    transmission: 'Vector-borne (Aedes aegypti)',
    source: 'WHO',
    sourceUrl: 'https://www.who.int/emergencies/disease-outbreak-news',
    lastUpdate: '2026-05-02',
  },
  {
    id: 'malaria-wa-2026',
    disease: 'Malaria',
    pathogen: 'Plasmodium falciparum',
    location: 'West Africa',
    country: 'Ghana, Nigeria',
    casesConfirmed: 285000,
    casesSuspected: 12000,
    deaths: 890,
    severity: 'medium',
    riskLevel: 'moderate',
    lat: 9.082,
    lng: 8.675,
    transmission: 'Vector-borne (Anopheles)',
    source: 'WHO',
    sourceUrl: 'https://www.who.int/malaria',
    lastUpdate: '2026-05-01',
  },
];

export const GLOBE_ROUTE: [number, number][] = [
  [-54.8, -68.3],
  [-63.5, -57],
  [-54.3, -36.7],
  [-37.1, -12.3],
  [-16, -5.7],
  [14.93, -23.51],
  [28.05, -15.6],
];

export interface GlobePoint {
  lat: number;
  lng: number;
  color: string;
  radius: number;
  label: string;
}

export const GLOBE_HOTSPOTS: GlobePoint[] = [
  { lat: -54.8, lng: -68.3, color: '#ef4444', radius: 1.1, label: 'Ushuaia — Departure (endemic zone)' },
  { lat: -16, lng: -5.7, color: '#f97316', radius: 0.85, label: 'Saint Helena — 30 pax disembarked Apr 24' },
  { lat: 14.93, lng: -23.51, color: '#f97316', radius: 0.85, label: 'Cape Verde — Evacuations May 4-6' },
  { lat: -26.2, lng: 28.05, color: '#fb7185', radius: 0.95, label: 'Johannesburg — 1 death, 1 ICU' },
  { lat: 52.37, lng: 4.9, color: '#eab308', radius: 0.8, label: 'Amsterdam — Evacuees received May 7' },
  { lat: 28.05, lng: -15.6, color: '#a78bfa', radius: 0.7, label: 'Tenerife — ETA May 10-11 (quarantine)' },
  { lat: -38.95, lng: -68.08, color: '#ef4444', radius: 1.2, label: 'Argentina — ANDV endemic zone' },
  { lat: -51.7, lng: -59.1, color: '#71717a', radius: 0.5, label: 'Falklands (proximate)' },
];

export const GLOBE_STRAINS: GlobePoint[] = [
  { lat: -41.13, lng: -71.31, color: '#ef4444', radius: 0.55, label: 'ANDV — Andes (Argentina, Chile)' },
  { lat: 37, lng: -109, color: '#f97316', radius: 0.55, label: 'SNV — Sin Nombre (USA, Canada, Mexico)' },
  { lat: 39, lng: 127, color: '#eab308', radius: 0.55, label: 'HTNV — Hantaan (China, Korea, Russia)' },
  { lat: 20, lng: 126, color: '#22c55e', radius: 0.55, label: 'SEOV — Seoul (Worldwide)' },
  { lat: 61.5, lng: 23.76, color: '#22c55e', radius: 0.55, label: 'PUUV — Puumala (Europe, Scandinavia)' },
  { lat: 43, lng: 21, color: '#f97316', radius: 0.55, label: 'DOBV — Dobrava (Balkans, Central EU)' },
  { lat: -23.5, lng: -58.5, color: '#f97316', radius: 0.55, label: 'LANV — Laguna Negra (Paraguay, Bolivia)' },
  { lat: 9, lng: -79, color: '#eab308', radius: 0.55, label: 'CHOV — Choclo (Panama)' },
  { lat: 26, lng: -80, color: '#eab308', radius: 0.55, label: 'BCCV — Black Creek Canal (Florida, USA)' },
  { lat: 30, lng: -92, color: '#eab308', radius: 0.55, label: 'BAYV — Bayou (Gulf Coast USA)' },
];

export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}
