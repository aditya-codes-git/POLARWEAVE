import {
  Expedition,
  Location,
  Document,
  Dataset,
  Observation,
  Measurement,
  MediaAsset,
  EvidenceLink,
  KnowledgeRelationship,
  GeneratedContent,
  ProcessingJob
} from '@polarweave/types';

export const DEMO_EXPEDITIONS: Expedition[] = [
  {
    id: 'exp_45_ant',
    title: '45th Indian Scientific Expedition to Antarctica',
    code: 'EXP-45-ANT',
    description: 'Multidisciplinary polar campaign monitoring coastal fast-ice dynamics, ice shelf grounding stability, and atmospheric aerosol fluxes across Queen Maud Land.',
    region: 'Antarctica',
    start_date: '2025-11-15',
    end_date: '2026-03-25',
    status: 'completed',
    lead_agency: 'National Centre for Polar and Ocean Research (NCPOR)',
    stations: ['Bharati Research Station', 'Maitri Research Station'],
    created_at: new Date('2025-11-15T00:00:00Z').toISOString(),
    demo: true
  },
  {
    id: 'exp_arctic_25',
    title: 'Indian Arctic Scientific Campaign — Kongsfjorden',
    code: 'EXP-ARCTIC-25',
    description: 'Long-term monitoring of fjord dynamics, atmospheric trace gases, and marine ecosystem responses to warming at Ny-Ålesund, Svalbard.',
    region: 'Arctic',
    start_date: '2025-06-01',
    end_date: '2025-09-30',
    status: 'completed',
    lead_agency: 'National Centre for Polar and Ocean Research (NCPOR)',
    stations: ['Himadri Research Station'],
    created_at: new Date('2025-06-01T00:00:00Z').toISOString(),
    demo: true
  },
  {
    id: 'exp_so_24',
    title: 'Southern Ocean Marine Biogeochemistry & Carbon Sink Cruise',
    code: 'EXP-SO-24',
    description: 'Oceanographic transect investigating high-latitude carbon export fluxes and micronutrient limitations between Cape Town and Prydz Bay.',
    region: 'Southern Ocean',
    start_date: '2024-12-05',
    end_date: '2025-02-18',
    status: 'completed',
    lead_agency: 'National Centre for Polar and Ocean Research (NCPOR)',
    stations: ['ORV Sagar Kanya'],
    created_at: new Date('2024-12-05T00:00:00Z').toISOString(),
    demo: true
  }
];

export const DEMO_LOCATIONS: Location[] = [
  {
    id: 'loc_bharati',
    name: 'Bharati Research Station',
    latitude: -69.4089,
    longitude: 76.1872,
    region: 'Antarctica',
    station: 'Bharati',
    elevation_m: 35.0,
    source: 'NCPOR Polar Registry',
    confidence: 1.0
  },
  {
    id: 'loc_maitri',
    name: 'Maitri Research Station',
    latitude: -70.7667,
    longitude: 11.7333,
    region: 'Antarctica',
    station: 'Maitri',
    elevation_m: 117.0,
    source: 'NCPOR Polar Registry',
    confidence: 1.0
  },
  {
    id: 'loc_himadri',
    name: 'Himadri Research Station',
    latitude: 78.9236,
    longitude: 11.9225,
    region: 'Arctic',
    station: 'Himadri',
    elevation_m: 15.0,
    source: 'NCPOR Polar Registry',
    confidence: 1.0
  },
  {
    id: 'loc_larsemann',
    name: 'Larsemann Hills Coastal Oasis',
    latitude: -69.4000,
    longitude: 76.2000,
    region: 'Antarctica',
    station: 'Bharati',
    elevation_m: 42.0,
    source: 'NCPOR Polar Registry',
    confidence: 0.98
  },
  {
    id: 'loc_prydz_bay',
    name: 'Prydz Bay Continental Shelf',
    latitude: -68.8000,
    longitude: 75.5000,
    region: 'Southern Ocean',
    station: 'Bharati Offing',
    elevation_m: -450.0,
    source: 'NCPOR Polar Registry',
    confidence: 0.95
  }
];

