import RequesterLayout from "@/Layouts/RequesterLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard(){
    return(
        <RequesterLayout
            header={
                'Schools Division Office - Ilagan | Dashboard'
            }
        >
            <Head title="Dashboard"/>
        </RequesterLayout>
    )
}