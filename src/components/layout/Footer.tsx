const Footer = () => {
  return (
    <div
      className="absolute bottom-0 left-0 right-0"
      style={{
        backgroundImage: `url('/images/bg_footer.svg')`,
      }}
    >
      <div className="container mx-auto">
        <div className="flex justify-between gap-4 items-center">
          <img src="/images/logo_trans.svg" alt="Logo" className="h-20 mt-12" />

          <div className="flex gap-4 text-white text-base">
            <a href="_" target="_blank">
              <span className="">Tiered Delegation</span>
            </a>
            <a href="_" target="_blank">
              <span className="">Stake Pool</span>
            </a>
            <a href="_" target="_blank">
              <span className="">Validator Rankings</span>
            </a>
            <a href="_" target="_blank">
              <span className="">About</span>
            </a>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex gap-2 justify-end">
              <a href="_" target="_blank">
                <img
                  src="/images/ic_phaselabs.svg"
                  alt="Logo"
                  className="h-8"
                />
              </a>
              <a href="_" target="_blank">
                <img src="/images/ic_x.svg" alt="Logo" className="h-8" />
              </a>
            </div>
            <span className="text-white text-sm text-opacity-80">
              © 2025 Aero. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