export const DEMO_DOCUMENTS: Document[] = [
  {
    id: 'doc_exp45_report',
    filename: 'report_expedition_45_final.pdf',
    storage_path: 'research-documents/report_expedition_45_final.pdf',
    mime_type: 'application/pdf',
    size_bytes: 2480000,
    document_type: 'expedition_report',
    processing_status: 'completed',
    page_count: 84,
    metadata_json: {
      title: 'Scientific Report of the 45th Indian Scientific Expedition to Antarctica',
      author: 'NCPOR Expedition Directorate',
      year: 2026,
      expedition_code: 'EXP-45-ANT'
    },
    created_at: new Date('2026-02-28T00:00:00Z').toISOString()
  },
  {
    id: 'doc_field_notes',
    filename: 'field_notes_glaciology_larsemann.docx',
    storage_path: 'research-documents/field_notes_glaciology_larsemann.docx',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size_bytes: 640000,
    document_type: 'field_notes',
    processing_status: 'completed',
    page_count: 14,
    metadata_json: {
      title: 'In-situ Glaciology Field Diary & Core Log',
      author: 'Dr. Rajesh Sharma'
    },
    created_at: new Date('2026-01-16T00:00:00Z').toISOString()
  },
  {
    id: 'doc_atmos_log',
    filename: 'atmospheric_sampling_log_maitri.pdf',
    storage_path: 'research-documents/atmospheric_sampling_log_maitri.pdf',
    mime_type: 'application/pdf',
    size_bytes: 1850000,
    document_type: 'scientific_paper',
    processing_status: 'completed',
    page_count: 28,
    metadata_json: {
      title: 'Maitri Atmospheric Aerosol and Trace Gas Records',
      author: 'Dr. Vikram Patel'
    },
    created_at: new Date('2026-02-10T00:00:00Z').toISOString()
  }
];

export const DEMO_DATASETS: Dataset[] = [
  {
    id: 'dts_ice_measurements',
    title: 'Larsemann Hills Fast-Ice Thickness & Density Profiles',
    filename: 'ice_measurements_larsemann.csv',
    file_path: 'datasets/ice_measurements_larsemann.csv',
    source_document_id: 'doc_exp45_report',
    row_count: 1420,
    column_count: 6,
    columns: [
      { name: 'timestamp', datatype: 'date' },
      { name: 'core_id', datatype: 'string' },
      { name: 'depth_m', datatype: 'numeric', unit: 'm' },
      { name: 'ice_thickness_m', datatype: 'numeric', unit: 'm' },
      { name: 'density_kg_m3', datatype: 'numeric', unit: 'kg/m³' },
      { name: 'temp_c', datatype: 'numeric', unit: '°C' }
    ],
    preview_data: [
      { timestamp: '2026-01-14T06:00:00Z', core_id: 'IC-45-01', depth_m: 0.5, ice_thickness_m: 1.82, density_kg_m3: 912, temp_c: -12.4 },
      { timestamp: '2026-01-14T06:15:00Z', core_id: 'IC-45-02', depth_m: 1.0, ice_thickness_m: 1.80, density_kg_m3: 914, temp_c: -13.1 },
      { timestamp: '2026-01-14T06:30:00Z', core_id: 'IC-45-42', depth_m: 21.0, ice_thickness_m: 1.80, density_kg_m3: 918, temp_c: -14.8 },
      { timestamp: '2026-01-14T06:45:00Z', core_id: 'IC-45-43', depth_m: 22.5, ice_thickness_m: 1.79, density_kg_m3: 919, temp_c: -14.9 }
    ],
    processing_status: 'completed',
    region: 'Antarctica',
    expedition_id: 'exp_45_ant',
    created_at: new Date('2026-01-15T00:00:00Z').toISOString()
  },
  {
    id: 'dts_prydz_ctd',
    title: 'Prydz Bay Continental Shelf CTD Hydrography',
    filename: 'prydz_bay_hydrography_ctd.csv',
    file_path: 'datasets/prydz_bay_hydrography_ctd.csv',
    source_document_id: 'doc_exp45_report',
    row_count: 850,
    column_count: 5,
    columns: [
      { name: 'cast_id', datatype: 'string' },
      { name: 'depth_m', datatype: 'numeric', unit: 'm' },
      { name: 'temp_c', datatype: 'numeric', unit: '°C' },
      { name: 'salinity_psu', datatype: 'numeric', unit: 'PSU' },
      { name: 'dissolved_o2_umol_kg', datatype: 'numeric', unit: 'µmol/kg' }
    ],
    preview_data: [
      { cast_id: 'CTD-01', depth_m: 10, temp_c: -1.2, salinity_psu: 34.1, dissolved_o2_umol_kg: 320 },
      { cast_id: 'CTD-01', depth_m: 150, temp_c: 0.42, salinity_psu: 34.62, dissolved_o2_umol_kg: 245 },
      { cast_id: 'CTD-02', depth_m: 300, temp_c: 0.28, salinity_psu: 34.68, dissolved_o2_umol_kg: 232 }
    ],
    processing_status: 'completed',
    region: 'Antarctica',
    expedition_id: 'exp_45_ant',
    created_at: new Date('2026-01-22T00:00:00Z').toISOString()
  }
];

