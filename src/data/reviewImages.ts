import undineAdzika from "../assets/reviews/undine-7-adzika-square.jpg";
import undineFileja from "../assets/reviews/undine-7-fileja-square.jpg";
import kaijaGardumsAtlantijasSilkuFilejasMarinade from "../assets/reviews/kaija-gardums-atlantijas-silku-filejas-marinade-square.jpg";
import zigmasClassicalSlightlySalted from "../assets/reviews/zigmas-classical-slightly-salted.jpeg";
import zigmasClassicalSmokeAroma from "../assets/reviews/zigmas-classical-smoke-aroma.jpg";

const reviewImages = {
  "kaija-gardums-atlantijas-silku-filejas-marinade-square": kaijaGardumsAtlantijasSilkuFilejasMarinade,
  "undine-7-adzika-square": undineAdzika,
  "undine-7-fileja-square": undineFileja,
  "zigmas-classical-slightly-salted": zigmasClassicalSlightlySalted,
  "zigmas-classical-smoke-aroma": zigmasClassicalSmokeAroma,
};

export function getReviewImageSrc(image: string) {
  return reviewImages[image as keyof typeof reviewImages]?.src ?? image;
}
