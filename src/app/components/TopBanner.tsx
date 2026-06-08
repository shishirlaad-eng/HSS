import hssLogoBlack from "../../assets/brand/hss/logos/hss-logo-black.png";

// HSS brand saffron — fixed colour, never changes with theme
const HSS_SAFFRON = "#F5A623";

export function TopBanner() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[70] h-10 flex items-center px-4 gap-3"
      style={{ backgroundColor: HSS_SAFFRON }}
    >
      {/* HSS Logo */}
      <img
        src={hssLogoBlack}
        alt="Hindu Swayamsevak Sangh UK"
        className="h-7 w-7 object-contain flex-shrink-0"
      />

      {/* Divider */}
      <div className="w-px h-5 bg-white/40 flex-shrink-0" />

      {/* Platform name block */}
      <div className="flex flex-col leading-tight">
        <span className="text-white font-bold text-sm tracking-tight leading-none">
          HSS Admin
        </span>
        <span className="text-white/75 text-[10px] leading-none mt-0.5">
          Membership Management
        </span>
      </div>
    </div>
  );
}
