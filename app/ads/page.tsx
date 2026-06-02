import type { Metadata } from 'next';
import AdsNav from '@/components/ads/AdsNav';
import AdsHero from '@/components/ads/AdsHero';
import HowBillboardWorks from '@/components/ads/HowBillboardWorks';
import Specs from '@/components/ads/Specs';
import Contact from '@/components/ads/Contact';
import AdsFooter from '@/components/ads/AdsFooter';

export const metadata: Metadata = {
  title: 'Advertise — Spectral Drift',
  description:
    "Place your brand inside Spectral Drift's ghost world. In-game 3D billboard ads that trigger when spirits walk past.",
};

export default function AdsPage() {
  return (
    <>
      <AdsNav />
      <main>
        <AdsHero />
        <HowBillboardWorks />
        <Specs />
        <Contact />
      </main>
      <AdsFooter />
    </>
  );
}
