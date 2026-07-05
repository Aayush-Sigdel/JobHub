"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MoreHorizontal, LayoutGrid, List as ListIcon, KanbanSquare, Calendar as CalendarIcon, BarChartHorizontal, Download, Users, Briefcase, MapPin, Clock, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "lucide-react";

// react-big-calendar imports
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const candidatesData = [
  { id: 1, name: "Alice Smith", role: "Frontend Developer", experience: "5 years", match: 94, status: "New", applied: "2d ago", initials: "AS", start: 5, duration: 2, interviewDate: new Date(2026, 6, 12, 10, 0), interviewEnd: new Date(2026, 6, 12, 11, 0) },
  { id: 2, name: "Bob Johnson", role: "Product Designer", experience: "3 years", match: 88, status: "Shortlisted", applied: "4d ago", initials: "BJ", start: 2, duration: 5, interviewDate: new Date(2026, 6, 15, 14, 0), interviewEnd: new Date(2026, 6, 15, 15, 0) },
  { id: 3, name: "Charlie Brown", role: "Backend Engineer", experience: "7 years", match: 91, status: "Interviewing", applied: "1w ago", initials: "CB", start: 1, duration: 14, interviewDate: new Date(2026, 6, 18, 9, 30), interviewEnd: new Date(2026, 6, 18, 10, 30) },
  { id: 4, name: "Diana Prince", role: "Marketing Manager", experience: "6 years", match: 85, status: "New", applied: "2w ago", initials: "DP", start: 10, duration: 1, interviewDate: new Date(2026, 6, 20, 13, 0), interviewEnd: new Date(2026, 6, 20, 14, 0) },
  { id: 5, name: "Evan Wright", role: "Frontend Developer", experience: "2 years", match: 72, status: "Rejected", applied: "3w ago", initials: "EW", start: 15, duration: 1, interviewDate: new Date(2026, 6, 5, 10, 0), interviewEnd: new Date(2026, 6, 5, 11, 0) },
  { id: 6, name: "Fiona Gallagher", role: "UX Researcher", experience: "4 years", match: 89, status: "Shortlisted", applied: "1mo ago", initials: "FG", start: 8, duration: 7, interviewDate: new Date(2026, 6, 25, 15, 0), interviewEnd: new Date(2026, 6, 25, 16, 30) },
];

const statuses = [
  { id: "New", color: "bg-[#4a73e8]" },
  { id: "Shortlisted", color: "bg-[#1dbf73]" },
  { id: "Interviewing", color: "bg-[#f5a623]" },
  { id: "Rejected", color: "bg-destructive" }
];

