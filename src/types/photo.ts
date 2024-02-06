interface Photo {
  id: string;
  url: string | null;
}

interface PhotoWithBlur extends Photo {
  blurUrl: string | null;
}