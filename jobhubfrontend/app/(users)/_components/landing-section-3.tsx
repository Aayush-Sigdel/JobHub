const LandingSectionThree = () => {
  const companyList = [
    "Esewa",
    "Khalti",
    "Pathao",
    "InDrive",
    "SastoDeal",
    "Foodmandu",
    "Daraz",
    "HamroBazaar",
    "MeroJob",
    "NagarikApp",
    "EcommerceNepal",
    "NepBay",
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Apple",
    "Netflix",
  ];

  return (
    <section className="w-full bg-slate-50 py-24 px-6 flex flex-col items-center text-center">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-12">
          Aggregated Opportunities
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
          {companyList.map((company, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-100 flex items-center justify-center py-5 px-3 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer"
            >
              <span className="font-semibold text-slate-700 text-sm md:text-base truncate">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingSectionThree;
