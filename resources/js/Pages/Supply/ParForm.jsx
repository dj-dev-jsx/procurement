import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";
import { Head } from "@inertiajs/react";

export default function ParForm(){
    return(
        <SupplyOfficerLayout header={"Schools Divisions Office - Ilagan | Property Acknowledgement Receipt"}>
            <Head title="PAR Form"/>
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="inline-flex items-center px-4 py-2 bg-white text-blue-800 border border-blue-300 text-sm font-semibold rounded-md hover:bg-blue-100 hover:border-blue-400 mr-4 mb-4 shadow-sm transition"
                >
                    ← Back
                </button>
        </SupplyOfficerLayout>
    )
}