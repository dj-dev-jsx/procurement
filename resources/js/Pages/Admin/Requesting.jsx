import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users2, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage({ divisions }) {
  const { props } = usePage();
  const success = props.flash?.success;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (success) setOpen(true);
  }, [success]);

  // Fallback sample data (for demo)
  const sampleDivisions = [
    { id: 1, division: "Elementary Division", active_officer: { name: "Juan Dela Cruz" } },
    { id: 2, division: "Secondary Division", active_officer: { name: "Maria Santos" } },
  ];
  const sampleInspection = [
    { id: 1, name: "Engr. Pedro Cruz", role: "Chairman" },
    { id: 2, name: "Ana Reyes", role: "Member" },
  ];
  const sampleBac = [
    { id: 1, name: "Jose Dizon", role: "BAC Chairman" },
    { id: 2, name: "Carla Lopez", role: "BAC Member" },
  ];

  const displayDivisions = divisions && divisions.length > 0 ? divisions : sampleDivisions;

  return (
    <AdminLayout header="⚙️ System Settings">
      <Head title="Settings" />

      <div className="max-w-6xl mx-auto mt-6 space-y-12">
        <header>
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <p className="text-gray-600">
            Manage configurations for divisions, inspection team, and committees.
          </p>
        </header>

        {/* Divisions */}
        <section>
          <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5" />
            Divisions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayDivisions.map((division) => (
              <Card key={division.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-blue-600">{division.division}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">Current Officer</p>
                  <p className="font-medium text-gray-900">
                    {division.active_officer ? division.active_officer.name : "No active officer"}
                  </p>
                  <Link
                    href={route("admin.edit_requesting", division.id)}
                    className="mt-4 inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Update Officer
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Inspection Team */}
        <section>
          <h2 className="text-xl font-semibold text-green-700 flex items-center gap-2 mb-4">
            <Users2 className="w-5 h-5" />
            Inspection Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleInspection.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-green-600">{member.role}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <Button variant="outline" className="mt-4 w-full">
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* BAC Committee */}
        <section>
          <h2 className="text-xl font-semibold text-purple-700 flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5" />
            BAC Committee
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleBac.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-purple-600">{member.role}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <Button variant="outline" className="mt-4 w-full">
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Success Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Success</DialogTitle>
            <DialogDescription>{success}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
