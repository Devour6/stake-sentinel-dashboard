
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { validateVotePubkey } from "@/services/solanaApi";

const Home = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    
    try {
      // For now just validate the pubkey format
      // Later we can do more complex validation
      const isValid = validateVotePubkey(searchInput.trim());
      
      if (isValid) {
        navigate(`/validator/${encodeURIComponent(searchInput.trim())}`);
      } else {
        // If not a valid pubkey, we could try searching by name in the future
        console.error("Invalid vote account pubkey format");
        // We'll still navigate, and let the validator page handle errors
        navigate(`/validator/${encodeURIComponent(searchInput.trim())}`);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gojira-gray to-gojira-gray-dark p-4">
      <div className="w-full max-w-3xl mx-auto text-center mb-12 animate-fade-in">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png" 
            alt="Gojira Logo" 
            className="w-24 h-24 object-contain gojira-logo"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          Solana Validator Monitor
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Search for any Solana validator by vote account address, identity, or name to view detailed performance metrics.
        </p>
      </div>

      <Card className="w-full max-w-2xl glass-card mx-auto animate-slide-up">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by validator vote account, identity, or name..."
                className="pl-10 bg-gojira-gray-dark border-gojira-gray-light"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              variant="destructive"
              className="bg-gojira-red hover:bg-gojira-red-dark"
              disabled={isSearching || !searchInput.trim()}
            >
              {isSearching ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              ) : null}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-16 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-1 items-center">
          <span>Powered by</span>
          <span className="text-gojira-red font-semibold">Gojira</span>
          <img 
            src="/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png" 
            alt="Gojira Logo" 
            className="w-4 h-4"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
