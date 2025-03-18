
import React from 'react';
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { fetchValidatorMetrics, fetchValidatorInfo } from "@/services/solanaApi";
import { formatSol, formatCommission } from "@/services/solanaApi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AppHeader from '@/components/AppHeader';

interface HomeProps {
  setIsStakeModalOpen: (isOpen: boolean) => void;
}

const Home = ({ setIsStakeModalOpen }: HomeProps) => {
  const { 
    isLoading: isMetricsLoading, 
    error: metricsError, 
    data: metrics 
  } = useQuery({
    queryKey: ['validatorMetrics'],
    queryFn: () => fetchValidatorMetrics(),
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const { 
    isLoading: isInfoLoading, 
    error: infoError, 
    data: info 
  } = useQuery({
    queryKey: ['validatorInfo'],
    queryFn: () => fetchValidatorInfo(),
    refetchInterval: 60000, // Refetch every 60 seconds
  });
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader setIsStakeModalOpen={setIsStakeModalOpen} />
      
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Solana Validator Monitor
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Real-time monitoring and analytics for Solana validators.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Validator Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Validator Information</CardTitle>
              <CardDescription>
                Overview of the validator's key details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isInfoLoading ? (
                <>
                  <Skeleton className="h-4 w-[80%] mb-2" />
                  <Skeleton className="h-4 w-[60%] mb-2" />
                </>
              ) : infoError ? (
                <p className="text-red-500">Error: {infoError.message}</p>
              ) : info ? (
                <>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Name: {info.name || "N/A"}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Vote Pubkey: {info.votePubkey}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Commission: {formatCommission(info.commission)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Activated Stake: {formatSol(info.activatedStake)} SOL
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No validator info available.</p>
              )}
            </CardContent>
            <CardFooter>
              <Link to="/validator/9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF" className="w-full">
                <Button className="w-full">
                  View Details <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Validator Metrics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Validator Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for the validator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMetricsLoading ? (
                <>
                  <Skeleton className="h-4 w-[80%] mb-2" />
                  <Skeleton className="h-4 w-[60%] mb-2" />
                </>
              ) : metricsError ? (
                <p className="text-red-500">Error: {metricsError.message}</p>
              ) : metrics ? (
                <>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Total Stake: {formatSol(metrics.totalStake)} SOL
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Estimated APY: {(metrics.estimatedApy * 100)?.toFixed(2)}%
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Commission: {formatCommission(metrics.commission)}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No validator metrics available.</p>
              )}
            </CardContent>
            <CardFooter>
              <Link to="/validator/9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF" className="w-full">
                <Button className="w-full">
                  View Details <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Stake to Validator Card */}
          <Card>
            <CardHeader>
              <CardTitle>Stake to Validator</CardTitle>
              <CardDescription>
                Support the network by staking to our validator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Stake your SOL tokens to our validator and help secure the
                Solana network.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the button below to open the staking modal.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => setIsStakeModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full"
              >
                Stake Now
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Home;
