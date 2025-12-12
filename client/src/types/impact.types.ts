export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
}

export interface GalleryItem {
  _id: string;
  src: string;
  category: string;
  type: 'image' | 'video';
  title?: string;
}