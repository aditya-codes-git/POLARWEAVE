-- ===================================================
-- POLARWEAVE — DEMO DATA SEEDING
-- Structured realistic scientific records for SIH26063
-- All records are tagged with demo=true or marked as demonstration
-- ===================================================

-- 1. EXPEDITIONS
INSERT INTO public.expeditions (id, title, code, description, region, start_date, end_date, status, lead_agency, stations, demo)
VALUES
('exp_45_ant', '45th Indian Scientific Expedition to Antarctica', 'EXP-45-ANT',
 'Comprehensive multidisciplinary polar research monitoring cryospheric change, glaciological dynamics, and paleoclimate records in East Antarctica.',
 'Antarctica', '2025-11-15', '2026-03-25', 'completed', 'National Centre for Polar and Ocean Research (NCPOR)',
 ARRAY['Bharati Research Station', 'Maitri Research Station'], true),

('exp_arctic_25', 'Indian Arctic Scientific Campaign — Kongsfjorden', 'EXP-ARCTIC-25',
 'Long-term monitoring of fjord dynamics, atmospheric trace gases, and marine ecosystem responses to warming at Ny-Ålesund, Svalbard.',
 'Arctic', '2025-06-01', '2025-09-30', 'completed', 'National Centre for Polar and Ocean Research (NCPOR)',
 ARRAY['Himadri Research Station'], true),

('exp_so_24', 'Southern Ocean Marine Biogeochemistry & Carbon Sink Cruise', 'EXP-SO-24',
 'High-latitude oceanographic cruise exploring carbon export fluxes, micronutrient limitations, and krill biomass distributions across the Polar Front.',
 'Southern Ocean', '2024-12-05', '2025-02-18', 'completed', 'National Centre for Polar and Ocean Research (NCPOR)',
 ARRAY['ORV Sagar Kanya'], true)
ON CONFLICT (id) DO NOTHING;

-- 2. LOCATIONS
INSERT INTO public.locations (id, name, latitude, longitude, region, station, elevation_m, source, confidence)
VALUES
('loc_bharati', 'Bharati Research Station', -69.4089, 76.1872, 'Antarctica', 'Bharati', 35.0, 'NCPOR Polar Registry', 1.0),
('loc_maitri', 'Maitri Research Station', -70.7667, 11.7333, 'Antarctica', 'Maitri', 117.0, 'NCPOR Polar Registry', 1.0),
('loc_himadri', 'Himadri Research Station', 78.9236, 11.9225, 'Arctic', 'Himadri', 15.0, 'NCPOR Polar Registry', 1.0),
('loc_larsemann', 'Larsemann Hills Coastal Oasis', -69.4000, 76.2000, 'Antarctica', 'Bharati', 42.0, 'NCPOR Polar Registry', 0.98),
('loc_prydz_bay', 'Prydz Bay Continental Shelf', -68.8000, 75.5000, 'Southern Ocean', 'Bharati Offing', -450.0, 'NCPOR Polar Registry', 0.95),
('loc_schirmacher', 'Schirmacher Oasis Glacial Margin', -70.7500, 11.6667, 'Antarctica', 'Maitri', 180.0, 'NCPOR Polar Registry', 0.98),
('loc_kongsfjorden', 'Kongsfjorden Fjord Glacier Basin', 79.0167, 12.0000, 'Arctic', 'Himadri', 0.0, 'NCPOR Polar Registry', 0.99)
ON CONFLICT (id) DO NOTHING;

