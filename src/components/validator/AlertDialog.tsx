
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ValidatorI } from "@/services/api/interfaces";
import { Info } from "lucide-react";

interface AlertDialogProps {
  validator: ValidatorI | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPubkey?: string;
}

export function AlertDialog({ validator, open, onOpenChange, userPubkey }: AlertDialogProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "telegram" | "solflare">("telegram");
  const [delinquencyAlert, setDelinquencyAlert] = useState(false);
  const [commissionAlert, setCommissionAlert] = useState(false);
  const [delinquencyThreshold, setDelinquencyThreshold] = useState("60");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [success, setSuccess] = useState(false);
  const [activationToken, setActivationToken] = useState<string | null>(null);
  
  const walletConnected = !!userPubkey;
  const solflareAvailable = walletConnected && deliveryMethod === "solflare";

  const resetForm = () => {
    setDelinquencyAlert(false);
    setCommissionAlert(false);
    setDelinquencyThreshold("60");
    setEmail("");
    setOptIn(true);
    setSuccess(false);
    setActivationToken(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!delinquencyAlert && !commissionAlert) {
      toast.error("Please select at least one alert type");
      return;
    }
    
    if (deliveryMethod === "email" && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Demo implementation - in a real app would call API
    // Mock successful API call
    setTimeout(() => {
      setSuccess(true);
      if (deliveryMethod === "telegram") {
        setActivationToken("mock-activation-token");
      }
      toast.success("Alert created successfully!");
    }, 1000);
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
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
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                resetForm();
              }}
            >
              Create Another Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{validator?.name || "Set Validator Alerts"}</DialogTitle>
          <DialogDescription>
            Configure alert notifications for this validator.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Validator</Label>
              <Input 
                disabled 
                value={validator?.vote_identity || "No validator selected"} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Delivery Method</Label>
              <Tabs defaultValue={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as any)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="telegram">Telegram</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="solflare" disabled={!walletConnected}>
                    Solflare
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {deliveryMethod === "email" && (
                <div className="mt-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email" 
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Alert Types</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="delinquency" 
                  checked={delinquencyAlert}
                  onCheckedChange={(checked) => setDelinquencyAlert(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="delinquency" className="flex items-center gap-1">
                    Delinquency Alerts
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Label>
                </div>
              </div>
              
              {delinquencyAlert && (
                <RadioGroup 
                  defaultValue={delinquencyThreshold}
                  onValueChange={setDelinquencyThreshold}
                  className="grid grid-cols-3 gap-2 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15" id="r1" />
                    <Label htmlFor="r1">15 Minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" id="r2" />
                    <Label htmlFor="r2">30 Minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="60" id="r3" />
                    <Label htmlFor="r3">1 Hour</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="120" id="r4" />
                    <Label htmlFor="r4">2 Hours</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="240" id="r5" />
                    <Label htmlFor="r5">4 Hours</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="720" id="r6" />
                    <Label htmlFor="r6">12 Hours</Label>
                  </div>
                </RadioGroup>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="commission" 
                  checked={commissionAlert}
                  onCheckedChange={(checked) => setCommissionAlert(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="commission" className="flex items-center gap-1">
                    Commission Change Alerts
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="opt-in" 
                checked={optIn}
                onCheckedChange={(checked) => setOptIn(checked as boolean)}
              />
              <Label htmlFor="opt-in">
                I'd like to receive occasional updates about NodeScan services
              </Label>
            </div>
            
            <div className="text-sm text-muted-foreground mt-4">
              By clicking "Create Alert" you accept our Privacy Policy & Terms of Use.
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="submit">Create Alert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AlertDialog;
