
export interface Emotion {
  label: string;
  confidence: number;
}

export interface FaceDetection {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] scaled 0-1000
  emotions: Emotion[];
  summary: string;
  apparentAge?: string;
  genderEstimate?: string;
}

export interface AnalysisResponse {
  faces: FaceDetection[];
  overallAtmosphere: string;
}

export interface UploadedImage {
  file: File;
  preview: string;
}