-- 3. RESEARCHERS
INSERT INTO public.researchers (id, full_name, institution, designation, domain, email, expeditions)
VALUES
('res_sharma', 'Dr. Rajesh Sharma', 'National Centre for Polar and Ocean Research (NCPOR)', 'Scientist-G & Expedition Leader', 'Glaciology', 'rsharma@ncpor.res.in', ARRAY['exp_45_ant']),
('res_menon', 'Dr. Ananya Menon', 'National Centre for Polar and Ocean Research (NCPOR)', 'Senior Scientist', 'Physical Oceanography', 'amenon@ncpor.res.in', ARRAY['exp_45_ant', 'exp_so_24']),
('res_patel', 'Dr. Vikram Patel', 'Indian Institute of Geomagnetism (IIG)', 'Principal Scientist', 'Atmospheric Physics', 'vpatel@iig.res.in', ARRAY['exp_45_ant', 'exp_arctic_25']),
('res_bose', 'Dr. Sunita Bose', 'Birbal Sahni Institute of Palaeosciences', 'Scientist-E', 'Palaeoclimate & Cryosphere', 'sbose@bsip.res.in', ARRAY['exp_45_ant'])
ON CONFLICT (id) DO NOTHING;

-- 4. DOCUMENTS
INSERT INTO public.documents (id, filename, storage_path, mime_type, size_bytes, document_type, processing_status, page_count, metadata_json)
VALUES
('doc_exp45_report', 'report_expedition_45_final.pdf', 'research-documents/report_expedition_45_final.pdf', 'application/pdf', 2480000, 'expedition_report', 'completed', 84, '{"title": "Scientific Report of 45th Indian Antarctic Expedition", "author": "NCPOR Expedition Directorate", "year": 2026}'::jsonb),
('doc_field_notes', 'field_notes_glaciology_larsemann.docx', 'research-documents/field_notes_glaciology_larsemann.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 640000, 'field_notes', 'completed', 14, '{"title": "In-situ Glaciology Field Diary", "author": "Dr. Rajesh Sharma"}'::jsonb),
('doc_atmos_log', 'atmospheric_sampling_log_maitri.pdf', 'research-documents/atmospheric_sampling_log_maitri.pdf', 'application/pdf', 1850000, 'scientific_paper', 'completed', 28, '{"title": "Maitri Atmospheric Observational Records", "author": "Dr. Vikram Patel"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. DATASETS
INSERT INTO public.datasets (id, title, filename, file_path, source_document_id, row_count, column_count, schema_json, preview_data, processing_status, region, expedition_id)
VALUES
('dts_ice_measurements', 'ice_measurements_larsemann.csv', 'ice_measurements_larsemann.csv', 'doc_exp45_report', 1420, 6,
 '[{"name": "timestamp", "datatype": "date"}, {"name": "core_id", "datatype": "string"}, {"name": "depth_m", "datatype": "numeric", "unit": "m"}, {"name": "ice_thickness_m", "datatype": "numeric", "unit": "m"}, {"name": "density_kg_m3", "datatype": "numeric", "unit": "kg/m3"}, {"name": "temp_c", "datatype": "numeric", "unit": "°C"}]'::jsonb,
 '[{"core_id": "IC-45-01", "depth_m": 0.5, "ice_thickness_m": 1.82, "density_kg_m3": 912, "temp_c": -12.4}, {"core_id": "IC-45-02", "depth_m": 1.0, "ice_thickness_m": 1.80, "density_kg_m3": 914, "temp_c": -13.1}, {"core_id": "IC-45-42", "depth_m": 21.0, "ice_thickness_m": 1.80, "density_kg_m3": 918, "temp_c": -14.8}]'::jsonb,
 'completed', 'Antarctica', 'exp_45_ant'),

('dts_prydz_ctd', 'prydz_bay_hydrography_ctd.csv', 'prydz_bay_hydrography_ctd.csv', 'doc_exp45_report', 850, 5,
 '[{"name": "cast_id", "datatype": "string"}, {"name": "depth_m", "datatype": "numeric"}, {"name": "temp_c", "datatype": "numeric"}, {"name": "salinity_psu", "datatype": "numeric"}, {"name": "dissolved_o2_umol_kg", "datatype": "numeric"}]'::jsonb,
 '[{"cast_id": "CTD-01", "depth_m": 10, "temp_c": -1.2, "salinity_psu": 34.1, "dissolved_o2_umol_kg": 320}, {"cast_id": "CTD-01", "depth_m": 150, "temp_c": 0.4, "salinity_psu": 34.6, "dissolved_o2_umol_kg": 245}]'::jsonb,
 'completed', 'Antarctica', 'exp_45_ant')
ON CONFLICT (id) DO NOTHING;

-- 6. OBSERVATIONS (The Central Knowledge Records)
INSERT INTO public.observations (id, expedition_id, title, description, research_domain, observed_at, location_id, location_name, confidence, confidence_level, verification_status, demo)
VALUES
('obs_ice_thickness', 'exp_45_ant',
 'Surface ice measurement recorded at 1.8 m along Larsemann coastal fast-ice line',
 'High-precision radar sounding and manual ice core drilling confirmed a consistent fast-ice thickness of 1.8 meters across the coastal boundary of Bharati Station, indicating stable early-season ice formation with minimal basal melting.',
 'Glaciology', '2026-01-14T06:30:00Z', 'loc_larsemann', 'Larsemann Hills Coastal Oasis', 0.94, 'HIGH', 'VERIFIED', true),

('obs_warm_layer', 'exp_45_ant',
 'Intrusion of Modified Circumpolar Deep Water (MCDW) at 150m depth in Prydz Bay',
 'CTD profile measurements revealed a distinct subsurface thermal anomaly (+0.4°C) at 150m depth, representing warm deep water penetrating the inner shelf trench toward the Amery Ice Shelf grounding line.',
 'Oceanography', '2026-01-20T14:15:00Z', 'loc_prydz_bay', 'Prydz Bay Continental Shelf', 0.91, 'HIGH', 'VERIFIED', true),

('obs_black_carbon', 'exp_45_ant',
 'Black carbon aerosol concentration surge during episodic katabatic drainage',
 'Aethalometer measurements at Maitri Station detected peak black carbon levels of 82 ng/m³ during a 48-hour high-velocity katabatic wind event originating from the polar plateau.',
 'Atmospheric Sciences', '2026-01-28T09:45:00Z', 'loc_maitri', 'Maitri Research Station', 0.88, 'HIGH', 'NEEDS_REVIEW', true),

('obs_microbial_cryo', 'exp_45_ant',
 'Endolithic cyanobacterial dominance in Schirmacher Oasis glacial cryoconite holes',
 'Microscopic and preliminary sequencing showed cyanobacterial mats dominated by Phormidium species surviving under sub-zero temperatures inside water-filled sediment holes on the continental glacier surface.',
 'Biology & Ecology', '2026-02-04T11:00:00Z', 'loc_schirmacher', 'Schirmacher Oasis Glacial Margin', 0.86, 'HIGH', 'VERIFIED', true),

('obs_magnetic_pulsation', 'exp_45_ant',
 'Pc5 geomagnetic field pulsations recorded during solar wind compression',
 'Fluxgate magnetometer arrays at Bharati recorded sustained Pc5 band pulsations with 150-second periods correlating directly with ACE spacecraft solar wind pressure increases.',
 'Geology & Geophysics', '2026-02-12T03:20:00Z', 'loc_bharati', 'Bharati Research Station', 0.92, 'HIGH', 'VERIFIED', true),

('obs_arctic_snowpack', 'exp_arctic_25',
 'Early seasonal melt onset of seasonal snowpack at Kongsfjorden',
 'Automated weather station and radiometric albedo sensors indicated snowmelt onset occurred 9 days ahead of the decadal average, driving surface albedo down to 0.54.',
 'Cryosphere Dynamics', '2025-06-18T12:00:00Z', 'loc_kongsfjorden', 'Kongsfjorden Fjord Glacier Basin', 0.89, 'HIGH', 'VERIFIED', true)
ON CONFLICT (id) DO NOTHING;

-- 7. MEASUREMENTS
INSERT INTO public.measurements (id, observation_id, variable, value, unit, timestamp, source_dataset_id, source_row, confidence)
VALUES
('msr_ice_depth', 'obs_ice_thickness', 'ice_thickness', 1.80, 'm', '2026-01-14T06:30:00Z', 'dts_ice_measurements', 42, 0.98),
('msr_ice_temp', 'obs_ice_thickness', 'ice_temperature', -14.8, '°C', '2026-01-14T06:30:00Z', 'dts_ice_measurements', 42, 0.96),
('msr_ocean_temp', 'obs_warm_layer', 'water_temperature', 0.42, '°C', '2026-01-20T14:15:00Z', 'dts_prydz_ctd', 150, 0.94),
('msr_salinity', 'obs_warm_layer', 'salinity', 34.62, 'PSU', '2026-01-20T14:15:00Z', 'dts_prydz_ctd', 150, 0.95),
('msr_bc_aerosol', 'obs_black_carbon', 'black_carbon_concentration', 82.4, 'ng/m³', '2026-01-28T09:45:00Z', NULL, NULL, 0.89)
ON CONFLICT (id) DO NOTHING;

-- 8. MEDIA ASSETS
INSERT INTO public.media_assets (id, filename, storage_path, type, thumbnail_path, expedition_id, location_id, location_name, capture_date, metadata_json, ai_analysis_json, transcript, duration_seconds)
VALUES
('med_img_larsemann', 'IMG_2041.jpg', 'images/IMG_2041.jpg', 'image', 'thumbnails/IMG_2041_thumb.jpg',
 'exp_45_ant', 'loc_larsemann', 'Larsemann Hills Coastal Oasis', '2026-01-14T07:15:00Z',
 '{"camera_model": "Nikon Z8", "lens": "24-70mm f/2.8", "gps": {"latitude": -69.4089, "longitude": 76.1872, "altitude": 35.2}, "exif": {"ISO": 100, "fStop": "f/8.0", "shutter": "1/1000s"}}'::jsonb,
 '{"caption": "Fast-ice sheet surface sampling site with drill rig near Bharati Station offing with tabular iceberg background", "detected_entities": ["fast-ice", "iceberg", "sampling core", "research station"], "confidence": 0.97, "is_authoritative_gps": true}'::jsonb,
 '{}'::jsonb, NULL),

('med_vid_interview', 'scientist_interview.mp4', 'videos/scientist_interview.mp4', 'video', 'thumbnails/interview_thumb.jpg',
 'exp_45_ant', 'loc_bharati', 'Bharati Research Station', '2026-01-16T10:00:00Z',
 '{"resolution": "3840x2160", "fps": 30, "codec": "h264"}'::jsonb,
 '{"caption": "Field interview with Expedition Glaciologist Dr. Rajesh Sharma explaining sea-ice cores and fast-ice thickness verification", "detected_entities": ["scientist", "ice core", "laboratory bench"], "confidence": 0.95}'::jsonb,
 '{"segments": [
    {"start": 134, "end": 178, "text": "We are standing on the fast-ice margin approximately two kilometers northeast of Bharati Station.", "topic": "Introduction"},
    {"start": 343, "end": 410, "text": "Our radar soundings along the transect showed consistent density profiles with no internal fracturing.", "topic": "Radar transect"},
    {"start": 522, "end": 630, "text": "Ice sampling began early morning using the electromechanical corer at Station Mark 4.", "topic": "Ice sampling"},
    {"start": 758, "end": 792, "text": "When we extracted Core 42, the manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick.", "topic": "Observation Verification"},
    {"start": 847, "end": 920, "text": "This confirms stability against wave action from Prydz Bay for the remaining summer operations.", "topic": "Implications"}
  ], "full_text": "We are standing on the fast-ice margin northeast of Bharati. Radar soundings showed consistent density. Core 42 manual caliper and thermistor confirmed the ice sheet stood at exactly 1.8 meters thick."}'::jsonb,
 1245.0),

