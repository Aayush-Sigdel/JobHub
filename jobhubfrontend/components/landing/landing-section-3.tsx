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
    <section className="w-full bg-muted py-24 px-6 flex flex-col items-center text-center">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-12">
          Aggregated Opportunities
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
          {companyList.map((company, index) => (
            <div
              key={index}
              className="bg-card rounded-xl border border-border hover:border-primary/50 flex items-center justify-center py-5 px-3 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer"
            >
              <span className="font-semibold text-muted-foreground text-sm md:text-base truncate">
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