export const DEMO_OBSERVATIONS: Observation[] = [
  {
    id: 'obs_ice_thickness',
    expedition_id: 'exp_45_ant',
    expedition_title: '45th Indian Scientific Expedition to Antarctica',
    title: 'Surface ice measurement recorded at 1.8 m along Larsemann fast-ice line',
    description: 'High-precision radar sounding and manual ice core drilling confirmed a consistent fast-ice thickness of 1.8 meters across the coastal boundary of Bharati Station, indicating stable early-season ice formation with minimal basal melting.',
    research_domain: 'Glaciology',
    observed_at: '2026-01-14T06:30:00Z',
    location_id: 'loc_larsemann',
    location_name: 'Larsemann Hills Coastal Oasis',
    confidence: 0.94,
    confidence_level: 'HIGH',
    verification_status: 'VERIFIED',
    created_at: new Date('2026-01-14T08:00:00Z').toISOString(),
    demo: true
  },
  {
    id: 'obs_warm_layer',
    expedition_id: 'exp_45_ant',
    expedition_title: '45th Indian Scientific Expedition to Antarctica',
    title: 'Intrusion of Modified Circumpolar Deep Water (MCDW) at 150m depth in Prydz Bay',
    description: 'CTD profile measurements revealed a distinct subsurface thermal anomaly (+0.42°C) at 150m depth, representing warm deep water penetrating the inner shelf trench toward the Amery Ice Shelf grounding line.',
    research_domain: 'Oceanography',
    observed_at: '2026-01-20T14:15:00Z',
    location_id: 'loc_prydz_bay',
    location_name: 'Prydz Bay Continental Shelf',
    confidence: 0.91,
    confidence_level: 'HIGH',
    verification_status: 'VERIFIED',
    created_at: new Date('2026-01-20T16:00:00Z').toISOString(),
    demo: true
  },
  {
    id: 'obs_black_carbon',
    expedition_id: 'exp_45_ant',
    expedition_title: '45th Indian Scientific Expedition to Antarctica',
    title: 'Black carbon aerosol concentration surge during episodic katabatic drainage',
    description: 'Aethalometer measurements at Maitri Station detected peak black carbon levels of 82 ng/m³ during a 48-hour high-velocity katabatic wind event originating from the polar plateau.',
    research_domain: 'Atmospheric Sciences',
    observed_at: '2026-01-28T09:45:00Z',
    location_id: 'loc_maitri',
    location_name: 'Maitri Research Station',
    confidence: 0.88,
    confidence_level: 'HIGH',
    verification_status: 'NEEDS_REVIEW',
    created_at: new Date('2026-01-28T12:00:00Z').toISOString(),
    demo: true
  },
  {
    id: 'obs_microbial_cryo',
    expedition_id: 'exp_45_ant',
    expedition_title: '45th Indian Scientific Expedition to Antarctica',
    title: 'Endolithic cyanobacterial dominance in Schirmacher Oasis glacial cryoconite holes',
    description: 'Microscopic and preliminary sequencing showed cyanobacterial mats dominated by Phormidium species surviving under sub-zero temperatures inside water-filled sediment holes on the continental glacier surface.',
    research_domain: 'Biology & Ecology',
    observed_at: '2026-02-04T11:00:00Z',
    location_id: 'loc_maitri',
    location_name: 'Maitri / Schirmacher Oasis',
    confidence: 0.86,
    confidence_level: 'HIGH',
    verification_status: 'VERIFIED',
    created_at: new Date('2026-02-04T13:30:00Z').toISOString(),
    demo: true
  },
  {
    id: 'obs_magnetic_pulsation',
    expedition_id: 'exp_45_ant',
    expedition_title: '45th Indian Scientific Expedition to Antarctica',
    title: 'Pc5 geomagnetic field pulsations recorded during solar wind compression',
    description: 'Fluxgate magnetometer arrays at Bharati recorded sustained Pc5 band pulsations with 150-second periods correlating directly with ACE spacecraft solar wind pressure increases.',
    research_domain: 'Geology & Geophysics',
    observed_at: '2026-02-12T03:20:00Z',
    location_id: 'loc_bharati',
    location_name: 'Bharati Research Station',
    confidence: 0.92,
    confidence_level: 'HIGH',
    verification_status: 'VERIFIED',
    created_at: new Date('2026-02-12T05:00:00Z').toISOString(),
    demo: true
  },
  {
    id: 'obs_arctic_snowpack',
    expedition_id: 'exp_arctic_25',
    expedition_title: 'Indian Arctic Scientific Campaign — Kongsfjorden',
    title: 'Early seasonal melt onset of seasonal snowpack at Kongsfjorden',
    description: 'Automated weather station and radiometric albedo sensors indicated snowmelt onset occurred 9 days ahead of the decadal average, driving surface albedo down to 0.54.',
    research_domain: 'Cryosphere Dynamics',
    observed_at: '2025-06-18T12:00:00Z',
    location_id: 'loc_himadri',
    location_name: 'Himadri Research Station',
    confidence: 0.89,
    confidence_level: 'HIGH',
    verification_status: 'VERIFIED',
    created_at: new Date('2025-06-18T14:00:00Z').toISOString(),
    demo: true
  }
];

