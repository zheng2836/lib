export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  format: 'epub' | 'pdf';
  filename: string;
  fileSize: number;
  createdAt: string;
}
