import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

interface CitySuggestion {
  display_name: string;
  name: string;
  country: string;
}

export default function CitySelectionPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [citySearch, setCitySearch] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      navigate("/feed");
    }
  }, [user, navigate]);

  useEffect(() => {
    const searchCities = async () => {
      if (citySearch.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
            citySearch
          )}&format=json&limit=5&addressdetails=1`
        );
        const data = await response.json();
        
        const cities = data.map((result: any) => ({
          display_name: result.display_name,
          name: result.address?.city || result.address?.town || result.address?.village || result.name,
          country: result.address?.country || "Unknown",
        }));
        
        setSuggestions(cities);
      } catch (error) {
        console.error("City search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchCities, 300);
    return () => clearTimeout(debounce);
  }, [citySearch]);

  const handleCitySelect = (city: CitySuggestion) => {
    setSelectedCity(city);
    setCitySearch(city.name);
    setSuggestions([]);
  };

  const handleContinue = async () => {
    if (!selectedCity) {
      toast({
        title: "City required",
        description: "Please select a city to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          city: selectedCity.name,
          country: selectedCity.country,
          formStatus: 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      await fetch("/api/communities/auto-join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cityName: selectedCity.name,
          country: selectedCity.country,
        }),
      });

      navigate("/onboarding/step-2");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save city. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Select Your City - Mundo Tango" description="Choose your city and join your local tango community" />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Step 1 of 4</div>
              <div className="flex gap-1">
                <div className="h-2 w-8 rounded-full bg-primary"></div>
                <div className="h-2 w-8 rounded-full bg-muted"></div>
                <div className="h-2 w-8 rounded-full bg-muted"></div>
                <div className="h-2 w-8 rounded-full bg-muted"></div>
              </div>
            </div>
            <CardTitle className="text-2xl font-serif flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Where are you based?
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              We'll automatically connect you with your local tango community
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <div className="relative">
                <Input
                  id="city"
                  type="text"
                  placeholder="Search for your city..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-city-search"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {suggestions.length > 0 && (
                <div className="border rounded-md bg-card shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleCitySelect(city)}
                      className="w-full text-left px-4 py-3 hover-elevate active-elevate-2 border-b last:border-b-0"
                      data-testid={`city-suggestion-${index}`}
                    >
                      <div className="font-medium">{city.name}</div>
                      <div className="text-sm text-muted-foreground">{city.country}</div>
                    </button>
                  ))}
                </div>
              )}
              {selectedCity && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedCity.name}, {selectedCity.country}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/onboarding/welcome")}
              disabled={isLoading}
              data-testid="button-back"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={isLoading || !selectedCity}
              data-testid="button-continue"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
