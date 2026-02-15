export interface TechnicalParams {
  focalLength: string;
  aperture: string;
  iso: string;
  shutterSpeed: string;
  cameraType: string;
}

export interface Subject {
  name: string;
  description: string;
  features: string;
  action: string;
  gesture: string;
  expression: string;
  position: string;
  scale_diameter: string;
}

export interface DetailedVisualAnalysis {
  visual_description: string;
  visual_anchors: string[];
  subjects: Subject[];
}

export interface PhotoAnalysis {
  title: string;
  keywords: string[];
  lens: string;
  atmosphere: string;
  angle: string;
  geometry: string;
  location: string;
  technicalParams: TechnicalParams;
  visual_detail: DetailedVisualAnalysis;
}

export enum AnalysisState {
  IDLE,
  ANALYZING,
  SUCCESS,
  ERROR,
}

export interface AnalysisItem {
  id: string;
  type: 'image' | 'video';
  mimeType: string;
  filename: string;
  preview: string;
  analysis: PhotoAnalysis | null;
  status: AnalysisState;
  error?: string;
}