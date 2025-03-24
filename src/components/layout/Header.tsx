import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import StakeModal from "../StakeModal";
import { VALIDATOR_PUBKEY } from "@/services/solanaApi";

const Header = () => {
  const [isStakeModalOpen, setStakeModalOpen] = useState<boolean>(false);

  return (
    <>
      <div className="sticky w-full top-0 left-0 right-0">
        <div className="max-w-screen-2xl mx-auto my-4">
          <div className="flex justify-between gap-6 items-center">
            <div className="flex gap-8 text-white text-base items-center">
              <Link to={"/"}>
                <img
                  src="/images/logo_header.png"
                  alt="Logo"
                  className="h-12"
                />
              </Link>

              <a href="_" target="_blank">
                <span className="">AeroPool</span>
              </a>
              <a href="_" target="_blank">
                <span className="">AeroMetal</span>
              </a>
              <a href="_" target="_blank">
                <span className="">Validator Calculator</span>
              </a>
              <a href="_" target="_blank">
                <span className="">Validator Stats</span>
              </a>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                className="bg-aero-purple text-white hover:bg-aero-purple/10"
                onClick={() => setStakeModalOpen(true)}
              >
                Swap to aeroSOL
              </Button>
            </div>
          </div>
        </div>
      </div>

      <StakeModal
        isOpen={isStakeModalOpen}
        onClose={() => setStakeModalOpen(false)}
        validatorPubkey={VALIDATOR_PUBKEY}
      />
    </>
  );
};

export default Header;