export default function CandidatesPage() {
  const [search, setSearch] = useState("");

  const filteredCandidates = candidatesData.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()));
  const getCandidatesByStatus = (status: string) => filteredCandidates.filter(c => c.status === status);

  const getMatchColor = (match: number) => {
    if (match >= 90) return "bg-[#1dbf73]/10 text-[#1dbf73] border-[#1dbf73]/20";
    if (match >= 80) return "bg-[#4a73e8]/10 text-[#4a73e8] border-[#4a73e8]/20";
    return "bg-[#fafafa] text-[#74767e] border-[#e4e5e7]";
  };

  const calendarEvents = filteredCandidates.map(c => ({
    title: `Interview: ${c.name} (${c.role})`,
    start: c.interviewDate,
    end: c.interviewEnd,
    status: c.status
  }));

  const CustomEvent = ({ event }: any) => {
    const isInterviewing = event.status === 'Interviewing';
    return (
      <div className={`p-1 h-full rounded text-xs font-bold border-l-4 truncate ${isInterviewing ? 'bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]' : 'bg-[#eaf5fc] text-[#4a73e8] border-[#4a73e8]'}`}>
        {event.title}
      </div>
    );
  };

  // --- LIST VIEW COMPONENT ---
  const renderList = () => (
    <div className="bg-white border border-[#e4e5e7] rounded shadow-[0_1px_4px_rgba(0,0,0,0.02)] overflow-hidden flex-1 flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-[13px] text-left">
          <thead className="text-[11px] uppercase bg-[#fafafa] text-[#74767e] border-b border-[#e4e5e7] sticky top-0 z-10 font-bold">
            <tr>
              <th className="px-6 py-4 tracking-wider">Candidate</th>
              <th className="px-6 py-4 tracking-wider">Experience</th>
              <th className="px-6 py-4 tracking-wider text-center">Match</th>
              <th className="px-6 py-4 tracking-wider">Status</th>
              <th className="px-6 py-4 tracking-wider">Applied</th>
              <th className="px-6 py-4 tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e5e7]">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-[#fafafa] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-[#e4e5e7]">
                      <AvatarFallback className="bg-[#1dbf73]/10 text-[#1dbf73] font-bold text-xs">
                        {candidate.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-[15px] text-[#404145] group-hover:text-[#1dbf73] transition-colors cursor-pointer">{candidate.name}</div>
                      <div className="text-[#b5b6ba] text-xs font-bold mt-1">{candidate.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-[#404145]">{candidate.experience}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-bold border ${getMatchColor(candidate.match)}`}>
                    {candidate.match}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${statuses.find(s => s.id === candidate.status)?.color}`}></span>
                    <span className="font-bold text-[#404145] text-[13px]">{candidate.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#74767e] font-medium">{candidate.applied}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#b5b6ba] hover:text-[#1dbf73] hover:bg-[#1dbf73]/10 rounded-full">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#b5b6ba] hover:text-destructive hover:bg-destructive/10 rounded-full">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 ml-2 font-semibold border-[#b5b6ba] text-[#404145] hover:bg-[#fafafa]">
                      Profile
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCandidates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#74767e] font-medium">
                  No candidates found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[#e4e5e7] p-4 bg-[#fafafa] flex items-center justify-between text-xs font-bold text-[#74767e]">
        <span>Showing {filteredCandidates.length} candidates</span>
        <div className="flex items-center gap-4">
          <button className="hover:text-[#404145] transition-colors cursor-pointer">Previous</button>
          <button className="hover:text-[#404145] transition-colors cursor-pointer">Next</button>
        </div>
      </div>
    </div>
  );

  // --- KANBAN VIEW COMPONENT ---
  const renderKanban = () => (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full custom-scrollbar items-start">
      {statuses.map(status => {
        const statusCandidates = getCandidatesByStatus(status.id);
        return (
          <div key={status.id} className="flex-shrink-0 w-[320px] flex flex-col h-full bg-[#fdfdfd] border border-[#e4e5e7] rounded-md overflow-hidden">
            <div className="bg-[#fafafa] border-b border-[#e4e5e7] p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${status.color}`}></span>
                <h3 className="font-bold text-[14px] text-[#404145] uppercase tracking-wide">{status.id}</h3>
                <span className="bg-white border border-[#e4e5e7] text-[#74767e] text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                  {statusCandidates.length}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {statusCandidates.length > 0 ? (
                statusCandidates.map(candidate => (
                  <div key={candidate.id} className="bg-white border border-[#e4e5e7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-[#1dbf73] rounded p-4 mb-3 transition-all group cursor-grab">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-[#e4e5e7]">
                          <AvatarFallback className="bg-[#1dbf73]/10 text-[#1dbf73] font-bold text-[10px]">
                            {candidate.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-[14px] text-[#404145] leading-tight mb-0.5 group-hover:text-[#1dbf73] transition-colors">{candidate.name}</h3>
                          <p className="text-[11px] font-bold text-[#b5b6ba]">{candidate.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getMatchColor(candidate.match)}`}>
                        {candidate.match}% Match
                      </span>
                      <span className="text-[11px] font-bold text-[#74767e]">{candidate.experience}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-[#e4e5e7] rounded bg-[#fafafa] text-[#b5b6ba]">
                  <p className="text-xs font-bold mb-1">No {status.id} Candidates</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // --- CALENDAR VIEW COMPONENT ---
  const renderCalendar = () => (
    <div className="bg-white border border-[#e4e5e7] rounded shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex-1 flex flex-col overflow-hidden p-6">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', fontFamily: 'inherit' }}
        components={{
          event: CustomEvent
        }}
        defaultDate={new Date(2026, 6, 1)}
        views={['month', 'week', 'day']}
      />
      
      {/* Custom CSS to style react-big-calendar to match our theme */}
      <style dangerouslySetInnerHTML={{__html: `
        .rbc-calendar { font-family: inherit; color: #404145; }
        .rbc-btn-group button { color: #404145; border-color: #b5b6ba; font-weight: 600; font-size: 13px; }
        .rbc-btn-group button:hover, .rbc-btn-group button:focus { background-color: #fafafa; }
        .rbc-btn-group button.rbc-active { background-color: #eaf5fc; color: #4a73e8; border-color: #4a73e8; box-shadow: none; }
        .rbc-toolbar button:active, .rbc-toolbar button.rbc-active:hover, .rbc-toolbar button.rbc-active:focus { background-color: #eaf5fc; box-shadow: none; }
        .rbc-toolbar-label { font-weight: 700; font-size: 1.125rem; }
        .rbc-header { padding: 8px 0; font-weight: 700; font-size: 11px; text-transform: uppercase; color: #74767e; background: #fafafa; border-bottom: 1px solid #e4e5e7; border-left: 1px solid #e4e5e7; }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid #e4e5e7; border-radius: 4px; overflow: hidden; }
        .rbc-month-row, .rbc-day-bg, .rbc-day-slot { border-color: #e4e5e7; }
        .rbc-off-range-bg { background: #fafafa; }
        .rbc-today { background-color: #fcf1f3; }
        .rbc-event { background-color: transparent; padding: 0; border: none; }
      `}} />
    </div>
  );

  // --- GANTT VIEW COMPONENT ---
  const renderGantt = () => {
    const days = Array.from({length: 30}, (_, i) => i + 1);

    return (
      <div className="bg-white border border-[#e4e5e7] rounded shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex-1 flex flex-col overflow-hidden overflow-x-auto relative h-full">
        <div className="flex sticky top-0 z-20 bg-white border-b border-[#e4e5e7]">
          <div className="w-[250px] shrink-0 border-r border-[#e4e5e7] p-4 bg-[#fafafa] flex items-center">
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#74767e]">Candidates</span>
          </div>
          <div className="flex flex-1 min-w-[900px]">
            {days.map(day => (
              <div key={day} className="flex-1 min-w-[30px] border-r border-[#e4e5e7] last:border-0 p-2 text-center">
                <span className="text-[10px] font-bold text-[#b5b6ba]">{day}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredCandidates.map(candidate => {
            return (
              <div key={candidate.id} className="flex border-b border-[#e4e5e7] group hover:bg-[#fafafa]">
                <div className="w-[250px] shrink-0 border-r border-[#e4e5e7] p-3 flex items-center gap-3 bg-white z-10 sticky left-0">
                  <Avatar className="h-7 w-7 border border-[#e4e5e7]">
                    <AvatarFallback className="bg-[#1dbf73]/10 text-[#1dbf73] font-bold text-[9px]">{candidate.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <span className="font-bold text-[13px] text-[#404145] truncate" title={candidate.name}>{candidate.name}</span>
                    <span className="text-[11px] font-semibold text-[#b5b6ba] truncate">{candidate.status}</span>
                  </div>
                </div>
                <div className="flex flex-1 relative min-w-[900px] py-3">
                  <div className="absolute inset-0 flex pointer-events-none">
                    {days.map(day => (
                      <div key={day} className="flex-1 min-w-[30px] border-r border-[#e4e5e7]/50 last:border-0"></div>
                    ))}
                  </div>
                  {candidate.duration > 0 && (
                    <div 
                      className={`absolute h-8 top-3 rounded shadow-sm flex items-center px-2 cursor-pointer transition-transform hover:scale-y-110 ${candidate.status === 'Interviewing' ? 'bg-[#f5a623]' : candidate.status === 'Shortlisted' ? 'bg-[#1dbf73]' : candidate.status === 'Rejected' ? 'bg-destructive' : 'bg-[#4a73e8]'}`}
                      style={{ 
                        left: `calc((100% / 30) * ${candidate.start})`, 
                        width: `calc((100% / 30) * ${candidate.duration})`,
                        minWidth: '4px'
                      }}
                    >
                      <span className="text-[10px] font-bold text-white truncate px-1">Active</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#f7f7f7] -mx-4 md:-mx-8 -mt-6 p-4 md:p-8 animate-in fade-in duration-300">
      
      {/* HEADER & TOOLBAR (FIVERR STYLED) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-[#404145]">Candidates Pipeline</h1>
          <p className="text-[14px] text-[#74767e] mt-1 font-medium">Manage, schedule, and track your applicants.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#b5b6ba]" />
            <Input
              type="search"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[220px] h-10 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] border-[#b5b6ba] focus:border-[#404145] font-semibold text-sm rounded transition-colors placeholder:text-[#b5b6ba]"
            />
          </div>
          <Button variant="outline" className="h-10 bg-white border-[#b5b6ba] shadow-sm font-bold rounded text-[#404145] hover:bg-[#fafafa]">
            <Filter className="h-4 w-4 mr-2 text-[#74767e]" /> Filters
          </Button>
          <Button variant="outline" className="h-10 bg-white border-[#b5b6ba] shadow-sm font-bold rounded text-[#404145] hover:bg-[#fafafa]">
            <Download className="h-4 w-4 mr-2 text-[#74767e]" /> Export
          </Button>
        </div>
      </div>

      {/* SHADCN TABS FOR VIEWS */}
      <Tabs defaultValue="list" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mb-4 bg-white border border-[#e4e5e7] p-1 shadow-sm w-fit h-auto">
          <TabsTrigger value="list" className="data-[state=active]:bg-[#eaf5fc] data-[state=active]:text-[#4a73e8] text-[#74767e] font-bold text-xs h-8 px-3 rounded">
            <ListIcon className="h-3.5 w-3.5 mr-1.5" /> List
          </TabsTrigger>
          <TabsTrigger value="kanban" className="data-[state=active]:bg-[#eaf5fc] data-[state=active]:text-[#4a73e8] text-[#74767e] font-bold text-xs h-8 px-3 rounded">
            <KanbanSquare className="h-3.5 w-3.5 mr-1.5" /> Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-[#eaf5fc] data-[state=active]:text-[#4a73e8] text-[#74767e] font-bold text-xs h-8 px-3 rounded">
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="gantt" className="data-[state=active]:bg-[#eaf5fc] data-[state=active]:text-[#4a73e8] text-[#74767e] font-bold text-xs h-8 px-3 rounded">
            <BarChartHorizontal className="h-3.5 w-3.5 mr-1.5" /> Gantt
          </TabsTrigger>
        </TabsList>

        {/* VIEWS CONTAINER */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="list" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            {renderList()}
          </TabsContent>
          <TabsContent value="kanban" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            {renderKanban()}
          </TabsContent>
          <TabsContent value="calendar" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            {renderCalendar()}
          </TabsContent>
          <TabsContent value="gantt" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            {renderGantt()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