export const DEMO_MEASUREMENTS: Measurement[] = [
  {
    id: 'msr_ice_depth',
    observation_id: 'obs_ice_thickness',
    variable: 'ice_thickness',
    value: 1.80,
    unit: 'm',
    timestamp: '2026-01-14T06:30:00Z',
    source_dataset_id: 'dts_ice_measurements',
    source_dataset_name: 'ice_measurements_larsemann.csv',
    source_row: 42,
    confidence: 0.98
  },
  {
    id: 'msr_ice_temp',
    observation_id: 'obs_ice_thickness',
    variable: 'ice_temperature',
    value: -14.8,
    unit: '°C',
    timestamp: '2026-01-14T06:30:00Z',
    source_dataset_id: 'dts_ice_measurements',
    source_dataset_name: 'ice_measurements_larsemann.csv',
    source_row: 42,
    confidence: 0.96
  },
  {
    id: 'msr_ocean_temp',
    observation_id: 'obs_warm_layer',
    variable: 'water_temperature',
    value: 0.42,
    unit: '°C',
    timestamp: '2026-01-20T14:15:00Z',
    source_dataset_id: 'dts_prydz_ctd',
    source_dataset_name: 'prydz_bay_hydrography_ctd.csv',
    source_row: 150,
    confidence: 0.94
  },
  {
    id: 'msr_salinity',
    observation_id: 'obs_warm_layer',
    variable: 'salinity',
    value: 34.62,
    unit: 'PSU',
    timestamp: '2026-01-20T14:15:00Z',
    source_dataset_id: 'dts_prydz_ctd',
    source_dataset_name: 'prydz_bay_hydrography_ctd.csv',
    source_row: 150,
    confidence: 0.95
  }
];

