import { ImageAnalysisItem } from '../types/emotion';

/**
 * Exports batch emotion analysis results to a clean RFC 4180 compliant CSV file
 */
export function exportResultsToCsv(items: ImageAnalysisItem[]): void {
  if (!items || items.length === 0) return;

  const headers = [
    'Image Filename',
    'Analysis Timestamp',
    'Status',
    'Face ID',
    'Detected Emotion',
    'Model Confidence (%)',
    'Happy (%)',
    'Sad (%)',
    'Angry (%)',
    'Fear (%)',
    'Surprise (%)',
    'Disgust (%)',
    'Neutral (%)',
    'Box X',
    'Box Y',
    'Box Width',
    'Box Height',
    'Processing Time (ms)'
  ];

  const rows: string[][] = [];

  items.forEach((item) => {
    if (item.results && item.results.length > 0) {
      item.results.forEach((face) => {
        rows.push([
          `"${item.filename.replace(/"/g, '""')}"`,
          `"${item.timestamp}"`,
          item.status,
          String(face.face_id),
          face.predicted_emotion,
          face.confidence_percentage.toFixed(1),
          (face.scores.Happy || 0).toFixed(1),
          (face.scores.Sad || 0).toFixed(1),
          (face.scores.Angry || 0).toFixed(1),
          (face.scores.Fear || 0).toFixed(1),
          (face.scores.Surprise || 0).toFixed(1),
          (face.scores.Disgust || 0).toFixed(1),
          (face.scores.Neutral || 0).toFixed(1),
          String(face.box.x),
          String(face.box.y),
          String(face.box.width),
          String(face.box.height),
          String(item.processingTimeMs || 0)
        ]);
      });
    } else {
      // Row for image with no face or error
      rows.push([
        `"${item.filename.replace(/"/g, '""')}"`,
        `"${item.timestamp}"`,
        item.status === 'no_face' ? 'No Face Detected' : 'Error',
        'N/A',
        'N/A',
        '0.0',
        '0.0',
        '0.0',
        '0.0',
        '0.0',
        '0.0',
        '0.0',
        '0.0',
        '0',
        '0',
        '0',
        '0',
        String(item.processingTimeMs || 0)
      ]);
    }
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  link.setAttribute('href', url);
  link.setAttribute('download', `facial_emotion_detection_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
