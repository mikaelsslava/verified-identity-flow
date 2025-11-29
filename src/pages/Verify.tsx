import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const schema = z.object({
  companyRegistrationNumber: z.string().min(1, "Company registration number is required"),
});

type VerifyForm = z.infer<typeof schema>;

export default function Verify() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: VerifyForm) => {
    try {
      setIsLoading(true);
      setHasSearched(false);

      // Query database to check if company exists with completed submission
      const { data: submissions, error } = await supabase
        .from("kyb_submissions")
        .select("id")
        .ilike("company_registration_number", data.companyRegistrationNumber)
        .not("completed_at", "is", null)
        .limit(1);

      if (error) throw error;

      setVerificationResult(submissions && submissions.length > 0);
      setHasSearched(true);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult(false);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">SnapAML</span>
        </Link>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Verify KYB Badge</h1>
            <p className="text-xl text-muted-foreground">Check if a company has completed their KYB verification</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Verification</CardTitle>
              <CardDescription>Enter the company registration number to verify their KYB badge status</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyRegistrationNumber">Company Registration Number</Label>
                  <Input
                    id="companyRegistrationNumber"
                    placeholder="e.g., 12345678"
                    {...register("companyRegistrationNumber")}
                  />
                  {errors.companyRegistrationNumber && (
                    <p className="text-sm text-destructive">{errors.companyRegistrationNumber.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Badge"}
                </Button>
              </form>

              {hasSearched && (
                <div className="mt-6 p-6 rounded-lg border bg-card">
                  {verificationResult ? (
                    <div className="flex items-start gap-4">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Verified Badge Found</h3>
                        <p className="text-muted-foreground">
                          This company has completed their KYB verification and holds a valid badge.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <XCircle className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1">No Badge Found</h3>
                        <p className="text-muted-foreground">
                          No completed KYB verification found for this company registration number.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