export const DEMO_MEDIA: MediaAsset[] = [
  {
    id: 'med_img_larsemann',
    filename: 'IMG_2041.jpg',
    storage_path: 'images/IMG_2041.jpg',
    type: 'image',
    thumbnail_path: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    expedition_id: 'exp_45_ant',
    location_id: 'loc_larsemann',
    location_name: 'Larsemann Hills Coastal Oasis',
    capture_date: '2026-01-14T07:15:00Z',
    metadata_json: {
      camera_model: 'Nikon Z8',
      lens: '24-70mm f/2.8',
      gps: { latitude: -69.4089, longitude: 76.1872, altitude: 35.2 },
      exif: { ISO: 100, fStop: 'f/8.0', shutter: '1/1000s' }
    },
    ai_analysis_json: {
      caption: 'Fast-ice sheet surface sampling site with drill rig near Bharati Station offing with tabular iceberg background',
      detected_entities: ['fast-ice', 'iceberg', 'sampling core', 'research station'],
      confidence: 0.97,
      is_authoritative_gps: true
    },
    processing_status: 'completed',
    created_at: new Date('2026-01-14T08:30:00Z').toISOString()
  },
  {
    id: 'med_vid_interview',
    filename: 'scientist_interview.mp4',
    storage_path: 'videos/scientist_interview.mp4',
    type: 'video',
    thumbnail_path: 'https://images.unsplash.com/photo-1527066579998-dbbae57f45ce?auto=format&fit=crop&w=800&q=80',
    expedition_id: 'exp_45_ant',
    location_id: 'loc_bharati',
    location_name: 'Bharati Research Station',
    capture_date: '2026-01-16T10:00:00Z',
    duration_seconds: 1245.0,
    metadata_json: {
      resolution: '3840x2160',
      fps: 30,
      codec: 'h264'
    },
    ai_analysis_json: {
      caption: 'Field interview with Expedition Glaciologist Dr. Rajesh Sharma explaining sea-ice cores and fast-ice thickness verification',
      detected_entities: ['scientist', 'ice core', 'laboratory bench', 'Bharati'],
      confidence: 0.95
    },
    transcript: {
      segments: [
        { start: 134, end: 178, text: 'We are standing on the fast-ice margin approximately two kilometers northeast of Bharati Station.', topic: 'Introduction' },
        { start: 343, end: 410, text: 'Our radar soundings along the transect showed consistent density profiles with no internal fracturing.', topic: 'Radar transect' },
        { start: 522, end: 630, text: 'Ice sampling began early morning using the electromechanical corer at Station Mark 4.', topic: 'Ice sampling' },
        { start: 758, end: 792, text: 'When we extracted Core 42, the manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick.', topic: 'Observation Verification' },
        { start: 847, end: 920, text: 'This confirms stability against wave action from Prydz Bay for the remaining summer operations.', topic: 'Implications' }
      ],
      full_text: 'We are standing on the fast-ice margin northeast of Bharati. Radar soundings showed consistent density. Core 42 manual caliper and thermistor confirmed the ice sheet stood at exactly 1.8 meters thick.'
    },
    processing_status: 'completed',
    created_at: new Date('2026-01-16T12:00:00Z').toISOString()
  },
  {
    id: 'med_img_ctd_deployment',
    filename: 'IMG_2088_ctd_winch.jpg',
    storage_path: 'images/IMG_2088_ctd_winch.jpg',
    type: 'image',
    thumbnail_path: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    expedition_id: 'exp_45_ant',
    location_id: 'loc_prydz_bay',
    location_name: 'Prydz Bay Continental Shelf',
    capture_date: '2026-01-20T13:40:00Z',
    metadata_json: {
      camera_model: 'Sony A7R V',
      gps: { latitude: -68.8000, longitude: 75.5000 }
    },
    ai_analysis_json: {
      caption: 'CTD rosette sensor deployment over the starboard gantry into Prydz Bay',
      detected_entities: ['CTD rosette', 'winch cable', 'sea surface'],
      confidence: 0.94
    },
    processing_status: 'completed',
    created_at: new Date('2026-01-20T14:00:00Z').toISOString()
  }
];

