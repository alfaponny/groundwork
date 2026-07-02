'use client';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { useState } from 'react';
import { Link, usePathname } from '@/src/i18n/routing';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="text-primary relative flex h-[100px] items-center">
      <div className="cursor-pointer">
        {isOpen ? (
          <AiOutlineClose size={50} onClick={() => setIsOpen(false)} />
        ) : (
          <AiOutlineMenu size={50} onClick={() => setIsOpen(true)} />
        )}
      </div>

      {isOpen && (
        <div className="text-accent absolute top-16 right-6">
          <ul>
            <li>
              <Link href={pathname} locale="en">
                en
              </Link>
            </li>
            <li>
              <Link href={pathname} locale="sv">
                sv
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