('med_img_ctd_deployment', 'IMG_2088_ctd_winch.jpg', 'images/IMG_2088_ctd_winch.jpg', 'image', 'thumbnails/IMG_2088_thumb.jpg',
 'exp_45_ant', 'loc_prydz_bay', 'Prydz Bay Continental Shelf', '2026-01-20T13:40:00Z',
 '{"camera_model": "Sony A7R V", "gps": {"latitude": -68.8000, "longitude": 75.5000}}'::jsonb,
 '{"caption": "CTD rosette sensor deployment over the starboard gantry into Prydz Bay", "detected_entities": ["CTD rosette", "winch cable", "sea surface"], "confidence": 0.94}'::jsonb,
 '{}'::jsonb, NULL)
ON CONFLICT (id) DO NOTHING;

-- 9. THE WOW FEATURE: EVIDENCE LINKS (MANDATORY DEMO CHAIN)
INSERT INTO public.evidence_links (id, knowledge_type, knowledge_id, source_type, source_id, source_title, page_number, row_number, timestamp_start, timestamp_end, excerpt, media_url, confidence, verification_status)
VALUES
-- Evidence for Observation: Surface ice measurement recorded at 1.8m
('evi_obs1_report', 'observation', 'obs_ice_thickness', 'pdf', 'doc_exp45_report',
 'report_expedition_45_final.pdf', 17, NULL, NULL, NULL,
 'Section 3.2.1 Coastal Fast-Ice Monitoring: In-situ mechanical core extraction at station perimeter point IC-45-42 yielded an uncompressed sea-ice thickness of 1.80 m (±0.02 m), validating airborne EM survey profiles.',
 'research-documents/report_expedition_45_final.pdf', 0.96, 'VERIFIED'),

