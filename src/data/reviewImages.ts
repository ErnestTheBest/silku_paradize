import undineAdzika from "../assets/reviews/undine-7-adzika-square.jpg";
import undineFileja from "../assets/reviews/undine-7-fileja-square.jpg";
import zigmasSlightlySalted from "../assets/reviews/zigmas-slightly-salted.jpeg";

const reviewImages = {
  "undine-7-adzika-square": undineAdzika,
  "undine-7-fileja-square": undineFileja,
  "zigmas-slightly-salted": zigmasSlightlySalted,
};

export function getReviewImageSrc(image: string) {
  return reviewImages[image as keyof typeof reviewImages]?.src ?? image;
}
