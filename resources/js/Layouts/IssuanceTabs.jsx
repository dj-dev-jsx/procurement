import NavLink from "@/Components/NavLink";

export default function IssuanceTabs() {
  const tabs = [
    { label: "Requisition and Issue Slips", routeName: "supply_officer.ris_issuance" },
    { label: "Inventory Custodian Slips", routeName: "supply_officer.ics_issuance" },
    { label: "Property Acknowledgement Receipt", routeName: "supply_officer.par_issuance" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mb-6">
      <div className="flex bg-white rounded-lg shadow overflow-hidden border border-gray-300 divide-x divide-gray-300">
        {tabs.map((tab) => {
          const isActive = route().current(tab.routeName);
          return (
            <NavLink
              key={tab.label}
              href={route(tab.routeName)}
              active={isActive}
              className={`flex-1 flex items-center justify-center text-center px-4 py-4 text-sm font-medium uppercase tracking-wide transition duration-200 ${
                isActive
                  ? "bg-blue-600 text-white border-b-4 border-gray-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