('evi_obs1_dataset', 'observation', 'obs_ice_thickness', 'dataset', 'dts_ice_measurements',
 'ice_measurements_larsemann.csv', NULL, 42, NULL, NULL,
 'Row 42: core_id=IC-45-42, depth_m=21.0, ice_thickness_m=1.80, density_kg_m3=918, temp_c=-14.8',
 'ice_measurements_larsemann.csv', 0.98, 'VERIFIED'),

('evi_obs1_video', 'observation', 'obs_ice_thickness', 'video', 'med_vid_interview',
 'scientist_interview.mp4', NULL, NULL, 758.0, 778.0,
 'When we extracted Core 42, the manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick.',
 'videos/scientist_interview.mp4', 0.94, 'VERIFIED'),

('evi_obs1_image', 'observation', 'obs_ice_thickness', 'image', 'med_img_larsemann',
 'IMG_2041.jpg', NULL, NULL, NULL, NULL,
 'EXIF GPS -69.4089°S, 76.1872°E at 2026-01-14T07:15:00Z. Visual identification confirms fast-ice sheet drilling site with Larsemann iceberg backdrop.',
 'images/IMG_2041.jpg', 0.97, 'VERIFIED'),

-- Evidence for Observation: Subsurface warming layer in Prydz Bay
('evi_obs2_report', 'observation', 'obs_warm_layer', 'pdf', 'doc_exp45_report',
 'report_expedition_45_final.pdf', 34, NULL, NULL, NULL,
 'Section 4.1.3 Continental Shelf Water Structure: CTD station cast 01 captured an inverted thermocline showing +0.42°C warm water at 150 m depth, indicative of modified Circumpolar Deep Water intruding across the sill.',
 'research-documents/report_expedition_45_final.pdf', 0.95, 'VERIFIED'),

