
import React from 'react';
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { fetchValidatorMetrics, fetchValidatorInfo } from "@/services/solanaApi";
import { formatSol, formatCommission } from "@/services/solanaApi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";

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
  
  const {
    searchInput,
    setSearchInput,
    isSearching,
    isLoadingValidators,
    filteredValidators,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
    handleSelectValidator
  } = useValidatorSearch();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/373e9dfd-22f8-47a8-971e-5dcb53f5aae2.png" 
                alt="NodeScan Logo" 
                className="h-8 w-auto" 
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">NodeScan</span>
            </Link>
          </div>
          
          <div className="flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="flex gap-2 relative search-container">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isLoadingValidators ? "Loading validators..." : "Search by validator name, vote account, or identity..."}
                    className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      if (e.target.value.length > 2) {
                        setShowSuggestions(true);
                      } else {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (searchInput.length > 2 && filteredValidators.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    disabled={isLoadingValidators && !searchInput.trim()}
                  />
                  
                  {showSuggestions && filteredValidators.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[300px] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                      {filteredValidators.map((validator) => (
                        <div
                          key={validator.votePubkey}
                          className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectValidator(validator.votePubkey);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {validator.icon ? (
                              <img 
                                src={validator.icon} 
                                alt={`${validator.name || 'Validator'} logo`}
                                className="w-6 h-6 rounded-full"
                                onError={(e) => {
                                  // Hide broken images
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                                {validator.name?.[0] || 'V'}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium">{validator.name || "Unknown Validator"}</span>
                              {validator.commission !== undefined && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Commission: {validator.commission}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                              {validator.votePubkey.slice(0, 6)}...{validator.votePubkey.slice(-6)}
                            </span>
                            {validator.activatedStake !== undefined && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {validator.activatedStake > 0 
                                  ? `Stake: ${Math.floor(validator.activatedStake).toLocaleString()} SOL` 
                                  : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={isSearching || (isLoadingValidators && !searchInput.trim())}
              >
                {isSearching ? (
                  <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                ) : null}
                Search
              </Button>
            </form>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setIsStakeModalOpen(true)} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Stake to Validator
            </Button>
          </div>
        </div>
      </header>
      
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
