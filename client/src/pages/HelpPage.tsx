import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Book, MessageCircle, Mail } from "lucide-react";
import { Link } from "wouter";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">How Can We Help?</h1>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search for help..." className="pl-10" data-testid="input-search" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Link href="/faq">
            <Card className="hover-elevate cursor-pointer" data-testid="card-faq">
              <CardHeader>
                <Book className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Browse frequently asked questions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/contact">
            <Card className="hover-elevate cursor-pointer" data-testid="card-contact">
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Get in touch with our team</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover-elevate cursor-pointer" data-testid="card-chat">
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-base">Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Chat with us in real-time</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "How do I reset my password?",
              "How do I RSVP to an event?",
              "How do I find dancers in my area?",
              "How do I upgrade my account?",
              "How do I report inappropriate content?"
            ].map((topic, i) => (
              <Button
                key={i}
                variant="ghost"
                className="w-full justify-start"
                data-testid={`topic-${i}`}
              >
                {topic}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
