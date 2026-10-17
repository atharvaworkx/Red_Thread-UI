export type InvestigationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'COMPLETED_WITH_WARNINGS' | 'FAILED';
export type ResearchMode = 'LOCAL_FALLBACK' | 'LOCAL_AI' | 'DEMO';
export type RunStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';

export type ClaimEvidenceStatus = 
  | 'SUPPORTED' 
  | 'SINGLE_SOURCE' 
  | 'DISPUTED' 
  | 'UNVERIFIED' 
  | 'INFERENCE';

export type EntityType = 
  | 'ORGANIZATION' 
  | 'PERSON' 
  | 'TECHNOLOGY' 
  | 'PRODUCT' 
  | 'EVENT' 
  | 'LOCATION';

export interface Source {
  id: string;
  citation_key: string;
  title: string;
  url: string;
  source_name: string;
  publication_date: string | null;
  retrieved_at: string;
  excerpt: string | null;
  content_hash: string;
  status: string;
  is_live: boolean;
}

export interface Claim {
  id: string;
  claim_text: string;
  evidence_status: ClaimEvidenceStatus;
  confidence_assessment: string | null;
  dispute_reason: string | null;
  created_at: string;
  sources: Source[];
  source_citation_keys: string[];
}

export interface Entity {
  id: string;
  name: string;
  entity_type: EntityType;
  description: string | null;
  created_at: string;
  source_citation_keys: string[];
}

export interface EntityRelationship {
  id: string;
  source_entity: string;
  source_entity_name: string;
  source_entity_type: EntityType;
  target_entity: string;
  target_entity_name: string;
  target_entity_type: EntityType;
  relation_type: string;
  description: string | null;
  evidence_source: string | null;
  evidence_citation_key: string | null;
  is_inference: boolean;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  event_date: string;
  title: string;
  description: string;
  source: string | null;
  source_citation_key: string | null;
  created_at: string;
}

export interface ResearchReport {
  id: string;
  topic_primer: string | null;
  executive_summary: string;
  key_findings: string; // JSON array of string statements
  supporting_evidence_synthesis: string;
  contradictions_and_disagreements: string | null;
  unresolved_questions: string | null;
  further_research_directions: string | null;
  generated_by_mode: ResearchMode;
  created_at: string;
  updated_at: string;
}

export interface ResearchRun {
  id: string;
  run_number: number;
  status: RunStatus;
  summary_of_changes: string | null;
  sources_found_count: number;
  claims_extracted_count: number;
  entities_discovered_count: number;
  mode_used: ResearchMode;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface InvestigationListItem {
  id: string;
  title: string;
  research_question: string;
  status: InvestigationStatus;
  mode: ResearchMode;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  error_message: string | null;
  sources_count: number;
  claims_count: number;
  entities_count: number;
  latest_run_number: number;
}

export interface InvestigationDetail {
  id: string;
  title: string;
  research_question: string;
  status: InvestigationStatus;
  mode: ResearchMode;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  error_message: string | null;
  sources: Source[];
  claims: Claim[];
  entities: Entity[];
  relationships: EntityRelationship[];
  timeline_events: TimelineEvent[];
  report: ResearchReport | null;
  runs: ResearchRun[];
}

export interface SystemHealth {
  status: 'HEALTHY' | 'UNHEALTHY';
  service: string;
  database: 'CONNECTED' | 'DISCONNECTED';
  ai_provider: {
    reachable: boolean;
    configured_model: string;
    model_installed: boolean;
    base_url: string;
  };
  investigation_count: number;
}
