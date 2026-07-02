import Image from 'next/image';
import Navbar from './Navbar';

export default function Header() {
  return (
    <header className="text-primary flex items-center justify-between px-4 pt-6 pb-2 sm:pt-[60px] sm:pr-[43px] sm:pb-[10px] sm:pl-[72px]">
      <Image
        src="/logo.png"
        alt="Logotype"
        width={250}
        height={150}
        style={{ height: 'auto' }}
      />
      <Navbar />
    </header>
  );
}