// ===================================================
// EVIDENCE LINKS (MANDATORY DEMO CHAIN)
// ===================================================
export const DEMO_EVIDENCE_LINKS: EvidenceLink[] = [
  {
    id: 'evi_obs1_report',
    knowledge_type: 'observation',
    knowledge_id: 'obs_ice_thickness',
    source_type: 'pdf',
    source_id: 'doc_exp45_report',
    source_title: 'report_expedition_45_final.pdf',
    page_number: 17,
    excerpt: 'Section 3.2.1 Coastal Fast-Ice Monitoring: In-situ mechanical core extraction at station perimeter point IC-45-42 yielded an uncompressed sea-ice thickness of 1.80 m (±0.02 m), validating airborne EM survey profiles.',
    media_url: 'research-documents/report_expedition_45_final.pdf',
    confidence: 0.96,
    verification_status: 'VERIFIED',
    created_at: new Date('2026-01-14T09:00:00Z').toISOString()
  },
  {
    id: 'evi_obs1_dataset',
    knowledge_type: 'observation',
    knowledge_id: 'obs_ice_thickness',
    source_type: 'dataset',
    source_id: 'dts_ice_measurements',
    source_title: 'ice_measurements_larsemann.csv',
    row_number: 42,
    excerpt: 'Row 42: core_id=IC-45-42, depth_m=21.0, ice_thickness_m=1.80, density_kg_m3=918, temp_c=-14.8',
    media_url: 'datasets/ice_measurements_larsemann.csv',
    confidence: 0.98,
    verification_status: 'VERIFIED',
    created_at: new Date('2026-01-14T09:00:00Z').toISOString()
  },
  {
    id: 'evi_obs1_video',
    knowledge_type: 'observation',
    knowledge_id: 'obs_ice_thickness',
    source_type: 'video',
    source_id: 'med_vid_interview',
    source_title: 'scientist_interview.mp4',
    timestamp_start: 758.0,
    timestamp_end: 778.0,
    excerpt: 'When we extracted Core 42, the manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick.',
    media_url: 'videos/scientist_interview.mp4',
    confidence: 0.94,
    verification_status: 'VERIFIED',
    created_at: new Date('2026-01-16T12:00:00Z').toISOString()
  },
  {
    id: 'evi_obs1_image',
    knowledge_type: 'observation',
    knowledge_id: 'obs_ice_thickness',
    source_type: 'image',
    source_id: 'med_img_larsemann',
    source_title: 'IMG_2041.jpg',
    excerpt: 'EXIF GPS -69.4089°S, 76.1872°E at 2026-01-14T07:15:00Z. Visual identification confirms fast-ice sheet drilling site with Larsemann iceberg backdrop.',
    media_url: 'images/IMG_2041.jpg',
    confidence: 0.97,
    verification_status: 'VERIFIED',
    created_at: new Date('2026-01-14T08:30:00Z').toISOString()
  },
  {
    id: 'evi_obs2_report',
    knowledge_type: 'observation',
    knowledge_id: 'obs_warm_layer',
    source_type: 'pdf',
    source_id: 'doc_exp45_report',
    source_title: 'report_expedition_45_final.pdf',
    page_number: 34,
    excerpt: 'Section 4.1.3 Continental Shelf Water Structure: CTD station cast 01 captured an inverted thermocline showing +0.42°C warm water at 150 m depth, indicative of modified Circumpolar Deep Water intruding across the sill.',
    media_url: 'research-documents/report_expedition_45_final.pdf',
    confidence: 0.95,
    verification_status: 'VERIFIED',
    created_at: new Date('2026-01-20T17:00:00Z').toISOString()
  },
  {
    id: 'evi_obs2_dataset',
    knowledge_type: 'observation',
    knowledge_id: 'obs_warm_layer',
    source_type: 'dataset',
    source_id: 'dts_prydz_ctd',
    source_title: 'prydz_bay_hydrography_ctd.csv',
    row_number: 150,
    excerpt: 'Row 150: cast_id=CTD-01, depth_m=150, temp_c=0.42, salinity_psu=34.62, dissolved_o2_umol_kg=245',
    media_url: 'datasets/prydz_bay_hydrography_ctd.csv',
    confidence: 0.97,
    verification_status: 'VERIFIED',
    created_at: new Date('2026-01-20T17:00:00Z').toISOString()
  }
];