('evi_obs2_dataset', 'observation', 'obs_warm_layer', 'dataset', 'dts_prydz_ctd',
 'prydz_bay_hydrography_ctd.csv', NULL, 150, NULL, NULL,
 'Row 150: cast_id=CTD-01, depth_m=150, temp_c=0.42, salinity_psu=34.62, dissolved_o2_umol_kg=245',
 'prydz_bay_hydrography_ctd.csv', 0.97, 'VERIFIED')
ON CONFLICT (id) DO NOTHING;

-- 10. KNOWLEDGE RELATIONSHIPS (Semantic Graph)
INSERT INTO public.knowledge_relationships (id, source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type, label, confidence, status)
VALUES
('rel_1', 'expedition', 'exp_45_ant', 'location', 'loc_bharati', 'OBSERVED_AT', 'Operating Station', 1.0, 'verified'),
('rel_2', 'expedition', 'exp_45_ant', 'location', 'loc_maitri', 'OBSERVED_AT', 'Operating Station', 1.0, 'verified'),
('rel_3', 'expedition', 'exp_45_ant', 'observation', 'obs_ice_thickness', 'PART_OF_EXPEDITION', 'Primary Observation', 0.98, 'verified'),
('rel_4', 'observation', 'obs_ice_thickness', 'location', 'loc_larsemann', 'OBSERVED_AT', 'Sampled Location', 0.97, 'verified'),
('rel_5', 'observation', 'obs_ice_thickness', 'dataset', 'dts_ice_measurements', 'MEASURED_BY', 'Source Measurement', 0.99, 'verified'),
('rel_6', 'observation', 'obs_ice_thickness', 'document', 'doc_exp45_report', 'RECORDED_IN', 'Expedition Report', 0.98, 'verified'),
('rel_7', 'observation', 'obs_ice_thickness', 'media', 'med_vid_interview', 'DOCUMENTED_BY', 'Scientist Interview', 0.95, 'verified'),
('rel_8', 'observation', 'obs_ice_thickness', 'media', 'med_img_larsemann', 'DOCUMENTED_BY', 'Field Photo', 0.98, 'verified'),
('rel_9', 'expedition', 'exp_45_ant', 'observation', 'obs_warm_layer', 'PART_OF_EXPEDITION', 'Oceanic Anomaly', 0.96, 'verified'),
('rel_10', 'observation', 'obs_warm_layer', 'dataset', 'dts_prydz_ctd', 'MEASURED_BY', 'CTD Profiler', 0.97, 'verified')
ON CONFLICT (id) DO NOTHING;

