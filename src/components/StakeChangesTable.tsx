
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { formatSolNumber } from "@/services/api/utils";
import { StakeChangeDetail } from "@/services/api/types";

interface StakeChangesTableProps {
  activatingDetails: StakeChangeDetail[];
  deactivatingDetails: StakeChangeDetail[];
  activatingTotal: number;
  deactivatingTotal: number;
  isLoading?: boolean;
}

export const StakeChangesTable = ({
  activatingDetails,
  deactivatingDetails,
  activatingTotal,
  deactivatingTotal,
  isLoading = false,
}: StakeChangesTableProps) => {
  const hasActivating = activatingDetails && activatingDetails.length > 0;
  const hasDeactivating = deactivatingDetails && deactivatingDetails.length > 0;
  const hasData = hasActivating || hasDeactivating;
  const netChange = activatingTotal - deactivatingTotal;

  return (
    <Card className="glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Stake Changes</CardTitle>
            <CardDescription>
              Detailed view of activating and deactivating stake
            </CardDescription>
          </div>
          {!isLoading && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Net change:</span>
              <div className={`flex items-center ${netChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {netChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                <span className="font-medium">{formatSolNumber(Math.abs(netChange))} SOL</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[320px] w-full flex items-center justify-center">
            <Spinner size="md" />
            <span className="ml-2">Loading stake change details...</span>
          </div>
        ) : !hasData ? (
          <div className="h-40 flex items-center justify-center text-center">
            <div>
              <Clock className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-muted-foreground">No pending stake changes for this validator</p>
              <p className="text-xs text-muted-foreground mt-1">
                When stake is being activated or deactivated, details will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {hasActivating && (
              <div>
                <h3 className="flex items-center text-sm font-medium text-green-500 mb-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Activating Stake ({activatingDetails.length} {activatingDetails.length === 1 ? 'entry' : 'entries'})
                </h3>
                <div className="border rounded-md overflow-hidden max-h-[180px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stake Account</TableHead>
                        <TableHead>Amount (SOL)</TableHead>
                        <TableHead>Active In</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activatingDetails.map((detail, index) => (
                        <TableRow key={`activating-${index}`}>
                          <TableCell className="font-mono text-xs truncate max-w-[200px]">
                            {detail.stakeAccount}
                          </TableCell>
                          <TableCell>
                            {formatSolNumber(detail.amount)}
                          </TableCell>
                          <TableCell>
                            {detail.remainingEpochs === 0 
                              ? "Next epoch" 
                              : `${detail.remainingEpochs} epoch${detail.remainingEpochs > 1 ? 's' : ''}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {hasDeactivating && (
              <div>
                <h3 className="flex items-center text-sm font-medium text-red-500 mb-2">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Deactivating Stake ({deactivatingDetails.length} {deactivatingDetails.length === 1 ? 'entry' : 'entries'})
                </h3>
                <div className="border rounded-md overflow-hidden max-h-[180px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stake Account</TableHead>
                        <TableHead>Amount (SOL)</TableHead>
                        <TableHead>Deactive In</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deactivatingDetails.map((detail, index) => (
                        <TableRow key={`deactivating-${index}`}>
                          <TableCell className="font-mono text-xs truncate max-w-[200px]">
                            {detail.stakeAccount}
                          </TableCell>
                          <TableCell>
                            {formatSolNumber(detail.amount)}
                          </TableCell>
                          <TableCell>
                            {detail.remainingEpochs === 0 
                              ? "Next epoch" 
                              : `${detail.remainingEpochs} epoch${detail.remainingEpochs > 1 ? 's' : ''}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StakeChangesTable;
