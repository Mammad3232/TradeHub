import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Layers } from 'lucide-react';
import { TrackOrderModal } from './TrackOrderModal';

interface SubNavbarProps {
  onMenuClick: () => void;
}

export const SubNavbar: React.FC<SubNavbarProps> = ({ onMenuClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* ─── Sub-Navbar Row ────────────────────────────────────────── */}
      <div className="bg-[#232F3E] text-white text-xs px-4 flex items-center h-9 whitespace-nowrap overflow-x-auto scrollbar-none">
        
        {/* Far Left: Menu / All Button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex items-center gap-1 font-bold border border-transparent hover:border-white rounded-sm px-2 py-0.5 transition-all cursor-pointer h-7 mr-4 flex-shrink-0"
        >
          <Menu className="h-4.5 w-4.5" />
          <span>All</span>
        </button>

        {/* Center Links */}
        <div className="flex items-center gap-6 font-medium flex-shrink-0">
          <Link to="/deals" className="hover:text-amber-400 transition-colors flex items-center h-7">
            Today's Deals
          </Link>
          <Link to="/vendors" className="hover:text-amber-400 transition-colors flex items-center h-7">
            Top Vendors
          </Link>
          <Link to="/new-arrivals" className="hover:text-amber-400 transition-colors flex items-center h-7">
            New Arrivals
          </Link>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="hover:text-amber-400 transition-colors flex items-center h-7 cursor-pointer"
          >
            Track Order
          </button>
          <Link
            to="/vendor-register"
            className="text-amber-400 font-bold hover:text-amber-300 transition-colors flex items-center h-7"
          >
            Become a Vendor
          </Link>
        </div>

        {/* Far Right (Admin Section) pushed entirely to far right */}
        <div className="ml-auto flex-shrink-0 pl-4">
          <Link
            to="/admin"
            className="text-slate-300 hover:text-white font-semibold flex items-center gap-1 border border-transparent hover:border-white rounded-sm px-2 py-0.5 transition-all h-7"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Admin Control Panel</span>
          </Link>
        </div>
      </div>

      {/* ─── Track Order Modal Component ───────────────────────────── */}
      <TrackOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
