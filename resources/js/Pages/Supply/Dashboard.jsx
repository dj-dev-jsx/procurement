
import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard(){
    return(
        <SupplyOfficerLayout
            header={
                'Schools Division Office - Ilagan | Dashboard'
            }
        >
            <Head title="Dashboard"/>
        </SupplyOfficerLayout>
    )
}