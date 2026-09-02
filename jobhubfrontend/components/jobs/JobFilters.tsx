'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
type WorkplaceType = 'REMOTE' | 'HYBRID' | 'ON_SITE';
type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: any) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === false || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => router.push(pathname);

  const activeJobType = searchParams.get('jobType');
  const activeWorkplace = searchParams.get('workplaceType');
  const activeExperience = searchParams.get('experienceLevel');
  const activeSemantic = searchParams.get('semanticSearch') === 'true';
  const activeHasTasks = searchParams.get('hasTasks') === 'true';
  const activeSalary = searchParams.get('salaryMin') || '';
  const activeSort = searchParams.get('sortBy') || 'date';

  return (
    <Card className="sticky top-20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-bold">Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">Clear All</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
          <Label htmlFor="semantic-search" className="flex flex-col space-y-1">
            <span className="font-semibold text-primary">Smart Match</span>
            <span className="font-normal text-xs text-muted-foreground">Match using your profile</span>
          </Label>
          <Switch id="semantic-search" checked={activeSemantic} onCheckedChange={(checked) => handleFilterChange('semanticSearch', checked)} />
        </div>
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
          <Label htmlFor="assessment-filter" className="flex flex-col space-y-1">
            <span className="font-semibold">Assessment required</span>
            <span className="font-normal text-xs text-muted-foreground">Show roles with an evaluation task</span>
          </Label>
          <Switch id="assessment-filter" checked={activeHasTasks} onCheckedChange={(checked) => handleFilterChange('hasTasks', checked)} />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Job Type</h3>
          {(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as JobType[]).map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox id={`job-type-${type}`} checked={activeJobType === type} onCheckedChange={(checked) => handleFilterChange('jobType', checked ? type : undefined)} />
              <Label htmlFor={`job-type-${type}`} className="text-sm font-normal">{type.replace('_', ' ')}</Label>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Workplace</h3>
          {(['REMOTE', 'HYBRID', 'ON_SITE'] as WorkplaceType[]).map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox id={`workplace-${type}`} checked={activeWorkplace === type} onCheckedChange={(checked) => handleFilterChange('workplaceType', checked ? type : undefined)} />
              <Label htmlFor={`workplace-${type}`} className="text-sm font-normal">{type.replace('_', ' ')}</Label>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Experience</h3>
          {(['BEGINNER', 'INTERMEDIATE', 'EXPERT'] as ExperienceLevel[]).map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox id={`experience-${type}`} checked={activeExperience === type} onCheckedChange={(checked) => handleFilterChange('experienceLevel', checked ? type : undefined)} />
              <Label htmlFor={`experience-${type}`} className="text-sm font-normal">{type.charAt(0) + type.slice(1).toLowerCase()}</Label>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimum-salary" className="text-sm font-semibold">Minimum salary</Label>
          <Input id="minimum-salary" type="number" min="0" value={activeSalary} onChange={(event) => handleFilterChange('salaryMin', event.target.value)} placeholder="Any salary" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-sort" className="text-sm font-semibold">Sort by</Label>
          <select id="job-sort" value={activeSort} onChange={(event) => handleFilterChange('sortBy', event.target.value)} className="h-8 w-full rounded-md border bg-background px-2 text-sm">
            <option value="date">Newest</option>
            <option value="similarity">Best profile match</option>
            <option value="salary">Highest salary</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