export const DEMO_RELATIONSHIPS: KnowledgeRelationship[] = [
  {
    id: 'rel_1',
    source_entity_type: 'expedition',
    source_entity_id: 'exp_45_ant',
    target_entity_type: 'location',
    target_entity_id: 'loc_bharati',
    relationship_type: 'OBSERVED_AT',
    label: 'Operating Station',
    confidence: 1.0,
    status: 'verified',
    created_at: new Date('2025-11-15T00:00:00Z').toISOString()
  },
  {
    id: 'rel_2',
    source_entity_type: 'expedition',
    source_entity_id: 'exp_45_ant',
    target_entity_type: 'location',
    target_entity_id: 'loc_maitri',
    relationship_type: 'OBSERVED_AT',
    label: 'Operating Station',
    confidence: 1.0,
    status: 'verified',
    created_at: new Date('2025-11-15T00:00:00Z').toISOString()
  },
  {
    id: 'rel_3',
    source_entity_type: 'expedition',
    source_entity_id: 'exp_45_ant',
    target_entity_type: 'observation',
    target_entity_id: 'obs_ice_thickness',
    relationship_type: 'PART_OF_EXPEDITION',
    label: 'Primary Observation',
    confidence: 0.98,
    status: 'verified',
    created_at: new Date('2026-01-14T00:00:00Z').toISOString()
  },
  {
    id: 'rel_4',
    source_entity_type: 'observation',
    source_entity_id: 'obs_ice_thickness',
    target_entity_type: 'location',
    target_entity_id: 'loc_larsemann',
    relationship_type: 'OBSERVED_AT',
    label: 'Sampled Location',
    confidence: 0.97,
    status: 'verified',
    created_at: new Date('2026-01-14T00:00:00Z').toISOString()
  },
  {
    id: 'rel_5',
    source_entity_type: 'observation',
    source_entity_id: 'obs_ice_thickness',
    target_entity_type: 'dataset',
    target_entity_id: 'dts_ice_measurements',
    relationship_type: 'MEASURED_BY',
    label: 'Source Measurement',
    confidence: 0.99,
    status: 'verified',
    created_at: new Date('2026-01-14T00:00:00Z').toISOString()
  },
  {
    id: 'rel_6',
    source_entity_type: 'observation',
    source_entity_id: 'obs_ice_thickness',
    target_entity_type: 'report',
    target_entity_id: 'doc_exp45_report',
    relationship_type: 'RECORDED_IN',
    label: 'Expedition Report',
    confidence: 0.98,
    status: 'verified',
    created_at: new Date('2026-01-14T00:00:00Z').toISOString()
  },
  {
    id: 'rel_7',
    source_entity_type: 'observation',
    source_entity_id: 'obs_ice_thickness',
    target_entity_type: 'media',
    target_entity_id: 'med_vid_interview',
    relationship_type: 'DOCUMENTED_BY',
    label: 'Scientist Interview',
    confidence: 0.95,
    status: 'verified',
    created_at: new Date('2026-01-16T00:00:00Z').toISOString()
  },
  {
    id: 'rel_8',
    source_entity_type: 'observation',
    source_entity_id: 'obs_ice_thickness',
    target_entity_type: 'media',
    target_entity_id: 'med_img_larsemann',
    relationship_type: 'DOCUMENTED_BY',
    label: 'Field Photo',
    confidence: 0.98,
    status: 'verified',
    created_at: new Date('2026-01-14T00:00:00Z').toISOString()
  },
  {
    id: 'rel_9',
    source_entity_type: 'expedition',
    source_entity_id: 'exp_45_ant',
    target_entity_type: 'observation',
    target_entity_id: 'obs_warm_layer',
    relationship_type: 'PART_OF_EXPEDITION',
    label: 'Oceanic Anomaly',
    confidence: 0.96,
    status: 'verified',
    created_at: new Date('2026-01-20T00:00:00Z').toISOString()
  },
  {
    id: 'rel_10',
    source_entity_type: 'observation',
    source_entity_id: 'obs_warm_layer',
    target_entity_type: 'dataset',
    target_entity_id: 'dts_prydz_ctd',
    relationship_type: 'MEASURED_BY',
    label: 'CTD Profiler',
    confidence: 0.97,
    status: 'verified',
    created_at: new Date('2026-01-20T00:00:00Z').toISOString()
  }
];

