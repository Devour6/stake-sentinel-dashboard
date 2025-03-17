
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VALIDATOR_PUBKEY } from "@/services/solanaApi";

interface StakeFormProps {
  amount: string;
  setAmount: (amount: string) => void;
  onStake: () => Promise<void>;
  isStaking: boolean;
  selectedWallet: string | null;
  onDisconnect: () => void;
}

const StakeForm = ({ 
  amount, 
  setAmount, 
  onStake, 
  isStaking, 
  selectedWallet,
  onDisconnect 
}: StakeFormProps) => {
  return (
    <div className="py-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Connected to {selectedWallet}
        </div>
        <Button
          variant="ghost" 
          size="sm"
          className="text-xs text-gojira-red hover:text-gojira-red-light hover:bg-transparent"
          onClick={onDisconnect}
        >
          Disconnect
        </Button>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium text-white">
          Amount (SOL)
        </label>
        <Input
          id="amount"
          placeholder="Enter SOL amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          step="0.1"
          className="bg-gojira-gray border-gojira-gray-light"
        />
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Gojira Validator Address:</p>
        <p className="font-mono text-xs break-all">{VALIDATOR_PUBKEY}</p>
        <p className="mt-2 text-xs">
          Staking through this interface delegates your SOL to Gojira's validator. 
          You maintain full custody of your tokens and can unstake anytime.
        </p>
      </div>
    </div>
  );
};

export default StakeForm;
