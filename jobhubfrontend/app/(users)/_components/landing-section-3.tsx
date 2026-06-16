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
    <section className="w-full bg-[#F5F5F3] py-24 px-6 flex flex-col items-center text-center">
      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black mb-4">
        Find your perfect match
      </h2>
      <p className="text-gray-700 font-medium mb-12 max-w-xl text-sm md:text-base">
        JobHub connects you with top employers across industries. Whether you're
        looking for a startup vibe or a corporate giant, we've got you covered
        with personalized job recommendations that match your unique profile.
      </p>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto w-full">
        {companyList.map((company, index) => (
          <div
            key={index}
            className="bg-white flex items-center justify-center p-6 shadow-sm border border-gray-100 aspect-square hover:scale-105 transition-transform cursor-pointer"
          >
            <span className="font-bold text-black text-sm md:text-base">
              {company}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandingSectionThree;
