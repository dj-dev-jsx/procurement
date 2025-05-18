import ApproverLayout from "@/Layouts/ApproverLayout";
import RequesterLayout from "@/Layouts/RequesterLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard(){
    return(
        <ApproverLayout
            header={
                'Schools Division Office - Ilagan | Dashboard'
            }
        >
            <Head title="Dashboard"/>
        </ApproverLayout>
    )
}