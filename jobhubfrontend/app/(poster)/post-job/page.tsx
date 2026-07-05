"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Lightbulb, PlayCircle, Code, Trash2, UploadCloud, Check, Briefcase, MapPin, DollarSign, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

export default function PostJobPage() {
  const [step, setStep] = useState(1);
  const [assignments, setAssignments] = useState<{id: number, title: string, language: string}[]>([]);
  
  // Form State for Preview
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  const steps = [
    { id: 1, name: "Overview" },
    { id: 2, name: "Compensation" },
    { id: 3, name: "Description" },
    { id: 4, name: "Assessments" },
    { id: 5, name: "Gallery" },
    { id: 6, name: "Publish" },
  ];

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const addAssignment = () => {
    setAssignments([...assignments, { id: Date.now(), title: "New Algorithm Challenge", language: "javascript" }]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] -mx-4 md:-mx-8 -mt-6">
      {/* STEPS NAV BAR (EXACT FIVERR MATCH) */}
      <div className="bg-white border-b border-[#e4e5e7] sticky top-20 z-40 px-4 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {steps.map((s, i) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div 
                key={s.id} 
                className={`flex items-center whitespace-nowrap cursor-pointer transition-colors ${isActive || isCompleted ? '' : 'opacity-60'}`}
                onClick={() => setStep(s.id)}
              >
                <div className="flex items-center gap-2 px-2">
                  <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                    isActive || isCompleted ? 'bg-[#1dbf73] text-white' : 'bg-[#e4e5e7] text-[#74767e]'
                  }`}>
                    {isCompleted ? <Check className="h-3 w-3" /> : s.id}
                  </span>
                  <span className={`text-sm font-semibold ${isActive || isCompleted ? 'text-[#404145]' : 'text-[#74767e]'}`}>
                    {s.name}
                  </span>
                </div>
                {i < steps.length - 1 && <ChevronRight className="h-4 w-4 mx-2 text-[#b5b6ba]" />}
              </div>
            );
          })}
        </div>
        <Button variant="outline" className="hidden sm:flex font-bold rounded px-4 h-9 border-[#b5b6ba] text-[#404145] hover:bg-[#f5f5f5]">Save</Button>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-4 py-10 flex flex-col lg:flex-row gap-10 items-start">
        
        {/* MAIN FORM AREA */}
        <div className="flex-1 w-full flex flex-col">
          
          {/* PROMO BANNER (ONLY ON STEP 1) */}
          {step === 1 && (
            <div className="bg-[#fcf1f3] border border-[#f5d0d8] p-6 flex items-start justify-between relative overflow-hidden mb-6">
              <div className="relative z-10 w-2/3">
                <h2 className="text-xl font-bold text-[#404145] mb-2">Want to know what potential candidates are looking for?</h2>
                <p className="text-[#404145] text-sm mb-4">Join JobHub Plus for exclusive access to market research tools, insights, and analytics to create listings that get noticed.</p>
                <Link href="#" className="text-sm font-bold text-[#404145] underline decoration-[#404145] hover:text-black">Tell me more &rarr;</Link>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/3 flex items-center justify-end pr-8">
                <span className="bg-[#ff627e] text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm mr-4 mb-10">Plus</span>
                <div className="h-20 w-32 bg-white rounded shadow-sm flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative overflow-hidden">
                   <div className="h-10 w-10 rounded-full border-[5px] border-[#1dbf73] border-t-[#222325]"></div>
                </div>
              </div>
            </div>
          )}

          {/* FORM CONTAINER (WHITE BOX WITH BORDERS) */}
          <div className="bg-white border border-[#e4e5e7] shadow-[0_1px_4px_rgba(0,0,0,0.02)] relative">
            
            {/* STEP 1: OVERVIEW */}
            {step === 1 && (
              <div className="divide-y divide-[#e4e5e7]">
                
                {/* Job Title Row */}
                <div className="flex flex-col md:flex-row gap-8 p-8 md:p-10">
                  <div className="w-full md:w-1/3 shrink-0">
                    <h3 className="font-bold text-[17px] text-[#404145] mb-2">Job title</h3>
                    <p className="text-sm text-[#74767e] leading-relaxed">
                      As your storefront, your <strong className="text-[#404145]">title is the most important place</strong> to include keywords that candidates would likely use to search for a role like yours.
                    </p>
                  </div>
                  <div className="w-full md:w-2/3 relative">
                    <textarea 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-[120px] p-4 text-[22px] text-[#404145] font-semibold border border-[#b5b6ba] rounded-sm focus:border-[#404145] focus:ring-1 focus:ring-[#404145] outline-none resize-none placeholder:text-[#b5b6ba]"
                      placeholder="We are looking for a highly skilled..."
                    ></textarea>
                    <div className="absolute bottom-4 right-4 text-xs font-bold text-[#b5b6ba]">
                      {title.length} / 80 max
                    </div>
                  </div>
                </div>

                {/* Category Row */}
                <div className="flex flex-col md:flex-row gap-8 p-8 md:p-10">
                  <div className="w-full md:w-1/3 shrink-0">
                    <h3 className="font-bold text-[17px] text-[#404145] mb-2">Category</h3>
                    <p className="text-sm text-[#74767e] leading-relaxed">Choose the category and sub-category most suitable for your job.</p>
                  </div>
                  <div className="w-full md:w-2/3 flex gap-4">
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex-1 h-12 border border-[#b5b6ba] rounded-sm bg-white px-4 text-sm font-semibold text-[#404145] focus:border-[#404145] focus:ring-1 focus:ring-[#404145] outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>SELECT A CATEGORY</option>
                      <option value="Programming & Tech">Programming & Tech</option>
                      <option value="Design & Creative">Design & Creative</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                    </select>
                    <select 
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="flex-1 h-12 border border-[#b5b6ba] rounded-sm bg-white px-4 text-sm font-semibold text-[#404145] focus:border-[#404145] focus:ring-1 focus:ring-[#404145] outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>EMPLOYMENT TYPE</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                </div>

                {/* Search tags Row */}
                <div className="flex flex-col md:flex-row gap-8 p-8 md:p-10">
                  <div className="w-full md:w-1/3 shrink-0">
                    <h3 className="font-bold text-[17px] text-[#404145] mb-2">Search tags</h3>
                    <p className="text-sm text-[#74767e] leading-relaxed">Tag your job with buzz words that are relevant to the skills required. Use all 5 tags to get found.</p>
                  </div>
                  <div className="w-full md:w-2/3">
                    <h4 className="font-bold text-sm text-[#404145] mb-2">Positive keywords</h4>
                    <p className="text-sm text-[#74767e] mb-4">Enter search terms you feel your candidates will use when looking for a role.</p>
                    <input 
                      type="text"
                      className="w-full h-12 px-4 border border-[#b5b6ba] rounded-sm text-sm focus:border-[#404145] focus:ring-1 focus:ring-[#404145] outline-none placeholder:text-[#b5b6ba]"
                    />
                    <p className="text-xs text-[#b5b6ba] font-medium mt-3">5 tags maximum. Use letters and numbers only.</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: COMPENSATION */}
            {step === 2 && (
              <div className="divide-y divide-[#e4e5e7]">
                <div className="flex flex-col md:flex-row gap-8 p-8 md:p-10">
                  <div className="w-full md:w-1/3 shrink-0">
                    <h3 className="font-bold text-[17px] text-[#404145] mb-2">Base Salary</h3>
                    <p className="text-sm text-[#74767e] leading-relaxed">Name your price. Clear compensation helps candidates understand expectations.</p>
                  </div>
                  <div className="w-full md:w-2/3 flex items-center gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-3 text-[#74767e] font-bold">$</span>
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={minSalary}
                        onChange={(e) => setMinSalary(e.target.value)}
                        className="w-full h-12 pl-8 pr-4 border border-[#b5b6ba] rounded-sm font-bold text-[#404145] focus:border-[#404145] outline-none" 
                      />
                    </div>
                    <span className="text-[#b5b6ba] font-bold text-sm">TO</span>
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-3 text-[#74767e] font-bold">$</span>
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={maxSalary}
                        onChange={(e) => setMaxSalary(e.target.value)}
                        className="w-full h-12 pl-8 pr-4 border border-[#b5b6ba] rounded-sm font-bold text-[#404145] focus:border-[#404145] outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: DESCRIPTION */}
            {step === 3 && (
              <div className="divide-y divide-[#e4e5e7]">
                <div className="flex flex-col md:flex-row gap-8 p-8 md:p-10">
                  <div className="w-full md:w-1/3 shrink-0">
                    <h3 className="font-bold text-[17px] text-[#404145] mb-2">Description</h3>
                    <p className="text-sm text-[#74767e] leading-relaxed">Briefly Describe Your Role. Focus on impact, responsibilities, and specific qualifications needed.</p>
                  </div>
                  <div className="w-full md:w-2/3">
                    <div className="border border-[#b5b6ba] rounded-sm min-h-[300px] focus-within:border-[#404145] focus-within:ring-1 focus-within:ring-[#404145] bg-[#fafafa]">
                      <Editor id="fiverr-description" placeholder="Start typing your description here..." />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: ASSESSMENTS */}
            {step === 4 && (
              <div className="divide-y divide-[#e4e5e7]">
                <div className="flex flex-col md:flex-row gap-8 p-8 md:p-10">
                  <div className="w-full md:w-1/3 shrink-0">
                    <h3 className="font-bold text-[17px] text-[#404145] mb-2">Live-Code Sandboxes</h3>
                    <p className="text-sm text-[#74767e] leading-relaxed">Require candidates to pass a coding assessment before they can apply.</p>
                    <Button onClick={addAssignment} className="mt-4 bg-white border border-[#404145] text-[#404145] font-bold h-10 px-6 rounded-sm hover:bg-[#f5f5f5]">
                      + Add Assessment
                    </Button>
                  </div>
                  <div className="w-full md:w-2/3 space-y-4">
                    {assignments.length === 0 ? (
                      <div className="h-[200px] border border-[#e4e5e7] bg-[#fafafa] flex items-center justify-center text-[#b5b6ba] font-bold text-sm">
                        No assessments added yet.
                      </div>
                    ) : (
                      assignments.map((assignment, index) => (
                        <div key={assignment.id} className="border border-[#e4e5e7] p-6 bg-[#fafafa] flex flex-col gap-4 relative group">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 text-[#b5b6ba] hover:text-[#ff627e] opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setAssignments(assignments.filter(a => a.id !== assignment.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="font-bold text-[#74767e]">Assessment #{index + 1}</div>
                          <input type="text" defaultValue={assignment.title} className="w-full h-12 px-4 border border-[#b5b6ba] rounded-sm font-bold text-[#404145] focus:border-[#404145] outline-none" />
                          <div className="flex gap-4">
                            <select className="flex-1 h-12 border border-[#b5b6ba] rounded-sm bg-white px-4 text-sm font-semibold text-[#404145] outline-none">
                              <option value="javascript">JavaScript (Node.js)</option>
                              <option value="python">Python 3</option>
                            </select>
                            <select className="flex-1 h-12 border border-[#b5b6ba] rounded-sm bg-white px-4 text-sm font-semibold text-[#404145] outline-none">
                              <option value="15">15 Minutes</option>
                              <option value="30">30 Minutes</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: GALLERY */}
            {step === 5 && (
              <div className="divide-y divide-[#e4e5e7]">
                <div className="flex flex-col md:flex-row gap-8 p-8 md:p-10">
                  <div className="w-full md:w-1/3 shrink-0">
                    <h3 className="font-bold text-[17px] text-[#404145] mb-2">Showcase Your Company</h3>
                    <p className="text-sm text-[#74767e] leading-relaxed">Encourage candidates to choose you by adding team photos or a custom banner.</p>
                  </div>
                  <div className="w-full md:w-2/3">
                    <div className="border border-[#b5b6ba] rounded-sm h-[250px] bg-[#fafafa] flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors">
                      <div className="h-16 w-16 bg-[#eaf5fc] text-[#4a73e8] flex items-center justify-center rounded-full mb-4">
                        <UploadCloud className="h-8 w-8" />
                      </div>
                      <p className="font-bold text-[#404145]">Browse</p>
                      <p className="text-sm text-[#b5b6ba] mt-1">or Drag & Drop</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: PUBLISH PREVIEW */}
            {step === 6 && (
              <div className="p-8 md:p-12">
                <div className="flex flex-col items-center text-center mb-10">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1dbf73]/10 text-[#1dbf73] mb-4">
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#404145] mb-2">Almost there!</h2>
                  <p className="text-[#74767e]">Review your listing preview before publishing it to the candidate network.</p>
                </div>

                <div className="max-w-2xl mx-auto border border-[#e4e5e7] rounded shadow-sm bg-white overflow-hidden">
                  <div className="h-2 bg-[#1dbf73]"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#404145] mb-2">
                          {title || "Untitled Job Listing"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#74767e] font-medium">
                          {category && (
                            <span className="flex items-center gap-1 bg-[#f5f5f5] px-2 py-1 rounded">
                              <Briefcase className="h-4 w-4 text-[#1dbf73]" /> {category}
                            </span>
                          )}
                          {employmentType && (
                            <span className="flex items-center gap-1 bg-[#f5f5f5] px-2 py-1 rounded">
                              <Clock className="h-4 w-4 text-[#1dbf73]" /> {employmentType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 mb-6 pb-6 border-b border-[#e4e5e7]">
                      <h4 className="font-bold text-[#404145] mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-[#b5b6ba]" /> Compensation
                      </h4>
                      <p className="text-[#404145] font-semibold">
                        {minSalary && maxSalary 
                          ? `$${Number(minSalary).toLocaleString()} - $${Number(maxSalary).toLocaleString()} per year` 
                          : "Competitive Salary (Not specified)"}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-bold text-[#404145] mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4 text-[#b5b6ba]" /> Technical Assessments Required
                      </h4>
                      {assignments.length > 0 ? (
                        <div className="space-y-2">
                          {assignments.map((a, i) => (
                            <div key={a.id} className="text-sm text-[#404145] bg-[#eaf5fc] px-3 py-2 rounded border border-[#4a73e8]/20 flex items-center justify-between">
                              <span className="font-semibold">{i + 1}. {a.title}</span>
                              <span className="text-xs font-bold text-[#4a73e8] uppercase bg-white px-2 py-0.5 rounded border border-[#4a73e8]/20">{a.language}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#74767e] italic">No coding assessments required.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-10">
                  <Button className="bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold h-12 px-12 text-lg rounded">
                    Publish Listing Now
                  </Button>
                </div>
              </div>
            )}

          </div>
          
          {/* BOTTOM RIGHT ACTIONS */}
          {step < 6 && (
            <div className="flex justify-end mt-6">
              <Button 
                className="bg-[#222325] hover:bg-[#404145] text-white font-bold h-12 px-8 text-base rounded-[4px]"
                onClick={nextStep}
              >
                Save & Continue
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR - CONTEXTUAL HELPER (EXACT FIVERR MATCH) */}
        <div className="hidden lg:block w-[300px] shrink-0 sticky top-40">
          <div className="bg-[#eaf5fc] rounded-t p-6 flex flex-col items-center relative">
            <div className="absolute -top-4 bg-[#4a73e8] text-white p-2 rounded-full shadow-sm">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg mt-4 text-[#404145]">Start Defining Your Job</h3>
          </div>
          <div className="bg-white border border-[#eaf5fc] border-t-0 rounded-b p-6 shadow-sm">
            <div className="aspect-video bg-[#333] mb-6 flex items-center justify-center relative group cursor-pointer">
              <PlayCircle className="h-12 w-12 text-white opacity-80" />
            </div>
            
            <ul className="space-y-4 text-[13px] text-[#404145] leading-relaxed">
              {step === 1 && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#404145] mt-1.5 shrink-0"></span>
                    Create a catchy title.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#404145] mt-1.5 shrink-0"></span>
                    Choose a category that fits your role.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#404145] mt-1.5 shrink-0"></span>
                    Add tags to help candidates find your job while searching.
                  </li>
                </>
              )}
              {step === 3 && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#404145] mt-1.5 shrink-0"></span>
                    Make your description engaging and format it well.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#404145] mt-1.5 shrink-0"></span>
                    Include all necessary skills and requirements.
                  </li>
                </>
              )}
              {step === 4 && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#404145] mt-1.5 shrink-0"></span>
                    Assessments are automatically graded.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#404145] mt-1.5 shrink-0"></span>
                    Candidates cannot skip assessments if you make them mandatory.
                  </li>
                </>
              )}
              {[2, 5, 6].includes(step) && (
                <li className="flex items-start gap-2 text-center text-[#74767e]">
                  Follow best practices for this step to attract the best talent.
                </li>
              )}
            </ul>
            
            <div className="mt-6 pt-4 border-t border-[#e4e5e7] flex items-center gap-2 text-[#4a73e8] text-sm font-bold cursor-pointer">
              <PlayCircle className="h-4 w-4" />
              General Job Policy
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