-- 11. GENERATED OUTREACH CONTENT (Locked citations)
INSERT INTO public.generated_content (id, source_knowledge_ids, content_type, audience, tone, title, content, summary, citations, status)
VALUES
('out_student_ice', ARRAY['obs_ice_thickness'], 'student_explainer', 'student', 'accessible',
 'How Indian Scientists Measure Sea Ice in Antarctica: The Story of Fast-Ice at Bharati',
 'Have you ever wondered how scientists know if Antarctic ice is strong enough to walk on?

During the 45th Indian Scientific Expedition to Antarctica, glaciologists from the National Centre for Polar and Ocean Research (NCPOR) ventured onto the icy margins of Larsemann Hills near Bharati Research Station.

Using ice radar sounders and electromechanical core drills, researchers extracted ice cores to examine the layers formed over winter. Their measurements confirmed a uniform thickness of 1.8 meters across the coastal line.

Dr. Rajesh Sharma, lead glaciologist, highlighted that this 1.8-meter sheet provides critical seasonal stability for scientific equipment, preventing premature break-up from ocean swells entering Prydz Bay.',
 'An engaging student-friendly explanation of in-situ Antarctic sea ice thickness measurement at Bharati Station.',
 '[
   {"citation_label": "[1]", "knowledge_id": "obs_ice_thickness", "source_title": "report_expedition_45_final.pdf", "source_type": "pdf", "page_or_row_or_time": "Page 17", "excerpt": "In-situ mechanical core extraction yielded uncompressed sea-ice thickness of 1.80 m."},
   {"citation_label": "[2]", "knowledge_id": "obs_ice_thickness", "source_title": "ice_measurements_larsemann.csv", "source_type": "dataset", "page_or_row_or_time": "Row 42", "excerpt": "IC-45-42: depth_m=21.0, ice_thickness_m=1.80 m, temp_c=-14.8°C."},
   {"citation_label": "[3]", "knowledge_id": "obs_ice_thickness", "source_title": "scientist_interview.mp4", "source_type": "video", "page_or_row_or_time": "12:43", "excerpt": "Manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick."}
 ]'::jsonb,
 'published')
ON CONFLICT (id) DO NOTHING;
