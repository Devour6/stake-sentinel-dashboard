
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatSol } from "@/services/solanaApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StakeInfoTableProps {
  totalStake: number;
  activatingStake: number;
  deactivatingStake: number;
  delegatorCount?: number;
}

export const StakeInfoTable: React.FC<StakeInfoTableProps> = ({
  totalStake,
  activatingStake,
  deactivatingStake,
  delegatorCount
}) => {
  return (
    <Card className="glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader>
        <CardTitle>Stake Details</CardTitle>
        <CardDescription>Detailed information about validator stake</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount (SOL)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Active Stake</TableCell>
              <TableCell className="text-right">{formatSol(totalStake)}</TableCell>
            </TableRow>
            {activatingStake > 0 && (
              <TableRow>
                <TableCell className="font-medium flex items-center">
                  <ArrowUpRight className="mr-2 h-4 w-4 text-green-500" />
                  Activating
                </TableCell>
                <TableCell className="text-right text-green-500">{formatSol(activatingStake)}</TableCell>
              </TableRow>
            )}
            {deactivatingStake > 0 && (
              <TableRow>
                <TableCell className="font-medium flex items-center">
                  <ArrowDownRight className="mr-2 h-4 w-4 text-red-500" />
                  Deactivating
                </TableCell>
                <TableCell className="text-right text-red-500">{formatSol(deactivatingStake)}</TableCell>
              </TableRow>
            )}
            {delegatorCount !== undefined && (
              <TableRow>
                <TableCell className="font-medium">Delegator Count</TableCell>
                <TableCell className="text-right">{delegatorCount}</TableCell>
              </TableRow>
            )}
            {totalStake === 0 && activatingStake === 0 && deactivatingStake === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                  Fetching on-chain stake data...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StakeInfoTable;
