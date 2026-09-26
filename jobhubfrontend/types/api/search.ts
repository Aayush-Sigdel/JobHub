export interface ListingSearchItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}
export interface ListingSearchGroup {
  items: ListingSearchItem[];
  total: number;
  error?: string;
}
export interface ListingSearchResults {
  jobs: ListingSearchGroup;
  projects: ListingSearchGroup;
}
