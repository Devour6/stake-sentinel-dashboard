
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { validateVotePubkey } from "@/services/solanaApi";
import { 
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from "@/components/ui/command";
import { toast } from "sonner";

// Mock validator list for autocomplete - this would be replaced with API data
const VALIDATOR_SUGGESTIONS = [
  { name: "Gojira", votePubkey: "CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1", identity: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM" },
  { name: "Solana Foundation", votePubkey: "GhBd6sozvfR9F2YwHVj2tAHbGyzQSuHxWNn5K8ofuYkx", identity: "7BJUCjD9sMQQ3LXeNZ3j8FQmJxMS1hC9t5S2g4gtLQBJ" },
  { name: "Jito", votePubkey: "E5ruSVxEKrAoXAcuMaAfcN5tX6bUYK6ouJcS5yAbs6Zh", identity: "88E5dLt2WQ6WNbQTXoZYwywickdGF9U5e3tbeYxQmHJx" },
  { name: "Marinade", votePubkey: "DQ7D6ZRtKbBSxCcAunEkoTzQhCBKLPdzTjJRoFBDkntj", identity: "HxkZUjg1RnCUTJ8j1Lc9J4xzQXGbQMY8kqbAMU4rMDKr" },
];

const Home = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(VALIDATOR_SUGGESTIONS);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (searchInput.trim()) {
      const filtered = VALIDATOR_SUGGESTIONS.filter(
        (validator) => 
          validator.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          validator.votePubkey.toLowerCase().includes(searchInput.toLowerCase()) ||
          validator.identity.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(VALIDATOR_SUGGESTIONS);
    }
  }, [searchInput]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    
    try {
      // For now just validate the pubkey format
      const isValid = validateVotePubkey(searchInput.trim());
      
      if (isValid) {
        navigate(`/validator/${encodeURIComponent(searchInput.trim())}`);
      } else {
        // Check if we have a suggestion that matches the search
        const matchedValidator = VALIDATOR_SUGGESTIONS.find(v => 
          v.name.toLowerCase() === searchInput.toLowerCase() ||
          v.votePubkey.toLowerCase() === searchInput.toLowerCase() ||
          v.identity.toLowerCase() === searchInput.toLowerCase()
        );

        if (matchedValidator) {
          navigate(`/validator/${encodeURIComponent(matchedValidator.votePubkey)}`);
        } else {
          // If not a valid pubkey and no match, show an error
          toast.error("No validator found matching your search");
          // We'll still navigate, and let the validator page handle errors
          navigate(`/validator/${encodeURIComponent(searchInput.trim())}`);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching for validator");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectValidator = (votePubkey: string) => {
    setOpen(false);
    navigate(`/validator/${encodeURIComponent(votePubkey)}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gojira-gray to-gojira-gray-dark p-4">
      <div className="w-full max-w-3xl mx-auto text-center mb-12 animate-fade-in">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png" 
            alt="hiStake Logo" 
            className="w-24 h-24 object-contain gojira-logo"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          hiStake
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
                onFocus={() => setOpen(true)}
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

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search validators..." 
          value={searchInput}
          onValueChange={setSearchInput}
        />
        <CommandList>
          <CommandEmpty>No validators found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {filteredSuggestions.map((validator) => (
              <CommandItem
                key={validator.votePubkey}
                onSelect={() => handleSelectValidator(validator.votePubkey)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span>{validator.name}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {validator.votePubkey.slice(0, 8)}...{validator.votePubkey.slice(-8)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default Home;
