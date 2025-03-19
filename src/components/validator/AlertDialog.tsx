
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialogForm } from "./AlertDialogForm";
import { AlertSuccessView } from "./AlertSuccessView";
import { ValidatorI } from "@/services/api/interfaces";

interface AlertDialogProps {
  validator: ValidatorI | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPubkey?: string;
}

export function AlertDialog({ validator, open, onOpenChange, userPubkey }: AlertDialogProps) {
  const [success, setSuccess] = useState(false);
  const [activationToken, setActivationToken] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<string>("");

  const resetForm = () => {
    setSuccess(false);
    setActivationToken(null);
    setDeliveryMethod("");
  };

  const handleSuccess = (method: string, token: string | null) => {
    setDeliveryMethod(method);
    setActivationToken(token);
    setSuccess(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        {success ? (
          <AlertSuccessView 
            deliveryMethod={deliveryMethod}
            activationToken={activationToken}
            onClose={() => {
              resetForm();
              onOpenChange(false);
            }}
            onCreateAnother={resetForm}
          />
        ) : (
          <AlertDialogForm 
            validator={validator} 
            onSuccess={handleSuccess}
            userPubkey={userPubkey}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AlertDialog;
