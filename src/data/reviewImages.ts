import undineAdzika from "../assets/reviews/undine-7-adzika-square.jpg";
import undineFileja from "../assets/reviews/undine-7-fileja-square.jpg";
import kaijaGardumsAtlantijasSilkuFilejasMarinade from "../assets/reviews/kaija-gardums-atlantijas-silku-filejas-marinade-square.jpg";
import kaijaGardumsAtlantijasSilkuFilejasElla from "../assets/reviews/kaija-gardums-atlantijas-silku-filejas-ella-square.jpg";
import kaijaMatjeAtlantijasSilkuFilejasElla from "../assets/reviews/kaija-matje-atlantijas-silku-filejas-ella-square.jpg";
import kaijaSilkuFilejasEllaArGarsvielam from "../assets/reviews/kaija-silku-filejas-ella-ar-garsvielam-square.jpg";
import zigmasClassicalSlightlySalted from "../assets/reviews/zigmas-classical-slightly-salted.jpeg";
import zigmasClassicalSmokeAroma from "../assets/reviews/zigmas-classical-smoke-aroma.jpg";
import zigmasAtlantijasSilkuFilejaBezEllas from "../assets/reviews/zigmas-atlantijas-silku-fileja-bez-ellas-square.jpg";
import zigmasMatjesAtlantijasSilkuFilejaElla from "../assets/reviews/zigmas-matjes-atlantijas-silku-fileja-ella-square.jpg";
import viciTradicionalaAtlantijasSilkuFilejaElla from "../assets/reviews/vici-tradicionala-atlantijas-silku-fileja-ella-square.jpg";
import viciAtlantijasSilkuFilejaArSarkanoSipoluBezEllas from "../assets/reviews/vici-atlantijas-silku-fileja-ar-sarkano-sipolu-bez-ellas-square.jpg";

const reviewImages = {
  "kaija-gardums-atlantijas-silku-filejas-marinade-square": kaijaGardumsAtlantijasSilkuFilejasMarinade,
  "kaija-gardums-atlantijas-silku-filejas-ella-square": kaijaGardumsAtlantijasSilkuFilejasElla,
  "kaija-matje-atlantijas-silku-filejas-ella-square": kaijaMatjeAtlantijasSilkuFilejasElla,
  "kaija-silku-filejas-ella-ar-garsvielam-square": kaijaSilkuFilejasEllaArGarsvielam,
  "undine-7-adzika-square": undineAdzika,
  "undine-7-fileja-square": undineFileja,
  "vici-tradicionala-atlantijas-silku-fileja-ella-square": viciTradicionalaAtlantijasSilkuFilejaElla,
  "vici-atlantijas-silku-fileja-ar-sarkano-sipolu-bez-ellas-square": viciAtlantijasSilkuFilejaArSarkanoSipoluBezEllas,
  "zigmas-classical-slightly-salted": zigmasClassicalSlightlySalted,
  "zigmas-classical-smoke-aroma": zigmasClassicalSmokeAroma,
  "zigmas-atlantijas-silku-fileja-bez-ellas-square": zigmasAtlantijasSilkuFilejaBezEllas,
  "zigmas-matjes-atlantijas-silku-fileja-ella-square": zigmasMatjesAtlantijasSilkuFilejaElla,
};

export function getReviewImageSrc(image: string) {
  return reviewImages[image as keyof typeof reviewImages]?.src ?? image;
}
