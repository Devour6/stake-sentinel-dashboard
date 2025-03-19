
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface AlertSuccessViewProps {
  deliveryMethod: string;
  activationToken: string | null;
  onClose: () => void;
  onCreateAnother: () => void;
}

export const AlertSuccessView = ({ 
  deliveryMethod, 
  activationToken, 
  onClose, 
  onCreateAnother 
}: AlertSuccessViewProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Alert Created</DialogTitle>
      </DialogHeader>
      
      {deliveryMethod === "telegram" && activationToken ? (
        <Alert>
          <AlertDescription className="text-center p-2">
            <p className="mb-4">Alert created! To activate it, please click the link below to open Telegram, then click Start:</p>
            <a 
              href={`https://t.me/stakewiz_bot?start=${activationToken}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="bg-blue-600 hover:bg-blue-700 mb-4">
                Activate in Telegram
              </Button>
            </a>
          </AlertDescription>
        </Alert>
      ) : deliveryMethod === "email" ? (
        <Alert>
          <AlertDescription className="text-center p-2">
            Alert created! You'll receive a confirmation email with an activation link.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertDescription className="text-center p-2">
            Alert activated! You'll receive notifications in your Solflare wallet.
          </AlertDescription>
        </Alert>
      )}
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          Close
        </Button>
        <Button onClick={onCreateAnother}>
          Create Another Alert
        </Button>
      </DialogFooter>
    </>
  );
};
