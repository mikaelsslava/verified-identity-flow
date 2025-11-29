import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Shield, Edit2, Save, X, Send, Inbox, ArrowUpRight, CheckCircle } from "lucide-react";
import { industries, type Industry } from "@/data/industries";

type KYBData = {
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
};

type Request = {
  id: string;
  requester_email: string;
  company_registration_number: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kybData, setKybData] = useState<KYBData | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);
  const [approvedClients, setApprovedClients] = useState<Request[]>([]);
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
      setKybData(submission);

      // Fetch incoming requests
      if (submission?.company_registration_number) {
        const { data: requestsData, error: requestsError } = await supabase
          .from("kyb_requests")
          .select("*")
          .eq("company_registration_number", submission.company_registration_number)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (requestsError) throw requestsError;
        setRequests(requestsData || []);
      }

      // Fetch outgoing requests
      if (user.email) {
        const { data: outgoingData, error: outgoingError } = await supabase
          .from("kyb_requests")
          .select("*")
          .eq("requester_email", user.email)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (outgoingError) throw outgoingError;
        setOutgoingRequests(outgoingData || []);

        // Fetch approved clients
        const { data: approvedData, error: approvedError } = await supabase
          .from("kyb_requests")
          .select("*")
          .eq("requester_email", user.email)
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (approvedError) throw approvedError;
        setApprovedClients(approvedData || []);
      }
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
    if (field === "sub_industry" && kybData?.industry) {
      setSelectedIndustry(kybData.industry as Industry);
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveField = async (field: string) => {
    if (!kybData) return;

    try {
      const { error } = await supabase
        .from("kyb_submissions")
        .update({ [field]: editValue })
        .eq("id", kybData.id);

      if (error) throw error;

      setKybData({ ...kybData, [field]: editValue });
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

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("kyb_requests")
        .update({ status: "approved" })
        .eq("id", requestId);

      if (error) throw error;

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

    try {
      const { error } = await supabase.from("kyb_requests").insert({
        requester_email: userEmail,
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

  const renderEditableField = (label: string, field: keyof KYBData, value: string | null) => {
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
    field: keyof KYBData,
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
            <span className="text-sm">{kybData?.industry || "N/A"}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                startEditing("industry", kybData?.industry || "");
                setSelectedIndustry((kybData?.industry as Industry) || "");
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
    const currentIndustry = selectedIndustry || (kybData?.industry as Industry);
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
            <span className="text-sm">{kybData?.sub_industry || "N/A"}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => startEditing("sub_industry", kybData?.sub_industry || "")}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!kybData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">SnapAML</h1>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
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
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
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
                      {renderReadOnlyField("Company Name", kybData.company_name)}
                      {renderEditableField("Trading Name", "trading_name", kybData.trading_name)}
                      {renderReadOnlyField("Registration Number", kybData.company_registration_number)}
                      {renderReadOnlyField("Registration Date", kybData.company_registration_date)}
                      {renderReadOnlyField("Entity Type", kybData.entity_type)}
                      {renderEditableField(
                        "Country of Registration",
                        "country_of_registration",
                        kybData.country_of_registration,
                      )}
                      {renderEditableField(
                        "Website/Business Channel",
                        "website_or_business_channel",
                        kybData.website_or_business_channel,
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
                      {renderSelectField("Goods or Services", "goods_or_services", kybData.goods_or_services, [
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
                        kybData.incoming_payments_monthly_euro,
                      )}
                      {renderEditableField(
                        "Incoming Payment Countries",
                        "incoming_payment_countries",
                        kybData.incoming_payment_countries,
                      )}
                      {renderEditableField(
                        "Incoming Transaction Amount",
                        "incoming_transaction_amount",
                        kybData.incoming_transaction_amount,
                      )}
                      {renderEditableField(
                        "Outgoing Payments Monthly (EUR)",
                        "outgoing_payments_monthly_euro",
                        kybData.outgoing_payments_monthly_euro,
                      )}
                      {renderEditableField(
                        "Outgoing Payment Countries",
                        "outgoing_payment_countries",
                        kybData.outgoing_payment_countries,
                      )}
                      {renderEditableField(
                        "Outgoing Transaction Amount",
                        "outgoing_transaction_amount",
                        kybData.outgoing_transaction_amount,
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Step 4: Applicant Details */}
                <AccordionItem value="step4">
                  <AccordionTrigger>Applicant Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      {renderEditableField("First Name", "applicant_first_name", kybData.applicant_first_name)}
                      {renderEditableField("Last Name", "applicant_last_name", kybData.applicant_last_name)}
                      {renderEditableField("Email", "applicant_email", kybData.applicant_email)}
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
                        {requests.map((request) => (
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
                            <Button onClick={() => handleApproveRequest(request.id)}>Approve</Button>
                          </div>
                        ))}
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