export const DEMO_OUTREACH: GeneratedContent[] = [
  {
    id: 'out_student_ice',
    source_knowledge_ids: ['obs_ice_thickness'],
    content_type: 'student_explainer',
    audience: 'student',
    tone: 'accessible',
    title: 'How Indian Scientists Measure Sea Ice in Antarctica: The Story of Fast-Ice at Bharati',
    summary: 'An engaging student-friendly explanation of in-situ Antarctic sea ice thickness measurement at Bharati Station.',
    content: `Have you ever wondered how scientists know if Antarctic ice is strong enough to walk or land equipment on?

During the 45th Indian Scientific Expedition to Antarctica, glaciologists from the National Centre for Polar and Ocean Research (NCPOR) ventured onto the icy margins of Larsemann Hills near Bharati Research Station.

Using ice radar sounders and electromechanical core drills, researchers extracted ice cores to examine the layers formed over winter. Their measurements confirmed a uniform thickness of 1.8 meters across the coastal line.

Dr. Rajesh Sharma, lead glaciologist, highlighted that this 1.8-meter sheet provides critical seasonal stability for scientific equipment, preventing premature break-up from ocean swells entering Prydz Bay.`,
    citations: [
      {
        citation_label: '[1]',
        knowledge_id: 'obs_ice_thickness',
        source_title: 'report_expedition_45_final.pdf',
        source_type: 'pdf',
        page_or_row_or_time: 'Page 17',
        excerpt: 'In-situ mechanical core extraction yielded uncompressed sea-ice thickness of 1.80 m.'
      },
      {
        citation_label: '[2]',
        knowledge_id: 'obs_ice_thickness',
        source_title: 'ice_measurements_larsemann.csv',
        source_type: 'dataset',
        page_or_row_or_time: 'Row 42',
        excerpt: 'IC-45-42: depth_m=21.0, ice_thickness_m=1.80 m, temp_c=-14.8°C.'
      },
      {
        citation_label: '[3]',
        knowledge_id: 'obs_ice_thickness',
        source_title: 'scientist_interview.mp4',
        source_type: 'video',
        page_or_row_or_time: '12:43',
        excerpt: 'Manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick.'
      }
    ],
    status: 'published',
    created_at: new Date('2026-02-01T00:00:00Z').toISOString()
  }
];

export const DEMO_JOBS: ProcessingJob[] = [
  {
    id: 'job_demo_pkg',
    filename: 'expedition_45_research_package.zip',
    file_type: 'application/zip',
    size_bytes: 34500000,
    status: 'completed',
    current_stage: 'completed',
    progress: 100,
    stages: [
      { name: 'uploaded', label: 'Files received & validated', status: 'completed', progress: 100, detail: '5 source files received (PDF, CSV, DOCX, JPG, MP4)' },
      { name: 'parsed', label: 'Deterministic document parsing', status: 'completed', progress: 100, detail: '84 PDF pages, 1420 CSV rows, EXIF and audio tracks extracted' },
      { name: 'extracted', label: 'Metadata & entity extraction', status: 'completed', progress: 100, detail: 'Identified Bharati Station, Larsemann Hills, Dr. Rajesh Sharma' },
      { name: 'structured', label: 'Observation structuring', status: 'completed', progress: 100, detail: '12 observations mapped with Zod schema verification' },
      { name: 'linked', label: 'Cross-file evidence linking', status: 'completed', progress: 100, detail: 'Multi-provenance traces established (Report p.17 -> CSV row 42 -> Video 12:43)' },
      { name: 'indexed', label: 'Knowledge indexing', status: 'completed', progress: 100, detail: 'Graph nodes connected, indexed for source-grounded queries' }
    ],
    result_summary: {
      entities_detected: 18,
      observations_found: 12,
      locations_matched: 4,
      evidence_links_count: 10
    },
    started_at: new Date('2026-01-16T10:00:00Z').toISOString(),
    completed_at: new Date('2026-01-16T10:02:15Z').toISOString()
  }
];
