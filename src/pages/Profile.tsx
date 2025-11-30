import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Shield, Edit2, Save, X, Send, Inbox, ArrowUpRight, CheckCircle, Copy, AlertTriangle } from "lucide-react";
import { industries, type Industry } from "@/data/industries";
import { Tables } from "@/integrations/supabase/types";

type kybUserData = {
  id: string;
  company_name: string | null;
  trading_name: string | null;
  trades_under_different_name: boolean | null;
  company_registration_number: string | null;
  company_registration_date: string | null;
  entity_type: string | null;
  website_or_business_channel: string | null;
  country_of_registration: string | null;
  industry: string | null;
  sub_industry: string | null;
  goods_or_services: string | null;
  incoming_payments_monthly_euro: string | null;
  incoming_payment_countries: string | null;
  incoming_transaction_amount: string | null;
  outgoing_payments_monthly_euro: string | null;
  outgoing_payment_countries: string | null;
  outgoing_transaction_amount: string | null;
  applicant_first_name: string | null;
  applicant_last_name: string | null;
  applicant_email: string | null;
  created_at: string;
  updated_at: string;
};

type Request = {
  id: string;
  requester_email: string;
  requester_user_id: string;
  company_registration_number: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type CompanyRiskProfile = Tables<"company_risk_profiles">;

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kybUserData, setUserkybUserData] = useState<kybUserData | null>(null);
  const [kybData, setkybUserData] = useState<kybUserData[] | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);
  const [approvedClients, setApprovedClients] = useState<kybUserData[]>([]);
  const [companyRiskProfiles, setCompanyRiskProfiles] = useState<CompanyRiskProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | "">("");
  const [newRequestCompanyNumber, setNewRequestCompanyNumber] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setUserEmail(user.email || "");

      // Fetch KYB submission
      const { data: submission, error: submissionError } = await supabase
        .from("kyb_submissions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (submissionError && submissionError.code !== "PGRST116") {
        throw submissionError;
      }
      setUserkybUserData(submission);

      const { data: kybUserData, error: kybUserDataError } = await supabase
        .from("kyb_submissions")
        .select("*").not('user_id', 'eq', user.id)

      if (kybUserDataError && kybUserDataError.code !== "PGRST116") {
        throw kybUserDataError;
      }

      setkybUserData(kybUserData);

      // Fetch incoming requests
      if (submission?.company_registration_number) {
        const { data: requestsData, error: requestsError } = await supabase
          .from("kyb_requests")
          .select("*")
          .eq('company_registration_number', submission.company_registration_number)
          .order("created_at", { ascending: false });

        console.log('submission.company_registration_number', submission.company_registration_number)
        console.log('requestsData', requestsData)

        if (requestsError) throw requestsError;
        console.log('requestsData', requestsData)
        setRequests(requestsData || []);

      }

      const { data: riskProfiles, error: riskProfilesError } = await supabase
        .from("company_risk_profiles")
        .select("*")

      if (riskProfilesError) throw riskProfilesError;
      
      // Get approved requests to filter risk profiles
      const { data: approvedRequests, error: approvedRequestsError } = await supabase
        .from("kyb_requests")
        .select("*")
        .eq("requester_user_id", user.id)
        .eq("status", "approved");

      if (approvedRequestsError) throw approvedRequestsError;

      const approvedCompanyNumbers = approvedRequests?.map(req => req.company_registration_number) || [];
      
      // Filter risk profiles to only show those for approved companies
      const filteredRiskProfiles = riskProfiles?.filter(profile => {
        const relatedSubmission = kybUserData?.find(submission => submission.id === profile.submission_id);
        return relatedSubmission && approvedCompanyNumbers.includes(relatedSubmission.company_registration_number);
      }) || [];

      setCompanyRiskProfiles(filteredRiskProfiles);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue || "");
    if (field === "sub_industry" && kybUserData?.industry) {
      setSelectedIndustry(kybUserData.industry as Industry);
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveField = async (field: string) => {
    if (!kybUserData) return;

    try {
      const { error } = await supabase
        .from("kyb_submissions")
        .update({ [field]: editValue })
        .eq("id", kybUserData.id);

      if (error) throw error;

      setUserkybUserData({ ...kybUserData, [field]: editValue });
      setEditingField(null);
      toast({
        title: "Success",
        description: "Information updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApproveRequest = async (request: Request) => {
    try {
      const { error } = await supabase
        .from("kyb_requests")
        .update({ status: "approved" })
        .eq("id", request.id);

        console.log('Approving request', request)
        console.log('Approving request', error)

      if (error) throw error;

      const { error: errorTwo } = await supabase
        .from("kyb_approved_requests")
        .insert({
          user_id: request.requester_user_id,
          requested_user_id: await supabase.auth.getUser().then(({ data: { user } }) => user?.id || null),
          company_registration_number: request.company_registration_number,
        })

        if (error) throw error;
        if (errorTwo) throw errorTwo;

        
      toast({
        title: "Success",
        description: "Request approved successfully",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitRequest = async () => {
    if (!newRequestCompanyNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company registration number",
        variant: "destructive",
      });
      return;
    }

    if (!userEmail || !userEmail.trim()) {
      toast({
        title: "Error",
        description: "User email not available. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("kyb_requests").insert({
        requester_user_id: await supabase.auth.getUser().then(({ data: { user } }) => user?.id || null),
        requester_email: userEmail.trim(),
        company_registration_number: newRequestCompanyNumber.trim(),
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request sent successfully",
      });

      setNewRequestCompanyNumber("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderEditableField = (label: string, field: keyof kybUserData, value: string | null) => {
    const isEditing = editingField === field;

    return (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-sm font-medium text-muted-foreground">{label}:</span>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 w-64" />
            <Button size="icon" variant="ghost" onClick={() => saveField(field)} className="h-8 w-8">
              <Save className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm">{value || "N/A"}</span>
            <Button size="icon" variant="ghost" onClick={() => startEditing(field, value || "")} className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderReadOnlyField = (label: string, value: string | null) => {
    return (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-sm font-medium text-muted-foreground">{label}:</span>
        <span className="text-sm">{value || "N/A"}</span>
      </div>
    );
  };

  const renderSelectField = (
    label: string,
    field: keyof kybUserData,
    value: string | null,
    options: { label: string; value: string }[],
  ) => {
    const isEditing = editingField === field;

    return (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-sm font-medium text-muted-foreground">{label}:</span>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8 w-64">
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" variant="ghost" onClick={() => saveField(field)} className="h-8 w-8">
              <Save className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm">{value || "N/A"}</span>
            <Button size="icon" variant="ghost" onClick={() => startEditing(field, value || "")} className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderIndustryField = () => {
    const isEditing = editingField === "industry";

    return (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-sm font-medium text-muted-foreground">Industry:</span>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Select
              value={editValue}
              onValueChange={(value) => {
                setEditValue(value);
                setSelectedIndustry(value as Industry);
              }}
            >
              <SelectTrigger className="h-8 w-64">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {Object.keys(industries).map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" variant="ghost" onClick={() => saveField("industry")} className="h-8 w-8">
              <Save className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm">{kybUserData?.industry || "N/A"}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                startEditing("industry", kybUserData?.industry || "");
                setSelectedIndustry((kybUserData?.industry as Industry) || "");
              }}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderSubIndustryField = () => {
    const isEditing = editingField === "sub_industry";
    const currentIndustry = selectedIndustry || (kybUserData?.industry as Industry);
    const subIndustries = currentIndustry && industries[currentIndustry] ? industries[currentIndustry] : [];

    return (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-sm font-medium text-muted-foreground">Sub-Industry:</span>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8 w-64">
                <SelectValue placeholder="Select sub-industry" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {subIndustries.map((subIndustry) => (
                  <SelectItem key={subIndustry} value={subIndustry}>
                    {subIndustry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" variant="ghost" onClick={() => saveField("sub_industry")} className="h-8 w-8">
              <Save className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm">{kybUserData?.sub_industry || "N/A"}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => startEditing("sub_industry", kybUserData?.sub_industry || "")}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const getRiskLevelBadgeVariant = (riskLevel: string | null) => {
    switch (riskLevel?.toUpperCase()) {
      case "LOW": return "default";
      case "MEDIUM": return "secondary";
      case "HIGH": return "orange";
      case "CRITICAL": return "destructive";
      default: return "outline";
    }
  };

  const getRiskLevelColor = (riskLevel: string | null) => {
    switch (riskLevel?.toUpperCase()) {
      case "LOW": return "text-green-600 bg-green-100 border-green-200";
      case "MEDIUM": return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "HIGH": return "text-orange-600 bg-orange-100 border-orange-200";
      case "CRITICAL": return "text-red-600 bg-red-100 border-red-200";
      default: return "";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "SEPA identifier has been copied",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!kybUserData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">SnapAML</h1>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* No Data State */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome to SnapAML</CardTitle>
                <CardDescription>Get started by adding your company information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-6 text-center">
                  You haven't added your company information yet. Click the button below to get started with the KYB
                  verification process.
                </p>
                <Button onClick={() => navigate("/kyc")} size="lg">
                  Add Company Information
                </Button>
              </CardContent>
            </Card>

            {/* Requests Card */}
            <Card>
              <CardHeader>
                <CardTitle>Requests</CardTitle>
                <CardDescription>Manage verification requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="outgoing">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4" />
                        <span>My Requests</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter company registration number"
                          value={newRequestCompanyNumber}
                          onChange={(e) => setNewRequestCompanyNumber(e.target.value)}
                        />
                        <Button onClick={handleSubmitRequest}>
                          <Send className="h-4 w-4 mr-2" />
                          Request
                        </Button>
                      </div>
                      {outgoingRequests.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No pending requests</p>
                      ) : (
                        <div className="space-y-4">
                          {outgoingRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                              <div>
                                <p className="font-medium">{request.company_registration_number}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(request.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="text-sm text-muted-foreground">Pending</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="approved">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Approved Clients</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {approvedClients.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No approved clients</p>
                      ) : (
                        <div className="space-y-4">
                          {approvedClients.map((client) => (
                            <div key={client.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                              <div>
                                <p className="font-medium">{client.company_registration_number}</p>
                                <p className="text-sm text-muted-foreground">
                                  Approved on {new Date(client.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">SnapAML</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Current Information */}
          <Card>
            <CardHeader>
              <CardTitle>Current Information</CardTitle>
              <CardDescription>View and edit your KYB submission details</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {/* Step 1: Company Details */}
                <AccordionItem value="step1">
                  <AccordionTrigger>Company Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      {renderReadOnlyField("Company Name", kybUserData.company_name)}
                      {renderEditableField("Trading Name", "trading_name", kybUserData.trading_name)}
                      {renderReadOnlyField("Registration Number", kybUserData.company_registration_number)}
                      {renderReadOnlyField("Registration Date", kybUserData.company_registration_date)}
                      {renderReadOnlyField("Entity Type", kybUserData.entity_type)}
                      {renderEditableField(
                        "Country of Registration",
                        "country_of_registration",
                        kybUserData.country_of_registration,
                      )}
                      {renderEditableField(
                        "Website/Business Channel",
                        "website_or_business_channel",
                        kybUserData.website_or_business_channel,
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Step 2: Industry Information */}
                <AccordionItem value="step2">
                  <AccordionTrigger>Industry Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      {renderIndustryField()}
                      {renderSubIndustryField()}
                      {renderSelectField("Goods or Services", "goods_or_services", kybUserData.goods_or_services, [
                        { label: "Physical goods", value: "physical-goods" },
                        { label: "Digital goods", value: "digital-goods" },
                        { label: "Services", value: "services" },
                        { label: "Mixed (goods and services)", value: "mixed" },
                      ])}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Step 3: Transaction Information */}
                <AccordionItem value="step3">
                  <AccordionTrigger>Transaction Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      {renderEditableField(
                        "Incoming Payments Monthly (EUR)",
                        "incoming_payments_monthly_euro",
                        kybUserData.incoming_payments_monthly_euro,
                      )}
                      {renderEditableField(
                        "Incoming Payment Countries",
                        "incoming_payment_countries",
                        kybUserData.incoming_payment_countries,
                      )}
                      {renderEditableField(
                        "Incoming Transaction Amount",
                        "incoming_transaction_amount",
                        kybUserData.incoming_transaction_amount,
                      )}
                      {renderEditableField(
                        "Outgoing Payments Monthly (EUR)",
                        "outgoing_payments_monthly_euro",
                        kybUserData.outgoing_payments_monthly_euro,
                      )}
                      {renderEditableField(
                        "Outgoing Payment Countries",
                        "outgoing_payment_countries",
                        kybUserData.outgoing_payment_countries,
                      )}
                      {renderEditableField(
                        "Outgoing Transaction Amount",
                        "outgoing_transaction_amount",
                        kybUserData.outgoing_transaction_amount,
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Step 4: Applicant Details */}
                <AccordionItem value="step4">
                  <AccordionTrigger>Applicant Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      {renderEditableField("First Name", "applicant_first_name", kybUserData.applicant_first_name)}
                      {renderEditableField("Last Name", "applicant_last_name", kybUserData.applicant_last_name)}
                      {renderEditableField("Email", "applicant_email", kybUserData.applicant_email)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Requests</CardTitle>
              <CardDescription>Manage verification requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="incoming">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Inbox className="h-4 w-4" />
                      <span>Incoming Requests</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {requests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No pending requests</p>
                    ) : (
                      <div className="space-y-4">
                        {requests.filter((value) => {
                          console.log('request', value)
                          return value.status === "pending"
                        }).map((request) => {
                          return(
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{request.requester_email}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button onClick={() => handleApproveRequest(request)}>Approve</Button>
                          </div>
                        )})}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="outgoing">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>My Requests</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter company registration number"
                        value={newRequestCompanyNumber}
                        onChange={(e) => setNewRequestCompanyNumber(e.target.value)}
                      />
                      <Button onClick={handleSubmitRequest}>
                        <Send className="h-4 w-4 mr-2" />
                        Request
                      </Button>
                    </div>
                    {outgoingRequests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No pending requests</p>
                    ) : (
                      <div className="space-y-4">
                        {outgoingRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">{request.company_registration_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-sm text-muted-foreground">Pending</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="approved">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Approved Clients</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {kybData.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No approved clients</p>
                    ) : (
                      <div className="space-y-4">
                        {kybData.map((client) => {
                          const companyRiskProfile = companyRiskProfiles.find(
                            (profile) => profile.submission_id === client.id,
                          );

                          if (!companyRiskProfile) {
                            return <></>
                          
                          }

                          return (
                          <div key={client.id} className="p-4 border border-border rounded-lg space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <p className="font-medium">{client.company_registration_number}</p>
                                {companyRiskProfile?.company_name && (
                                  <p className="text-sm font-medium text-foreground">{companyRiskProfile.company_name}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  Approved on {new Date(client.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                              {companyRiskProfile && (
                                <div className="flex flex-col gap-2">
                                  {(companyRiskProfile.overall_risk_level || companyRiskProfile.risk_level) && (
                                    <Badge className={getRiskLevelColor(companyRiskProfile.risk_level)}>
                                      {companyRiskProfile.overall_risk_level?.toUpperCase() || companyRiskProfile.risk_level?.toUpperCase()} RISK
                                    </Badge>
                                  )}
                                  {companyRiskProfile.sepa && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">SEPA:</span>
                                      <code className="text-xs bg-muted px-1 py-0.5 rounded">{companyRiskProfile.sepa}</code>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(companyRiskProfile.sepa || "")}
                                        className="h-5 w-5"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {companyRiskProfile && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-border">
                                {/* Company Details */}
                                <div className="space-y-2">
                                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company Details</h4>
                                  <div className="space-y-1">
                                    {companyRiskProfile.legal_form && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Legal Form:</span>
                                        <span>{companyRiskProfile.legal_form}</span>
                                      </div>
                                    )}
                                    {companyRiskProfile.address && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Address:</span>
                                        <span className="text-right max-w-32 truncate" title={companyRiskProfile.address}>
                                          {companyRiskProfile.address}
                                        </span>
                                      </div>
                                    )}
                                    {companyRiskProfile.city && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">City:</span>
                                        <span>{companyRiskProfile.city}</span>
                                      </div>
                                    )}
                                    {companyRiskProfile.registration_date && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Registered:</span>
                                        <span>{formatDate(companyRiskProfile.registration_date)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Status:</span>
                                      <span className={companyRiskProfile.is_active ? "text-green-600" : "text-red-600"}>
                                        {companyRiskProfile.is_active ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Risk Indicators */}
                                <div className="space-y-2">
                                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk Indicators</h4>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">PEP Status:</span>
                                      <span className={companyRiskProfile.is_pep ? "text-orange-600" : "text-green-600"}>
                                        {companyRiskProfile.is_pep ? "Yes" : "No"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Sanctioned:</span>
                                      <span className={companyRiskProfile.is_sanctioned ? "text-red-600" : "text-green-600"}>
                                        {companyRiskProfile.is_sanctioned ? "Yes" : "No"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Sanctions Match:</span>
                                      <span className={companyRiskProfile.is_sanctioned ? "text-red-600" : "text-green-600"}>
                                        {companyRiskProfile.sanctions_match ? "Yes" : "No"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Insolvency:</span>
                                      <span className={companyRiskProfile.has_insolvency ? "text-orange-600" : "text-green-600"}>
                                        {companyRiskProfile.has_insolvency ? "Current" : "None"}
                                      </span>
                                    </div>
                                    {companyRiskProfile.has_insolvency_history && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Insolvency History:</span>
                                        <span className="text-orange-600">Yes</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-2">
                                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Additional Info</h4>
                                  <div className="space-y-1">
                                    {companyRiskProfile.tax_rating && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Tax Rating:</span>
                                        <span>{companyRiskProfile.tax_rating}</span>
                                      </div>
                                    )}
                                    {companyRiskProfile.vies_valid !== null && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">VIES Valid:</span>
                                        <span className={companyRiskProfile.vies_valid ? "text-green-600" : "text-red-600"}>
                                          {companyRiskProfile.vies_valid ? "Yes" : "No"}
                                        </span>
                                      </div>
                                    )}
                                    {companyRiskProfile.adverse_media_mentions !== null && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Media Mentions:</span>
                                        <span className={companyRiskProfile.adverse_media_mentions > 0 ? "text-orange-600" : "text-green-600"}>
                                          {companyRiskProfile.adverse_media_mentions}
                                        </span>
                                      </div>
                                    )}
                                    {companyRiskProfile.adverse_media_risk_score !== null && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Media Risk Score:</span>
                                        <span className={companyRiskProfile.adverse_media_risk_score > 50 ? "text-orange-600" : "text-green-600"}>
                                          {companyRiskProfile.adverse_media_risk_score}
                                        </span>
                                      </div>
                                    )}
                                    {companyRiskProfile.checked_at && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Last Checked:</span>
                                        <span>{formatDate(companyRiskProfile.checked_at)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {!companyRiskProfile && (
                              // <div className="flex items-center gap-2 pt-2 border-t border-border">
                              //   <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              //   <span className="text-sm text-muted-foreground">No risk profile data available</span>
                              // </div>
                              <></>
                            )}
                          </div>
                          )}
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
