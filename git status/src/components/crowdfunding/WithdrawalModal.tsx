import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  campaign: {
    id: number;
    title: string;
    currentAmount: string;
    goalAmount: string;
  };
  onWithdraw: (amount: number) => Promise<void>;
}

export function WithdrawalModal({ open, onClose, campaign, onWithdraw }: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const availableAmount = parseFloat(campaign.currentAmount);
  const platformFee = availableAmount * 0.05; // 5% platform fee
  const netAmount = availableAmount - platformFee;

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > netAmount) {
      setError(`Amount cannot exceed available balance of $${netAmount.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      await onWithdraw(withdrawAmount);
      setAmount("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process withdrawal");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            {campaign.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Balance Info */}
          <div className="rounded-lg border border-white/10 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Raised:</span>
              <span className="font-medium">${availableAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee (5%):</span>
              <span className="text-red-400">-${platformFee.toFixed(2)}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="font-medium">Available to Withdraw:</span>
              <span 
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ${netAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Withdrawal Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                max={netAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAmount(netAmount.toFixed(2))}
              className="w-full"
            >
              Withdraw All Available
            </Button>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <Alert>
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <AlertDescription className="text-sm">
              Funds will be transferred to your connected account within 2-3 business days.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={isProcessing || !amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              {isProcessing ? "Processing..." : "Withdraw"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
