"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "../ui/search";
import { Field } from "../ui/field";
import { Button } from "../ui/button";
import { useState } from "react";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <Field className="gap-0 " orientation="horizontal">
      <InputGroup className="max-w-xl py-5 rounded-r-none">
        <InputGroupInput
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <InputGroupAddon align="inline-start">
          <SearchIcon size={20} />
        </InputGroupAddon>
        {searchQuery && (
          <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
        )}
      </InputGroup>
      <Button
        variant="outline"
        size={"icon-lg"}
        className="rounded-l-none py-5"
      >
        <SearchIcon />
      </Button>
    </Field>
  );
}
